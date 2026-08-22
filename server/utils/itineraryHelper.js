export function expandDays(startDate, endDate) {
  const days = [];
  const cur = new Date(startDate);
  const end = new Date(endDate);
  cur.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(0, 0, 0, 0);
  while (cur <= end) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return days;
}

export function buildItinerary(trip) {
  const tripStart = new Date(trip.startDate);

  const stops = [...(trip.stops || [])]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((stop) => {
      const days = expandDays(stop.startDate, stop.endDate).map((date) => {
        const dayNumber =
          Math.floor(
            (new Date(date) - tripStart) / (1000 * 60 * 60 * 24)
          ) + 1;

        const activities = [...(stop.activities || [])]
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

        return { date, dayNumber, activities };
      });

      return {
        stopId: stop._id,
        cityId: stop.cityId,
        cityName: stop.cityName,
        orderIndex: stop.orderIndex,
        startDate: stop.startDate,
        endDate: stop.endDate,
        days,
      };
    });

  const totalDays =
    Math.floor(
      (new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)
    ) + 1;

  return {
    tripId: trip._id,
    tripName: trip.name,
    startDate: trip.startDate,
    endDate: trip.endDate,
    totalDays,
    stops,
  };
}
