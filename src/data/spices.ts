export interface SpiceProduct {
  _id: string;
  name: string;
  slug: string;
  category: "Whole Pods & Seeds" | "Rare Terroirs" | "Single-Origin Peppers" | "Heritage Blends";
  tagline: string;
  description: string;
  price: number; // in paise (e.g. 85000 = ₹850)
  compareAtPrice?: number;
  cost: number;
  reorderLevel: number;
  image: string;
  material: string; // Origin & Grade
  weight: string; // Net quantity, e.g. "100g", "250g", "1 kg"
  stock: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  origin: string;
  elevation: string;
  essentialOil: string;
  aromaProfile: string;
  packaging: string;
}

export const SPICE_CATALOG: SpiceProduct[] = [
  {
    _id: "spice_cardamom_01",
    name: "Idukki Green Cardamom (8mm+ Extra Bold)",
    slug: "idukki-green-cardamom-extra-bold",
    category: "Whole Pods & Seeds",
    tagline: "The Queen of Spices from Kerala's Misty Slopes",
    description:
      "Hand-harvested at peak maturity from shade-grown estates in the Cardamom Hills of Idukki, Kerala. These 8mm+ jumbo pods crack open to reveal glossy, oil-dense jet-black seeds with intense citrus, eucalyptus, and sweet floral camphor notes. Sun-dried in traditional firewood kilns to preserve vibrant natural green chlorophyll.",
    price: 89500, // ₹895 for 100g
    compareAtPrice: 105000,
    cost: 48000,
    reorderLevel: 8,
    image:
      "https://images.unsplash.com/photo-1701190884222-a2139c70ab84?auto=format&fit=crop&w=1200&q=80",
    material: "Idukki, Kerala · Grade AGEB (8mm+)",
    weight: "100g",
    stock: 46,
    rating: 4.95,
    reviewCount: 318,
    featured: true,
    origin: "Idukki District, Kerala",
    elevation: "1,200m above sea level",
    essentialOil: "8.4% Volatile Oil content",
    aromaProfile: "Sweet pine, crushed camphor, vibrant citrus zest",
    packaging: "100g airtight brass-plated freshness tin",
  },
  {
    _id: "spice_saffron_02",
    name: "Kashmiri Mongra Saffron (Grade A++ Superlative)",
    slug: "kashmiri-mongra-saffron",
    category: "Rare Terroirs",
    tagline: "Deep Crimson Stigmas Hand-Plucked in Pampore",
    description:
      "The undisputed crown jewel of the Himalayas. Pure all-red Mongra stigmas without any yellow style attached, grown in the glacial-fed alluvial lacustrine soil of Pampore plateau. Exceeds ISO 3632 Category I standards with crocin color readings exceeding 260. A micro-pinch infuses milk, biryani, or kheer with breathtaking golden honey warmth.",
    price: 185000, // ₹1,850 for 2g
    compareAtPrice: 220000,
    cost: 110000,
    reorderLevel: 5,
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80",
    material: "Pampore, Kashmir · 100% Pure Mongra",
    weight: "2g",
    stock: 19,
    rating: 5.0,
    reviewCount: 412,
    featured: true,
    origin: "Pampore Valley, Kashmir",
    elevation: "1,600m above sea level",
    essentialOil: "Crocin > 260 | Safranal > 45",
    aromaProfile: "Warm hay, floral honey, metallic cedar resonance",
    packaging: "2g sealed glass vial in embossed velvet box",
  },
  {
    _id: "spice_pepper_03",
    name: "Tellicherry Extra Bold Black Peppercorns (TGSEB)",
    slug: "tellicherry-extra-bold-black-pepper",
    category: "Single-Origin Peppers",
    tagline: "Vine-Ripened Black Gold of the Malabar Coast",
    description:
      "The rarest 10% of the Malabar harvest. Tellicherry Garbled Special Extra Bold (TGSEB) peppercorns are left on the vine longer to develop complex sugars and a dense 4.75mm diameter before sun-drying on bamboo mats. Delivers complex cedar, pine, and floral fruit notes before erupting into slow, sustained, aromatic heat.",
    price: 64500, // ₹645 for 200g
    compareAtPrice: 75000,
    cost: 32000,
    reorderLevel: 10,
    image:
      "https://images.unsplash.com/photo-1708106906868-cd7bfc234e2c?auto=format&fit=crop&w=1200&q=80",
    material: "Wayanad, Kerala · TGSEB 4.75mm+",
    weight: "200g",
    stock: 62,
    rating: 4.9,
    reviewCount: 284,
    featured: true,
    origin: "Thalassery & Wayanad, Kerala",
    elevation: "850m above sea level",
    essentialOil: "4.8% Piperine & Essential Oils",
    aromaProfile: "Crushed cedar, citrus oils, slow smoldering warmth",
    packaging: "200g resealable foil-lined kraft canister",
  },
  {
    _id: "spice_turmeric_04",
    name: "Lakadong Heritage Turmeric (9.2% Curcumin)",
    slug: "lakadong-heritage-turmeric",
    category: "Rare Terroirs",
    tagline: "The World's Most Potent Golden Root from Meghalaya",
    description:
      "Grown organically by indigenous Khasi tribal farmers in the Jaintia Hills of Meghalaya. While ordinary store turmeric contains only 2–3% curcumin, our single-estate Lakadong tests at an astounding 9.2% natural curcumin. Slow sun-cured and stone-milled under 35°C to preserve bioactive essential oils.",
    price: 52000, // ₹520 for 250g
    compareAtPrice: 62000,
    cost: 26000,
    reorderLevel: 12,
    image:
      "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1200&q=80",
    material: "Jaintia Hills, Meghalaya · 9.2% Curcumin",
    weight: "250g",
    stock: 58,
    rating: 4.88,
    reviewCount: 196,
    featured: true,
    origin: "Lakadong Village, Meghalaya",
    elevation: "700m above sea level",
    essentialOil: "9.2% Bioactive Curcuminoids",
    aromaProfile: "Earthy ginger, sun-warmed clay, peppery amber",
    packaging: "250g UV-opaque double-sealed pouch",
  },
  {
    _id: "spice_cinnamon_05",
    name: "Ceylon & Kerala Royal Cinnamon Quills",
    slug: "kerala-royal-cinnamon-quills",
    category: "Whole Pods & Seeds",
    tagline: "True Soft-Bark Sweet Cinnamon, Zero Cassia",
    description:
      "Paper-thin, multi-layered sweet cinnamon quills harvested from heirloom Cinnamomum verum trees along Kerala's riverbanks. Unlike coarse, high-coumarin cassia, true cinnamon crumbles easily between your fingers and yields a delicate, perfume-like sweetness without harsh astringency.",
    price: 59000, // ₹590 for 150g
    compareAtPrice: 69000,
    cost: 29000,
    reorderLevel: 6,
    image:
      "https://images.unsplash.com/photo-1622798337764-259682f03741?auto=format&fit=crop&w=1200&q=80",
    material: "Western Ghats, Kerala · C. Verum C5 Special",
    weight: "150g",
    stock: 32,
    rating: 4.85,
    reviewCount: 142,
    featured: false,
    origin: "Kottayam Foothills, Kerala",
    elevation: "450m above sea level",
    essentialOil: "3.2% Cinnamaldehyde (Ultra-low Coumarin)",
    aromaProfile: "Delicate baker's sugar, toasted vanilla, soft wood",
    packaging: "150g hand-bundled quills in linen bag",
  },
  {
    _id: "spice_chilli_06",
    name: "Sun-Cured Guntur Sannam Chillies (S4 Stemless)",
    slug: "guntur-sannam-stemless-chillies",
    category: "Single-Origin Peppers",
    tagline: "Fiery Crimson Pods Sun-Dried on River Silt",
    description:
      "Grown on the rich alluvial Krishna river delta in Andhra Pradesh. Grade S4 stemless whole pods sun-dried on coir mats to develop deep mahogany color, pungent capsaicin, and a smoky fruitiness that provides the signature foundation of authentic South Indian roasts, sambars, and thalis.",
    price: 44000, // ₹440 for 250g
    cost: 21000,
    reorderLevel: 10,
    image:
      "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=1200&q=80",
    material: "Guntur Delta, Andhra Pradesh · Grade S4",
    weight: "250g",
    stock: 45,
    rating: 4.78,
    reviewCount: 175,
    featured: false,
    origin: "Guntur, Andhra Pradesh",
    elevation: "35m above sea level",
    essentialOil: "45,000 – 55,000 SHU Heat Index",
    aromaProfile: "Smoked plum, sun-warmed tobacco, bright searing heat",
    packaging: "250g vacuum-sealed freshness bag",
  },
  {
    _id: "spice_cloves_07",
    name: "Nilgiri Mountain Headed Cloves",
    slug: "nilgiri-mountain-cloves",
    category: "Whole Pods & Seeds",
    tagline: "Fat, Oil-Saturated Flower Buds with Intact Crowns",
    description:
      "High-altitude cloves hand-plucked before blossom opening on the forested lower slopes of the Nilgiris. Squeezing a single bud releases glistening essential eugenol oil. Clean, intact four-pointed star crowns with zero headless stems or wood filler.",
    price: 68000, // ₹680 for 100g
    cost: 34000,
    reorderLevel: 6,
    image:
      "https://images.unsplash.com/photo-1701190884222-a2139c70ab84?auto=format&fit=crop&w=1200&q=80",
    material: "Nilgiri Biosphere, Tamil Nadu · Hand-Selected Buds",
    weight: "100g",
    stock: 24,
    rating: 4.92,
    reviewCount: 110,
    featured: false,
    origin: "Nilgiri Foothills, Tamil Nadu",
    elevation: "900m above sea level",
    essentialOil: "19.5% Natural Eugenol Content",
    aromaProfile: "Numbing medicinal spice, warm amber, winter cider",
    packaging: "100g screw-top matte tin",
  },
  {
    _id: "spice_blend_08",
    name: "Heritage 12-Spice Royal Garam Masala",
    slug: "heritage-royal-garam-masala",
    category: "Heritage Blends",
    tagline: "Stone-Ground Roasted Imperial Recipe",
    description:
      "An aristocratic North Indian formulation combining our green cardamom, black cardamom, star anise, mace blades, stone flower (dagad phool), and Tellicherry pepper. Slow-roasted over neem charcoal and stone-ground to a velvet crumb that perfumes curries upon contact.",
    price: 58000, // ₹580 for 150g
    compareAtPrice: 68000,
    cost: 27000,
    reorderLevel: 8,
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80",
    material: "Hand-Blended · 12 Whole Spices Only",
    weight: "150g",
    stock: 38,
    rating: 4.96,
    reviewCount: 220,
    featured: true,
    origin: "Old Delhi & Lucknow Formulation",
    elevation: "Blended in Micro Batches",
    essentialOil: "Zero salt, starch, or preservative fillers",
    aromaProfile: "Deep toasted mace, smoky black cardamom, sweet warmth",
    packaging: "150g embossed spice canister",
  },
  {
    _id: "spice_chai_09",
    name: "Malabar Monsoon Chai Masala",
    slug: "malabar-monsoon-chai-masala",
    category: "Heritage Blends",
    tagline: "Crushed Green Cardamom, Ginger & Long Pepper",
    description:
      "Crafted specifically for the ultimate cup of chai. Crushed whole green cardamom pods, sun-dried ginger flakes, sweet Ceylon cinnamon, whole cloves, and wild pippali (long pepper). Just a quarter teaspoon turns strong black CTC tea into a fragrant ritual.",
    price: 49000, // ₹490 for 120g
    cost: 23000,
    reorderLevel: 10,
    image:
      "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=1200&q=80",
    material: "Kerala & Assam Spice Formula",
    weight: "120g",
    stock: 50,
    rating: 4.98,
    reviewCount: 389,
    featured: false,
    origin: "Kerala Plantation Recipe",
    elevation: "Single-Estate Sourcing",
    essentialOil: "High volatile oil retainment",
    aromaProfile: "Pungent dried ginger, fragrant green cardamom punch",
    packaging: "120g UV-proof airtight canister",
  },
  {
    _id: "spice_cumin_10",
    name: "Royal Jaisalmer Cumin Seeds (Jeera)",
    slug: "royal-jaisalmer-cumin-seeds",
    category: "Whole Pods & Seeds",
    tagline: "Desert-Bred Aromatic Cumin from Thar",
    description:
      "Grown in the arid, mineral-rich desert soil of Western Rajasthan. The extreme temperature variations between sun-baked days and cold desert nights concentrate high levels of cuminaldehyde, creating an intense, nutty, toasted fragrance upon tadka.",
    price: 38000, // ₹380 for 250g
    cost: 18000,
    reorderLevel: 10,
    image:
      "https://images.unsplash.com/photo-1708106906868-cd7bfc234e2c?auto=format&fit=crop&w=1200&q=80",
    material: "Thar Desert, Rajasthan · Machine Cleaned 99.5%",
    weight: "250g",
    stock: 55,
    rating: 4.8,
    reviewCount: 94,
    featured: false,
    origin: "Jaisalmer, Rajasthan",
    elevation: "220m above sea level",
    essentialOil: "4.2% Natural Cuminaldehyde",
    aromaProfile: "Toasted hazelnut, warm earthy musk, nutty citrus",
    packaging: "250g resealable bag",
  },
];
