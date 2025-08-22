"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/tiktokers.ts
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
router.get("/tiktokers", async (req, res) => {
    try {
        const { niche, country, minFollowers, maxFollowers, sortBy = "followers:desc", page = "1", perPage = "25", } = req.query;
        const take = Number(perPage) || 25;
        const skip = (Number(page) - 1) * take;
        const where = {};
        if (niche)
            where.niches = { has: niche };
        if (country)
            where.country = country;
        if (minFollowers || maxFollowers)
            where.followers = {};
        if (minFollowers)
            where.followers.gte = Number(minFollowers);
        if (maxFollowers)
            where.followers.lte = Number(maxFollowers);
        let orderBy = {};
        if (typeof sortBy === "string") {
            const [field, dir] = sortBy.split(":");
            orderBy[field] = dir === "1" ? "asc" : "desc";
        }
        const [results, total] = await Promise.all([
            prisma.tiktoker.findMany({ where, skip, take, orderBy }),
            prisma.tiktoker.count({ where }),
        ]);
        res.json({ ok: true, results, total });
    }
    catch (err) {
        console.error("Error fetching tiktokers:", err);
        res.status(500).json({ ok: false, error: "server_error", details: `${err}` });
    }
});
exports.default = router;
