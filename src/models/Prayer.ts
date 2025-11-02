import mongoose from "mongoose";

const PrayerSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
  fajr: {type: String, required: true},
  zuhr: {type: String, required: true},
  asar: {type: String, required: true},
  maghrib: {type: String, required: true},
  esha: {type: String, required: true},

  recite: {type: String},
  zikr: {type: Boolean },
},
  { timestamps: true }
);

export default mongoose.models.Prayer || mongoose.model('Prayer', PrayerSchema)