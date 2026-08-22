import heroImage from "../assets/hero.png";
import "./HomePage.css";

const Skills = [
  "Unity",
  "Object-Oriented Programming",
  "Data Structure & Algorithms",
  "Design Principles",
  "Software development",
  "Software engineering",
  "Finite State Machines"
];

function HomePage() {
  return (
    <section className="page-view home-page animate-fade">
      <div className="hero">
        <div className="hero-text">
          <p className="eyebrow">Hi, my name is</p>
          <h1 className="glow-text">Angus Chou</h1>
          <p className="hero-bio">
            I'm a third-year <strong>Computer Science </strong> student at the <strong>University of
            British Columbia </strong>. I like building things end-to-end — from
            gameplay code to the little glowing UI details. 
            My hobbies includes participating in <strong>game jams </strong>,
            making <strong>personal projects </strong>, and <strong>playing games </strong>.
            Some of my favorite progrmaming languages are
            <strong> C#</strong>, 
            <strong> Java</strong>, 
            <strong> TypeScript</strong>, and 
            <strong> C++</strong>.
          </p>

          <div className="skill-list">
            {Skills.map((skill) => (
              <span key={skill} className="skill-pill">
                {skill}
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
