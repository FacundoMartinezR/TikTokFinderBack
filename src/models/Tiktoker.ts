import mongoose, { Schema } from 'mongoose';

const TiktokerSchema = new Schema({
  username: { type: String, required: true, index: true },
  displayName: String,
  bio: String,
  country: String,
  niche: String,
  followers: { type: Number, index: true },
  engagementRate: Number,
  gender: String,
  avgLikes: Number,
  avgComments: Number,
  tags: [String],
  scrapedAt: Date
}, { timestamps: true });

export default mongoose.models.Tiktoker || mongoose.model('Tiktoker', TiktokerSchema);
