
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
