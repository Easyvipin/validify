import { Suspense } from "react";

import ProjectsPage from "./features/list";

type Props = {};

const ProjectPage = async (props: Props) => {
  return (
    <div>
      <Suspense fallback={<div>loading projects...</div>}>
        <ProjectsPage />
      </Suspense>
    </div>
  );
};

export default ProjectPage;
