import heroImage from "../assets/hero.png";
import "./HomePage.css";

const HOBBIES = [
  "Making games in Unity",
  "3D modeling in Blender",
  "2D art in Clip Studio Paint",
  "Programming in general",
  "Playing Games"
];

function HomePage() {
  return (
    <section className="page-view home-page animate-fade">
      <div className="hero">
        <div className="hero-text">
          <p className="eyebrow">Hi, my name is</p>
          <h1 className="glow-text">Angus Chou</h1>
          <p className="hero-bio">
            I'm a third-year Computer Science student at the University of
            British Columbia. I like building things end-to-end — from
            gameplay code to the little glowing UI details.
          </p>

          <div className="hobby-list">
            {HOBBIES.map((hobby) => (
              <span key={hobby} className="hobby-pill">
                {hobby}
              </span>
            ))}
          </div>
        </div>
        <img
          className="hero-image hero-image-float"
          src={heroImage}
          alt="A glowing purple floating platform illustration"
        />
      </div>
    </section>
  );
}

export default HomePage;
