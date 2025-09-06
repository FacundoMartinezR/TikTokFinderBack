/// <reference types="node" />

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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

  const tiktokers = [
    {
  "handle": "_miguel.fm",
  "profileUrl": "https://www.tiktok.com/@_miguel.fm",
  "followers": 32000,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/_miguel.fm.jpeg",
  "niche": "crypto",
  "avgViews": 337181,
  "engagementRate": 23.79,
  "bio": "💰Crypto KOL | 💼 Dm for promo\\n👇 Click here",
  "language": "eng",
  "lastScrapedAt": "2025-09-06T07:03:43.231Z"
},
  {
  "handle": "tradezilla39",
  "profileUrl": "https://www.tiktok.com/@tradezilla39",
  "followers": 22300,
  "avatarUrl": "https://p77-sign-va.tiktokcdn.com/tos-maliva-avt-0068/f46686f67d38c9ef7ec1772553a84265~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=d14d6da3&x-expires=1757314800&x-signature=lxE3UwUj0dY9wuhFYIIL+LZ6qgg=&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva",
  "niche": "crypto",
  "avgViews": 65238,
  "engagementRate": 17.54,
  "bio": "🔹 DAILY Dose of Trading 🔹\\n22k\\u002F23k",
  "language": "eng",
  "lastScrapedAt": "2025-09-06T07:04:16.946Z"
},
  {
  "handle": "danicryptooo7.7",
  "profileUrl": "https://www.tiktok.com/@danicryptooo7.7",
  "followers": 19700,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/danicryptooo7.7.jpeg",
  "niche": "crypto",
  "avgViews": 4399,
  "engagementRate": 2.34,
  "bio": "💵Supply & Demand \\u002F SMC TRADER-ICT\\n\\n💎Crypto Analyst | Investor\\n\\n👇COMUNIDAD👇",
  "language": "por",
  "lastScrapedAt": "2025-09-06T07:05:09.532Z"
},
  {
  "handle": "satoshinewsletter",
  "profileUrl": "https://www.tiktok.com/@satoshinewsletter",
  "followers": 15200,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/satoshinewsletter.jpeg",
  "niche": "crypto",
  "avgViews": 4325,
  "engagementRate": 1.26,
  "bio": "Te enseño como generar ingresos con criptomonedas💻💰\\n\\n👇🏻ANÁLISIS EN VIVO👇🏻",
  "language": "glg",
  "lastScrapedAt": "2025-09-06T07:05:39.348Z"
},
  {
  "handle": "liamanalysis",
  "profileUrl": "https://www.tiktok.com/@liamanalysis",
  "followers": 78600,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/liamanalysis.jpeg",
  "niche": "crypto",
  "avgViews": 5727,
  "engagementRate": 0.25,
  "bio": "Discount code: LIAM15 for 15% OFF\\n⚠️Not financial advice⚠️",
  "language": "eng",
  "lastScrapedAt": "2025-09-06T07:06:20.708Z"
},
  {
  "handle": "mega_crypto",
  "profileUrl": "https://www.tiktok.com/@mega_crypto",
  "followers": 64300,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/mega_crypto.jpeg",
  "niche": "crypto",
  "avgViews": 12473,
  "engagementRate": 0.55,
  "bio": "Crypto Strategist 📈 since 2017\\nLIVE often 🔴 Discord & My Book in Link 👇",
  "language": "eng",
  "lastScrapedAt": "2025-09-06T07:06:50.285Z"
},
  {
  "handle": "tradru1",
  "profileUrl": "https://www.tiktok.com/@tradru1",
  "followers": 10300,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/tradru1.jpeg",
  "niche": "crypto",
  "avgViews": 7612,
  "engagementRate": 3.83,
  "bio": "Affiliate with @trade.ro",
  "language": "dip",
  "lastScrapedAt": "2025-09-06T07:08:02.874Z"
},
  {
  "handle": "cryptokemallive.eth",
  "profileUrl": "https://www.tiktok.com/@cryptokemallive.eth",
  "followers": 77600,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/cryptokemallive.eth.jpeg",
  "niche": "crypto",
  "avgViews": 1066,
  "engagementRate": 0,
  "bio": "Crypto Kemal Resmi\\nTwitter: Cryptokemal\\nInstagram: Crypto Kemal",
  "language": "nob",
  "lastScrapedAt": "2025-09-06T07:08:37.770Z"
},
  {
  "handle": "toobit_toobeex",
  "profileUrl": "https://www.tiktok.com/@toobit_toobeex",
  "followers": 68200,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/toobit_toobeex.jpeg",
  "niche": "crypto",
  "avgViews": 222889,
  "engagementRate": 11.18,
  "bio": "Hi,it's bee.Stay profit👇",
  "language": "sco",
  "lastScrapedAt": "2025-09-06T07:09:07.588Z"
},
  {
  "handle": "danicryptoo7",
  "profileUrl": "https://www.tiktok.com/@danicryptoo7",
  "followers": 68300,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/danicryptoo7.jpeg",
  "niche": "crypto",
  "avgViews": 30183,
  "engagementRate": 2.45,
  "bio": "💵Supply & Demand \\u002F SMC TRADER-ICT\\n\\n💎Crypto Analyst | Investor\\n\\n👇COMUNIDAD👇",
  "language": "por",
  "lastScrapedAt": "2025-09-06T07:09:43.252Z"
},
  {
  "handle": "99accuracytrading",
  "profileUrl": "https://www.tiktok.com/@99accuracytrading",
  "followers": 20700,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/99accuracytrading.jpeg",
  "niche": "crypto",
  "avgViews": 40517,
  "engagementRate": 3.3,
  "bio": "50\\u002F50 Profit & Loss ⚖️\\n99% Accurate Signals ✅\\nJoin Free WhatsApp Channel 📲\\n👇",
  "language": "eng",
  "lastScrapedAt": "2025-09-06T07:10:19.133Z"
},
  {
  "handle": "heectrades",
  "profileUrl": "https://www.tiktok.com/@heectrades",
  "followers": 41200,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/heectrades.jpeg",
  "niche": "crypto",
  "avgViews": 13027,
  "engagementRate": 1.04,
  "bio": "Aplica para operar 1:1 conmigo 👇🏼",
  "language": "glg",
  "lastScrapedAt": "2025-09-06T07:10:54.468Z"
},
  {
  "handle": "unclesam903",
  "profileUrl": "https://www.tiktok.com/@unclesam903",
  "followers": 13600,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/unclesam903.jpeg",
  "niche": "crypto",
  "avgViews": 197851,
  "engagementRate": 20.16,
  "bio": "عدم التدخل بخصوصياتي فرض عليك (مش كرم منك)",
  "language": "arb",
  "lastScrapedAt": "2025-09-06T07:11:25.348Z"
},
  {
  "handle": "quemeveshdtpm",
  "profileUrl": "https://www.tiktok.com/@quemeveshdtpm",
  "followers": 11000,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/quemeveshdtpm.jpeg",
  "niche": "crypto",
  "avgViews": 1644345,
  "engagementRate": 2000.58,
  "bio": "",
  "language": "und",
  "lastScrapedAt": "2025-09-06T07:11:55.314Z"
},
  {
  "handle": "terapiabitcoin",
  "profileUrl": "https://www.tiktok.com/@terapiabitcoin",
  "followers": 29800,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/terapiabitcoin.jpeg",
  "niche": "crypto",
  "avgViews": 102747,
  "engagementRate": 23.4,
  "bio": "Autocustodia de Bitcoin en 1 semana",
  "language": "spa",
  "lastScrapedAt": "2025-09-06T07:12:30.888Z"
},
  {
  "handle": "xgacrypto",
  "profileUrl": "https://www.tiktok.com/@xgacrypto",
  "followers": 11000,
  "avatarUrl": "https:\\u002F\\u002Fp19-common-sign-useastred.tiktokcdn-eu.com\\u002Ftos-useast2a-avt-0068-euttp\\u002F7342789910329294881~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=eb6a28c7&x-expires=1757314800&x-signature=XeuY+J2VT/KKK5VcVOY71z82fgA=&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva",
  "niche": "crypto",
  "avgViews": 0,
  "engagementRate": 0,
  "bio": "Check out our latest collab 👇🏼",
  "language": "fra",
  "lastScrapedAt": "2025-09-06T07:12:56.570Z"
},
  {
  "handle": "cryptopythonn",
  "profileUrl": "https://www.tiktok.com/@cryptopythonn",
  "followers": 26600,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/cryptopythonn.jpeg",
  "niche": "crypto",
  "avgViews": 222979,
  "engagementRate": 56.92,
  "bio": "Making Money 🖥️💸\\n\\nNUNCA TE ESCRIBIRÉ PRIMERO\\n🚨🚨",
  "language": "uig",
  "lastScrapedAt": "2025-09-06T07:13:38.154Z"
},
  {
  "handle": "conratrades",
  "profileUrl": "https://www.tiktok.com/@conratrades",
  "followers": 39400,
  "avatarUrl": "https://p77-sign-va.tiktokcdn.com/tos-maliva-avt-0068/e6a146f6ab1a6bcdef32a1d2ffe05f44~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=10e3c614&x-expires=1757314800&x-signature=Pv09ZMb6hLp17+Z9z3OsMJOn1RQ=&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva",
  "niche": "crypto",
  "avgViews": 0,
  "engagementRate": 0,
  "bio": "day trader",
  "language": "glg",
  "lastScrapedAt": "2025-09-06T07:14:19.793Z"
},
  {
  "handle": "kingofcryptoofficial",
  "profileUrl": "https://www.tiktok.com/@kingofcryptoofficial",
  "followers": 23200,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/kingofcryptoofficial.jpeg",
  "niche": "crypto",
  "avgViews": 20564,
  "engagementRate": 5.73,
  "bio": "FOR PERSONAL TRADE CONTACE ME\\nKINGS OFFICIAL\\n+923136057883",
  "language": "cat",
  "lastScrapedAt": "2025-09-06T07:14:53.474Z"
},
  {
  "handle": "soyvelez_",
  "profileUrl": "https://www.tiktok.com/@soyvelez_",
  "followers": 21500,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/soyvelez_.jpeg",
  "niche": "crypto",
  "avgViews": 1981,
  "engagementRate": 0.63,
  "bio": "IG: Soyvelez_",
  "language": "nob",
  "lastScrapedAt": "2025-09-06T07:15:23.641Z"
},
  {
  "handle": "fabianoguillentiktok",
  "profileUrl": "https://www.tiktok.com/@fabianoguillentiktok",
  "followers": 38300,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/fabianoguillentiktok.jpeg",
  "niche": "crypto",
  "avgViews": 77689,
  "engagementRate": 18.24,
  "bio": "• FABIANO   GUILLEN •\\nStand Up Comedy🇵🇦 Made in Braza 🇧🇷\\nShows ⤵️",
  "language": "nds",
  "lastScrapedAt": "2025-09-06T07:16:02.998Z"
},
  {
  "handle": "degenali.crypto",
  "profileUrl": "https://www.tiktok.com/@degenali.crypto",
  "followers": 30400,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/degenali.crypto.jpeg",
  "niche": "crypto",
  "avgViews": 2621,
  "engagementRate": 0.22,
  "bio": "Libre  en crypto depuis 2022 \\n⚡ La stratégie que j’utilise pour 2025👇",
  "language": "fra",
  "lastScrapedAt": "2025-09-06T07:16:33.034Z"
},
  {
  "handle": "luisfossatidrop",
  "profileUrl": "https://www.tiktok.com/@luisfossatidrop",
  "followers": 42600,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/luisfossatidrop.jpeg",
  "niche": "crypto",
  "avgViews": 18597,
  "engagementRate": 0.87,
  "bio": "Te enseño a vender por internet sin experiencia en mi Instagram 🤝",
  "language": "spa",
  "lastScrapedAt": "2025-09-06T07:17:17.326Z"
},
  {
  "handle": "cryptobruj",
  "profileUrl": "https://www.tiktok.com/@cryptobruj",
  "followers": 39700,
  "avatarUrl": "https:\\u002F\\u002Fp19-common-sign-useastred.tiktokcdn-eu.com\\u002Ftos-useast2a-avt-0068-euttp\\u002F187b1f48b8ff9e76b91d82da2639b98e~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=278ec84f&x-expires=1757314800&x-signature=Jf/DCUPpypmxljjZo5wcIrpf6qg=&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva",
  "niche": "crypto",
  "avgViews": 7005,
  "engagementRate": 1.11,
  "bio": "Entra a 📎 www.cryptobruj.com 📎 y accede al Trading Hub GRATIS!",
  "language": "spa",
  "lastScrapedAt": "2025-09-06T07:18:18.752Z"
},
  {
  "handle": "rivan950",
  "profileUrl": "https://www.tiktok.com/@rivan950",
  "followers": 28000,
  "avatarUrl": "https://p19-common-sign-useastred.tiktokcdn-eu.com/tos-useast2a-avt-0068-giso/5ccc5373f6e34cc2cfb3dadae94f41ac~tplv-tiktokx-cropcenter:720:720.jpeg?dr=14579&refresh_token=4e0da6e1&x-expires=1757314800&x-signature=eGn+qcjuK0SrkPUYgCIrsrO3ygM=&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva",
  "niche": "crypto",
  "avgViews": 703,
  "engagementRate": 0.08,
  "bio": "184542848",
  "language": "und",
  "lastScrapedAt": "2025-09-06T07:18:54.018Z"
},
  {
  "handle": "juanma.cripto",
  "profileUrl": "https://www.tiktok.com/@juanma.cripto",
  "followers": 15900,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/juanma.cripto.jpeg",
  "niche": "crypto",
  "avgViews": 1686,
  "engagementRate": 0.71,
  "bio": "CRIPTO 📘 Autor del libro ABC Cripto \\u002F No contacto a Nadie⚠️ \\u002F Mis Redes 👇",
  "language": "glg",
  "lastScrapedAt": "2025-09-06T07:19:23.645Z"
},
  {
  "handle": "santiscali",
  "profileUrl": "https://www.tiktok.com/@santiscali",
  "followers": 79800,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/santiscali.jpeg",
  "niche": "crypto",
  "avgViews": 2751286,
  "engagementRate": 98.59,
  "bio": "Santino Scali | Finanzas e Inversiones\\nCreá tu cuenta acá y dm para el curso👇🏽",
  "language": "spa",
  "lastScrapedAt": "2025-09-06T07:19:53.970Z"
},
  {
  "handle": "carohodl",
  "profileUrl": "https://www.tiktok.com/@carohodl",
  "followers": 17100,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/carohodl.jpeg",
  "niche": "crypto",
  "avgViews": 81030,
  "engagementRate": 51.17,
  "bio": "ÚNICAS CUENTAS☝🏼\\nMeto humor a veces. \\nSeguime en ig para más contenido cripto📈",
  "language": "glg",
  "lastScrapedAt": "2025-09-06T07:20:23.104Z"
},
  {
  "handle": "top_cryptos_666",
  "profileUrl": "https://www.tiktok.com/@top_cryptos_666",
  "followers": 11500,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/top_cryptos_666.jpeg",
  "niche": "crypto",
  "avgViews": 64778,
  "engagementRate": 4.88,
  "bio": "I may overreact sometimes but i don't Promote scams ! next 1000X+ down below ↙️",
  "language": "rmn",
  "lastScrapedAt": "2025-09-06T07:20:53.687Z"
},
  {
  "handle": "lean.r1",
  "profileUrl": "https://www.tiktok.com/@lean.r1",
  "followers": 66300,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/lean.r1.jpeg",
  "niche": "crypto",
  "avgViews": 1252669,
  "engagementRate": 101,
  "bio": "▪️Trader AUDITADO\\n🚫ANTIHUMO \\n👇🏻Seguime en INSTAGRAM 👇🏻",
  "language": "glg",
  "lastScrapedAt": "2025-09-06T07:21:32.711Z"
},
  {
  "handle": "arabscrypto",
  "profileUrl": "https://www.tiktok.com/@arabscrypto",
  "followers": 65100,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/arabscrypto.jpeg",
  "niche": "crypto",
  "avgViews": 25030,
  "engagementRate": 1.04,
  "bio": "🌐Cryptocurrency | عالم العملات الرقمية🌐\\n 💎اكثر من ٨ سنوات خبرة في الاسواق💎",
  "language": "arb",
  "lastScrapedAt": "2025-09-06T07:22:05.147Z"
},
  {
  "handle": "genxrp.news_xrp1",
  "profileUrl": "https://www.tiktok.com/@genxrp.news_xrp1",
  "followers": 10700,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/genxrp.news_xrp1.jpeg",
  "niche": "crypto",
  "avgViews": 5878,
  "engagementRate": 1.51,
  "bio": "Just your Daily Crypto News from my Dad\\nGenXrp 🚀🌑",
  "language": "nds",
  "lastScrapedAt": "2025-09-06T07:23:27.496Z"
},
  {
  "handle": "lapyscom",
  "profileUrl": "https://www.tiktok.com/@lapyscom",
  "followers": 70900,
  "avatarUrl": "https://p77-sign-va.tiktokcdn.com/tos-maliva-avt-0068/0e5bffa0795470db9f4db5d14c14d307~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=f3d2c857&x-expires=1757314800&x-signature=tbwZ57JdkEAuXYy9+lewYa0V6ZA=&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva",
  "niche": "crypto",
  "avgViews": 0,
  "engagementRate": 0,
  "bio": "Criação Video 3D",
  "language": "por",
  "lastScrapedAt": "2025-09-06T07:23:48.149Z"
},
  {
  "handle": "tradingempire.es",
  "profileUrl": "https://www.tiktok.com/@tradingempire.es",
  "followers": 64600,
  "avatarUrl": "https:\\u002F\\u002Fp19-common-sign-useastred.tiktokcdn-eu.com\\u002Ftos-useast2a-avt-0068-euttp\\u002F4c9793cdf57f0e471ca47273e4c6cce1~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=73add8a3&x-expires=1757314800&x-signature=DG4tXrQqAn4i1kUyLOZuRWxkiAs=&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva",
  "niche": "crypto",
  "avgViews": 29860,
  "engagementRate": 2.54,
  "bio": "Nuevas Cripto News 📰\\nCripto Conocimientos 💡\\nÚltimas Top Criptomonedas 🔝",
  "language": "spa",
  "lastScrapedAt": "2025-09-06T07:24:48.817Z"
},
  {
  "handle": "hugobossai",
  "profileUrl": "https://www.tiktok.com/@hugobossai",
  "followers": 37900,
  "avatarUrl": "https:\\u002F\\u002Fp19-common-sign-useastred.tiktokcdn-eu.com\\u002Ftos-useast2a-avt-0068-euttp\\u002F6471eecebd344560f369ca9d866bf73c~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=954048f4&x-expires=1757314800&x-signature=oHR/emB2Fmpa4kIpARRBlTr4pd4=&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva",
  "niche": "crypto",
  "avgViews": 259374,
  "engagementRate": 24.27,
  "bio": "Les vocaux (gratuits) pour réussir ton bullrun crypto👇🏼",
  "language": "fra",
  "lastScrapedAt": "2025-09-06T07:25:23.781Z"
},
  {
  "handle": "thetruckking10c",
  "profileUrl": "https://www.tiktok.com/@thetruckking10c",
  "followers": 13500,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/thetruckking10c.jpeg",
  "niche": "crypto",
  "avgViews": 28917,
  "engagementRate": 24.8,
  "bio": "Every Dent Has A Story. Every Mile Is A Memory.\\nMe And My Truck, We Go Way Back. Crypto guy",
  "language": "eng",
  "lastScrapedAt": "2025-09-06T07:26:05.438Z"
},
  {
  "handle": "siddik_rahat",
  "profileUrl": "https://www.tiktok.com/@siddik_rahat",
  "followers": 41900,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/siddik_rahat.jpeg",
  "niche": "crypto",
  "avgViews": 453237,
  "engagementRate": 86.44,
  "bio": "ᵂᶤᵗʰᵒᵘᵗ ᴳᵒᵈ ᶤᵐ ᶰᵒᵗʰᶤᶰᵍ\\nᴄʀʏᴘᴛᴏ, ɴꜰᴛꜱ & ꜱᴛᴏᴄᴋꜱ ᴛʀᴀᴅᴇʀ|| \\nFree Palestine🇵🇸",
  "language": "fra",
  "lastScrapedAt": "2025-09-06T07:26:56.755Z"
},
  {
  "handle": "inversioneslubru",
  "profileUrl": "https://www.tiktok.com/@inversioneslubru",
  "followers": 71100,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/inversioneslubru.jpeg",
  "niche": "crypto",
  "avgViews": 53550,
  "engagementRate": 5.5,
  "bio": "Pierdo todas las cuentas, seguime\\n👇Empeza Aquí abajo👇",
  "language": "spa",
  "lastScrapedAt": "2025-09-06T07:27:37.725Z"
},
  {
  "handle": "capital_financiero",
  "profileUrl": "https://www.tiktok.com/@capital_financiero",
  "followers": 35600,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/capital_financiero.jpeg",
  "niche": "crypto",
  "avgViews": 76217,
  "engagementRate": 16.8,
  "bio": "Mas contenido de valor en mi IG : edilbertomaciasmx",
  "language": "glg",
  "lastScrapedAt": "2025-09-06T07:28:13.835Z"
},
  {
  "handle": "cryptowewo369",
  "profileUrl": "https://www.tiktok.com/@cryptowewo369",
  "followers": 10300,
  "avatarUrl": "https://tiktokfinder.onrender.com/avatars/cryptowewo369.jpeg",
  "niche": "crypto",
  "avgViews": 111630,
  "engagementRate": 30.73,
  "bio": "Web3 Ecosystem Is LIVE!\\n  🚨🚨🚨🚨\\n        👇My direct inbox link🔗 👇",
  "language": "por",
  "lastScrapedAt": "2025-09-06T07:29:21.394Z"
},
];
