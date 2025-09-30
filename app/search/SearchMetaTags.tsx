'use client';

import { useSearchParams } from 'next/navigation';
import Head from 'next/head';
import { useEffect } from 'react';

export default function SearchMetaTags() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Check if we have any search parameters
    const hasParams = searchParams.toString().length > 0;
    const query = searchParams.get('query');
    const category = searchParams.get('category');
    const suburb = searchParams.get('suburb');
    
    // Create/update meta robots tag
    let existingMetaRobots = document.querySelector('meta[name="robots"]');
    if (!existingMetaRobots) {
      existingMetaRobots = document.createElement('meta');
      existingMetaRobots.setAttribute('name', 'robots');
      document.head.appendChild(existingMetaRobots);
    }
    
    // Set robots meta based on parameters
    if (hasParams) {
      // Parameterized search: noindex,follow (avoid crawl bloat)
      existingMetaRobots.setAttribute('content', 'noindex,follow');
    } else {
      // Clean search page: index,follow
      existingMetaRobots.setAttribute('content', 'index,follow');
    }
    
    // Create canonical URL
    let existingCanonical = document.querySelector('link[rel="canonical"]');
    if (!existingCanonical) {
      existingCanonical = document.createElement('link');
      existingCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(existingCanonical);
    }
    
    // Generate canonical URL
    const baseUrl = window.location.origin;
    let canonicalUrl = `${baseUrl}/search`;
    
    // For parameterized searches, canonical points to normalized version
    if (hasParams) {
      const normalizedParams = new URLSearchParams();
      
      // Add parameters in consistent order (category, suburb, query)
      if (category) normalizedParams.set('category', category);
      if (suburb) normalizedParams.set('suburb', suburb);  
      if (query) normalizedParams.set('query', query);
      
      if (normalizedParams.toString()) {
        canonicalUrl += `?${normalizedParams.toString()}`;
      }
    }
    
    existingCanonical.setAttribute('href', canonicalUrl);
    
    // Update page title for better UX (not SEO indexed anyway)
    if (hasParams) {
      let titleParts = ['Search Results'];
      if (category) titleParts.push(category);
      if (suburb) titleParts.push(suburb);
      if (query) titleParts.push(`"${query}"`);
      document.title = `${titleParts.join(' - ')} | SuburbMates`;
    } else {
      document.title = 'Find Melbourne Businesses | SuburbMates';
    }
    
    // Cleanup function
    return () => {
      // Reset to default when component unmounts
      if (existingMetaRobots) {
        existingMetaRobots.setAttribute('content', 'index,follow');
      }
    };
  }, [searchParams]);
  
  return null; // This component only manipulates head tags
}