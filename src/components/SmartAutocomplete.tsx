import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { ContentType } from '../types';
import { getSmartFieldSuggestions } from '../utils/contentAutocomplete';
import { wikiSuggestions } from '../utils/wikipediaHelpers';
import { Input } from './ui/Inputs';

interface SmartAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  inputClass?: string;
  placeholder?: string;
  // Field-specific props
  fieldType?: 'title' | 'genre' | 'director' | 'status';
  contentType?: ContentType;
  existingContent?: any[];
  // UI props
  showFieldIcon?: boolean;
  disabled?: boolean;
}

export const SmartAutocomplete = ({ 
  value, 
  onChange, 
  onSelect, 
  inputClass = "", 
  placeholder = "Title",
  fieldType = 'title',
  contentType = 'games',
  existingContent = [],
  showFieldIcon = true,
  disabled = false
}: SmartAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [picked, setPicked] = useState<string>("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const currentRequestRef = useRef<AbortController | null>(null);

  // Clear picked state when user starts typing again
  useEffect(() => {
    if (picked && value !== picked) {
      setPicked("");
    }
  }, [value, picked]);

  // Enhanced suggestions fetching based on field type
  useEffect(() => {
    if (!focused || disabled) return;
    
    const searchQuery = value.trim();
    
    if (searchQuery.length < 1) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      setPicked(""); // Clear picked when input is empty
      return;
    }
    
    // For non-title fields, use instant local suggestions
    if (fieldType !== 'title') {
      const localSuggestions = getSmartFieldSuggestions(
        fieldType as 'genre' | 'director' | 'status',
        contentType,
        searchQuery,
        existingContent
      );
      setSuggestions(localSuggestions);
      setActiveIndex(-1);
      setLoading(false);
      setError(null);
      return;
    }
    
    // For title field, use Wikipedia API with debouncing
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    
    const timeout = setTimeout(async () => {
      // Only skip if the exact search matches picked AND the input hasn't changed since picking
      if (searchQuery === picked && searchQuery === value) {
        return setSuggestions([]);
      }
      
      // Cancel previous request
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }
      
      currentRequestRef.current = new AbortController();
      setLoading(true);
      setError(null);
      
      try {
        const results = await wikiSuggestions(searchQuery);
        
        if (!currentRequestRef.current.signal.aborted) {
          setSuggestions(results);
          setActiveIndex(-1);
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
    }, fieldType === 'title' ? 300 : 0);
    
    return () => {
      clearTimeout(timeout);
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }
    };
  }, [value, focused, picked, fieldType, contentType, existingContent, disabled]);

  const close = () => {
    setSuggestions([]);
    setError(null);
    setLoading(false);
  };
  
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
  
  const choose = (suggestion: string) => {
    // Update the input value immediately
    onChange(suggestion);
    setPicked(suggestion);
    close();
    
    // Then call the onSelect callback
    try {
      onSelect(suggestion);
    } catch (error) {
      console.error('Error in onSelect callback:', error);
    }
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      close();
    }
  };
  
  useEffect(() => {
    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }
    };
  }, []);

  const showDropdown = focused && !disabled && (suggestions.length > 0 || loading || error);
  
  // Get field-specific icon and styling
  const getFieldInfo = () => {
    switch (fieldType) {
      case 'genre':
        return { icon: '🎭', label: 'Genre', color: 'text-purple-400' };
      case 'director':
        return { icon: '🎬', label: 'Director', color: 'text-blue-400' };
      case 'status':
        return { icon: '📺', label: 'Status', color: 'text-green-400' };
      default:
        return { icon: '📝', label: 'Title', color: 'text-yellow-400' };
    }
  };

  const fieldInfo = getFieldInfo();

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        {showFieldIcon && (
          <div className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${fieldInfo.color} text-xs flex items-center gap-1`}>
            <span>{fieldInfo.icon}</span>
          </div>
        )}
        
        <Input 
          value={value} 
          onFocus={() => setFocused(true)} 
          onBlur={() => setFocused(false)} 
          onChange={e => onChange(e.target.value)} 
          onKeyDown={handleKey} 
          className={`${inputClass} ${showFieldIcon ? 'pl-8' : ''} ${loading ? 'animate-pulse' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder={placeholder} 
          disabled={disabled}
        />
      </div>
      
      {showDropdown && (
        <div className="absolute left-0 right-0 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-md shadow-lg max-h-48 overflow-auto text-sm z-20">
          {loading && fieldType === 'title' && (
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
          
          {suggestions.length === 0 && !loading && !error && focused && value.trim().length >= 1 && (
            <div className="px-3 py-2 text-slate-400 text-xs">
              {fieldType === 'title' 
                ? `No Wikipedia articles found for "${value.trim()}"`
                : `No ${fieldInfo.label.toLowerCase()} suggestions for "${value.trim()}"`
              }
            </div>
          )}
          
          {suggestions.map((suggestion, i) => (
            <div 
              key={suggestion} 
              className={`px-3 py-2 cursor-pointer border-b border-slate-700/30 last:border-b-0 ${
                i === activeIndex 
                  ? "bg-slate-700 text-white" 
                  : "hover:bg-slate-700/60 text-slate-200"
              } transition-all duration-150 text-sm flex items-center gap-2`} 
              onMouseEnter={() => setActiveIndex(i)} 
              onMouseLeave={() => setActiveIndex(-1)} 
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent the input from losing focus
                choose(suggestion);
              }}
            >
              {fieldType !== 'title' && (
                <span className={`${fieldInfo.color} text-xs`}>{fieldInfo.icon}</span>
              )}
              <span className="flex-1">{suggestion}</span>
            </div>
          ))}
          
          {suggestions.length > 0 && (
            <div className="px-3 py-1 text-xs text-slate-500 bg-slate-800/50 border-t border-slate-700/30 flex items-center justify-between">
              <span>{suggestions.length} result{suggestions.length !== 1 ? 's' : ''}</span>
              <span className={`${fieldInfo.color} text-xs`}>
                {fieldType === 'title' ? 'Wikipedia' : fieldInfo.label}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 