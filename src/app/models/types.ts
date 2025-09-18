export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface CardData {
  seed: number;
  rarity: Rarity;
  personality: string;
  mood: string;
}

export interface Palette {
  bear: string[];
  background: string[];
  accent: string[];
}

export interface Palettes {
  common: Palette;
  rare: Palette;
  epic: Palette;
  legendary: Palette;
  mythic: Palette;
}

export const MOODS: readonly string[] = [
  'DEPRESSED',
  'VIBING',
  'COPING',
  'TIRED',
  'ANXIOUS',
  'NUMB',
  'STRUGGLING',
  'HAPPY',
  'PUMPED',
  'OVERWHELMED',
  'PEACEFUL',
  'ANGRY',
  'HOPEFUL',
  'DEFEATED',
  'RESTLESS',
  'IRRITATED',
  'INSPIRED',
  'EXHAUSTED',
  'CURIOUS',
  'SAD',
  'CONFIDENT',
  'INSECURE',
  'JOYFUL',
  'BITTER',
  'RELAXED',
  'STRESSED',
  'OPTIMISTIC',
  'LOVED',
  'LONELY',
  'EXCITED',
  'BORED',
  'PROUD',
  'ASHAMED',
  'CALM',
  'PANICKED',
  'SERIOUS',
  'CREATIVE',
  'BLOCKED',
  'HELPLESS',
  'ANNOYED',
  'TRIGGERED',
  'BRAVE',
  'FEARFUL',
  'REJECTED',
  'SILLY',
  'SALTY',
  'HESITANT',
  'ZEN',
  'BLESSED',
  'CURSED',
  'HOPELESS',
  'LOST',
  'BROKEN',
  'SUS',
  'BASED',
  'CRINGE',
  'UNBOTHERED',
  'UNHINGED',
  'SPICY',
  'GOATED',
  'LIT',
  'SMOL',
  'COOKED',
  'SOFT',
  'TOXIC',
  'CANCELLED',
  'REKT',
  'POOR',
  'RICH',
  'CHILL',
  'SLEEPY',
  'WOKE',
  'STONED',
  'HUNGOVER',
  'SWEATY',
  'DRUNK',
  'HYPED',
  'SCARED',
  'BADASS',
  'NOOB',
  'RETARD',
  'CRYING',
  'PRERICH',
] as const;

export const PERSONALITIES: readonly string[] = [
  'degen',
  'doomer',
  'chad',
  'beta',
  'normie',
  'nerd',
  'punk',
  'stoner',
  'simp',
  'boomer',
  'artist',
  'poet',
  'monk',
  'rebel',
  'joker',
  'hero',
  'fool',
  'viber',
  'dreamer',
  'mfer',
  'hacker',
  'trader',
  'hodler',
  'npc',
  'grifter',
  'shitposter',
  'troll',
  'memelord',
  'kol',
  'pimp',
  'seller',
  'bear',
  'idiot',
  'loser',
  'noob',
  'viber',
] as const;

export const PALETTES: Palettes = {
  common: {
    bear: ['#8B6F47', '#6B5637', '#A0825C', '#7D6444', '#9B8060'],
    background: ['#2a2a3e', '#16213e', '#1a1a2e'],
    accent: ['#4a4a4a', '#5a5a5a', '#3a3a3a']
  },
  rare: {
    bear: ['#7B8FA6', '#5C7A99', '#9CADC7', '#6B89A8', '#8AA2BE'],
    background: ['#1e3a5f', '#2c5282', '#1a365d'],
    accent: ['#4A90E2', '#5BA0F2', '#3A80D2']
  },
  epic: {
    bear: ['#8B5A8E', '#6B466E', '#A570A9', '#7B5A7E', '#9B60A0'],
    background: ['#2e1a3e', '#4a2c5e', '#3d2352'],
    accent: ['#B565D9', '#C575E9', '#A555C9']
  },
  legendary: {
    bear: ['#D4A574', '#B8935F', '#E6C08A', '#C89864', '#F0D09A'],
    background: ['#3e2a1a', '#5e4a2c', '#4d3319'],
    accent: ['#FFD700', '#FFC700', '#FFE700']
  },
  mythic: {
    bear: ['#5DADE2', '#48C9D0', '#7FD3E8', '#6DC0E5', '#8FE0F0'],
    background: ['#0a1929', '#0e2341', '#132f4c'],
    accent: ['#00FFFF', '#00EFEF', '#10FFFF', '#FF00FF', '#FFFF00']
  }
};
