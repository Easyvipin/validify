"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useIntersection } from "@/hooks/useIntersection";
import ProjectFeedCard from "./ProjectFeedCard";
import { insertVote, subscribedCategoryIds, VoteType } from "../action";
import { CategoryArray } from "@/app/(onboarding)/onboarding/page";
import { getAllCategories } from "../../projects/actions";

export default function ProjectsFeed() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryArray>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const isFetching = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cache, setCache] = useState<Record<string, any>>({});

  const { ref, isIntersecting } = useIntersection({ rootMargin: "200px" });

  useEffect(() => {
    async function loadCategories() {
      const cats = await getAllCategories();
      const selectedCatsId = await subscribedCategoryIds();
      setCategories(cats);
      setSelectedCategories(selectedCatsId);
    }
    loadCategories();
  }, []);

  const getKey = (cats: number[]) => cats.sort((a, b) => a - b).join(",");

  const fetchProjects = async (cursor?: number | null) => {
    const key = getKey(selectedCategories);
    const current = cache[key] || {
      projects: [],
      cursorId: null,
      hasMore: true,
    };

    if (loading || !current.hasMore || isFetching.current) return;

    isFetching.current = true;
    setLoading(true);

    const cursorQuery = cursor ? `&cursor=${cursor}` : "";
    const categoryQuery = selectedCategories.length
      ? `&categories=${selectedCategories.join(",")}`
      : "";

    const res = await fetch(
      `/api/projects?limit=5${cursorQuery}${categoryQuery}`
    );
    const data = await res.json();

    const newProjects = cursor ? [...current.projects, ...data] : data;
    const newCursor = data.length ? data[data.length - 1].id : current.cursorId;

    const updated = {
      projects: newProjects,
      cursorId: newCursor,
      hasMore: data.length > 0,
    };

    setCache((prev) => ({ ...prev, [key]: updated }));
    setProjects(updated.projects);

    setLoading(false);
    isFetching.current = false;
  };

  useEffect(() => {
    const key = getKey(selectedCategories);
    if (cache[key]) {
      setProjects(cache[key].projects);
    } else {
      fetchProjects(null);
    }
  }, [selectedCategories]);

  // 🔹 infinite scroll
  useEffect(() => {
    if (isIntersecting && !loading) {
      const key = getKey(selectedCategories);
      const current = cache[key];
      if (current?.hasMore) {
        fetchProjects(current.cursorId);
      }
    }
  }, [isIntersecting, selectedCategories]);

  const toggleCategory = useCallback(
    (id: number) => {
      setSelectedCategories((prev) =>
        prev.includes(id) && selectedCategories.length > 1
          ? prev.filter((c) => c !== id)
          : [...prev, id]
      );
    },
    [selectedCategories]
  );

  const handleVote = async (type: VoteType, projectId: number) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;

        let { upvotes, downvotes, userVote } = p;

        if (userVote === type) {
          // 👇 same vote clicked → remove it
          if (type === "upvote") upvotes--;
          else downvotes--;
          userVote = null;
        } else {
          // 👇 switching or new vote
          if (type === "upvote") {
            upvotes++;
            if (userVote === "downvote") downvotes--; // switching
          } else {
            downvotes++;
            if (userVote === "upvote") upvotes--; // switching
          }
          userVote = type;
        }

        return { ...p, upvotes, downvotes, userVote };
      })
    );

    // optimistic update sent to backend
    await insertVote(projectId, type);
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className={`px-4 py-1 rounded-full border transition text-sm ${
              selectedCategories.includes(cat.id)
                ? "bg-ring text-destructive-foreground border-ring"
                : "bg-background hover:bg-accent"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 mt-4">
        {projects.map((p) => (
          <ProjectFeedCard
            key={p.id}
            project={p}
            userVote={p.userVote}
            handleVote={handleVote}
          />
        ))}
      </div>

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
