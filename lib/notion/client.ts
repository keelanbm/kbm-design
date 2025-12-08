import { Client } from "@notionhq/client";

// Initialize the Notion client
// The token is read from NOTION_TOKEN environment variable
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export const notionClient = notion;

// Database ID from environment
export const PROJECTS_DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

// Check if Notion is configured
export function isNotionConfigured(): boolean {
  return !!(process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID);
}

