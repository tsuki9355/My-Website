import "./TransitionVeil.css";

interface TransitionVeilProps {
  visible: boolean;
  durationMs: number;
}

function TransitionVeil({ visible, durationMs }: TransitionVeilProps) {
  return (
    <div
      className={`transition-veil ${visible ? "visible" : ""}`}
      style={{ transitionDuration: `${durationMs}ms` }}
      aria-hidden="true"
    />
  );
}

export default TransitionVeil;
