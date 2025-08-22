// src/routes/tiktokers.ts
import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/tiktokers", async (req, res) => {
  try {
    const {
      niche,
      country,
      minFollowers,
      maxFollowers,
      sortBy = "followers:desc",
      page = "1",
      perPage = "25",
    } = req.query;

    const take = Number(perPage) || 25;
    const skip = (Number(page) - 1) * take;

    const where: any = {};
    if (niche) where.niches = { has: niche };
    if (country) where.country = country;
    if (minFollowers || maxFollowers) where.followers = {};
    if (minFollowers) where.followers.gte = Number(minFollowers);
    if (maxFollowers) where.followers.lte = Number(maxFollowers);

    let orderBy: any = {};
    if (typeof sortBy === "string") {
      const [field, dir] = sortBy.split(":");
      orderBy[field] = dir === "1" ? "asc" : "desc";
    }

    const [results, total] = await Promise.all([
      prisma.tiktoker.findMany({ where, skip, take, orderBy }),
      prisma.tiktoker.count({ where }),
    ]);

    res.json({ ok: true, results, total });
  } catch (err) {
    console.error("Error fetching tiktokers:", err);
    res.status(500).json({ ok: false, error: "server_error", details: `${err}` });
  }
});

export default router;
