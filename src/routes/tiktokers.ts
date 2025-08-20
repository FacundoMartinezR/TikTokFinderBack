import express from 'express';
import Tiktoker from '../models/Tiktoker';

const router = express.Router();

router.get('/', async (req, res) => {
  const { niche, country, gender, minFollowers, maxFollowers, sortBy, page = '1', perPage = '25' } = req.query;
  const q: any = {};
  if (niche) q.niche = niche;
  if (country) q.country = country;
  if (gender) q.gender = gender;
  if (minFollowers || maxFollowers) q.followers = {};
  if (minFollowers) q.followers.$gte = Number(minFollowers);
  if (maxFollowers) q.followers.$lte = Number(maxFollowers);

  const skip = (Number(page) - 1) * Number(perPage);
  let cursor = Tiktoker.find(q).skip(skip).limit(Number(perPage));
  if (sortBy === 'followers') cursor = cursor.sort({ followers: -1 });
  else if (sortBy === 'engagement') cursor = cursor.sort({ engagementRate: -1 });
  const results = await cursor.exec();
  res.json({ ok: true, results });
});

export default router;
