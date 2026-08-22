import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { userModel } from "../models/user.model.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

const communityPostSchema = new mongoose.Schema({
  userId: { type: String, required: false },
  userName: { type: String, required: true },
  userAvatar: { type: String },
  tripName: { type: String, required: true },
  destination: { type: String, required: true },
  experience: { type: String, required: true },
  rating: { type: Number, default: 5 },
  imageUrl: { type: String },
  likesCount: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const CommunityPost = mongoose.models.CommunityPost || mongoose.model("CommunityPost", communityPostSchema);

function getPlaceImageUrl(placeName = "") {
  const p = (placeName || "").toLowerCase().trim();
  if (p.includes("manali") || p.includes("solang") || p.includes("rohtang") || p.includes("hadimba")) return "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800";
  if (p.includes("kasol") || p.includes("parvati")) return "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800";
  if (p.includes("shimla") || p.includes("kullu")) return "https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800";
  if (p.includes("goa")) return "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800";
  if (p.includes("mumbai")) return "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800";
  if (p.includes("gujarat") || p.includes("ahmedabad")) return "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800";
  if (p.includes("bangalore") || p.includes("bengaluru")) return "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800";
  if (p.includes("delhi") || p.includes("agra") || p.includes("taj")) return "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800";
  if (p.includes("jaipur") || p.includes("udaipur") || p.includes("rajasthan")) return "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800";
  if (p.includes("paris")) return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800";
  if (p.includes("tokyo") || p.includes("japan") || p.includes("kyoto")) return "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800";
  if (p.includes("york")) return "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800";
  if (p.includes("london")) return "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800";
  if (p.includes("rome") || p.includes("italy") || p.includes("venice")) return "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800";
  if (p.includes("barcelona") || p.includes("spain")) return "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800";
  if (p.includes("dubai") || p.includes("uae")) return "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800";
  if (p.includes("bali") || p.includes("indonesia")) return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800";
  if (p.includes("singapore")) return "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800";
  return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800";
}

function getAuthUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

router.get("/", async (req, res) => {
  try {
    const { search, sort } = req.query;

    let dbPosts = await CommunityPost.find().sort({ createdAt: -1 }).lean();

    if (search && search.trim()) {
      const q = search.toLowerCase();
      dbPosts = dbPosts.filter(p => 
        (p.tripName && p.tripName.toLowerCase().includes(q)) ||
        (p.destination && p.destination.toLowerCase().includes(q)) ||
        (p.experience && p.experience.toLowerCase().includes(q)) ||
        (p.userName && p.userName.toLowerCase().includes(q))
      );
    }

    if (sort === "popular") {
      dbPosts.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (sort === "rating") {
      dbPosts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    res.json({ data: dbPosts });
  } catch (err) {
    console.error("Fetch community posts error:", err);
    res.json({ data: [] });
  }
});

router.post("/", async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const { tripName, destination, experience, rating, imageUrl, userName, userAvatar } = req.body;

    if (!tripName || !destination || !experience) {
      return res.status(400).json({ message: "tripName, destination and experience are required" });
    }

    // Resolve real user details
    let finalUserName = userName || authUser?.name;
    let finalUserAvatar = userAvatar || authUser?.photoUrl || "";

    if (!finalUserName && authUser?.id) {
      try {
        const u = await userModel.findById(authUser.id).lean();
        if (u) {
          finalUserName = u.name;
          finalUserAvatar = u.photoUrl || "";
        }
      } catch (e) {
        console.warn("User lookup error:", e.message);
      }
    }

    if (!finalUserName) {
      finalUserName = "Traveler";
    }

    const postImg = imageUrl && imageUrl.trim() ? imageUrl.trim() : getPlaceImageUrl(destination || tripName);

    const post = await CommunityPost.create({
      userId: authUser?.id ? authUser.id.toString() : "guest-user",
      userName: finalUserName,
      userAvatar: finalUserAvatar,
      tripName: tripName.trim(),
      destination: destination.trim(),
      experience: experience.trim(),
      rating: Number(rating) || 5,
      imageUrl: postImg,
      likesCount: 0,
      likedBy: []
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("Community post creation error:", err);
    res.status(500).json({ message: err.message || "Failed to post travel note" });
  }
});

router.post("/:id/like", async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: true, message: "Liked post" });
    }

    const post = await CommunityPost.findById(id);
    if (!post) return res.json({ success: true });

    const userIdStr = authUser?.id ? authUser.id.toString() : "anon";
    const alreadyLiked = post.likedBy.includes(userIdStr);

    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter(u => u !== userIdStr);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.likedBy.push(userIdStr);
      post.likesCount += 1;
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.json({ success: true });
  }
});

export default router;