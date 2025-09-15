// Melbourne Business Categories
// Comprehensive list of business categories for Suburbmates platform

export interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  popular: boolean;
  subcategories?: string[];
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  // Home & Trade Services
  {
    id: "plumbing",
    name: "Plumbing",
    description: "Plumbers, drain cleaning, pipe repairs",
    icon: "🔧",
    popular: true,
    subcategories: ["Emergency Plumbing", "Bathroom Renovations", "Drain Cleaning", "Hot Water Systems"]
  },
  {
    id: "electrical",
    name: "Electrical",
    description: "Electricians, wiring, installations",
    icon: "⚡",
    popular: true,
    subcategories: ["Residential Electrical", "Commercial Electrical", "Solar Installation", "Emergency Electrical"]
  },
  {
    id: "carpentry",
    name: "Carpentry & Joinery",
    description: "Carpenters, custom furniture, renovations",
    icon: "🔨",
    popular: true,
    subcategories: ["Custom Furniture", "Kitchen Renovations", "Decking", "Built-in Storage"]
  },
  {
    id: "painting",
    name: "Painting & Decorating",
    description: "House painters, commercial painting",
    icon: "🎨",
    popular: true,
    subcategories: ["Interior Painting", "Exterior Painting", "Commercial Painting", "Wallpaper Installation"]
  },
  {
    id: "landscaping",
    name: "Landscaping & Gardening",
    description: "Garden design, maintenance, tree services",
    icon: "🌱",
    popular: true,
    subcategories: ["Garden Design", "Lawn Maintenance", "Tree Services", "Irrigation Systems"]
  },
  {
    id: "cleaning",
    name: "Cleaning Services",
    description: "House cleaning, commercial cleaning",
    icon: "🧽",
    popular: true,
    subcategories: ["House Cleaning", "Office Cleaning", "Carpet Cleaning", "Window Cleaning"]
  },
  {
    id: "roofing",
    name: "Roofing & Guttering",
    description: "Roof repairs, gutter cleaning, installations",
    icon: "🏠",
    popular: false,
    subcategories: ["Roof Repairs", "Gutter Cleaning", "Roof Restoration", "Solar Panel Installation"]
  },
  {
    id: "hvac",
    name: "Heating & Cooling",
    description: "Air conditioning, heating systems",
    icon: "❄️",
    popular: false,
    subcategories: ["Air Conditioning", "Heating Systems", "Ducted Systems", "Split Systems"]
  },

  // Food & Hospitality
  {
    id: "cafe-restaurant",
    name: "Cafe & Restaurant",
    description: "Cafes, restaurants, food services",
    icon: "☕",
    popular: true,
    subcategories: ["Cafe", "Restaurant", "Takeaway", "Catering", "Food Truck"]
  },
  {
    id: "bakery",
    name: "Bakery & Patisserie",
    description: "Bakeries, cake shops, pastries",
    icon: "🥖",
    popular: false,
    subcategories: ["Bakery", "Cake Shop", "Patisserie", "Custom Cakes"]
  },
  {
    id: "bar-pub",
    name: "Bar & Pub",
    description: "Bars, pubs, breweries",
    icon: "🍺",
    popular: false,
    subcategories: ["Bar", "Pub", "Brewery", "Wine Bar", "Cocktail Bar"]
  },

  // Health & Beauty
  {
    id: "hair-beauty",
    name: "Hair & Beauty",
    description: "Hair salons, beauty services, spas",
    icon: "💇",
    popular: true,
    subcategories: ["Hair Salon", "Barber", "Beauty Salon", "Nail Salon", "Spa"]
  },
  {
    id: "fitness",
    name: "Fitness & Wellness",
    description: "Gyms, personal training, yoga studios",
    icon: "💪",
    popular: true,
    subcategories: ["Gym", "Personal Training", "Yoga Studio", "Pilates", "Massage Therapy"]
  },
  {
    id: "healthcare",
    name: "Healthcare",
    description: "Medical, dental, allied health",
    icon: "🏥",
    popular: false,
    subcategories: ["Medical Practice", "Dental", "Physiotherapy", "Psychology", "Optometry"]
  },

  // Automotive
  {
    id: "automotive",
    name: "Automotive",
    description: "Mechanics, car services, auto repairs",
    icon: "🚗",
    popular: true,
    subcategories: ["Mechanic", "Auto Electrical", "Panel Beating", "Car Detailing", "Tyre Services"]
  },

  // Professional Services
  {
    id: "accounting",
    name: "Accounting & Finance",
    description: "Accountants, bookkeeping, financial services",
    icon: "📊",
    popular: false,
    subcategories: ["Accounting", "Bookkeeping", "Tax Services", "Financial Planning"]
  },
  {
    id: "legal",
    name: "Legal Services",
    description: "Lawyers, solicitors, legal advice",
    icon: "⚖️",
    popular: false,
    subcategories: ["Family Law", "Property Law", "Business Law", "Criminal Law"]
  },
  {
    id: "real-estate",
    name: "Real Estate",
    description: "Real estate agents, property management",
    icon: "🏡",
    popular: true,
    subcategories: ["Sales Agent", "Property Management", "Buyer's Agent", "Property Development"]
  },
  {
    id: "marketing",
    name: "Marketing & Design",
    description: "Marketing, graphic design, web design",
    icon: "📱",
    popular: false,
    subcategories: ["Digital Marketing", "Graphic Design", "Web Design", "Photography", "Video Production"]
  },

  // Retail & Shopping
  {
    id: "retail",
    name: "Retail & Shopping",
    description: "Shops, boutiques, specialty stores",
    icon: "🛍️",
    popular: true,
    subcategories: ["Clothing Store", "Gift Shop", "Bookstore", "Electronics", "Home Decor"]
  },
  {
    id: "pet-services",
    name: "Pet Services",
    description: "Veterinary, grooming, pet care",
    icon: "🐕",
    popular: false,
    subcategories: ["Veterinary", "Pet Grooming", "Pet Sitting", "Dog Walking", "Pet Store"]
  },

  // Education & Training
  {
    id: "education",
    name: "Education & Training",
    description: "Tutoring, music lessons, training",
    icon: "📚",
    popular: false,
    subcategories: ["Tutoring", "Music Lessons", "Language School", "Driving School", "Skills Training"]
  },

  // Technology
  {
    id: "technology",
    name: "Technology & IT",
    description: "IT support, computer repair, tech services",
    icon: "💻",
    popular: false,
    subcategories: ["IT Support", "Computer Repair", "Web Development", "Software Development", "Phone Repair"]
  },

  // Entertainment & Events
  {
    id: "entertainment",
    name: "Entertainment & Events",
    description: "Event planning, entertainment, photography",
    icon: "🎉",
    popular: false,
    subcategories: ["Event Planning", "DJ Services", "Photography", "Catering", "Party Supplies"]
  },

  // Other/General
  {
    id: "other",
    name: "Other Services",
    description: "Services not listed above",
    icon: "🔧",
    popular: false,
    subcategories: ["Consulting", "Delivery Services", "Storage", "Security", "Other"]
  }
];

// Helper functions
export const getPopularCategories = (): BusinessCategory[] => {
  return BUSINESS_CATEGORIES.filter(category => category.popular);
};

export const getCategoryById = (id: string): BusinessCategory | undefined => {
  return BUSINESS_CATEGORIES.find(category => category.id === id);
};

export const getCategoryNames = (): string[] => {
  return BUSINESS_CATEGORIES.map(category => category.name);
};

export const searchCategories = (query: string): BusinessCategory[] => {
  const lowercaseQuery = query.toLowerCase();
  return BUSINESS_CATEGORIES.filter(category => 
    category.name.toLowerCase().includes(lowercaseQuery) ||
    category.description.toLowerCase().includes(lowercaseQuery) ||
    category.subcategories?.some(sub => sub.toLowerCase().includes(lowercaseQuery))
  );
};

// Melbourne-specific business insights
export const MELBOURNE_BUSINESS_INSIGHTS = {
  mostPopular: ["Cafe & Restaurant", "Hair & Beauty", "Real Estate", "Plumbing", "Automotive"],
  emerging: ["Fitness & Wellness", "Technology & IT", "Marketing & Design"],
  seasonal: {
    summer: ["Landscaping & Gardening", "Cleaning Services", "Roofing & Guttering"],
    winter: ["Heating & Cooling", "Healthcare", "Entertainment & Events"]
  }
};

// Category validation
export const isValidCategory = (categoryId: string): boolean => {
  return BUSINESS_CATEGORIES.some(category => category.id === categoryId);
};

export const getCategoryDisplayName = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category ? category.name : categoryId;
};