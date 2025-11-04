import mongoose from "mongoose";

const PrayerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD format
  fajr: { type: String, required: true },
  zuhr: { type: String, required: true },
  asar: { type: String, required: true },
  maghrib: { type: String, required: true },
  esha: { type: String, required: true },
  recite: { type: String }, // stores both custom numeric or named value
  zikr: { type: String },
}, { timestamps: true });

PrayerSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.Prayer || mongoose.model("Prayer", PrayerSchema);
