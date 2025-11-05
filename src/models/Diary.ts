import mongoose from "mongoose";

const DiarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: String,
      required: true
    }, // YYYY-MM-DD format
    fajrToZuhr: {
      type: String,
      default: ""
    },
    zuhrToAsar: {
      type: String,
      default: ""
    },
    asarToMaghrib: {
      type: String,
      default: ""
    },
    maghribToEsha: {
      type: String,
      default: ""
    },
    eshaToFajr: {
      type: String,
      default: ""
    },
    customNotes: {
      type: String,
      default: ""
    },
    summary: {
      type: String,
      default: ""
    },
  },
  { timestamps: true }
);

// Ensure unique diary entry per user per date
DiarySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.Diary || mongoose.model("Diary", DiarySchema);