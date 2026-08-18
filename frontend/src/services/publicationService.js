import api from './api';

export const publicationService = {
  getAllPublications: async () => {
    const response = await api.get('/publication-records/');
    return response.data;
  },

  getPublicationById: async (id) => {
    const response = await api.get(`/publication-records/${id}`);
    return response.data;
  },

  createPublication: async (publicationData) => {
    const response = await api.post('/publication-records/', publicationData);
    return response.data;
  },

  updatePublication: async (id, publicationData) => {
    const response = await api.put(`/publication-records/${id}`, publicationData);
    return response.data;
  },

  deletePublication: async (id) => {
    const response = await api.delete(`/publication-records/${id}`);
    return response.data;
  },

  searchPublications: async (query) => {
    const response = await api.get('/api/publications/search', { params: { query } });
    return response.data;
  },

  importPublication: async (publicationData) => {
    const response = await api.post('/api/publications/import', publicationData);
    return response.data;
  }
};

export default publicationService;