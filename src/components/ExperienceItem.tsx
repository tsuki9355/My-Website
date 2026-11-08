import type { ExperienceEntry } from "../types";
import "./ExperienceItem.css";

interface ExperienceItemProps {
  entry: ExperienceEntry;
}

function ExperienceItem({ entry }: ExperienceItemProps) {
  return (
    <li className="experience-item">
      <span className="experience-marker" aria-hidden="true" />
      <article className="experience-card card">
        <span className="experience-period">{entry.period}</span>
        <h3>{entry.role}</h3>
        <p className="experience-org">{entry.organization}</p>
        <p className="experience-desc">{entry.description}</p>
        {entry.highlights && (
          <ul className="experience-highlights">
            {entry.highlights.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        )}

        <div className="experience-tags">
          {entry.tags.map((tag) => (
            <span key={tag} className="tag-pill">
              {tag}
            </span>
          ))}
        </div>
      </article>
    </li>
  );
}

export default ExperienceItem;
