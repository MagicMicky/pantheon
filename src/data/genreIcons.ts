import {
  Sword, Crosshair, Car, Trophy, Dice1, Ghost, Brain, Globe,
  Building, Rocket, Gamepad2, Map, Users, Heart, ZapOff, 
  Skull, Music, Snowflake, Landmark, Clock, Clover, Wand2, Hourglass
} from 'lucide-react';

// Genre icons mapping for game list items
export const GENRE_ICON_MAPPING = [
  // Action/Combat
  { keywords: /\b(action|fight|beat|hack|slash|shoot|combat)\b/i, icon: Sword },
  
  // Shooters
  { keywords: /\b(fps|shooter|first.person)\b/i, icon: Crosshair },
  
  // Racing/Sports
  { keywords: /\b(rac(e|ing)|driv(e|ing)|car)\b/i, icon: Car },
  { keywords: /\b(sport|athlet|football|soccer|baseball|basketball|hockey)\b/i, icon: Trophy },
  
  // RPG/Adventure
  { keywords: /\b(turn.based.*(role.?play|rpg)|tactical.rpg)\b/i, icon: Dice1 },
  { keywords: /\b(rpg|role.?play|dungeon)\b/i, icon: Dice1 },
  { keywords: /\b(adventure|quest|point.and.click)\b/i, icon: Ghost },
  
  // Strategy/Puzzle
  { keywords: /\b(strateg|tactics)\b/i, icon: Brain },
  { keywords: /\b(puzzle)\b/i, icon: Brain },
  
  // Turn-based games
  { keywords: /\b(turn.based)\b/i, icon: Clock },
  
  // Global/Online
  { keywords: /\b(4x|grand.strateg|world.conquest)\b/i, icon: Globe },
  { keywords: /\b(mmo|multiplayer.online)\b/i, icon: Users },
  
  // Real-time strategy
  { keywords: /\b(rts|real.time.strateg)\b/i, icon: Building },
  
  // Simulation
  { keywords: /\b(simulat|management|build|construct|city|farm)\b/i, icon: Rocket },
  
  // Platformer
  { keywords: /\b(platform|side.scroll|jump)\b/i, icon: Gamepad2 },
  
  // Open world
  { keywords: /\b(open.world|sandbox)\b/i, icon: Map },
  
  // Visual Novel/Dating
  { keywords: /\b(visual.novel|dating|romance|otome)\b/i, icon: Heart },

  // Survival/Horror
  { keywords: /\b(surviv|horror|apocalyp|scare|terror|creep)\b/i, icon: Skull },
  
  // Stealth
  { keywords: /\b(stealth|sneak|infiltrat|espionage|spy)\b/i, icon: ZapOff },

  // Rhythm/Music
  { keywords: /\b(rhythm|music|danc|dj|sing|band)\b/i, icon: Music },

  // Roguelike/Roguelite
  { keywords: /\b(rogue|procedural|permadeath|dungeon.crawler)\b/i, icon: Clover },

  // Educational
  { keywords: /\b(educat|learn|teach|school|knowledge|quiz)\b/i, icon: Landmark },

  // Historical
  { keywords: /\b(histor|medieval|ancient|war|civil|world.war)\b/i, icon: Hourglass },

  // Card/Board Games
  { keywords: /\b(card|board|tabletop|deck.build|ccg|tcg)\b/i, icon: Dice1 },

  // Fantasy
  { keywords: /\b(fantasy|magic|wizard|spell|myth|legend)\b/i, icon: Wand2 },

  // Survival Horror
  { keywords: /\b(survival.horror|zombie|scare|terror)\b/i, icon: Skull },

  // Tower Defense
  { keywords: /\b(tower.defense)\b/i, icon: Building },

  // Metroidvania
  { keywords: /\b(metroidvania|castlevania|metroid-like)\b/i, icon: Map }
]; 