import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export async function connectDB() {
  try {
    mongoose.connection.on("connected", () => console.log("DB Connected"));
    await mongoose.connect(process.env.MONGODB + "/pingUP", {});
  } catch (error) {
    console.error(" DB Connection Error:", error.message);
    process.exit(1);
  }
}
