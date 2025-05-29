import { CategoryID, CategoryColors } from '../types';
import { 
  Sparkles, Mountain, Star, Music, Flame, Shield 
} from 'lucide-react';

// Category definitions
export const CATEGORIES: Record<CategoryID, {name: string; icon: any; blurb: string}> = {
  olympian: {name: "Olympian Gods", icon: Sparkles, blurb: "Masterpieces reshaping the medium."},
  titan: {name: "Titans", icon: Mountain, blurb: "Genre‑defining giants."},
  demigod: {name: "Demi‑Gods", icon: Star, blurb: "Hybrids bridging niche & mainstream."},
  muse: {name: "Muses", icon: Music, blurb: "Inventive, artistic experiences."},
  hero: {name: "Heroes", icon: Flame, blurb: "Beloved favourites."},
  other: {name: "Monsters & Curios", icon: Shield, blurb: "Oddities and experiments."},
};

// Category color schemes - more sophisticated, desaturated palette
export const CATEGORY_COLORS: Record<CategoryID, CategoryColors> = {
  olympian: {
    bg: "bg-amber-950/60", 
    text: "text-amber-200", 
    border: "border-amber-900/30",
    icon: "text-amber-300/90",
    highlight: "#78350f", // amber-900
    gradient: "from-amber-950 to-amber-900/80"
  },
  titan: {
    bg: "bg-orange-950/60", 
    text: "text-orange-200", 
    border: "border-orange-900/30",
    icon: "text-orange-300/90",
    highlight: "#7c2d12", // orange-900
    gradient: "from-orange-950 to-orange-900/80"
  },
  demigod: {
    bg: "bg-purple-950/60", 
    text: "text-purple-200", 
    border: "border-purple-900/30",
    icon: "text-purple-300/90",
    highlight: "#581c87", // purple-900
    gradient: "from-purple-950 to-purple-900/80"
  },
  muse: {
    bg: "bg-teal-950/60", 
    text: "text-teal-200", 
    border: "border-teal-900/30",
    icon: "text-teal-300/90",
    highlight: "#134e4a", // teal-900
    gradient: "from-teal-950 to-teal-900/80"
  },
  hero: {
    bg: "bg-rose-950/60", 
    text: "text-rose-200", 
    border: "border-rose-900/30",
    icon: "text-rose-300/90",
    highlight: "#881337", // rose-900
    gradient: "from-rose-950 to-rose-900/80"
  },
  other: {
    bg: "bg-slate-900/60", 
    text: "text-slate-300", 
    border: "border-slate-800/30",
    icon: "text-slate-400/90",
    highlight: "#1e293b", // slate-800
    gradient: "from-slate-900 to-slate-800/80"
  }
}; 