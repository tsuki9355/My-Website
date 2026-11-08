import { useState } from "react";
import { projects, projectCategories } from "../data/projects";
import type { ProjectCategory } from "../types";
import ProjectCard from "../components/ProjectCard";
import PageHeader from "../components/PageHeader";
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
      <PageHeader index="02" label="Projects" title="My Projects">
        I have categorized my projects into different categories below to showcase my capabilities!
      </PageHeader>

      <div className="category-filters" role="group" aria-label="Filter projects by category">
        <button
          className={`category-tab ${activeCategory === "all" ? "active" : ""}`}
          aria-pressed={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
        >
          All
        </button>
        {projectCategories.map((category) => (
          <button
            key={category.id}
            className={`category-tab ${activeCategory === category.id ? "active" : ""}`}
            aria-pressed={activeCategory === category.id}
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
