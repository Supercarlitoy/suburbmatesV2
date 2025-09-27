/**
 * JSON-LD Structured Data for Business Profiles
 * Generates LocalBusiness schema.org markup for better SEO
 */

interface Business {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  website?: string;
  bio?: string;
  suburb: string;
  postcode?: string;
  category?: string;
  logo?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
}

/**
 * Generate LocalBusiness JSON-LD structured data
 * @param business Business data
 * @param profileUrl Full URL to business profile
 */
export function generateBusinessJsonLd(business: Business, profileUrl: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au';
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": profileUrl,
    "name": business.name,
    "url": profileUrl,
    "description": business.bio || `${business.name} - Professional ${business.category || 'services'} in ${business.suburb}, Melbourne`,
    
    // Address information
    "address": {
      "@type": "PostalAddress",
      "addressLocality": business.suburb,
      "addressRegion": "VIC",
      "addressCountry": "AU",
      ...(business.postcode && { "postalCode": business.postcode }),
    },
    
    // Contact information
    ...(business.email && { "email": business.email }),
    ...(business.phone && { "telephone": business.phone }),
    ...(business.website && { "url": business.website }),
    
    // Business category
    ...(business.category && { 
      "category": business.category,
      "additionalType": `https://www.wikidata.org/wiki/${business.category.replace(/\s+/g, '_')}`,
    }),
    
    // Logo/Image
    ...(business.logo && {
      "logo": {
        "@type": "ImageObject",
        "url": business.logo.startsWith('http') ? business.logo : `${baseUrl}${business.logo}`,
      },
      "image": business.logo.startsWith('http') ? business.logo : `${baseUrl}${business.logo}`,
    }),
    
    // Social media profiles
    "sameAs": [
      business.website,
      business.facebookUrl,
      business.instagramUrl,
      business.linkedinUrl,
    ].filter(Boolean),
    
    // Service area
    "areaServed": {
      "@type": "City",
      "name": business.suburb,
      "addressRegion": "VIC",
      "addressCountry": "AU",
    },
    
    // Publisher information
    "publisher": {
      "@type": "Organization",
      "name": "SuburbMates",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`,
      },
    },
    
    // Additional properties
    "priceRange": "$$",  // Can be customized per business
    "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer"],
    "currenciesAccepted": "AUD",
  };

  return JSON.stringify(jsonLd, null, 2);
}

/**
 * Generate BreadcrumbList JSON-LD for business profile pages
 */
export function generateBreadcrumbJsonLd(business: Business, profileUrl: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au';
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Businesses",
        "item": `${baseUrl}/businesses`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": business.suburb,
        "item": `${baseUrl}/businesses?suburb=${encodeURIComponent(business.suburb)}`,
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": business.name,
        "item": profileUrl,
      },
    ],
  };

  return JSON.stringify(jsonLd, null, 2);
}

/**
 * Generate WebSite JSON-LD for the main site
 */
export function generateWebSiteJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au';
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    "name": "SuburbMates",
    "url": baseUrl,
    "description": "Melbourne's trusted business community platform connecting residents with verified local businesses",
    "publisher": {
      "@type": "Organization",
      "name": "SuburbMates",
      "url": baseUrl,
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return JSON.stringify(jsonLd, null, 2);
}