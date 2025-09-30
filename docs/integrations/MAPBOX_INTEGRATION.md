# Mapbox Integration for SuburbMates

## Overview

This document outlines the complete Mapbox integration implemented for the SuburbMates platform, enabling geolocation, interactive maps, and geocoding functionality for Melbourne businesses.

## Integration Status ✅ COMPLETE

### Environment Configuration
- **Mapbox Token**: Successfully configured in `.env.local`
- **Token Format**: `pk.eyJ1IjoiY2FybGdhbGxhcmRvIiwiYSI6ImNtZTV0aHNjcTB3eW0ydnBycHpkbjU4NngifQ.azAdYMkgLGvlEv-z3T2YYQ`
- **API Access**: Verified and working with Australian geocoding

### Database Schema Updates
Added geographic fields to the Business model:
```prisma
// Geolocation data
latitude     Float?
longitude    Float?
```

### Package Dependencies Installed
```json
{
  "mapbox-gl": "^latest",
  "@types/mapbox-gl": "^latest", 
  "react-map-gl": "^latest",
  "lodash": "^latest",
  "@types/lodash": "^latest"
}
```

## Core Components

### 1. Mapbox Service (`lib/services/mapbox.ts`)

**Functions:**
- `geocodeAddress(address: string)` - Convert addresses to coordinates
- `reverseGeocode(lat: number, lng: number)` - Convert coordinates to addresses
- `getMelbourneBounds()` - Get Melbourne metropolitan bounds
- `getMelbourneCenter()` - Get Melbourne city center coordinates
- `calculateDistance()` - Calculate distance between two points

**Features:**
- Melbourne-focused geocoding (proximity biased)
- Australian address formatting
- Suburb and postcode extraction
- Error handling and rate limiting

### 2. BusinessMap Component (`components/business/BusinessMap.tsx`)

**Props:**
```typescript
interface BusinessMapProps {
  businesses: Business[];
  selectedBusiness?: Business;
  onBusinessSelect?: (business: Business) => void;
  height?: string;
  showPopups?: boolean;
  interactive?: boolean;
}
```

**Features:**
- Interactive Melbourne business map
- Custom markers with business information
- Popup windows with business details
- Auto-fitting bounds for multiple businesses
- Navigation controls
- Responsive design

### 3. AddressInput Component (`components/business/AddressInput.tsx`)

**Props:**
```typescript
interface AddressInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (address: string, coordinates?: object) => void;
  onGeocodeResult?: (result: GeocodeResult | null) => void;
  disabled?: boolean;
  className?: string;
}
```

**Features:**
- Real-time address geocoding with debouncing (800ms)
- Visual feedback for geocoding status
- Melbourne address autocomplete
- Coordinate extraction and validation
- Error handling and user feedback

## API Endpoints

### Geocoding API (`/api/mapbox/geocode`)

**GET Endpoint:**
```
GET /api/mapbox/geocode?address=123 Collins Street, Melbourne
```

**POST Endpoint:**
```json
POST /api/mapbox/geocode
{
  "address": "123 Collins Street, Melbourne"
}
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "latitude": -37.815012,
    "longitude": 144.969833,
    "formattedAddress": "123 Collins Street, Melbourne Victoria 3000, Australia",
    "suburb": "Melbourne",
    "state": "Victoria",
    "postcode": "3000"
  }
}
```

## Testing and Validation

### 1. Automated Test Script
```bash
npm run test:mapbox
```

**Results:**
- ✅ Collins Street, Melbourne: -37.815012, 144.969833
- ✅ Chapel Street, South Yarra: -37.843846, 144.99474
- ✅ Burke Road, Camberwell: -37.829297, 145.056937
- ✅ Federation Square: -37.814198, 144.96333
- ✅ Crown Casino, Southbank: -37.824951, 144.958964

### 2. Interactive Demo Page
Visit `/test-mapbox` for a complete interactive demonstration:
- Real-time geocoding
- Interactive business map
- Address-to-coordinate conversion
- Business location plotting
- Map controls and interactions

## CSV Import/Export Integration

The existing CSV operations already support latitude/longitude fields:

**CSV Import:**
```typescript
// CSV headers supported
latitude?: string;
longitude?: string;

// Automatic parsing to Float
latitude: row.latitude ? parseFloat(row.latitude) : null,
longitude: row.longitude ? parseFloat(row.longitude) : null,
```

**CSV Export:**
```typescript
// Export includes coordinates
latitude: b.latitude || '',
longitude: b.longitude || '',
```

## Quality Scoring Enhancement

The quality scoring system gives bonus points for businesses with location data:
```typescript
if (business.latitude && business.longitude) {
  score += 5; // Location verified bonus
}
```

## Melbourne-Specific Features

### Geocoding Configuration
- **Country Filter**: Restricted to Australia (`&country=AU`)
- **Proximity Bias**: Melbourne CBD (-37.8136, 144.9631)
- **Search Radius**: Metropolitan Melbourne area
- **Address Format**: Australian addressing standards

### Suburb Mapping
- Integration with existing Melbourne suburbs list (603 suburbs)
- Automatic suburb extraction from geocoded addresses
- Postcode validation and extraction
- State normalization (Victoria/VIC)

## Usage Examples

### Basic Map Display
```jsx
import BusinessMap from '@/components/business/BusinessMap';

<BusinessMap
  businesses={melbourneBusinesses}
  height="400px"
  showPopups={true}
/>
```

### Address Input with Geocoding
```jsx
import AddressInput from '@/components/business/AddressInput';

<AddressInput
  label="Business Address"
  placeholder="Enter Melbourne address..."
  onGeocodeResult={(result) => {
    console.log('Coordinates:', result.latitude, result.longitude);
    console.log('Suburb:', result.suburb);
  }}
/>
```

### Programmatic Geocoding
```typescript
import { geocodeAddress } from '@/lib/services/mapbox';

const result = await geocodeAddress('123 Collins Street, Melbourne');
if (result) {
  console.log('Location found:', result.latitude, result.longitude);
}
```

## Production Deployment Checklist

### Environment Variables
```bash
# Required for production
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiY2FybGdhbGxhcmRvIiwiYSI6ImNtZTV0aHNjcTB3eW0ydnBycHpkbjU4NngifQ.azAdYMkgLGvlEv-z3T2YYQ
```

### Database Migration
```bash
npx prisma db push  # Already applied
```

### Mapbox Account Settings
- Token permissions: Geocoding API access
- Domain restrictions: Configure for production domain
- Usage monitoring: Set up billing alerts
- Rate limiting: Monitor API usage

### Performance Considerations
- Geocoding requests are debounced (800ms)
- Results are cached in components
- Error handling prevents API abuse
- Melbourne proximity bias reduces API calls

## Security and Best Practices

### API Security
- Token exposed as public environment variable (required by Mapbox GL JS)
- Domain restrictions should be configured in Mapbox dashboard
- Rate limiting implemented at component level
- Error handling prevents information leakage

### Data Privacy
- No user location tracking without consent
- Business addresses are publicly accessible data
- Geocoded results cached only in session
- No sensitive coordinate data stored

## Future Enhancements

### Planned Features
1. **Batch Geocoding**: Process multiple addresses in CSV imports
2. **Service Area Maps**: Visual radius/polygon mapping for service areas
3. **Location-Based Search**: Distance filtering in business search
4. **Driving Directions**: Integration with Mapbox Directions API
5. **Street View**: Street-level business photography
6. **Location Analytics**: Heat maps and location insights

### Integration Opportunities
1. **Business Registration**: Auto-geocode new business addresses
2. **Profile Customization**: Location-based theme suggestions
3. **Lead Management**: Distance-based lead routing
4. **Search Enhancement**: Proximity-based search ranking
5. **Service Areas**: Visual coverage mapping

## Troubleshooting

### Common Issues

**Map not loading:**
- Check NEXT_PUBLIC_MAPBOX_TOKEN is set
- Verify token has correct permissions
- Check browser console for CORS errors

**Geocoding not working:**
- Verify API endpoint accessibility
- Check address format (Melbourne, Australia)
- Monitor rate limiting and quota usage

**Performance issues:**
- Reduce number of markers on map
- Implement marker clustering for large datasets
- Optimize component re-renders

### Support Resources
- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [React Map GL Documentation](https://visgl.github.io/react-map-gl/)
- [Mapbox Geocoding API](https://docs.mapbox.com/api/search/geocoding/)

## Conclusion

The Mapbox integration is now fully functional and production-ready for the SuburbMates platform. It provides:

- ✅ Complete geocoding functionality for Melbourne addresses
- ✅ Interactive business location mapping
- ✅ Real-time address validation and coordinates extraction
- ✅ Database schema support for geographic data
- ✅ CSV import/export with location data
- ✅ Quality scoring enhancements for location data
- ✅ Comprehensive testing and validation tools

The integration follows Melbourne-specific conventions and supports the existing SuburbMates business directory architecture while adding powerful location-based features.