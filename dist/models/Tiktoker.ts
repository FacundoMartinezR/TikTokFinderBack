// src/models/Tiktoker.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ITiktoker extends Document {
  username: string;
  displayName?: string;
  bio?: string;
  country?: string;
  niche?: string;      // campo singular que tenías
  tags?: string[];     // o array de tags
  followers: number;
  engagementRate?: number;
  avatarUrl?: string;
  scrapedAt?: Date;
}

const TiktokerSchema: Schema = new Schema({
  username: { type: String, required: true, index: true },
  displayName: String,
  bio: String,
  country: String,
  niche: String,
  tags: [String],
  followers: { type: Number, index: true, default: 0 },
  engagementRate: { type: Number, default: 0 },
  gender: String,
  avgLikes: Number,
  avgComments: Number,
  avatarUrl: String,
  scrapedAt: Date
}, { timestamps: true });

// IMPORTANT: third arg forces the exact collection name in MongoDB
export default (mongoose.models.Tiktoker ||
  mongoose.model<ITiktoker>("Tiktoker", TiktokerSchema, "Tiktoker"));
