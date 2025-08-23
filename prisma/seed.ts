/// <reference types="node" />

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const tiktokers = [
  {
    handle: "dancequeen123",
    name: "Sofía Martínez",
    bio: "Amante del baile y la moda 💃✨",
    avatarUrl: "https://randomuser.me/api/portraits/women/1.jpg",
    profileUrl: "https://www.tiktok.com/@dancequeen123",
    country: "Uruguay",
    language: "es",
    niches: ["dance", "fashion"],
    followers: 150000,
    following: 200,
    totalLikes: 1200000,
    avgViews: 50000,
    avgLikes: 4000,
    avgComments: 300,
    engagementRate: 0.08,
    verified: false,
    contact: "sofiamartinez@example.com",
    priceEst: 200,
    sampleVideos: { urls: ["https://tiktok.com/video/1", "https://tiktok.com/video/2"] },
    source: "manual_seed",
    lastScrapedAt: new Date(),
    raw: { platform: "tiktok" },
  },
  {
    handle: "techlover_mx",
    name: "Carlos Rivera",
    bio: "Reseñas de gadgets y tips de tecnología 🔌📱",
    avatarUrl: "https://randomuser.me/api/portraits/men/3.jpg",
    profileUrl: "https://www.tiktok.com/@techlover_mx",
    country: "Mexico",
    language: "es",
    niches: ["tech", "reviews"],
    followers: 95000,
    following: 180,
    totalLikes: 600000,
    avgViews: 30000,
    avgLikes: 2500,
    avgComments: 150,
    engagementRate: 0.1,
    verified: false,
    contact: "carlos@example.com",
    priceEst: 180,
    sampleVideos: { urls: ["https://tiktok.com/video/3"] },
    source: "manual_seed",
    lastScrapedAt: new Date(),
    raw: { platform: "tiktok" },
  },
  {
    handle: "cookwithana",
    name: "Ana Torres",
    bio: "Recetas fáciles y deliciosas 🍝🍰",
    avatarUrl: "https://randomuser.me/api/portraits/women/4.jpg",
    profileUrl: "https://www.tiktok.com/@cookwithana",
    country: "Argentina",
    language: "es",
    niches: ["food", "lifestyle"],
    followers: 200000,
    following: 150,
    totalLikes: 1800000,
    avgViews: 80000,
    avgLikes: 6000,
    avgComments: 400,
    engagementRate: 0.12,
    verified: true,
    contact: "ana@example.com",
    priceEst: 300,
    sampleVideos: { urls: ["https://tiktok.com/video/4", "https://tiktok.com/video/5"] },
    source: "manual_seed",
    lastScrapedAt: new Date(),
    raw: { platform: "tiktok" },
  },
  {
    handle: "fitnessleo",
    name: "Leo Fit",
    bio: "Entrenador personal 💪 Rutinas y motivación",
    avatarUrl: "https://randomuser.me/api/portraits/men/5.jpg",
    profileUrl: "https://www.tiktok.com/@fitnessleo",
    country: "Spain",
    language: "es",
    niches: ["fitness", "health"],
    followers: 175000,
    following: 220,
    totalLikes: 1400000,
    avgViews: 60000,
    avgLikes: 5000,
    avgComments: 350,
    engagementRate: 0.09,
    verified: false,
    contact: "leo@example.com",
    priceEst: 220,
    sampleVideos: { urls: ["https://tiktok.com/video/6"] },
    source: "manual_seed",
    lastScrapedAt: new Date(),
    raw: { platform: "tiktok" },
  },
  {
    handle: "travelmia",
    name: "Mia Johnson",
    bio: "Explorando el mundo 🌍✈️ Consejos de viajes",
    avatarUrl: "https://randomuser.me/api/portraits/women/6.jpg",
    profileUrl: "https://www.tiktok.com/@travelmia",
    country: "USA",
    language: "en",
    niches: ["travel", "lifestyle"],
    followers: 320000,
    following: 300,
    totalLikes: 2500000,
    avgViews: 120000,
    avgLikes: 9500,
    avgComments: 600,
    engagementRate: 0.11,
    verified: true,
    contact: "mia@example.com",
    priceEst: 500,
    sampleVideos: { urls: ["https://tiktok.com/video/7"] },
    source: "manual_seed",
    lastScrapedAt: new Date(),
    raw: { platform: "tiktok" },
  },
  // 👉 agrega más hasta 10 o 20 con distintos nichos (comedia, música, deportes, moda, gaming, etc.)
];

async function main() {
  console.log("🌱 Seeding database...");

  // Limpio la colección
  await prisma.tiktoker.deleteMany();

  // Inserto uno por uno (para respetar unique handle)
  for (const tiktoker of tiktokers) {
    await prisma.tiktoker.upsert({
      where: { handle: tiktoker.handle },
      update: {},
      create: tiktoker,
    });
  }

  console.log("✅ Seed completado con éxito");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
