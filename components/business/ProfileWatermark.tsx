"use client";

import { cn } from '@/lib/utils';
import { glass } from '@/lib/design-system';
import { SuburbMatesLogo } from '@/components/ui/SuburbMatesLogo';

interface ProfileWatermarkProps {
  opacity?: number;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-right' | 'top-left';
  style?: 'minimal' | 'badge' | 'floating';
  theme?: 'light' | 'dark' | 'adaptive';
  className?: string;
}

export function ProfileWatermark({
  opacity = 0.15,
  position = 'bottom-right',
  style = 'minimal',
  theme = 'adaptive',
  className
}: ProfileWatermarkProps) {
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4', 
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  const themeClasses = {
    'light': 'text-gray-600',
    'dark': 'text-white',
    'adaptive': 'text-gray-600 dark:text-white',
  };

  if (style === 'minimal') {
    return (
      <div 
        className={cn(
          "fixed z-40 pointer-events-none select-none",
          positionClasses[position],
          className
        )}
        style={{ opacity }}
      >
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-medium tracking-wide", themeClasses[theme])}>
            Powered by
          </span>
          <SuburbMatesLogo variant="FooterLogo" size="xs" />
        </div>
      </div>
    );
  }

  if (style === 'badge') {
    return (
      <div 
        className={cn(
          "fixed z-40",
          positionClasses[position],
          className
        )}
        style={{ opacity }}
      >
        <a 
          href="https://suburbmates.com.au"
          target="_blank"
          rel="noopener noreferrer"
          className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-white hover:text-primary transition-colors shadow-sm", glass.shell)}
        >
          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">SM</span>
          </div>
          Powered by SuburbMates
        </a>
      </div>
    );
  }

  if (style === 'floating') {
    return (
      <div 
        className={cn(
          "fixed z-40",
          positionClasses[position],
          className
        )}
        style={{ opacity }}
      >
        <div className={cn("bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg px-4 py-2 border border-primary/30", glass.container)}>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">SM</span>
            </div>
            <div>
              <div className="text-xs font-semibold text-primary">
                SuburbMates
              </div>
              <div className="text-[10px] text-gray-500">
                Business Profile
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}