import type { Project } from "../types";
import "./ProjectCard.css";

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const { title, description, tags, link } = project;

  return (
    <article className="project-card card">
      <h3>{title}</h3>
      <p>{description}</p>

      <div className="project-tags">
        {tags.map((tag) => (
          <span key={tag} className="tag-pill">
            {tag}
          </span>
        ))}
      </div>

      {link && (
        <a className="project-link" href={link} target="_blank" rel="noreferrer">
          View project &rarr;
        </a>
      )}
    </article>
  );
}

export default ProjectCard;
