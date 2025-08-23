// src/routes/tiktokers.ts
import express from "express";
import TiktokerModel from "../models/Tiktoker"; // ajusta la ruta si la tienes diferente

const router = express.Router();

/**
 * GET /api/tiktokers
 * Query params:
 *  - niche
 *  - country
 *  - gender
 *  - minFollowers
 *  - maxFollowers
 *  - sortBy = followers|engagement (default followers)
 *  - page, perPage
 */
router.get("/", async (req, res) => {
  try {
    const {
      niche,
      country,
      gender,
      minFollowers,
      maxFollowers,
      sortBy = "followers",
      page = "1",
      perPage = "25"
    } = req.query;

    const q: any = {};

    // Filtrado por niche
    if (niche) {
      const n = String(niche);
      q.$or = [
        { niche: { $regex: n, $options: "i" } },
        { tags: { $in: [new RegExp(`^${escapeRegExp(n)}$`, "i")] } }
      ];
    }

    if (country) q.country = { $regex: String(country), $options: "i" };
    if (gender) q.gender = { $regex: String(gender), $options: "i" };

    if (minFollowers || maxFollowers) {
      q.followers = {};
      if (minFollowers) q.followers.$gte = Number(minFollowers);
      if (maxFollowers) q.followers.$lte = Number(maxFollowers);
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const perPageNum = Math.min(200, Math.max(1, Number(perPage) || 25));
    const skip = (pageNum - 1) * perPageNum;

    // Sorting
    let sortObj: any = { followers: -1 };
    if (String(sortBy).toLowerCase().includes("engag")) {
      sortObj = { engagementRate: -1 };
    }

    const [total, docs] = await Promise.all([
      TiktokerModel.countDocuments(q),
      TiktokerModel.find(q).sort(sortObj).skip(skip).limit(perPageNum).lean()
    ]);

    // Mapear al formato que espera el frontend
    const results = (docs || []).map((d: any) => ({
      id: d._id?.toString?.() ?? d._id,
      handle: d.username?.replace(/^@/, "") ?? "",   // handle limpio sin "@"
      name: d.displayName ?? "",
      avatarUrl: d.avatarUrl ?? "",
      country: d.country ?? "",
      niches: (d.tags && d.tags.length) 
        ? d.tags 
        : (d.niche ? [d.niche] : (d.categories ?? [])),
      followers: Number(d.followers || 0),
      engagementRate: Number(d.engagementRate || 0),
      bio: d.bio ?? "",
      language: d.language ?? "",
      totalLikes: Number(d.totalLikes || 0),
      avgViews: Number(d.avgViews || 0),
      avgLikes: Number(d.avgLikes || 0),
      avgComments: Number(d.avgComments || 0),
      verified: Boolean(d.verified || false),
      contact: d.contact ?? "",
      priceEst: Number(d.priceEst || 0),
      sampleVideos: d.sampleVideos ?? {},
      source: d.source ?? "",
      lastScrapedAt: d.lastScrapedAt ?? null
    }));

    res.json({ ok: true, total, page: pageNum, perPage: perPageNum, results });
  } catch (err) {
    console.error("[/api/tiktokers] error:", err);
    res.status(500).json({ ok: false, error: "server_error", details: String(err) });
  }
});

// helper para regex
function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default router;
