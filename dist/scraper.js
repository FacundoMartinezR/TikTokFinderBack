"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/scraper.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const playwright_1 = require("playwright");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const franc_1 = require("franc");
const API_DELAY_MS = Number(process.env.API_DELAY_MS || 900);
const MAX_CONCURRENCY = Number(process.env.MAX_CONCURRENCY || 2);
const MAX_VIDEOS_PER_PROFILE = Number(process.env.MAX_VIDEOS_PER_PROFILE || 6);
const HEADLESS = process.env.HEADLESS === "true";
const FOLLOWERS_MIN = Number(process.env.FOLLOWERS_MIN || 10000);
const FOLLOWERS_MAX = Number(process.env.FOLLOWERS_MAX || 80000);
const BACKEND_BASE = (process.env.BACKEND_BASE || "https://tiktokfinder.onrender.com").replace(/\/$/, "");
const MAX_HANDLES_PER_TAG = Number(process.env.MAX_HANDLES_PER_TAG || 150);
const PROXY = process.env.PROXY || "";
const GEO_LAT = process.env.GEO_LAT ? parseFloat(process.env.GEO_LAT) : undefined;
const GEO_LONG = process.env.GEO_LONG ? parseFloat(process.env.GEO_LONG) : undefined;
const LOCALE = process.env.LOCALE || undefined; // e.g. "en-US"
const TIMEZONE = process.env.TIMEZONE || undefined; // e.g. "America/New_York"
const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Safari/605.1.15",
];
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
function parseCount(txt) {
    if (txt === undefined || txt === null)
        return 0;
    let s = String(txt).replace(/\s+/g, "").replace(/\u00A0/g, "");
    const m = s.match(/^([\d,.]+)([KMkmB])?$/);
    if (!m) {
        const plain = s.replace(/[^\d]/g, "");
        const n = Number(plain);
        return isNaN(n) ? 0 : n;
    }
    let num = parseFloat(m[1].replace(/,/g, ""));
    const suf = (m[2] || "").toUpperCase();
    if (suf === "K")
        return Math.round(num * 1000);
    if (suf === "M")
        return Math.round(num * 1000000);
    if (suf === "B")
        return Math.round(num * 1000000000);
    return Math.round(num);
}
// ---------- avatar helpers ----------
function cleanAvatarUrlKeepQuery(raw) {
    if (!raw)
        return null;
    let u = String(raw).replace(/&amp;/g, "&").trim();
    try {
        u = decodeURIComponent(u);
    }
    catch (e) { /* ignore */ }
    if (!u.startsWith("http"))
        return null;
    return u;
}
function sanitizeKeepDot(handle) {
    // keep dot allowed (miguel.fm), replace other unsafe chars with underscore
    return String(handle).trim().replace(/[^a-zA-Z0-9._-]/g, "_");
}
/**
 * Save a single file named exactly <handle>.jpeg inside public/avatars.
 * Returns '/avatars/<handle>.jpeg' or null.
 * Note: we always name the file <handle>.jpeg to match frontend expectations.
 */
async function downloadAndCacheAvatar(context, avatarUrl, handle) {
    try {
        const avatarsDir = path_1.default.join(process.cwd(), "public", "avatars");
        if (!fs_1.default.existsSync(avatarsDir))
            fs_1.default.mkdirSync(avatarsDir, { recursive: true });
        const filename = `${sanitizeKeepDot(handle)}.jpeg`;
        const filepath = path_1.default.join(avatarsDir, filename);
        // If already exists return immediately
        if (fs_1.default.existsSync(filepath))
            return `/avatars/${filename}`;
        // Try Playwright API request first (shares context)
        let buffer = null;
        try {
            // @ts-ignore
            if (context.request && typeof context.request.get === "function") {
                const resp = await context.request.get(avatarUrl, { timeout: 30000 });
                if (resp && resp.ok && resp.ok()) {
                    buffer = await resp.body();
                }
            }
        }
        catch (e) {
            buffer = null;
        }
        if (!buffer) {
            // fallback to node http/https
            buffer = await new Promise((resolve, reject) => {
                const client = avatarUrl.startsWith("https") ? https_1.default : http_1.default;
                const req = client.get(avatarUrl.replace(/&amp;/g, "&"), (res) => {
                    if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                        res.resume();
                        return reject(new Error(`avatar download failed status ${res.statusCode}`));
                    }
                    const chunks = [];
                    res.on("data", (c) => chunks.push(Buffer.from(c)));
                    res.on("end", () => resolve(Buffer.concat(chunks)));
                });
                req.on("error", (err) => reject(err));
                req.setTimeout(20000, () => {
                    // @ts-ignore
                    req.abort && req.abort();
                    reject(new Error("avatar download timeout"));
                });
            });
        }
        // write the file exactly as <handle>.jpeg
        fs_1.default.writeFileSync(filepath, buffer);
        return `/avatars/${filename}`;
    }
    catch (err) {
        console.warn("[avatar] error downloading avatar:", err);
        return null;
    }
}
// ---------- seed writer ----------
const SEED_PATH = path_1.default.join(process.cwd(), "prisma", "recienscrapeados.ts");
if (!fs_1.default.existsSync(SEED_PATH)) {
    fs_1.default.writeFileSync(SEED_PATH, `// Auto-generated by scraper\nexport const influencers = [\n`, "utf8");
}
function appendToSeed(obj) {
    const line = "  " + JSON.stringify(obj, (_k, v) => (v === undefined ? null : v), 2) + ",\n";
    fs_1.default.appendFileSync(SEED_PATH, line, "utf8");
}
function finalizeSeedFile() {
    fs_1.default.appendFileSync(SEED_PATH, `];\n`, "utf8");
}
// ---------- SIGI_STATE helper ----------
function extractSigiState(html) {
    const reIdScript = /<script[^>]*id=["']SIGI_STATE["'][^>]*>([\s\S]*?)<\/script>/i;
    let m = html.match(reIdScript);
    if (m) {
        try {
            return JSON.parse(m[1]);
        }
        catch { }
    }
    const reWindow = /window\[['"]SIGI_STATE['"]\]\s*=\s*({[\s\S]*?});/;
    m = html.match(reWindow);
    if (m) {
        try {
            return JSON.parse(m[1]);
        }
        catch { }
    }
    return null;
}
// ---------- video stat extractor (fallback) ----------
function extractVideoStatsFromHtml(html) {
    let play = 0, like = 0, comment = 0, share = 0, followers = 0;
    const statsRegex = /"stats"\s*:\s*({[\s\S]*?})/;
    const sMatch = html.match(statsRegex);
    if (sMatch) {
        try {
            const statsObj = JSON.parse(sMatch[1]);
            play = parseCount(statsObj.playCount ?? statsObj.play_count ?? statsObj.plays ?? 0);
            like = parseCount(statsObj.diggCount ?? statsObj.digg_count ?? statsObj.likeCount ?? 0);
            comment = parseCount(statsObj.commentCount ?? statsObj.comment_count ?? 0);
            share = parseCount(statsObj.shareCount ?? statsObj.share_count ?? 0);
        }
        catch { }
    }
    const authRegex = /"authorStats"\s*:\s*({[\s\S]*?})/;
    const aMatch = html.match(authRegex);
    if (aMatch) {
        try {
            const aobj = JSON.parse(aMatch[1]);
            followers = parseCount(aobj.followerCount ?? aobj.follower_count ?? aobj.followers ?? 0);
        }
        catch { }
    }
    if (!play) {
        const p = html.match(/"playCount"\s*:\s*([0-9,.KMkm]+)/);
        if (p)
            play = parseCount(p[1]);
    }
    if (!like) {
        const l = html.match(/"diggCount"\s*:\s*([0-9,.KMkm]+)/) || html.match(/"likeCount"\s*:\s*([0-9,.KMkm]+)/);
        if (l)
            like = parseCount(l[1]);
    }
    if (!comment) {
        const c = html.match(/"commentCount"\s*:\s*([0-9,.KMkm]+)/);
        if (c)
            comment = parseCount(c[1]);
    }
    if (!share) {
        const s = html.match(/"shareCount"\s*:\s*([0-9,.KMkm]+)/);
        if (s)
            share = parseCount(s[1]);
    }
    if (!play) {
        const tv = html.replace(/\s+/g, " ").match(/([0-9,.KMkm]+)\s*views/i);
        if (tv)
            play = parseCount(tv[1]);
    }
    if (!like) {
        const tl = html.replace(/\s+/g, " ").match(/([0-9,.KMkm]+)\s*likes/i);
        if (tl)
            like = parseCount(tl[1]);
    }
    return { play, like, comment, share, followers };
}
// ---------- pinned detection ----------
function getPinnedIdsFromProfileHtml(html) {
    const pinned = new Set();
    // 1) badge div detection (data-e2e="video-card-badge")
    const badgeRe = /<div[^>]*data-e2e=["']video-card-badge["'][^>]*>([\s\S]*?)<\/div>/gi;
    let bm;
    while ((bm = badgeRe.exec(html)) !== null) {
        const idx = bm.index;
        const start = Math.max(0, idx - 1500);
        const end = Math.min(html.length, idx + 1500);
        const window = html.slice(start, end);
        const anchorMatch = window.match(/\/@[\w.-]+\/video\/(\d+)/i);
        if (anchorMatch)
            pinned.add(anchorMatch[1]);
        else {
            const idMatch = window.match(/"id"\s*:\s*"?(\d{6,})"?/);
            if (idMatch)
                pinned.add(idMatch[1]);
        }
    }
    // 2) anchor + pinned badge closeness
    const anchorWithPinnedRe = /\/@[\w.-]+\/video\/(\d+)[\s\S]{0,400}?<div[^>]*data-e2e=["']video-card-badge["'][^>]*>[\s\S]*?Pinned/i;
    let am;
    while ((am = anchorWithPinnedRe.exec(html)) !== null) {
        pinned.add(am[1]);
    }
    // 3) enable_profile_pinned_video heuristic
    const enableRe = /"enable_profile_pinned_video"\s*:\s*\{([\s\S]*?)\}/i;
    const eMatch = html.match(enableRe);
    if (eMatch) {
        const area = eMatch[1];
        const numIds = area.match(/\d{6,}/g);
        if (numIds)
            numIds.forEach((id) => pinned.add(id));
        const objEnd = eMatch.index ?? 0;
        const after = html.slice((objEnd + eMatch[0].length), (objEnd + eMatch[0].length + 800));
        const afterIds = after.match(/\d{6,}/g);
        if (afterIds)
            afterIds.forEach((id) => pinned.add(id));
    }
    return pinned;
}
// ---------- browser helpers (non-persistent) ----------
function parseProxyConfig(proxyRaw) {
    if (!proxyRaw)
        return undefined;
    let p = proxyRaw.trim();
    if (!/^[a-zA-Z]+:\/\//.test(p))
        p = "http://" + p;
    try {
        const u = new URL(p);
        const server = `${u.protocol}//${u.hostname}${u.port ? ":" + u.port : ""}`;
        const username = u.username || undefined;
        const password = u.password || undefined;
        return { server, username, password };
    }
    catch (e) {
        return undefined;
    }
}
async function openContext() {
    const proxyCfg = parseProxyConfig(PROXY);
    const launchOpts = { headless: HEADLESS };
    if (proxyCfg) {
        launchOpts.proxy = {
            server: proxyCfg.server,
            username: proxyCfg.username,
            password: proxyCfg.password,
        };
        console.log("[scraper] using proxy:", proxyCfg.server);
    }
    const browser = await playwright_1.chromium.launch(launchOpts);
    const contextOpts = {
        userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
        locale: LOCALE,
        timezoneId: TIMEZONE,
    };
    if (typeof GEO_LAT === "number" && typeof GEO_LONG === "number" && !isNaN(GEO_LAT) && !isNaN(GEO_LONG)) {
        contextOpts.geolocation = { latitude: GEO_LAT, longitude: GEO_LONG };
        // NOTE: to use geolocation in some browsers you may need to grant permission later
    }
    // Set Accept-Language header so TikTok serves content in desired language
    if (LOCALE)
        contextOpts.extraHTTPHeaders = { "accept-language": LOCALE };
    const context = await browser.newContext(contextOpts);
    await context.route("**/*", (route) => {
        const url = route.request().url();
        const block = [".css", "google-analytics", "analytics", "font", "doubleclick"];
        if (block.some((b) => url.includes(b)))
            route.abort();
        else
            route.continue();
    });
    // If geolocation was set, grant permission for geolocation to the origin
    try {
        if (context && context.grantPermissions) {
            if (contextOpts.geolocation) {
                // grant geolocation permission to tiktok domain
                await context.grantPermissions(["geolocation"], { origin: "https://www.tiktok.com" });
            }
        }
    }
    catch (e) {
        // ignore if grantPermissions not supported
    }
    return { browser, context };
}
// ---------- extract handles from hashtag (supports ?lang=...) ----------
async function getHandlesFromHashtag(page, hashtag, maxHandles = MAX_HANDLES_PER_TAG) {
    // allow passing "marketing?lang=en" or "marketing" directly
    let base = hashtag;
    let qs = "";
    const qIdx = hashtag.indexOf("?");
    if (qIdx >= 0) {
        base = hashtag.slice(0, qIdx);
        qs = hashtag.slice(qIdx); // includes leading '?'
    }
    const url = `https://www.tiktok.com/tag/${encodeURIComponent(base)}${qs}`;
    await page.goto(url, { timeout: 60000 });
    await page.waitForTimeout(3000);
    const captcha = await page.$("iframe[src*='captcha'], .captcha-container");
    if (captcha) {
        console.log("⚠️ Captcha detectado en hashtag. Resuélvelo manualmente.");
        await page.waitForFunction(() => !document.querySelector("iframe[src*='captcha'], .captcha-container"), { timeout: 0 });
        console.log("✅ Captcha resuelto, continuando...");
    }
    const handlesSet = new Set();
    const extractFromDom = async () => {
        try {
            const hrefs = await page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('a[href]'));
                return anchors.map(a => a.href);
            });
            for (const href of hrefs) {
                const m = href.match(/\/@([\w.-]+)/);
                if (m) {
                    handlesSet.add(m[1]);
                    if (handlesSet.size >= maxHandles)
                        break;
                }
            }
        }
        catch (e) {
            // ignore
        }
    };
    await extractFromDom();
    const MAX_SCROLLS = 12;
    let scrolls = 0;
    while (handlesSet.size < maxHandles && scrolls < MAX_SCROLLS) {
        scrolls++;
        try {
            await page.evaluate(() => { window.scrollBy(0, window.innerHeight * 1.5); });
        }
        catch (e) { /* ignore */ }
        await page.waitForTimeout(1200 + Math.floor(Math.random() * 1200));
        await extractFromDom();
    }
    console.log(`Found ${handlesSet.size} handles for hashtag ${hashtag} (scrolled ${scrolls} times)`);
    return Array.from(handlesSet);
}
// ---------- scrapeProfile ----------
async function scrapeProfile(context, handle, niche) {
    const page = await context.newPage();
    try {
        const url = `https://www.tiktok.com/@${handle}`;
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
        await page.waitForTimeout(3000);
        let html = await page.content();
        const sigi = extractSigiState(html);
        // ---- user fields ----
        let followers = 0;
        let avatarUrl = null;
        let bio = "";
        // Try SIGI_STATE
        if (sigi && sigi.UserModule) {
            const usersObj = sigi.UserModule.users || sigi.UserModule;
            if (usersObj && typeof usersObj === "object") {
                const tryKeys = [handle, handle.toLowerCase(), handle.replace(/^@/, "")];
                for (const k of tryKeys) {
                    if (usersObj[k]) {
                        const u = usersObj[k];
                        followers = Number(u.followerCount ?? u.follower_count ?? followers) || followers;
                        const cand = u.avatarLarger || u.avatar || u.avatar_medium || u.avatarThumb || null;
                        if (cand)
                            avatarUrl = cleanAvatarUrlKeepQuery(cand);
                        bio = (u.signature ?? u.description ?? bio) || "";
                        break;
                    }
                }
                if (!avatarUrl) {
                    for (const key of Object.keys(usersObj)) {
                        const u = usersObj[key];
                        if (!u)
                            continue;
                        const possibleNames = [
                            u.uniqueId, u.uniqueId?.toLowerCase?.(), u.shortId, u.nickName, u.nickname, u.nickname?.toLowerCase?.(),
                        ].filter(Boolean).map(String);
                        if (possibleNames.includes(handle) || possibleNames.includes(handle.replace(/^_/, ""))) {
                            followers = Number(u.followerCount ?? u.follower_count ?? followers) || followers;
                            const cand = u.avatarLarger || u.avatar || u.avatar_medium || u.avatarThumb || null;
                            if (cand)
                                avatarUrl = cleanAvatarUrlKeepQuery(cand);
                            bio = (u.signature ?? u.description ?? bio) || "";
                            break;
                        }
                    }
                }
            }
        }
        // fallbacks
        if (!avatarUrl) {
            const metaImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
            if (metaImg)
                avatarUrl = cleanAvatarUrlKeepQuery(metaImg[1]);
        }
        if (!avatarUrl) {
            const urlRegex = /https?:\/\/[^\s"'<>]*?(?:tiktokcdn\.com|tiktokv\.com)[^\s"'<>]*?\.(?:jpe?g|png|avif|webp)(?:[^\s"'<>]*)/gi;
            const found = html.match(urlRegex);
            if (found && found.length > 0) {
                const prefer = found.find((u) => /avt|avatar|avatarLarger|avatar_thumb|avatar_medium|cropcenter/i.test(u));
                avatarUrl = cleanAvatarUrlKeepQuery(prefer || found[0]);
            }
        }
        if (!avatarUrl) {
            const anyAvatarRe = /"avatarLarger"\s*:\s*"(https?:[^"]+)"/i;
            const m = html.match(anyAvatarRe);
            if (m)
                avatarUrl = cleanAvatarUrlKeepQuery(m[1]);
        }
        if (!followers) {
            const fMatch = html.match(/"followerCount"\s*:\s*([0-9,.KMkm]+)/);
            if (fMatch)
                followers = parseCount(fMatch[1]);
        }
        if (!bio) {
            const bioMatch = html.match(/"signature"\s*:\s*"(.*?)"/);
            if (bioMatch)
                bio = bioMatch[1].replace(/\\"/g, '"');
        }
        // early filter on followers
        if (!(FOLLOWERS_MIN <= followers && followers <= FOLLOWERS_MAX)) {
            console.log(`[${handle}] ❌ Skip (followers=${followers})`);
            await page.close();
            return null;
        }
        // Attempt to download avatar and cache locally -> absolute URL
        let finalAvatarUrl = null;
        if (avatarUrl) {
            const downloaded = await downloadAndCacheAvatar(context, avatarUrl, handle);
            if (downloaded) {
                finalAvatarUrl = `${BACKEND_BASE}${downloaded}`;
                console.log(`[${handle}] avatar cached -> ${finalAvatarUrl}`);
            }
            else {
                finalAvatarUrl = avatarUrl;
                console.log(`[${handle}] avatar download failed; keeping remote URL -> ${avatarUrl}`);
            }
        }
        else {
            console.log(`[${handle}] avatar NOT found`);
        }
        // pinned detection and video collection
        const pinnedIds = getPinnedIdsFromProfileHtml(html);
        if (pinnedIds.size > 0)
            console.log(`[${handle}] pinnedIds detected:`, Array.from(pinnedIds));
        const collected = new Set();
        const collectFromHtml = (h) => {
            const anchorRegex = /\/@[\w.-]+\/video\/(\d+)/g;
            let aMatch;
            while ((aMatch = anchorRegex.exec(h)) !== null && collected.size < MAX_VIDEOS_PER_PROFILE * 3) {
                const id = aMatch[1];
                if (!pinnedIds.has(id))
                    collected.add(id);
            }
        };
        collectFromHtml(html);
        const MAX_SCROLLS = 8;
        let scrolls = 0;
        while (collected.size < MAX_VIDEOS_PER_PROFILE && scrolls < MAX_SCROLLS) {
            scrolls++;
            try {
                await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.3));
            }
            catch { }
            await page.waitForTimeout(1400 + Math.floor(Math.random() * 1000));
            html = await page.content();
            const morePinned = getPinnedIdsFromProfileHtml(html);
            morePinned.forEach((id) => pinnedIds.add(id));
            collectFromHtml(html);
        }
        // final video id list: ensure none pinned
        let videoIds = Array.from(collected).filter((id) => !pinnedIds.has(id)).slice(0, MAX_VIDEOS_PER_PROFILE);
        console.log(`[${handle}] videoIds found (non-pinned):`, videoIds);
        if (videoIds.length === 0) {
            await page.close();
            return {
                handle,
                profileUrl: url,
                followers,
                avatarUrl: finalAvatarUrl || null,
                niche: niche || null,
                avgViews: 0,
                engagementRate: 0,
                bio,
                language: bio ? (typeof franc_1.franc === "function" ? (0, franc_1.franc)(bio) : "und") : "und",
                lastScrapedAt: new Date().toISOString(),
            };
        }
        // open videos and extract stats; skip pinned pages
        const plays = [];
        let totalLikes = 0, totalComments = 0, totalShares = 0;
        for (let i = 0; i < Math.min(videoIds.length, MAX_VIDEOS_PER_PROFILE); i++) {
            const vidId = videoIds[i];
            const vidUrl = `https://www.tiktok.com/@${handle}/video/${vidId}`;
            try {
                const vpage = await context.newPage();
                await vpage.goto(vidUrl, { waitUntil: "domcontentloaded", timeout: 35000 });
                await vpage.waitForTimeout(2200 + Math.floor(Math.random() * 800));
                const vhtml = await vpage.content();
                // Check if this video page itself indicates pinned
                const isPinnedOnPage = /data-e2e=["']video-card-badge["'][^>]*>[\s\S]*?Pinned/i.test(vhtml) ||
                    /"is_pinned"\s*:\s*true/i.test(vhtml) ||
                    /"isPinned"\s*:\s*true/i.test(vhtml);
                if (isPinnedOnPage) {
                    console.log(`[${handle}] video ${vidId} skipped (page-level pinned).`);
                    await vpage.close();
                    continue;
                }
                const vsigi = extractSigiState(vhtml);
                let play = 0, like = 0, comment = 0, share = 0, vidFollowers = 0;
                if (vsigi && vsigi.ItemModule && vsigi.ItemModule[vidId]) {
                    const it = vsigi.ItemModule[vidId];
                    play = parseCount(it.stats?.playCount ?? it.playCount ?? it.play_count ?? it.video?.playCount ?? 0);
                    like = parseCount(it.stats?.diggCount ?? it.diggCount ?? it.stats?.likeCount ?? 0);
                    comment = parseCount(it.stats?.commentCount ?? it.commentCount ?? 0);
                    share = parseCount(it.stats?.shareCount ?? it.shareCount ?? 0);
                }
                else {
                    const parsed = extractVideoStatsFromHtml(vhtml);
                    play = parsed.play;
                    like = parsed.like;
                    comment = parsed.comment;
                    share = parsed.share;
                    vidFollowers = parsed.followers || 0;
                }
                if (vidFollowers && vidFollowers > followers)
                    followers = vidFollowers;
                if (play > 0)
                    plays.push(play);
                totalLikes += like;
                totalComments += comment;
                totalShares += share;
                await vpage.close();
                await sleep(400 + Math.floor(Math.random() * 400));
            }
            catch (err) {
                console.warn(`[${handle}] video ${vidId} -> error reading:`, err);
                try {
                    const pages = context.pages();
                    if (pages.length)
                        await pages[pages.length - 1].close();
                }
                catch { }
            }
        }
        // engagement calculation
        let avgViews = 0;
        let engagementRate = 0;
        const nVideos = plays.length;
        if (nVideos > 0) {
            avgViews = Math.round(plays.reduce((a, b) => a + b, 0) / nVideos);
            const totalEng = totalLikes + totalComments + totalShares;
            if (followers > 0) {
                const perPostEng = totalEng / nVideos;
                engagementRate = Number(((perPostEng / followers) * 100).toFixed(2));
            }
        }
        let language = "und";
        try {
            if (bio && typeof franc_1.franc === "function")
                language = (0, franc_1.franc)(bio) || "und";
        }
        catch { }
        await page.close();
        return {
            handle,
            profileUrl: url,
            followers,
            avatarUrl: finalAvatarUrl || null,
            niche: niche || null,
            avgViews,
            engagementRate,
            bio,
            language,
            lastScrapedAt: new Date().toISOString(),
        };
    }
    catch (err) {
        console.error("❌ Error scraping profile", handle, err);
        try {
            await page.close();
        }
        catch { }
        return null;
    }
}
// ---------- main pipeline ----------
async function runForHashtags(hashtags) {
    const { browser, context } = await openContext();
    const page = await context.newPage();
    console.log("⚠️ Si aparece un CAPTCHA, resuélvelo manualmente en la ventana abierta.");
    console.log("Cuando termines, presiona Enter para continuar...");
    await new Promise((resolve) => process.stdin.once("data", resolve));
    const discovered = new Map();
    for (const tag of hashtags) {
        console.log("Discovering handles for", tag);
        const handles = await getHandlesFromHashtag(page, tag, MAX_HANDLES_PER_TAG);
        handles.forEach((h) => discovered.set(h, tag));
        await sleep(API_DELAY_MS);
    }
    console.log("Total discovered handles:", discovered.size);
    const handlesArr = Array.from(discovered.entries());
    for (let i = 0; i < handlesArr.length; i += MAX_CONCURRENCY) {
        const slice = handlesArr.slice(i, i + MAX_CONCURRENCY);
        for (const [handle, niche] of slice) {
            await sleep(API_DELAY_MS);
            const profile = await scrapeProfile(context, handle, niche);
            if (!profile)
                continue;
            appendToSeed(profile);
            console.log("✅ Saved:", profile.handle, "followers", profile.followers, "ER", profile.engagementRate + "%", "avatar:", profile.avatarUrl);
        }
    }
    await page.close();
    await context.close();
    await browser.close();
    finalizeSeedFile();
}
// Entry
(async () => {
    const tagsStr = process.env.TAGS || "marketing,fitness,food";
    const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
    await runForHashtags(tags);
    console.log("🎉 Done. Data appended to prisma/seed.ts");
})();
