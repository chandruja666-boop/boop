import { Product, Category, Coupon, WebsiteContent, Customer, Order, InventoryLog, AdminNotification, CustomerReview } from '../types.ts';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-sofas',
    name: 'Sofas & Seating',
    slug: 'sofas',
    description: 'Luxurious 3-seaters, sectional L-shapes, velvet recliners and accent armchairs.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
    subcategories: ['Sofas', 'Sofa Sets', 'Recliners', 'L-Shaped Sofas'],
    isEnabled: true,
    displayOrder: 1,
    featured: true
  },
  {
    id: 'cat-beds',
    name: 'Beds & Bedroom',
    slug: 'beds',
    description: 'Handcrafted solid teak & sheesham beds with hydraulic storage and upholstered headboards.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
    subcategories: ['Beds', 'King Size Beds', 'Queen Size Beds', 'Single Beds'],
    isEnabled: true,
    displayOrder: 2,
    featured: true
  },
  {
    id: 'cat-dining',
    name: 'Dining & Kitchen',
    slug: 'dining',
    description: 'Designer 4-seater and 6-seater solid wood dining tables with cushioned chairs.',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=80',
    subcategories: ['Dining Tables', 'Dining Chairs', 'Dining Sets', 'Benches'],
    isEnabled: true,
    displayOrder: 3,
    featured: true
  },
  {
    id: 'cat-wardrobes',
    name: 'Wardrobes & Storage',
    slug: 'wardrobes',
    description: 'Spacious wardrobes with mirrored panels, silent soft-close hinges, and modular shelving.',
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80',
    subcategories: ['Wardrobes', '2 Door Wardrobes', '3 Door Wardrobes', '4 Door Wardrobes'],
    isEnabled: true,
    displayOrder: 4,
    featured: true
  },
  {
    id: 'cat-living',
    name: 'Living Room Units',
    slug: 'living-units',
    description: 'Minimalist wall-mounted TV entertainment units, coffee tables, and elegant shoe racks.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    subcategories: ['TV Units', 'Coffee Tables', 'Side Tables', 'Shoe Racks', 'Dressing Tables'],
    isEnabled: true,
    displayOrder: 5,
    featured: true
  },
  {
    id: 'cat-office',
    name: 'Office & Study',
    slug: 'office',
    description: 'Ergonomic high-back mesh chairs, solid wood executive desks, and geometric bookshelves.',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=80',
    subcategories: ['Study Tables', 'Office Tables', 'Office Chairs', 'Bookshelves', 'Storage Cabinets'],
    isEnabled: true,
    displayOrder: 6,
    featured: true
  },
  {
    id: 'cat-mattress',
    name: 'Mattresses & Pillows',
    slug: 'mattresses',
    description: 'Orthopedic memory foam, pocket spring, and dual-comfort natural latex mattresses.',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80',
    subcategories: ['Mattresses', 'Pillows', 'Mattress Protectors'],
    isEnabled: true,
    displayOrder: 7,
    featured: true
  },
  {
    id: 'cat-decor',
    name: 'Home Decor & Lighting',
    slug: 'decor',
    description: 'Curated wall art, sculptural table lamps, artisanal rugs, and floor mirrors.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80',
    subcategories: ['Home Decor', 'Floor Lamps', 'Wall Mirrors', 'Rugs'],
    isEnabled: true,
    displayOrder: 8,
    featured: false
  },
  {
    id: 'cat-kids',
    name: 'Kids Furniture',
    slug: 'kids-furniture',
    description: 'Safe, rounded bunk beds, playful study stations, and toy storage units.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
    subcategories: ['Kids Furniture', 'Bunk Beds', 'Kids Study'],
    isEnabled: true,
    displayOrder: 9,
    featured: false
  },
  {
    id: 'cat-outdoor',
    name: 'Outdoor & Balcony',
    slug: 'outdoor',
    description: 'Weatherproof synthetic wicker lounge chairs, coffee sets, and garden swings.',
    image: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1000&q=80',
    subcategories: ['Outdoor Furniture', 'Balcony Sets', 'Garden Swings'],
    isEnabled: true,
    displayOrder: 10,
    featured: false
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Verona Chesterfield 3-Seater Velvet Sofa',
    sku: 'CP-SOF-001',
    brand: 'CP Royal Collection',
    category: 'Sofas & Seating',
    subcategory: 'Sofas',
    price: 48999,
    salePrice: 38999,
    discount: 20,
    stock: 14,
    lowStockLimit: 4,
    rating: 4.8,
    reviewCount: 42,
    isPublished: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isTrending: true,
    colors: [
      { name: 'Royal Emerald Velvet', hex: '#064e3b', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Warm Cognac Leather', hex: '#834015', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Charcoal Midnight', hex: '#262626', image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef2?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['3-Seater', '2-Seater', 'Sectional Set'],
    material: 'Premium Velvet & Kiln-Dried Pine Wood',
    dimensions: { length: 88, width: 36, height: 32, unit: 'inches' },
    weight: 58,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'The Verona Chesterfield combines time-honored European deep tufting with high-resilience 40D foam cushioning. Wrapped in ultra-soft stain-resistant velvet fabric, this sofa delivers peerless comfort and grand aesthetic prestige to luxury living rooms.',
    specifications: {
      'Frame Material': 'Kiln-Dried Treated Pine & Solid Teak',
      'Foam Density': '40D High-Resilience PU Foam',
      'Upholstery': 'Premium Grade Plush Velvet (380 GSM)',
      'Suspension': 'Pocket Spring with Heavy Gauge Webbing',
      'Seating Capacity': '3 Persons Comfortably'
    },
    careInstructions: [
      'Vacuum clean once a week using a soft brush attachment',
      'Blot liquid spills immediately with a dry, clean micro-fiber cloth; do not rub',
      'Avoid prolonged direct exposure to intense sunlight to maintain rich fabric color'
    ],
    warranty: '10-Year Comprehensive Frame & Foam Warranty',
    deliveryEstimate: 'Delivered within 3-5 business days with Free White-Glove Assembly',
    assemblyRequired: true,
    frequentlyBoughtWith: ['prod-8', 'prod-12']
  },
  {
    id: 'prod-2',
    name: 'Aura Solid Teak King Size Bed with Hydraulic Storage',
    sku: 'CP-BED-002',
    brand: 'CP Heritage Woods',
    category: 'Beds & Bedroom',
    subcategory: 'King Size Beds',
    price: 64999,
    salePrice: 49999,
    discount: 23,
    stock: 8,
    lowStockLimit: 3,
    rating: 4.9,
    reviewCount: 68,
    isPublished: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isTrending: true,
    colors: [
      { name: 'Natural Teak Lustre', hex: '#8a5026', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Deep Walnut Satin', hex: '#452b1b', image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef2?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['King Size (78x72 in)', 'Queen Size (78x60 in)'],
    material: '100% Seasoned Solid Teak Wood',
    dimensions: { length: 82, width: 76, height: 48, unit: 'inches' },
    weight: 95,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Crafted from authentic hand-selected seasoned teak, the Aura King Bed features German hydraulic gas lift pistons providing effortless access to massive 800-liter under-bed storage space. The fluted architectural headboard provides sublime ergonomic back support.',
    specifications: {
      'Timber Type': 'Certified Grade-A Teak Wood',
      'Storage Mechanism': 'Twin German Heavy-Duty Gas-Lift Struts (120kg capacity)',
      'Storage Volume': 'Approx 820 Litres',
      'Headboard Style': 'Fluted Solid Wood with Ergonomic Recline Angle',
      'Mattress Size Compatibility': 'Standard King (78 x 72 Inches)'
    },
    careInstructions: [
      'Wipe down with a dry or lightly damp lint-free cloth',
      'Re-apply natural beeswax or wood polish once every 12 months',
      'Keep away from extreme moisture or direct AC blast'
    ],
    warranty: '15-Year Termite, Borer, and Structural Warranty',
    deliveryEstimate: 'Delivered in 4-6 business days with Full Showroom-grade Assembly',
    assemblyRequired: true,
    frequentlyBoughtWith: ['prod-15', 'prod-10']
  },
  {
    id: 'prod-3',
    name: 'Nordic 6-Seater Sheesham Dining Table Set',
    sku: 'CP-DIN-003',
    brand: 'CP Heritage Woods',
    category: 'Dining & Kitchen',
    subcategory: 'Dining Sets',
    price: 52999,
    salePrice: 41999,
    discount: 21,
    stock: 12,
    lowStockLimit: 4,
    rating: 4.7,
    reviewCount: 35,
    isPublished: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isTrending: true,
    colors: [
      { name: 'Honey Sheesham Finish', hex: '#b45309', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Warm Mahogany', hex: '#4a150e', image: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['6-Seater (Table + 6 Chairs)', '6-Seater (Table + 4 Chairs + Bench)'],
    material: 'Authentic Indian Sheesham (Rosewood)',
    dimensions: { length: 66, width: 36, height: 30, unit: 'inches' },
    weight: 82,
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Elevate family gatherings with the Scandinavian-inspired Nordic Dining Set. Featuring a bevelled solid wood table top, organic wood grain patterns, and six ergonomically contoured chairs with spill-proof linen cushions.',
    specifications: {
      'Wood Type': 'Kiln-Dried Indian Sheesham (Dalbergia sissoo)',
      'Chair Cushioning': 'High density foam with Scotchgard treated linen fabric',
      'Table Top Thickness': '38 mm Solid Edge Profile',
      'Seating Height': '18.5 inches from floor'
    },
    careInstructions: [
      'Always use heat mats or coasters under hot plates',
      'Clean spills immediately to avoid moisture marks',
      'Use natural wood conditioner periodically'
    ],
    warranty: '10-Year Warranty on Solid Wood against Warping & Termites',
    deliveryEstimate: 'Delivered in 3-5 days. Delivered and assembled in dining room.',
    assemblyRequired: true,
    frequentlyBoughtWith: ['prod-18']
  },
  {
    id: 'prod-4',
    name: 'Grand Milano 4-Door Wardrobe with Full-Length Mirror',
    sku: 'CP-WAR-004',
    brand: 'CP Modern Living',
    category: 'Wardrobes & Storage',
    subcategory: '4 Door Wardrobes',
    price: 72999,
    salePrice: 56999,
    discount: 22,
    stock: 5,
    lowStockLimit: 3,
    rating: 4.8,
    reviewCount: 29,
    isPublished: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isTrending: false,
    colors: [
      { name: 'Oatmeal & Walnut Dual-Tone', hex: '#78543f', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Matte Frost White & Oak', hex: '#e7e5e4', image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['4-Door (84 x 72 x 22 in)', '3-Door Compact'],
    material: 'E1 Grade High-Density Engineered Wood with Scratch-Resistant Melamine',
    dimensions: { length: 72, width: 22, height: 84, unit: 'inches' },
    weight: 125,
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'A sanctuary for your wardrobe collection. Includes two full-height hanging rails for jackets and long dresses, built-in lockable jewelry drawer, four open shelves, internal LED sensor illumination, and bevelled 5mm distortion-free dressing mirror.',
    specifications: {
      'Hinges': 'Soft-Close German Blum Certified Hinges (100,000 cycles)',
      'Mirrors': '5mm Saint-Gobain Copper-Free Mirror with safety backing',
      'Shelves': 'Adjustable height pin shelves with 25kg load each',
      'Lock': 'Godrej dual-key security drawer lock'
    },
    careInstructions: [
      'Clean mirror with glass cleaner and micro-fiber towel',
      'Wipe exterior panels with microfiber cloth damp with mild detergent'
    ],
    warranty: '7-Year Hardware & Panel Warranty',
    deliveryEstimate: 'Delivered in 4-6 business days with White-Glove installation',
    assemblyRequired: true
  },
  {
    id: 'prod-5',
    name: 'CloudZero Motorized Leatherette Recliner',
    sku: 'CP-REC-005',
    brand: 'CP Royal Collection',
    category: 'Sofas & Seating',
    subcategory: 'Recliners',
    price: 36999,
    salePrice: 27999,
    discount: 24,
    stock: 9,
    lowStockLimit: 3,
    rating: 4.9,
    reviewCount: 51,
    isPublished: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    isTrending: true,
    colors: [
      { name: 'Saddle Tan Leatherette', hex: '#9a5323', image: 'https://images.unsplash.com/photo-1580481077195-c328a37db71a?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Charcoal Carbon', hex: '#1f2937', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['Single Seater Motorized', 'Single Seater Manual Rocker'],
    material: 'Breathable Vegan Leatherette & Heavy Carbon Steel Base',
    dimensions: { length: 38, width: 36, height: 42, unit: 'inches' },
    weight: 46,
    images: [
      'https://images.unsplash.com/photo-1580481077195-c328a37db71a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Experience weightless zero-gravity relaxation. Equipped with an ultra-quiet German electric motor, integrated USB-C fast charging port, 160-degree smooth infinite recline, and lumbar multi-zone comfort support.',
    specifications: {
      'Motor': 'Silent DC 24V linear actuator motor with surge protection',
      'Ports': 'Dual USB-A and USB-C (20W) port on control panel',
      'Weight Capacity': '160 kg certified',
      'Recline Angle': '100Â° upright to 160Â° flat relaxation'
    },
    careInstructions: [
      'Clean with dry cotton cloth',
      'Apply leatherette revitalizing conditioner every 6 months'
    ],
    warranty: '5-Year Frame & 3-Year Motor Warranty',
    deliveryEstimate: 'Free 48-Hour delivery in metro cities',
    assemblyRequired: false,
    frequentlyBoughtWith: ['prod-8']
  },
  {
    id: 'prod-6',
    name: 'Executive Ergonomic Mesh Office Chair with Lumbar Sync',
    sku: 'CP-OFC-006',
    brand: 'CP Workspaces',
    category: 'Office & Study',
    subcategory: 'Office Chairs',
    price: 18999,
    salePrice: 13999,
    discount: 26,
    stock: 24,
    lowStockLimit: 5,
    rating: 4.8,
    reviewCount: 94,
    isPublished: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isTrending: true,
    colors: [
      { name: 'Onyx Black', hex: '#111827', image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Slate Grey & Silver', hex: '#6b7280', image: 'https://images.unsplash.com/photo-1580481077195-c328a37db71a?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['Standard Ergonomic High Back'],
    material: 'Korean Aerodynamic Breathable Mesh & Die-Cast Aluminum Base',
    dimensions: { length: 26, width: 26, height: 48, unit: 'inches' },
    weight: 21,
    images: [
      'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1580481077195-c328a37db71a?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Designed for 12+ hour peak productivity. Features dynamic 3D self-adjusting lumbar support, 4D armrests (height, depth, angle, width), Class-4 certified hydraulic gas lift, and breathable non-sag mesh back.',
    specifications: {
      'Gas Lift': 'BIFMA Class-4 Heavy Duty Certified Cylinder',
      'Mechanism': 'Multi-angle lock synchronized tilting mechanism',
      'Casters': '60mm Smooth-rolling PU scratch-free wheels',
      'Headrest': 'Height and 45-degree angle adjustable'
    },
    careInstructions: [
      'Vacuum mesh gently to remove dust',
      'Wipe aluminum components with soft microfiber cloth'
    ],
    warranty: '5-Year On-Site Manufacturer Warranty',
    deliveryEstimate: 'Fast dispatch within 24 hours. Arrives pre-assembled.',
    assemblyRequired: false,
    frequentlyBoughtWith: ['prod-7']
  },
  {
    id: 'prod-7',
    name: 'Kyoto Solid Wood & Steel Minimalist Study Desk',
    sku: 'CP-STU-007',
    brand: 'CP Workspaces',
    category: 'Office & Study',
    subcategory: 'Study Tables',
    price: 22999,
    salePrice: 17499,
    discount: 24,
    stock: 15,
    lowStockLimit: 4,
    rating: 4.7,
    reviewCount: 38,
    isPublished: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isTrending: false,
    colors: [
      { name: 'Natural Oak & White Frame', hex: '#d97706', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Walnut & Matte Black Steel', hex: '#451a03', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['48 x 24 in', '60 x 30 in (Large)'],
    material: 'Natural Solid Oak Top with Powder-Coated Steel Trestle Legs',
    dimensions: { length: 54, width: 24, height: 30, unit: 'inches' },
    weight: 34,
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Clean architectural lines meet rugged durability. Features an integrated cable management wire channel underneath, dual soft-close drawers with stationery organizer, and scratch-resistant matte clear coat.',
    specifications: {
      'Load Capacity': '120 kg evenly distributed',
      'Drawer': 'Dual concealed soft-closing ball-bearing sliders',
      'Cable Tray': 'Pre-installed rear steel drop tray for multi-monitors'
    },
    careInstructions: ['Wipe clean with a damp cloth', 'Do not place wet mugs directly without a coaster'],
    warranty: '7-Year Warranty on Structure',
    deliveryEstimate: 'Delivered in 2-4 days. Free assembly provided.',
    assemblyRequired: true,
    frequentlyBoughtWith: ['prod-6']
  },
  {
    id: 'prod-8',
    name: 'Solstice Fluted Oak Round Coffee Table',
    sku: 'CP-COF-008',
    brand: 'CP Modern Living',
    category: 'Living Room Units',
    subcategory: 'Coffee Tables',
    price: 16999,
    salePrice: 12999,
    discount: 24,
    stock: 19,
    lowStockLimit: 5,
    rating: 4.8,
    reviewCount: 45,
    isPublished: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isTrending: true,
    colors: [
      { name: 'Bleached Scandinavian Oak', hex: '#e2d4c0', image: 'https://images.unsplash.com/photo-1533779283484-84e1b73487c6?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Dark Smoked Walnut', hex: '#3e2723', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['Diameter 34 in (Large)', 'Diameter 24 in (Side)'],
    material: 'Solid Oak Wood Tambour Slats with Engineered Core',
    dimensions: { length: 34, width: 34, height: 16, unit: 'inches' },
    weight: 22,
    images: [
      'https://images.unsplash.com/photo-1533779283484-84e1b73487c6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'The centerpiece of contemporary living spaces. Fluted tamboured wooden pedestal with a generous circular top treated with waterproof matte polyurethane seal.',
    specifications: {
      'Shape': 'Circular with Tambour Ribbed Pedestal',
      'Top Treatment': 'Water-repellent anti-yellowing polyurethane finish',
      'Base Weight': 'Weighted solid base to prevent tipping'
    },
    careInstructions: ['Dust with soft feather duster', 'Wipe spills immediately'],
    warranty: '5-Year Structural Warranty',
    deliveryEstimate: 'Delivered in 3 days. No assembly required.',
    assemblyRequired: false,
    frequentlyBoughtWith: ['prod-1', 'prod-12']
  },
  {
    id: 'prod-9',
    name: 'Zenith Floating Wall-Mounted TV Entertainment Unit',
    sku: 'CP-ENT-009',
    brand: 'CP Modern Living',
    category: 'Living Room Units',
    subcategory: 'TV Units',
    price: 24999,
    salePrice: 18999,
    discount: 24,
    stock: 11,
    lowStockLimit: 3,
    rating: 4.6,
    reviewCount: 31,
    isPublished: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isTrending: true,
    colors: [
      { name: 'Walnut & Charcoal Slat', hex: '#5c4033', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Nordic Maple & White', hex: '#c8b195', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['Fits up to 65 inch TV (70 in wide)', 'Fits up to 75 inch TV (82 in wide)'],
    material: 'High-Moisture Resistance (HMR) Board with Teak Veneer',
    dimensions: { length: 72, width: 14, height: 12, unit: 'inches' },
    weight: 29,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Create a theatre vibe in your living room with this floating TV console. Includes acoustic-transparent slatted drop-down doors for soundbars and set-top boxes, plus ambient LED back-glow preparation.',
    specifications: {
      'Mounting': 'Heavy-duty steel cleat wall mount system (supports 75kg)',
      'Storage': '3 drop-down damper doors with wire grommets',
      'Finish': 'Natural wood grain texture touch'
    },
    careInstructions: ['Dry dust regularly', 'Do not place wet objects directly on veneer'],
    warranty: '5-Year Warranty on Wall Cleat and HMR panels',
    deliveryEstimate: '3-5 days with Free Professional Wall Installation',
    assemblyRequired: true
  },
  {
    id: 'prod-10',
    name: 'Celeste 3-Door Solid Wood Wardrobe with Internal Safe',
    sku: 'CP-WAR-010',
    brand: 'CP Heritage Woods',
    category: 'Wardrobes & Storage',
    subcategory: '3 Door Wardrobes',
    price: 58999,
    salePrice: 44999,
    discount: 24,
    stock: 7,
    lowStockLimit: 2,
    rating: 4.9,
    reviewCount: 22,
    isPublished: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isTrending: false,
    colors: [
      { name: 'Colonial Teak Stain', hex: '#7c4722', image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['3-Door Standard (60 x 22 x 80 in)'],
    material: 'Seasoned Sheesham & Marine-Ply Backing',
    dimensions: { length: 60, width: 22, height: 80, unit: 'inches' },
    weight: 104,
    images: [
      'https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Timeless craftsmanship featuring hand-planed Sheesham panels, brass antique pull handles, and an integrated hidden security locker for valuables.',
    specifications: {
      'Wood': '100% Seasoned Sheesham',
      'Handles': 'Solid Antique Cast Brass Hardware',
      'Safe': 'Concealed steel-reinforced security locker with twin keys'
    },
    careInstructions: ['Polish with natural wax once a year', 'Dust with dry cotton rag'],
    warranty: '10-Year Warranty against Wood Rot & Pests',
    deliveryEstimate: '5-7 business days with assembly',
    assemblyRequired: true,
    frequentlyBoughtWith: ['prod-2']
  },
  {
    id: 'prod-11',
    name: 'Symphony 7-Zone Orthopedic Memory Foam Mattress',
    sku: 'CP-MAT-011',
    brand: 'CP Sleep Lab',
    category: 'Mattresses & Pillows',
    subcategory: 'Mattresses',
    price: 32999,
    salePrice: 24999,
    discount: 24,
    stock: 22,
    lowStockLimit: 6,
    rating: 4.9,
    reviewCount: 112,
    isPublished: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isTrending: true,
    colors: [
      { name: 'Organic Bamboo Knit White', hex: '#fafaf9', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['King (78x72 in, 8 inch)', 'Queen (78x60 in, 8 inch)', 'Single (78x36 in, 8 inch)'],
    material: 'Natural Latex, 7-Zone Cool Gel Memory Foam & High Resilience Base',
    dimensions: { length: 78, width: 72, height: 8, unit: 'inches' },
    weight: 38,
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Engineered in collaboration with spine specialists. 7 targeted orthopedic pressure-relief zones align your spine while cooling gel micro-beads draw excess heat away for deep restorative sleep. Backed by 100-night risk-free home sleep trial!',
    specifications: {
      'Core': 'High Density Orthopedic Transition Foam',
      'Comfort Layer': 'Cooling infused memory foam (NASA certified)',
      'Cover': 'Removable, washable OEKO-TEX certified antibacterial bamboo zipper cover',
      'Trial': '100-Nights Free Trial with 100% money-back guarantee'
    },
    careInstructions: ['Rotate mattress head-to-toe every 3 months', 'Unzip and wash bamboo cover in gentle cycle'],
    warranty: '10-Year Hassle-Free Replacement Guarantee',
    deliveryEstimate: 'Bed-in-a-box compressed delivery in 48 hours',
    assemblyRequired: false,
    frequentlyBoughtWith: ['prod-2', 'prod-15']
  },
  {
    id: 'prod-12',
    name: 'Modernist Geometric Oak Bookshelf & Display Rack',
    sku: 'CP-BOK-012',
    brand: 'CP Modern Living',
    category: 'Office & Study',
    subcategory: 'Bookshelves',
    price: 19999,
    salePrice: 15499,
    discount: 23,
    stock: 10,
    lowStockLimit: 3,
    rating: 4.8,
    reviewCount: 27,
    isPublished: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isTrending: false,
    colors: [
      { name: 'Natural Oak Wood', hex: '#ca8a04', image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Ebony Walnut', hex: '#1c1917', image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef2?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['6-Tier Tall (72 x 36 x 14 in)', '4-Tier Medium'],
    material: 'Solid Wood Frame with Heavy-Duty Shelving',
    dimensions: { length: 36, width: 14, height: 72, unit: 'inches' },
    weight: 41,
    images: [
      'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'An open-shelving masterpiece designed to exhibit your art, artifacts, and reading collection. Asymmetrical cantilever compartments offer dynamic styling while maintaining rock-solid balance.',
    specifications: {
      'Shelf Capacity': '30 kg per shelf',
      'Safety': 'Includes concealed anti-tip wall anchor hardware kit',
      'Finish': 'Silky matte lacquer'
    },
    careInstructions: ['Wipe clean with a microfiber cloth'],
    warranty: '5-Year Structural Warranty',
    deliveryEstimate: '3-4 business days with free setup',
    assemblyRequired: true,
    frequentlyBoughtWith: ['prod-7']
  },
  {
    id: 'prod-13',
    name: 'Belgravia Wingback Accent Chair in Terracotta',
    sku: 'CP-ACC-013',
    brand: 'CP Royal Collection',
    category: 'Sofas & Seating',
    subcategory: 'Sofas',
    price: 26999,
    salePrice: 19999,
    discount: 26,
    stock: 13,
    lowStockLimit: 4,
    rating: 4.8,
    reviewCount: 39,
    isPublished: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isTrending: true,
    colors: [
      { name: 'Warm Terracotta Velvet', hex: '#c2410c', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Mustard Ochre', hex: '#eab308', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['Single Armchair with Brass Legs'],
    material: 'Rich Textured Boucle Fabric & Brass Tipped Legs',
    dimensions: { length: 32, width: 34, height: 40, unit: 'inches' },
    weight: 23,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Transform any quiet corner into a reading haven. Inspired by classic mid-century British club chairs, featuring hand-carved sweeping wingbacks and tapered solid brass legs.',
    specifications: {
      'Fabric': 'High Martindale count heavy-wear textured boucle',
      'Legs': 'Solid beachwood with polished brass boots',
      'Cushion': 'Reversible pocket-spring high-comfort core'
    },
    careInstructions: ['Dry clean only for stubborn spots', 'Gently vacuum weekly'],
    warranty: '5-Year Frame Warranty',
    deliveryEstimate: 'Free doorstep delivery in 3 days',
    assemblyRequired: false,
    frequentlyBoughtWith: ['prod-8']
  },
  {
    id: 'prod-14',
    name: 'Arezzo 2-Door Shoe Rack with Louvered Ventilation Doors',
    sku: 'CP-SHU-014',
    brand: 'CP Modern Living',
    category: 'Living Room Units',
    subcategory: 'Shoe Racks',
    price: 13999,
    salePrice: 9999,
    discount: 29,
    stock: 16,
    lowStockLimit: 4,
    rating: 4.7,
    reviewCount: 52,
    isPublished: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isTrending: false,
    colors: [
      { name: 'Rustic Teak & Off-White', hex: '#92400e', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['Holds 18 Pairs (36 x 14 x 42 in)', 'Holds 24 Pairs (48 in wide)'],
    material: 'Engineered Wood with Real Teak Louvers',
    dimensions: { length: 36, width: 14, height: 42, unit: 'inches' },
    weight: 28,
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Keep your foyer pristine and odor-free. Slatted louvered door design allows fresh air circulation, while the top cushioned drawer holds keys, wallets, and shoe polishes.',
    specifications: {
      'Capacity': '18 to 22 pairs including boots',
      'Ventilation': 'Active aeration angled louvers',
      'Top Surface': 'Waterproof laminate for placing planters and keys'
    },
    careInstructions: ['Wipe clean with moist cloth'],
    warranty: '3-Year Warranty',
    deliveryEstimate: 'Fast delivery in 2-3 business days',
    assemblyRequired: true
  },
  {
    id: 'prod-15',
    name: 'Serena Memory Foam Orthopedic Bed Pillow (Set of 2)',
    sku: 'CP-PIL-015',
    brand: 'CP Sleep Lab',
    category: 'Mattresses & Pillows',
    subcategory: 'Pillows',
    price: 4999,
    salePrice: 2999,
    discount: 40,
    stock: 35,
    lowStockLimit: 8,
    rating: 4.9,
    reviewCount: 140,
    isPublished: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isTrending: false,
    colors: [
      { name: 'Crisp White Jacquard', hex: '#ffffff', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['Standard King (27 x 17 in)'],
    material: 'Contour Gel-Infused Slow Rebound Memory Foam',
    dimensions: { length: 27, width: 17, height: 5, unit: 'inches' },
    weight: 3.2,
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Relieve morning neck stiffness. Curved ergonomic cervical contour supports both back and side sleepers, with a breathable cooling aloe-vera infused cover.',
    specifications: {
      'Foam': '100% Pure Virgin Temperature-Insensitive Memory Foam',
      'Cover': 'Hypoallergenic removable micro-mesh zip cover'
    },
    careInstructions: ['Cover is machine washable at 30Â°C', 'Do not wash foam core'],
    warranty: '3-Year Warranty against Sagging',
    deliveryEstimate: 'Ships within 24 hours',
    assemblyRequired: false,
    frequentlyBoughtWith: ['prod-11']
  },
  {
    id: 'prod-16',
    name: 'Oasis All-Weather Wicker Balcony Set (2 Chairs + Table)',
    sku: 'CP-OUT-016',
    brand: 'CP Outdoors',
    category: 'Outdoor & Balcony',
    subcategory: 'Outdoor Furniture',
    price: 28999,
    salePrice: 21999,
    discount: 24,
    stock: 8,
    lowStockLimit: 3,
    rating: 4.8,
    reviewCount: 33,
    isPublished: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isTrending: false,
    colors: [
      { name: 'Espresso Wicker & Ivory Cushions', hex: '#3e2723', image: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['Bistro Set (2 Chairs + 1 Tempered Glass Table)'],
    material: 'High-Density UV-Resistant PE Rattan & Powder Coated Aluminum',
    dimensions: { length: 26, width: 26, height: 32, unit: 'inches' },
    weight: 24,
    images: [
      'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Built to withstand monsoons and intense sun alike. Hand-woven synthetic rattan wrapped over rust-proof aircraft-grade aluminum with quick-dry foam cushions and 8mm tempered glass tabletop.',
    specifications: {
      'Weatherproofing': 'IP65 All-Weather UV 50+ proof',
      'Table Top': '8mm Toughened Bevelled Glass',
      'Fabric': 'Solution-dyed water-repellent olefin'
    },
    careInstructions: ['Hose down with water to clean dust'],
    warranty: '5-Year Anti-Fade & Frame Rust Warranty',
    deliveryEstimate: 'Delivered in 3-4 days',
    assemblyRequired: false
  },
  {
    id: 'prod-17',
    name: 'Lumina Arc Brass Floor Lamp with Marble Base',
    sku: 'CP-DEC-017',
    brand: 'CP Modern Living',
    category: 'Home Decor & Lighting',
    subcategory: 'Home Decor',
    price: 14999,
    salePrice: 10999,
    discount: 27,
    stock: 18,
    lowStockLimit: 4,
    rating: 4.9,
    reviewCount: 46,
    isPublished: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isTrending: true,
    colors: [
      { name: 'Brushed Satin Brass', hex: '#d4af37', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Matte Industrial Black', hex: '#1c1917', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['Overhead Arc (Height 76 in, Reach 44 in)'],
    material: 'Natural Italian Carrara Marble Base with Spun Brass Shade',
    dimensions: { length: 44, width: 16, height: 76, unit: 'inches' },
    weight: 18,
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'A striking statement piece that elegantly arcs over your sectional sofa or reading armchair. Anchored by an authentic 12kg solid marble block base with foot-step dimmer switch.',
    specifications: {
      'Base': 'Authentic Heavy Natural Marble slab',
      'Socket': 'Standard E27 with complimentary 2700K warm LED bulb included',
      'Switch': 'Stepless rotary floor dimmer'
    },
    careInstructions: ['Dust shade with dry cloth', 'Polish marble base with stone cleaner'],
    warranty: '3-Year Electrical and Finish Warranty',
    deliveryEstimate: 'Ships safely packaged in 2 business days',
    assemblyRequired: true,
    frequentlyBoughtWith: ['prod-1', 'prod-5']
  },
  {
    id: 'prod-18',
    name: 'Venezia Hollywood Dressing Table with Illuminated LED Mirror',
    sku: 'CP-DRS-018',
    brand: 'CP Modern Living',
    category: 'Living Room Units',
    subcategory: 'Dressing Tables',
    price: 29999,
    salePrice: 22999,
    discount: 23,
    stock: 9,
    lowStockLimit: 3,
    rating: 4.8,
    reviewCount: 38,
    isPublished: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isTrending: true,
    colors: [
      { name: 'Warm Cream & Fluted Gold', hex: '#fef3c7', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Walnut & Brass Trim', hex: '#78350f', image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=1000&q=80' }
    ],
    sizes: ['40 x 18 x 56 in with Matching Velvet Stool'],
    material: 'High-Gloss Acrylic Finish & Toughened Glass Top',
    dimensions: { length: 40, width: 18, height: 56, unit: 'inches' },
    weight: 39,
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Start every morning with salon-grade luxury. Includes smart 3-color LED touch mirror (Warm, Natural, Cool Daylight), velvet-lined compartmentalized drawers for jewelry and makeup, and plush cushioned stool.',
    specifications: {
      'Mirror': 'Smart Touch Sensor with 3 lighting modes & brightness dimmer',
      'Drawers': '4 soft-close velvet organizers',
      'Stool': 'Included ergonomically matched matching vanity stool'
    },
    careInstructions: ['Clean glass top with streak-free glass spray'],
    warranty: '5-Year Warranty on structure & mirror electronics',
    deliveryEstimate: 'Delivered in 4 days with free room setup',
    assemblyRequired: true,
    frequentlyBoughtWith: ['prod-2']
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'VINAYAGAR15',
    title: 'Vinayagar Chathurthi Auspicious Special',
    description: 'Special 15% festive discount on all Solid Wood, Living Suites & Dining collections',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 20000,
    maxDiscount: 10000,
    expiryDate: '2026-09-30',
    usageLimit: 1000,
    usedCount: 18,
    isEnabled: true
  },
  {
    code: 'WELCOME25',
    title: 'VIP Newsletter Welcome Privilege',
    description: 'Flat ₹2,500 off for CP Connoisseurs Club subscribers on orders above ₹30,000',
    discountType: 'fixed',
    discountValue: 2500,
    minOrderValue: 30000,
    expiryDate: '2026-12-31',
    usageLimit: 5000,
    usedCount: 23,
    isEnabled: true
  },
  {
    code: 'WELCOME10',
    title: 'First Order Special',
    description: 'Get flat 10% off on your first order with CP Furniture (up to â‚¹5,000 off)',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 15000,
    maxDiscount: 5000,
    expiryDate: '2026-12-31',
    usageLimit: 1000,
    usedCount: 142,
    isEnabled: true
  },
  {
    code: 'FESTIVE25',
    title: 'Showroom Festive Grand Sale',
    description: 'Save 25% instant discount on orders above â‚¹40,000 across all collections',
    discountType: 'percentage',
    discountValue: 25,
    minOrderValue: 40000,
    maxDiscount: 15000,
    expiryDate: '2026-11-30',
    usageLimit: 500,
    usedCount: 88,
    isEnabled: true
  },
  {
    code: 'CPFLAT3000',
    title: 'Living Room Upgrade',
    description: 'Flat â‚¹3,000 off on Sofas, Recliners, and Dining Sets',
    discountType: 'fixed',
    discountValue: 3000,
    minOrderValue: 25000,
    expiryDate: '2026-10-31',
    usageLimit: 300,
    usedCount: 64,
    isEnabled: true
  },
  {
    code: 'FREESHIP',
    title: 'Zero Delivery Fee',
    description: 'Enjoy free white-glove delivery on all items with no minimum purchase',
    discountType: 'fixed',
    discountValue: 999,
    minOrderValue: 5000,
    expiryDate: '2026-12-31',
    usageLimit: 2000,
    usedCount: 412,
    isEnabled: true
  }
];

export const INITIAL_WEBSITE_CONTENT: WebsiteContent = {
  announcement: '🪔 VINAYAGAR CHATHURTHI SPECIAL: Additional 15% Off on All Solid Wood & Luxury Seating! Code: VINAYAGAR15 • Free White-Glove Installation',
  announcementEnabled: true,
  festiveBanner: {
    enabled: true,
    badge: '🕉️ AUSPICIOUS BLESSINGS • VINAYAGAR CHATHURTHI SPECIAL',
    title: 'Divine Beginnings for Your Luxury Home',
    subtitle: 'Celebrate the auspicious occasion of Vinayagar Chathurthi with handcrafted solid teakwood suites, sculpted dining sets, and bespoke Italian velvet seating at exclusive festive privileges.',
    code: 'VINAYAGAR15',
    discountText: 'EXTRA 15% FESTIVE OFF',
    expiryText: 'Limited Festive Offer • Valid Across Showrooms & Online',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=85',
    ctaText: 'Explore Festive Collection',
    ctaLink: 'shop',
    secondaryCtaText: 'Visit Experience Centers',
    secondaryCtaLink: 'showrooms'
  },
  heroSlides: [
    {
      id: 'slide-1',
      title: 'Auspicious Craftsmanship for Vinayagar Chathurthi',
      subtitle: 'Invoke prosperity with handcrafted 100% Solid Teakwood suites & Italian luxury seating.',
      tagline: 'VINAYAGAR CHATHURTHI SPECIAL • EXTRA 15% OFF (CODE: VINAYAGAR15)',
      ctaText: 'Shop Festive Offers',
      ctaLink: 'offers',
      secondaryCtaText: 'Visit Showrooms',
      secondaryCtaLink: 'showrooms',
      badge: '🕉️ Festive Auspicious Privilege',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=85'
    },
    {
      id: 'slide-2',
      title: 'Architectural Elegance for Modern Living',
      subtitle: 'Handcrafted Solid Wood & Luxury Italian Upholstery',
      tagline: 'THE NEW 2026 SHOWROOM COLLECTION',
      ctaText: 'Explore Living Room',
      ctaLink: 'sofas',
      secondaryCtaText: 'Visit Showrooms',
      secondaryCtaLink: 'showrooms',
      badge: 'Certified Solid Teakwood',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=85'
    },
    {
      id: 'slide-3',
      title: 'Master Bedrooms Reimagined',
      subtitle: 'Effortless hydraulic storage beds and heirloom Sheesham woods.',
      tagline: 'BEDROOM SUITES',
      ctaText: 'Shop Beds & Suites',
      ctaLink: 'beds',
      secondaryCtaText: 'Browse Mattresses',
      secondaryCtaLink: 'mattresses',
      badge: '15-Year Warranty',
      image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef2?auto=format&fit=crop&w=1920&q=85'
    }
  ],
  promoBanners: [
    {
      id: 'promo-1',
      title: 'Living Room Suite Combo',
      subtitle: 'Get 3-Seater Velvet Sofa + Fluted Round Coffee Table',
      discount: 'SAVE â‚¹14,999',
      code: 'COMBO-LIVING',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      bgGradient: 'from-amber-950/90 to-stone-900/90',
      linkCategory: 'sofas'
    },
    {
      id: 'promo-2',
      title: 'Sleep Sanctuary Bundle',
      subtitle: 'Aura Teak King Bed + Symphony 7-Zone Mattress + 2 Memory Pillows',
      discount: 'UP TO 35% OFF',
      code: 'COMBO-SLEEP',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
      bgGradient: 'from-stone-900/90 to-amber-900/90',
      linkCategory: 'beds'
    }
  ],
  showrooms: [
    {
      id: 'sr-1',
      city: 'Bangalore Flagship',
      name: 'CP Furniture Experience Center - Indiranagar',
      address: 'Plot 482, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
      phone: '+91 80 4912 8800',
      timing: '10:00 AM - 9:00 PM (All 7 Days)',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'sr-2',
      city: 'Mumbai',
      name: 'CP Furniture Showroom - Lower Parel',
      address: 'Unit 4B, Grand Gallerie, Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013',
      phone: '+91 22 6128 4400',
      timing: '10:30 AM - 9:30 PM (All 7 Days)',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'sr-3',
      city: 'Delhi NCR',
      name: 'CP Furniture Studio - MG Road',
      address: 'Sultanpur Estate, Mehrauli-Gurgaon Rd, Sultanpur, New Delhi, Delhi 110030',
      phone: '+91 11 4055 9900',
      timing: '10:00 AM - 8:30 PM (All 7 Days)',
      image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80'
    }
  ],
  aboutUsText: 'Founded in 2012, CP Furniture has set the benchmark for luxury handcrafted residential and commercial furniture. We bridge traditional craftsmanship with modern ergonomic sensibilities, sourcing only ethically harvested solid teak, sheesham, and premium textiles. With over 250,000 homes furnished across the country, we are proud to offer a direct-from-artisan experience with zero middlemen.',
  contactEmail: 'concierge@cpfurniture.com',
  contactPhone: '+91 1800 200 4848 (Toll Free)',
  showroomHours: 'Mon - Sun: 10:00 AM - 9:00 PM',
  headquartersAddress: 'CP Furniture Design Tower, 12th Avenue, Bengaluru, India'
};

export const INITIAL_CUSTOMER: Customer = {
  id: 'cust-demo-1',
  name: 'Rohan Sharma',
  email: 'rohan.sharma@example.com',
  phone: '9876543210',
  password: 'password123',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  addresses: [
    {
      id: 'addr-1',
      type: 'Home',
      name: 'Rohan Sharma',
      phone: '9876543210',
      street: 'Flat 402, Prestige Hermitage, 12 Kensington Road',
      landmark: 'Near Ulsoor Lake',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560042',
      isDefault: true
    },
    {
      id: 'addr-2',
      type: 'Office',
      name: 'Rohan Sharma (CP Tech)',
      phone: '9876543210',
      street: 'Level 7, Cyber Tech Park, Outer Ring Road',
      landmark: 'Opposite Marathahalli Bridge',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      isDefault: false
    }
  ],
  wishlist: ['prod-1', 'prod-8', 'prod-17'],
  cart: [
    {
      id: 'cart-init-1',
      productId: 'prod-8',
      quantity: 1,
      selectedColor: 'Bleached Scandinavian Oak',
      selectedSize: 'Diameter 34 in (Large)'
    }
  ],
  savedForLater: [],
  notifications: [
    {
      id: 'notif-1',
      title: 'Order Shipped!',
      message: 'Your order #CPF-89210 has been dispatched from our Bengaluru warehouse.',
      date: '2026-09-11 14:30',
      type: 'order',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Exclusive Weekend Perk',
      message: 'Use code FESTIVE25 for an extra 25% off during the grand showroom showcase.',
      date: '2026-09-12 09:00',
      type: 'offer',
      read: true
    }
  ],
  reviews: [
    {
      id: 'rev-1',
      productId: 'prod-1',
      productName: 'Verona Chesterfield 3-Seater Velvet Sofa',
      productImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
      rating: 5,
      headline: 'Exceeded every expectation in our formal drawing room!',
      comment: 'The emerald green velvet is so rich and deep. Delivery team arrived on time, wore shoe covers, and assembled it within 20 minutes.',
      date: '2026-08-20',
      verified: true
    }
  ],
  recentlyViewed: ['prod-1', 'prod-2', 'prod-3', 'prod-8'],
  isBlocked: false,
  createdAt: '2025-11-14',
  totalSpent: 88998
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-89210',
    orderNumber: 'CPF-89210',
    date: '2026-09-11 10:15 AM',
    orderDate: '2026-09-11 10:15 AM',
    estimatedDelivery: 'Today by 05:00 PM',
    customerId: 'cust-demo-1',
    customerName: 'Rohan Sharma',
    customerEmail: 'rohan.sharma@example.com',
    customerPhone: '9876543210',
    items: [
      {
        productId: 'prod-1',
        name: 'Verona Chesterfield 3-Seater Velvet Sofa',
        productName: 'Verona Chesterfield 3-Seater Velvet Sofa',
        sku: 'CP-SOF-001',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
        productImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
        price: 38999,
        quantity: 1,
        color: 'Royal Emerald Velvet',
        selectedColor: 'Royal Emerald Velvet',
        size: '3-Seater',
        selectedSize: '3-Seater',
        subtotal: 38999
      },
      {
        productId: 'prod-17',
        name: 'Lumina Arc Brass Floor Lamp with Marble Base',
        productName: 'Lumina Arc Brass Floor Lamp with Marble Base',
        sku: 'CP-DEC-017',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80',
        productImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80',
        price: 10999,
        quantity: 1,
        color: 'Brushed Satin Brass',
        selectedColor: 'Brushed Satin Brass',
        size: 'Overhead Arc',
        selectedSize: 'Overhead Arc',
        subtotal: 10999
      }
    ],
    shippingAddress: {
      id: 'addr-1',
      type: 'Home',
      name: 'Rohan Sharma',
      phone: '9876543210',
      street: 'Flat 402, Prestige Hermitage, 12 Kensington Road',
      landmark: 'Near Ulsoor Lake',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560042',
      isDefault: true
    },
    deliveryMethod: 'White-Glove Showroom Assembly (Free)',
    deliveryCharge: 0,
    subtotal: 49998,
    discount: 5000,
    couponCode: 'WELCOME10',
    tax: 8099, // 18% on discounted base
    grandTotal: 53097,
    total: 53097,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    trackingSteps: [
      {
        status: 'Order Placed',
        title: 'Order Verified & Received',
        date: '11 Sep 2026, 10:15 AM',
        description: 'Payment authenticated via UPI. Order entered production queue.',
        completed: true
      },
      {
        status: 'Confirmed',
        title: 'Quality Inspection Approved',
        date: '11 Sep 2026, 01:30 PM',
        description: 'Solid wood frame and velvet fabric tested for QC compliance.',
        completed: true
      },
      {
        status: 'Packed',
        title: 'Safely Crated & Packed',
        date: '12 Sep 2026, 11:00 AM',
        description: 'Wrapped in multi-layer shockproof foam and corner wood braces.',
        completed: true
      },
      {
        status: 'Shipped',
        title: 'Dispatched via CP Dedicated Fleet',
        date: '13 Sep 2026, 08:30 AM',
        description: 'Van KA-01-MJ-8822 departed Bengaluru Hub. Tracking active.',
        completed: true
      },
      {
        status: 'Out for Delivery',
        title: 'Out for Delivery & Installation',
        date: 'Expected Today by 05:00 PM',
        description: 'CP technician accompanied with delivery vehicle.',
        completed: false
      },
      {
        status: 'Delivered',
        title: 'Delivered & Installed',
        date: 'Pending',
        description: 'Digital signature and warranty activation on delivery.',
        completed: false
      }
    ]
  },
  {
    id: 'ord-87450',
    orderNumber: 'CPF-87450',
    date: '2026-08-15 03:45 PM',
    orderDate: '2026-08-15 03:45 PM',
    estimatedDelivery: 'Delivered on 18 Aug 2026',
    customerId: 'cust-demo-1',
    customerName: 'Rohan Sharma',
    customerEmail: 'rohan.sharma@example.com',
    customerPhone: '9876543210',
    items: [
      {
        productId: 'prod-15',
        name: 'Serena Memory Foam Orthopedic Bed Pillow (Set of 2)',
        productName: 'Serena Memory Foam Orthopedic Bed Pillow (Set of 2)',
        sku: 'CP-PIL-015',
        image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=400&q=80',
        productImage: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=400&q=80',
        price: 2999,
        quantity: 1,
        color: 'Crisp White Jacquard',
        selectedColor: 'Crisp White Jacquard',
        size: 'Standard King',
        selectedSize: 'Standard King',
        subtotal: 2999
      }
    ],
    shippingAddress: {
      id: 'addr-1',
      type: 'Home',
      name: 'Rohan Sharma',
      phone: '9876543210',
      street: 'Flat 402, Prestige Hermitage, 12 Kensington Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560042',
      isDefault: true
    },
    deliveryMethod: 'Express Courier',
    deliveryCharge: 0,
    subtotal: 2999,
    discount: 0,
    tax: 539,
    grandTotal: 3538,
    total: 3538,
    paymentMethod: 'Credit/Debit Card',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    trackingSteps: [
      { status: 'Order Placed', title: 'Placed', date: '15 Aug 2026', description: 'Order Placed', completed: true },
      { status: 'Confirmed', title: 'Confirmed', date: '15 Aug 2026', description: 'Confirmed', completed: true },
      { status: 'Packed', title: 'Packed', date: '16 Aug 2026', description: 'Packed', completed: true },
      { status: 'Shipped', title: 'Shipped', date: '17 Aug 2026', description: 'Shipped', completed: true },
      { status: 'Delivered', title: 'Delivered', date: '18 Aug 2026', description: 'Signed and delivered', completed: true }
    ]
  },
  {
    id: 'ord-91042',
    orderNumber: 'CPF-91042',
    date: '2026-09-13 09:20 AM',
    orderDate: '2026-09-13 09:20 AM',
    estimatedDelivery: '16 Sep 2026',
    customerId: 'cust-2',
    customerName: 'Priya Nambiar',
    customerEmail: 'priya.nambiar@gmail.com',
    customerPhone: '9845123987',
    items: [
      {
        productId: 'prod-2',
        name: 'Aura Solid Teak King Size Bed with Cane Headboard',
        productName: 'Aura Solid Teak King Size Bed with Cane Headboard',
        sku: 'CP-BED-002',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
        productImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
        price: 54999,
        quantity: 1,
        color: 'Natural Honey Teak',
        selectedColor: 'Natural Honey Teak',
        size: 'King (78 x 72 in)',
        selectedSize: 'King (78 x 72 in)',
        subtotal: 54999
      },
      {
        productId: 'prod-8',
        name: 'Solstice Fluted Oak Round Coffee Table',
        productName: 'Solstice Fluted Oak Round Coffee Table',
        sku: 'CP-COF-008',
        image: 'https://images.unsplash.com/photo-1533779283484-84e1b73487c6?auto=format&fit=crop&w=400&q=80',
        productImage: 'https://images.unsplash.com/photo-1533779283484-84e1b73487c6?auto=format&fit=crop&w=400&q=80',
        price: 12999,
        quantity: 1,
        color: 'Bleached Scandinavian Oak',
        selectedColor: 'Bleached Scandinavian Oak',
        size: 'Diameter 34 in (Large)',
        selectedSize: 'Diameter 34 in (Large)',
        subtotal: 12999
      }
    ],
    shippingAddress: {
      id: 'addr-3',
      type: 'Home',
      name: 'Priya Nambiar',
      phone: '9845123987',
      street: 'Villa 14, Palm Meadows, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066',
      isDefault: true
    },
    deliveryMethod: 'White-Glove Showroom Assembly (Free)',
    deliveryCharge: 0,
    subtotal: 67998,
    discount: 0,
    tax: 12239,
    grandTotal: 80237,
    total: 80237,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    orderStatus: 'Pending',
    trackingSteps: [
      {
        status: 'Pending',
        title: 'Order Placed & Awaiting Verification',
        date: '13 Sep 2026, 09:20 AM',
        description: 'Order successfully placed via Cash on Delivery. Pending showroom fulfillment team confirmation.',
        completed: true
      }
    ]
  },
  {
    id: 'ord-90415',
    orderNumber: 'CPF-90415',
    date: '2026-09-12 04:15 PM',
    orderDate: '2026-09-12 04:15 PM',
    estimatedDelivery: '15 Sep 2026',
    customerId: 'cust-3',
    customerName: 'Vikramaditya Rao',
    customerEmail: 'vikram.rao@enterprise.in',
    customerPhone: '9731234567',
    items: [
      {
        productId: 'prod-3',
        name: 'Royal Sheesham 6-Seater Dining Table Set',
        productName: 'Royal Sheesham 6-Seater Dining Table Set',
        sku: 'CP-DIN-003',
        image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=400&q=80',
        productImage: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=400&q=80',
        price: 42999,
        quantity: 1,
        color: 'Deep Provincial Teak Finish',
        selectedColor: 'Deep Provincial Teak Finish',
        size: '6-Seater Table + 6 Chairs',
        selectedSize: '6-Seater Table + 6 Chairs',
        subtotal: 42999
      }
    ],
    shippingAddress: {
      id: 'addr-4',
      type: 'Home',
      name: 'Vikramaditya Rao',
      phone: '9731234567',
      street: '4th Block, Koramangala 80 Feet Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      isDefault: true
    },
    deliveryMethod: 'White-Glove Showroom Assembly (Free)',
    deliveryCharge: 0,
    subtotal: 42999,
    discount: 2000,
    couponCode: 'FESTIVE25',
    tax: 7379,
    grandTotal: 48378,
    total: 48378,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    orderStatus: 'Confirmed',
    trackingSteps: [
      {
        status: 'Pending',
        title: 'Order Received',
        date: '12 Sep 2026, 04:15 PM',
        description: 'Payment authenticated via UPI.',
        completed: true
      },
      {
        status: 'Confirmed',
        title: 'Showroom Verified & Artisan Allocated',
        date: '12 Sep 2026, 05:00 PM',
        description: 'Artisan workshop scheduled timber seasoning check.',
        completed: true
      }
    ]
  },
  {
    id: 'ord-89870',
    orderNumber: 'CPF-89870',
    date: '2026-09-12 11:30 AM',
    orderDate: '2026-09-12 11:30 AM',
    estimatedDelivery: '17 Sep 2026',
    customerId: 'cust-4',
    customerName: 'Ananya Deshmukh',
    customerEmail: 'ananya.desh@techcorp.com',
    customerPhone: '9901876543',
    items: [
      {
        productId: 'prod-7',
        name: 'Kyoto Solid Wood & Steel Minimalist Study Desk',
        productName: 'Kyoto Solid Wood & Steel Minimalist Study Desk',
        sku: 'CP-STU-007',
        image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=400&q=80',
        productImage: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=400&q=80',
        price: 17499,
        quantity: 1,
        color: 'Walnut & Matte Black Steel',
        selectedColor: 'Walnut & Matte Black Steel',
        size: '60 x 30 in (Large)',
        selectedSize: '60 x 30 in (Large)',
        subtotal: 17499
      }
    ],
    shippingAddress: {
      id: 'addr-5',
      type: 'Home',
      name: 'Ananya Deshmukh',
      phone: '9901876543',
      street: 'Tower 3, Brigade Gateway, Malleshwaram',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560055',
      isDefault: true
    },
    deliveryMethod: 'Standard White-Glove',
    deliveryCharge: 0,
    subtotal: 17499,
    discount: 0,
    tax: 3149,
    grandTotal: 20648,
    total: 20648,
    paymentMethod: 'Credit/Debit Card',
    paymentStatus: 'Paid',
    orderStatus: 'Processing',
    trackingSteps: [
      { status: 'Order Placed', title: 'Placed', date: '12 Sep 2026, 11:30 AM', description: 'Order Placed', completed: true },
      { status: 'Confirmed', title: 'Confirmed', date: '12 Sep 2026, 01:00 PM', description: 'Confirmed', completed: true },
      { status: 'Processing', title: 'Hand-finishing Top Coat', date: '13 Sep 2026', description: 'Artisan hand-sanding walnut timber top', completed: true }
    ]
  }
];

export const INITIAL_INVENTORY_LOGS: InventoryLog[] = [
  {
    id: 'log-1',
    productId: 'prod-1',
    productName: 'Verona Chesterfield 3-Seater Velvet Sofa',
    sku: 'CP-SOF-001',
    type: 'Stock In',
    quantityChange: 15,
    previousStock: 0,
    newStock: 15,
    date: '2026-09-01 09:00',
    reason: 'New factory batch received from Mysore wood workshop'
  },
  {
    id: 'log-2',
    productId: 'prod-1',
    productName: 'Verona Chesterfield 3-Seater Velvet Sofa',
    sku: 'CP-SOF-001',
    type: 'Order Deduction',
    quantityChange: -1,
    previousStock: 15,
    newStock: 14,
    date: '2026-09-11 10:15',
    reason: 'Customer Order #CPF-89210 placed'
  },
  {
    id: 'prod-2-log',
    productId: 'prod-2',
    productName: 'Aura Solid Teak King Size Bed',
    sku: 'CP-BED-002',
    type: 'Stock In',
    quantityChange: 8,
    previousStock: 0,
    newStock: 8,
    date: '2026-09-05 11:20',
    reason: 'Restocked by craftsman team'
  }
];

export const INITIAL_ADMIN_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'adm-notif-1',
    title: 'New High-Value Order Placed',
    message: 'Order #CPF-89210 received from Rohan Sharma for ₹53,097 (Paid via UPI).',
    date: '2026-09-11 10:15',
    type: 'order',
    read: false,
    orderId: 'ord-89210'
  },
  {
    id: 'adm-notif-2',
    title: 'Low Stock Alert: Aura King Bed',
    message: 'Aura Solid Teak King Bed (SKU: CP-BED-002) is down to 8 units. Threshold is 3.',
    date: '2026-09-12 11:00',
    type: 'stock',
    read: false
  },
  {
    id: 'adm-notif-3',
    title: 'New Customer Registered',
    message: 'Pooja Nair registered with email pooja.n@gmail.com',
    date: '2026-09-12 16:20',
    type: 'customer',
    read: true
  }
];

export const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    productName: 'Verona Chesterfield 3-Seater Velvet Sofa',
    productImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    headline: 'Exceeded every expectation in our formal drawing room!',
    comment: 'The emerald green velvet is so rich and deep. The high-resilience foam provides firm yet plush posture support. Delivery team arrived on time, wore shoe covers, and placed it within 20 minutes.',
    date: '2026-08-20',
    verified: true,
    authorName: 'Rohan Sharma',
    authorEmail: 'rohan.sharma@example.com',
    authorCity: 'Bengaluru, Karnataka',
    status: 'published'
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    productName: 'Verona Chesterfield 3-Seater Velvet Sofa',
    productImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    headline: 'Museum-grade craftsmanship at an honest price',
    comment: 'The deep button tufting and solid brass casters are executed with absolute precision. We had guests over for Ganesh Chaturthi and everyone inquired where we purchased this couch.',
    date: '2026-08-28',
    verified: true,
    authorName: 'Megha Singhal',
    authorEmail: 'megha.s@outlook.com',
    authorCity: 'Mumbai, Maharashtra',
    status: 'published'
  },
  {
    id: 'rev-3',
    productId: 'prod-1',
    productName: 'Verona Chesterfield 3-Seater Velvet Sofa',
    productImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
    rating: 4,
    headline: 'Stunning centerpiece, slightly heavier than expected',
    comment: 'The frame is exceptionally solid seasoned sal wood which makes it quite heavy to reposition, but that also speaks to its generational durability. Velvet fabric cleans easily with a soft brush.',
    date: '2026-09-02',
    verified: true,
    authorName: 'Vikramaditya Rao',
    authorEmail: 'v.rao@gmail.com',
    authorCity: 'Hyderabad, Telangana',
    status: 'published'
  },
  {
    id: 'rev-4',
    productId: 'prod-2',
    productName: 'Nordic Minimalist L-Shape Sectional',
    productImage: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    headline: 'The ultimate lounge sofa for family movie nights',
    comment: 'Oatmeal textured linen is breathable even during humid monsoon weeks. The chaise section is wide enough for two people to stretch out comfortably. Incredible value.',
    date: '2026-09-04',
    verified: true,
    authorName: 'Pooja Nair',
    authorEmail: 'pooja.n@gmail.com',
    authorCity: 'Kochi, Kerala',
    status: 'published'
  },
  {
    id: 'rev-5',
    productId: 'prod-3',
    productName: 'Kyoto Teak & Cane Accent Chair',
    productImage: 'https://images.unsplash.com/photo-1580481077194-46c5923b7bf8?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    headline: 'A work of art in our balcony reading nook',
    comment: 'The hand-woven natural rattan cane weave is taut and impeccable. The teak wood grain is satin smooth with a natural linseed oil finish. Pairs wonderfully with indoor monstera plants.',
    date: '2026-08-15',
    verified: true,
    authorName: 'Ananya Deshmukh',
    authorEmail: 'ananya.d@gmail.com',
    authorCity: 'Pune, Maharashtra',
    status: 'published'
  },
  {
    id: 'rev-6',
    productId: 'prod-7',
    productName: 'Sovereign Live-Edge Acacia 8-Seater Dining Table',
    productImage: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    headline: 'The centerpiece of our home renovation',
    comment: 'The 2-inch solid acacia slab preserves natural organic grain, knots, and butterfly joints. Heavy gauge matte black steel legs offer zero wobble. Absolutely breathtaking dining table.',
    date: '2026-08-30',
    verified: true,
    authorName: 'Kunal Singhania',
    authorEmail: 'kunal.s@singhania.in',
    authorCity: 'New Delhi, NCR',
    status: 'published'
  },
  {
    id: 'rev-7',
    productId: 'prod-8',
    productName: 'Aura Solid Teak King Bed with Hydraulic Storage',
    productImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    headline: 'Effortless hydraulic lifting and zero squeaks',
    comment: 'The dual German hydraulic cylinders make lifting our heavy 10-inch latex mattress a breeze with one hand. Enormous underbed storage space fits all our winter duvets and suitcases.',
    date: '2026-09-08',
    verified: true,
    authorName: 'Arjun Vardhan',
    authorEmail: 'arjun.v@outlook.com',
    authorCity: 'Chennai, Tamil Nadu',
    status: 'published'
  }
];
