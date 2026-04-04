import mongoose from "mongoose";

const getRecitedParah = (recite?: string | number): number => {
  if (typeof recite === "number") {
    return Number.isFinite(recite) ? Math.max(recite, 0) : 0;
  }

  if (typeof recite !== "string" || !recite.trim()) return 0;

  const numericPart = Number.parseFloat(recite.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(numericPart)) return 0;

  return Math.max(numericPart, 0);
};

const PrayerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: String, required: true }, // YYYY-MM-DD format
    fajr: { type: String, required: false },
    zuhr: { type: String, required: false },
    asar: { type: String, required: false },
    maghrib: { type: String, required: false },
    esha: { type: String, required: false },
    additionalNotes: { type: String, required: false },
    recite: { type: String },
    recitedParah: { type: Number, default: 0 },
    zikr: { type: String },
  },
  { timestamps: true },
);

PrayerSchema.pre("save", function updateRecitedParahOnSave(next) {
  this.recitedParah = getRecitedParah(this.recite);
  next();
});

PrayerSchema.pre("findOneAndUpdate", function updateRecitedParahOnUpdate(next) {
  const update = this.getUpdate() as Record<string, unknown> | undefined;
  if (!update) return next();

  const setUpdate = update.$set as Record<string, unknown> | undefined;
  const reciteValue = update.recite ?? setUpdate?.recite;
  if (reciteValue === undefined) return next();

  const recitedParah = getRecitedParah(reciteValue);
  if (setUpdate) {
    setUpdate.recitedParah = recitedParah;
    update.$set = setUpdate;
  } else {
    update.recitedParah = recitedParah;
  }

  this.setUpdate(update);
  next();
});

PrayerSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.Prayer || mongoose.model("Prayer", PrayerSchema);
