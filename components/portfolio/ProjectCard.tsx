"use client";

import { motion } from "motion/react";
import { hoverScale, hoverLift } from "@/lib/motion";
import { Project } from "@/lib/types/project";
import { Calendar, ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ProjectCardProps {
  project: Project;
  layout?: "traditional" | "adventurous";
}

export function ProjectCard({ project, layout = "traditional" }: ProjectCardProps) {
  const isTraditional = layout === "traditional";

  return (
    <motion.div
      whileHover={isTraditional ? hoverLift : hoverScale}
      className={`group relative overflow-hidden rounded-lg ${
        isTraditional
          ? "bg-neutral-900 border border-neutral-800"
          : "bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800"
      }`}
    >
      <Link href={`/projects/${project.slug}`} className="block">
        {project.video ? (
          <div className="relative aspect-video w-full overflow-hidden">
            <video
              src={project.video}
              autoPlay
              loop
              muted
              playsInline
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : project.thumbnail ? (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : null}

        <div className={`p-6 ${isTraditional ? "" : "space-y-3"}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-white/90 transition-colors">
                {project.title}
              </h3>
              <p className="text-sm text-neutral-400 line-clamp-2">
                {project.shortDescription || project.description}
              </p>
            </div>
            {!isTraditional && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1 }}
                className="flex-shrink-0"
              >
                <ExternalLink className="w-5 h-5 text-neutral-400" />
              </motion.div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <Calendar className="w-3 h-3" />
              <span>{project.year}</span>
            </div>

            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="text-xs text-neutral-500">+{project.tags.length - 3}</span>
            )}
          </div>

          {project.client && (
            <p className="text-xs text-neutral-500 mt-2">Client: {project.client}</p>
          )}

          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-neutral-800">
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Visit</span>
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                <Github className="w-3 h-3" />
                <span>Code</span>
              </a>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

