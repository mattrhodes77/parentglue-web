"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";

// Curated list of major US cities with populations over 100k
const US_CITIES = [
  { city: "New York", state: "NY", stateName: "New York", population: 8336817 },
  { city: "Los Angeles", state: "CA", stateName: "California", population: 3979576 },
  { city: "Chicago", state: "IL", stateName: "Illinois", population: 2693976 },
  { city: "Houston", state: "TX", stateName: "Texas", population: 2320268 },
  { city: "Phoenix", state: "AZ", stateName: "Arizona", population: 1680992 },
  { city: "Philadelphia", state: "PA", stateName: "Pennsylvania", population: 1584064 },
  { city: "San Antonio", state: "TX", stateName: "Texas", population: 1547253 },
  { city: "San Diego", state: "CA", stateName: "California", population: 1423851 },
  { city: "Dallas", state: "TX", stateName: "Texas", population: 1343573 },
  { city: "San Jose", state: "CA", stateName: "California", population: 1021795 },
  { city: "Austin", state: "TX", stateName: "Texas", population: 978908 },
  { city: "Jacksonville", state: "FL", stateName: "Florida", population: 911507 },
  { city: "Fort Worth", state: "TX", stateName: "Texas", population: 909585 },
  { city: "Columbus", state: "OH", stateName: "Ohio", population: 898553 },
  { city: "Charlotte", state: "NC", stateName: "North Carolina", population: 885708 },
  { city: "San Francisco", state: "CA", stateName: "California", population: 881549 },
  { city: "Indianapolis", state: "IN", stateName: "Indiana", population: 876384 },
  { city: "Seattle", state: "WA", stateName: "Washington", population: 753675 },
  { city: "Denver", state: "CO", stateName: "Colorado", population: 727211 },
  { city: "Washington", state: "DC", stateName: "District of Columbia", population: 689545 },
  { city: "Boston", state: "MA", stateName: "Massachusetts", population: 692600 },
  { city: "Nashville", state: "TN", stateName: "Tennessee", population: 689447 },
  { city: "El Paso", state: "TX", stateName: "Texas", population: 681728 },
  { city: "Detroit", state: "MI", stateName: "Michigan", population: 670031 },
  { city: "Portland", state: "OR", stateName: "Oregon", population: 654741 },
  { city: "Memphis", state: "TN", stateName: "Tennessee", population: 651073 },
  { city: "Oklahoma City", state: "OK", stateName: "Oklahoma", population: 649021 },
  { city: "Las Vegas", state: "NV", stateName: "Nevada", population: 641903 },
  { city: "Louisville", state: "KY", stateName: "Kentucky", population: 617638 },
  { city: "Baltimore", state: "MD", stateName: "Maryland", population: 609032 },
  { city: "Milwaukee", state: "WI", stateName: "Wisconsin", population: 590157 },
  { city: "Albuquerque", state: "NM", stateName: "New Mexico", population: 564559 },
  { city: "Tucson", state: "AZ", stateName: "Arizona", population: 548073 },
  { city: "Fresno", state: "CA", stateName: "California", population: 542107 },
  { city: "Sacramento", state: "CA", stateName: "California", population: 524943 },
  { city: "Atlanta", state: "GA", stateName: "Georgia", population: 498715 },
  { city: "Kansas City", state: "MO", stateName: "Missouri", population: 495327 },
  { city: "Miami", state: "FL", stateName: "Florida", population: 478251 },
  { city: "Raleigh", state: "NC", stateName: "North Carolina", population: 474069 },
  { city: "Omaha", state: "NE", stateName: "Nebraska", population: 468262 },
  { city: "Minneapolis", state: "MN", stateName: "Minnesota", population: 425336 },
  { city: "Cleveland", state: "OH", stateName: "Ohio", population: 381009 },
  { city: "Tampa", state: "FL", stateName: "Florida", population: 399700 },
  { city: "St. Louis", state: "MO", stateName: "Missouri", population: 300576 },
  { city: "Pittsburgh", state: "PA", stateName: "Pennsylvania", population: 302407 },
  { city: "Cincinnati", state: "OH", stateName: "Ohio", population: 309317 },
  { city: "Orlando", state: "FL", stateName: "Florida", population: 307573 },
  { city: "Irvine", state: "CA", stateName: "California", population: 307670 },
  { city: "Newark", state: "NJ", stateName: "New Jersey", population: 282011 },
  { city: "Anaheim", state: "CA", stateName: "California", population: 350365 },
  { city: "Honolulu", state: "HI", stateName: "Hawaii", population: 350964 },
  { city: "Henderson", state: "NV", stateName: "Nevada", population: 320189 },
  { city: "Plano", state: "TX", stateName: "Texas", population: 287677 },
  { city: "Chandler", state: "AZ", stateName: "Arizona", population: 275987 },
  { city: "Scottsdale", state: "AZ", stateName: "Arizona", population: 258069 },
  { city: "Boise", state: "ID", stateName: "Idaho", population: 235684 },
  { city: "Salt Lake City", state: "UT", stateName: "Utah", population: 200591 },
  { city: "Anchorage", state: "AK", stateName: "Alaska", population: 291247 },
  { city: "Birmingham", state: "AL", stateName: "Alabama", population: 200733 },
  { city: "Little Rock", state: "AR", stateName: "Arkansas", population: 202591 },
  { city: "Hartford", state: "CT", stateName: "Connecticut", population: 121054 },
  { city: "Wilmington", state: "DE", stateName: "Delaware", population: 70635 },
  { city: "Des Moines", state: "IA", stateName: "Iowa", population: 214237 },
  { city: "Wichita", state: "KS", stateName: "Kansas", population: 397532 },
  { city: "New Orleans", state: "LA", stateName: "Louisiana", population: 383997 },
  { city: "Portland", state: "ME", stateName: "Maine", population: 68408 },
  { city: "Jackson", state: "MS", stateName: "Mississippi", population: 153701 },
  { city: "Billings", state: "MT", stateName: "Montana", population: 117116 },
  { city: "Manchester", state: "NH", stateName: "New Hampshire", population: 115644 },
  { city: "Fargo", state: "ND", stateName: "North Dakota", population: 125990 },
  { city: "Providence", state: "RI", stateName: "Rhode Island", population: 190934 },
  { city: "Charleston", state: "SC", stateName: "South Carolina", population: 150227 },
  { city: "Sioux Falls", state: "SD", stateName: "South Dakota", population: 192517 },
  { city: "Burlington", state: "VT", stateName: "Vermont", population: 44743 },
  { city: "Virginia Beach", state: "VA", stateName: "Virginia", population: 449974 },
  { city: "Charleston", state: "WV", stateName: "West Virginia", population: 48864 },
  { city: "Cheyenne", state: "WY", stateName: "Wyoming", population: 65132 },
];

export interface SelectedLocation {
  city: string;
  state: string;
  stateName: string;
  display: string;
}

interface LocationInputProps {
  value: SelectedLocation | null;
  onChange: (location: SelectedLocation | null) => void;
  placeholder?: string;
  className?: string;
}

export function LocationInput({
  value,
  onChange,
  placeholder = "Enter city or state...",
  className = "",
}: LocationInputProps) {
  const [query, setQuery] = useState(value?.display || "");
  const [suggestions, setSuggestions] = useState<typeof US_CITIES>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search cities locally
  const searchLocations = useCallback((q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const query = q.toLowerCase();
    const matches = US_CITIES.filter(
      (loc) =>
        loc.city.toLowerCase().includes(query) ||
        loc.state.toLowerCase().includes(query) ||
        loc.stateName.toLowerCase().includes(query)
    )
      .sort((a, b) => b.population - a.population)
      .slice(0, 8);

    setSuggestions(matches);
    setIsOpen(matches.length > 0);
    setHighlightedIndex(-1);
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (value && newQuery !== value.display) {
      onChange(null);
    }

    searchLocations(newQuery);
  };

  // Handle suggestion selection
  const handleSelect = (suggestion: (typeof US_CITIES)[0]) => {
    const selected: SelectedLocation = {
      city: suggestion.city,
      state: suggestion.state,
      stateName: suggestion.stateName,
      display: `${suggestion.city}, ${suggestion.state}`,
    };
    setQuery(selected.display);
    onChange(selected);
    setIsOpen(false);
    setSuggestions([]);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync query with value prop
  useEffect(() => {
    if (value?.display && value.display !== query) {
      setQuery(value.display);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.display]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input with icon */}
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-charcoal-light)]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-[var(--color-cream-dark)] bg-white text-[var(--color-charcoal)] placeholder:text-[var(--color-charcoal-light)] focus:border-[var(--color-teal)] focus:outline-none transition-colors"
          autoComplete="off"
        />
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-[var(--color-cream-dark)] rounded-xl shadow-[var(--shadow-medium)] overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.city}-${suggestion.state}`}
              type="button"
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                highlightedIndex === index
                  ? "bg-[var(--color-teal)]/10"
                  : "hover:bg-[var(--color-cream)]"
              }`}
            >
              <MapPin className="w-4 h-4 text-[var(--color-charcoal-light)] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--color-charcoal)]">
                  {suggestion.city}, {suggestion.state}
                </div>
                <div className="text-xs text-[var(--color-charcoal-light)]">
                  {suggestion.stateName}
                </div>
              </div>
              {suggestion.population > 500000 && (
                <span className="text-xs text-[var(--color-charcoal-light)] bg-[var(--color-cream)] px-2 py-0.5 rounded-full">
                  {(suggestion.population / 1000000).toFixed(1)}M
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
