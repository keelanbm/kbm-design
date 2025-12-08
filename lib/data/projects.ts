import { Project } from "@/lib/types/project";
import { 
  fetchProjectsFromNotion, 
  fetchProjectBySlug as fetchFromNotion,
  fetchFeaturedProjects as fetchFeaturedFromNotion 
} from "@/lib/notion/projects";
import { isNotionConfigured } from "@/lib/notion/client";

/**
 * Fallback project data for when Notion is not configured
 * This allows the site to work during development without Notion setup
 */
const fallbackProjects: Project[] = [
  {
    slug: "deep-research-ux",
    title: "Deep Research UX Project",
    description:
      "A comprehensive UX research project exploring user behavior and interaction patterns in modern web applications.",
    shortDescription: "Comprehensive UX research exploring user behavior patterns",
    category: "ux-research",
    tags: ["UX", "Research", "Design"],
    year: 2024,
    client: "Tech Corp",
    featured: true,
    layout: "traditional",
    status: "published",
    thumbnail: "/images/thumbnails/Discover.png",
  },
  {
    slug: "quick-animation-demo",
    title: "Quick Animation Demo",
    description:
      "A collection of smooth, performant animations showcasing Motion.dev capabilities and creative motion design.",
    shortDescription: "Showcase of smooth, performant animations",
    category: "animation",
    tags: ["Animation", "Interactive", "React"],
    year: 2024,
    featured: true,
    layout: "adventurous",
    status: "published",
    thumbnail: "/images/thumbnails/Wallt Tracking.png",
  },
  {
    slug: "vibe-coded-site",
    title: "Vibe Coded Site",
    description:
      "An experimental website with unique interactions, creative layouts, and a focus on user experience and aesthetics.",
    shortDescription: "Experimental website with unique interactions",
    category: "vibe-coded",
    tags: ["WebGL", "3D", "Interactive", "Experimental"],
    year: 2024,
    featured: false,
    layout: "adventurous",
    status: "published",
    thumbnail: "/images/thumbnails/Portfolio.png",
  },
  {
    slug: "mcp-tool",
    title: "MCP Tool",
    description:
      "A powerful tool built with Model Context Protocol, enabling seamless integration and enhanced developer workflows.",
    shortDescription: "Powerful tool built with Model Context Protocol",
    category: "mcp-tool",
    tags: ["Tool", "MCP", "Development", "TypeScript"],
    year: 2024,
    featured: false,
    layout: "traditional",
    status: "published",
    thumbnail: "/images/thumbnails/Scope.png",
  },
  {
    slug: "design-system",
    title: "Design System",
    description:
      "A comprehensive design system with reusable components, consistent patterns, and detailed documentation.",
    shortDescription: "Comprehensive design system with reusable components",
    category: "design-system",
    tags: ["Design", "React", "Next.js"],
    year: 2023,
    featured: false,
    layout: "traditional",
    status: "published",
    thumbnail: "/images/thumbnails/Template.png",
  },
  {
    slug: "web-app",
    title: "Modern Web App",
    description:
      "A full-stack web application built with Next.js, featuring modern UI/UX and optimal performance.",
    shortDescription: "Full-stack web application with modern UI/UX",
    category: "web-app",
    tags: ["Next.js", "TypeScript", "React", "Development"],
    year: 2023,
    featured: false,
    layout: "adventurous",
    status: "published",
    thumbnail: "/images/thumbnails/Discover.png",
  },
];

// Cache for projects to avoid refetching
let projectsCache: Project[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute cache

/**
 * Get all projects - fetches from Notion if configured, otherwise uses fallback
 * Results are cached for performance
 */
export async function getProjects(): Promise<Project[]> {
  // Check cache
  const now = Date.now();
  if (projectsCache && now - cacheTimestamp < CACHE_DURATION) {
    return projectsCache;
  }

  // Try to fetch from Notion
  if (isNotionConfigured()) {
    try {
      const notionProjects = await fetchProjectsFromNotion();
      if (notionProjects.length > 0) {
        projectsCache = notionProjects;
        cacheTimestamp = now;
        return notionProjects;
      }
    } catch (error) {
      console.error("Failed to fetch from Notion, using fallback:", error);
    }
  }

  // Use fallback data
  projectsCache = fallbackProjects;
  cacheTimestamp = now;
  return fallbackProjects;
}

/**
 * Synchronous access to projects (for components that can't be async)
 * Uses cached data or fallback
 */
export const projects: Project[] = fallbackProjects;

/**
 * Get a project by its slug
 */
export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  // Try Notion first
  if (isNotionConfigured()) {
    try {
      const project = await fetchFromNotion(slug);
      if (project) return project;
    } catch (error) {
      console.error(`Failed to fetch project ${slug} from Notion:`, error);
    }
  }

  // Fall back to local data
  return fallbackProjects.find((project) => project.slug === slug);
}

/**
 * Get projects by category
 */
export async function getProjectsByCategory(category: string): Promise<Project[]> {
  const allProjects = await getProjects();
  return allProjects.filter((project) => project.category === category);
}

/**
 * Get featured projects
 */
export async function getFeaturedProjects(): Promise<Project[]> {
  // Try Notion first
  if (isNotionConfigured()) {
    try {
      const featured = await fetchFeaturedFromNotion();
      if (featured.length > 0) return featured;
    } catch (error) {
      console.error("Failed to fetch featured projects from Notion:", error);
    }
  }

  // Fall back to local data
  return fallbackProjects.filter((project) => project.featured);
}

/**
 * Invalidate the cache (useful after updates)
 */
export function invalidateProjectsCache(): void {
  projectsCache = null;
  cacheTimestamp = 0;
}
