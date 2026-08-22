import mongoose from "mongoose"

const schema = mongoose.Schema

const Activity = new schema({

  cityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City",
    required: true
  },

  name: {
    type: String,
    required: true
  },

  category: {
    type: String,
    enum: ["sightseeing", "food", "adventure", "culture", "other"],
    required: true
  },

  cost: {
    type: Number,
    required: true
  },

  durationMinutes: {
    type: Number,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  imageUrl: {
    type: String
  }

}, { timestamps: true })

export const activityModel = mongoose.model("activity", Activity)