"use client";

import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { pageTransition } from "@/lib/motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
