"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface SearchProps {
  placeholder?: string;
  onSearch?: (query: string, location: string) => void;
}

export default function EnhancedSearch({ 
  placeholder = "Search 'plumber', 'cafe', or a service...", 
  onSearch 
}: SearchProps) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const popularSearches = [
    "Cafes", "Plumbers", "Electricians", "Hair Salons", 
    "Restaurants", "Gyms", "Dentists", "Auto Repair"
  ];

  const melbourneSuburbs = [
    "Brunswick", "Fitzroy", "Carlton", "Northcote", 
    "Richmond", "South Yarra", "St Kilda", "Prahran"
  ];

  const handleSearch = () => {
    if (query.trim() || location.trim()) {
      onSearch?.(query, location);
      console.log(`Searching for: "${query}" in "${location}"`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative w-full max-w-3xl"
    >
      <div className="flex w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <Input
          className="min-w-0 flex-1 border-0 bg-transparent px-6 py-4 text-white placeholder:text-neutral-400 focus-visible:ring-0"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onKeyPress={handleKeyPress}
        />
        <div className="border-l border-white/10">
          <Input
            className="w-48 border-0 bg-transparent px-4 py-4 text-white placeholder:text-neutral-400 focus-visible:ring-0"
            placeholder="Suburb..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <Button 
          onClick={handleSearch}
          className="rounded-none bg-white/10 px-6 text-sm hover:bg-white/20"
          size="lg"
        >
          Search
        </Button>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && query.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 z-50 mt-2"
        >
          <Card className="bg-neutral-900/95 backdrop-blur-md border-white/10 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-neutral-300 mb-2">Popular Searches</h4>
                <div className="space-y-1">
                  {popularSearches
                    .filter(item => item.toLowerCase().includes(query.toLowerCase()))
                    .slice(0, 4)
                    .map((item) => (
                      <button
                        key={item}
                        className="block w-full text-left text-sm text-neutral-400 hover:text-white py-1 px-2 rounded hover:bg-white/5"
                        onClick={() => {
                          setQuery(item);
                          setShowSuggestions(false);
                        }}
                      >
                        {item}
                      </button>
                    ))
                  }
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-300 mb-2">Melbourne Suburbs</h4>
                <div className="space-y-1">
                  {melbourneSuburbs.slice(0, 4).map((suburb) => (
                    <button
                      key={suburb}
                      className="block w-full text-left text-sm text-neutral-400 hover:text-white py-1 px-2 rounded hover:bg-white/5"
                      onClick={() => {
                        setLocation(suburb);
                        setShowSuggestions(false);
                      }}
                    >
                      {suburb}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Quick Filters */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-4 flex flex-wrap gap-2"
      >
        <span className="text-xs text-neutral-400">Popular:</span>
        {popularSearches.slice(0, 6).map((term) => (
          <button
            key={term}
            onClick={() => {
              setQuery(term);
              handleSearch();
            }}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            {term}
          </button>
        ))}
      </motion.div>

      <div className="mt-4 text-xs text-neutral-400 text-center">
        <div className="flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            ABN verified
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Last checked Sept 2025
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Community reviews
          </span>
        </div>
      </div>
    </motion.div>
  );
}