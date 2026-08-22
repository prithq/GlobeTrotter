import express from "express";
import mongoose from "mongoose";
import { userModel } from "../models/user.model.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await userModel.findById(id).select("-passwordHash -resetPasswordToken -resetPasswordExpires");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (id !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own profile" });
    }

    const allowedFields = ["name", "photoUrl", "languagePref"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const user = await userModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-passwordHash -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (id !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own account" });
    }

    const user = await userModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Account deleted", id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;