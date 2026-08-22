import axiosInstance from './axios';

export const userAPI = {
  getUser: (userId) => 
    axiosInstance.get(`/users/${userId}`),
  
  updateUser: (userId, data) => 
    axiosInstance.put(`/users/${userId}`, data),
  
  deleteUser: (userId) => 
    axiosInstance.delete(`/users/${userId}`),
};