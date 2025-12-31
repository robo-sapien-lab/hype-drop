
export interface AdCopyContent {
  headline: string;
  body: string;
  hashtags: string[];
}

export interface AdCopyResponse {
  witty: AdCopyContent;
  edgy: AdCopyContent;
  minimalist: AdCopyContent;
  sarcastic: AdCopyContent;
  aspirational: AdCopyContent;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface GeneratedImage {
  data: string; // base64
  mimeType: string;
}

export type FabricType = 'cotton' | 'fleece' | 'denim' | 'nylon' | 'leather';

// New Garment Type Definition for Structural Physics
export type GarmentType = 't-shirt' | 'hoodie' | 'sweatshirt' | 'jacket' | 'pants' | 'shorts';

export type FitType = 'regular' | 'oversized' | 'slim';

// Refactored for Luxury Brand Logic with Enhanced Textures
export type BackgroundOption = 
  | 'minimal_luxury'    // Dior/Celine: Clean, grey/white plaster, soft light
  | 'sunlit_travertine' // Jacquemus: Warm stone blocks, leaf shadows (Matches Ref Image 1)
  | 'urban_concrete'    // Streetwear: Raw grey concrete, industrial (Matches Ref Image 2/3)
  | 'moody_editorial';  // YSL: Dark, high contrast (Matches Ref Image 4)

export type CustomBackground = 
  | { type: 'color'; value: string }
  | { type: 'image'; value: string; mimeType: string };

export type ModelMode = 'ghost' | 'human';
export type ModelGender = 'female' | 'male' | 'neutral';

// Composition is now strictly Golden Ratio by default, but keeping type for internal consistency if needed later
export type CompositionType = 'golden_ratio';

export interface LightingSettings {
  main: {
    intensity: 'soft' | 'medium' | 'hard';
    color: 'neutral' | 'warm' | 'cool';
    direction: 'front' | 'left' | 'right' | 'top';
  };
  rim: {
    intensity: 'none' | 'subtle' | 'strong';
    color: 'white' | 'lime' | 'cyan' | 'magenta' | 'orange';
    direction: 'left' | 'right' | 'top';
  };
}