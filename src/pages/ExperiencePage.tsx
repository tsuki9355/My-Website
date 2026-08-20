import { experience } from "../data/experience";
import ExperienceItem from "../components/ExperienceItem";
import "./ExperiencePage.css";

function ExperiencePage() {
  return (
    <section className="page-view animate-fade">
      <h1 className="glow-text">Work Experience</h1>
      <p className="page-intro">
        The timeline of my story~   
      </p>

      <div className="timeline">
        {experience.map((entry) => (
          <ExperienceItem key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  );
}

export default ExperiencePage;
