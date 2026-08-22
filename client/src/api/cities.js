import axiosInstance from './axios';

export const cityAPI = {
  getCities: (params) => 
    axiosInstance.get('/cities', { params }),
  
  getCity: (cityId) => 
    axiosInstance.get(`/cities/${cityId}`),
};