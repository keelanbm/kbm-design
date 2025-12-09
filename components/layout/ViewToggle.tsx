"use client";

import { motion } from "motion/react";
import { Grid3X3, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-6 md:bottom-8 left-6 md:left-10 z-50"
    >
      <div className="flex items-center gap-1 p-1 bg-neutral-900/60 backdrop-blur-xl rounded-full border border-neutral-700/30">
        <motion.button
          onClick={() => onViewModeChange("grid")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "p-2.5 rounded-full transition-colors duration-200",
            viewMode === "grid"
              ? "bg-white text-black"
              : "text-neutral-400 hover:text-white"
          )}
          aria-label="Grid view"
        >
          <Grid3X3 className="w-4 h-4" />
        </motion.button>
        
        <motion.button
          onClick={() => onViewModeChange("list")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "p-2.5 rounded-full transition-colors duration-200",
            viewMode === "list"
              ? "bg-white text-black"
              : "text-neutral-400 hover:text-white"
          )}
          aria-label="List view"
        >
          <List className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}


