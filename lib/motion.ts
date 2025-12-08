import { type Variants, type Transition } from "motion/react";

/**
 * Motion design system - Standardized animation variants and utilities
 * Inspired by phantom.land's fluid motion aesthetic
 */

// Standard timing functions
export const easings = {
  easeOut: [0.16, 1, 0.3, 1] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
  spring: { type: "spring" as const, stiffness: 100, damping: 10 },
  smooth: { type: "spring" as const, stiffness: 200, damping: 25 },
} as const;

// Standard durations
export const durations = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  slower: 0.8,
} as const;

// Base transition config
export const baseTransition: Transition = {
  duration: durations.normal,
  ease: easings.easeOut,
};

// Fade animations
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

// Slide animations
export const slideUp: Variants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
};

export const slideDown: Variants = {
  initial: { y: -20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 },
};

export const slideLeft: Variants = {
  initial: { x: 20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 },
};

export const slideRight: Variants = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
};

// Scale animations
export const scaleIn: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
};

export const scaleUp: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
};

// Stagger container variants
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

// Page transition variants
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
};

// Loading animation variants
export const loadingVariants: Variants = {
  initial: { opacity: 1 },
  animate: { 
    opacity: 1,
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
};

// Hover variants
export const hoverScale = {
  scale: 1.05,
  transition: {
    type: "spring" as const,
    stiffness: 400,
    damping: 17,
  },
};

export const hoverLift = {
  y: -4,
  transition: {
    type: "spring" as const,
    stiffness: 400,
    damping: 17,
  },
};

// Utility function to respect prefers-reduced-motion
export const getReducedMotionTransition = (transition: Transition): Transition => {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return {
      ...transition,
      duration: 0,
    };
  }
  return transition;
};

// Utility function to create custom variants with consistent timing
export const createVariants = (
  initial: Record<string, any>,
  animate: Record<string, any>,
  exit?: Record<string, any>
): Variants => ({
  initial,
  animate: {
    ...animate,
    transition: baseTransition,
  },
  exit: exit
    ? {
        ...exit,
        transition: baseTransition,
      }
    : initial,
});

