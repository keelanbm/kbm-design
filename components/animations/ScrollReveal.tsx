"use client";

import { motion } from "motion/react";
import { fadeInUp, slideUp } from "@/lib/motion";
import { useRef, useEffect, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: "fadeInUp" | "slideUp";
  delay?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  variant = "fadeInUp",
  delay = 0,
  className = "",
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, []);

  const variants = variant === "fadeInUp" ? fadeInUp : slideUp;

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="initial"
      animate={isVisible ? "animate" : "initial"}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

