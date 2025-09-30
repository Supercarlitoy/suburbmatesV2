/**
 * Mapbox Services
 * 
 * Geocoding and mapping utilities for SuburbMates
 */

interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
}

interface MapboxResponse {
  features: Array<{
    geometry: {
      coordinates: [number, number]; // [lng, lat]
    };
    place_name: string;
    context?: Array<{
      id: string;
      text: string;
    }>;
  }>;
}

/**
 * Geocode an address using Mapbox Geocoding API
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    console.error('Mapbox token not found in environment variables');
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(`${address}, Melbourne, VIC, Australia`);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${token}&country=AU&proximity=144.9631,-37.8136&limit=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Mapbox geocoding failed:', response.statusText);
      return null;
    }

    const data: MapboxResponse = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [longitude, latitude] = feature.geometry.coordinates;
      
      // Extract suburb and postcode from context
      let suburb = '';
      let postcode = '';
      let state = 'VIC';
      
      if (feature.context) {
        for (const context of feature.context) {
          if (context.id.startsWith('locality') || context.id.startsWith('place')) {
            suburb = context.text;
          }
          if (context.id.startsWith('postcode')) {
            postcode = context.text;
          }
          if (context.id.startsWith('region')) {
            state = context.text;
          }
        }
      }

      return {
        latitude,
        longitude,
        formattedAddress: feature.place_name,
        suburb: suburb || undefined,
        state: state || 'VIC',
        postcode: postcode || undefined
      };
    }

    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to get address details
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    console.error('Mapbox token not found in environment variables');
    return null;
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=address&limit=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Mapbox reverse geocoding failed:', response.statusText);
      return null;
    }

    const data: MapboxResponse = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [longitude, latitude] = feature.geometry.coordinates;
      
      let suburb = '';
      let postcode = '';
      let state = 'VIC';
      
      if (feature.context) {
        for (const context of feature.context) {
          if (context.id.startsWith('locality') || context.id.startsWith('place')) {
            suburb = context.text;
          }
          if (context.id.startsWith('postcode')) {
            postcode = context.text;
          }
          if (context.id.startsWith('region')) {
            state = context.text;
          }
        }
      }

      return {
        latitude,
        longitude,
        formattedAddress: feature.place_name,
        suburb: suburb || undefined,
        state: state || 'VIC', 
        postcode: postcode || undefined
      };
    }

    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}

/**
 * Get Melbourne suburb bounds for map display
 */
export function getMelbourneBounds(): [[number, number], [number, number]] {
  // Melbourne metropolitan area bounds [southwest, northeast]
  return [
    [144.5937, -38.4339], // Southwest
    [145.8781, -37.5113]  // Northeast
  ];
}

/**
 * Get Melbourne center coordinates
 */
export function getMelbourneCenter(): [number, number] {
  return [144.9631, -37.8136]; // [lng, lat]
}

/**
 * Calculate distance between two points (in kilometers)
 */
export function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}