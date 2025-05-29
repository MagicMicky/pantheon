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
    domain: 'Power fantasy, rulership, divine justice, overcoming limitations, dramatic conflicts',
    color: '#5c9eff' // brightened blue
  },
  poseidon: {
    id: 'poseidon',
    name: 'Poseidon',
    tier: 'olympian',
    icon: Waves,
    description: 'God of the sea, earthquakes, storms, and horses',
    domain: 'Exploration, unpredictability, naval themes, natural disasters, tempestuous forces',
    color: '#4db8ff' // brightened blue-teal
  },
  hades: {
    id: 'hades',
    name: 'Hades',
    tier: 'olympian',
    icon: Skull,
    description: 'God of the underworld and the dead',
    domain: 'Dark themes, underworld exploration, death mechanics, wealth acquisition, isolation',
    color: '#a069df' // brightened purple
  },
  athena: {
    id: 'athena',
    name: 'Athena',
    tier: 'olympian',
    icon: Bird, // Owl
    description: 'Goddess of wisdom, courage, inspiration, and strategic warfare',
    domain: 'Strategic planning, intelligent combat, wisdom seeking, defensive tactics, civilization building',
    color: '#d6d6d6' // brightened silver
  },
  apollo: {
    id: 'apollo',
    name: 'Apollo',
    tier: 'olympian',
    icon: Sun,
    description: 'God of music, arts, knowledge, healing, prophecy, and the sun',
    domain: 'Artistic expression, healing mechanics, prophecy/foresight, illumination, harmony',
    color: '#ffd966' // brightened gold
  },
  artemis: {
    id: 'artemis',
    name: 'Artemis',
    tier: 'olympian',
    icon: Moon,
    description: 'Goddess of the hunt, wilderness, animals, and the moon',
    domain: 'Hunting gameplay, wilderness survival, animal companions, precision combat, independence',
    color: '#c6d8ff' // brightened silver-blue
  },
  ares: {
    id: 'ares',
    name: 'Ares',
    tier: 'olympian',
    icon: Sword,
    description: 'God of war, bloodshed, and violence',
    domain: 'Intense combat, bloodshed, chaotic battles, berserker rage, conquest',
    color: '#ff5252' // brightened red
  },
  aphrodite: {
    id: 'aphrodite',
    name: 'Aphrodite',
    tier: 'olympian',
    icon: HeartHandshake,
    description: 'Goddess of love, beauty, and passion',
    domain: 'Romance options, persuasion mechanics, beauty aesthetics, desire fulfillment, emotional manipulation',
    color: '#ff8ad8' // brightened pink
  },
  hermes: {
    id: 'hermes',
    name: 'Hermes',
    tier: 'olympian',
    icon: Feather,
    description: 'God of trade, wealth, luck, language, and travel',
    domain: 'Fast-paced movement, commerce systems, luck mechanics, communication themes, traveling',
    color: '#7dd3ff' // brightened light blue
  },
  hephaestus: {
    id: 'hephaestus',
    name: 'Hephaestus',
    tier: 'olympian',
    icon: Hammer,
    description: 'God of fire, metalworking, stone masonry, and sculpture',
    domain: 'Crafting systems, technological innovation, building mechanics, creation focus, fire manipulation',
    color: '#ff9e5e' // brightened orange-red
  },
  demeter: {
    id: 'demeter',
    name: 'Demeter',
    tier: 'olympian',
    icon: Wheat,
    description: 'Goddess of agriculture, fertility, and sacred law',
    domain: 'Farming mechanics, growth systems, seasonal cycles, nurturing gameplay, abundance',
    color: '#a6e06c' // brightened green-yellow
  },
  dionysus: {
    id: 'dionysus',
    name: 'Dionysus',
    tier: 'olympian',
    icon: Wine,
    description: 'God of wine, fertility, festivity, and ecstasy',
    domain: 'Party atmospheres, altered states, revelry, breaking norms, freedom of expression',
    color: '#c87dff' // brightened purple
  },

  // Titans (6)
  cronus: {
    id: 'cronus',
    name: 'Cronus',
    tier: 'titan',
    icon: Clock,
    description: 'Titan of time and the ages, father of Zeus',
    domain: 'Time manipulation, generational conflict, inevitable cycles, overthrown authority',
    color: '#5c88cc' // brightened dark blue
  },
  rhea: {
    id: 'rhea',
    name: 'Rhea',
    tier: 'titan',
    icon: Mountain,
    description: 'Titaness of fertility, motherhood, and generation',
    domain: 'Protection themes, motherhood dynamics, earth connection, hidden potential',
    color: '#9c7a6e' // brightened brown
  },
  oceanus: {
    id: 'oceanus',
    name: 'Oceanus',
    tier: 'titan',
    icon: Waves,
    description: 'Titan of the great world-encircling river',
    domain: 'Vast water worlds, boundary exploration, primordial forces, cyclical patterns',
    color: '#4d94ff' // brightened deep blue
  },
  hyperion: {
    id: 'hyperion',
    name: 'Hyperion',
    tier: 'titan',
    icon: Sun,
    description: 'Titan of light, father of the sun, moon, and dawn',
    domain: 'Illumination mechanics, observation, enlightenment themes, light vs darkness',
    color: '#ffda58' // brightened bright yellow
  },
  theia: {
    id: 'theia',
    name: 'Theia',
    tier: 'titan',
    icon: Star,
    description: 'Titaness of sight and the shining light of the clear blue sky',
    domain: 'Perception mechanics, clarity, treasure hunting, brilliance, divine insight',
    color: '#e0e0e0' // brightened silver
  },
  atlas: {
    id: 'atlas',
    name: 'Atlas',
    tier: 'titan',
    icon: Globe,
    description: 'Titan condemned to hold up the sky for eternity',
    domain: 'Weight/burden mechanics, map exploration, endurance challenges, duty themes',
    color: '#92b6cc' // brightened stone gray
  },

  // Heroes (8)
  hercules: {
    id: 'hercules',
    name: 'Hercules',
    tier: 'hero',
    icon: Dumbbell,
    description: 'Divine hero known for his strength and numerous far-ranging adventures',
    domain: 'Feats of strength, laborious quests, progressive challenges, overcoming impossible tasks',
    color: '#e8a554' // brightened bronze
  },
  perseus: {
    id: 'perseus',
    name: 'Perseus',
    tier: 'hero',
    icon: Sword,
    description: 'Slayer of Medusa and rescuer of Andromeda',
    domain: 'Monster hunting, rescue missions, mythical equipment, divine assistance',
    color: '#ffe14d' // brightened gold
  },
  achilles: {
    id: 'achilles',
    name: 'Achilles',
    tier: 'hero',
    icon: Shield,
    description: 'Greatest warrior of the Trojan War, with a fatal weakness',
    domain: 'Near-invulnerability, fatal flaws, battlefield excellence, pride and downfall',
    color: '#e86e5a' // brightened bronze-red
  },
  odysseus: {
    id: 'odysseus',
    name: 'Odysseus',
    tier: 'hero',
    icon: Ship,
    description: 'King of Ithaca known for his intelligence and cunning',
    domain: 'Puzzle solving, resourcefulness, long journeys, clever solutions, deception tactics',
    color: '#5c9eff' // brightened blue
  },
  theseus: {
    id: 'theseus',
    name: 'Theseus',
    tier: 'hero',
    icon: Tent,
    description: 'Slayer of the Minotaur and unifier of Attica',
    domain: 'Maze navigation, monster confrontation, civilization building, leadership challenges',
    color: '#a3c2d6' // brightened blue-gray
  },
  jason: {
    id: 'jason',
    name: 'Jason',
    tier: 'hero',
    icon: Compass,
    description: 'Leader of the Argonauts in quest of the Golden Fleece',
    domain: 'Team leadership, epic quests, treasure seeking, naval expeditions, exotic locations',
    color: '#ffde47' // brightened gold-yellow
  },
  atalanta: {
    id: 'atalanta',
    name: 'Atalanta',
    tier: 'hero',
    icon: Footprints,
    description: 'Female warrior, huntress, and athlete',
    domain: 'Speed mechanics, competitive challenges, wilderness expertise, defying gender norms',
    color: '#6fd675' // brightened forest green
  },
  bellerophon: {
    id: 'bellerophon',
    name: 'Bellerophon',
    tier: 'hero',
    icon: Workflow,
    description: 'Tamer of Pegasus and slayer of the Chimera',
    domain: 'Mount/flying mechanics, hybrid creatures, hubris themes, aerial combat',
    color: '#f0f0f0' // brightened white/silver
  }
};

// Helper function to filter mythological figures by tier
export const getMythologicalFiguresByTier = (tier: 'olympian' | 'titan' | 'hero'): MythologicalFigure[] => {
  return Object.values(MYTHOLOGICAL_FIGURES).filter(figure => figure.tier === tier);
}; 