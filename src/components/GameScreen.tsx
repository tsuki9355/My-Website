import "./GameScreen.css";

function GameScreen() {
  return (
    <div className="game-screen">
      <div className="game-screen-content card animate-fade">
        <span className="hud-label">04 // Game Mode</span>
        <h2 className="glow-text">Cozy Diorama Room</h2>
        <p>Currently still WIP...</p>
        <p className="game-screen-status">
          <span aria-hidden="true" /> Systems coming online
        </p>
      </div>
    </div>
  );
}

export default GameScreen;
