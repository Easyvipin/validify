"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { truncate } from "@/utils/common";
import { DEFAULT_PROJECT_LOGO } from "@/utils/constants";

type ProjectCardProps = {
  id: number;
  name: string;
  desc: string;
  logoUrl?: string;
  category?: string;
  upvotes: number;
  downvotes: number;
  tagline: string | null;
};

export default function ProjectCard({
  id,
  name,
  desc,
  logoUrl,
  category,
  upvotes,
  downvotes,
  tagline,
}: ProjectCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="relative">
      <Link href={`/project/${id}`}>
        <Card className="relative overflow-hidden rounded-2xl shadow-lg bg-card">
          {/* Category badges top right */}
          <div className="absolute top-3 right-3 flex gap-2 flex-wrap justify-end">
            {category && (
              <Badge className="bg-secondary text-secondary-foreground">
                {category}
              </Badge>
            )}
          </div>

          <CardHeader className="flex w-full items-center gap-4 flex-wrap md:flex-nowrap">
            <img
              src={logoUrl || DEFAULT_PROJECT_LOGO}
              alt={name}
              className="w-12 h-12  rounded-xl object-cover border"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_PROJECT_LOGO;
              }}
            />

            <div className="w-full self-start">
              <h3 className="text-lg font-semibold text-foreground text-wrap">
                alsdjakldjslkdajd;lsakd';dlkas'kl adjadlkasjdaj
                a;ldkjaskldjasd;kajd
              </h3>
              {tagline && (
                <h5 className="text-xs text-ring font-mono italic">
                  {tagline}
                </h5>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground block">
              {truncate(desc, 600)}
            </p>
            {/* Footer with upvotes, downvotes, comments */}
            <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center gap-1 text-green-300">
                  <ArrowUp size={16} className="" />
                  {upvotes}
                </span>
                <span className="flex items-center gap-1">
                  <ArrowDown size={16} className="text-destructive" />
                  {downvotes}
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
