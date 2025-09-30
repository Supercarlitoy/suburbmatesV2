/**
 * SuburbMates Design System
 * Centralized styling and animation constants for consistent UI/UX
 */

// Glass Morphism System
export const glass = {
  // Core glass effects
  shell: "bg-white/5 backdrop-blur-2xl border border-white/10",
  light: "bg-white/90 text-gray-900 backdrop-blur-2xl border border-white/20",
  card: "bg-white/8 backdrop-blur-xl border border-white/10",
  overlay: "bg-black/20 backdrop-blur-sm",
  container: "backdrop-blur-sm",
  
  // Navigation and layout specific
  navBar: "bg-white/80 backdrop-blur-sm",
  authCard: "bg-white/80 backdrop-blur-xl",
  
  // Gradient effects
  gradientText: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
  gradientBg: "bg-gradient-to-br from-primary to-accent",
  heroBg: "bg-gradient-to-br from-slate-50 via-blue-50 to-green-50",
  
  // Interactive states
  hover: "transition-all duration-300 ease-out hover:bg-white/10",
  premiumHover: "transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl",
  focus: "focus:ring-2 focus:ring-primary/20 focus:border-primary/30",
} as const;

// Animation System
export const animations = {
  // Fade animations
  fadeInUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  },
  fadeInDown: {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  },
  
  // Slide animations
  slideFromLeft: {
    initial: { opacity: 0, x: -24 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  },
  slideFromRight: {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  },
  
  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: "easeOut" }
  },
  
  // Navigation specific
  navSlideDown: {
    initial: { y: -80, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.6, ease: "easeOut" }
  },
  
  // Stagger animations
  staggerChildren: {
    animate: { 
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1 
      } 
    }
  },
  staggerFast: {
    animate: { 
      transition: { 
        staggerChildren: 0.05 
      } 
    }
  }
} as const;

// Badge Variant System
export const badgeVariants = {
  // Status colors
  green: "bg-green-100 text-green-800 border-green-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200", 
  purple: "bg-purple-100 text-purple-800 border-purple-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  red: "bg-red-100 text-red-800 border-red-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  gray: "bg-gray-100 text-gray-800 border-gray-200",
  
  // Brand colors
  primary: "bg-primary/10 text-primary border-primary/20",
  accent: "bg-accent/10 text-accent border-accent/20",
  success: "bg-success/10 text-success border-success/20",
  
  // Glass variants
  glassGreen: "bg-green-500/10 text-green-700 border-green-500/20 backdrop-blur-sm",
  glassBlue: "bg-blue-500/10 text-blue-700 border-blue-500/20 backdrop-blur-sm",
  glassPrimary: "bg-primary/10 text-primary border-primary/20 backdrop-blur-sm",
} as const;

// Button Variant System
export const buttonVariants = {
  primary: "bg-primary hover:bg-primary/90",
  accent: "bg-accent hover:bg-accent/90",
  success: "bg-success hover:bg-success/90",
  gradient: "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90",
  glass: `${glass.light} hover:bg-white/95`,
  glassShell: `${glass.shell} hover:bg-white/10`,
} as const;

// Typography System
export const typography = {
  // Display text
  heroTitle: "text-5xl sm:text-6xl lg:text-7xl font-black leading-tight",
  pageTitle: "text-4xl font-bold",
  sectionTitle: "text-3xl font-bold",
  cardTitle: "text-2xl font-bold",
  
  // Body text
  heroDescription: "text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto",
  bodyLarge: "text-lg text-gray-700",
  body: "text-gray-700",
  bodySmall: "text-sm text-gray-600",
  caption: "text-xs text-gray-500",
  
  // Interactive text
  link: "text-primary hover:text-primary/80 transition-colors",
  linkAccent: "text-accent hover:text-accent/80 transition-colors",
  linkMuted: "text-gray-600 hover:text-primary transition-colors",
} as const;

// Spacing System (Tailwind-compatible)
export const spacing = {
  // Container padding
  containerX: "px-6 lg:px-8",
  containerY: "py-20",
  sectionY: "py-16",
  cardPadding: "p-6",
  
  // Common gaps
  stackSm: "space-y-2",
  stack: "space-y-4", 
  stackLg: "space-y-6",
  stackXl: "space-y-8",
  
  // Grid gaps
  gridGap: "gap-6",
  gridGapSm: "gap-4",
  gridGapLg: "gap-8",
} as const;

// Logo Sizing System
export const logoSizes = {
  sm: {
    container: "w-6 h-6",
    text: "text-sm font-bold",
    iconText: "text-xs"
  },
  md: {
    container: "w-8 h-8",
    text: "text-xl font-bold", 
    iconText: "text-sm"
  },
  lg: {
    container: "w-10 h-10",
    text: "text-2xl font-bold",
    iconText: "text-base"
  },
  xl: {
    container: "w-12 h-12",
    text: "text-3xl font-bold",
    iconText: "text-lg"
  }
} as const;

// Shadow System
export const shadows = {
  card: "shadow-card",
  premium: "shadow-premium", 
  soft: "shadow-sm",
  medium: "shadow-md",
  large: "shadow-lg",
  xl: "shadow-xl",
} as const;

// Border Radius System
export const radius = {
  sm: "rounded-sm",
  default: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
} as const;

// Z-Index System
export const zIndex = {
  dropdown: "z-10",
  sticky: "z-20", 
  overlay: "z-40",
  modal: "z-50",
  toast: "z-60",
} as const;

// Commonly used combinations
export const presets = {
  glassCard: `${glass.card} ${radius.xl} ${shadows.soft}`,
  premiumCard: `${glass.light} ${radius.xl} ${shadows.premium}`,
  heroCard: `${glass.shell} ${radius.xl}`,
  interactiveCard: `${glass.card} ${radius.lg} ${glass.hover} cursor-pointer`,
} as const;

// Export animation hooks
export { useStandardAnimations, useSlideAnimation, useStaggerAnimation, useHoverAnimation, useLoadingAnimation, AnimationPresets } from "@/hooks/useStandardAnimations";

// Type definitions for better TypeScript support
export type GlassVariant = keyof typeof glass;
export type AnimationVariant = keyof typeof animations;
export type BadgeVariant = keyof typeof badgeVariants;
export type ButtonVariant = keyof typeof buttonVariants;
export type TypographyVariant = keyof typeof typography;
export type LogoSize = keyof typeof logoSizes;
