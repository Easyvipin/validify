import ProjectCard from "@/components/ProjectCard";
import { getProjects } from "../actions";
import ActionBar from "@/components/ActionBar";

export default async function ProjectsPage() {
  const projects = await getProjects();
  console.log(projects);
  return (
    <div className="bg-gradient-to-b p-8">
      <ActionBar />

      {projects.length === 0 ? (
        <p className="text-white/60">No projects found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              desc={project.desc}
              logoUrl={project.logoUrl || ""}
              category={project.projectCategories[0].category.name}
              upvotes={10}
              downvotes={10}
              comments={10}
            />
          ))}
        </div>
      )}
    </div>
  );
}
