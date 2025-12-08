"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { MusicToggle } from "./MusicToggle";

export function Header() {
  return (
    <>
      {/* Top gradient overlay for text readability */}
      <div 
        className="fixed top-0 left-0 right-0 h-32 md:h-40 z-40 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
        }}
      />
      
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      >
        <div className="flex items-start justify-between px-6 py-6 md:px-10 md:py-8">
          {/* Logo - Left */}
          <Link 
            href="/" 
            className="pointer-events-auto"
            aria-label="Go to homepage"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-14 md:w-14 md:h-16 relative"
            >
              {/* Simple ghost/phantom-style logo placeholder */}
              <svg
                viewBox="0 0 50 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <path
                  d="M25 2C12.85 2 3 11.85 3 24v28c0 2 1.5 4 3.5 4s3-1 3-3v-6c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5v6c0 2 1.5 3 3.5 3s3.5-2 3.5-4v-6c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5v6c0 2 1.5 4 3.5 4s3-1 3-3v-6c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5v6c0 2 1.5 3 3.5 3s3.5-2 3.5-4V24C47 11.85 37.15 2 25 2Z"
                  stroke="white"
                  strokeWidth="3"
                  fill="none"
                />
                <circle cx="17" cy="22" r="3" fill="white" />
                <circle cx="33" cy="22" r="3" fill="white" />
              </svg>
            </motion.div>
          </Link>

          {/* Center - Music Toggle + Tagline (hidden on mobile) */}
          <div className="hidden md:flex flex-col items-center gap-3 text-center max-w-md">
            <MusicToggle />
            <p className="text-[10px] md:text-[11px] tracking-[0.2em] text-white/70 font-medium uppercase leading-relaxed pointer-events-none hidden lg:block">
              A DESIGN PORTFOLIO SHOWCASING
              <br />
              CREATIVE WORK AND PROJECTS.
            </p>
          </div>

          {/* Right - Let's Talk Button */}
          <Link
            href="/contact"
            className="pointer-events-auto"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-white text-black text-sm font-medium rounded-full hover:bg-white/90 transition-colors"
            >
              Let&apos;s Talk
            </motion.button>
          </Link>
        </div>
      </motion.header>
    </>
  );
}
