import { Metadata } from "next";
import React from "react";
import ProjectsFeed from "./features/ProjectFeeds";

export const metadata: Metadata = {
  title: "Feed",
  description: "Where People Validate Your Projects",
};

const page = async () => {
  return (
    <div>
      <ProjectsFeed />
    </div>
  );
};

export default page;
