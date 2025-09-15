"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
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
import { MELBOURNE_SUBURBS } from "@/lib/constants/melbourne-suburbs";

interface SuburbMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxSelections?: number;
}

export function SuburbMultiSelect({
  value = [],
  onChange,
  placeholder = "Select suburbs...",
  className,
  disabled = false,
  maxSelections
}: SuburbMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const filteredSuburbs = MELBOURNE_SUBURBS.filter(suburb =>
    suburb.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (suburb: string) => {
    if (value.includes(suburb)) {
      // Remove suburb
      onChange(value.filter(s => s !== suburb));
    } else {
      // Add suburb (check max selections)
      if (!maxSelections || value.length < maxSelections) {
        onChange([...value, suburb]);
      }
    }
  };

  const handleRemove = (suburb: string) => {
    onChange(value.filter(s => s !== suburb));
  };

  const clearAll = () => {
    onChange([]);
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
              "w-full justify-between",
              value.length === 0 && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            {value.length === 0 ? (
              placeholder
            ) : value.length === 1 ? (
              value[0]
            ) : (
              `${value.length} suburbs selected`
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search suburbs..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandEmpty>No suburbs found.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-60">
                {filteredSuburbs.map((suburb) => {
                  const isSelected = value.includes(suburb);
                  const isDisabled = !isSelected && !!maxSelections && value.length >= maxSelections;
                  
                  return (
                    <CommandItem
                      key={suburb}
                      value={suburb}
                      onSelect={() => handleSelect(suburb)}
                      disabled={isDisabled}
                      className={cn(
                        "cursor-pointer",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {suburb}
                    </CommandItem>
                  );
                })}
              </ScrollArea>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected suburbs display */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Selected Suburbs ({value.length})
              {maxSelections && ` / ${maxSelections}`}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-auto p-1 text-xs"
              disabled={disabled}
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {value.map((suburb) => (
              <Badge
                key={suburb}
                variant="secondary"
                className="text-xs px-2 py-1"
              >
                {suburb}
                {!disabled && (
                  <button
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    onClick={() => handleRemove(suburb)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// MELBOURNE_SUBURBS is now imported from @/lib/melbourne-suburbs