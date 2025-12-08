"use client";

import { useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Project } from "@/lib/types/project";
import { cn } from "@/lib/utils";

export interface FilterState {
  years: string[];
  tags: string[];
  clients: string[];
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  projects: Project[];
}

export function FilterPanel({ isOpen, onClose, filters, onFiltersChange, projects }: FilterPanelProps) {
  // Derive unique filter values from projects
  const years = useMemo(() => {
    const yearSet = new Set<string>();
    projects.forEach((p) => {
      if (p.year) yearSet.add(p.year.toString());
    });
    return Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a));
  }, [projects]);

  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    projects.forEach((p) => {
      p.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [projects]);

  const clients = useMemo(() => {
    const clientSet = new Set<string>();
    projects.forEach((p) => {
      if (p.client) clientSet.add(p.client);
    });
    return Array.from(clientSet).sort();
  }, [projects]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const toggleFilter = useCallback(
    (category: keyof FilterState, value: string) => {
      const currentValues = filters[category];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      
      onFiltersChange({
        ...filters,
        [category]: newValues,
      });
    },
    [filters, onFiltersChange]
  );

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      years: [],
      tags: [],
      clients: [],
    });
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.years.length > 0 ||
    filters.tags.length > 0 ||
    filters.clients.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-neutral-950/95 backdrop-blur-xl border-l border-neutral-800/50 z-[70] overflow-y-auto"
          >
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs tracking-[0.3em] text-neutral-500 uppercase">
                  Filter by Zone
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-neutral-400 hover:text-white transition-colors rounded-full hover:bg-neutral-800/50"
                  aria-label="Close filter panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Heading */}
              <div className="mb-12">
                <h3 className="text-4xl md:text-5xl font-medium leading-tight">
                  <span className="text-white">All</span>{" "}
                  <span className="text-neutral-500">Experience,</span>
                  <br />
                  <span className="text-neutral-500">Product,</span>
                  <br />
                  <span className="text-neutral-500">Communication</span>
                </h3>
              </div>

              {/* Filter Sections */}
              <div className="space-y-10">
                {/* Year Filter */}
                {years.length > 0 && (
                  <div>
                    <h4 className="text-xs tracking-[0.2em] text-neutral-500 uppercase mb-4">
                      Year
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {years.map((year) => (
                        <button
                          key={year}
                          onClick={() => toggleFilter("years", year)}
                          className={cn(
                            "px-4 py-2 text-sm rounded-full border transition-all duration-200",
                            filters.years.includes(year)
                              ? "bg-white text-black border-white"
                              : "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white"
                          )}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags Filter */}
                {tags.length > 0 && (
                  <div>
                    <h4 className="text-xs tracking-[0.2em] text-neutral-500 uppercase mb-4">
                      Feature
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleFilter("tags", tag)}
                          className={cn(
                            "px-4 py-2 text-sm rounded-full border transition-all duration-200",
                            filters.tags.includes(tag)
                              ? "bg-white text-black border-white"
                              : "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white"
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Client Filter */}
                {clients.length > 0 && (
                  <div>
                    <h4 className="text-xs tracking-[0.2em] text-neutral-500 uppercase mb-4">
                      Partner
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {clients.map((client) => (
                        <button
                          key={client}
                          onClick={() => toggleFilter("clients", client)}
                          className={cn(
                            "px-4 py-2 text-sm rounded-full border transition-all duration-200",
                            filters.clients.includes(client)
                              ? "bg-white text-black border-white"
                              : "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white"
                          )}
                        >
                          {client}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 pt-8 border-t border-neutral-800"
                >
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-neutral-400 hover:text-white transition-colors underline underline-offset-4"
                  >
                    Clear all filters
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Filter button component to trigger the panel
interface FilterButtonProps {
  onClick: () => void;
  activeCount?: number;
}

export function FilterButton({ onClick, activeCount = 0 }: FilterButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="fixed bottom-6 md:bottom-8 right-6 md:right-10 z-50 flex items-center gap-2 px-5 py-3 bg-neutral-900/60 backdrop-blur-xl rounded-full border border-neutral-700/30 text-neutral-300 hover:text-white transition-colors"
    >
      <span className="text-sm font-medium">Filter</span>
      {activeCount > 0 && (
        <span className="w-5 h-5 flex items-center justify-center bg-white text-black text-xs font-medium rounded-full">
          {activeCount}
        </span>
      )}
    </motion.button>
  );
}
