"use client";

import { Project } from "@/lib/types/project";
import { ProjectCard } from "./ProjectCard";
import { motion } from "motion/react";
import { staggerContainer } from "@/lib/motion";

interface ProjectGridProps {
  projects: Project[];
  layout?: "traditional" | "adventurous";
}

export function ProjectGrid({ projects, layout = "traditional" }: ProjectGridProps) {
  const isTraditional = layout === "traditional";

  if (isTraditional) {
    return (
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {projects.map((project) => (
          <motion.div
            key={project.slug}
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
            }}
          >
            <ProjectCard project={project} layout={layout} />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Adventurous layout - more fluid and dynamic
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      {projects.map((project, index) => (
        <motion.div
          key={project.slug}
          variants={{
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 },
          }}
          className={index % 3 === 0 ? "md:col-span-2" : ""}
        >
          <ProjectCard project={project} layout={layout} />
        </motion.div>
      ))}
    </motion.div>
  );
}



