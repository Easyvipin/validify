import { Metadata } from "next";
import React from "react";
import ProjectsFeed from "./features/ProjectFeeds";

type Props = {};

export const metadata: Metadata = {
  title: "Feed",
  description: "Where People Validate Your Projects",
};

const page = async (props: Props) => {
  return (
    <div>
      <ProjectsFeed />
    </div>
  );
};

export default page;
