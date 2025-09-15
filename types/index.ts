// Core Business Types
export interface Business {
  id: string;
  slug: string;
  name: string;
  abn: string;
  email: string;
  bio?: string;
  suburb: string;
  postcode?: string;
  phone?: string;
  website?: string;
  logo?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Content/Posts Types
export interface Content {
  id: string;
  businessId: string;
  type: 'post' | 'update' | 'announcement';
  title?: string;
  text: string;
  images?: string[];
  tags?: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  business?: Business;
}

// Lead Management Types
export interface Lead {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  source: 'profile' | 'search' | 'feed' | 'share';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
  createdAt: Date;
  business?: Business;
}

// User Types
export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
  business?: Business;
}

// Search & Discovery Types
export interface SearchFilters {
  suburb?: string;
  postcode?: string;
  category?: string;
  verified?: boolean;
  query?: string;
}

export interface SearchResult {
  businesses: Business[];
  total: number;
  page: number;
  limit: number;
}

// Sharing Types
export interface ShareCard {
  id: string;
  businessId: string;
  title: string;
  description: string;
  image?: string;
  url: string;
  metadata: {
    ogTitle: string;
    ogDescription: string;
    ogImage?: string;
  };
  createdAt: Date;
}

// ABR API Types
export interface ABRResponse {
  ABN: string;
  entityName: string;
  entityType: string;
  status: string;
  GST: boolean;
  DGR: boolean;
  address?: {
    state: string;
    postcode: string;
    suburb: string;
  };
}

// Form Types
export interface SignupForm {
  abn: string;
  email: string;
  password: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface ProfileForm {
  name: string;
  bio: string;
  suburb: string;
  postcode: string;
  phone?: string;
  website?: string;
}

export interface ContentForm {
  type: 'post' | 'update' | 'announcement';
  title?: string;
  text: string;
  tags?: string[];
  isPublic: boolean;
}

export interface LeadForm {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}