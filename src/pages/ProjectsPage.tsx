import { useState } from "react";
import { projects, projectCategories } from "../data/projects";
import type { ProjectCategory } from "../types";
import ProjectCard from "../components/ProjectCard";
import "./ProjectsPage.css";

type CategoryFilter = ProjectCategory | "all";

function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  const visibleProjects =
    activeCategory === "all"
      ? projects
      : projects.filter((project) => project.category === activeCategory);

  return (
    <section className="page-view animate-fade">
      <h1 className="glow-text">My Projects</h1>
      <p className="page-intro">
        I have categorized my projects into different categories below to showcase my capabilities!
      </p>

      <div className="category-filters">
        <button
          className={`category-tab ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          All
        </button>
        {projectCategories.map((category) => (
          <button
            key={category.id}
            className={`category-tab ${activeCategory === category.id ? "active" : ""}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="project-grid">
        {visibleProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

export default ProjectsPage;
