"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { categoryIcon } from "@/utils/constants";
import { InferSelectModel } from "drizzle-orm";
import { VoteType } from "../action";

export type ProjectFeedCardProps = {
  id: number;
  name: string;
  desc: string;
  logoUrl?: string;
  projectCategories: {
    category: {
      name: string;
    };
  }[];
  upvotes: number;
  downvotes: number;
};

type Props = {
  project: ProjectFeedCardProps;
  handleVote: (type: VoteType, projectId: number) => void;
  userVote: VoteType | null;
};

export default function ProjectFeedCard({
  project,
  handleVote,
  userVote,
}: Props) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTab, setSheetTab] = useState<"details" | "comments">("details");
  const [selectedVoteType, setSelectedVoteType] = useState<VoteType | null>();

  const openSheet = (tab: "details" | "comments") => {
    setSheetTab(tab);
    setSheetOpen(true);
  };

  useEffect(() => {
    setSelectedVoteType(userVote);
  }, [userVote]);

  const voteHandler = (type: VoteType, projectId: number) => {
    setSelectedVoteType(type);
    handleVote(type, projectId);
  };

  console.log(selectedVoteType);

  return (
    <>
      <div
        key={project.id}
        className="rounded-2xl overflow-hidden transition-all duration-300 border border-border bg-card hover:-translate-y-1 hover:shadow-lg cursor-pointer"
        onClick={() => router.push(`/project/${project.id}`)}
      >
        <div className="p-5 flex items-center gap-4">
          {project.logoUrl ? (
            <img
              src={project.logoUrl}
              alt={project.name}
              className="w-12 h-12 rounded-xl object-cover border border-border"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-muted">
              {categoryIcon[project.projectCategories[0]?.category.name] ??
                "📦"}
            </div>
          )}

          <div className="flex-1">
            <h3 className="text-xl font-medium text-foreground mb-1">
              {project.name}
            </h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="px-2 py-1 rounded-xl text-xs font-semibold bg-primary text-primary-foreground">
                {project.projectCategories[0]?.category.name}
              </span>
            </div>
          </div>
        </div>

        {/* Project Content */}
        {/* <div className="px-5 pb-5">
          <p className="text-muted-foreground leading-relaxed mb-4">
            {project.desc}
          </p>
          <div className="flex gap-5 mb-4 text-sm text-muted-foreground">
            <span>👍 {project.upvotes} upvotes</span>
            <span>👎 {project.downvotes} downvotes</span>
            <span>💬 {project.comments} comments</span>
          </div>
        </div> */}

        {/* Project Actions */}
        <div
          className="flex items-center justify-between p-4 border-t border-border bg-muted/40"
          onClick={(e) => e.stopPropagation()} // prevent card navigation
        >
          {/* Voting */}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className={`w-9 h-9 p-0 text-lg transition-all duration-200 
                ${
                  selectedVoteType === "upvote"
                    ? "bg-success hover:bg-success/90 text-success-foreground border-1 border-green-300"
                    : "bg-success/10 text-success hover:bg-success hover:text-success-foreground"
                }`}
              onClick={() => voteHandler("upvote", project.id)}
            >
              ▲
            </Button>
            <span className="font-semibold text-foreground min-w-8 text-center">
              {project.upvotes}
            </span>
            <Button
              size="sm"
              className={`w-9 h-9 p-0 text-lg transition-all duration-200
                ${
                  selectedVoteType === "downvote"
                    ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    : "bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                }`}
              onClick={() => voteHandler("downvote", project.id)}
            >
              ▼
            </Button>
            <span className="font-semibold text-foreground min-w-8 text-center">
              {project.downvotes}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              size="sm"
              className="bg-card border border-border text-muted-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-200 text-sm"
              onClick={() => openSheet("details")}
            >
              📋 Details
            </Button>
          </div>
        </div>
      </div>

      {/* Sheet for Details / Comments */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[500px] p-2">
          <SheetHeader>
            <SheetTitle>{project.name}</SheetTitle>
          </SheetHeader>

          {sheetTab === "details" && (
            <div className="mt-4 space-y-4">
              <p className="text-muted-foreground">{project.desc}</p>
              {/* <div className="text-sm text-muted-foreground">
                👍 {project.upvotes} · 👎 {project.downvotes} · 💬{" "}
                {project.comments}
              </div> */}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
