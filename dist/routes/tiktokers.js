"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/tiktokers.ts
const express_1 = __importDefault(require("express"));
const Tiktoker_1 = __importDefault(require("../models/Tiktoker")); // ajusta la ruta si la tienes diferente
const router = express_1.default.Router();
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
        const { niche, country, gender, minFollowers, maxFollowers, sortBy = "followers", page = "1", perPage = "25" } = req.query;
        const q = {};
        // BUSCAR NICHE: soporta array 'niches', 'tags' o campo 'niche' singular
        if (niche) {
            const n = String(niche).trim();
            q.$or = [
                { niches: { $in: [new RegExp(`^${escapeRegExp(n)}$`, "i")] } },
                { tags: { $in: [new RegExp(`^${escapeRegExp(n)}$`, "i")] } },
                { niche: { $regex: n, $options: "i" } },
            ];
        }
        if (country)
            q.country = { $regex: String(country), $options: "i" };
        if (gender)
            q.gender = { $regex: String(gender), $options: "i" };
        if (minFollowers || maxFollowers) {
            q.followers = {};
            if (minFollowers)
                q.followers.$gte = Number(minFollowers);
            if (maxFollowers)
                q.followers.$lte = Number(maxFollowers);
        }
        const pageNum = Math.max(1, Number(page) || 1);
        const perPageNum = Math.min(200, Math.max(1, Number(perPage) || 25));
        const skip = (pageNum - 1) * perPageNum;
        // sort
        let sortObj = { followers: -1 };
        if (String(sortBy).toLowerCase().includes("engag")) {
            sortObj = { engagementRate: -1 };
        }
        else if (String(sortBy).toLowerCase().includes("followers")) {
            sortObj = { followers: -1 };
        }
        const [total, docs] = await Promise.all([
            Tiktoker_1.default.countDocuments(q),
            Tiktoker_1.default.find(q).sort(sortObj).skip(skip).limit(perPageNum).lean()
        ]);
        // mapear al formato que espera el frontend — manejar distintos nombres de campo
        const results = (docs || []).map((d) => {
            const handle = (d.handle || d.username || d._id?.toString?.() || "").toString();
            const normalizedHandle = handle.replace(/^@+/, ""); // quitar '@' si viene incluido
            const niches = Array.isArray(d.niches) && d.niches.length
                ? d.niches
                : Array.isArray(d.tags) && d.tags.length
                    ? d.tags
                    : (d.niche ? [d.niche] : (d.categories ?? []));
            const profileUrl = d.profileUrl || (normalizedHandle ? `https://www.tiktok.com/@${normalizedHandle}` : null);
            return {
                id: d._id?.toString?.() ?? d._id,
                handle: normalizedHandle,
                name: d.name ?? d.displayName ?? "",
                avatarUrl: d.avatarUrl ?? d.avatar ?? "",
                country: d.country ?? "",
                niches,
                followers: Number(d.followers || 0),
                engagementRate: Number(d.engagementRate || 0),
                avgViews: Number(d.avgViews || d.avg_views || 0),
                profileUrl
            };
        });
        res.json({ ok: true, total, page: pageNum, perPage: perPageNum, results });
    }
    catch (err) {
        console.error("[/api/tiktokers] error:", err);
        res.status(500).json({ ok: false, error: "server_error", details: String(err) });
    }
});
// small helper
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
exports.default = router;
