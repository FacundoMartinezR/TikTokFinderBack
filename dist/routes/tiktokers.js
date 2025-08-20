"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Tiktoker_1 = __importDefault(require("../models/Tiktoker"));
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    const { niche, country, gender, minFollowers, maxFollowers, sortBy, page = '1', perPage = '25' } = req.query;
    const q = {};
    if (niche)
        q.niche = niche;
    if (country)
        q.country = country;
    if (gender)
        q.gender = gender;
    if (minFollowers || maxFollowers)
        q.followers = {};
    if (minFollowers)
        q.followers.$gte = Number(minFollowers);
    if (maxFollowers)
        q.followers.$lte = Number(maxFollowers);
    const skip = (Number(page) - 1) * Number(perPage);
    let cursor = Tiktoker_1.default.find(q).skip(skip).limit(Number(perPage));
    if (sortBy === 'followers')
        cursor = cursor.sort({ followers: -1 });
    else if (sortBy === 'engagement')
        cursor = cursor.sort({ engagementRate: -1 });
    const results = await cursor.exec();
    res.json({ ok: true, results });
});
exports.default = router;
