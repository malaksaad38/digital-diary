import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import User from "@/models/User";
import Prayer from "@/models/Prayer";
import Diary from "@/models/Diary";

export async function GET() {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const [totalUsers, totalPrayers, totalDiaries] = await Promise.all([
            User.countDocuments(),
            Prayer.countDocuments(),
            Diary.countDocuments(),
        ]);

        return NextResponse.json({
            totalUsers,
            totalPrayers,
            totalDiaries,
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
