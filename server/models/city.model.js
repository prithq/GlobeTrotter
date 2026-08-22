import mongoose from "mongoose"

const schema = mongoose.Schema

const City = new schema({

  name: {
    type: String,
    required: true
  },

  country: {
    type: String,
    required: true
  },

  region: {
    type: String,
    required: true
  },

  costIndex: {
    type: Number,
    required: true
  },

  popularityScore: {
    type: Number,
    required: true
  },

  imageUrl: {
    type: String
  }

}, { timestamps: true })

export const cityModel = mongoose.model("city", City)