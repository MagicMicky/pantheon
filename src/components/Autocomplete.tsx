import React, { useState, useEffect, useRef, KeyboardEvent, FocusEvent } from "react";
import { AutocompleteProps } from '../types';
import { wikiSuggestions } from '../utils/wikipediaHelpers';
import { Input } from './ui/Inputs';

export const Autocomplete = ({ 
  value, 
  onChange, 
  onSelect, 
  inputClass = "", 
  placeholder = "Title",
  contentType 
}: AutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [picked, setPicked] = useState<string>("");
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch suggestions when input changes - use the original working function
  useEffect(() => {
    if (!focused) return;
    
    const timeout = setTimeout(async () => {
      if (value.trim().length < 3 || value === picked) {
        return setSuggestions([]);
      }
      
      // Use the original working Wikipedia suggestions (no content-specific prefixes)
      const results = await wikiSuggestions(value);
      setSuggestions(results);
      setActiveIndex(-1);
    }, 250);
    
    return () => clearTimeout(timeout);
  }, [value, focused, picked]);

  // Close dropdown
  const close = () => setSuggestions([]);
  
  // Handle keyboard navigation
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && activeIndex >= 0) {
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
    if (ref.current && !ref.current.contains(e.target as Node)) close();
  };
  
  useEffect(() => {
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Input 
        value={value} 
        onFocus={() => setFocused(true)} 
        onBlur={(e: FocusEvent) => setFocused(false)} 
        onChange={e => onChange(e.target.value)} 
        onKeyDown={handleKey} 
        className={inputClass} 
        placeholder={placeholder} 
      />
      
      {suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-md shadow-lg max-h-48 overflow-auto text-sm z-20">
          {suggestions.map((suggestion, i) => (
            <li 
              key={suggestion} 
              className={`px-3 py-2 cursor-pointer ${i === activeIndex ? "bg-slate-700" : "hover:bg-slate-700/60"} text-white transition-all duration-150`} 
              onMouseEnter={() => setActiveIndex(i)} 
              onMouseLeave={() => setActiveIndex(-1)} 
              onClick={() => choose(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 