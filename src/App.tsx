import { useState } from "react";
import type { PageId } from "./types";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import TransitionVeil from "./components/TransitionVeil";
import MusicPlayer from "./components/MusicPlayer";
import GameScreen from "./components/GameScreen";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import ExperiencePage from "./pages/ExperiencePage";
import "./App.css";

const TRANSITION_MS = 600;

function App() {
  const [activePage, setActivePage] = useState<PageId>("home");
  const [isGameMode, setIsGameMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  function playTransition(nextIsGameMode: boolean) {
    setIsTransitioning(true);
    window.setTimeout(() => {
      setIsGameMode(nextIsGameMode);
      setIsTransitioning(false);
    }, TRANSITION_MS);
  }

  return (
    <div className="app-shell">
      <div className="ambient-glow">
        <span />
        <span />
        <span />
      </div>

      <Navbar
        activePage={activePage}
        isGameMode={isGameMode}
        onNavigate={setActivePage}
        onEnterGame={() => playTransition(true)}
        onExitGame={() => playTransition(false)}
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

      <TransitionVeil visible={isTransitioning} durationMs={TRANSITION_MS} />
      <MusicPlayer isGameMode={isGameMode} />
    </div>
  );
}

export default App;
