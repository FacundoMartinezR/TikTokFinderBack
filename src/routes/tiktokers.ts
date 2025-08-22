// src/routes/tiktokers.ts
import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

/**
 * Helper parsing
 */
function parseNumber(value: unknown, fallback = undefined): number | undefined {
  if (value === undefined || value === null) return fallback;
  const n = Number(value);
  return Number.isNaN(n) ? fallback : n;
}

function parseBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "boolean") return value;
  const s = String(value).toLowerCase();
  if (["1", "true", "yes"].includes(s)) return true;
  if (["0", "false", "no"].includes(s)) return false;
  return undefined;
}

function parseCSV(value: unknown): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value).split(",").map((s) => s.trim()).filter(Boolean);
}

/**
 * GET /api/tiktokers
 * Query params supported:
 *  - q (search term for name/handle/bio)
 *  - niches (comma separated or repeated)
 *  - country
 *  - minFollowers, maxFollowers
 *  - minEngagement
 *  - minAvgViews
 *  - minPrice, maxPrice
 *  - verified (true/false)
 *  - hasContact (true/false)
 *  - sortBy = followers | engagement | avgViews | price | recent
 *  - order = asc | desc
 *  - page, perPage
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      q,
      niches,
      country,
      minFollowers,
      maxFollowers,
      minEngagement,
      minAvgViews,
      minPrice,
      maxPrice,
      verified,
      hasContact,
      sortBy = "followers",
      order = "desc",
      page = "1",
      perPage = "25",
    } = req.query;

    // Build where object for Prisma
    const where: any = {};

    // search (OR on name, handle, bio)
    const search = q ? String(q).trim() : null;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { handle: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
      ];
    }

    // niches (array)
    const nichesArr = parseCSV(niches);
    if (nichesArr && nichesArr.length > 0) {
      // hasSome -> matches any of the provided niches
      where.niches = { hasSome: nichesArr };
    }

    if (country) where.country = String(country);

    // followers range
    const minF = parseNumber(minFollowers);
    const maxF = parseNumber(maxFollowers);
    if (minF !== undefined || maxF !== undefined) {
      where.followers = {};
      if (minF !== undefined) where.followers.gte = minF;
      if (maxF !== undefined) where.followers.lte = maxF;
    }

    // engagement / views / price
    const minE = parseNumber(minEngagement);
    if (minE !== undefined) where.engagementRate = { gte: minE };

    const minV = parseNumber(minAvgViews);
    if (minV !== undefined) where.avgViews = { gte: minV };

    const minP = parseNumber(minPrice);
    const maxP = parseNumber(maxPrice);
    if (minP !== undefined || maxP !== undefined) {
      where.priceEst = {};
      if (minP !== undefined) where.priceEst.gte = minP;
      if (maxP !== undefined) where.priceEst.lte = maxP;
    }

    // boolean flags
    const ver = parseBoolean(verified);
    if (ver !== undefined) where.verified = ver;

    const hc = parseBoolean(hasContact);
    if (hc === true) where.contact = { not: null };
    if (hc === false) where.contact = null;

    // pagination
    const pageNum = Math.max(1, Number(page) || 1);
    const perPageNum = Math.min(200, Math.max(1, Number(perPage) || 25));
    const skip = (pageNum - 1) * perPageNum;

    // sorting map
    const orderDir = String(order).toLowerCase() === "asc" ? "asc" : "desc";
    let orderBy: any = { followers: "desc" }; // default

    switch (String(sortBy)) {
      case "followers":
        orderBy = { followers: orderDir };
        break;
      case "engagement":
        orderBy = { engagementRate: orderDir };
        break;
      case "avgViews":
        orderBy = { avgViews: orderDir };
        break;
      case "price":
        orderBy = { priceEst: orderDir };
        break;
      case "recent":
        orderBy = { lastScrapedAt: orderDir };
        break;
      default:
        orderBy = { followers: orderDir };
    }

    // total count (for pagination)
    const total = await prisma.tiktoker.count({ where });

    // fetch results
    const items = await prisma.tiktoker.findMany({
      where,
      skip,
      take: perPageNum,
      orderBy,
      select: {
        id: true,
        handle: true,
        name: true,
        avatarUrl: true,
        profileUrl: true,
        country: true,
        niches: true,
        followers: true,
        avgViews: true,
        engagementRate: true,
        priceEst: true,
        verified: true,
        contact: true,
        lastScrapedAt: true,
      },
    });

    res.json({
      ok: true,
      total,
      page: pageNum,
      perPage: perPageNum,
      results: items,
    });
  } catch (err) {
    console.error("Error in /api/tiktokers:", err);
    res.status(500).json({ ok: false, error: "server_error", details: `${err}` });
  }
});

/**
 * GET /api/tiktokers/:id
 * returns full data for one tiktoker
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await prisma.tiktoker.findUnique({
      where: { id },
    });

    if (!item) return res.status(404).json({ ok: false, error: "not_found" });
    res.json({ ok: true, result: item });
  } catch (err) {
    console.error("Error in /api/tiktokers/:id", err);
    res.status(500).json({ ok: false, error: "server_error", details: `${err}` });
  }
});

export default router;
