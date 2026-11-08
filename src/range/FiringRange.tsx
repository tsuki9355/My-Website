import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import RangeScene, { type PointerState, type RangeApi, type ShotOutcome } from "./RangeScene";
import { RANGE_TARGETS, type RangeDestination } from "./targets";
import { initialQuality, lowerQuality, QUALITY, type Quality } from "./quality";
import { playHit, playShot, warmUpAudio } from "./sfx";
import "./FiringRange.css";

const SFX_KEY = "range-sfx";

function readSfxSetting() {
  try {
    return localStorage.getItem(SFX_KEY) !== "off";
  } catch {
    return true;
  }
}

function restartClass(el: HTMLElement, className: string, ms: number) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
  window.setTimeout(() => el.classList.remove(className), ms);
}

interface FiringRangeProps {
  onSelect: (id: RangeDestination) => void;
  onSkip: () => void;
}

function FiringRange({ onSelect, onSkip }: FiringRangeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const crosshairRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<RangeApi | null>(null);
  const pointer = useRef<PointerState>({ x: 0, y: 0, inside: false });
  const [stats, setStats] = useState({ shots: 0, hits: 0 });
  const [sfxOn, setSfxOn] = useState(readSfxSetting);
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  const [quality, setQuality] = useState<Quality>(initialQuality);
  const settings = QUALITY[quality];
  const sfxRef = useRef(sfxOn);

  useEffect(() => {
    sfxRef.current = sfxOn;
    try {
      localStorage.setItem(SFX_KEY, sfxOn ? "on" : "off");
    } catch {
      // Storage can be blocked; the toggle still works for this visit.
    }
  }, [sfxOn]);

  const handleOutcome = useCallback((outcome: ShotOutcome | undefined) => {
    if (!outcome || outcome === "locked") return;
    const isHit = outcome !== "miss" && outcome !== "surface";
    if (sfxRef.current) {
      playShot();
      if (isHit) playHit();
    }
    setStats((s) => ({ shots: s.shots + 1, hits: s.hits + (isHit ? 1 : 0) }));
    const crosshair = crosshairRef.current;
    if (crosshair) {
      restartClass(crosshair, "firing", 70);
      if (isHit) restartClass(crosshair, "hit", 320);
    }
  }, []);

  const trackPointer = (e: ReactPointerEvent) => {
    const rect = rootRef.current!.getBoundingClientRect();
    pointer.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
      inside: true,
    };
    const crosshair = crosshairRef.current;
    if (crosshair) {
      crosshair.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const overUi = (e.target as HTMLElement).closest("button, a");
      crosshair.classList.toggle("visible", e.pointerType === "mouse" && !overUi);
    }
  };

  const handlePointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("button, a")) return;
    trackPointer(e);
    handleOutcome(apiRef.current?.fire(pointer.current.x, pointer.current.y));
  };

  const handlePointerLeave = () => {
    pointer.current = { ...pointer.current, inside: false };
    crosshairRef.current?.classList.remove("visible");
  };

  useEffect(() => {
    if (!ready) return;
    const warm = () => {
      if (sfxRef.current) warmUpAudio();
    };
    // Safari has no requestIdleCallback.
    if (typeof window.requestIdleCallback !== "function") {
      const timer = setTimeout(warm, 300);
      return () => clearTimeout(timer);
    }
    const id = window.requestIdleCallback(warm);
    return () => window.cancelIdleCallback(id);
  }, [ready]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = RANGE_TARGETS.find((t) => t.hotkey === e.key);
      if (target) handleOutcome(apiRef.current?.fireAt(target.id));
      else if (e.key.toLowerCase() === "m") setSfxOn((on) => !on);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleOutcome]);

  const handleHoverChange = useCallback((id: RangeDestination | null) => {
    crosshairRef.current?.classList.toggle("locked", id !== null);
  }, []);

  const accuracy = stats.shots ? Math.round((stats.hits / stats.shots) * 100) : 0;

  return (
    <div
      ref={rootRef}
      className="firing-range"
      onPointerMove={trackPointer}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
    >
      <Canvas
        className="range-canvas"
        dpr={[1, settings.maxDpr]}
        gl={{ antialias: false }}
        camera={{ position: [0, 1.7, 7], fov: 55, near: 0.1, far: 220 }}
      >
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setQuality(lowerQuality)}
          onFallback={() => setQuality("low")}
        />
        <Suspense fallback={null}>
          <RangeScene
            apiRef={apiRef}
            pointer={pointer}
            quality={settings}
            onHoverChange={handleHoverChange}
            onTargetDestroyed={onSelect}
            onReady={markReady}
          />
        </Suspense>
      </Canvas>

      <div className="range-hud">
        <div className="hud-frame" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

        <header className="hud-top">
          <div className="hud-id">
            <h1 className="hud-name">Angus Chou</h1>
            <p className="hud-role">Gameplay &amp; Software Engineer // UBC Computer Science</p>
          </div>
          <div className="hud-actions">
            <button
              className="hud-btn"
              onClick={() => setSfxOn((on) => !on)}
              aria-pressed={sfxOn}
              title="Toggle sound effects (M)"
            >
              SFX {sfxOn ? "On" : "Off"}
            </button>
            <button className="hud-btn hud-btn-primary" onClick={onSkip}>
              Skip to site
            </button>
          </div>
        </header>

        <nav className="hud-keyboard-menu" aria-label="Choose a section">
          {RANGE_TARGETS.map((t) => (
            <button key={t.id} className="hud-btn" onClick={() => onSelect(t.id)}>
              [{t.hotkey}] {t.label}
            </button>
          ))}
        </nav>

        {ready ? (
          <p className="hud-prompt">
            <span className="prompt-mouse">Shoot a target to enter</span>
            <span className="prompt-touch">Tap a target to enter</span>
            <span className="prompt-keys">or press 1–4</span>
          </p>
        ) : (
          <p className="hud-loading" role="status">
            Initializing range…
          </p>
        )}

        <dl className="hud-stats" aria-label="Range stats">
          <div>
            <dt>Shots</dt>
            <dd>{String(stats.shots).padStart(2, "0")}</dd>
          </div>
          <div>
            <dt>Hits</dt>
            <dd>{String(stats.hits).padStart(2, "0")}</dd>
          </div>
          <div>
            <dt>Acc</dt>
            <dd>{accuracy}%</dd>
          </div>
        </dl>
      </div>

      <div ref={crosshairRef} className="crosshair" aria-hidden="true">
        <span className="ch-line ch-top" />
        <span className="ch-line ch-right" />
        <span className="ch-line ch-bottom" />
        <span className="ch-line ch-left" />
        <span className="ch-dot" />
        <span className="ch-hit" />
      </div>
    </div>
  );
}

export default FiringRange;
