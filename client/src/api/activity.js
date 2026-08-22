import axiosInstance from './axios';

export const activityAPI = {
  getActivities: (params) => 
    axiosInstance.get('/activities', { params }),
  
  getActivity: (activityId) => 
    axiosInstance.get(`/activities/${activityId}`),
};