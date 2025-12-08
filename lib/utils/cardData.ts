import type { Project } from "@/lib/types/project";
import type { CardData } from "@/components/layout/infinite-grid/types";

/**
 * Converts a Project to CardData format for use with InfiniteGrid
 * @param project - The project to convert
 * @returns CardData object matching the InfiniteGrid requirements
 */
export function convertProjectToCardData(project: Project): CardData {
  return {
    title: project.title,
    image: project.thumbnail,
    tags: project.tags,
    date: project.year?.toString() ?? "",
    badge: project.featured ? "Featured" : "",
    description: project.description,
    shortDescription: project.shortDescription,
    client: project.client,
    // Logo would need to be added to Project type or derived from client name
    // For now, we'll leave it undefined and can add it later
  };
}

/**
 * Converts an array of Projects to CardData format
 * @param projects - Array of projects to convert
 * @returns Array of CardData objects
 */
export function convertProjectsToCardData(projects: Project[]): CardData[] {
  return projects.map(convertProjectToCardData);
}


