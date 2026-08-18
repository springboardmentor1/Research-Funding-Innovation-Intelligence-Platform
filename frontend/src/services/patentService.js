import api from './api';

export const patentService = {
  getAllPatents: async () => {
    const response = await api.get('/patent-records/');
    return response.data;
  },

  getPatentById: async (id) => {
    const response = await api.get(`/patent-records/${id}`);
    return response.data;
  },

  createPatent: async (patentData) => {
    const response = await api.post('/patent-records/', patentData);
    return response.data;
  },

  updatePatent: async (id, patentData) => {
    const response = await api.put(`/patent-records/${id}`, patentData);
    return response.data;
  },

  deletePatent: async (id) => {
    const response = await api.delete(`/patent-records/${id}`);
    return response.data;
  },

  searchPatents: async (query) => {
    const response = await api.get('/api/patents/search', { params: { query } });
    return response.data;
  },

  searchPatentsExternal: async (query) => {
    const response = await api.get('/api/patents/search', { params: { query } });
    return response.data;
  }
};

export default patentService;