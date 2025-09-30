/**
 * SuburbMates Logo Component
 * Centralized, configurable logo to replace 6+ duplicate implementations
 */

import Link from "next/link";
import { logoSizes, glass, type LogoSize } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface SuburbMatesLogoProps {
  /** Size variant - affects both container and text sizing */
  size?: LogoSize | "xs";
  /** Visual style variant - can be preset name or style */
  variant?: "gradient" | "solid" | "glass" | "NavigationLogo" | "FooterLogo" | "AuthLogo";
  /** Whether to show the text alongside the icon */
  showText?: boolean;
  /** Whether the logo should be a clickable link to home */
  linkToHome?: boolean;
  /** Custom CSS classes for the container */
  className?: string;
  /** Custom CSS classes for the icon container */
  iconClassName?: string;
  /** Custom CSS classes for the text */
  textClassName?: string;
  /** Override the text content (default: "SuburbMates") */
  text?: string;
  /** Override the icon content (default: "S") */
  icon?: string;
  /** Whether to show as inline or flex layout */
  layout?: "inline" | "flex";
  /** Gap between icon and text */
  gap?: "sm" | "md" | "lg";
  /** Accessibility label for the logo */
  ariaLabel?: string;
}

const variantStyles = {
  gradient: {
    container: "bg-gradient-to-br from-primary to-accent",
    text: glass.gradientText,
    icon: "text-white"
  },
  solid: {
    container: "bg-primary",
    text: "text-primary",
    icon: "text-white"
  },
  glass: {
    container: glass.shell,
    text: "text-gray-900",
    icon: "text-primary"
  }
} as const;

const gapStyles = {
  sm: "gap-2",
  md: "gap-3", 
  lg: "gap-4"
} as const;

const layoutStyles = {
  inline: "inline-flex items-center",
  flex: "flex items-center"
} as const;

export function SuburbMatesLogo({
  size = "md",
  variant = "gradient",
  showText = true,
  linkToHome = false,
  className,
  iconClassName,
  textClassName,
  text = "SuburbMates",
  icon = "S",
  layout = "flex",
  gap = "md",
  ariaLabel = "SuburbMates home"
}: SuburbMatesLogoProps) {
  // Handle preset variants
  const getPresetConfig = () => {
    switch (variant) {
      case "NavigationLogo":
        return { actualSize: "sm" as const, actualVariant: "gradient" as const, actualShowText: true };
      case "FooterLogo":
        return { actualSize: "xs" as const, actualVariant: "solid" as const, actualShowText: true };
      case "AuthLogo":
        return { actualSize: size, actualVariant: "gradient" as const, actualShowText: true };
      default:
        return { actualSize: size, actualVariant: variant as "gradient" | "solid" | "glass", actualShowText: showText };
    }
  };
  
  const { actualSize, actualVariant, actualShowText } = getPresetConfig();
  
  // Add xs size support
  const allSizes = {
    ...logoSizes,
    xs: {
      container: "w-4 h-4",
      text: "text-sm font-bold",
      iconText: "text-xs"
    }
  };
  
  const sizeConfig = allSizes[actualSize as keyof typeof allSizes];
  const variantConfig = variantStyles[actualVariant];
  
  const iconElement = (
    <div 
      className={cn(
        sizeConfig.container,
        "grid place-items-center font-bold",
        variant === "gradient" || variant === "solid" ? "rounded-xl" : "rounded-lg",
        variantConfig.container,
        iconClassName
      )}
      aria-hidden="true"
    >
      <span className={cn(sizeConfig.iconText, variantConfig.icon)}>
        {icon}
      </span>
    </div>
  );

  const textElement = actualShowText ? (
    <span 
      className={cn(
        sizeConfig.text,
        variantConfig.text,
        textClassName
      )}
    >
      {text}
    </span>
  ) : null;

  const logoContent = (
    <div 
      className={cn(
        layoutStyles[layout],
        gapStyles[gap],
        className
      )}
    >
      {iconElement}
      {textElement}
    </div>
  );

  if (linkToHome) {
    return (
      <Link 
        href="/" 
        className="inline-block transition-opacity hover:opacity-80"
        aria-label={ariaLabel}
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

// Preset configurations for common use cases
export const LogoPresets = {
  /** Navigation logo (large, gradient, with text) */
  Navigation: (props?: Partial<SuburbMatesLogoProps>) => (
    <SuburbMatesLogo 
      size="lg" 
      variant="gradient" 
      linkToHome 
      showText 
      {...props} 
    />
  ),

  /** Footer logo (medium, solid, with text) */
  Footer: (props?: Partial<SuburbMatesLogoProps>) => (
    <SuburbMatesLogo 
      size="md" 
      variant="solid" 
      linkToHome 
      showText 
      {...props} 
    />
  ),

  /** Compact logo (small, gradient, icon only) */
  Compact: (props?: Partial<SuburbMatesLogoProps>) => (
    <SuburbMatesLogo 
      size="sm" 
      variant="gradient" 
      showText={false} 
      {...props} 
    />
  ),

  /** Brand mark (extra large, gradient, with text) */
  Brand: (props?: Partial<SuburbMatesLogoProps>) => (
    <SuburbMatesLogo 
      size="xl" 
      variant="gradient" 
      showText 
      layout="flex"
      gap="lg"
      {...props} 
    />
  ),

  /** Glass variant for overlays */
  Glass: (props?: Partial<SuburbMatesLogoProps>) => (
    <SuburbMatesLogo 
      size="md" 
      variant="glass" 
      showText 
      {...props} 
    />
  )
} as const;

// Export individual preset components for convenience
export const NavigationLogo = LogoPresets.Navigation;
export const FooterLogo = LogoPresets.Footer;
export const CompactLogo = LogoPresets.Compact;
export const BrandLogo = LogoPresets.Brand;
export const GlassLogo = LogoPresets.Glass;