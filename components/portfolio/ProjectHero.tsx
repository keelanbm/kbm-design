"use client";

import { motion } from "motion/react";
import { fadeInUp } from "@/lib/motion";
import { Project } from "@/lib/types/project";
import Image from "next/image";

interface ProjectHeroProps {
  project: Project;
}

export function ProjectHero({ project }: ProjectHeroProps) {
  return (
    <motion.section
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden"
    >
      {project.thumbnail && (
        <div className="absolute inset-0 z-0">
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6"
        >
          {project.title}
        </motion.h1>

        {project.description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-neutral-300 max-w-2xl mx-auto"
          >
            {project.description}
          </motion.p>
        )}

        {project.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-2 mt-8"
          >
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}



