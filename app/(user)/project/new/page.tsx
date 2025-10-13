"use client";

import React from "react";
import AddProject from "../../projects/features/AddProject";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const NewProject = () => {
  const router = useRouter();

  const handleBack = () => {
    router.push("/projects");
  };
  return (
    <div>
      <Button className="rounded-md" variant="outline" onClick={handleBack}>
        <ArrowLeft /> Back To Projects
      </Button>
      <AddProject />
    </div>
  );
};

export default NewProject;
