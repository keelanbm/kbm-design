"use client";

import { useEffect, useState } from "react";
import { getProjects } from "@/lib/data/projects";
import { Project } from "@/lib/types/project";

export default function TestNotionPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        setError(null);
        const fetchedProjects = await getProjects();
        setProjects(fetchedProjects);
      } catch (err: any) {
        setError(err.message || "Failed to load projects");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Notion Connection Test</h1>

        {loading && (
          <div className="text-neutral-400">Loading projects from Notion...</div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-4">
            <h2 className="text-red-400 font-bold mb-2">❌ Error</h2>
            <p className="text-red-300">{error}</p>
            <p className="text-sm text-red-400 mt-2">
              Check your .env.local file and make sure:
              <br />• NOTION_TOKEN is set correctly
              <br />• NOTION_DATABASE_ID is set correctly
              <br />• Your integration has access to the database
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-8">
              <h2 className="text-green-400 font-bold mb-2">✅ Success!</h2>
              <p className="text-green-300">
                Connected to Notion and loaded {projects.length} project(s)
              </p>
            </div>

            {projects.length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">Projects Found:</h2>
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.slug}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg p-4"
                    >
                      <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                      <p className="text-neutral-400 text-sm mb-2">
                        Slug: {project.slug}
                      </p>
                      {project.shortDescription && (
                        <p className="text-neutral-300">{project.shortDescription}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-neutral-800 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                <p className="text-yellow-300">
                  ⚠️ No projects found. This could mean:
                  <br />• Your database is empty
                  <br />• No projects have "Published" status
                  <br />• The fallback data is being used (Notion not configured)
                </p>
              </div>
            )}
          </>
        )}

        <div className="mt-8 pt-8 border-t border-neutral-800">
          <p className="text-sm text-neutral-500">
            Visit <a href="/" className="text-blue-400 hover:underline">homepage</a> to see
            projects in the grid view.
          </p>
        </div>
      </div>
    </main>
  );
}

