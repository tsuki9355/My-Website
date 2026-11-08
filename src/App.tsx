import { lazy, Suspense, useState } from "react";
import type { PageId } from "./types";
import type { RangeDestination } from "./range/targets";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import TransitionVeil from "./components/TransitionVeil";
import MusicPlayer from "./components/MusicPlayer";
import GameScreen from "./components/GameScreen";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import ExperiencePage from "./pages/ExperiencePage";
import "./App.css";

const FiringRange = lazy(() => import("./range/FiringRange"));

const TRANSITION_MS = 600;

function App() {
  const [inRange, setInRange] = useState(true);
  const [activePage, setActivePage] = useState<PageId>("home");
  const [isGameMode, setIsGameMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  function transition(apply: () => void) {
    setIsTransitioning(true);
    window.setTimeout(() => {
      apply();
      window.scrollTo(0, 0);
      setIsTransitioning(false);
    }, TRANSITION_MS);
  }

  function enterFromRange(destination: RangeDestination) {
    transition(() => {
      setInRange(false);
      setIsGameMode(destination === "game");
      if (destination !== "game") setActivePage(destination);
    });
  }

  function returnToRange() {
    transition(() => {
      setIsGameMode(false);
      setInRange(true);
    });
  }

  return (
    <div className="app-shell">
      {inRange ? (
        <Suspense fallback={<div className="range-loading">Initializing range…</div>}>
          <FiringRange onSelect={enterFromRange} onSkip={() => enterFromRange("home")} />
        </Suspense>
      ) : (
        <>
          <div className="ambient-glow" aria-hidden="true" />

          <Navbar
            activePage={activePage}
            isGameMode={isGameMode}
            onNavigate={(page) => {
              setActivePage(page);
              window.scrollTo(0, 0);
            }}
            onEnterGame={() => transition(() => setIsGameMode(true))}
            onReturnToRange={returnToRange}
          />

          {isGameMode ? (
            <GameScreen />
          ) : (
            <main className="web-content">
              {activePage === "home" && <HomePage />}
              {activePage === "projects" && <ProjectsPage />}
              {activePage === "experience" && <ExperiencePage />}
              <Footer />
            </main>
          )}
        </>
      )}

      <TransitionVeil visible={isTransitioning} durationMs={TRANSITION_MS} />
      <MusicPlayer isGameMode={isGameMode} />
    </div>
  );
}

export default App;
