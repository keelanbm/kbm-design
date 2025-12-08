"use client";

import { useState, useEffect } from "react";
import { getProjects } from "@/lib/data/projects";
import { Project } from "@/lib/types/project";
import { ProjectGrid } from "@/components/portfolio/ProjectGrid";
import { LayoutToggle } from "@/components/layout/LayoutToggle";

export default function ProjectsPage() {
  const [layout, setLayout] = useState<"traditional" | "adventurous">("traditional");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const fetchedProjects = await getProjects();
        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen pt-20 pb-20 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-12 bg-neutral-800 rounded w-64 mb-4" />
            <div className="h-6 bg-neutral-800 rounded w-32" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              All Projects
            </h1>
            <p className="text-neutral-400 text-lg">
              {projects.length} projects
            </p>
          </div>
          <LayoutToggle
            onLayoutChange={(newLayout) => setLayout(newLayout)}
            defaultLayout={layout}
          />
        </div>

        <ProjectGrid projects={projects} layout={layout} />
      </div>
    </main>
  );
}
