
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
  positionX?: number;
  positionY?: number;
  wallIndex?: number;
  condition?: 'GOOD' | 'WORN' | 'DAMAGED' | 'UNKNOWN';
  confidence?: number;
}

export interface ShellAnchor {
  elementType: 'DOOR' | 'WINDOW' | 'NICHE';
  tl: { x: number; y: number };
  tr: { x: number; y: number };
  br: { x: number; y: number };
  bl: { x: number; y: number };
  doorHingeSide?: 'LEFT' | 'RIGHT' | 'UNKNOWN';
  doorSwing?: 'INWARD' | 'OUTWARD' | 'UNKNOWN';
  confidence: number;
}

export interface WallSpec {
  wallIndex: number;
  visible: boolean;
  anchors: ShellAnchor[];
  hasPlumbing: boolean;
  features?: string;
}

export interface CameraSpec {
  position: 'EYE_LEVEL' | 'ELEVATED' | 'CORNER' | 'LOW_ANGLE';
  facingFromWall: number;
  lensFeel: 'WIDE_ANGLE' | 'NORMAL' | 'TELEPHOTO';
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
  camera?: CameraSpec;
  walls?: WallSpec[];
  primaryLightDirection?: 'LEFT' | 'RIGHT' | 'FRONT' | 'BACK' | 'OVERHEAD' | 'MIXED';
  plumbingWall?: number;
  occlusions?: string[];
}

export interface CostItem {
  description: string;
  category: 'Materials' | 'Labor' | 'Other';
  amount: number;
  unit: string; // m2, hours, pcs
  unitPrice: number;
  totalPrice: number;
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

export type PriceTier = 'budget' | 'mid' | 'premium';

export const PRICE_TIER_LABELS: Record<PriceTier, string> = {
  budget: 'Budget', mid: 'Midden', premium: 'Premium'
};

export const PRICE_TIER_COLORS: Record<PriceTier, string> = {
  budget: 'bg-green-100 text-green-700',
  mid: 'bg-blue-100 text-blue-700',
  premium: 'bg-amber-100 text-amber-700'
};

export interface DatabaseProduct {
  id: string;
  brand: string;
  name: string;
  category: 'Faucet' | 'Toilet' | 'Shower' | 'Vanity' | 'Tile' | 'Lighting' | 'Bathtub' | 'Mirror';
  price: number;
  currency: string;
  image_url: string;
  images?: string[];
  origin: string;
  is_active: boolean;
  display_order: number;
  tags: string[];
  price_low?: number;
  price_high?: number;
  price_tier?: PriceTier;
  catalog_image_path?: string;
  render_image_path?: string;
  description?: string;
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

export type ProductAction = 'replace' | 'keep' | 'add' | 'remove';

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
