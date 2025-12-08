"use client";

import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { InfiniteGridClass } from "./infinite-grid/InfiniteGridClass";
import type { CardData, InfiniteGridOptions } from "./infinite-grid/types";
import { convertProjectsToCardData } from "@/lib/utils/cardData";
import type { Project } from "@/lib/types/project";

interface InfiniteGridProps {
  projects: Project[];
  options?: Partial<InfiniteGridOptions>;
  onTilesLoaded?: () => void;
}

/**
 * React wrapper component for InfiniteGridClass
 * Converts Vue component lifecycle to React hooks
 */
export function InfiniteGrid({ projects, options, onTilesLoaded }: InfiniteGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridInstanceRef = useRef<InfiniteGridClass | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Convert projects to cardData format (memoized)
  const cardData: CardData[] = useMemo(() => convertProjectsToCardData(projects), [projects]);

  // Define default options matching Vue component
  const defaultOptions: InfiniteGridOptions = useMemo(
    () => ({
      gridCols: 5, // Increased from 4 to fit more cards horizontally
      gridRows: 4,
      gridGap: 0,
      tileWidth: 4.5, // Square width
      tileHeight: 4.5, // 1:1 aspect ratio (square cards)
      tileSize: 4.5, // Backward compatibility
      baseCameraZ: 16, // Zoomed in to show ~4.5 cards horizontally and ~2.5 cards vertically
      enablePostProcessing: true,
      postProcessParams: {
        distortionIntensity: -0.05, // Start distorted
        vignetteOffset: 0.9, // Start full vignette
        vignetteDarkness: 1.2, // Start dark
      },
    }),
    [],
  );

  // Merge default options with passed options (memoized)
  const mergedOptions: InfiniteGridOptions = useMemo(
    () => ({
      ...defaultOptions,
      ...options,
      postProcessParams: {
        ...defaultOptions.postProcessParams,
        ...options?.postProcessParams,
        // Override specific params for better clarity if not provided
        vignetteOffset: options?.postProcessParams?.vignetteOffset ?? 0.9, // Lighter default
        vignetteDarkness: options?.postProcessParams?.vignetteDarkness ?? 1.2, // Lighter default
      },
    }),
    [defaultOptions, options],
  );

  // Handle tile clicked event (memoized)
  const handleTileClicked = useCallback(
    (event: Event) => {
      const customEvent = event as CustomEvent<{ cardData: CardData }>;
      // Find project by title matching
      const clickedProject = projects.find((p) => p.title === customEvent.detail.cardData.title);
      if (clickedProject) {
        router.push(`/projects/${clickedProject.slug}`);
      }
    },
    [projects, router],
  );

  const isInitialMountRef = useRef(true);

  // Initialize grid and watch for changes (equivalent to Vue's onMounted + watch)
  useEffect(() => {
    if (!containerRef.current) return;

    const initializeGrid = async () => {
      try {
        if (!containerRef.current) {
          console.error("Container ref is null");
          return;
        }

        if (cardData.length === 0) {
          console.warn("No card data provided to InfiniteGrid");
          return;
        }

        // Dispose old instance if it exists (for updates)
        if (gridInstanceRef.current) {
          gridInstanceRef.current.dispose();
          gridInstanceRef.current = null;
        }

        console.log("Initializing InfiniteGrid with", cardData.length, "cards");

        // Create new instance
        gridInstanceRef.current = new InfiniteGridClass(
          containerRef.current,
          cardData,
          mergedOptions,
        );

        await gridInstanceRef.current.init();

        console.log("InfiniteGrid initialized successfully");
        setIsInitialized(true);

        // Call onTilesLoaded callback only on initial mount
        if (isInitialMountRef.current) {
          onTilesLoaded?.();
          isInitialMountRef.current = false;
        }

        // Add event listener for tileClicked
        containerRef.current.addEventListener("tileClicked", handleTileClicked);
      } catch (error) {
        console.error("Failed to initialize InfiniteGrid:", error);
        console.error("Error details:", error instanceof Error ? error.stack : error);
      }
    };

    initializeGrid();

    // Cleanup (equivalent to Vue's onBeforeUnmount)
    const container = containerRef.current;
    return () => {
      if (gridInstanceRef.current) {
        if (container) {
          container.removeEventListener("tileClicked", handleTileClicked);
        }
        gridInstanceRef.current.dispose();
        gridInstanceRef.current = null;
      }
    };
  }, [cardData, mergedOptions, handleTileClicked, onTilesLoaded]); // Watch cardData and options

  return (
    <div
      ref={containerRef}
      className="infinite-grid-container"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        margin: 0,
        padding: 0,
        overflow: "visible",
        background: "#000",
      }}
    >
      {/* Canvas will be appended here by InfiniteGridClass */}
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center text-white/50 pointer-events-none">
          Loading grid...
        </div>
      )}
    </div>
  );
}
