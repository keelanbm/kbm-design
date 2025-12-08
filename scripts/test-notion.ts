/**
 * Test script to verify Notion API connection
 * Run with: npx tsx scripts/test-notion.ts
 */

import { Client } from "@notionhq/client";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

async function testNotionConnection() {
  console.log("🔍 Testing Notion Connection...\n");

  // Check if env vars are set
  if (!NOTION_TOKEN) {
    console.error("❌ NOTION_TOKEN not found in .env.local");
    console.log("   Please add your Notion integration token to .env.local");
    process.exit(1);
  }

  if (!NOTION_DATABASE_ID) {
    console.error("❌ NOTION_DATABASE_ID not found in .env.local");
    console.log("   Please add your database ID to .env.local");
    process.exit(1);
  }

  console.log("✅ Environment variables found");
  console.log(`   Token: ${NOTION_TOKEN.substring(0, 20)}...`);
  console.log(`   Database ID: ${NOTION_DATABASE_ID}\n`);

  try {
    // Initialize Notion client
    const notion = new Client({
      auth: NOTION_TOKEN,
    });

    console.log("🔄 Testing database connection...");

    // Try to retrieve the database
    const database = await notion.databases.retrieve({
      database_id: NOTION_DATABASE_ID,
    });

    console.log("✅ Successfully connected to Notion!");
    console.log(`   Database: "${database.title?.[0]?.plain_text || "Untitled"}"\n`);

    // Try to query for pages
    console.log("🔄 Testing database query...");

    const response = await notion.dataSources.query({
      data_source_id: NOTION_DATABASE_ID,
      sorts: [
        {
          property: "Start Date",
          direction: "descending",
        },
      ],
    });

    console.log(`✅ Found ${response.results.length} pages in database\n`);

    // Show first page properties (if any)
    if (response.results.length > 0) {
      const firstPage = response.results[0] as any;
      if (firstPage.properties) {
        console.log("📋 Sample page properties:");
        Object.keys(firstPage.properties).slice(0, 5).forEach((key) => {
          console.log(`   - ${key}`);
        });
      }
    }

    console.log("\n🎉 Notion integration is working correctly!");
  } catch (error: any) {
    console.error("\n❌ Error connecting to Notion:");
    
    if (error.code === "unauthorized") {
      console.error("   Authentication failed. Check your NOTION_TOKEN.");
      console.error("   Make sure you copied the full token including 'secret_' or 'ntn_' prefix.");
    } else if (error.code === "object_not_found") {
      console.error("   Database not found. Check your NOTION_DATABASE_ID.");
      console.error("   Make sure:");
      console.error("   1. The database exists");
      console.error("   2. The integration has access to the database");
      console.error("   3. You copied the correct ID from the database URL");
    } else if (error.message?.includes("data_source_id")) {
      console.error("   Database ID format might be incorrect.");
      console.error("   The ID should be from your database URL, not the integration URL.");
    } else {
      console.error(`   ${error.message || error}`);
    }
    
    console.error("\nFull error:", error);
    process.exit(1);
  }
}

testNotionConnection();

