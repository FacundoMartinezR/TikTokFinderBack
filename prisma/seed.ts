/// <reference types="node" />

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

  const tiktokers = [
    {
  "handle": "natmi.ph",
  "profileUrl": "https://www.tiktok.com/@natmi.ph",
  "followers": 14500,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/natmi.ph.jpeg",
  "niche": "travel",
  "avgViews": 1022,
  "engagementRate": 0.42,
  "bio": "Nat fotógrafa y filmmaker\\n🏔️ Viviendo en Bariloche\\nSeguime en Ig👇🏼",
  "language": "spa",
  "lastScrapedAt": "2025-09-20T17:12:05.823Z"
},
  {
  "handle": "gabscanu",
  "profileUrl": "https://www.tiktok.com/@gabscanu",
  "followers": 60800,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/gabscanu.jpeg",
  "niche": "travel",
  "avgViews": 111546,
  "engagementRate": 15.53,
  "bio": "Photography\\u002FCreative direction \\nShop my Original Framed Art ⬇️",
  "language": "eng",
  "lastScrapedAt": "2025-09-20T17:12:36.708Z"
},
  {
  "handle": "spencerheaphy",
  "profileUrl": "https://www.tiktok.com/@spencerheaphy",
  "followers": 29900,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/spencerheaphy.jpeg",
  "niche": "travel",
  "avgViews": 46921,
  "engagementRate": 17.46,
  "bio": "📍New York City\\n🎥 Photographer \\u002F DP\\n📩 Contact@spencerheaphy.com",
  "language": "eng",
  "lastScrapedAt": "2025-09-20T17:13:21.042Z"
},
  {
  "handle": "poetic.duck",
  "profileUrl": "https://www.tiktok.com/@poetic.duck",
  "followers": 39700,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/poetic.duck.jpeg",
  "niche": "travel",
  "avgViews": 136450,
  "engagementRate": 46.24,
  "bio": "Street Photography 📷📷📷",
  "language": "eng",
  "lastScrapedAt": "2025-09-20T17:13:50.925Z"
},
  {
  "handle": "stacibrucksphoto",
  "profileUrl": "https://www.tiktok.com/@stacibrucksphoto",
  "followers": 22500,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/stacibrucksphoto.jpeg",
  "niche": "travel",
  "avgViews": 207223,
  "engagementRate": 31.2,
  "bio": "✨ Wedding + Brand Photographer\\n📍Based in Wichita • Travel Worldwide",
  "language": "eng",
  "lastScrapedAt": "2025-09-20T17:14:37.758Z"
},
  {
  "handle": "alessvisuals",
  "profileUrl": "https://www.tiktok.com/@alessvisuals",
  "followers": 12400,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/alessvisuals.jpeg",
  "niche": "travel",
  "avgViews": 376403,
  "engagementRate": 642.83,
  "bio": "alessandro | 🇲🇽\\n📍bcn\\nphoto x video\\n✉️aavilesrenaldi@gmail.com",
  "language": "spa",
  "lastScrapedAt": "2025-09-20T17:15:40.465Z"
},
  {
  "handle": "_leamancuso",
  "profileUrl": "https://www.tiktok.com/@_leamancuso",
  "followers": 27300,
  "avatarUrl": "https://p19-common-sign-useastred.tiktokcdn-eu.com/tos-useast2a-avt-0068-euttp/ed3cfcd235dbcb1fcb76a6208061599f~tplv-tiktokx-cropcenter:720:720.jpeg?dr=14579&refresh_token=91e11708&x-expires=1758560400&x-signature=i+FCYXbhfNrELX7pNyfGRJIT8p4=&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva",
  "niche": "travel",
  "avgViews": 184648,
  "engagementRate": 77.11,
  "bio": "PHOTOGRAPHER 🎞️\\nTravel  |  Hotels  |  Life moments \\nig @_LeaMancuso",
  "language": "eng",
  "lastScrapedAt": "2025-09-20T17:16:16.717Z"
},
  {
  "handle": "jessphotopop",
  "profileUrl": "https://www.tiktok.com/@jessphotopop",
  "followers": 17200,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/jessphotopop.jpeg",
  "niche": "travel",
  "avgViews": 66395,
  "engagementRate": 72.02,
  "bio": "Soy fotógrafa y fan de Uruguay 🇺🇾",
  "language": "spa",
  "lastScrapedAt": "2025-09-20T17:17:04.395Z"
},
  {
  "handle": "wanderwithdonna",
  "profileUrl": "https://www.tiktok.com/@wanderwithdonna",
  "followers": 31000,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/wanderwithdonna.jpeg",
  "niche": "travel",
  "avgViews": 8196,
  "engagementRate": 2.45,
  "bio": "Disabled photographer, storyteller, & conservationist in South Florida.🌊🐟🐚",
  "language": "eng",
  "lastScrapedAt": "2025-09-20T17:17:36.897Z"
},
  {
  "handle": "petermlph",
  "profileUrl": "https://www.tiktok.com/@petermlph",
  "followers": 17700,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/petermlph.jpeg",
  "niche": "travel",
  "avgViews": 2438,
  "engagementRate": 1.68,
  "bio": "El mundo a través de mi cámara 📸🇦🇷\\n-\\n@petermlph 📸 IG",
  "language": "spa",
  "lastScrapedAt": "2025-09-20T17:18:07.017Z"
},
  {
  "handle": "curizmaphotography",
  "profileUrl": "https://www.tiktok.com/@curizmaphotography",
  "followers": 18200,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/curizmaphotography.jpeg",
  "niche": "travel",
  "avgViews": 8274,
  "engagementRate": 4.47,
  "bio": "Just a wedding & couples photographer living her best life 💌✨\\n2027 bride 💍",
  "language": "eng",
  "lastScrapedAt": "2025-09-20T17:18:36.306Z"
},
  {
  "handle": "luchosplaces",
  "profileUrl": "https://www.tiktok.com/@luchosplaces",
  "followers": 79400,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/luchosplaces.jpeg",
  "niche": "travel",
  "avgViews": 459183,
  "engagementRate": 97.42,
  "bio": "Full time Content Creator, Photographer & Videographer 🎥📸. See my website 🔥",
  "language": "eng",
  "lastScrapedAt": "2025-09-20T17:19:26.585Z"
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

  