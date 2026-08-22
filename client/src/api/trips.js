import axiosInstance from './axios';

export const tripAPI = {
  getTrips: (page = 1, limit = 20) => 
    axiosInstance.get(`/trips?page=${page}&limit=${limit}`),
  
  getTrip: (tripId) => 
    axiosInstance.get(`/trips/${tripId}`),
  
  createTrip: (data) => 
    axiosInstance.post('/trips', data),
  
  updateTrip: (tripId, data) => 
    axiosInstance.put(`/trips/${tripId}`, data),
  
  deleteTrip: (tripId) => 
    axiosInstance.delete(`/trips/${tripId}`),
  
  publishTrip: (tripId, isPublic) => 
    axiosInstance.patch(`/trips/${tripId}/publish`, { isPublic }),
  
  getPublicTrip: (slug) => 
    axiosInstance.get(`/trips/public/${slug}`),
  
  getItinerary: (tripId) => 
    axiosInstance.get(`/trips/${tripId}/itinerary`),
  
  getCalendar: (tripId) => 
    axiosInstance.get(`/trips/${tripId}/calendar`),
  
  getBudget: (tripId) => 
    axiosInstance.get(`/trips/${tripId}/budget`),
  
  getBudgetEstimate: (tripId) => 
    axiosInstance.get(`/trips/${tripId}/budget/estimate`),
  
  addStop: (tripId, data) => 
    axiosInstance.post(`/trips/${tripId}/stops`, data),
  
  updateStop: (tripId, stopId, data) => 
    axiosInstance.put(`/trips/${tripId}/stops/${stopId}`, data),
  
  deleteStop: (tripId, stopId) => 
    axiosInstance.delete(`/trips/${tripId}/stops/${stopId}`),
  
  reorderStops: (tripId, orderedStopIds) => 
    axiosInstance.patch(`/trips/${tripId}/stops/reorder`, { orderedStopIds }),
  
  addActivity: (tripId, stopId, data) => 
    axiosInstance.post(`/trips/${tripId}/stops/${stopId}/activities`, data),
  
  updateActivity: (tripId, stopId, activityId, data) => 
    axiosInstance.put(`/trips/${tripId}/stops/${stopId}/activities/${activityId}`, data),
  
  deleteActivity: (tripId, stopId, activityId) => 
    axiosInstance.delete(`/trips/${tripId}/stops/${stopId}/activities/${activityId}`),
  
  reorderActivities: (tripId, stopId, orderedActivityIds) => 
    axiosInstance.patch(`/trips/${tripId}/stops/${stopId}/activities/reorder`, { orderedActivityIds }),
};