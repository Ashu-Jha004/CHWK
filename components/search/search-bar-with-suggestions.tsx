// components/search/search-bar-with-suggestions.tsx
// Enhanced search bar with autocomplete suggestions
// Features: debounced search, keyboard navigation, click outside to close

"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin, TrendingUp, Building2, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearchSuggestions, SearchSuggestion } from "@/hooks/search/use-search-suggestions";
import { useRouter } from "next/navigation";

interface SearchBarWithSuggestionsProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBarWithSuggestions({
  initialQuery = "",
  onSearch,
  placeholder = "Search for businesses, services, or categories...",
  className,
}: SearchBarWithSuggestionsProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions
  const { suggestions, isLoading } = useSearchSuggestions(query, showSuggestions);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;

    setShowSuggestions(false);
    if (onSearch) {
      onSearch(query);
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // Navigate based on suggestion type
    if (suggestion.type === "category" && suggestion.slug) {
      router.push(`/categories/${suggestion.slug}`);
    } else if (suggestion.type === "business" && suggestion.slug) {
      router.push(`/business_service/${suggestion.slug}`);
    } else {
      // For keywords, perform a search
      setQuery(suggestion.value);
      router.push(`/search?q=${encodeURIComponent(suggestion.value)}`);
    }
  };

  const getSuggestionIcon = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "business":
        return <Building2 className="h-4 w-4 text-muted-foreground" />;
      case "category":
        return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
      case "keyword":
        return <Hash className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-24 h-12 text-base"
        />
        <Button
          onClick={handleSearch}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-10"
          disabled={!query.trim()}
        >
          Search
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query.length >= 2) && (
        <div className="absolute z-50 w-full mt-2 bg-popover border rounded-lg shadow-lg max-h-[400px] overflow-y-auto">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Loading suggestions...
            </div>
          )}

          {!isLoading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No suggestions found
            </div>
          )}

          {!isLoading && suggestions.length > 0 && (
            <ul className="py-2">
              {suggestions.map((suggestion, index) => (
                <li key={`${suggestion.type}-${suggestion.value}-${index}`}>
                  <button
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-accent transition-colors",
                      selectedIndex === index && "bg-accent"
                    )}
                  >
                    <div className="mt-0.5">
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {suggestion.label}
                      </div>
                      {suggestion.metadata && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {suggestion.metadata.categoryName && (
                            <span>{suggestion.metadata.categoryName}</span>
                          )}
                          {suggestion.metadata.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {suggestion.metadata.city}
                            </span>
                          )}
                          {suggestion.metadata.businessCount !== undefined && (
                            <span>
                              {suggestion.metadata.businessCount} businesses
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize mt-1">
                      {suggestion.type}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
