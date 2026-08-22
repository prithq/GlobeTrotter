import dns from "dns";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

dns.setServers([
  "8.8.8.8",
  "8.8.4.4"
]);

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    const connection = await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log("MongoDB connected successfully");
    console.log("Database:", connection.connection.name);
    console.log("Host:", connection.connection.host);

    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

export default connectDB;