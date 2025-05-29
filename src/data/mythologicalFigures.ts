import { MythologicalFigure } from '../types';
import {
  Zap, Waves, Skull, Bird, Sun, Moon, Sword, HeartHandshake,
  Feather, Hammer, Wheat, Wine, Clock, Mountain, Star, Globe,
  Dumbbell, Shield, Compass, Footprints, Ship, Tent, Workflow
} from 'lucide-react';

// Define mythological figures data
export const MYTHOLOGICAL_FIGURES: Record<string, MythologicalFigure> = {
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

// Helper function to filter mythological figures by tier
export const getMythologicalFiguresByTier = (tier: 'olympian' | 'titan' | 'hero'): MythologicalFigure[] => {
  return Object.values(MYTHOLOGICAL_FIGURES).filter(figure => figure.tier === tier);
}; 