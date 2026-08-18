import api from './api';

export const profileService = {
  getProfile: async () => {
    const response = await api.get('/api/profile/');
    return response.data;
  },

  createProfile: async (profileData) => {
    const response = await api.post('/api/profile/', profileData);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/api/profile/', profileData);
    return response.data;
  },

  deleteProfile: async () => {
    const response = await api.delete('/api/profile/');
    return response.data;
  }
};

export default profileService;