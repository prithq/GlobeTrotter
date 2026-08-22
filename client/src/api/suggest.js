import axiosInstance from './axios';

export const suggestAPI = {
  getSuggestions: (place) => 
    axiosInstance.get(`/suggest?place=${encodeURIComponent(place)}`),

  getRouteStops: (from, to) => 
    axiosInstance.get(`/suggest/stops?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),

  getRealtimeBudget: (stops) => 
    axiosInstance.post('/suggest/budget', { stops }),

  optimizeRoute: (origin, destinations) =>
    axiosInstance.post('/suggest/optimize-route', { origin, destinations }),
};
