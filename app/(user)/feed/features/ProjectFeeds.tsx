"use client";

import { useState, useEffect, useRef } from "react";
import { useIntersection } from "@/hooks/useIntersection";
import ProjectFeedCard from "./ProjectFeedCard";
import { insertVote, VoteType } from "../action";

export default function ProjectsFeed() {
  const [projects, setProjects] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const isFetching = useRef(false);

  const [cursorId, setCursorId] = useState<number | null>(null);

  const { ref, isIntersecting } = useIntersection({
    rootMargin: "200px",
  });

  // 🔹 function to fetch projects (used both for first load + scroll)
  const fetchProjects = async (cursor?: number | null) => {
    if (loading || !hasMore || isFetching.current) return;

    isFetching.current = true;
    setLoading(true);

    const cursorQuery = cursor ? `&cursor=${cursor}` : "";
    const res = await fetch(`/api/projects?limit=5${cursorQuery}`);
    const data = await res.json();

    console.log(data);

    if (data.length === 0) {
      setHasMore(false);
    } else {
      setProjects((prev) => [...prev, ...data]);
      setCursorId(data[data.length - 1].id);
      setHasMore(true);
    }

    setLoading(false);
    isFetching.current = false;
  };

  useEffect(() => {
    fetchProjects(null);
  }, []);

  useEffect(() => {
    if (isIntersecting && hasMore && !loading && !isFetching.current) {
      fetchProjects(cursorId);
    }
  }, [isIntersecting, cursorId]);

  const handleVote = async (type: VoteType, projectId: number) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) => {
        if (project.id !== projectId) return project;
        const { userVote } = project;

        // Determine vote changes
        const delta = {
          upvotes: 0,
          downvotes: 0,
        };

        if (userVote === type) {
          // clicked same vote → remove
          delta[type === "upvote" ? "upvotes" : "downvotes"] = -1;
          return {
            ...project,
            upvotes: project.upvotes + delta.upvotes,
            downvotes: project.downvotes + delta.downvotes,
            userVote: null,
          };
        }

        if (userVote) {
          // switching vote → decrease previous, increase new
          delta.upvotes = type === "upvote" ? 1 : -1;
          delta.downvotes = type === "downvote" ? 1 : -1;
        } else {
          // new vote
          delta.upvotes = type === "upvote" ? 1 : 0;
          delta.downvotes = type === "downvote" ? 1 : 0;
        }

        return {
          ...project,
          upvotes: project.upvotes + delta.upvotes,
          downvotes: project.downvotes + delta.downvotes,
          userVote: type,
        };
      })
    );

    await insertVote(projectId, type);
  };

  const statObj = { count: 20, userVote: "up" };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="grid gap-4">
        {projects.map((p) => (
          <ProjectFeedCard
            key={p.id}
            project={p}
            userVote={p.userVote}
            handleVote={handleVote}
          />
        ))}
      </div>

      {/* Sentinel */}
      <div ref={ref} className="h-10 flex items-center justify-center">
        {loading && <span className="text-muted-foreground">Loading...</span>}
        {!hasMore && (
          <span className="text-muted-foreground text-sm">
            🎉 You’ve seen it all
          </span>
        )}
      </div>
    </div>
  );
}
