/// <reference types="node" />

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const tiktokers = [
  {
    handle: "danicryptooo7.7",
    profileUrl: "https://www.tiktok.com/@danicryptooo7.7",
    followers: 19500,
    avatarUrl: "https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/73ede1c3b7c7b6968a0f1a5ae6137b88~tplv-tiktokx-cropcenter:720:720.jpeg",
    niche: "crypto",
    avgViews: 7952,
    engagementRate: 3.92,
    bio: "💵Supply & Demand / SMC TRADER-ICT 💎Crypto Analyst | Investor 👇COMUNIDAD👇",
    country: "por",
    lastScrapedAt: new Date("2025-09-04T01:42:19.147Z"),
  },
  {
    handle: "_miguel.fm",
    profileUrl: "https://www.tiktok.com/@_miguel.fm",
    followers: 32000,
    avatarUrl: "https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/d25f1cfc6989d40280718634cb10581a~tplv-tiktokx-cropcenter:720:720.jpeg",
    niche: "crypto",
    avgViews: 336282,
    engagementRate: 23.65,
    bio: "💰Crypto KOL | 💼 Dm for promo 👇 Click here",
    country: "eng",
    lastScrapedAt: new Date("2025-09-04T01:43:04.150Z"),
  },
  {
    handle: "richquack.com",
    profileUrl: "https://www.tiktok.com/@richquack.com",
    followers: 33000,
    avatarUrl: null,
    niche: "crypto",
    avgViews: 116527,
    engagementRate: 47.14,
    bio: "$QUACK - The OG memecoin cult since 2021! 🦆✨",
    country: "sco",
    lastScrapedAt: new Date("2025-09-04T01:44:13.820Z"),
  },
];

async function main() {
  for (const tiktoker of tiktokers) {
    await prisma.tiktoker.upsert({
      where: { handle: tiktoker.handle },
      update: tiktoker,
      create: tiktoker,
    });
  }
}

main()
  .then(() => {
    console.log("✅ Seed completado");
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error("❌ Error al hacer seed:", e);
    return prisma.$disconnect();
  });
  {
  "handle": "buscandocryptodinero",
  "profileUrl": "https://www.tiktok.com/@buscandocryptodinero",
  "followers": 14700,
  "avatarUrl": null,
  "niche": "crypto",
  "avgViews": 18012,
  "engagementRate": 4.44,
  "bio": "Youtube 107k + Análisis Tecnico de Cryptos, altcoins, libros y Trading... links:",
  "language": "glg",
  "lastScrapedAt": "2025-09-04T17:52:28.478Z"
},
  {
  "handle": "danicryptooo7.7",
  "profileUrl": "https://www.tiktok.com/@danicryptooo7.7",
  "followers": 19600,
  "avatarUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/73ede1c3b7c7b6968a0f1a5ae6137b88~tplv-tiktokx-cropcenter:720:720.jpeg",
  "niche": "crypto",
  "avgViews": 8428,
  "engagementRate": 4.11,
  "bio": "💵Supply & Demand \\u002F SMC TRADER-ICT\\n\\n💎Crypto Analyst | Investor\\n\\n👇COMUNIDAD👇",
  "language": "por",
  "lastScrapedAt": "2025-09-04T17:52:58.745Z"
},
  {
  "handle": "_miguel.fm",
  "profileUrl": "https://www.tiktok.com/@_miguel.fm",
  "followers": 32000,
  "avatarUrl": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/d25f1cfc6989d40280718634cb10581a~tplv-tiktokx-cropcenter:720:720.jpeg",
  "niche": "crypto",
  "avgViews": 336505,
  "engagementRate": 23.7,
  "bio": "💰Crypto KOL | 💼 Dm for promo\\n👇 Click here",
  "language": "eng",
  "lastScrapedAt": "2025-09-04T17:53:55.394Z"
},
  {
  "handle": "buscandocryptodinero",
  "profileUrl": "https://www.tiktok.com/@buscandocryptodinero",
  "followers": 14700,
  "avatarUrl": "/avatars/buscandocryptodinero.jpeg",
  "niche": "crypto",
  "avgViews": 18040,
  "engagementRate": 4.44,
  "bio": "Youtube 107k + Análisis Tecnico de Cryptos, altcoins, libros y Trading... links:",
  "language": "glg",
  "lastScrapedAt": "2025-09-04T17:59:58.078Z"
},
  {
  "handle": "danicryptooo7.7",
  "profileUrl": "https://www.tiktok.com/@danicryptooo7.7",
  "followers": 19600,
  "avatarUrl": "/avatars/danicryptooo7_7.jpeg",
  "niche": "crypto",
  "avgViews": 8440,
  "engagementRate": 4.12,
  "bio": "💵Supply & Demand \\u002F SMC TRADER-ICT\\n\\n💎Crypto Analyst | Investor\\n\\n👇COMUNIDAD👇",
  "language": "por",
  "lastScrapedAt": "2025-09-04T18:00:31.507Z"
},
  {
  "handle": "_miguel.fm",
  "profileUrl": "https://www.tiktok.com/@_miguel.fm",
  "followers": 32000,
  "avatarUrl": "/avatars/_miguel_fm.jpeg",
  "niche": "crypto",
  "avgViews": 336539,
  "engagementRate": 23.7,
  "bio": "💰Crypto KOL | 💼 Dm for promo\\n👇 Click here",
  "language": "eng",
  "lastScrapedAt": "2025-09-04T18:01:21.577Z"
},
  {
  "handle": "richquack.com",
  "profileUrl": "https://www.tiktok.com/@richquack.com",
  "followers": 33000,
  "avatarUrl": null,
  "niche": "crypto",
  "avgViews": 0,
  "engagementRate": 0,
  "bio": "$QUACK - The OG memecoin cult since 2021! 🦆✨",
  "language": "sco",
  "lastScrapedAt": "2025-09-04T18:02:03.931Z"
},
  {
  "handle": "danicryptoo7",
  "profileUrl": "https://www.tiktok.com/@danicryptoo7",
  "followers": 68300,
  "avatarUrl": null,
  "niche": "crypto",
  "avgViews": 0,
  "engagementRate": 0,
  "bio": "💵Supply & Demand \\u002F SMC TRADER-ICT\\n\\n💎Crypto Analyst | Investor\\n\\n👇COMUNIDAD👇",
  "language": "por",
  "lastScrapedAt": "2025-09-04T18:02:41.751Z"
},
