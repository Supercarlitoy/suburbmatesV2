/**
 * StatusBadge Component
 * Centralized badge system to replace 10+ duplicate variant definitions
 */

import { ReactNode } from "react";
import { badgeVariants, type BadgeVariant } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  /** Badge color variant */
  variant: BadgeVariant;
  /** Badge content */
  children: ReactNode;
  /** Badge size */
  size?: "sm" | "md" | "lg";
  /** Custom CSS classes */
  className?: string;
  /** Whether to show a dot indicator */
  showDot?: boolean;
  /** Custom dot color (overrides variant) */
  dotColor?: string;
  /** Whether the badge is clickable */
  clickable?: boolean;
  /** Click handler for clickable badges */
  onClick?: () => void;
  /** Whether to show as outlined instead of filled */
  outline?: boolean;
  /** Whether to make text uppercase */
  uppercase?: boolean;
  /** Custom icon to show before text */
  icon?: ReactNode;
  /** Accessibility label */
  ariaLabel?: string;
}

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs font-medium",
  md: "px-2.5 py-1 text-xs font-medium", 
  lg: "px-3 py-1.5 text-sm font-medium"
} as const;

const outlineVariants: Record<BadgeVariant, string> = {
  // Status colors (outline versions)
  green: "border-green-500 text-green-700 bg-transparent hover:bg-green-50",
  blue: "border-blue-500 text-blue-700 bg-transparent hover:bg-blue-50",
  purple: "border-purple-500 text-purple-700 bg-transparent hover:bg-purple-50",
  orange: "border-orange-500 text-orange-700 bg-transparent hover:bg-orange-50",
  red: "border-red-500 text-red-700 bg-transparent hover:bg-red-50",
  yellow: "border-yellow-500 text-yellow-700 bg-transparent hover:bg-yellow-50",
  gray: "border-gray-500 text-gray-700 bg-transparent hover:bg-gray-50",
  
  // Brand colors (outline versions)
  primary: "border-primary text-primary bg-transparent hover:bg-primary/5",
  accent: "border-accent text-accent bg-transparent hover:bg-accent/5",
  success: "border-success text-success bg-transparent hover:bg-success/5",
  
  // Glass variants (outline versions)
  glassGreen: "border-green-500/50 text-green-700 bg-transparent backdrop-blur-sm hover:bg-green-500/5",
  glassBlue: "border-blue-500/50 text-blue-700 bg-transparent backdrop-blur-sm hover:bg-blue-500/5",
  glassPrimary: "border-primary/50 text-primary bg-transparent backdrop-blur-sm hover:bg-primary/5"
} as const;

const dotColors = {
  green: "bg-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500", 
  orange: "bg-orange-500",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  gray: "bg-gray-500",
  primary: "bg-primary",
  accent: "bg-accent", 
  success: "bg-success",
  glassGreen: "bg-green-500",
  glassBlue: "bg-blue-500",
  glassPrimary: "bg-primary"
} as const;

export function StatusBadge({
  variant,
  children,
  size = "md",
  className,
  showDot = false,
  dotColor,
  clickable = false,
  onClick,
  outline = false,
  uppercase = false,
  icon,
  ariaLabel
}: StatusBadgeProps) {
  const baseClasses = "inline-flex items-center gap-1.5 rounded-full border transition-colors";
  const sizeClasses = sizeStyles[size];
  const variantClasses = outline ? outlineVariants[variant] : badgeVariants[variant];
  const textClasses = uppercase ? "uppercase" : "";
  const interactiveClasses = clickable ? "cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current" : "";

  const dotElement = showDot ? (
    <span 
      className={cn(
        "w-1.5 h-1.5 rounded-full animate-pulse",
        dotColor || dotColors[variant]
      )}
      aria-hidden="true"
    />
  ) : null;

  const content = (
    <>
      {dotElement}
      {icon}
      <span className={textClasses}>{children}</span>
    </>
  );

  const Component = clickable ? "button" : "span";

  return (
    <Component
      className={cn(
        baseClasses,
        sizeClasses,
        variantClasses,
        interactiveClasses,
        className
      )}
      onClick={clickable ? onClick : undefined}
      aria-label={ariaLabel}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {content}
    </Component>
  );
}

// Preset badge components for common use cases
export const BadgePresets = {
  /** Success status badge */
  Success: (props: Omit<StatusBadgeProps, "variant">) => (
    <StatusBadge variant="green" {...props} />
  ),

  /** Warning status badge */
  Warning: (props: Omit<StatusBadgeProps, "variant">) => (
    <StatusBadge variant="orange" {...props} />
  ),

  /** Error status badge */
  Error: (props: Omit<StatusBadgeProps, "variant">) => (
    <StatusBadge variant="red" {...props} />
  ),

  /** Info status badge */
  Info: (props: Omit<StatusBadgeProps, "variant">) => (
    <StatusBadge variant="blue" {...props} />
  ),

  /** Primary action badge */
  Primary: (props: Omit<StatusBadgeProps, "variant">) => (
    <StatusBadge variant="primary" {...props} />
  ),

  /** Live/active status with pulsing dot */
  Live: (props: Omit<StatusBadgeProps, "variant" | "showDot">) => (
    <StatusBadge variant="green" showDot {...props} />
  ),

  /** Verification status badge */
  Verified: (props: Omit<StatusBadgeProps, "variant">) => (
    <StatusBadge variant="success" {...props}>
      ✓ Verified
    </StatusBadge>
  ),

  /** Pending status badge */
  Pending: (props: Omit<StatusBadgeProps, "variant">) => (
    <StatusBadge variant="yellow" {...props}>
      Pending
    </StatusBadge>
  ),

  /** New item badge */
  New: (props: Omit<StatusBadgeProps, "variant" | "uppercase">) => (
    <StatusBadge variant="primary" uppercase {...props}>
      New
    </StatusBadge>
  )
} as const;

// Export individual preset components for convenience
export const SuccessBadge = BadgePresets.Success;
export const WarningBadge = BadgePresets.Warning;
export const ErrorBadge = BadgePresets.Error;
export const InfoBadge = BadgePresets.Info;
export const PrimaryBadge = BadgePresets.Primary;
export const LiveBadge = BadgePresets.Live;
export const VerifiedBadge = BadgePresets.Verified;
export const PendingBadge = BadgePresets.Pending;
export const NewBadge = BadgePresets.New;

// Business-specific badge presets for SuburbMates
export const BusinessBadges = {
  /** ABN Verified badge */
  AbnVerified: (props?: Omit<StatusBadgeProps, "variant" | "children">) => (
    <StatusBadge variant="success" {...props}>
      ABN Verified
    </StatusBadge>
  ),

  /** Community Listed badge */
  CommunityListed: (props?: Omit<StatusBadgeProps, "variant" | "children">) => (
    <StatusBadge variant="blue" {...props}>
      Community Listed
    </StatusBadge>
  ),

  /** Premium badge */
  Premium: (props?: Omit<StatusBadgeProps, "variant" | "children">) => (
    <StatusBadge variant="accent" {...props}>
      Premium
    </StatusBadge>
  ),

  /** Free forever badge */
  Free: (props?: Omit<StatusBadgeProps, "variant" | "children">) => (
    <StatusBadge variant="green" {...props}>
      Free Forever
    </StatusBadge>
  ),

  /** Melbourne focused badge */
  Melbourne: (props?: Omit<StatusBadgeProps, "variant" | "children">) => (
    <StatusBadge variant="primary" {...props}>
      Melbourne Focused
    </StatusBadge>
  ),

  /** Quality score badge */
  QualityScore: (score: number, props?: Omit<StatusBadgeProps, "variant" | "children">) => {
    const variant = score >= 80 ? "green" : score >= 60 ? "orange" : "red";
    return (
      <StatusBadge variant={variant} {...props}>
        {score}/100
      </StatusBadge>
    );
  }
} as const;