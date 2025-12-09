"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { MusicToggle } from "./MusicToggle";
import { Linkedin, Twitter, ExternalLink } from "lucide-react";

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
        <div className="flex items-center justify-between px-6 py-4 md:px-10 md:py-5 gap-4 md:gap-8">
          {/* Left - Logo + Sound Toggle */}
          <div className="flex items-center gap-4 md:gap-6 pointer-events-auto">
            <Link
              href="/"
              aria-label="Go to homepage"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 relative"
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
            <MusicToggle />
          </div>

          {/* Center - Bio + Social Links as separate columns (hidden on mobile) */}
          <div className="hidden lg:flex items-start justify-between pointer-events-none flex-1 px-12">
            {/* Bio Column - left-aligned */}
            <div className="flex flex-col items-start gap-0.5">
              <p className="text-[11px] tracking-[0.2em] text-white/70 font-medium uppercase leading-tight">
                Product Designer & Developer
              </p>
              <p className="text-[11px] tracking-[0.2em] text-white/70 font-medium uppercase leading-tight">
                Ex Pinterest, Ex Meta
              </p>
            </div>

            {/* Links Column - left-aligned with icons */}
            <div className="flex flex-col items-start gap-1 text-xs text-white/50 pointer-events-auto">
              <a
                href="https://quickscope.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Quickscope: <span className="text-white/70">quickscope.gg</span></span>
              </a>
              <a
                href="https://x.com/0xkeelo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Twitter className="w-3.5 h-3.5" />
                <span>Twitter: <span className="text-white/70">0xkeelo</span></span>
              </a>
              <a
                href="https://www.linkedin.com/in/keelanbm/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn: <span className="text-white/70">keelanbm</span></span>
              </a>
            </div>
          </div>

          {/* Right - Let's Talk Button */}
          <Link
            href="/contact"
            className="pointer-events-auto"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded-full hover:bg-white/90 transition-colors"
            >
              Let&apos;s Talk
            </motion.button>
          </Link>
        </div>
      </motion.header>
    </>
  );
}
