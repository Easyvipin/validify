import React from "react";

type Props = {
  params: Promise<{ id: string }>;
};

const ProjectDetail = async ({ params }: Props) => {
  const { id } = await params;
  return <div>{id}</div>;
};

export default ProjectDetail;
