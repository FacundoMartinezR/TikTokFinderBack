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
    handle: "techguy_uy",
    name: "Martín López",
    bio: "Tecnología y reviews 📱💻",
    avatarUrl: "https://randomuser.me/api/portraits/men/2.jpg",
    profileUrl: "https://www.tiktok.com/@techguy_uy",
    country: "Uruguay",
    language: "es",
    niches: ["tech", "reviews"],
    followers: 80000,
    following: 150,
    totalLikes: 450000,
    avgViews: 20000,
    avgLikes: 1800,
    avgComments: 120,
    engagementRate: 0.09,
    verified: false,
    contact: "martinlopez@example.com",
    priceEst: 150,
    sampleVideos: { urls: ["https://tiktok.com/video/3"] },
    source: "manual_seed",
    lastScrapedAt: new Date(),
    raw: { platform: "tiktok" },
  },
  // 👉 Duplica y cambia valores hasta llegar a 20 tiktokers
];

async function main() {
  console.log("🌱 Seeding database...");

  // 🔹 Borro datos anteriores
  await prisma.tiktoker.deleteMany();

  // 🔹 Inserto nuevos tiktokers
  await prisma.tiktoker.createMany({
    data: tiktokers,
  });

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
