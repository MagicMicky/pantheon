import React, { useState, useEffect, useRef, KeyboardEvent, FocusEvent } from "react";
import { 
  SunMedium, Star, Music, Sword, Shield, Plus, X, 
  Pen, RefreshCw, Gamepad2, Crosshair, Car, Brain, Trophy, 
  Rocket, Ghost, Users, Building, Dice1, Globe, Map, GripVertical,
  Mountain, Flame, Sparkles, Share2, Copy, ArrowLeft,
  Zap, Waves, Skull, Feather, HeartHandshake, 
  Bird, Sun, Moon, Hammer, Wheat, Wine, Clock, Compass,
  Workflow, Dumbbell, Footprints, Ship, Tent
} from "lucide-react";
import * as LZString from 'lz-string';
import { createPortal } from 'react-dom';

/**
 * Pantheon v8 ────────────────────────────────────────────────────────────────
 * Sophisticated museum-quality design
 * • Refined, desaturated color palette with subtle accents
 * • Elegant typography with proper hierarchy
 * • Enhanced card design with depth and translucency
 * • Sophisticated UI elements and interactions
 */

// Helper functions
function uid(){return Math.random().toString(36).slice(2,10);}

// Optimize data structure before encoding to reduce size
function optimizeGameData(games: Game[]): any[] {
  // Map categories to single digits for better compression
  const catMap: Record<CategoryID, string> = {
    olympian: '0', 
    titan: '1', 
    demigod: '2', 
    muse: '3', 
    hero: '4', 
    other: '5'
  };
  
  // Convert to an ultra compact format:
  // [id truncated to 4 chars, title, genre, year, category as single digit, mythologicalFigureId]
  return games.map(g => [
    g.id.substring(0, 4),
    g.title,
    g.genre,
    g.year,
    catMap[g.category],
    g.mythologicalFigureId || null
  ]);
}

function restoreGameData(data: any[]): Game[] {
  // Map digits back to category names
  const catMap: Record<string, CategoryID> = {
    '0': 'olympian',
    '1': 'titan', 
    '2': 'demigod', 
    '3': 'muse', 
    '4': 'hero', 
    '5': 'other'
  };
  
  // Convert from compact format back to Game objects
  return data.map(item => ({
    id: item[0], // Short ID is fine for display purposes
    title: item[1],
    genre: item[2],
    year: item[3],
    category: catMap[item[4]] as CategoryID,
    mythologicalFigureId: item[5] || undefined
  }));
}

// Compressed Base64 encode/decode for URL sharing
function encodeGameData(games: Game[]): string {
  // Optimize data structure, stringify, compress, then URL-encode for base64
  const optimized = optimizeGameData(games);
  const json = JSON.stringify(optimized);
  return LZString.compressToEncodedURIComponent(json);
}

function decodeGameData(encodedData: string): Game[] {
  try {
    // Decode from base64, decompress, parse JSON, restore data structure
    const json = LZString.decompressFromEncodedURIComponent(encodedData);
    if (!json) return [];
    const data = JSON.parse(json);
    return restoreGameData(data);
  } catch (e) {
    console.error("Failed to decode shared data", e);
    return [];
  }
}

// Import Playfair Display font in index.css or add this to the head:
// <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">

// Category color schemes - more sophisticated, desaturated palette
const CATEGORY_COLORS: Record<CategoryID, {bg: string, text: string, border: string, icon: string, highlight: string, gradient: string}> = {
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

// ────────────────────────────────────────── Tiny UI shims
const Card = ({ children, category = "other", ...p }: any) => {
  const colors = CATEGORY_COLORS[category as CategoryID];
  return (
    <div {...p} className={`rounded-xl border border-slate-800/50 bg-slate-900/70 shadow-lg backdrop-blur-sm backdrop-filter 
    hover:shadow-xl transition duration-300 flex flex-col h-full relative overflow-hidden group ${p.className || ""}`}>
      <div className={`absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-800/60 opacity-80 group-hover:opacity-90 transition-opacity duration-300`}></div>
      <div className="relative z-10 flex flex-col h-full">
        {children}
      </div>
    </div>
  );
};

const CardHeader = ({ children, category = "other" }: any) => {
  const colors = CATEGORY_COLORS[category as CategoryID];
  return (
    <div className={`flex items-center gap-3 p-5 pb-3 border-b ${colors.border} bg-gradient-to-r ${colors.gradient}`}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, category = "other" }: any) => {
  const colors = CATEGORY_COLORS[category as CategoryID];
  return <h2 className={`text-xl font-serif font-bold leading-tight tracking-wide text-white`}>{children}</h2>;
};

const CardContent = ({ children, ...p }: any) => <div {...p} className="p-5 pt-4 grow flex flex-col gap-3">{children}</div>;

const Button = ({ children, onClick, className="" }: any) => <button onClick={onClick} className={`px-4 py-2 text-sm font-medium rounded-md bg-slate-800 text-white hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow ${className}`}>{children}</button>;

const IconBtn = ({ children, onClick, title="" }: any) => <button onClick={onClick} title={title} className="p-1.5 text-gray-400 hover:text-white transition-colors duration-200">{children}</button>;

const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={`w-full rounded-md border border-slate-700/50 bg-slate-800/70 text-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-500 transition-all duration-200 backdrop-blur-sm ${p.className??""}`} />;

const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={`w-full rounded-md border border-slate-700/50 bg-slate-800/70 text-white px-3 py-2 text-sm transition-all duration-200 backdrop-blur-sm ${p.className??""}`} />;

// ────────────────────────────────────────── Types & constants
interface Game { 
  id: string; 
  title: string; 
  genre: string; 
  year: number; 
  category: CategoryID; 
  mythologicalFigureId?: string; 
}

type CategoryID = "olympian"|"titan"|"demigod"|"muse"|"hero"|"other";

// Define mythological figure interface
interface MythologicalFigure {
  id: string;
  name: string;
  tier: 'olympian' | 'titan' | 'hero';  // Only specific tiers have named figures
  icon: React.ElementType;
  description: string;
  domain: string;
  color: string;
}

// Define mythological figures data
const MYTHOLOGICAL_FIGURES: Record<string, MythologicalFigure> = {
  // Olympian Gods (12)
  zeus: {
    id: 'zeus',
    name: 'Zeus',
    tier: 'olympian',
    icon: Zap,
    description: 'King of the gods, ruler of Mount Olympus',
    domain: 'Sky, Thunder, Lightning, Law, Order, Fate',
    color: '#5c9eff' // brightened blue
  },
  poseidon: {
    id: 'poseidon',
    name: 'Poseidon',
    tier: 'olympian',
    icon: Waves,
    description: 'God of the sea, earthquakes, storms, and horses',
    domain: 'Sea, Storms, Earthquakes, Horses',
    color: '#4db8ff' // brightened blue-teal
  },
  hades: {
    id: 'hades',
    name: 'Hades',
    tier: 'olympian',
    icon: Skull,
    description: 'God of the underworld and the dead',
    domain: 'Underworld, Death, Wealth',
    color: '#a069df' // brightened purple
  },
  athena: {
    id: 'athena',
    name: 'Athena',
    tier: 'olympian',
    icon: Bird, // Owl
    description: 'Goddess of wisdom, courage, inspiration, and strategic warfare',
    domain: 'Wisdom, Courage, Warfare, Strategy',
    color: '#d6d6d6' // brightened silver
  },
  apollo: {
    id: 'apollo',
    name: 'Apollo',
    tier: 'olympian',
    icon: Sun,
    description: 'God of music, arts, knowledge, healing, prophecy, and the sun',
    domain: 'Music, Healing, Light, Knowledge',
    color: '#ffd966' // brightened gold
  },
  artemis: {
    id: 'artemis',
    name: 'Artemis',
    tier: 'olympian',
    icon: Moon,
    description: 'Goddess of the hunt, wilderness, animals, and the moon',
    domain: 'Hunt, Wilderness, Moon, Archery',
    color: '#c6d8ff' // brightened silver-blue
  },
  ares: {
    id: 'ares',
    name: 'Ares',
    tier: 'olympian',
    icon: Sword,
    description: 'God of war, bloodshed, and violence',
    domain: 'War, Violence, Bloodlust',
    color: '#ff5252' // brightened red
  },
  aphrodite: {
    id: 'aphrodite',
    name: 'Aphrodite',
    tier: 'olympian',
    icon: HeartHandshake,
    description: 'Goddess of love, beauty, and passion',
    domain: 'Love, Beauty, Desire, Passion',
    color: '#ff8ad8' // brightened pink
  },
  hermes: {
    id: 'hermes',
    name: 'Hermes',
    tier: 'olympian',
    icon: Feather,
    description: 'God of trade, wealth, luck, language, and travel',
    domain: 'Travel, Commerce, Communication, Trickery',
    color: '#7dd3ff' // brightened light blue
  },
  hephaestus: {
    id: 'hephaestus',
    name: 'Hephaestus',
    tier: 'olympian',
    icon: Hammer,
    description: 'God of fire, metalworking, stone masonry, and sculpture',
    domain: 'Fire, Forge, Craftsmanship, Technology',
    color: '#ff9e5e' // brightened orange-red
  },
  demeter: {
    id: 'demeter',
    name: 'Demeter',
    tier: 'olympian',
    icon: Wheat,
    description: 'Goddess of agriculture, fertility, and sacred law',
    domain: 'Agriculture, Fertility, Harvest, Seasons',
    color: '#a6e06c' // brightened green-yellow
  },
  dionysus: {
    id: 'dionysus',
    name: 'Dionysus',
    tier: 'olympian',
    icon: Wine,
    description: 'God of wine, fertility, festivity, and ecstasy',
    domain: 'Wine, Festivity, Theater, Ecstasy',
    color: '#c87dff' // brightened purple
  },

  // Titans (6)
  cronus: {
    id: 'cronus',
    name: 'Cronus',
    tier: 'titan',
    icon: Clock,
    description: 'Titan of time and the ages, father of Zeus',
    domain: 'Time, Harvest, Fate',
    color: '#5c88cc' // brightened dark blue
  },
  rhea: {
    id: 'rhea',
    name: 'Rhea',
    tier: 'titan',
    icon: Mountain,
    description: 'Titaness of fertility, motherhood, and generation',
    domain: 'Fertility, Motherhood, Earth',
    color: '#9c7a6e' // brightened brown
  },
  oceanus: {
    id: 'oceanus',
    name: 'Oceanus',
    tier: 'titan',
    icon: Waves,
    description: 'Titan of the great world-encircling river',
    domain: 'Water, Rivers, Oceans',
    color: '#4d94ff' // brightened deep blue
  },
  hyperion: {
    id: 'hyperion',
    name: 'Hyperion',
    tier: 'titan',
    icon: Sun,
    description: 'Titan of light, father of the sun, moon, and dawn',
    domain: 'Light, Watchfulness, Wisdom',
    color: '#ffda58' // brightened bright yellow
  },
  theia: {
    id: 'theia',
    name: 'Theia',
    tier: 'titan',
    icon: Star,
    description: 'Titaness of sight and the shining light of the clear blue sky',
    domain: 'Sight, Light, Glory, Treasure',
    color: '#e0e0e0' // brightened silver
  },
  atlas: {
    id: 'atlas',
    name: 'Atlas',
    tier: 'titan',
    icon: Globe,
    description: 'Titan condemned to hold up the sky for eternity',
    domain: 'Endurance, Astronomy, Navigation',
    color: '#92b6cc' // brightened stone gray
  },

  // Heroes (8)
  hercules: {
    id: 'hercules',
    name: 'Hercules',
    tier: 'hero',
    icon: Dumbbell,
    description: 'Divine hero known for his strength and numerous far-ranging adventures',
    domain: 'Strength, Courage, Adventure',
    color: '#e8a554' // brightened bronze
  },
  perseus: {
    id: 'perseus',
    name: 'Perseus',
    tier: 'hero',
    icon: Sword,
    description: 'Slayer of Medusa and rescuer of Andromeda',
    domain: 'Bravery, Cunning, Heroism',
    color: '#ffe14d' // brightened gold
  },
  achilles: {
    id: 'achilles',
    name: 'Achilles',
    tier: 'hero',
    icon: Shield,
    description: 'Greatest warrior of the Trojan War, with a fatal weakness',
    domain: 'Warfare, Excellence, Pride',
    color: '#e86e5a' // brightened bronze-red
  },
  odysseus: {
    id: 'odysseus',
    name: 'Odysseus',
    tier: 'hero',
    icon: Ship,
    description: 'King of Ithaca known for his intelligence and cunning',
    domain: 'Cunning, Strategy, Endurance',
    color: '#5c9eff' // brightened blue
  },
  theseus: {
    id: 'theseus',
    name: 'Theseus',
    tier: 'hero',
    icon: Tent,
    description: 'Slayer of the Minotaur and unifier of Attica',
    domain: 'Leadership, Justice, Civilization',
    color: '#a3c2d6' // brightened blue-gray
  },
  jason: {
    id: 'jason',
    name: 'Jason',
    tier: 'hero',
    icon: Compass,
    description: 'Leader of the Argonauts in quest of the Golden Fleece',
    domain: 'Leadership, Adventure, Quest',
    color: '#ffde47' // brightened gold-yellow
  },
  atalanta: {
    id: 'atalanta',
    name: 'Atalanta',
    tier: 'hero',
    icon: Footprints,
    description: 'Female warrior, huntress, and athlete',
    domain: 'Hunting, Athletics, Independence',
    color: '#6fd675' // brightened forest green
  },
  bellerophon: {
    id: 'bellerophon',
    name: 'Bellerophon',
    tier: 'hero',
    icon: Workflow,
    description: 'Tamer of Pegasus and slayer of the Chimera',
    domain: 'Taming, Aviation, Pride',
    color: '#f0f0f0' // brightened white/silver
  }
};

// Filter mythological figures by tier
const getMythologicalFiguresByTier = (tier: 'olympian' | 'titan' | 'hero'): MythologicalFigure[] => {
  return Object.values(MYTHOLOGICAL_FIGURES).filter(figure => figure.tier === tier);
};

const CATEGORIES:Record<CategoryID,{name:string;icon:any;blurb:string}>={
  olympian:{name:"Olympian Gods",icon:Sparkles,blurb:"Masterpieces reshaping the medium."},
  titan:{name:"Titans",icon:Mountain,blurb:"Genre‑defining giants."},
  demigod:{name:"Demi‑Gods",icon:Star,blurb:"Hybrids bridging niche & mainstream."},
  muse:{name:"Muses",icon:Music,blurb:"Inventive, artistic experiences."},
  hero:{name:"Heroes",icon:Flame,blurb:"Beloved favourites."},
  other:{name:"Monsters & Curios",icon:Shield,blurb:"Oddities and experiments."},
};
const SAMPLE_GAMES:Game[]=[{id:uid(),title:"The Legend of Zelda: Breath of the Wild",genre:"Action‑Adventure",year:2017,category:"olympian", mythologicalFigureId: "zeus"}];

// Genre icons mapping for game list items
const GENRE_ICON_MAPPING: Array<{keywords: RegExp, icon: any}> = [
  // Action/Combat
  { keywords: /\b(action|fight|beat|hack|slash|shoot|combat)\b/i, icon: Sword },
  
  // Shooters
  { keywords: /\b(fps|shooter|first.person)\b/i, icon: Crosshair },
  
  // Racing/Sports
  { keywords: /\b(rac(e|ing)|driv(e|ing)|car|sport|football|soccer|baseball)\b/i, icon: Car },
  { keywords: /\b(sport|athlet|football|soccer|baseball|basketball|hockey)\b/i, icon: Trophy },
  
  // RPG/Adventure
  { keywords: /\b(rpg|role.?play|dungeon)\b/i, icon: Dice1 },
  { keywords: /\b(adventure|quest|point.and.click)\b/i, icon: Ghost },
  
  // Strategy/Puzzle
  { keywords: /\b(strateg|puzzle|tactics|tower.defense)\b/i, icon: Brain },
  { keywords: /\b(4x|turn.based|mmo|multiplayer.online)\b/i, icon: Globe },
  { keywords: /\b(rts|real.time.strateg)\b/i, icon: Building },
  
  // Simulation
  { keywords: /\b(simulat|management|build|construct|city|farm)\b/i, icon: Rocket },
  
  // Platformer
  { keywords: /\b(platform|side.scroll|jump)\b/i, icon: Gamepad2 },
  
  // Open world
  { keywords: /\b(open.world|sandbox)\b/i, icon: Map },
  
  // Multiplayer
  { keywords: /\b(mmo|multiplayer|online)\b/i, icon: Users },
];

// Helper function to get the appropriate icon for a genre
function getGenreIcon(genre: string) {
  if (!genre) return Gamepad2; // Default icon if no genre
  
  // Try to find a matching genre category
  for (const {keywords, icon} of GENRE_ICON_MAPPING) {
    if (keywords.test(genre)) {
      return icon;
    }
  }
  
  // Default fallback
  return Gamepad2;
}

// Tooltip component for deity badges in game list
const Tooltip = ({ children, content }: { children: React.ReactNode, content: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const childRef = useRef<HTMLDivElement>(null);

  const updateTooltipPosition = () => {
    if (childRef.current) {
      const rect = childRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
    }
  };

  const handleMouseEnter = () => {
    updateTooltipPosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    // Update position on scroll or resize
    const handleScroll = () => {
      if (isVisible) {
        updateTooltipPosition();
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isVisible]);

  return (
    <>
      <div 
        ref={childRef}
        className="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      
      {isVisible && createPortal(
        <div 
          className="fixed z-[9999] w-64 p-3 bg-gray-900/95 text-white rounded-lg shadow-lg 
                    backdrop-blur-sm border border-gray-700/50 pointer-events-none transition-opacity duration-200"
          style={{
            left: `${position.x}px`,
            top: `${position.y - 10}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {content}
          <div 
            className="absolute w-2 h-2 bg-gray-900/95 rotate-45 border-r border-b border-gray-700/50"
            style={{
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          ></div>
        </div>,
        document.body
      )}
    </>
  );
};

// Tooltip component for deity selector (positions differently)
const SelectorTooltip = ({ children, content }: { children: React.ReactNode, content: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const childRef = useRef<HTMLDivElement>(null);

  const updateTooltipPosition = () => {
    if (childRef.current) {
      const rect = childRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom
      });
    }
  };

  const handleMouseEnter = () => {
    updateTooltipPosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    // Update position on scroll or resize
    const handleScroll = () => {
      if (isVisible) {
        updateTooltipPosition();
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isVisible]);

  return (
    <>
      <div 
        ref={childRef}
        className="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      
      {isVisible && createPortal(
        <div 
          className="fixed z-[9999] w-64 p-3 bg-gray-900/95 text-white rounded-lg shadow-lg 
                   backdrop-blur-sm border border-gray-700/50 pointer-events-none transition-opacity duration-200"
          style={{
            left: `${position.x}px`,
            top: `${position.y + 10}px`,
            transform: 'translateX(-50%)'
          }}
        >
          {content}
          <div 
            className="absolute w-2 h-2 bg-gray-900/95 rotate-45 border-l border-t border-gray-700/50"
            style={{
              top: '-4px',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          ></div>
        </div>,
        document.body
      )}
    </>
  );
};

// Deity badge component
const DeityBadge = ({ mythologicalFigureId }: { mythologicalFigureId?: string }) => {
  if (!mythologicalFigureId || !MYTHOLOGICAL_FIGURES[mythologicalFigureId]) {
    return null;
  }
  
  const figure = MYTHOLOGICAL_FIGURES[mythologicalFigureId];
  const Icon = figure.icon;
  
  return (
    <Tooltip 
      content={
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 border-b border-gray-700/50 pb-2">
            <Icon className="w-5 h-5" style={{ color: figure.color }} strokeWidth={2} />
            <div className="font-medium text-sm">{figure.name}</div>
          </div>
          <div className="text-gray-300 text-xs">{figure.description}</div>
          <div className="text-gray-400 italic text-xs mt-1">
            <span className="font-medium text-gray-300">Domain:</span> {figure.domain}
          </div>
        </div>
      }
    >
      <div 
        className="ml-2 flex-shrink-0 text-lg transition-all duration-300 hover:scale-110 hover:-rotate-3"
        style={{ color: figure.color }}
      >
        <Icon className="w-5 h-5" strokeWidth={2} />
      </div>
    </Tooltip>
  );
};

// Deity Selector component for add/edit forms - use SelectorTooltip here
const DeitySelector = ({ 
  tier, 
  selectedDeityId, 
  onChange 
}: { 
  tier: 'olympian' | 'titan' | 'hero'; 
  selectedDeityId?: string; 
  onChange: (id: string | undefined) => void 
}) => {
  const deities = getMythologicalFiguresByTier(tier);
  
  return (
    <div className="mt-2 mb-6"> {/* Added bottom margin for spacing */}
      <label className="block text-sm text-gray-400 mb-2">Associated Deity:</label>
      <div className="flex flex-wrap gap-4 mb-4 px-2"> {/* Increased gap and added padding */}
        <button
          className={`p-2 flex items-center justify-center transition-all duration-200 rounded-md
                   ${!selectedDeityId ? 'bg-slate-700 text-white' : 'text-gray-400 hover:text-white'}`}
          onClick={() => onChange(undefined)}
          title="None"
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>
        
        {deities.map(deity => {
          const Icon = deity.icon;
          const isSelected = selectedDeityId === deity.id;
          
          return (
            <SelectorTooltip
              key={deity.id}
              content={
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 border-b border-gray-700/50 pb-2">
                    <Icon className="w-5 h-5" style={{ color: deity.color }} strokeWidth={2} />
                    <div className="font-medium text-sm">{deity.name}</div>
                  </div>
                  <div className="text-gray-300 text-xs">{deity.description}</div>
                  <div className="text-gray-400 italic text-xs mt-1">
                    <span className="font-medium text-gray-300">Domain:</span> {deity.domain}
                  </div>
                </div>
              }
            >
              <button
                className={`p-2 text-lg flex items-center justify-center transition-all duration-200 rounded-md
                          ${isSelected ? 'bg-slate-700' : 'hover:bg-slate-800/60'}`}
                style={{ 
                  color: deity.color,
                }}
                onClick={() => onChange(deity.id)}
              >
                <Icon className="w-6 h-6" strokeWidth={isSelected ? 2.5 : 2} />
              </button>
            </SelectorTooltip>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to convert hex color to RGB for shadow
function hexToRgb(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert 3-digit hex to 6-digits
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
}

// ────────────────────────────────────────── Autocomplete with focus / picked guard
interface ACProps{value:string;onChange:(v:string)=>void;onSelect:(v:string)=>void;inputClass?:string;}
function Autocomplete({value,onChange,onSelect,inputClass=""}:ACProps){
  const [sugs,setSugs]=useState<string[]>([]);
  const [active,setActive]=useState(-1);
  const [picked,setPicked]=useState<string>("");
  const [focused,setFocused]=useState(false);
  const ref=useRef<HTMLDivElement>(null);

  useEffect(()=>{if(!focused)return;const t=setTimeout(async()=>{if(value.trim().length<3||value===picked)return setSugs([]);setSugs(await wikiSuggestions(value));setActive(-1);},250);return()=>clearTimeout(t);},[value,focused,picked]);

  const close=()=>setSugs([]);
  const handleKey=(e:KeyboardEvent<HTMLInputElement>)=>{if(sugs.length===0)return;if(e.key==="ArrowDown"){e.preventDefault();setActive(i=>(i+1)%sugs.length);}else if(e.key==="ArrowUp"){e.preventDefault();setActive(i=>(i-1+sugs.length)%sugs.length);}else if(e.key==="Enter"&&active>=0){e.preventDefault();choose(sugs[active]);}};
  const choose=(s:string)=>{onSelect(s);setPicked(s);close();};

  const outside=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))close();};
  useEffect(()=>{window.addEventListener("click",outside);return()=>window.removeEventListener("click",outside);},[]);

  return <div className="relative" ref={ref}><Input value={value} onFocus={()=>setFocused(true)} onBlur={(e:FocusEvent)=>setFocused(false)} onChange={e=>onChange(e.target.value)} onKeyDown={handleKey} className={inputClass} placeholder="Title" />{sugs.length>0&&<ul className="absolute left-0 right-0 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-md shadow-lg max-h-48 overflow-auto text-sm z-20">{sugs.map((s,i)=><li key={s} className={`px-3 py-2 cursor-pointer ${i===active?"bg-slate-700":"hover:bg-slate-700/60"} text-white transition-all duration-150`} onMouseEnter={()=>setActive(i)} onMouseLeave={()=>setActive(-1)} onClick={()=>choose(s)}>{s}</li>)}</ul>}</div>;
}

// ────────────────────────────────────────── Main component
export default function GamePantheon(){
 // Initialize with empty array instead of SAMPLE_GAMES
 const[games,setGames]=useState<Game[]>([]);
 const[newGame,setNewGame]=useState<Partial<Game>>({category:"hero"});
 const[editing,setEditing]=useState<string|null>(null);
 const[draft,setDraft]=useState<Partial<Game>>({});
 const[isSharedView,setIsSharedView]=useState<boolean>(false);
 const[shareUrl,setShareUrl]=useState<string>("");
 const[showShareModal,setShowShareModal]=useState<boolean>(false);
 const[compressionStats,setCompressionStats]=useState<{original: number, compressed: number, ratio: number}>({original: 0, compressed: 0, ratio: 0});
 
 // Add a ref to track if this is first render
 const isInitialMount = useRef(true);
 
 // Force dark mode
 useEffect(() => {
   document.documentElement.classList.add('dark');
   
   // Check for shared data in URL
   const url = new URL(window.location.href);
   const sharedData = url.searchParams.get('shared');
   
   if (sharedData) {
     try {
       console.log("Loading from shared URL");
       const decodedGames = decodeGameData(sharedData);
       setGames(decodedGames);
       setIsSharedView(true);
     } catch (e) {
       console.error("Failed to parse shared games", e);
     }
   } else {
     // Load games from localStorage only if not a shared view
     const savedGames = localStorage.getItem('pantheonGames');
     console.log("Loading from localStorage:", savedGames ? "Found data" : "No data found");
     
     if (savedGames) {
       try {
         const parsedGames = JSON.parse(savedGames);
         console.log(`Loaded ${parsedGames.length} games from localStorage`);
         setGames(parsedGames);
       } catch (e) {
         console.error("Failed to parse saved games", e);
       }
     } else {
       // Only use SAMPLE_GAMES if there's nothing in localStorage
       console.log("Using sample games");
       setGames(SAMPLE_GAMES);
     }
   }
 }, []);

 // Save games to localStorage whenever they change (only if not in shared view)
 useEffect(() => {
   // Skip saving on the initial mount - we're either loading from localStorage or setting up initial state
   if (isInitialMount.current) {
     isInitialMount.current = false;
     console.log("Skipping initial localStorage save");
     return;
   }
   
   if (!isSharedView) {
     console.log(`Saving ${games.length} games to localStorage`);
     localStorage.setItem('pantheonGames', JSON.stringify(games));
   }
 }, [games, isSharedView]);
 
 // Sharing functionality
 const generateShareLink = () => {
   // Get both compressed and uncompressed sizes for comparison
   const rawData = JSON.stringify(games);
   const rawBase64 = btoa(encodeURIComponent(rawData));
   
   const encodedData = encodeGameData(games);
   const url = new URL(window.location.href);
   // Remove any existing shared parameter
   url.searchParams.delete('shared');
   // Add the encoded data
   url.searchParams.set('shared', encodedData);
   setShareUrl(url.toString());
   
   // Calculate compression stats
   const compressionRatio = Math.round((1 - (encodedData.length / rawBase64.length)) * 100);
   setCompressionStats({
     original: rawBase64.length,
     compressed: encodedData.length,
     ratio: compressionRatio
   });
   
   setShowShareModal(true);
 };
 
 const copyToClipboard = () => {
   navigator.clipboard.writeText(shareUrl)
     .then(() => {
       // Could add a toast/notification here
       console.log("URL copied to clipboard");
     })
     .catch(err => {
       console.error("Failed to copy URL", err);
     });
 };
 
 const createNewFromShared = () => {
   // Save current games to localStorage and exit shared view
   localStorage.setItem('pantheonGames', JSON.stringify(games));
   setIsSharedView(false);
   
   // Remove shared parameter from URL without refreshing
   const url = new URL(window.location.href);
   url.searchParams.delete('shared');
   window.history.pushState({}, '', url.toString());
 };
 
 const startFresh = () => {
   setGames(SAMPLE_GAMES);
   setIsSharedView(false);
   
   // Remove shared parameter from URL without refreshing
   const url = new URL(window.location.href);
   url.searchParams.delete('shared');
   window.history.pushState({}, '', url.toString());
 };
 
 // CRUD
 const add=()=>{if(!newGame.title||!newGame.genre||!newGame.year)return;setGames([...games,{...(newGame as Game),id:uid()}]);setNewGame({category:"hero"});};
 const del=(id:string)=>setGames(games.filter(g=>g.id!==id));
 const save=(id:string)=>{if(!draft.title||!draft.genre||!draft.year)return;setGames(games.map(g=>g.id===id?{...g,...draft as Game}:g));setEditing(null);};
 
 // drag
 const onDragStart=(e:React.DragEvent,id:string)=>{e.dataTransfer.setData("text/plain",id);e.dataTransfer.effectAllowed="move";};
 const onDrop=(e:React.DragEvent,target:CategoryID)=>{e.preventDefault();const id=e.dataTransfer.getData("text/plain");if(!id)return;setGames(gs=>gs.map(g=>g.id===id?{...g,category:target}:g));};
 
 // Update drag highlight colors based on category
 const allow=(e:React.DragEvent, category: CategoryID)=>{
   e.preventDefault();
   e.dataTransfer.dropEffect="move";
   
   // Get target element and check if already highlighted
   const target = e.currentTarget as HTMLElement;
   
   // Important: Clear any existing highlights before adding new ones
   // This ensures only the current target is highlighted
   document.querySelectorAll('.drag-highlight').forEach(el => {
     if (el !== target) {
       el.classList.remove('drag-highlight');
       (el as HTMLElement).style.outlineStyle = '';
       (el as HTMLElement).style.outlineWidth = '';
       (el as HTMLElement).style.outlineColor = '';
       (el as HTMLElement).style.backgroundColor = '';
     }
   });
   
   // Skip if already highlighted
   if (target.classList.contains('drag-highlight')) return;
   
   // Add highlight class
   target.classList.add('drag-highlight');
   
   // Get colors for this category
   const colors = CATEGORY_COLORS[category];
   
   // Apply category-specific styles
   target.style.outlineStyle = 'dashed';
   target.style.outlineWidth = '2px';
   target.style.outlineColor = colors.highlight;
   target.style.backgroundColor = `${colors.highlight}33`; // 33 is ~20% opacity in hex
 };
 
 const removeDragHighlight=(e:React.DragEvent)=>{
   const target = e.currentTarget as HTMLElement;
   target.classList.remove('drag-highlight');
   
   // Reset styles
   target.style.outlineStyle = '';
   target.style.outlineWidth = '';
   target.style.outlineColor = '';
   target.style.backgroundColor = '';
 };
 
 // autofill
 const autoNew=async()=>{if(!newGame.title)return;setNewGame({...newGame,...await wikipediaInfo(newGame.title)});};
 const autoEdit=async()=>{if(!draft.title)return;setDraft({...draft,...await wikipediaInfo(draft.title)});};

 return (
  <div className="p-8 bg-gradient-to-br from-slate-950 to-gray-900 min-h-screen select-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] font-sans">
    <header className="text-center mb-10 relative">
      <h1 className="text-5xl font-serif font-bold tracking-wider text-white mb-1">
        <span className="inline-block mr-2 transform translate-y-1">🏛️</span> 
        The Game Pantheon
      </h1>
      <p className="text-gray-400 text-sm tracking-wide mt-2 italic">Curate your personal collection of gaming greatness</p>
      
      {/* Share button (only in edit mode) */}
      {!isSharedView && (
        <div className="absolute right-0 top-0">
          <Button onClick={generateShareLink} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700">
            <Share2 className="w-4 h-4" /> Share
          </Button>
        </div>
      )}
      
      {/* Shared view banner */}
      {isSharedView && (
        <div className="absolute left-0 top-0 flex items-center">
          <Button onClick={() => window.history.back()} className="mr-3 bg-slate-800 hover:bg-slate-700 flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back
          </Button>
          <div className="bg-slate-800/80 backdrop-blur-sm text-white py-2 px-4 rounded-md flex items-center text-sm">
            <span className="text-amber-300 mr-2">👁️</span> Viewing a shared pantheon
          </div>
        </div>
      )}
    </header>
    
    {/* "Create your own" banner for shared view */}
    {isSharedView && (
      <div className="mx-auto max-w-2xl bg-amber-900/30 border border-amber-700/30 backdrop-blur-md p-4 rounded-xl shadow-xl mb-12 text-center">
        <h3 className="text-amber-200 font-medium mb-2">Want to create your own pantheon?</h3>
        <div className="flex justify-center gap-4">
          <Button onClick={createNewFromShared} className="bg-amber-800 hover:bg-amber-700">Start with this collection</Button>
          <Button onClick={startFresh} className="bg-slate-700 hover:bg-slate-600">Start from scratch</Button>
        </div>
      </div>
    )}
    
    {/* Share Modal */}
    {showShareModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-2xl max-w-md w-full">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-400" /> Share Your Pantheon
          </h2>
          <p className="text-gray-400 mb-4 text-sm">Share this link with friends to show them your game pantheon:</p>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={shareUrl} 
              readOnly 
              className="flex-grow bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white text-sm overflow-hidden" 
            />
            <Button onClick={copyToClipboard} className="bg-slate-700 hover:bg-slate-600 flex-shrink-0 flex items-center gap-2">
              <Copy className="w-4 h-4" /> Copy
            </Button>
          </div>
          
          {/* Compression stats */}
          <div className="bg-slate-800/50 rounded-md p-3 mb-6 text-sm">
            <h3 className="text-gray-300 font-medium mb-2 flex items-center gap-2">
              <span className="text-amber-300">📊</span> Compression Statistics
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="text-gray-400">Original data size:</div>
              <div className="text-gray-300">{compressionStats.original.toLocaleString()} chars</div>
              
              <div className="text-gray-400">Compressed size:</div>
              <div className="text-gray-300">{compressionStats.compressed.toLocaleString()} chars</div>
              
              <div className="text-gray-400">Size reduction:</div>
              <div className="text-amber-300 font-medium">{compressionStats.ratio}%</div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => setShowShareModal(false)} className="bg-slate-700 hover:bg-slate-600">Done</Button>
          </div>
        </div>
      </div>
    )}
    
    {/* Add Form - only show if not in shared view */}
    {!isSharedView && (
      <div className="mx-auto max-w-2xl bg-slate-900/70 backdrop-blur-md p-6 rounded-xl shadow-xl mb-12 border border-slate-800/50">
        <h2 className="text-xl font-serif font-bold flex items-center gap-2 text-white mb-4 tracking-wide">
          <Plus className="w-5 h-5"/> Add Game
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Autocomplete value={newGame.title??""} onChange={v=>setNewGame({...newGame,title:v})} onSelect={async v=>setNewGame({...newGame,title:v,...await wikipediaInfo(v)})}/>
          <Input placeholder="Genre" value={newGame.genre??""} onChange={e=>setNewGame({...newGame,genre:e.target.value})}/>
          <Input type="number" placeholder="Year" value={newGame.year??""} onChange={e=>setNewGame({...newGame,year:+e.target.value})}/>
          <Select value={newGame.category} onChange={e=>setNewGame({...newGame,category:e.target.value as CategoryID})}>
            {Object.entries(CATEGORIES).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}
          </Select>
        </div>
        
        {/* Mythological Figure Selector - only show for olympian, titan, or hero categories */}
        {(newGame.category === 'olympian' || newGame.category === 'titan' || newGame.category === 'hero') && (
          <DeitySelector 
            tier={newGame.category as 'olympian' | 'titan' | 'hero'}
            selectedDeityId={newGame.mythologicalFigureId}
            onChange={(id) => setNewGame({...newGame, mythologicalFigureId: id})}
          />
        )}
        
        <div className="flex justify-between mt-6">
          <Button onClick={autoNew} className="bg-slate-700 hover:bg-slate-600 text-gray-200">Auto‑Fill</Button>
          <Button onClick={add} className="bg-slate-700 hover:bg-slate-600">Add</Button>
        </div>
      </div>
    )}

    <div className="grid gap-6" style={{gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))"}}>
      {Object.entries(CATEGORIES).map(([cid,meta])=>{
        const categoryID = cid as CategoryID;
        const Icon = meta.icon;
        const list = games.filter(g=>g.category===categoryID);
        const colors = CATEGORY_COLORS[categoryID];
        
        return <Card 
          key={cid} 
          category={categoryID}
          onDragOver={!isSharedView ? (e: React.DragEvent) => allow(e, categoryID) : undefined} 
          onDragLeave={!isSharedView ? removeDragHighlight : undefined}
          onDragEnter={!isSharedView ? (e: React.DragEvent) => {
            // Prevent event bubbling to avoid multiple highlights
            e.stopPropagation();
            allow(e, categoryID);
          } : undefined}
          onDrop={!isSharedView ? (e: React.DragEvent)=>{
            removeDragHighlight(e);
            onDrop(e,categoryID);
          } : undefined}
        >
          <CardHeader category={categoryID}>
            <Icon className="w-5 h-5 text-white opacity-90"/>
            <CardTitle category={categoryID}>{meta.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-2 italic">{meta.blurb}</p>
            {list.length?
              <ul className="space-y-2 text-sm divide-y divide-gray-800/30">
                {list.map(g=>editing!==g.id?
                  <li key={g.id} className="flex flex-col gap-1 pt-2 first:pt-0 pl-7 relative group/item" draggable={!isSharedView} onDragStart={!isSharedView ? e=>onDragStart(e,g.id) : undefined}>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-5 flex justify-center">
                      {!isSharedView && (
                        <div className="absolute opacity-0 group-hover/item:opacity-100 text-gray-500 cursor-grab transition-opacity duration-200">
                          <GripVertical size={14} strokeWidth={1.5} />
                        </div>
                      )}
                      {React.createElement(getGenreIcon(g.genre), {
                        className: `w-4 h-4 ${colors.text} flex-shrink-0 ${!isSharedView ? "group-hover/item:opacity-0" : ""} transition-opacity duration-200`,
                        strokeWidth: 1.5
                      })}
                    </div>
                    <div className={!isSharedView ? "cursor-grab flex items-center gap-1 flex-wrap" : "flex items-center gap-1 flex-wrap"}>
                      <div className="flex items-center">
                      <span className="font-medium pr-1 leading-tight text-white">{g.title}</span>
                        {g.mythologicalFigureId && <DeityBadge mythologicalFigureId={g.mythologicalFigureId} />}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">{g.genre} · {g.year}</span>
                      {!isSharedView && (
                        <div className="flex gap-1 opacity-70 group-hover/item:opacity-100 transition-opacity duration-200">
                          <IconBtn title="Edit" onClick={()=>{setEditing(g.id);setDraft({...g})}}><Pen className="w-3 h-3" strokeWidth={1.5}/></IconBtn>
                          <IconBtn title="Delete" onClick={()=>del(g.id)}><X className="w-3 h-3" strokeWidth={1.5}/></IconBtn>
                        </div>
                      )}
                    </div>
                  </li>
                  :
                  (!isSharedView && editing===g.id) && (
                    <li key={g.id} className="flex flex-col gap-3 pt-2 first:pt-0 pl-7 relative">
                      <div className="absolute left-0 top-[calc(1rem+8px)] w-5 flex justify-center">
                        {React.createElement(getGenreIcon(draft.genre || ""), {
                          className: `w-4 h-4 ${colors.text} flex-shrink-0`,
                          strokeWidth: 1.5
                        })}
                      </div>
                      <div>
                        <Autocomplete value={draft.title??""} onChange={v=>setDraft({...draft,title:v})} onSelect={async v=>setDraft({...draft,title:v,...await wikipediaInfo(v)})} inputClass="text-xs"/>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Input value={draft.genre??""} onChange={e=>setDraft({...draft,genre:e.target.value})} className="text-xs" placeholder="Genre"/>
                        <Input type="number" value={draft.year??""} onChange={e=>setDraft({...draft,year:+e.target.value})} className="text-xs" placeholder="Year"/>
                        <Select value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value as CategoryID})} className="text-xs">{Object.entries(CATEGORIES).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}</Select>
                      </div>
                      
                      {/* Mythological Figure Selector in Edit Mode */}
                      {(draft.category === 'olympian' || draft.category === 'titan' || draft.category === 'hero') && (
                        <div className="mt-1">
                          <DeitySelector 
                            tier={draft.category as 'olympian' | 'titan' | 'hero'}
                            selectedDeityId={draft.mythologicalFigureId}
                            onChange={(id) => setDraft({...draft, mythologicalFigureId: id})}
                          />
                        </div>
                      )}
                      
                      <div className="flex justify-end gap-2 items-center">
                        <IconBtn title="Auto‑Fill" onClick={autoEdit}><RefreshCw className="w-3 h-3" strokeWidth={1.5}/></IconBtn>
                        <Button onClick={()=>save(g.id)} className="bg-green-800 hover:bg-green-700 px-2 py-1 text-xs">Save</Button>
                        <Button onClick={()=>setEditing(null)} className="bg-gray-700 hover:bg-gray-600 px-2 py-1 text-xs">Cancel</Button>
                      </div>
                    </li>
                  )
                )}
              </ul>
            : 
              <div className="flex items-center justify-center h-16 text-gray-500 italic text-sm border border-dashed border-gray-700/30 rounded-lg">
                No games in this category yet
              </div>
            }
          </CardContent>
        </Card>
      })}
    </div>
  </div>
 );
} 

// ────────────────────────────────────────── Wikipedia helpers (was accidentally removed)
const GENRE_KEYWORDS:[RegExp,string][]= [[/first‑person shooter/i,"FPS"],[/action‑adventure/i,"Action‑Adventure"],[/role‑?playing/i,"RPG"],[/4x/i,"4X Strategy"],[/real‑time strategy/i,"RTS"],[/turn‑based strategy/i,"TBS"]];
async function wikiSuggestions(q:string){try{const res=await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=10&format=json&origin=*`);if(!res.ok)return[];const d=await res.json() as any;return d[1]??[]}catch{return[]}}
function extractGenreFromInfobox(html:string){try{const doc=new DOMParser().parseFromString(html,"text/html");for(const tr of doc.querySelectorAll("table.infobox tr")){const th=tr.querySelector("th");if(th&&/Genre/i.test(th.textContent||"")){const td=tr.querySelector("td");if(td)return td.textContent?.split(/•|,|\||\//)[0].trim();}}}catch{} }
async function wikipediaInfo(t:string){try{const [sum,html]=await Promise.all([fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t)}`),fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(t)}`)]);if(!sum.ok)return{};const extract=(await sum.json()).extract??"";let genre;if(html.ok)genre=extractGenreFromInfobox(await html.text());if(!genre){for(const[r,l]of GENRE_KEYWORDS)if(r.test(extract)){genre=l;break}}const y=extract.match(/(19|20)\d{2}/);return{genre,year:y?+y[0]:undefined};}catch{return{}}} 