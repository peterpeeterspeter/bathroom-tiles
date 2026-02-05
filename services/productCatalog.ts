
// A lightweight PIM (Product Information Management) for the MVP.
// Focused on premium European brands: Grohe, Hansgrohe, Duravit, Geberit, Villeroy & Boch.

import { RenovationStyle } from "../types";

export interface CatalogProduct {
  id: string;
  brand: string;
  name: string;
  category: 'Faucet' | 'Toilet' | 'Shower' | 'Vanity' | 'Tile' | 'Lighting' | 'Bathtub';
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
    currency: "EUR",
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
    currency: "EUR",
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
    currency: "EUR",
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
    currency: "EUR",
    imageUrl: "https://vola.com/media/2555/111_01_p-m.png",
    styleTags: [RenovationStyle.SCANDINAVIAN, RenovationStyle.MODERN, RenovationStyle.CLASSIC],
    origin: "Denmark"
  },
  {
    id: "DORNBRACHT-TARA",
    brand: "Dornbracht",
    name: "Tara Classic",
    category: "Faucet",
    price: 950,
    currency: "EUR",
    imageUrl: "https://www.dornbracht.com/media/c0/88/47/1660205842/20000710-00_1000.jpg",
    styleTags: [RenovationStyle.CLASSIC, RenovationStyle.LUXURY],
    origin: "Germany"
  },

  // --- TOILETS ---
  {
    id: "DURAVIT-STARCK-3",
    brand: "Duravit",
    name: "ME by Starck Rimless WC",
    category: "Toilet",
    price: 490,
    currency: "EUR",
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
    currency: "EUR",
    imageUrl: "https://catalog.geberit.com/public/images/2021/04/16/82/38/500_822_00_1_Geberit_iCon_Wand-WC_Tiefspueler_Rimfree.jpg",
    styleTags: [RenovationStyle.LUXURY, RenovationStyle.MODERN],
    origin: "Switzerland"
  },
  {
    id: "CATALANO-SPHERA",
    brand: "Catalano",
    name: "Sfera 54 Wall Hung",
    category: "Toilet",
    price: 420,
    currency: "EUR",
    imageUrl: "https://www.catalano.it/wp-content/uploads/2021/03/1VSS54R00.jpg",
    styleTags: [RenovationStyle.INDUSTRIAL, RenovationStyle.MODERN],
    origin: "Italy"
  },

  // --- VANITIES ---
  {
    id: "DURAVIT-L-CUBE",
    brand: "Duravit",
    name: "L-Cube Wall-Mounted Vanity",
    category: "Vanity",
    price: 1200,
    currency: "EUR",
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
    currency: "EUR",
    imageUrl: "https://www.uk.roca.com/wps/wcm/connect/roca_uk/0e69818d-69f8-4b9e-956f-217277e90f23/851075_Inspira_Soft.jpg?MOD=AJPERES&CACHEID=ROOTWORKSPACE-roca_uk-0e69818d-69f8-4b9e-956f-217277e90f23",
    styleTags: [RenovationStyle.CLASSIC, RenovationStyle.SCANDINAVIAN],
    origin: "Spain"
  },
  {
    id: "ANTONIO-LUPI-PIANA",
    brand: "Antonio Lupi",
    name: "Piana Vanity Oak",
    category: "Vanity",
    price: 3500,
    currency: "EUR",
    imageUrl: "https://www.antoniolupi.it/files/antoniolupi/prodotti/piana/antoniolupi_Piana_01.jpg",
    styleTags: [RenovationStyle.LUXURY, RenovationStyle.SCANDINAVIAN],
    origin: "Italy"
  },

  // --- TILES ---
  {
    id: "MARAZZI-LUME",
    brand: "Marazzi",
    name: "Lume Green Porcelain",
    category: "Tile",
    price: 75,
    currency: "EUR",
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
    currency: "EUR",
    imageUrl: "https://www.porcelanosa.com/recursos/productos/100236746_1.jpg",
    styleTags: [RenovationStyle.LUXURY, RenovationStyle.MODERN],
    origin: "Spain"
  },
  {
    id: "MUTINA-TIERRA",
    brand: "Mutina",
    name: "Tierra Terracotta",
    category: "Tile",
    price: 95,
    currency: "EUR",
    imageUrl: "https://www.mutina.it/media/images/collections/tierra/tierra-hero.jpg",
    styleTags: [RenovationStyle.SCANDINAVIAN, RenovationStyle.MODERN],
    origin: "Italy"
  },
  {
    id: "ATLAS-CONCORDE-BOOST",
    brand: "Atlas Concorde",
    name: "Boost Grey Concrete",
    category: "Tile",
    price: 60,
    currency: "EUR",
    imageUrl: "https://www.atlasconcorde.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/a/t/atlas-concorde-boost-grey-120x120-matt-00.jpg",
    styleTags: [RenovationStyle.INDUSTRIAL, RenovationStyle.MODERN],
    origin: "Italy"
  },

  // --- LIGHTING ---
  {
    id: "LOUIS-POULSEN-PH5",
    brand: "Louis Poulsen",
    name: "PH 5 Pendant",
    category: "Lighting",
    price: 950,
    currency: "EUR",
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
    currency: "EUR",
    imageUrl: "https://flos.com/sites/default/files/styles/product_detail/public/F3178057_1.jpg",
    styleTags: [RenovationStyle.MODERN, RenovationStyle.LUXURY],
    origin: "Italy"
  },
  {
    id: "TOM-DIXON-BEAT",
    brand: "Tom Dixon",
    name: "Beat Light Fat Black",
    category: "Lighting",
    price: 550,
    currency: "EUR",
    imageUrl: "https://www.tomdixon.net/media/catalog/product/cache/7e007d4b46c1f01655615d860d5ce39c/b/l/bls02-p01_01.jpg",
    styleTags: [RenovationStyle.INDUSTRIAL],
    origin: "UK"
  },

  // --- BATHTUBS (NEW) ---
  {
    id: "VICTORIA-ALBERT-CHESHIRE",
    brand: "Victoria + Albert",
    name: "Cheshire Freestanding Bath",
    category: "Bathtub",
    price: 2200,
    currency: "EUR",
    imageUrl: "https://vandabaths.com/media/2126/cheshire_main.jpg?anchor=center&mode=crop&width=1200&height=1200",
    styleTags: [RenovationStyle.CLASSIC, RenovationStyle.LUXURY],
    origin: "UK"
  },
  {
    id: "DURAVIT-CAPE-COD",
    brand: "Duravit",
    name: "Cape Cod Freestanding",
    category: "Bathtub",
    price: 3100,
    currency: "EUR",
    imageUrl: "https://img.duravit.com/celum-assets/1600x1600/100000000000000000000000000000000000000000000000000000000000000000000000000000000_1000005165_700330000000090_100.jpg",
    styleTags: [RenovationStyle.MODERN, RenovationStyle.SCANDINAVIAN],
    origin: "Germany"
  },
  {
    id: "BETTE-LUX-OVAL",
    brand: "Bette",
    name: "BetteLux Oval Silhouette",
    category: "Bathtub",
    price: 4500,
    currency: "EUR",
    imageUrl: "https://www.my-bette.com/fileadmin/_processed_/6/f/csm_BetteLux-Oval-Silhouette_Side_8f0a00e576.jpg",
    styleTags: [RenovationStyle.MODERN, RenovationStyle.LUXURY, RenovationStyle.INDUSTRIAL],
    origin: "Germany"
  },
  
  // --- SHOWERS (NEW) ---
  {
    id: "GROHE-EUPHORIA",
    brand: "Grohe",
    name: "Euphoria SmartControl",
    category: "Shower",
    price: 800,
    currency: "EUR",
    imageUrl: "https://assets.grohe.com/3d/26507000/26507000_1_1.png",
    styleTags: [RenovationStyle.MODERN, RenovationStyle.INDUSTRIAL],
    origin: "Germany"
  },
  {
    id: "HANSGROHE-RAINDANCE",
    brand: "Hansgrohe",
    name: "Raindance Select E 300",
    category: "Shower",
    price: 1100,
    currency: "EUR",
    imageUrl: "https://assets.hansgrohe.com/celum/web/27128000_Raindance_Select_E_300_Showerpipe_Chrome_tif.jpg?format=HBW7",
    styleTags: [RenovationStyle.MODERN, RenovationStyle.SCANDINAVIAN],
    origin: "Germany"
  },
  {
    id: "AXOR-SHOWERHEAVEN",
    brand: "AXOR",
    name: "ShowerHeaven 1200",
    category: "Shower",
    price: 5500,
    currency: "EUR",
    imageUrl: "https://assets.hansgrohe.com/celum/web/10637000_AXOR_ShowerHeaven_1200_Chrome_tif.jpg?format=HBW7",
    styleTags: [RenovationStyle.LUXURY],
    origin: "Germany"
  },
  {
    id: "NOBILI-ANTICA",
    brand: "Nobili",
    name: "Antica Shower Column",
    category: "Shower",
    price: 900,
    currency: "EUR",
    imageUrl: "https://www.nobili.it/media/prodotti/AD/AD140/30/AD14030CR_01.jpg",
    styleTags: [RenovationStyle.CLASSIC],
    origin: "Italy"
  }
];
