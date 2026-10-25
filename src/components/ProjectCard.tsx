import type { Project, ProjectLinkKind } from "../types";
import "./ProjectCard.css";

const LINK_DEFAULTS: Record<ProjectLinkKind, { label: string; icon: string }> = {
  github: { label: "GitHub", icon: "github-icon" },
  itch: { label: "Play on itch.io", icon: "itch-icon" },
  live: { label: "Live Site", icon: "external-icon" },
};

function initials(title: string) {
  return title
    .split(/\s+/)
    .filter((word) => /^[A-Za-z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const { title, description, tags, image, links = [], inProgress } = project;

  return (
    <article className="project-card card">
      <div className="project-thumb">
        {image ? (
          <img src={image} alt={`${title} screenshot`} loading="lazy" />
        ) : (
          <span className="project-thumb-placeholder" aria-hidden="true">
            {initials(title)}
          </span>
        )}
        {inProgress && <span className="project-badge">In progress</span>}
      </div>

      <div className="project-body">
        <h3>{title}</h3>
        <p>{description}</p>

        <div className="project-tags">
          {tags.map((tag) => (
            <span key={tag} className="tag-pill">
              {tag}
            </span>
          ))}
        </div>

        {links.length > 0 && (
          <div className="project-links">
            {links.map((link) => {
              const { label: defaultLabel, icon } = LINK_DEFAULTS[link.kind];
              const label = link.label ?? defaultLabel;
              return (
                <a
                  key={link.href}
                  className="project-link"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${title}: ${label} (opens in a new tab)`}
                >
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <use href={`/icons.svg#${icon}`} />
                  </svg>
                  {label}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}

export default ProjectCard;
