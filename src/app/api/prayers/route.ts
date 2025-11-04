import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Prayer from "@/models/Prayer";
import { auth } from "@/auth";

// --- MongoDB Connection ---
const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("⚠️ Please define MONGODB_URI in .env.local");
}

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}

// --- POST: Create New Prayer ---
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { userId, date, fajr, zuhr, asar, maghrib, esha, recite, zikr } = body;

    // ✅ validate required fields
    if (!userId || !date || !fajr || !zuhr || !asar || !maghrib || !esha) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    // ✅ Try inserting new prayer (unique per userId + date)
    try {
      const prayer = await Prayer.create({
        userId,
        date,
        fajr: fajr.toLowerCase(),
        zuhr: zuhr.toLowerCase(),
        asar: asar.toLowerCase(),
        maghrib: maghrib.toLowerCase(),
        esha: esha.toLowerCase(),
        recite: recite?.toLowerCase() || "",
        zikr: zikr?.toLowerCase() || "",
      });

      return NextResponse.json({ success: true, data: prayer });
    } catch (error: any) {
      // Duplicate date entry
      if (error.code === 11000) {
        return NextResponse.json(
          { success: false, error: "Prayer log for this date already exists." },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error saving prayer:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// --- GET: Fetch All Prayers or Single Prayer by Date ---
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if date parameter exists in URL
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (date) {
      // Fetch single prayer for specific date
      const prayer = await Prayer.findOne({
        userId: session.user.id,
        date: date
      });

      if (prayer) {
        return NextResponse.json({ success: true, data: prayer });
      } else {
        return NextResponse.json({ success: false, data: null });
      }
    } else {
      // Fetch all prayers for user
      const prayers = await Prayer.find({ userId: session.user.id }).sort({
        date: -1,
      });
      return NextResponse.json({ success: true, data: prayers });
    }
  } catch (error: any) {
    console.error("❌ Error fetching prayers:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// --- PUT: Update Existing Prayer ---
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();

    const { id, fajr, zuhr, asar, maghrib, esha, recite, zikr } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Prayer ID is required" },
        { status: 400 }
      );
    }

    // ✅ validate required fields
    if (!fajr || !zuhr || !asar || !maghrib || !esha) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    // Update prayer and verify it belongs to the user
    const updatedPrayer = await Prayer.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      {
        fajr: fajr.toLowerCase(),
        zuhr: zuhr.toLowerCase(),
        asar: asar.toLowerCase(),
        maghrib: maghrib.toLowerCase(),
        esha: esha.toLowerCase(),
        recite: recite?.toLowerCase() || "",
        zikr: zikr?.toLowerCase() || "",
      },
      { new: true }
    );

    if (!updatedPrayer) {
      return NextResponse.json(
        { success: false, error: "Prayer not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedPrayer });
  } catch (error: any) {
    console.error("Error updating prayer:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}