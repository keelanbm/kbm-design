"use client";

import { motion } from "motion/react";
import { fadeInUp } from "@/lib/motion";
import Link from "next/link";

export function Footer() {
  return (
    <motion.footer
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="border-t border-neutral-900 bg-black"
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">Portfolio</h3>
            <p className="text-neutral-400 text-sm">
              A professional design portfolio showcasing creative work and projects.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-neutral-400 hover:text-white text-sm transition-colors">
                  Work
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-neutral-400 hover:text-white text-sm transition-colors"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-neutral-400 hover:text-white text-sm transition-colors"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <p className="text-neutral-400 text-sm">
              Built with Next.js, Motion.dev, and React Three Fiber.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-900 text-center text-neutral-500 text-sm">
          <p>© {new Date().getFullYear()} Portfolio. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
}



