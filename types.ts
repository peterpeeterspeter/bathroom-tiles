
export enum FixtureType {
  TOILET = 'TOILET',
  SHOWER = 'SHOWER',
  BATHTUB = 'BATHTUB',
  SINK = 'SINK',
  WINDOW = 'WINDOW',
  DOOR = 'DOOR',
  RADIATOR = 'RADIATOR',
  OBSTACLE = 'OBSTACLE'
}

export interface Fixture {
  type: FixtureType;
  description: string;
  fixed: boolean; 
  // Coordinates for Schematic View (0-100 scale)
  positionX?: number; // 0 = Left, 100 = Right
  positionY?: number; // 0 = Top (Back wall), 100 = Bottom (Viewer)
  wallIndex?: number; // 0=North, 1=East, 2=South, 3=West
}

export interface ProjectSpec {
  roomType: string;
  layoutShape: 'RECTANGLE' | 'L_SHAPE' | 'SQUARE';
  estimatedWidthMeters: number;
  estimatedLengthMeters: number;
  ceilingHeightMeters: number;
  totalAreaM2: number;
  existingFixtures: Fixture[];
  constraints: string[]; 
}

export interface CostItem {
  description: string;
  category: 'Materials' | 'Labor' | 'Other';
  amount: number;
  unit: string; // m2, hours, pcs
  unitPrice: number;
  totalPrice: number;
  // New fields for Supplier Integration
  brand?: string;
  productName?: string;
  sku?: string;
  productImageUrl?: string;
}

export interface Estimate {
  lineItems: CostItem[];
  subtotal: number;
  contingency: number; // 10% buffer
  tax: number;
  grandTotal: number;
  currency: string;
  summary: string;
}

export enum RenovationStyle {
  MODERN = 'Modern Minimalist',
  INDUSTRIAL = 'Industrial Chic',
  SCANDINAVIAN = 'Scandinavian Hygge',
  LUXURY = 'Hotel Luxury',
  CLASSIC = 'Modern Classic'
}

export interface StyleTag {
  tag: string;
  weight: number;
}

export interface ExpertAnalysis {
  currentState: string;
  conditionScore: number;
  keepElements: string[];
  opportunities: string[];
  recommendations: string[];
  layoutAdvice: string;
  estimatedComplexity: 'eenvoudig' | 'gemiddeld' | 'complex';
}

export interface StyleProfile {
  tags: StyleTag[];
  summary: string;
  source: 'preset' | 'ai_vision' | 'combined';
  presetId?: number;
  presetName?: string;
  referenceImageUrls?: string[];
  expertAnalysis?: ExpertAnalysis;
}

export interface DatabaseProduct {
  id: string;
  brand: string;
  name: string;
  category: 'Faucet' | 'Toilet' | 'Shower' | 'Vanity' | 'Tile' | 'Lighting' | 'Bathtub';
  price: number;
  currency: string;
  image_url: string;
  origin: string;
  is_active: boolean;
  display_order: number;
  tags: string[];
}

export interface StylePreset {
  id: number;
  name: string;
  label_nl: string;
  description_nl: string;
  image_url: string;
  display_order: number;
  tags: string[];
}

export enum BudgetTier {
  BUDGET = 'Budget',
  STANDARD = 'Standard',
  PREMIUM = 'Premium'
}

export interface MaterialConfig {
  floorTile: string;
  wallTile: string;
  vanityType: string;
  faucetFinish: string;
  toiletType: string;
  lightingType: string;
  bathtubType?: string;
  showerType?: string;
}

export interface GenerationResult {
  spec: ProjectSpec;
  estimate: Estimate;
  renderUrl?: string;
  renderPrompt?: string;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
