"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/tiktokers.ts
const express_1 = __importDefault(require("express"));
const Tiktoker_1 = __importDefault(require("../models/Tiktoker")); // tu modelo Mongoose
const router = express_1.default.Router();
router.get("/", async (req, res) => {
    try {
        // Query params
        const { niche, country, gender, minFollowers, maxFollowers, sortBy = "followers", page = "1", perPage = "25", } = req.query;
        const pageNum = Math.max(1, Number(page) || 1);
        const perPageNum = Math.max(1, Math.min(200, Number(perPage) || 25));
        const skip = (pageNum - 1) * perPageNum;
        // Build Mongo query
        const q = {};
        if (niche)
            q.niches = { $in: Array.isArray(niche) ? niche : [String(niche)] };
        if (country)
            q.country = String(country);
        if (gender)
            q.gender = String(gender);
        if (minFollowers || maxFollowers) {
            q.followers = {};
            if (minFollowers)
                q.followers.$gte = Number(minFollowers);
            if (maxFollowers)
                q.followers.$lte = Number(maxFollowers);
        }
        // Sort
        let sort = { followers: -1 }; // default
        if (String(sortBy).toLowerCase().includes("engagement"))
            sort = { engagementRate: -1 };
        else if (String(sortBy).toLowerCase().includes("followers"))
            sort = { followers: -1 };
        // Query total + results
        const [total, results] = await Promise.all([
            Tiktoker_1.default.countDocuments(q),
            Tiktoker_1.default.find(q)
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
    }
    catch (err) {
        console.error("[/api/tiktokers] error:", err);
        return res.status(500).json({ ok: false, error: "server_error", details: `${err}` });
    }
});
exports.default = router;
