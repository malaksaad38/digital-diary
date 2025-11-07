import mongoose from "mongoose";

const PrayerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD format
  fajr: { type: String, required: false },
  zuhr: { type: String, required: false },
  asar: { type: String, required: false },
  maghrib: { type: String, required: false },
  esha: { type: String, required: false },
  recite: { type: String },
  zikr: { type: String },
}, { timestamps: true });

PrayerSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.Prayer || mongoose.model("Prayer", PrayerSchema);
