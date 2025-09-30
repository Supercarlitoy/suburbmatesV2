// Test Mapbox integration
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env.local') });

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

async function testGeocode(address) {
  try {
    console.log(`\n🔍 Testing geocoding for: "${address}"`);
    
    const encodedAddress = encodeURIComponent(`${address}, Melbourne, VIC, Australia`);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}&country=AU&proximity=144.9631,-37.8136&limit=1`;
    
    console.log(`📡 API URL: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [longitude, latitude] = feature.geometry.coordinates;
      
      console.log(`✅ Success!`);
      console.log(`  📍 Coordinates: ${latitude}, ${longitude}`);
      console.log(`  📝 Formatted: ${feature.place_name}`);
      
      // Extract context
      if (feature.context) {
        const context = {};
        feature.context.forEach(ctx => {
          if (ctx.id.startsWith('locality') || ctx.id.startsWith('place')) {
            context.suburb = ctx.text;
          }
          if (ctx.id.startsWith('postcode')) {
            context.postcode = ctx.text;
          }
          if (ctx.id.startsWith('region')) {
            context.state = ctx.text;
          }
        });
        
        if (Object.keys(context).length > 0) {
          console.log(`  🏘️ Context:`, context);
        }
      }
    } else {
      console.log(`⚠️  No results found for "${address}"`);
    }
  } catch (error) {
    console.error(`❌ Error geocoding "${address}":`, error.message);
  }
}

async function main() {
  console.log('🗺️  SuburbMates Mapbox Integration Test');
  console.log('=====================================');
  
  if (!MAPBOX_TOKEN) {
    console.error('❌ NEXT_PUBLIC_MAPBOX_TOKEN not found in environment variables');
    process.exit(1);
  }
  
  console.log(`✅ Mapbox token loaded: ${MAPBOX_TOKEN.substring(0, 20)}...`);
  
  // Test various Melbourne addresses
  const testAddresses = [
    '123 Collins Street, Melbourne',
    '456 Chapel Street, South Yarra',
    '789 Burke Road, Camberwell',
    'Federation Square, Melbourne',
    'Crown Casino, Southbank'
  ];
  
  for (const address of testAddresses) {
    await testGeocode(address);
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
  }
  
  console.log('\n🏁 Test completed!');
}

main().catch(console.error);