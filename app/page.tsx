"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { getProjects } from "@/lib/data/projects";
import { Project } from "@/lib/types/project";
import { ViewToggle, ViewMode } from "@/components/layout/ViewToggle";
import { FilterPanel, FilterButton, FilterState } from "@/components/layout/FilterPanel";
import { ProjectListView } from "@/components/layout/ProjectListView";

const InfiniteGrid = dynamic(
  () => import("@/components/layout/InfiniteGrid").then((mod) => ({ default: mod.InfiniteGrid })),
  {
    ssr: false,
    loading: () => <div className="w-full h-screen bg-black" />,
  }
);

const STORAGE_KEY_VIEW = "portfolio-view-mode";

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    years: [],
    tags: [],
    clients: [],
  });
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load projects and saved view mode
  useEffect(() => {
    setMounted(true);
    
    // Load view mode preference
    const savedView = localStorage.getItem(STORAGE_KEY_VIEW);
    if (savedView === "grid" || savedView === "list") {
      setViewMode(savedView);
    }

    // Fetch projects
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

  // Save view mode to localStorage
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(STORAGE_KEY_VIEW, mode);
  }, []);

  // Filter projects based on current filters
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Year filter
      if (filters.years.length > 0) {
        const projectYear = project.year?.toString() || "";
        if (!filters.years.includes(projectYear)) {
          return false;
        }
      }
      // Tags filter
      if (filters.tags.length > 0 && !project.tags.some((tag) => filters.tags.includes(tag))) {
        return false;
      }
      // Client filter
      if (filters.clients.length > 0 && project.client && !filters.clients.includes(project.client)) {
        return false;
      }
      return true;
    });
  }, [projects, filters]);

  // Count active filters
  const activeFilterCount = filters.years.length + filters.tags.length + filters.clients.length;

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted || isLoading) {
    console.log("Home page: Waiting for mount/load", { mounted, isLoading });
    return (
      <main className="fixed inset-0 bg-black text-white overflow-hidden">
        <div className="w-full h-full" />
      </main>
    );
  }

  console.log("Home page: Rendering with", projects.length, "projects, filtered:", filteredProjects.length, "viewMode:", viewMode);

  return (
    <>
      <main className={viewMode === "grid" ? "fixed inset-0 bg-black text-white overflow-hidden" : "min-h-screen bg-black text-white"}>
        {viewMode === "grid" ? (
          <div className="w-full h-full">
            <InfiniteGrid projects={filteredProjects} />
          </div>
        ) : (
          <ProjectListView projects={filteredProjects} />
        )}
      </main>

      {/* View Toggle - Bottom Left */}
      <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />

      {/* Filter Button - Bottom Right */}
      <FilterButton onClick={() => setIsFilterOpen(true)} activeCount={activeFilterCount} />

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        projects={projects}
      />
    </>
  );
}
