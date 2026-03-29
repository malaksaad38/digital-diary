import mongoose from "mongoose";

// Use a global cached connection to prevent creating new connections on every hot-reload or serverless invocation
let cached = (global as any).__mongoose;

if (!cached) {
    cached = (global as any).__mongoose = { conn: null, promise: null };
}

const connectMongo = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const MONGODB_URI = process.env.MONGODB_URI as string;
        if (!MONGODB_URI) {
            throw new Error("⚠️ Please define MONGODB_URI in .env.local");
        }

        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        }).then((m) => m);
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
};

export default connectMongo;
