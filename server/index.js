import express from "express"
import mongoose from "mongoose";
import dotenv from "dotenv";

const app=express()

const PORT = process.env.PORT || 8000;
const MONGODB_URL = process.env.MONGODB_URL;


dotenv.config();


app.use(express.json())

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))

app.get("/health",(req,res)=>{
    res.send("working")
})
app.use(8000)




mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB. Check your MONGODB_URL in .env");
    console.error("Error details:", err.message);
    process.exit(1);
  });


  export default app
