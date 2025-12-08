"use client";

import { motion } from "motion/react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section with Large Text */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl"
        >
          <p className="text-xs tracking-[0.3em] text-neutral-500 mb-8 uppercase">
            • About
          </p>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium leading-[1.1] tracking-tight">
            <span className="text-white">
              Design is about solving problems and creating experiences that matter.
            </span>{" "}
            <span className="text-neutral-500">
              It&apos;s a mindset, a way of working and a set of values that inspire me to challenge the boundaries of what&apos;s possible.
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16"
        >
          <Link href="/projects">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 border border-neutral-700 text-white text-sm font-medium rounded-full hover:bg-white hover:text-black transition-all duration-300"
            >
              View projects
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="px-6 md:px-16 lg:px-24 py-24 border-t border-neutral-900">
        <div className="max-w-6xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-xs tracking-[0.3em] text-neutral-500 mb-12 uppercase"
          >
            • Values
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {[
              {
                title: "Thoughtful",
                description:
                  "Every design decision is intentional. I believe in understanding the problem deeply before jumping to solutions.",
              },
              {
                title: "Collaborative",
                description:
                  "Great work comes from working together. I value open communication and diverse perspectives.",
              },
              {
                title: "Curious",
                description:
                  "Always learning, always exploring. I stay curious about new technologies, techniques, and possibilities.",
              },
              {
                title: "Quality-focused",
                description:
                  "Details matter. From pixel-perfect designs to clean code, I care about the craft.",
              },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <h3 className="text-2xl font-medium text-white mb-4">
                  {value.title}
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="px-6 md:px-16 lg:px-24 py-24 border-t border-neutral-900">
        <div className="max-w-6xl">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-xs tracking-[0.3em] text-neutral-500 mb-12 uppercase"
          >
            • Expertise
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-medium text-white mb-6">Design</h3>
              <ul className="space-y-3 text-neutral-400">
                <li>UX Research & Strategy</li>
                <li>UI Design</li>
                <li>Design Systems</li>
                <li>Motion Design</li>
                <li>Prototyping</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <h3 className="text-lg font-medium text-white mb-6">Development</h3>
              <ul className="space-y-3 text-neutral-400">
                <li>React & Next.js</li>
                <li>TypeScript</li>
                <li>WebGL & Three.js</li>
                <li>Motion Libraries</li>
                <li>CSS & Tailwind</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h3 className="text-lg font-medium text-white mb-6">Tools</h3>
              <ul className="space-y-3 text-neutral-400">
                <li>Figma</li>
                <li>VS Code</li>
                <li>Git & GitHub</li>
                <li>Vercel</li>
                <li>Adobe Suite</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-6 md:px-16 lg:px-24 py-24 border-t border-neutral-900">
        <div className="max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-8"
          >
            <div>
              <p className="text-xs tracking-[0.3em] text-neutral-500 mb-4 uppercase">
                • Get in touch
              </p>
              <p className="text-2xl md:text-3xl text-white">
                Interested in working together?
              </p>
            </div>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white text-black text-sm font-medium rounded-full hover:bg-neutral-200 transition-colors"
              >
                Let&apos;s Talk
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
