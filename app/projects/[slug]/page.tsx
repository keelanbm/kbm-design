import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects } from "@/lib/data/projects";
import { ProjectHero } from "@/components/portfolio/ProjectHero";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <ProjectHero project={project} />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">About</h2>
            <p className="text-neutral-300 leading-relaxed">{project.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Details</h3>
              <ul className="space-y-2 text-neutral-300">
                {project.year && (
                  <li>
                    <strong>Year:</strong> {project.year}
                  </li>
                )}
                <li>
                  <strong>Category:</strong> {project.category}
                </li>
                {project.client && (
                  <li>
                    <strong>Client:</strong> {project.client}
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {(project.projectUrl || project.github) && (
            <div className="flex items-center gap-4 pt-8 border-t border-neutral-800">
              {project.projectUrl && (
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visit Project</span>
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors border border-neutral-700"
                >
                  <Github className="w-4 h-4" />
                  <span>View Code</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
