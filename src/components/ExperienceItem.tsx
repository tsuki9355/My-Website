import type { ExperienceEntry } from "../types";
import "./ExperienceItem.css";

interface ExperienceItemProps {
  entry: ExperienceEntry;
}

function ExperienceItem({ entry }: ExperienceItemProps) {
  return (
    <div className="experience-item">
      <div className="experience-dot" />
      <div className="experience-card card">
        <span className="experience-period">{entry.period}</span>
        <h3>{entry.role}</h3>
        <p className="experience-org">{entry.organization}</p>
        <p>{entry.description}</p>

        <div className="experience-tags">
          {entry.tags.map((tag) => (
            <span key={tag} className="tag-pill">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExperienceItem;
