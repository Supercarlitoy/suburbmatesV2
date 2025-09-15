/**
 * Comprehensive Melbourne Suburbs Library
 * 
 * This file contains the complete list of Melbourne suburbs organized by region.
 * Import this file anywhere suburb data is needed to ensure consistency across the platform.
 */

// Comprehensive Melbourne suburbs list (Inner, Middle, and Outer Melbourne)
export const MELBOURNE_SUBURBS = [
  // Inner Melbourne
  "Abbotsford", "Albert Park", "Carlton", "Carlton North", "Collingwood", "Cremorne",
  "Docklands", "East Melbourne", "Fitzroy", "Fitzroy North", "Flemington", "Kensington",
  "Melbourne", "North Melbourne", "Parkville", "Port Melbourne", "Potts Point",
  "Richmond", "South Melbourne", "South Wharf", "Southbank", "West Melbourne",
  
  // Inner South
  "Armadale", "Ashwood", "Balaclava", "Bentleigh", "Bentleigh East", "Brighton",
  "Brighton East", "Burwood", "Burwood East", "Camberwell", "Carnegie", "Caulfield",
  "Caulfield East", "Caulfield North", "Caulfield South", "Chapel Street", "Cheltenham",
  "Elsternwick", "Elwood", "Glen Huntly", "Glen Iris", "Hawthorn", "Hawthorn East",
  "Highett", "Kooyong", "Malvern", "Malvern East", "Middle Park", "Moorabbin",
  "Ormond", "Prahran", "Ripponlea", "South Yarra", "St Kilda", "St Kilda East",
  "St Kilda West", "Toorak", "Windsor",
  
  // Inner East
  "Alphington", "Balwyn", "Balwyn North", "Blackburn", "Blackburn North",
  "Blackburn South", "Boroondara", "Box Hill", "Box Hill North", "Box Hill South",
  "Bulleen", "Canterbury", "Deepdene", "Doncaster", "Doncaster East", "Doncaster Heights",
  "Forest Hill", "Kew", "Kew East", "Mont Albert", "Mont Albert North", "Nunawading",
  "Surrey Hills", "Templestowe", "Templestowe Lower",
  
  // Inner North
  "Ascot Vale", "Brunswick", "Brunswick East", "Brunswick West", "Clifton Hill",
  "Coburg", "Coburg North", "Essendon", "Essendon North", "Fairfield", "Heidelberg",
  "Heidelberg Heights", "Heidelberg West", "Ivanhoe", "Ivanhoe East", "Moonee Ponds",
  "Northcote", "Preston", "Princes Hill", "Reservoir", "Thornbury", "Yarraville",
  
  // Middle Melbourne - South East
  "Ashburton", "Beaumaris", "Burwood Heights", "Clayton",
  "Clayton South", "Glen Waverley", "Hampton", "Hampton East", "Huntingdale",
  "McKinnon", "Murrumbeena", "Notting Hill", "Oakleigh", "Oakleigh East",
  "Oakleigh South", "Sandringham", "Syndal", "Wheelers Hill",
  
  // Middle Melbourne - East
  "Bayswater", "Bayswater North", "Boronia", "Ferntree Gully", "Glen Waverley",
  "Knoxfield", "Mount Waverley", "Scoresby", "The Basin", "Vermont", "Vermont South",
  "Wantirna", "Wantirna South",
  
  // Middle Melbourne - North
  "Bundoora", "Fawkner", "Glenroy", "Hadfield", "Macleod", "Pascoe Vale",
  "Pascoe Vale South", "Strathmore", "Strathmore Heights",
  
  // Middle Melbourne - West
  "Altona", "Altona Meadows", "Altona North", "Avondale Heights", "Footscray",
  "Kingsville", "Maidstone", "Maribyrnong", "Newport", "Seddon", "Spotswood",
  "West Footscray", "Williamstown", "Williamstown North",
  
  // Outer Melbourne - South East
  "Berwick", "Carrum", "Carrum Downs", "Chelsea", "Chelsea Heights", "Cranbourne",
  "Dandenong", "Dandenong North", "Dandenong South", "Edithvale", "Endeavour Hills",
  "Frankston", "Frankston North", "Frankston South", "Hallam", "Hampton Park",
  "Keysborough", "Lynbrook", "Lyndhurst", "Mordialloc", "Narre Warren",
  "Narre Warren North", "Narre Warren South", "Noble Park", "Noble Park North",
  "Parkdale", "Patterson Lakes", "Seaford", "Springvale", "Springvale South",
  
  // Outer Melbourne - East
  "Belgrave", "Belgrave Heights", "Belgrave South", "Croydon", "Croydon Hills",
  "Croydon North", "Croydon South", "Kilsyth", "Kilsyth South", "Lilydale",
  "Mitcham", "Montrose", "Mooroolbark", "Mount Evelyn", "Ringwood", "Ringwood East",
  "Ringwood North", "Rowville", "Tecoma", "Upwey", "Warranwood",
  
  // Outer Melbourne - North
  "Broadmeadows", "Campbellfield", "Coolaroo", "Craigieburn", "Dallas",
  "Epping", "Greenvale", "Jacana", "Lalor", "Mill Park", "Roxburgh Park",
  "South Morang", "Thomastown", "Tullamarine",
  
  // Outer Melbourne - West
  "Albion", "Braybrook", "Brooklyn", "Caroline Springs", "Deer Park", "Derrimut",
  "Hoppers Crossing", "Keilor", "Keilor Downs", "Keilor East", "Keilor Lodge",
  "Keilor Park", "Laverton", "Point Cook", "St Albans", "Sunshine", "Sunshine North",
  "Sunshine West", "Sydenham", "Tarneit", "Truganina", "Werribee", "Werribee South",
  "Williams Landing"
].sort();

// Organized by regions for easier filtering
export const MELBOURNE_SUBURBS_BY_REGION = {
  inner: [
    "Abbotsford", "Albert Park", "Carlton", "Carlton North", "Collingwood", "Cremorne",
    "Docklands", "East Melbourne", "Fitzroy", "Fitzroy North", "Flemington", "Kensington",
    "Melbourne", "North Melbourne", "Parkville", "Port Melbourne", "Potts Point",
    "Richmond", "South Melbourne", "South Wharf", "Southbank", "West Melbourne"
  ].sort(),
  
  innerSouth: [
    "Armadale", "Ashwood", "Balaclava", "Bentleigh", "Bentleigh East", "Brighton",
    "Brighton East", "Burwood", "Burwood East", "Camberwell", "Carnegie", "Caulfield",
    "Caulfield East", "Caulfield North", "Caulfield South", "Chapel Street", "Cheltenham",
    "Elsternwick", "Elwood", "Glen Huntly", "Glen Iris", "Hawthorn", "Hawthorn East",
    "Highett", "Kooyong", "Malvern", "Malvern East", "Middle Park", "Moorabbin",
    "Ormond", "Prahran", "Ripponlea", "South Yarra", "St Kilda", "St Kilda East",
    "St Kilda West", "Toorak", "Windsor"
  ].sort(),
  
  innerEast: [
    "Alphington", "Balwyn", "Balwyn North", "Blackburn", "Blackburn North",
    "Blackburn South", "Boroondara", "Box Hill", "Box Hill North", "Box Hill South",
    "Bulleen", "Canterbury", "Deepdene", "Doncaster", "Doncaster East", "Doncaster Heights",
    "Forest Hill", "Kew", "Kew East", "Mont Albert", "Mont Albert North", "Nunawading",
    "Surrey Hills", "Templestowe", "Templestowe Lower"
  ].sort(),
  
  innerNorth: [
    "Ascot Vale", "Brunswick", "Brunswick East", "Brunswick West", "Clifton Hill",
    "Coburg", "Coburg North", "Essendon", "Essendon North", "Fairfield", "Heidelberg",
    "Heidelberg Heights", "Heidelberg West", "Ivanhoe", "Ivanhoe East", "Moonee Ponds",
    "Northcote", "Preston", "Princes Hill", "Reservoir", "Thornbury", "Yarraville"
  ].sort(),
  
  middle: [
    "Ashburton", "Beaumaris", "Burwood Heights", "Clayton",
    "Clayton South", "Glen Waverley", "Hampton", "Hampton East", "Huntingdale",
    "McKinnon", "Murrumbeena", "Notting Hill", "Oakleigh", "Oakleigh East",
    "Oakleigh South", "Sandringham", "Syndal", "Wheelers Hill", "Bayswater",
    "Bayswater North", "Boronia", "Ferntree Gully", "Knoxfield", "Mount Waverley",
    "Scoresby", "The Basin", "Vermont", "Vermont South", "Wantirna", "Wantirna South",
    "Bundoora", "Fawkner", "Glenroy", "Hadfield", "Macleod", "Pascoe Vale",
    "Pascoe Vale South", "Strathmore", "Strathmore Heights", "Altona", "Altona Meadows",
    "Altona North", "Avondale Heights", "Footscray", "Kingsville", "Maidstone",
    "Maribyrnong", "Newport", "Seddon", "Spotswood", "West Footscray",
    "Williamstown", "Williamstown North"
  ].sort(),
  
  outer: [
    "Berwick", "Carrum", "Carrum Downs", "Chelsea", "Chelsea Heights", "Cranbourne",
    "Dandenong", "Dandenong North", "Dandenong South", "Edithvale", "Endeavour Hills",
    "Frankston", "Frankston North", "Frankston South", "Hallam", "Hampton Park",
    "Keysborough", "Lynbrook", "Lyndhurst", "Mordialloc", "Narre Warren",
    "Narre Warren North", "Narre Warren South", "Noble Park", "Noble Park North",
    "Parkdale", "Patterson Lakes", "Seaford", "Springvale", "Springvale South",
    "Belgrave", "Belgrave Heights", "Belgrave South", "Croydon", "Croydon Hills",
    "Croydon North", "Croydon South", "Kilsyth", "Kilsyth South", "Lilydale",
    "Mitcham", "Montrose", "Mooroolbark", "Mount Evelyn", "Ringwood", "Ringwood East",
    "Ringwood North", "Rowville", "Tecoma", "Upwey", "Warranwood",
    "Broadmeadows", "Campbellfield", "Coolaroo", "Craigieburn", "Dallas",
    "Epping", "Greenvale", "Jacana", "Lalor", "Mill Park", "Roxburgh Park",
    "South Morang", "Thomastown", "Tullamarine", "Albion", "Braybrook", "Brooklyn",
    "Caroline Springs", "Deer Park", "Derrimut", "Hoppers Crossing", "Keilor",
    "Keilor Downs", "Keilor East", "Keilor Lodge", "Keilor Park", "Laverton",
    "Point Cook", "St Albans", "Sunshine", "Sunshine North", "Sunshine West",
    "Sydenham", "Tarneit", "Truganina", "Werribee", "Werribee South", "Williams Landing"
  ].sort()
};

// Popular suburbs for quick access
export const POPULAR_MELBOURNE_SUBURBS = [
  "Melbourne", "Richmond", "Fitzroy", "St Kilda", "South Yarra", "Prahran",
  "Carlton", "Collingwood", "Brunswick", "Northcote", "Hawthorn", "Camberwell",
  "Brighton", "Toorak", "Kew", "Malvern", "Doncaster", "Box Hill", "Glen Waverley",
  "Oakleigh", "Bentleigh", "Caulfield", "Essendon", "Moonee Ponds", "Footscray"
].sort();

// Utility functions
export const getSuburbsByRegion = (region: keyof typeof MELBOURNE_SUBURBS_BY_REGION) => {
  return MELBOURNE_SUBURBS_BY_REGION[region];
};

export const isValidMelbourneSuburb = (suburb: string): boolean => {
  return MELBOURNE_SUBURBS.includes(suburb);
};

export const searchSuburbs = (query: string): string[] => {
  if (!query.trim()) return MELBOURNE_SUBURBS;
  
  const searchTerm = query.toLowerCase().trim();
  return MELBOURNE_SUBURBS.filter(suburb => 
    suburb.toLowerCase().includes(searchTerm)
  );
};

export const getSuburbRegion = (suburb: string): string | null => {
  for (const [region, suburbs] of Object.entries(MELBOURNE_SUBURBS_BY_REGION)) {
    if (suburbs.includes(suburb)) {
      return region;
    }
  }
  return null;
};

// Export total count for reference
export const TOTAL_SUBURBS_COUNT = MELBOURNE_SUBURBS.length;