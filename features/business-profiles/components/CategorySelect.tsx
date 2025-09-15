"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  BUSINESS_CATEGORIES, 
  getPopularCategories, 
  getCategoryById,
  type BusinessCategory 
} from "@/lib/constants/business-categories";

interface CategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showPopular?: boolean;
}

export function CategorySelect({
  value,
  onChange,
  placeholder = "Select business category...",
  className,
  disabled = false,
  showPopular = true
}: CategorySelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selectedCategory = value ? getCategoryById(value) : null;
  const popularCategories = getPopularCategories();
  
  const filteredCategories = React.useMemo(() => {
    if (!searchValue) return BUSINESS_CATEGORIES;
    
    const lowercaseSearch = searchValue.toLowerCase();
    return BUSINESS_CATEGORIES.filter(category => 
      category.name.toLowerCase().includes(lowercaseSearch) ||
      category.description.toLowerCase().includes(lowercaseSearch) ||
      category.subcategories?.some(sub => sub.toLowerCase().includes(lowercaseSearch))
    );
  }, [searchValue]);

  const handleSelect = (categoryId: string) => {
    onChange(categoryId);
    setOpen(false);
    setSearchValue("");
  };

  const renderCategoryItem = (category: BusinessCategory, isPopular = false) => {
    const isSelected = value === category.id;
    
    return (
      <CommandItem
        key={category.id}
        value={category.id}
        onSelect={() => handleSelect(category.id)}
        className="cursor-pointer p-3"
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <span className="text-lg">{category.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{category.name}</span>
                {isPopular && (
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                    Popular
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            </div>
          </div>
          <Check
            className={cn(
              "h-4 w-4",
              isSelected ? "opacity-100" : "opacity-0"
            )}
          />
        </div>
      </CommandItem>
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-auto min-h-[2.5rem] p-3",
              !selectedCategory && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            {selectedCategory ? (
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedCategory.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{selectedCategory.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedCategory.description}
                  </div>
                </div>
              </div>
            ) : (
              <span>{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Search categories..."
                value={searchValue}
                onValueChange={setSearchValue}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <CommandEmpty>No categories found.</CommandEmpty>
            
            <ScrollArea className="h-80">
              {/* Popular Categories */}
              {showPopular && !searchValue && (
                <>
                  <CommandGroup heading="Popular Categories">
                    {popularCategories.map((category) => 
                      renderCategoryItem(category, true)
                    )}
                  </CommandGroup>
                  <Separator className="my-2" />
                </>
              )}
              
              {/* All Categories */}
              <CommandGroup heading={searchValue ? "Search Results" : "All Categories"}>
                {filteredCategories
                  .filter(category => !showPopular || !searchValue || !category.popular)
                  .map((category) => renderCategoryItem(category))
                }
              </CommandGroup>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Category Details */}
      {selectedCategory && selectedCategory.subcategories && (
        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-2">Common services in this category:</p>
          <div className="flex flex-wrap gap-1">
            {selectedCategory.subcategories.slice(0, 4).map((subcategory) => (
              <Badge 
                key={subcategory} 
                variant="outline" 
                className="text-xs bg-background"
              >
                {subcategory}
              </Badge>
            ))}
            {selectedCategory.subcategories.length > 4 && (
              <Badge variant="outline" className="text-xs bg-background">
                +{selectedCategory.subcategories.length - 4} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { BUSINESS_CATEGORIES, getPopularCategories, getCategoryById };