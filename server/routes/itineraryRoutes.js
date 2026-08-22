import express from "express";
import mongoose from "mongoose";
import { tripModel } from "../models/trip.model.js";
import { requireAuth } from "../middleware/auth.js";
import { estimateTripBudget } from "../utils/budgetEstimator.js";
import { expandDays, buildItinerary } from "../utils/itineraryHelper.js";

const router = express.Router({ mergeParams: true });

router.use(requireAuth);

function buildCalendar(trip) {
  const tripStart = new Date(trip.startDate);
  const calendar = {};

  const stops = [...trip.stops].sort((a, b) => a.orderIndex - b.orderIndex);

  for (const stop of stops) {
    for (const date of expandDays(stop.startDate, stop.endDate)) {
      const dayNumber =
        Math.floor((new Date(date) - tripStart) / (1000 * 60 * 60 * 24)) + 1;

      if (!calendar[date]) {
        calendar[date] = { date, dayNumber, cityName: stop.cityName, activities: [] };
      }

      const dayActivities = [...stop.activities]
        .filter((a) => {
          if (!a.scheduledDate) return false;
          return new Date(a.scheduledDate).toISOString().slice(0, 10) === date;
        })
        .sort((a, b) => {
          if (a.scheduledTime && b.scheduledTime)
            return a.scheduledTime.localeCompare(b.scheduledTime);
          return a.orderIndex - b.orderIndex;
        })
        .map((a) => ({
          id: a._id,
          activityId: a.activityId,
          name: a.name,
          category: a.category,
          scheduledTime: a.scheduledTime || null,
          cost: a.cost,
        }));

      calendar[date].activities.push(...dayActivities);
    }
  }

  const days = Object.values(calendar).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return {
    tripId: trip._id,
    tripName: trip.name,
    startDate: trip.startDate,
    endDate: trip.endDate,
    days,
  };
}

router.get("/itinerary", async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "Invalid trip id" });
    }

    const trip = await tripModel.findOne({ _id: tripId, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json(buildItinerary(trip));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/calendar", async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "Invalid trip id" });
    }

    const trip = await tripModel.findOne({ _id: tripId, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json(buildCalendar(trip));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/budget", async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "Invalid trip id" });
    }

    const trip = await tripModel.findOne({ _id: tripId, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const stopBreakdown = trip.stops.map((stop) => {
      const activityTotal = stop.activities.reduce((sum, a) => sum + (a.cost || 0), 0);
      return {
        stopId: stop._id,
        cityName: stop.cityName,
        activityTotal,
        days: expandDays(stop.startDate, stop.endDate).length,
      };
    });

    const totalActivityCost = stopBreakdown.reduce((s, x) => s + x.activityTotal, 0);

    const expenseByCategory = { transport: 0, stay: 0, meals: 0, misc: 0 };
    for (const exp of trip.expenses) {
      expenseByCategory[exp.category] = (expenseByCategory[exp.category] || 0) + exp.amount;
    }
    const totalExpenses = Object.values(expenseByCategory).reduce((s, v) => s + v, 0);

    const grandTotal = totalActivityCost + totalExpenses;

    const totalDays =
      Math.floor(
        (new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)
      ) + 1;

    const perDayMap = {};
    for (const stop of trip.stops) {
      for (const act of stop.activities) {
        if (!act.scheduledDate) continue;
        const date = new Date(act.scheduledDate).toISOString().slice(0, 10);
        perDayMap[date] = (perDayMap[date] || 0) + act.cost;
      }
    }
    const averageDailyCost = totalDays > 0 ? +(grandTotal / totalDays).toFixed(2) : 0;

    const overbudgetDays = Object.entries(perDayMap)
      .filter(([, cost]) => cost > averageDailyCost)
      .map(([date, cost]) => ({ date, cost }));

    res.json({
      tripId: trip._id,
      tripName: trip.name,
      totalDays,
      summary: {
        activities: totalActivityCost,
        ...expenseByCategory,
        grandTotal,
        averageDailyCost,
      },
      stopBreakdown,
      perDayBreakdown: Object.entries(perDayMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, cost]) => ({ date, cost })),
      overbudgetDays,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/budget/estimate", async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "Invalid trip id" });
    }

    const trip = await tripModel.findOne({ _id: tripId, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (!trip.stops || trip.stops.length === 0) {
      return res.status(400).json({ message: "Trip has no stops to estimate budget for" });
    }

    const estimate = await estimateTripBudget(trip);

    res.json({
      tripId: trip._id,
      tripName: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      aiEstimate: estimate,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
