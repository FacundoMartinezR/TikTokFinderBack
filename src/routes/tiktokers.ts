// src/routes/tiktokers.ts
import express from "express";
import Tiktoker from "../models/Tiktoker"; // tu modelo Mongoose
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Query params
    const {
      niche,
      country,
      gender,
      minFollowers,
      maxFollowers,
      sortBy = "followers",
      page = "1",
      perPage = "25",
    } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const perPageNum = Math.max(1, Math.min(200, Number(perPage) || 25));
    const skip = (pageNum - 1) * perPageNum;

    // Build Mongo query
    const q: any = {};
    if (niche) q.niches = { $in: Array.isArray(niche) ? niche : [String(niche)] };
    if (country) q.country = String(country);
    if (gender) q.gender = String(gender);

    if (minFollowers || maxFollowers) {
      q.followers = {};
      if (minFollowers) q.followers.$gte = Number(minFollowers);
      if (maxFollowers) q.followers.$lte = Number(maxFollowers);
    }

    // Sort
    let sort: any = { followers: -1 }; // default
    if (String(sortBy).toLowerCase().includes("engagement")) sort = { engagementRate: -1 };
    else if (String(sortBy).toLowerCase().includes("followers")) sort = { followers: -1 };

    // Query total + results
    const [total, results] = await Promise.all([
      Tiktoker.countDocuments(q),
      Tiktoker.find(q)
        .sort(sort)
        .skip(skip)
        .limit(perPageNum)
        .lean()
        .exec(),
    ]);

    return res.json({
      ok: true,
      total,
      page: pageNum,
      perPage: perPageNum,
      results,
    });
  } catch (err) {
    console.error("[/api/tiktokers] error:", err);
    return res.status(500).json({ ok: false, error: "server_error", details: `${err}` });
  }
});

export default router;
