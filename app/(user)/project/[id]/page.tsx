import React from "react";

type Props = {
  params: {
    id: string;
  };
};

const ProjectDetail = async ({ params }: Props) => {
  return <div>{params.id}</div>;
};

export default ProjectDetail;
