/**
 * Standard Animation Hooks
 * Centralized Framer Motion animation patterns for consistent UX
 */

import { useCallback } from "react";
import { type Variants, type Transition } from "framer-motion";
import { animations, type AnimationVariant } from "@/lib/design-system";

export interface AnimationOptions {
  /** Animation duration in seconds */
  duration?: number;
  /** Animation delay in seconds */ 
  delay?: number;
  /** Animation easing function */
  ease?: string | number[];
  /** Whether to use whileInView instead of animate */
  viewport?: boolean;
  /** Viewport options for whileInView animations */
  viewportOptions?: {
    once?: boolean;
    margin?: string;
    amount?: number | "some" | "all";
  };
  /** Custom animation distance for slide animations */
  distance?: number;
  /** Custom scale values for scale animations */
  scale?: {
    from?: number;
    to?: number;
  };
}

/**
 * Hook for accessing standardized animation configurations
 */
export function useStandardAnimations(options: AnimationOptions = {}) {
  const {
    duration = 0.4,
    delay = 0,
    ease = "easeOut",
    viewport = false,
    viewportOptions = { once: true, amount: 0.3 },
    distance = 24,
    scale = { from: 0.95, to: 1 }
  } = options;

  const getAnimation = useCallback((variant: AnimationVariant, customOptions?: Partial<AnimationOptions>) => {
    const config = animations[variant];
    const opts = { ...options, ...customOptions };
    
    // Override transition properties if provided
    const transition: Transition = {
      ...config.transition,
      duration: opts.duration ?? duration,
      delay: opts.delay ?? delay,
      ease: opts.ease ?? ease
    };

    const result = {
      ...config,
      transition
    };

    // Add viewport properties if needed
    if (viewport || opts.viewport) {
      return {
        ...result,
        viewport: opts.viewportOptions ?? viewportOptions
      };
    }

    return result;
  }, [duration, delay, ease, viewport, viewportOptions, options]);

  // Commonly used animation patterns
  const fadeInUp = useCallback((customOptions?: Partial<AnimationOptions>) => 
    getAnimation("fadeInUp", customOptions), [getAnimation]);

  const fadeInDown = useCallback((customOptions?: Partial<AnimationOptions>) => 
    getAnimation("fadeInDown", customOptions), [getAnimation]);

  const fadeIn = useCallback((customOptions?: Partial<AnimationOptions>) => 
    getAnimation("fadeIn", customOptions), [getAnimation]);

  const slideFromLeft = useCallback((customOptions?: Partial<AnimationOptions>) => 
    getAnimation("slideFromLeft", customOptions), [getAnimation]);

  const slideFromRight = useCallback((customOptions?: Partial<AnimationOptions>) => 
    getAnimation("slideFromRight", customOptions), [getAnimation]);

  const scaleIn = useCallback((customOptions?: Partial<AnimationOptions>) => 
    getAnimation("scaleIn", customOptions), [getAnimation]);

  const navSlideDown = useCallback((customOptions?: Partial<AnimationOptions>) => 
    getAnimation("navSlideDown", customOptions), [getAnimation]);

  const staggerChildren = useCallback((customOptions?: Partial<AnimationOptions>) => 
    getAnimation("staggerChildren", customOptions), [getAnimation]);

  return {
    // Individual animations
    fadeInUp,
    fadeInDown,
    fadeIn,
    slideFromLeft,
    slideFromRight,
    // Aliases for backward compatibility
    slideInFromLeft: slideFromLeft,
    slideInFromRight: slideFromRight,
    scaleIn,
    navSlideDown,
    staggerChildren,
    
    // Generic getter
    getAnimation,
    
    // Animation variants for components
    variants: animations,
  };
}

/**
 * Hook for creating custom slide animations with configurable direction and distance
 */
export function useSlideAnimation(
  direction: "up" | "down" | "left" | "right" = "up",
  distance: number = 24,
  options?: AnimationOptions
) {
  const getSlideVariants = useCallback((): Variants => {
    const initialOffset = {
      up: { y: distance },
      down: { y: -distance },
      left: { x: distance },
      right: { x: -distance }
    }[direction];

    const animateOffset = {
      up: { y: 0 },
      down: { y: 0 },
      left: { x: 0 },
      right: { x: 0 }
    }[direction];

    return {
      initial: {
        opacity: 0,
        ...initialOffset
      },
      animate: {
        opacity: 1,
        ...animateOffset,
        transition: {
          duration: options?.duration ?? 0.4,
          delay: options?.delay ?? 0,
          ease: options?.ease ?? "easeOut"
        }
      }
    };
  }, [direction, distance, options]);

  return getSlideVariants();
}

/**
 * Hook for creating staggered animations for lists or grids
 */
export function useStaggerAnimation(
  childDelay: number = 0.1,
  options?: AnimationOptions
) {
  const staggerVariants: Variants = {
    animate: {
      transition: {
        staggerChildren: childDelay,
        delayChildren: options?.delay ?? 0.1
      }
    }
  };

  const childVariants: Variants = {
    initial: {
      opacity: 0,
      y: options?.distance ?? 8
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: options?.duration ?? 0.3,
        ease: options?.ease ?? "easeOut"
      }
    }
  };

  return {
    container: staggerVariants,
    item: childVariants
  };
}

/**
 * Hook for hover animations
 */
export function useHoverAnimation(
  scale: number = 1.02,
  duration: number = 0.2
) {
  return {
    whileHover: {
      scale,
      transition: { duration, ease: "easeOut" }
    },
    whileTap: {
      scale: scale * 0.98,
      transition: { duration: 0.1 }
    }
  };
}

/**
 * Hook for loading/skeleton animations
 */
export function useLoadingAnimation() {
  return {
    animate: {
      opacity: [0.4, 0.8, 0.4],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
}

/**
 * Preset animation configurations for common use cases
 */
export const AnimationPresets = {
  /** Quick fade for UI feedback */
  quickFade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 }
  },

  /** Smooth page transition */
  pageTransition: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.3, ease: "easeOut" }
  },

  /** Modal appearance */
  modal: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: "easeOut" }
  },

  /** Toast notification */
  toast: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: { duration: 0.3, ease: "easeOut" }
  },

  /** Card reveal */
  cardReveal: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.4, ease: "easeOut" }
  }
} as const;