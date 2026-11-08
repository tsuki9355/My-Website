import "./HomePage.css";

const LOADOUT = [
  {
    slot: "Primary",
    title: "Languages",
    items: ["C++/C", "C#", "Java", "TypeScript", "JavaScript", "SQL", "HTML"],
  },
  {
    slot: "Secondary",
    title: "Engines & Frameworks",
    items: ["Unity", "Unreal Engine", "Spring Boot", "AWS"],
  },
  {
    slot: "Abilities",
    title: "Practices",
    items: [
      "Object-Oriented Programming",
      "Data Structures & Algorithms",
      "Design Principles",
      "TDD",
      "SDLC",
      "Software Development",
      "Software Engineering",
    ],
  },
];

function HomePage() {
  return (
    <section className="page-view about-page animate-fade">
      <div className="about-hero">
        <div className="about-intro">
          <span className="hud-label">01 // About</span>
          <h1 className="about-name glow-text">Angus Chou</h1>
          <p className="about-role">
            Gameplay &amp; Software Engineer <span>// UBC Computer Science</span>
          </p>

          <div className="about-bio card">
            <p>
              I'm a third-year <strong>Computer Science</strong> student at the{" "}
              <strong>University of British Columbia</strong>. I am an aspiring gameplay / software
              engineer. I like building things end-to-end — from gameplay code to the little glowing
              UI details. My hobbies include participating in <strong>game jams</strong>, making{" "}
              <strong>personal projects</strong>, and <strong>playing games</strong>. Some of my
              favorite programming languages are <strong>C++</strong>, <strong>Java</strong>,{" "}
              <strong>C#</strong>, <strong>JavaScript</strong>, and <strong>TypeScript</strong>.
            </p>
          </div>
        </div>

        <figure className="lumi-holo">
          <div className="lumi-figure">
            <img src="/Lumi-hero.png" alt="Lumi, a chibi witch with long lavender hair and a starry blue hat" />
            <span className="lumi-scan" aria-hidden="true" />
          </div>
          <span className="lumi-pedestal" aria-hidden="true" />
          <figcaption>Lumi // Companion unit</figcaption>
        </figure>
      </div>

      <section className="loadout" aria-labelledby="loadout-title">
        <h2 id="loadout-title" className="hud-label">
          Skill loadout
        </h2>
        <div className="loadout-grid">
          {LOADOUT.map((group) => (
            <div key={group.title} className="loadout-card card">
              <span className="loadout-slot">{group.slot}</span>
              <h3>{group.title}</h3>
              <div className="loadout-items">
                {group.items.map((item) => (
                  <span key={item} className="tag-pill">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

export default HomePage;
