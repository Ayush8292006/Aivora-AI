import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI || "";
    const uri = rawUri.replace(/^["']|["']$/g, '').trim();
    if (!uri) {
      console.warn("⚠️ MONGODB_URI not found in Agent environment!");
      return;
    }
    await mongoose.connect(uri);
    console.log("Agent DB Connected");
  } catch (error) {
    console.error("Agent Database Connection Error:", error.message);
    setTimeout(connectDb, 5000);
  }
};

export default connectDb;