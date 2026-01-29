import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import User from "@/models/User";
import { FilterQuery } from "mongoose";

export async function GET(request: Request) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const query: FilterQuery<typeof User> = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }

    try {
        const [users, total] = await Promise.all([
            User.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: "prayers",
                        localField: "_id",
                        foreignField: "userId",
                        as: "prayers",
                    },
                },
                {
                    $lookup: {
                        from: "diaries",
                        localField: "_id",
                        foreignField: "userId",
                        as: "diaries",
                    },
                },
                {
                    $addFields: {
                        prayerCount: { $size: "$prayers" },
                        diaryCount: { $size: "$diaries" },
                    },
                },
                {
                    $project: {
                        prayers: 0,
                        diaries: 0,
                        password: 0,
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
            ]),
            User.countDocuments(query),
        ]);

        return NextResponse.json({
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Admin Users API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
