import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import GameScene, { type GameApi } from "./GameScene";
import { COUNTDOWN_MS, ROUND_MS, accuracyOf, gridshot, useGridshot } from "./gridshotStore";
import { initialQuality, lowerQuality, QUALITY, type Quality } from "../range/quality";
import { playHit, playShot, warmUpAudio } from "../range/sfx";
import "./GameMode.css";

const SENS_KEY = "game-sens";
const SFX_KEY = "range-sfx";

function readSetting(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveSetting(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked; the setting still applies for this visit.
  }
}

function restartClass(el: HTMLElement, className: string, ms: number) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
  window.setTimeout(() => el.classList.remove(className), ms);
}

const CONTROLS: [string, string][] = [
  ["WASD", "Move"],
  ["Mouse", "Aim"],
  ["Click", "Shoot"],
  ["Space", "Jump"],
  ["Shift", "Walk"],
  ["E", "Use console"],
  ["Esc", "Pause"],
];

interface GameModeProps {
  onExit: () => void;
}

function GameMode({ onExit }: GameModeProps) {
  const [touchOnly] = useState(
    () => matchMedia("(pointer: coarse)").matches && !matchMedia("(any-pointer: fine)").matches,
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const crosshairRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLSpanElement>(null);
  const countdownRef = useRef<HTMLSpanElement>(null);
  const apiRef = useRef<GameApi | null>(null);
  const activeRef = useRef(false);

  const [locked, setLocked] = useState(false);
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  const [quality, setQuality] = useState<Quality>(initialQuality);
  const [sensitivity, setSensitivity] = useState(() => Number(readSetting(SENS_KEY, "1")) || 1);
  const sensitivityRef = useRef(sensitivity);
  const [sfxOn, setSfxOn] = useState(() => readSetting(SFX_KEY, "on") !== "off");
  const sfxRef = useRef(sfxOn);
  const game = useGridshot();

  useEffect(() => {
    sensitivityRef.current = sensitivity;
    saveSetting(SENS_KEY, String(sensitivity));
  }, [sensitivity]);

  useEffect(() => {
    sfxRef.current = sfxOn;
    saveSetting(SFX_KEY, sfxOn ? "on" : "off");
  }, [sfxOn]);

  // Start from a clean round each visit, and release the mouse when leaving.
  useEffect(() => {
    gridshot.reset();
    return () => {
      gridshot.reset();
      if (document.pointerLockElement) document.exitPointerLock();
    };
  }, []);

  const requestLock = () => {
    if (sfxRef.current) warmUpAudio();
    const result = rootRef.current?.requestPointerLock() as Promise<void> | undefined;
    // Browsers refuse to re-lock for about a second after Esc; the button simply stays up.
    result?.catch?.(() => {});
  };

  useEffect(() => {
    const onLockChange = () => {
      const isLocked = document.pointerLockElement === rootRef.current;
      activeRef.current = isLocked;
      setLocked(isLocked);
      if (isLocked) setStarted(true);
      else gridshot.abort();
    };
    const onMouseDown = (e: MouseEvent) => {
      if (!activeRef.current || e.button !== 0) return;
      const outcome = apiRef.current?.fire();
      if (!outcome) return;
      if (sfxRef.current) {
        playShot();
        if (outcome === "target") playHit();
      }
      const crosshair = crosshairRef.current;
      if (crosshair) {
        restartClass(crosshair, "firing", 70);
        if (outcome === "target") restartClass(crosshair, "hit", 280);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (!activeRef.current || e.code !== "KeyE" || e.repeat) return;
      const { nearStation, phase } = gridshot.get();
      if (nearStation && (phase === "idle" || phase === "results")) gridshot.start(performance.now());
    };

    document.addEventListener("pointerlockchange", onLockChange);
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Timer text changes every frame, so it's written straight to the DOM instead of through React.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const s = gridshot.get();
      const elapsed = performance.now() - s.phaseStartedAt;
      if (countdownRef.current && s.phase === "countdown") {
        countdownRef.current.textContent = String(Math.max(Math.ceil((COUNTDOWN_MS - elapsed) / 1000), 1));
      }
      if (timerRef.current && s.phase === "running") {
        timerRef.current.textContent = (Math.max(ROUND_MS - elapsed, 0) / 1000).toFixed(1);
      }
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);

  if (touchOnly) {
    return (
      <div className="game-mode game-mode-notice">
        <div className="game-menu card">
          <span className="hud-label">04 // Game Mode</span>
          <h2>Keyboard &amp; mouse required</h2>
          <p>Game Mode is a first-person shooter, so it needs a keyboard and mouse. Try it on a computer!</p>
          <button className="btn btn-primary" onClick={onExit}>
            Back to range
          </button>
        </div>
      </div>
    );
  }

  const settings = QUALITY[quality];
  const inRound = game.phase === "countdown" || game.phase === "running";

  return (
    <div ref={rootRef} className={`game-mode ${locked ? "is-locked" : ""}`}>
      <Canvas
        className="game-canvas"
        dpr={[1, settings.maxDpr]}
        gl={{ antialias: false }}
        camera={{ fov: 70, near: 0.05, far: 220 }}
      >
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setQuality(lowerQuality)}
          onFallback={() => setQuality("low")}
        />
        <Suspense fallback={null}>
          <GameScene
            apiRef={apiRef}
            active={activeRef}
            sensitivity={sensitivityRef}
            quality={settings}
            onReady={markReady}
          />
        </Suspense>
      </Canvas>

      <div className="game-hud" aria-live="polite">
        <div className="game-hud-id">
          <span className="hud-label">04 // Game Mode</span>
          <span className="game-hud-sub">Training range</span>
        </div>

        {inRound && (
          <div className="game-scoreboard">
            {game.phase === "running" ? (
              <>
                <div>
                  <span className="game-stat-label">Time</span>
                  <span ref={timerRef} className="game-stat-value">
                    30.0
                  </span>
                </div>
                <div>
                  <span className="game-stat-label">Score</span>
                  <span className="game-stat-value">{game.hits}</span>
                </div>
                <div>
                  <span className="game-stat-label">Acc</span>
                  <span className="game-stat-value">{accuracyOf(game)}%</span>
                </div>
              </>
            ) : (
              <div className="game-countdown">
                <span className="game-stat-label">Get ready</span>
                <span ref={countdownRef} className="game-countdown-value">
                  3
                </span>
              </div>
            )}
          </div>
        )}

        {game.phase === "results" && (
          <div className="game-results card">
            <span className="hud-label">Gridshot // Results</span>
            {game.newBest && <span className="game-new-best">New best!</span>}
            <dl>
              <div>
                <dt>Score</dt>
                <dd>{game.hits}</dd>
              </div>
              <div>
                <dt>Accuracy</dt>
                <dd>{accuracyOf(game)}%</dd>
              </div>
              <div>
                <dt>Best</dt>
                <dd>{game.best}</dd>
              </div>
            </dl>
            <p>Press E at the console to play again.</p>
          </div>
        )}

        {locked && game.nearStation && !inRound && (
          <p className="game-prompt">
            <kbd>E</kbd> {game.phase === "results" ? "Play Gridshot again" : "Start Gridshot"}
          </p>
        )}

        {locked && !game.nearStation && game.phase === "idle" && (
          <p className="game-hint">Walk to the glowing console to start Gridshot</p>
        )}
      </div>

      <div ref={crosshairRef} className="game-crosshair" aria-hidden="true">
        <span className="gc-line gc-top" />
        <span className="gc-line gc-right" />
        <span className="gc-line gc-bottom" />
        <span className="gc-line gc-left" />
        <span className="gc-dot" />
        <span className="gc-hit" />
      </div>

      {!locked && (
        <div className="game-overlay">
          <div className="game-menu card">
            <span className="hud-label">04 // Game Mode</span>
            <h2>{started ? "Paused" : "Training Range"}</h2>
            <ul className="game-controls">
              {CONTROLS.map(([key, action]) => (
                <li key={key}>
                  <kbd>{key}</kbd>
                  <span>{action}</span>
                </li>
              ))}
            </ul>

            <label className="game-setting">
              <span>Sensitivity</span>
              <input
                type="range"
                min={0.2}
                max={3}
                step={0.05}
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
              />
              <output>{sensitivity.toFixed(2)}</output>
            </label>

            <div className="game-menu-actions">
              <button className="btn btn-primary" onClick={requestLock} disabled={!ready}>
                {!ready ? "Loading…" : started ? "Resume" : "Deploy"}
              </button>
              <button className="btn btn-ghost" onClick={() => setSfxOn((on) => !on)} aria-pressed={sfxOn}>
                SFX {sfxOn ? "On" : "Off"}
              </button>
              <button className="btn btn-ghost" onClick={onExit}>
                Exit to range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameMode;
