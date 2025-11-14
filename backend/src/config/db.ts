import mongoose from "mongoose";

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || "mongodb://mongo:27017/medicine_db";

  let retries = 5; // Retry 5 times
  while (retries) {
    try {
      await mongoose.connect(mongoURI);
      console.log("✅ MongoDB connected successfully!");
      break;
    } catch (err) {
      console.error("MongoDB connection error:", err);
      retries -= 1;
      console.log(`🔁 Retrying connection... attempts left: ${retries}`);
      await new Promise(res => setTimeout(res, 5000)); // wait 5 seconds before retry
    }
  }

  if (!retries) {
    console.error("❌ Could not connect to MongoDB after multiple retries. Exiting...");
    process.exit(1);
  }
};

export default connectDB;
