// Business Profile Themes & Customization
// Lightweight theme system for personalized business profiles

export interface ProfileTheme {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    card: string;
    text: string;
    muted: string;
  };
  gradient?: {
    from: string;
    to: string;
    direction: string;
  };
  style: 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant';
  category?: string[];
}

export const PROFILE_THEMES: ProfileTheme[] = [
  // Professional Themes
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Professional and trustworthy',
    preview: '🔵',
    colors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#60a5fa',
      background: '#f8fafc',
      card: '#ffffff',
      text: '#1e293b',
      muted: '#64748b'
    },
    style: 'modern',
    category: ['professional', 'finance', 'legal', 'technology']
  },
  {
    id: 'elegant-navy',
    name: 'Elegant Navy',
    description: 'Sophisticated and premium',
    preview: '🌊',
    colors: {
      primary: '#0f172a',
      secondary: '#1e293b',
      accent: '#0ea5e9',
      background: '#f1f5f9',
      card: '#ffffff',
      text: '#0f172a',
      muted: '#475569'
    },
    gradient: {
      from: '#0f172a',
      to: '#1e293b',
      direction: '135deg'
    },
    style: 'elegant',
    category: ['real-estate', 'consulting', 'luxury']
  },

  // Creative Themes
  {
    id: 'creative-purple',
    name: 'Creative Purple',
    description: 'Bold and artistic',
    preview: '🎨',
    colors: {
      primary: '#7c3aed',
      secondary: '#a855f7',
      accent: '#c084fc',
      background: '#faf5ff',
      card: '#ffffff',
      text: '#581c87',
      muted: '#7c2d92'
    },
    gradient: {
      from: '#7c3aed',
      to: '#a855f7',
      direction: '45deg'
    },
    style: 'bold',
    category: ['design', 'marketing', 'entertainment', 'beauty']
  },
  {
    id: 'vibrant-orange',
    name: 'Vibrant Orange',
    description: 'Energetic and friendly',
    preview: '🧡',
    colors: {
      primary: '#ea580c',
      secondary: '#fb923c',
      accent: '#fdba74',
      background: '#fff7ed',
      card: '#ffffff',
      text: '#9a3412',
      muted: '#c2410c'
    },
    style: 'bold',
    category: ['food', 'fitness', 'automotive', 'retail']
  },

  // Nature & Health Themes
  {
    id: 'nature-green',
    name: 'Nature Green',
    description: 'Fresh and eco-friendly',
    preview: '🌱',
    colors: {
      primary: '#16a34a',
      secondary: '#22c55e',
      accent: '#4ade80',
      background: '#f0fdf4',
      card: '#ffffff',
      text: '#14532d',
      muted: '#166534'
    },
    style: 'modern',
    category: ['landscaping', 'health', 'organic', 'sustainability']
  },
  {
    id: 'wellness-teal',
    name: 'Wellness Teal',
    description: 'Calming and therapeutic',
    preview: '🧘',
    colors: {
      primary: '#0d9488',
      secondary: '#14b8a6',
      accent: '#5eead4',
      background: '#f0fdfa',
      card: '#ffffff',
      text: '#134e4a',
      muted: '#0f766e'
    },
    style: 'minimal',
    category: ['wellness', 'spa', 'healthcare', 'therapy']
  },

  // Service Industry Themes
  {
    id: 'craftsman-brown',
    name: 'Craftsman Brown',
    description: 'Reliable and skilled',
    preview: '🔨',
    colors: {
      primary: '#92400e',
      secondary: '#d97706',
      accent: '#f59e0b',
      background: '#fffbeb',
      card: '#ffffff',
      text: '#78350f',
      muted: '#92400e'
    },
    style: 'classic',
    category: ['construction', 'plumbing', 'electrical', 'carpentry']
  },
  {
    id: 'hospitality-red',
    name: 'Hospitality Red',
    description: 'Warm and welcoming',
    preview: '🍷',
    colors: {
      primary: '#dc2626',
      secondary: '#ef4444',
      accent: '#f87171',
      background: '#fef2f2',
      card: '#ffffff',
      text: '#991b1b',
      muted: '#b91c1c'
    },
    style: 'classic',
    category: ['restaurant', 'cafe', 'bar', 'hospitality']
  },

  // Minimal & Clean Themes
  {
    id: 'minimal-gray',
    name: 'Minimal Gray',
    description: 'Clean and modern',
    preview: '⚪',
    colors: {
      primary: '#374151',
      secondary: '#6b7280',
      accent: '#9ca3af',
      background: '#f9fafb',
      card: '#ffffff',
      text: '#111827',
      muted: '#6b7280'
    },
    style: 'minimal',
    category: ['technology', 'consulting', 'architecture']
  },
  {
    id: 'premium-gold',
    name: 'Premium Gold',
    description: 'Luxury and exclusive',
    preview: '✨',
    colors: {
      primary: '#d97706',
      secondary: '#f59e0b',
      accent: '#fbbf24',
      background: '#fffbeb',
      card: '#ffffff',
      text: '#92400e',
      muted: '#a16207'
    },
    gradient: {
      from: '#d97706',
      to: '#f59e0b',
      direction: '135deg'
    },
    style: 'elegant',
    category: ['luxury', 'jewelry', 'premium-services']
  }
];

// Layout Options
export interface LayoutOption {
  id: string;
  name: string;
  description: string;
  preview: string;
  features: string[];
}

export const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: 'standard',
    name: 'Standard Layout',
    description: 'Classic business profile layout',
    preview: '📄',
    features: ['Header with logo', 'About section', 'Contact info', 'Service areas']
  },
  {
    id: 'hero-focused',
    name: 'Hero Focused',
    description: 'Large hero section with call-to-action',
    preview: '🎯',
    features: ['Large hero banner', 'Prominent CTA', 'Service highlights', 'Testimonials']
  },
  {
    id: 'gallery-showcase',
    name: 'Gallery Showcase',
    description: 'Visual portfolio emphasis',
    preview: '🖼️',
    features: ['Image gallery', 'Portfolio grid', 'Before/after', 'Visual testimonials']
  },
  {
    id: 'service-focused',
    name: 'Service Focused',
    description: 'Detailed service breakdown',
    preview: '📋',
    features: ['Service cards', 'Pricing tiers', 'Feature comparison', 'FAQ section']
  },
  {
    id: 'contact-priority',
    name: 'Contact Priority',
    description: 'Easy contact and booking',
    preview: '📞',
    features: ['Contact form', 'Booking widget', 'Location map', 'Business hours']
  }
];

// Customization Options
export interface CustomizationOptions {
  theme: string;
  layout: string;
  headerStyle: 'minimal' | 'standard' | 'bold';
  showTestimonials: boolean;
  showGallery: boolean;
  showServiceAreas: boolean;
  showBusinessHours: boolean;
  ctaText: string;
  ctaStyle: 'button' | 'banner' | 'floating';
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
}

// Helper Functions
export const getThemeById = (id: string): ProfileTheme | undefined => {
  return PROFILE_THEMES.find(theme => theme.id === id);
};

export const getThemesByCategory = (category: string): ProfileTheme[] => {
  return PROFILE_THEMES.filter(theme => 
    theme.category?.includes(category.toLowerCase())
  );
};

export const getLayoutById = (id: string): LayoutOption | undefined => {
  return LAYOUT_OPTIONS.find(layout => layout.id === id);
};

export const generateThemeCSS = (theme: ProfileTheme): string => {
  return `
    :root {
      --theme-primary: ${theme.colors.primary};
      --theme-secondary: ${theme.colors.secondary};
      --theme-accent: ${theme.colors.accent};
      --theme-background: ${theme.colors.background};
      --theme-card: ${theme.colors.card};
      --theme-text: ${theme.colors.text};
      --theme-muted: ${theme.colors.muted};
    }
    
    .theme-gradient {
      background: ${theme.gradient ? 
        `linear-gradient(${theme.gradient.direction}, ${theme.gradient.from}, ${theme.gradient.to})` : 
        theme.colors.primary
      };
    }
    
    .theme-primary { color: var(--theme-primary); }
    .theme-bg-primary { background-color: var(--theme-primary); }
    .theme-border-primary { border-color: var(--theme-primary); }
  `;
};

// Performance optimized theme application
export const applyTheme = (theme: ProfileTheme, element?: HTMLElement) => {
  const target = element || document.documentElement;
  
  // Apply CSS custom properties
  Object.entries(theme.colors).forEach(([key, value]) => {
    target.style.setProperty(`--theme-${key}`, value);
  });
  
  // Apply gradient if available
  if (theme.gradient) {
    target.style.setProperty(
      '--theme-gradient', 
      `linear-gradient(${theme.gradient.direction}, ${theme.gradient.from}, ${theme.gradient.to})`
    );
  }
};

// Default theme for new businesses
export const DEFAULT_THEME = 'corporate-blue';
export const DEFAULT_LAYOUT = 'standard';

// Theme recommendations based on business category
export const getRecommendedThemes = (businessCategory: string): ProfileTheme[] => {
  const categoryThemes = getThemesByCategory(businessCategory);
  
  if (categoryThemes.length > 0) {
    return categoryThemes.slice(0, 3);
  }
  
  // Fallback to popular themes
  return PROFILE_THEMES.filter(theme => 
    ['corporate-blue', 'elegant-navy', 'minimal-gray'].includes(theme.id)
  );
};

export default PROFILE_THEMES;