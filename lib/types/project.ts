import { z } from "zod";

/**
 * Project schema for portfolio items
 * Supports various content types: deep research UX, quick animations, vibe-coded sites, MCP tools
 * Data sourced from Notion CMS
 */

export const ProjectCategorySchema = z.enum([
  "ux-research",
  "animation",
  "vibe-coded",
  "mcp-tool",
  "web-app",
  "design-system",
  "other",
]);

export const ProjectTagSchema = z.enum([
  "UX",
  "Research",
  "Animation",
  "WebGL",
  "3D",
  "React",
  "Next.js",
  "TypeScript",
  "Design",
  "Development",
  "Tool",
  "MCP",
  "Interactive",
  "Experimental",
]);

// Updated to match Notion Layout options
export const ProjectLayoutSchema = z.enum([
  "traditional",
  "adventurous",
  "product-demo",
  "text-heavy",
  "custom",
]);

// Status for draft/published workflow
export const ProjectStatusSchema = z.enum([
  "draft",
  "in-progress",
  "published",
  "archived",
]);

export const ProjectSchema = z.object({
  // Core fields
  slug: z.string(),
  title: z.string(),
  shortDescription: z.string().optional(),
  description: z.string().optional(), // Page Content from Notion
  
  // Categorization
  category: ProjectCategorySchema,
  tags: z.array(z.string()), // Made flexible to accept any tag string
  
  // Dates
  startDate: z.string().optional(), // ISO date string from Notion
  year: z.number().optional(), // Derived from startDate
  
  // Client/Company
  client: z.string().optional(),
  
  // Display settings
  featured: z.boolean().default(false),
  layout: ProjectLayoutSchema.default("traditional"),
  status: ProjectStatusSchema.default("published"),
  
  // Media - Cloudinary URLs
  thumbnail: z.string().optional(),
  video: z.string().optional(), // Video/GIF preview URL
  gallery: z.array(z.string()).optional(), // Gallery image URLs
  
  // Links
  projectUrl: z.string().url().optional(), // Live project link
  github: z.string().url().optional(),
  
  // Legacy fields for compatibility
  images: z.array(z.string()).optional(),
  link: z.string().url().optional(),
  content: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type Project = z.infer<typeof ProjectSchema>;
export type ProjectCategory = z.infer<typeof ProjectCategorySchema>;
export type ProjectTag = z.infer<typeof ProjectTagSchema>;
export type ProjectLayout = z.infer<typeof ProjectLayoutSchema>;
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;
