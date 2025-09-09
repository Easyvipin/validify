import { Suspense } from "react";

import ProjectsPage from "./features/list";

const ProjectPage = async () => {
  return (
    <div>
      <Suspense fallback={<div>loading projects...</div>}>
        <ProjectsPage />
      </Suspense>
    </div>
  );
};

export default ProjectPage;
