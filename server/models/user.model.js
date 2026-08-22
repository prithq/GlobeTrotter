import mongoose from "mongoose"

const schema = mongoose.Schema

const User = new schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    unique: true,
    required: true
  },

  passwordHash: {
    type: String,
    required: true
  },

  photoUrl: {
    type: String
  },

  languagePref: {
    type: String,
    default: "en"
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  savedDestinations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "City"
  }]

}, { timestamps: true })

export const userModel = mongoose.model("user", User)