import mongoose from "mongoose";


const connectMongo = async () => {
    try {
        await mongoose.connect(<string>process.env.MONGODB_URI);
    } catch (e) {
        console.error("❌ Mongoose Error: " + e);
    }
};

export default connectMongo;
