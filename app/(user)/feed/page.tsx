import { Metadata } from "next";
import React from "react";

type Props = {};

export const metadata: Metadata = {
  title: "Feed",
  description: "Where People Validate Your Projects",
};

const page = (props: Props) => {
  return <div>feed</div>;
};

export default page;
