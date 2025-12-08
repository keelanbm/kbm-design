"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
];

export function BottomNav() {
  const pathname = usePathname();

  // Determine active tab - default to "Work" for homepage and project pages
  const getActiveTab = () => {
    if (pathname === "/" || pathname.startsWith("/projects")) {
      return "/";
    }
    if (pathname.startsWith("/about")) {
      return "/about";
    }
    if (pathname.startsWith("/blog")) {
      return "/blog";
    }
    return "/";
  };

  const activeTab = getActiveTab();

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-6 md:bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none"
    >
      <div className="flex items-center gap-1 p-1.5 bg-neutral-900/60 backdrop-blur-xl rounded-full border border-neutral-700/30 pointer-events-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={cn(
                  "relative px-6 py-2.5 rounded-full text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "text-black"
                    : "text-neutral-400 hover:text-white"
                )}
                whileHover={{ scale: isActive ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-full"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
