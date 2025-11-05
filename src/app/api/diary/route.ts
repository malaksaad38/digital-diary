import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Diary from "@/models/Diary";
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
    throw error;
  }
}

// --- POST: Create New Diary Entry ---
export async function POST(req: Request) {
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

    const {
      userId,
      date,
      fajrToZuhr,
      zuhrToAsar,
      asarToMaghrib,
      maghribToEsha,
      eshaToFajr,
      customNotes,
      summary
    } = body;

    // ✅ Validate required fields
    if (!userId || !date) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields."
      }, { status: 400 });
    }

    // ✅ Verify the userId matches the authenticated user
    if (userId !== session.user.id) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized - User ID mismatch"
      }, { status: 403 });
    }

    // ✅ Try inserting new diary (unique per userId + date)
    try {
      const diary = await Diary.create({
        userId,
        date,
        fajrToZuhr: fajrToZuhr || "",
        zuhrToAsar: zuhrToAsar || "",
        asarToMaghrib: asarToMaghrib || "",
        maghribToEsha: maghribToEsha || "",
        eshaToFajr: eshaToFajr || "",
        customNotes: customNotes || "",
        summary: summary || "",
      });

      return NextResponse.json({ success: true, data: diary });
    } catch (error: any) {
      // Duplicate date entry
      if (error.code === 11000) {
        return NextResponse.json(
          { success: false, error: "Diary entry for this date already exists." },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error saving diary:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Internal Server Error"
    }, { status: 500 });
  }
}

// --- GET: Fetch All Diaries or Single Diary by Date ---
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
      // Fetch single diary for specific date
      const diary = await Diary.findOne({
        userId: session.user.id,
        date: date
      });

      if (diary) {
        return NextResponse.json({ success: true, data: diary });
      } else {
        return NextResponse.json({ success: false, data: null });
      }
    } else {
      // Fetch all diaries for user
      const diaries = await Diary.find({ userId: session.user.id }).sort({
        date: -1,
      });
      return NextResponse.json({ success: true, data: diaries });
    }
  } catch (error: any) {
    console.error("❌ Error fetching diaries:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// --- PUT: Update Existing Diary Entry ---
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

    const {
      id,
      fajrToZuhr,
      zuhrToAsar,
      asarToMaghrib,
      maghribToEsha,
      eshaToFajr,
      customNotes,
      summary
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Diary ID is required" },
        { status: 400 }
      );
    }

    // Update diary and verify it belongs to the user
    const updatedDiary = await Diary.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      {
        fajrToZuhr: fajrToZuhr || "",
        zuhrToAsar: zuhrToAsar || "",
        asarToMaghrib: asarToMaghrib || "",
        maghribToEsha: maghribToEsha || "",
        eshaToFajr: eshaToFajr || "",
        customNotes: customNotes || "",
        summary: summary || "",
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedDiary) {
      return NextResponse.json(
        { success: false, error: "Diary not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedDiary });
  } catch (error: any) {
    console.error("Error updating diary:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Internal Server Error"
    }, { status: 500 });
  }
}

// --- DELETE: Delete Diary Entry ---
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Diary ID is required" },
        { status: 400 }
      );
    }

    const deletedDiary = await Diary.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!deletedDiary) {
      return NextResponse.json(
        { success: false, error: "Diary not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Diary entry deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting diary:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Internal Server Error"
    }, { status: 500 });
  }
}