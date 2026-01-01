export interface Phone {
  id: string;
  brand: string;
  model: string;
  price: number;
  image: string;
  ram: string;
  storage: string;
  os: 'Android' | 'iOS';
  display: string;
  processor: string;
  camera: string;
  battery: string;
  description: string;
  highlights: string[];
  gallery: string[];
}

export const phones: Phone[] = [
  {
    id: "iphone-15-pro-max",
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    price: 159900,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop",
    ram: "8GB",
    storage: "256GB",
    os: "iOS",
    display: "6.7-inch Super Retina XDR OLED, 120Hz ProMotion",
    processor: "A17 Pro Bionic chip",
    camera: "48MP Main + 12MP Ultra Wide + 12MP Telephoto (5x optical zoom)",
    battery: "4422 mAh with 27W fast charging",
    description: "The iPhone 15 Pro Max is Apple's most advanced smartphone yet, featuring a titanium design, the powerful A17 Pro chip, and an incredible 48MP camera system with 5x optical zoom. Experience console-level gaming, stunning photography, and all-day battery life.",
    highlights: ["Titanium Design", "A17 Pro Chip", "48MP Camera", "5x Zoom"],
    gallery: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "samsung-s24-ultra",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    price: 134999,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop",
    ram: "12GB",
    storage: "256GB",
    os: "Android",
    display: "6.8-inch Dynamic AMOLED 2X, 120Hz, 2600 nits",
    processor: "Snapdragon 8 Gen 3 for Galaxy",
    camera: "200MP Main + 12MP Ultra Wide + 50MP Telephoto + 10MP Telephoto",
    battery: "5000 mAh with 45W fast charging",
    description: "Samsung Galaxy S24 Ultra brings Galaxy AI to your fingertips. With a stunning 200MP camera, built-in S Pen, and Snapdragon 8 Gen 3, this is the ultimate productivity and creativity powerhouse.",
    highlights: ["200MP Camera", "Galaxy AI", "S Pen Included", "Titanium Frame"],
    gallery: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "oneplus-12",
    brand: "OnePlus",
    model: "OnePlus 12",
    price: 64999,
    image: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=400&h=400&fit=crop",
    ram: "12GB",
    storage: "256GB",
    os: "Android",
    display: "6.82-inch LTPO AMOLED, 120Hz, 4500 nits peak",
    processor: "Snapdragon 8 Gen 3",
    camera: "50MP Main (Sony LYT-808) + 64MP Periscope + 48MP Ultra Wide",
    battery: "5400 mAh with 100W SUPERVOOC charging",
    description: "The OnePlus 12 delivers flagship performance with Hasselblad-tuned cameras. Experience blazing-fast 100W charging that goes from 0-100% in just 26 minutes, and enjoy the smoothest display ever on a OnePlus.",
    highlights: ["100W Fast Charging", "Hasselblad Camera", "Snapdragon 8 Gen 3", "5400mAh Battery"],
    gallery: [
      "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "google-pixel-8-pro",
    brand: "Google",
    model: "Pixel 8 Pro",
    price: 106999,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop",
    ram: "12GB",
    storage: "128GB",
    os: "Android",
    display: "6.7-inch LTPO OLED, 120Hz, 2400 nits",
    processor: "Google Tensor G3",
    camera: "50MP Main + 48MP Ultra Wide + 48MP Telephoto (5x optical)",
    battery: "5050 mAh with 30W fast charging",
    description: "Pixel 8 Pro is Google's most powerful and intelligent phone yet. With Tensor G3, experience AI-powered photo editing, real-time translation, and 7 years of OS updates. The camera captures stunning photos in any light.",
    highlights: ["7 Years Updates", "Google AI", "Best-in-class Camera", "Temperature Sensor"],
    gallery: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "xiaomi-14-ultra",
    brand: "Xiaomi",
    model: "Xiaomi 14 Ultra",
    price: 99999,
    image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&h=400&fit=crop",
    ram: "16GB",
    storage: "512GB",
    os: "Android",
    display: "6.73-inch LTPO AMOLED, 120Hz, 3000 nits",
    processor: "Snapdragon 8 Gen 3",
    camera: "50MP x4 Leica Summilux lenses (Variable aperture f/1.63-4.0)",
    battery: "5000 mAh with 90W wired + 80W wireless charging",
    description: "The Xiaomi 14 Ultra is the ultimate camera phone, co-engineered with Leica. All four cameras feature Summilux lenses with a revolutionary variable aperture system. This is photography redefined.",
    highlights: ["Leica Quad Camera", "Variable Aperture", "90W + 80W Charging", "16GB RAM"],
    gallery: [
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "iphone-15",
    brand: "Apple",
    model: "iPhone 15",
    price: 79900,
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
    ram: "6GB",
    storage: "128GB",
    os: "iOS",
    display: "6.1-inch Super Retina XDR OLED, Dynamic Island",
    processor: "A16 Bionic chip",
    camera: "48MP Main + 12MP Ultra Wide",
    battery: "3349 mAh with 20W fast charging",
    description: "iPhone 15 introduces Dynamic Island to the standard iPhone lineup. With a powerful 48MP camera, the reliable A16 Bionic chip, and USB-C charging, this is the iPhone for everyone.",
    highlights: ["Dynamic Island", "48MP Camera", "USB-C", "A16 Bionic"],
    gallery: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "samsung-s24",
    brand: "Samsung",
    model: "Galaxy S24",
    price: 74999,
    image: "https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=400&h=400&fit=crop",
    ram: "8GB",
    storage: "128GB",
    os: "Android",
    display: "6.2-inch Dynamic AMOLED 2X, 120Hz",
    processor: "Exynos 2400",
    camera: "50MP Main + 12MP Ultra Wide + 10MP Telephoto (3x)",
    battery: "4000 mAh with 25W fast charging",
    description: "Galaxy S24 brings Galaxy AI to an accessible package. Enjoy intelligent photo editing, real-time translation, and a compact design that fits perfectly in your hand.",
    highlights: ["Galaxy AI", "Compact Design", "50MP Camera", "7 Years Updates"],
    gallery: [
      "https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "nothing-phone-2",
    brand: "Nothing",
    model: "Phone (2)",
    price: 44999,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    ram: "12GB",
    storage: "256GB",
    os: "Android",
    display: "6.7-inch LTPO OLED, 120Hz",
    processor: "Snapdragon 8+ Gen 1",
    camera: "50MP Main + 50MP Ultra Wide",
    battery: "4700 mAh with 45W fast charging",
    description: "Nothing Phone (2) features the iconic Glyph Interface with over 33 unique lighting zones. Experience a phone that's different by design, with powerful performance and clean software.",
    highlights: ["Glyph Interface", "Unique Design", "Clean Software", "Snapdragon 8+ Gen 1"],
    gallery: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "realme-gt-5-pro",
    brand: "Realme",
    model: "GT 5 Pro",
    price: 35999,
    image: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=400&fit=crop",
    ram: "12GB",
    storage: "256GB",
    os: "Android",
    display: "6.78-inch LTPO AMOLED, 144Hz",
    processor: "Snapdragon 8 Gen 3",
    camera: "50MP Sony IMX890 + 8MP Ultra Wide + 50MP Periscope",
    battery: "5400 mAh with 100W SUPERVOOC charging",
    description: "Realme GT 5 Pro brings flagship Snapdragon 8 Gen 3 performance at an unbeatable price. With 100W charging, a 144Hz display, and periscope camera, this is the value king.",
    highlights: ["Snapdragon 8 Gen 3", "100W Charging", "144Hz Display", "Best Value"],
    gallery: [
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "vivo-x100-pro",
    brand: "Vivo",
    model: "X100 Pro",
    price: 89999,
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop",
    ram: "16GB",
    storage: "512GB",
    os: "Android",
    display: "6.78-inch LTPO AMOLED, 120Hz",
    processor: "MediaTek Dimensity 9300",
    camera: "50MP ZEISS + 50MP Ultra Wide + 100MP ZEISS APO Telephoto",
    battery: "5400 mAh with 100W fast charging",
    description: "Vivo X100 Pro is engineered for photography enthusiasts with ZEISS optics and a revolutionary 100MP APO telephoto lens. Experience true-to-life colors and professional-grade portraits.",
    highlights: ["ZEISS Optics", "100MP Telephoto", "100W Charging", "Dimensity 9300"],
    gallery: [
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "oppo-find-x7-ultra",
    brand: "OPPO",
    model: "Find X7 Ultra",
    price: 94999,
    image: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400&h=400&fit=crop",
    ram: "16GB",
    storage: "512GB",
    os: "Android",
    display: "6.82-inch LTPO AMOLED, 120Hz",
    processor: "Snapdragon 8 Gen 3",
    camera: "50MP Main + 50MP Ultra Wide + 50MP Periscope + 50MP Periscope",
    battery: "5000 mAh with 100W SUPERVOOC + 50W wireless",
    description: "OPPO Find X7 Ultra is the world's first phone with dual periscope cameras. Capture incredible zoom shots from 3x to 6x optical, all with Hasselblad color science.",
    highlights: ["Dual Periscope", "Hasselblad Colors", "100W + 50W Charging", "Flagship Performance"],
    gallery: [
      "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "motorola-razr-50-ultra",
    brand: "Motorola",
    model: "Razr 50 Ultra",
    price: 99999,
    image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop",
    ram: "12GB",
    storage: "512GB",
    os: "Android",
    display: "6.9-inch pOLED + 4-inch External pOLED",
    processor: "Snapdragon 8s Gen 3",
    camera: "50MP Main + 50MP Telephoto (2x)",
    battery: "4000 mAh with 45W TurboPower",
    description: "The Motorola Razr 50 Ultra is the most advanced flip phone yet. With a massive 4-inch external display, you can do almost everything without opening the phone.",
    highlights: ["4-inch External Display", "Flip Design", "50MP Cameras", "Premium Build"],
    gallery: [
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&h=600&fit=crop"
    ]
  }
];

export const brands = [...new Set(phones.map(p => p.brand))];
export const operatingSystems: ('Android' | 'iOS')[] = ['Android', 'iOS'];
