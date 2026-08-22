import mongoose from "mongoose"

const schema = mongoose.Schema

const Trip = new schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true
  },

  coverPhotoUrl: {
    type: String
  },

  targetBudget: {
    type: Number,
    default: 0
  },

  isPublic: {
    type: Boolean,
    default: false
  },

  publicSlug: {
    type: String,
    unique: true,
    sparse: true
  },

  stops: [
    {
      cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "City",
        required: true
      },

      cityName: {
        type: String,
        required: true
      },

      orderIndex: {
        type: Number,
        required: true
      },

      startDate: {
        type: Date,
        required: true
      },

      endDate: {
        type: Date,
        required: true
      },

      activities: [
        {
          activityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Activity",
            required: true
          },

          name: {
            type: String,
            required: true
          },

          category: {
            type: String,
            required: true
          },

          scheduledDate: {
            type: Date
          },

          scheduledTime: {
            type: String
          },

          orderIndex: {
            type: Number,
            required: true
          },

          cost: {
            type: Number,
            required: true
          }
        }
      ]
    }
  ],

  expenses: [
    {
      category: {
        type: String,
        enum: ["transport", "stay", "meals", "misc"],
        required: true
      },

      amount: {
        type: Number,
        required: true
      },

      notes: {
        type: String
      },

      stopId: {
        type: mongoose.Schema.Types.ObjectId
      }
    }
  ]

}, { timestamps: true })

export const tripModel = mongoose.model("trip", Trip)