import axiosInstance from './axios';

export const suggestAPI = {
  getSuggestions: (place) => 
    axiosInstance.get(`/suggest?place=${encodeURIComponent(place)}`),
};
