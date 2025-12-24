import mongoose from "mongoose";



export const connectDB = async () => {
  try {
    mongoose.connect("mongodb+srv://theayush434:9qWHVJ5AG5jrakbG@cluster1.yvegg.mongodb.net/AIAgentTicketAssistant");  
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB", error.message);
    process.exit(1);
  }
};