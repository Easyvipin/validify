"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type ProjectCardProps = {
  id: number;
  name: string;
  desc: string;
  logoUrl?: string;
  category: string;
  upvotes: number;
  downvotes: number;
  comments: number;
};

export default function ProjectCard({
  id,
  name,
  desc,
  logoUrl,
  category,
  upvotes,
  downvotes,
  comments,
}: ProjectCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="relative">
      <Link href={`/project/${id}`}>
        <Card className="relative overflow-hidden rounded-2xl shadow-lg border border-border bg-card">
          {/* Category badges top right */}
          <div className="absolute top-3 right-3 flex gap-2 flex-wrap justify-end">
            <Badge className="bg-secondary text-secondary-foreground">
              {category}
            </Badge>
          </div>

          <CardHeader className="flex items-center gap-4">
            {true && (
              <img
                src={"https://placehold.co/600x400"}
                alt={name}
                className="w-12 h-12 rounded-xl object-cover border border-border"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          </CardHeader>

          <CardContent>
            {/* Footer with upvotes, downvotes, comments */}
            <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <ThumbsUp size={16} className="text-success" />
                  {upvotes}
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsDown size={16} className="text-destructive" />
                  {downvotes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare size={16} className="text-primary" />
                  {comments}
                </span>
              </div>
            </div>
          </CardContent>

          {/* Glass edges (gradient border effect) */}
          <div className="absolute inset-0 rounded-2xl border border-border pointer-events-none" />
        </Card>
      </Link>
    </motion.div>
  );
}
