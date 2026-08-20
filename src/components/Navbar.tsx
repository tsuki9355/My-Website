import type { PageId } from "../types";
import "./Navbar.css";

interface NavbarProps {
  activePage: PageId;
  isGameMode: boolean;
  onNavigate: (page: PageId) => void;
  onEnterGame: () => void;
  onExitGame: () => void;
}

const NAV_ITEMS: { id: PageId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
];


function Navbar({
  activePage,
  isGameMode,
  onNavigate,
  onEnterGame,
  onExitGame,
}: NavbarProps) {
  return (
    <nav className="navbar">
      <div
        className="nav-logo glow-text"
        onClick={() => {
          if (isGameMode) onExitGame();
          onNavigate("home");
        }}
      >
        Angus
      </div>

      <div className="nav-links">
        {!isGameMode ? (
          <>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`nav-tab ${activePage === item.id ? "active" : ""}`}
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </button>
            ))}

            <button className="btn btn-primary game-btn" onClick={onEnterGame}>
              Game Mode
            </button>
          </>
        ) : (
          <button className="btn btn-ghost exit-btn" onClick={onExitGame}>
            Exit Game
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
