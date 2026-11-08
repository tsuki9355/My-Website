import { experience } from "../data/experience";
import ExperienceItem from "../components/ExperienceItem";
import PageHeader from "../components/PageHeader";
import "./ExperiencePage.css";

function ExperiencePage() {
  return (
    <section className="page-view animate-fade">
      <PageHeader index="03" label="Experience" title="Work Experience">
        The timeline of my story~
      </PageHeader>

      <ol className="timeline">
        {experience.map((entry) => (
          <ExperienceItem key={entry.id} entry={entry} />
        ))}
      </ol>
    </section>
  );
}

export default ExperiencePage;
