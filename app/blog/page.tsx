"use client";

import { motion } from "motion/react";
import Link from "next/link";

// Placeholder blog posts - these would come from a CMS or data file in production
const blogPosts = [
  {
    id: "1",
    title: "Building an Infinite Grid with OGL and React",
    category: "Development",
    date: "2024",
    excerpt: "Exploring WebGL rendering techniques for creating immersive portfolio experiences.",
  },
  {
    id: "2", 
    title: "The Art of Motion Design in Web Interfaces",
    category: "Design",
    date: "2024",
    excerpt: "How thoughtful animations can elevate user experience and brand perception.",
  },
  {
    id: "3",
    title: "Design Systems That Scale",
    category: "Design",
    date: "2024",
    excerpt: "Building flexible, maintainable design systems for growing products.",
  },
  {
    id: "4",
    title: "From Figma to Code: Bridging the Gap",
    category: "Process",
    date: "2024",
    excerpt: "Strategies for better designer-developer collaboration.",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="min-h-[70vh] flex flex-col justify-center px-6 md:px-16 lg:px-24 py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl"
        >
          <p className="text-xs tracking-[0.3em] text-neutral-500 mb-8 uppercase">
            • Blog
          </p>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium leading-[1.1] tracking-tight">
            <span className="text-white">
              Thoughts on design, development, and the creative process.
            </span>{" "}
            <span className="text-neutral-500">
              Exploring ideas and sharing learnings from projects and experiments.
            </span>
          </h1>
        </motion.div>
      </section>

      {/* Blog Posts List */}
      <section className="px-6 md:px-16 lg:px-24 py-16 border-t border-neutral-900">
        <div className="max-w-6xl">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs tracking-[0.3em] text-neutral-500 mb-12 uppercase"
          >
            • Recent Posts
          </motion.p>

          <div className="space-y-0">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group border-b border-neutral-900 py-8 first:pt-0"
              >
                <Link href={`/blog/${post.id}`} className="block">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-xs tracking-[0.2em] text-neutral-500 uppercase">
                          {post.category}
                        </span>
                        <span className="text-xs text-neutral-600">
                          {post.date}
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-medium text-white group-hover:text-neutral-300 transition-colors">
                        {post.title}
                      </h2>
                      <p className="mt-3 text-neutral-500 max-w-2xl">
                        {post.excerpt}
                      </p>
                    </div>
                    <motion.div
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ x: 4 }}
                    >
                      <span className="text-neutral-400 text-2xl">→</span>
                    </motion.div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Note */}
      <section className="px-6 md:px-16 lg:px-24 py-24 border-t border-neutral-900">
        <div className="max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-neutral-500 mb-6">
              More posts coming soon. In the meantime...
            </p>
            <Link href="/projects">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 border border-neutral-700 text-white text-sm font-medium rounded-full hover:bg-white hover:text-black transition-all duration-300"
              >
                View my work
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer spacer for bottom nav */}
      <div className="h-32" />
    </main>
  );
}


