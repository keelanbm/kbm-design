import { notionClient, PROJECTS_DATABASE_ID, isNotionConfigured } from "./client";
import { Project, ProjectLayout, ProjectStatus, ProjectCategory } from "@/lib/types/project";

// Type definitions for Notion API responses
interface NotionRichText {
  plain_text: string;
}

interface NotionProperty {
  type: string;
  title?: NotionRichText[];
  rich_text?: NotionRichText[];
  url?: string | null;
  select?: { name: string } | null;
  multi_select?: { name: string }[];
  checkbox?: boolean;
  date?: { start: string } | null;
  status?: { name: string } | null;
}

interface NotionPage {
  id: string;
  properties: Record<string, NotionProperty>;
}

// Helper to safely extract text from Notion rich text
function getRichText(property: unknown): string {
  if (!property || typeof property !== "object") return "";
  const prop = property as NotionProperty;
  if (prop.type === "rich_text" && Array.isArray(prop.rich_text)) {
    return prop.rich_text.map((t) => t.plain_text).join("");
  }
  return "";
}

// Helper to safely extract title
function getTitle(property: unknown): string {
  if (!property || typeof property !== "object") return "";
  const prop = property as NotionProperty;
  if (prop.type === "title" && Array.isArray(prop.title)) {
    return prop.title.map((t) => t.plain_text).join("");
  }
  return "";
}

// Helper to safely extract URL
function getUrl(property: unknown): string | undefined {
  if (!property || typeof property !== "object") return undefined;
  const prop = property as NotionProperty;
  if (prop.type === "url" && prop.url) {
    return prop.url;
  }
  return undefined;
}

// Helper to safely extract select value
function getSelect(property: unknown): string | undefined {
  if (!property || typeof property !== "object") return undefined;
  const prop = property as NotionProperty;
  if (prop.type === "select" && prop.select) {
    return prop.select.name;
  }
  return undefined;
}

// Helper to safely extract multi-select values
function getMultiSelect(property: unknown): string[] {
  if (!property || typeof property !== "object") return [];
  const prop = property as NotionProperty;
  if (prop.type === "multi_select" && Array.isArray(prop.multi_select)) {
    return prop.multi_select.map((s) => s.name);
  }
  return [];
}

// Helper to safely extract checkbox
function getCheckbox(property: unknown): boolean {
  if (!property || typeof property !== "object") return false;
  const prop = property as NotionProperty;
  if (prop.type === "checkbox") {
    return prop.checkbox ?? false;
  }
  return false;
}

// Helper to safely extract date
function getDate(property: unknown): string | undefined {
  if (!property || typeof property !== "object") return undefined;
  const prop = property as NotionProperty;
  if (prop.type === "date" && prop.date?.start) {
    return prop.date.start;
  }
  return undefined;
}

// Helper to safely extract status
function getStatus(property: unknown): string | undefined {
  if (!property || typeof property !== "object") return undefined;
  const prop = property as NotionProperty;
  if (prop.type === "status" && prop.status) {
    return prop.status.name;
  }
  return undefined;
}

// Map Notion layout names to our schema (handle case differences)
function normalizeLayout(layout: string | undefined): ProjectLayout {
  if (!layout) return "traditional";
  const normalized = layout.toLowerCase().replace(/\s+/g, "-");
  const validLayouts: ProjectLayout[] = ["traditional", "adventurous", "product-demo", "text-heavy", "custom"];
  return validLayouts.includes(normalized as ProjectLayout) 
    ? (normalized as ProjectLayout) 
    : "traditional";
}

// Map Notion status names to our schema
function normalizeStatus(status: string | undefined): ProjectStatus {
  if (!status) return "published";
  const normalized = status.toLowerCase().replace(/\s+/g, "-");
  const statusMap: Record<string, ProjectStatus> = {
    "draft": "draft",
    "in-progress": "in-progress",
    "in progress": "in-progress",
    "published": "published",
    "live": "published",
    "archived": "archived",
  };
  return statusMap[normalized] || "published";
}

// Map Notion category names to our schema
function normalizeCategory(category: string | undefined): ProjectCategory {
  if (!category) return "other";
  const normalized = category.toLowerCase().replace(/\s+/g, "-");
  const validCategories: ProjectCategory[] = [
    "ux-research", "animation", "vibe-coded", "mcp-tool", "web-app", "design-system", "other"
  ];
  return validCategories.includes(normalized as ProjectCategory)
    ? (normalized as ProjectCategory)
    : "other";
}

// Parse gallery URLs from comma-separated string
function parseGalleryUrls(urlString: string | undefined): string[] {
  if (!urlString) return [];
  return urlString
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
}

// Extract year from date string
function getYearFromDate(dateString: string | undefined): number | undefined {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? undefined : date.getFullYear();
}

/**
 * Convert a Notion page to our Project type
 */
function notionPageToProject(page: NotionPage): Project {
  const props = page.properties;
  
  const startDate = getDate(props["Start Date"]);
  const galleryUrlsRaw = getUrl(props["Gallery URLs (comma sep...)"]) || getRichText(props["Gallery URLs (comma sep...)"]);
  
  return {
    // Core fields
    slug: getRichText(props["Slug (deep-research-ux)"]) || page.id,
    title: getTitle(props["Name"]) || "Untitled",
    shortDescription: getRichText(props["Short Description"]),
    description: getRichText(props["Page Content"]),
    
    // Categorization
    category: normalizeCategory(getSelect(props["Category (ux-research, a...)"])),
    tags: getMultiSelect(props["Tags (MCP, Interactive, Ex...)"]),
    
    // Dates
    startDate,
    year: getYearFromDate(startDate),
    
    // Client
    client: getSelect(props["Client"]) || getRichText(props["Client"]),
    
    // Display settings
    featured: getCheckbox(props["Featured"]),
    layout: normalizeLayout(getSelect(props["Layout"])),
    status: normalizeStatus(getStatus(props["Status"])),
    
    // Media URLs
    thumbnail: getUrl(props["Thumbnail (cloudinary url)"]),
    video: getUrl(props["Video URL (gif/mp4)"]),
    gallery: parseGalleryUrls(galleryUrlsRaw),
    
    // Links
    projectUrl: getUrl(props["Project URL"]),
    github: getUrl(props["Github"]),
  };
}

/**
 * Fetch all projects from Notion database
 * Uses dataSources.query in Notion SDK v5
 * Only returns published projects by default
 */
export async function fetchProjectsFromNotion(
  options: { includeUnpublished?: boolean } = {}
): Promise<Project[]> {
  if (!isNotionConfigured()) {
    console.warn("Notion is not configured. Using fallback data.");
    return [];
  }

  try {
    const response = await notionClient.dataSources.query({
      data_source_id: PROJECTS_DATABASE_ID,
      sorts: [
        {
          property: "Start Date",
          direction: "descending",
        },
      ],
    });

    const projects = (response.results as unknown as NotionPage[])
      .filter((page) => "properties" in page)
      .map(notionPageToProject)
      .filter((project: Project) => {
        // Filter out drafts unless explicitly included
        if (!options.includeUnpublished && project.status !== "published") {
          return false;
        }
        return true;
      });

    return projects;
  } catch (error) {
    console.error("Error fetching projects from Notion:", error);
    return [];
  }
}

/**
 * Fetch a single project by slug
 */
export async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  if (!isNotionConfigured()) {
    console.warn("Notion is not configured.");
    return null;
  }

  try {
    const response = await notionClient.dataSources.query({
      data_source_id: PROJECTS_DATABASE_ID,
      filter: {
        property: "Slug (deep-research-ux)",
        rich_text: {
          equals: slug,
        },
      },
    });

    const page = (response.results as unknown as NotionPage[]).find((p) => "properties" in p);
    if (!page) return null;

    return notionPageToProject(page);
  } catch (error) {
    console.error(`Error fetching project ${slug} from Notion:`, error);
    return null;
  }
}

/**
 * Fetch featured projects only
 */
export async function fetchFeaturedProjects(): Promise<Project[]> {
  if (!isNotionConfigured()) {
    console.warn("Notion is not configured.");
    return [];
  }

  try {
    const response = await notionClient.dataSources.query({
      data_source_id: PROJECTS_DATABASE_ID,
      filter: {
        and: [
          {
            property: "Featured",
            checkbox: {
              equals: true,
            },
          },
          {
            property: "Status",
            status: {
              equals: "Published",
            },
          },
        ],
      },
      sorts: [
        {
          property: "Start Date",
          direction: "descending",
        },
      ],
    });

    return (response.results as unknown as NotionPage[])
      .filter((page) => "properties" in page)
      .map(notionPageToProject);
  } catch (error) {
    console.error("Error fetching featured projects from Notion:", error);
    return [];
  }
}
