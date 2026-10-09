export type PropertyType = "villa" | "apartment" | "cabin" | "hotel" | "cottage";

export interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  country: string;
  type: PropertyType;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  description: string;
  amenities: string[];
  images: string[];
  host: {
    name: string;
    avatar: string;
    joined: string;
    isSuperhost: boolean;
  };
  highlights: string[];
  coordinates: { lat: number; lng: number };
}

export const properties: Property[] = [
  {
    id: "1",
    title: "Sunset Cliff Villa with Infinity Pool",
    location: "Santorini, Greece",
    city: "Oia",
    country: "Greece",
    type: "villa",
    pricePerNight: 420,
    rating: 4.97,
    reviewCount: 128,
    guests: 6,
    bedrooms: 3,
    beds: 4,
    baths: 3,
    description:
      "Perched on the cliffs of Oia, this whitewashed villa offers breathtaking caldera views and a private infinity pool that melts into the Aegean. Floor-to-ceiling windows, handcrafted interiors, and a rooftop terrace make every sunset unforgettable.",
    amenities: [
      "Infinity pool",
      "Ocean view",
      "Wifi",
      "Kitchen",
      "Air conditioning",
      "Parking",
      "Washer",
      "Outdoor dining",
    ],
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
    ],
    host: {
      name: "Elena M.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      joined: "2019",
      isSuperhost: true,
    },
    highlights: ["Caldera views", "Private infinity pool", "Walking distance to Oia village"],
    coordinates: { lat: 36.4618, lng: 25.3753 },
  },
  {
    id: "2",
    title: "Alpine Chalet with Mountain Views",
    location: "Zermatt, Switzerland",
    city: "Zermatt",
    country: "Switzerland",
    type: "cabin",
    pricePerNight: 380,
    rating: 4.92,
    reviewCount: 89,
    guests: 8,
    bedrooms: 4,
    beds: 5,
    baths: 2,
    description:
      "A classic wooden chalet nestled in the Swiss Alps with panoramic Matterhorn views. Cozy fireplace, sauna, and ski-in access make this the perfect winter retreat or summer hiking base.",
    amenities: [
      "Fireplace",
      "Sauna",
      "Mountain view",
      "Wifi",
      "Kitchen",
      "Heating",
      "Ski storage",
      "Parking",
    ],
    images: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
    ],
    host: {
      name: "Hans W.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      joined: "2017",
      isSuperhost: true,
    },
    highlights: ["Matterhorn views", "Ski-in access", "Private sauna"],
    coordinates: { lat: 46.0207, lng: 7.7491 },
  },
  {
    id: "3",
    title: "Modern Loft in the Heart of Tokyo",
    location: "Shibuya, Tokyo",
    city: "Tokyo",
    country: "Japan",
    type: "apartment",
    pricePerNight: 195,
    rating: 4.88,
    reviewCount: 214,
    guests: 3,
    bedrooms: 1,
    beds: 2,
    baths: 1,
    description:
      "Sleek minimalist loft steps from Shibuya Crossing. Floor-to-ceiling windows, designer furniture, and a fully equipped kitchen. Perfect base for exploring Tokyo's neon nights and hidden alleys.",
    amenities: [
      "Wifi",
      "Kitchen",
      "Air conditioning",
      "Washer",
      "Workspace",
      "Elevator",
      "Smart TV",
      "City view",
    ],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
    ],
    host: {
      name: "Yuki T.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
      joined: "2020",
      isSuperhost: false,
    },
    highlights: ["Near Shibuya Crossing", "Designer interior", "Fast wifi"],
    coordinates: { lat: 35.6595, lng: 139.7004 },
  },
  {
    id: "4",
    title: "Seaside Cottage on the Amalfi Coast",
    location: "Positano, Italy",
    city: "Positano",
    country: "Italy",
    type: "cottage",
    pricePerNight: 310,
    rating: 4.95,
    reviewCount: 156,
    guests: 4,
    bedrooms: 2,
    beds: 3,
    baths: 2,
    description:
      "Charming stone cottage cascading down the cliffs of Positano. Private terrace with lemon trees, direct path to the beach, and the sound of waves as your soundtrack.",
    amenities: [
      "Beach access",
      "Ocean view",
      "Wifi",
      "Kitchen",
      "Air conditioning",
      "Outdoor dining",
      "Garden",
      "Parking",
    ],
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
    ],
    host: {
      name: "Giulia R.",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
      joined: "2018",
      isSuperhost: true,
    },
    highlights: ["Steps to beach", "Private terrace", "Lemon grove"],
    coordinates: { lat: 40.628, lng: 14.4849 },
  },
  {
    id: "5",
    title: "Desert Oasis Villa with Private Pool",
    location: "Marrakech, Morocco",
    city: "Marrakech",
    country: "Morocco",
    type: "villa",
    pricePerNight: 275,
    rating: 4.91,
    reviewCount: 97,
    guests: 6,
    bedrooms: 3,
    beds: 4,
    baths: 3,
    description:
      "A serene riad-style villa outside the medina, surrounded by palm gardens and a sparkling private pool. Traditional zellige tiles meet modern comfort in this peaceful desert retreat.",
    amenities: [
      "Private pool",
      "Garden",
      "Wifi",
      "Kitchen",
      "Air conditioning",
      "Outdoor dining",
      "Parking",
      "Hammam",
    ],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3dd?w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80",
    ],
    host: {
      name: "Youssef B.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
      joined: "2016",
      isSuperhost: true,
    },
    highlights: ["Private pool & garden", "Traditional craftsmanship", "Quiet location"],
    coordinates: { lat: 31.6295, lng: -7.9811 },
  },
  {
    id: "6",
    title: "Boutique Hotel Suite Overlooking the Canal",
    location: "Amsterdam, Netherlands",
    city: "Amsterdam",
    country: "Netherlands",
    type: "hotel",
    pricePerNight: 245,
    rating: 4.86,
    reviewCount: 312,
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    description:
      "Elegant canal-house suite with floor-to-ceiling windows, a freestanding tub, and breakfast included. Steps from the Nine Streets and Anne Frank House.",
    amenities: [
      "Canal view",
      "Breakfast included",
      "Wifi",
      "Air conditioning",
      "Workspace",
      "Room service",
      "Concierge",
      "Bike rental",
    ],
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
    ],
    host: {
      name: "Hotel Canal House",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
      joined: "2015",
      isSuperhost: false,
    },
    highlights: ["Canal views", "Breakfast included", "Historic building"],
    coordinates: { lat: 52.3702, lng: 4.8952 },
  },
  {
    id: "7",
    title: "Forest Cabin with Hot Tub",
    location: "Banff, Canada",
    city: "Banff",
    country: "Canada",
    type: "cabin",
    pricePerNight: 265,
    rating: 4.94,
    reviewCount: 73,
    guests: 4,
    bedrooms: 2,
    beds: 3,
    baths: 1,
    description:
      "Secluded log cabin deep in the Rockies. Wake up to elk outside your window, soak in the outdoor hot tub under the stars, and hike world-class trails from your doorstep.",
    amenities: [
      "Hot tub",
      "Fireplace",
      "Mountain view",
      "Wifi",
      "Kitchen",
      "Heating",
      "BBQ",
      "Parking",
    ],
    images: [
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80",
      "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
    ],
    host: {
      name: "Sarah K.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80",
      joined: "2019",
      isSuperhost: true,
    },
    highlights: ["Outdoor hot tub", "Wildlife viewing", "Trail access"],
    coordinates: { lat: 51.1784, lng: -115.5708 },
  },
  {
    id: "8",
    title: "Penthouse with City Skyline Views",
    location: "New York, USA",
    city: "New York",
    country: "United States",
    type: "apartment",
    pricePerNight: 450,
    rating: 4.89,
    reviewCount: 167,
    guests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 2,
    description:
      "Luxurious Manhattan penthouse with wraparound terrace and Empire State Building views. Floor-to-ceiling glass, chef's kitchen, and doorman building in the heart of Midtown.",
    amenities: [
      "City view",
      "Terrace",
      "Wifi",
      "Kitchen",
      "Air conditioning",
      "Gym access",
      "Doorman",
      "Elevator",
    ],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
    ],
    host: {
      name: "Michael R.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
      joined: "2018",
      isSuperhost: false,
    },
    highlights: ["Empire State views", "Private terrace", "Doorman building"],
    coordinates: { lat: 40.758, lng: -73.9855 },
  },
];

export function getPropertyById(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}

export function filterProperties(filters: {
  location?: string;
  type?: PropertyType | "all";
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
}): Property[] {
  return properties.filter((p) => {
    if (filters.location) {
      const q = filters.location.toLowerCase();
      if (
        !p.location.toLowerCase().includes(q) &&
        !p.city.toLowerCase().includes(q) &&
        !p.country.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (filters.type && filters.type !== "all" && p.type !== filters.type) return false;
    if (filters.minPrice && p.pricePerNight < filters.minPrice) return false;
    if (filters.maxPrice && p.pricePerNight > filters.maxPrice) return false;
    if (filters.guests && p.guests < filters.guests) return false;
    return true;
  });
}
