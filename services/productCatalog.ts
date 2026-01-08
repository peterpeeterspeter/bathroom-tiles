
// A lightweight PIM (Product Information Management) for the MVP.
// Focused on premium European brands: Grohe, Hansgrohe, Duravit, Geberit, Villeroy & Boch.

import { RenovationStyle } from "../types";

export interface CatalogProduct {
  id: string;
  brand: string;
  name: string;
  category: 'Faucet' | 'Toilet' | 'Shower' | 'Vanity' | 'Tile' | 'Lighting';
  price: number;
  currency: string;
  imageUrl: string;
  styleTags: RenovationStyle[];
  origin: string; // e.g., "Germany", "Italy", "Switzerland"
}

export const PRODUCT_CATALOG: CatalogProduct[] = [
  // --- FAUCETS ---
  {
    id: "GROHE-ALLURE-M",
    brand: "Grohe",
    name: "Allure Brilliant Basin Mixer",
    category: "Faucet",
    price: 450,
    currency: "USD",
    imageUrl: "https://assets.grohe.com/3d/23109000/23109000_1_1.png",
    styleTags: [RenovationStyle.MODERN, RenovationStyle.LUXURY],
    origin: "Germany"
  },
  {
    id: "HANSGROHE-METROPOL",
    brand: "Hansgrohe",
    name: "Metropol Select 100",
    category: "Faucet",
    price: 380,
    currency: "USD",
    imageUrl: "https://assets.hansgrohe.com/celum/web/32571000_Metropol_Select_100_Chrome_tif.jpg?format=HBW7",
    styleTags: [RenovationStyle.INDUSTRIAL, RenovationStyle.MODERN],
    origin: "Germany"
  },
  {
    id: "GESSI-316",
    brand: "Gessi",
    name: "Gessi 316 Meccanica",
    category: "Faucet",
    price: 650,
    currency: "USD",
    imageUrl: "https://www.gessi.com/sites/default/files/styles/product_detail/public/2018-03/54002_031_1.png",
    styleTags: [RenovationStyle.INDUSTRIAL, RenovationStyle.LUXURY],
    origin: "Italy"
  },
  {
    id: "VOLA-111",
    brand: "Vola",
    name: "Vola 111 Built-in Mixer",
    category: "Faucet",
    price: 890,
    currency: "USD",
    imageUrl: "https://vola.com/media/2555/111_01_p-m.png",
    styleTags: [RenovationStyle.SCANDINAVIAN, RenovationStyle.MODERN],
    origin: "Denmark"
  },

  // --- TOILETS ---
  {
    id: "DURAVIT-STARCK-3",
    brand: "Duravit",
    name: "ME by Starck Rimless WC",
    category: "Toilet",
    price: 490,
    currency: "USD",
    imageUrl: "https://img.duravit.com/celum-assets/1600x1600/100000100000000000000000000000000000000000000000000000000000000000000000000000000_1000004948_2529090000_300.jpg",
    styleTags: [RenovationStyle.MODERN, RenovationStyle.SCANDINAVIAN, RenovationStyle.CLASSIC],
    origin: "Germany"
  },
  {
    id: "GEBERIT-AQUA-MERA",
    brand: "Geberit",
    name: "AquaClean Mera Comfort",
    category: "Toilet",
    price: 3200,
    currency: "USD",
    imageUrl: "https://catalog.geberit.com/public/images/2021/04/16/82/38/500_822_00_1_Geberit_iCon_Wand-WC_Tiefspueler_Rimfree.jpg",
    styleTags: [RenovationStyle.LUXURY, RenovationStyle.MODERN],
    origin: "Switzerland"
  },

  // --- VANITIES ---
  {
    id: "DURAVIT-L-CUBE",
    brand: "Duravit",
    name: "L-Cube Wall-Mounted Vanity",
    category: "Vanity",
    price: 1200,
    currency: "USD",
    imageUrl: "https://img.duravit.com/celum-assets/1600x1600/100000000000000000000000000000000000000000000000000000000000000000000000000000000_1000004948_LC614001818_100.jpg",
    styleTags: [RenovationStyle.MODERN, RenovationStyle.INDUSTRIAL],
    origin: "Germany"
  },
  {
    id: "ROCA-INSPIRA",
    brand: "Roca",
    name: "Inspira Soft Vanity Unit",
    category: "Vanity",
    price: 850,
    currency: "USD",
    imageUrl: "https://www.uk.roca.com/wps/wcm/connect/roca_uk/0e69818d-69f8-4b9e-956f-217277e90f23/851075_Inspira_Soft.jpg?MOD=AJPERES&CACHEID=ROOTWORKSPACE-roca_uk-0e69818d-69f8-4b9e-956f-217277e90f23",
    styleTags: [RenovationStyle.CLASSIC, RenovationStyle.SCANDINAVIAN],
    origin: "Spain"
  },

  // --- TILES ---
  {
    id: "MARAZZI-LUME",
    brand: "Marazzi",
    name: "Lume Green Porcelain",
    category: "Tile",
    price: 75,
    currency: "USD",
    imageUrl: "https://www.marazzi.it/uploads/media/Lume_Green_6x24_1.jpg",
    styleTags: [RenovationStyle.INDUSTRIAL, RenovationStyle.CLASSIC],
    origin: "Italy"
  },
  {
    id: "PORCELANOSA-CALACATA",
    brand: "Porcelanosa",
    name: "Calacata Gold Silk",
    category: "Tile",
    price: 120,
    currency: "USD",
    imageUrl: "https://www.porcelanosa.com/recursos/productos/100236746_1.jpg",
    styleTags: [RenovationStyle.LUXURY],
    origin: "Spain"
  },
  {
    id: "MUTINA-TIERRA",
    brand: "Mutina",
    name: "Tierra Terracotta",
    category: "Tile",
    price: 95,
    currency: "USD",
    imageUrl: "https://www.mutina.it/media/images/collections/tierra/tierra-hero.jpg",
    styleTags: [RenovationStyle.SCANDINAVIAN, RenovationStyle.MODERN],
    origin: "Italy"
  },

  // --- LIGHTING ---
  {
    id: "LOUIS-POULSEN-PH5",
    brand: "Louis Poulsen",
    name: "PH 5 Pendant",
    category: "Lighting",
    price: 950,
    currency: "USD",
    imageUrl: "https://www.louispoulsen.com/sites/default/files/styles/product_detail/public/2021-04/PH%205%20Monochrome%20White.png",
    styleTags: [RenovationStyle.SCANDINAVIAN, RenovationStyle.CLASSIC],
    origin: "Denmark"
  },
  {
    id: "FLOS-IC-LIGHTS",
    brand: "Flos",
    name: "IC Lights C/W1",
    category: "Lighting",
    price: 480,
    currency: "USD",
    imageUrl: "https://flos.com/sites/default/files/styles/product_detail/public/F3178057_1.jpg",
    styleTags: [RenovationStyle.MODERN, RenovationStyle.LUXURY],
    origin: "Italy"
  }
];
