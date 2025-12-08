"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Grid3x3, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

type LayoutType = "traditional" | "adventurous";

interface LayoutToggleProps {
  onLayoutChange?: (layout: LayoutType) => void;
  defaultLayout?: LayoutType;
}

export function LayoutToggle({
  onLayoutChange,
  defaultLayout = "traditional",
}: LayoutToggleProps) {
  const [layout, setLayout] = useState<LayoutType>(defaultLayout);

  useEffect(() => {
    // Load preference from localStorage
    const saved = localStorage.getItem("portfolio-layout") as LayoutType | null;
    if (saved && (saved === "traditional" || saved === "adventurous")) {
      setLayout(saved);
    }
  }, []);

  const handleToggle = (newLayout: LayoutType) => {
    setLayout(newLayout);
    localStorage.setItem("portfolio-layout", newLayout);
    onLayoutChange?.(newLayout);
  };

  return (
    <div className="flex items-center gap-2 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
      <button
        onClick={() => handleToggle("traditional")}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          layout === "traditional"
            ? "bg-white text-black"
            : "text-neutral-400 hover:text-white"
        )}
        aria-label="Traditional layout"
      >
        <Grid3x3 className="w-4 h-4" />
        <span className="hidden sm:inline">Traditional</span>
      </button>
      <button
        onClick={() => handleToggle("adventurous")}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          layout === "adventurous"
            ? "bg-white text-black"
            : "text-neutral-400 hover:text-white"
        )}
        aria-label="Adventurous layout"
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline">Adventurous</span>
      </button>
    </div>
  );
}



