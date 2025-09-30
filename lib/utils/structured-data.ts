/**
 * Structured Data Generation Utilities
 * Generate JSON-LD structured data for business profiles to improve SEO
 */

interface Business {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  bio?: string;
  suburb: string;
  category?: string;
  slug: string;
}

/**
 * Generate LocalBusiness structured data
 */
export function generateBusinessStructuredData(business: Business) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://suburbmates.com.au';
  const businessUrl = `${baseUrl}/business/${business.slug}`;
  
  // Map business categories to schema.org types
  const getBusinessType = (category?: string): string => {
    if (!category) return 'LocalBusiness';
    
    const categoryMap: { [key: string]: string } = {
      'plumbing': 'Plumber',
      'electrical': 'Electrician',
      'carpentry': 'GeneralContractor',
      'painting': 'PaintingContractor',
      'landscaping': 'LandscapingBusiness',
      'cleaning': 'HousePainter',
      'roofing': 'RoofingContractor',
      'hvac': 'HVACBusiness',
      'cafe-restaurant': 'Restaurant',
      'bakery': 'Bakery',
      'bar-pub': 'BarOrPub',
      'hair-beauty': 'BeautySalon',
      'fitness': 'SportsActivityLocation',
      'healthcare': 'MedicalOrganization',
      'automotive': 'AutoRepair',
      'accounting': 'AccountingService',
      'legal': 'Attorney',
      'real-estate': 'RealEstateAgent',
      'marketing': 'AdvertisingAgency',
      'retail': 'Store',
      'pet-services': 'VeterinaryCare',
      'education': 'EducationalOrganization',
    };

    return categoryMap[category] || 'LocalBusiness';
  };

  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': getBusinessType(business.category),
    '@id': businessUrl,
    'name': business.name,
    'url': businessUrl,
    'description': business.bio || `Professional ${business.category || 'business'} services in ${business.suburb}, Melbourne.`,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': business.suburb,
      'addressRegion': 'Victoria',
      'addressCountry': 'AU',
    },
    'areaServed': {
      '@type': 'City',
      'name': 'Melbourne',
      'sameAs': 'https://en.wikipedia.org/wiki/Melbourne',
    },
    'serviceArea': {
      '@type': 'GeoCircle',
      'geoMidpoint': {
        '@type': 'GeoCoordinates',
        'latitude': -37.8136,
        'longitude': 144.9631,
      },
      'geoRadius': '50000', // 50km radius
    },
    'foundingLocation': {
      '@type': 'Place',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': business.suburb,
        'addressRegion': 'Victoria',
        'addressCountry': 'AU',
      },
    },
    'isAccessibleForFree': false,
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': `${business.name} Services`,
      'itemListElement': [
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            'name': `${business.category || 'Professional'} Services`,
            'description': business.bio || `Quality ${business.category || 'business'} services`,
          },
          'areaServed': business.suburb,
        },
      ],
    },
    'makesOffer': {
      '@type': 'Offer',
      'itemOffered': {
        '@type': 'Service',
        'name': `${business.category || 'Professional'} Services`,
        'description': business.bio,
      },
      'areaServed': {
        '@type': 'Place',
        'name': business.suburb,
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': businessUrl,
    },
    'sameAs': [] as string[],
    'potentialAction': {
      '@type': 'ContactAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': businessUrl,
        'inLanguage': 'en-AU',
        'actionPlatform': [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
    },
  };

  // Add contact information if available
  if (business.email || business.phone) {
    structuredData['contactPoint'] = {
      '@type': 'ContactPoint',
      'contactType': 'Customer Service',
      'areaServed': 'AU',
      'availableLanguage': 'English',
    } as any;

    if (business.email) {
      (structuredData.contactPoint as any).email = business.email;
    }

    if (business.phone) {
      (structuredData.contactPoint as any).telephone = business.phone;
    }
  }

  // Add website if available
  if (business.website) {
    structuredData.sameAs.push(business.website);
  }

  return structuredData;
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbStructuredData(business: Business) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://suburbmates.com.au';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'SuburbMates',
        'item': baseUrl,
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': business.suburb,
        'item': `${baseUrl}/suburb/${business.suburb.toLowerCase().replace(/\s+/g, '-')}`,
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': business.category || 'Businesses',
        'item': `${baseUrl}/category/${(business.category || 'business').toLowerCase().replace(/\s+/g, '-')}`,
      },
      {
        '@type': 'ListItem',
        'position': 4,
        'name': business.name,
        'item': `${baseUrl}/business/${business.slug}`,
      },
    ],
  };
}

/**
 * Generate WebSite structured data for the platform
 */
export function generateWebsiteStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://suburbmates.com.au';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'SuburbMates',
    'alternateName': 'SuburbMates Business Directory',
    'url': baseUrl,
    'description': 'Melbourne\'s premier business community platform connecting local businesses with residents.',
    'publisher': {
      '@type': 'Organization',
      'name': 'SuburbMates',
      'url': baseUrl,
    },
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    'sameAs': [
      // Add social media URLs when available
    ],
  };
}

/**
 * Generate Organization structured data for SuburbMates
 */
export function generateOrganizationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://suburbmates.com.au';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'SuburbMates',
    'url': baseUrl,
    'logo': `${baseUrl}/logo.png`,
    'description': 'Melbourne\'s business community platform that connects local businesses with residents through professional profiles and lead generation.',
    'foundingLocation': {
      '@type': 'Place',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Melbourne',
        'addressRegion': 'Victoria',
        'addressCountry': 'AU',
      },
    },
    'areaServed': {
      '@type': 'Place',
      'name': 'Melbourne Metropolitan Area',
    },
    'knowsAbout': [
      'Local Business Directory',
      'Business Networking',
      'Lead Generation',
      'Professional Services',
      'Melbourne Businesses',
    ],
    'sameAs': [
      // Add social media and other platform URLs
    ],
  };
}

export default {
  generateBusinessStructuredData,
  generateBreadcrumbStructuredData,
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
};