import mongoose from "mongoose"

const schema = mongoose.Schema

const SharedTrip = new schema({

  originalTripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true
  },

  copiedTripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true
  },

  copiedByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

}, { timestamps: true })

export const sharedTripModel = mongoose.model("sharedTrip", SharedTrip)