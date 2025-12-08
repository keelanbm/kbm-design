"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Project } from "@/lib/types/project";
import { cn } from "@/lib/utils";

interface ProjectListViewProps {
  projects: Project[];
}

// Group projects by year
function groupProjectsByYear(projects: Project[]): Map<number, Project[]> {
  const grouped = new Map<number, Project[]>();
  
  // Sort projects by year descending (projects without year go to end)
  const sorted = [...projects].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  
  sorted.forEach((project) => {
    const year = project.year ?? 0; // Use 0 for projects without a year
    const yearProjects = grouped.get(year) || [];
    yearProjects.push(project);
    grouped.set(year, yearProjects);
  });
  
  return grouped;
}

interface ProjectRowProps {
  project: Project;
  index: number;
}

function ProjectRow({ project, index }: ProjectRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={`/projects/${project.slug}`}>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative h-[200px] md:h-[240px] border-b border-neutral-800/50 overflow-hidden"
      >
        {/* Background hover effect - similar to globe cards */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-0"
            >
              {project.thumbnail ? (
                <Image
                  src={project.thumbnail}
                  alt=""
                  fill
                  className="object-cover opacity-20 blur-sm"
                  sizes="100vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 to-neutral-800" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center px-6 md:px-16 lg:px-24">
          <div className="flex-1 flex items-center justify-between gap-8">
            {/* Left side - Text content */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <motion.h3
                className="text-xl md:text-2xl lg:text-3xl font-medium text-white mb-3 truncate"
                animate={{ x: isHovered ? 8 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {project.title}
              </motion.h3>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {project.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-full border transition-colors duration-300",
                      isHovered
                        ? "border-neutral-600 text-neutral-300"
                        : "border-neutral-800 text-neutral-500"
                    )}
                  >
                    {tag.toUpperCase()}
                  </span>
                ))}
              </div>

              {/* Description - only show on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className="text-neutral-400 text-sm max-w-xl hidden md:block"
                  >
                    {project.shortDescription || project.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Right side - Thumbnail */}
            <div className="flex-shrink-0 hidden sm:block">
              <motion.div
                className="relative w-[180px] md:w-[240px] h-[120px] md:h-[160px] rounded-lg overflow-hidden border border-neutral-800/50"
                animate={{ 
                  scale: isHovered ? 1.02 : 1,
                  borderColor: isHovered ? "rgba(255,255,255,0.2)" : "rgba(38,38,38,0.5)"
                }}
                transition={{ duration: 0.3 }}
              >
                {project.thumbnail ? (
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500"
                    style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
                    sizes="(max-width: 768px) 180px, 240px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                    <span className="text-neutral-600 text-xs">No preview</span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Client - far right */}
            {project.client && (
              <motion.div
                className="hidden lg:block flex-shrink-0 w-32 text-right"
                animate={{ opacity: isHovered ? 1 : 0.5 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-sm text-neutral-400">{project.client}</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

export function ProjectListView({ projects }: ProjectListViewProps) {
  const groupedProjects = useMemo(() => groupProjectsByYear(projects), [projects]);
  const years = Array.from(groupedProjects.keys()).sort((a, b) => b - a);

  // Calculate total count and project index across all years
  let globalIndex = 0;

  return (
    <div className="min-h-screen bg-black pt-32 pb-40">
      {/* Header */}
      <div className="px-6 md:px-16 lg:px-24 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium text-white">
            All projects
          </h1>
          <p className="text-4xl md:text-5xl lg:text-6xl font-medium text-neutral-600">
            {projects.length} projects
          </p>
        </motion.div>
      </div>

      {/* Project list by year */}
      {years.map((year) => {
        const yearProjects = groupedProjects.get(year) || [];
        
        return (
          <div key={year} className="relative">
            {/* Year label - sticky on left */}
            <div className="absolute left-6 md:left-16 lg:left-24 top-8 z-20">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-sm font-medium text-neutral-500"
              >
                {year}
              </motion.span>
            </div>

            {/* Projects for this year */}
            <div className="ml-0">
              {yearProjects.map((project) => {
                const currentIndex = globalIndex++;
                return (
                  <ProjectRow
                    key={project.slug}
                    project={project}
                    index={currentIndex}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

