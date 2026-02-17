// ======================
// 50 LATEST PHONES 2026
// ======================

...Array.from({ length: 50 }, (_, i) => {
  const brands = [
    "Apple","Samsung","OnePlus","Google","Xiaomi",
    "Vivo","OPPO","Motorola","Realme","Nothing"
  ];

  const models = [
    "Ultra","Pro","Pro Max","Plus","Edge",
    "Neo","Lite","Max","Fusion","Prime"
  ];

  const brand = brands[i % brands.length];
  const modelName = `${brand} ${models[i % models.length]} ${2026}`;

  const basePrice = 35000 + i * 2500;

  return {
    id: `${brand.toLowerCase()}-${modelName.toLowerCase().replace(/\s/g, "-")}-${i}`,
    brand,
    model: modelName,
    price: basePrice,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    ram: "8GB",
    storage: "128GB",
    os: brand === "Apple" ? "iOS" : "Android",
    display: "6.7-inch AMOLED, 120Hz",
    processor: "Snapdragon 8 Gen 4",
    camera: "50MP Main + 12MP Ultra Wide",
    battery: "5000 mAh with 80W fast charging",
    description: `${modelName} is a 2026 flagship smartphone with next-gen performance and AI capabilities.`,
    highlights: [
      "AI Features",
      "Fast Charging",
      "High Refresh Rate",
      "Premium Design"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=600&fit=crop"
    ],
    variants: [
      { ram: "8GB", storage: "128GB", price: basePrice },
      { ram: "12GB", storage: "256GB", price: basePrice + 5000 },
      { ram: "16GB", storage: "512GB", price: basePrice + 12000 }
    ],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Silver", hex: "#C0C0C0" },
      { name: "Blue", hex: "#1E3A5F" }
    ],
    bankOffers: defaultBankOffers
  };
})
