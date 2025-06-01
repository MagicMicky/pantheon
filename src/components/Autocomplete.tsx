import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { AutocompleteProps } from '../types';
import { wikiSuggestions } from '../utils/wikipediaHelpers';
import { Input } from './ui/Inputs';

// Simple cache for suggestions to avoid repeated API calls
const suggestionCache = new Map<string, string[]>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

export const Autocomplete = ({ 
  value, 
  onChange, 
  onSelect, 
  inputClass = "", 
  placeholder = "Title"
}: Omit<AutocompleteProps, 'contentType'>) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [picked, setPicked] = useState<string>("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const currentRequestRef = useRef<AbortController | null>(null);

  // Enhanced suggestions fetching with caching and error handling
  useEffect(() => {
    if (!focused) return;
    
    const searchQuery = value.trim();
    
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      return;
    }
    
    // Check cache first
    const cached = suggestionCache.get(searchQuery.toLowerCase());
    const cacheTime = cacheTimestamps.get(searchQuery.toLowerCase());
    
    if (cached && cacheTime && (Date.now() - cacheTime) < CACHE_DURATION) {
      setSuggestions(cached);
      setLoading(false);
      setError(null);
      setActiveIndex(-1);
      return;
    }
    
    const timeout = setTimeout(async () => {
      if (searchQuery === picked) {
        return setSuggestions([]);
      }
      
      // Cancel previous request
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }
      
      // Create new abort controller for this request
      currentRequestRef.current = new AbortController();
      
      setLoading(true);
      setError(null);
      
      try {
        const results = await wikiSuggestions(searchQuery);
        
        // Only update if this request wasn't aborted
        if (!currentRequestRef.current.signal.aborted) {
          setSuggestions(results);
          setActiveIndex(-1);
          
          // Cache the results
          suggestionCache.set(searchQuery.toLowerCase(), results);
          cacheTimestamps.set(searchQuery.toLowerCase(), Date.now());
          
          // Limit cache size
          if (suggestionCache.size > 100) {
            const oldestKey = Array.from(cacheTimestamps.entries())
              .sort(([,a], [,b]) => a - b)[0][0];
            suggestionCache.delete(oldestKey);
            cacheTimestamps.delete(oldestKey);
          }
        }
      } catch (err) {
        if (!currentRequestRef.current?.signal.aborted) {
          setError('Failed to fetch suggestions');
          setSuggestions([]);
        }
      } finally {
        if (!currentRequestRef.current?.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300); // Slightly longer debounce for better UX
    
    return () => {
      clearTimeout(timeout);
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }
    };
  }, [value, focused, picked]);

  // Close dropdown
  const close = () => {
    setSuggestions([]);
    setError(null);
    setLoading(false);
  };
  
  // Handle keyboard navigation
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      close();
      return;
    }
    
    if (suggestions.length === 0 && !loading) return;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setActiveIndex(i => (i + 1) % suggestions.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setActiveIndex(i => (i - 1 + suggestions.length) % suggestions.length);
      }
    } else if (e.key === "Enter" && activeIndex >= 0 && suggestions.length > 0) {
      e.preventDefault();
      choose(suggestions[activeIndex]);
    }
  };
  
  // Choose a suggestion
  const choose = (suggestion: string) => {
    onSelect(suggestion);
    setPicked(suggestion);
    close();
  };

  // Handle clicks outside the component
  const handleOutsideClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      close();
    }
  };
  
  useEffect(() => {
    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
      // Clean up any pending request
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }
    };
  }, []);

  const showDropdown = focused && (suggestions.length > 0 || loading || error);

  return (
    <div className="relative" ref={ref}>
      <Input 
        value={value} 
        onFocus={() => setFocused(true)} 
        onBlur={() => setFocused(false)} 
        onChange={e => onChange(e.target.value)} 
        onKeyDown={handleKey} 
        className={`${inputClass} ${loading ? 'animate-pulse' : ''}`}
        placeholder={placeholder} 
      />
      
      {showDropdown && (
        <div className="absolute left-0 right-0 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-md shadow-lg max-h-48 overflow-auto text-sm z-20">
          {loading && (
            <div className="px-3 py-2 text-slate-400 flex items-center gap-2">
              <div className="animate-spin w-3 h-3 border border-slate-400 border-t-transparent rounded-full"></div>
              Searching Wikipedia...
            </div>
          )}
          
          {error && (
            <div className="px-3 py-2 text-red-400 text-xs">
              {error} - Try a different search term
            </div>
          )}
          
          {suggestions.length === 0 && !loading && !error && focused && value.trim().length >= 2 && (
            <div className="px-3 py-2 text-slate-400 text-xs">
              No Wikipedia articles found for "{value.trim()}"
            </div>
          )}
          
          {suggestions.map((suggestion, i) => (
            <div 
              key={suggestion} 
              className={`px-3 py-2 cursor-pointer border-b border-slate-700/30 last:border-b-0 ${
                i === activeIndex 
                  ? "bg-slate-700 text-white" 
                  : "hover:bg-slate-700/60 text-slate-200"
              } transition-all duration-150 text-sm`} 
              onMouseEnter={() => setActiveIndex(i)} 
              onMouseLeave={() => setActiveIndex(-1)} 
              onClick={() => choose(suggestion)}
            >
              {suggestion}
            </div>
          ))}
          
          {suggestions.length > 0 && (
            <div className="px-3 py-1 text-xs text-slate-500 bg-slate-800/50 border-t border-slate-700/30">
              {suggestions.length} result{suggestions.length !== 1 ? 's' : ''} from Wikipedia
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 