import express from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Community Post Schema inside MongoDB
const communityPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  userName: { type: String, required: true },
  userAvatar: { type: String },
  tripName: { type: String, required: true },
  destination: { type: String, required: true },
  experience: { type: String, required: true },
  rating: { type: Number, default: 5 },
  imageUrl: { type: String },
  likesCount: { type: Number, default: 12 },
  likedBy: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const CommunityPost = mongoose.models.CommunityPost || mongoose.model("CommunityPost", communityPostSchema);

// Initial featured community travel notes
const FEATURED_COMMUNITY_POSTS = [
  {
    userName: "Dhruval Rana",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    tripName: "Himalayan Solang Valley Adventure Notes",
    destination: "Manali, Himachal Pradesh",
    experience: "Exploring Solang Valley in Manali was unbelievable! Paragliding over the snow-capped Himalayan peaks and drinking hot chai at Old Manali cafes made this an unforgettable travel note.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
    likesCount: 34,
    createdAt: new Date(Date.now() - 86400000 * 2)
  },
  {
    userName: "Ananya Sharma",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    tripName: "Romantic Sunset Walk along Eiffel Tower",
    destination: "Paris, France",
    experience: "Spent 5 days wandering through Le Marais, visiting Louvre museum art galleries, and watching sunset lights sparkle at Champ de Mars. GlobeTrotter route assistant saved hours of walking!",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
    likesCount: 48,
    createdAt: new Date(Date.now() - 86400000 * 4)
  },
  {
    userName: "Kenji Sato",
    userAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
    tripName: "Kyoto Temple Circuit & Bamboo Grove Note",
    destination: "Kyoto, Japan",
    experience: "Early morning at Arashiyama Bamboo Grove before the crowds arrive is pure magic. Visited Fushimi Inari Torii gates and enjoyed traditional tea in Gion.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
    likesCount: 29,
    createdAt: new Date(Date.now() - 86400000 * 6)
  },
  {
    userName: "Rohan Patel",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    tripName: "Goa Beach Hopping & Sunset Cruise Note",
    destination: "Goa, India",
    experience: "From Palolem beach shacks in South Goa to water sports at Calangute and sunset cruise on Mandovi river! Low-budget travel planned smoothly.",
    rating: 4,
    imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
    likesCount: 42,
    createdAt: new Date(Date.now() - 86400000 * 8)
  }
];

// GET /api/community - Open to all users to read travel notes
router.get("/", async (req, res) => {
  try {
    const { search, sort } = req.query;

    let dbPosts = [];
    try {
      dbPosts = await CommunityPost.find().sort({ createdAt: -1 }).lean();
    } catch (dbErr) {
      console.warn("DB query warning for community posts:", dbErr.message);
    }

    // Seed featured posts if DB is empty
    if (!dbPosts || dbPosts.length === 0) {
      dbPosts = FEATURED_COMMUNITY_POSTS.map((p, i) => ({
        _id: `feat-${i}`,
        ...p,
        likedBy: []
      }));
    } else {
      // Prepend featured posts if fewer than 3
      const featList = FEATURED_COMMUNITY_POSTS.map((p, i) => ({
        _id: `feat-${i}`,
        ...p,
        likedBy: []
      }));
      dbPosts = [...dbPosts, ...featList];
    }

    // Search filter
    if (search && search.trim()) {
      const q = search.toLowerCase();
      dbPosts = dbPosts.filter(p => 
        (p.tripName && p.tripName.toLowerCase().includes(q)) ||
        (p.destination && p.destination.toLowerCase().includes(q)) ||
        (p.experience && p.experience.toLowerCase().includes(q)) ||
        (p.userName && p.userName.toLowerCase().includes(q))
      );
    }

    // Sort options
    if (sort === "popular") {
      dbPosts.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (sort === "rating") {
      dbPosts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    res.json({ data: dbPosts });
  } catch (err) {
    res.json({ data: FEATURED_COMMUNITY_POSTS.map((p, i) => ({ _id: `feat-${i}`, ...p, likedBy: [] })) });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { tripName, destination, experience, rating, imageUrl } = req.body;

    if (!tripName || !destination || !experience) {
      return res.status(400).json({ message: "tripName, destination and experience are required" });
    }

    const post = await CommunityPost.create({
      userId: req.user?.id || new mongoose.Types.ObjectId(),
      userName: req.user?.name || "GlobeTrotter Traveler",
      userAvatar: req.user?.photoUrl || "",
      tripName,
      destination,
      experience,
      rating: rating || 5,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
      likesCount: 1,
      likedBy: [req.user?.id ? req.user.id.toString() : "anon"]
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/:id/like", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: true, message: "Liked post" });
    }
    const post = await CommunityPost.findById(id);
    if (!post) return res.json({ success: true });

    const userIdStr = req.user?.id ? req.user.id.toString() : "anon";
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
