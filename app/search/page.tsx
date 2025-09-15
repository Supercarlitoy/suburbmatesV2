"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search, MapPin, Filter, Building2, Phone, Globe, Mail, Star, Lightbulb, Zap } from "lucide-react";
import Link from "next/link";
import { MELBOURNE_SUBURBS } from "@/lib/melbourne-suburbs";
import { BUSINESS_CATEGORIES } from "@/lib/business-categories";
import { rerankSearchResults, isClientRerankEnabled, getRerankStats } from "@/lib/search/client-rerank";

interface Business {
  id: string;
  slug: string;
  name: string;
  bio?: string;
  suburb: string;
  category?: string;
  phone?: string;
  email: string;
  website?: string;
  logo?: string;
  serviceAreas: string[];
  status: string;
  createdAt: string;
  search_score?: number;
}

interface SearchSuggestion {
  type: 'suburb' | 'category';
  original: string;
  suggestion: string;
  similarity: number;
}

interface SearchResponse {
  businesses: Business[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  suggestions?: SearchSuggestion[];
  filters: {
    query?: string;
    suburb?: string;
    category?: string;
  };
  clientRerank?: boolean;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSuburb, setSelectedSuburb] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showRerankInfo, setShowRerankInfo] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });

  useEffect(() => {
    searchBusinesses();
  }, [searchQuery, selectedSuburb, selectedCategory]);

  const searchBusinesses = async (offset = 0) => {
    setLoading(true);
    setError("");
    setSuggestions([]);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedSuburb) params.append('suburb', selectedSuburb);
      if (selectedCategory) params.append('category', selectedCategory);
      params.append('limit', '20');
      params.append('offset', offset.toString());
      
      // Enable client reranking if available
      if (isClientRerankEnabled()) {
        params.append('clientRerank', 'true');
      }

      const response = await fetch(`/api/business/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to search businesses');
      }

      const data: SearchResponse = await response.json();
      
      // Apply client-side reranking if enabled and we have a search query
       let processedBusinesses = data.businesses;
       if (searchQuery && isClientRerankEnabled()) {
         const originalBusinesses = [...data.businesses];
         processedBusinesses = rerankSearchResults(data.businesses as any[], searchQuery) as Business[];
         
         // Log rerank stats for debugging (only in development)
         if (process.env.NODE_ENV === 'development') {
           const stats = getRerankStats(originalBusinesses as any[], processedBusinesses as any[], searchQuery);
           console.log('Client rerank stats:', stats);
         }
       }
      
      if (offset === 0) {
        setBusinesses(processedBusinesses);
      } else {
        setBusinesses(prev => [...prev, ...processedBusinesses]);
      }
      
      setPagination(data.pagination);
      
      // Set suggestions if available
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search businesses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      searchBusinesses(pagination.offset + pagination.limit);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSuburb("");
    setSelectedCategory("");
  };

  const BusinessCard = ({ business }: { business: Business }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{business.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              {business.category && (
                <Badge variant="secondary">{business.category}</Badge>
              )}
              <span className="flex items-center gap-1 text-sm">
                <MapPin className="h-3 w-3" />
                {business.suburb}
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {business.bio && (
          <p className="text-gray-600 mb-4 line-clamp-2">{business.bio}</p>
        )}
        
        <div className="space-y-2 mb-4">
          {business.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{business.phone}</span>
            </div>
          )}
          {business.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-gray-400" />
              <a href={business.website} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:underline">
                Visit Website
              </a>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <span>{business.email}</span>
          </div>
        </div>

        {business.serviceAreas && business.serviceAreas.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Service Areas:</p>
            <div className="flex flex-wrap gap-1">
              {business.serviceAreas.slice(0, 3).map((area) => (
                <Badge key={area} variant="outline" className="text-xs">
                  {area}
                </Badge>
              ))}
              {business.serviceAreas.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{business.serviceAreas.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Link href={`/business/${business.slug}`} className="flex-1">
            <Button className="w-full">View Profile</Button>
          </Link>
          <Button variant="outline" size="sm">
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Local Businesses</h1>
          <p className="text-gray-600">Discover trusted businesses in Melbourne</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Business name, service..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Separator />

                {/* Suburb Filter */}
                <div className="space-y-2">
                  <Label>Suburb</Label>
                  <Select value={selectedSuburb} onValueChange={setSelectedSuburb}>
                    <SelectTrigger>
                      <SelectValue placeholder="All suburbs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All suburbs</SelectItem>
                      {MELBOURNE_SUBURBS.map((suburb) => (
                        <SelectItem key={suburb} value={suburb}>
                          {suburb}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {BUSINESS_CATEGORIES.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {loading && pagination.total === 0 ? (
                    "Searching..."
                  ) : (
                    `${pagination.total} businesses found`
                  )}
                </h2>
                {(searchQuery || selectedSuburb || selectedCategory) && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-500">Filtered by:</span>
                    {searchQuery && (
                      <Badge variant="secondary">
                        "{searchQuery}"
                      </Badge>
                    )}
                    {selectedSuburb && (
                      <Badge variant="secondary">
                        {selectedSuburb}
                      </Badge>
                    )}
                    {selectedCategory && (
                      <Badge variant="secondary">
                        {selectedCategory}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Error State */}
            {error && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-red-600 mb-4">{error}</div>
                  <Button onClick={() => searchBusinesses()}>
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <Alert className="mb-6">
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Did you mean:</div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (suggestion.type === 'suburb') {
                            setSelectedSuburb(suggestion.suggestion);
                          } else {
                            setSelectedCategory(suggestion.suggestion);
                          }
                          setSearchQuery(suggestion.suggestion);
                        }}
                        className="text-xs"
                      >
                        {suggestion.suggestion} ({suggestion.type})
                      </Button>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Client Rerank Info */}
            {isClientRerankEnabled() && searchQuery && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <Zap className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      🚀 Enhanced search with AI reranking enabled
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRerankInfo(!showRerankInfo)}
                      className="text-green-700 hover:text-green-900"
                    >
                      {showRerankInfo ? 'Hide' : 'Show'} Details
                    </Button>
                  </div>
                  {showRerankInfo && (
                    <div className="mt-2 text-xs text-green-700">
                      Results are optimized using phrase matching and typo tolerance for better relevance.
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {loading && businesses.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}

            {/* Business Grid */}
            {!loading && !error && businesses.length > 0 && (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  {businesses.map((business) => (
                    <BusinessCard key={business.id} business={business} />
                  ))}
                </div>
                
                {/* Load More */}
                {pagination.hasMore && (
                  <div className="text-center mt-8">
                    <Button 
                      onClick={loadMore} 
                      disabled={loading}
                      variant="outline"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!loading && !error && businesses.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No businesses found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or browse all businesses.
                  </p>
                  <Button onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}