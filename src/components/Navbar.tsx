import type { PageId } from "../types";
import "./Navbar.css";

interface NavbarProps {
  activePage: PageId;
  isGameMode: boolean;
  onNavigate: (page: PageId) => void;
  onEnterGame: () => void;
  onReturnToRange: () => void;
}

const NAV_ITEMS: { id: PageId; label: string }[] = [
  { id: "home", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
];

function Navbar({ activePage, isGameMode, onNavigate, onEnterGame, onReturnToRange }: NavbarProps) {
  return (
    <nav className="navbar">
      <button className="nav-logo glow-text" onClick={onReturnToRange} title="Back to the firing range">
        Angus
      </button>

      <div className="nav-links">
        {!isGameMode ? (
          <>
            <button className="nav-tab nav-range" onClick={onReturnToRange}>
              <span className="nav-range-icon" aria-hidden="true" />
              Range
            </button>
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
          <button className="btn btn-ghost exit-btn" onClick={onReturnToRange}>
            Exit Game
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
