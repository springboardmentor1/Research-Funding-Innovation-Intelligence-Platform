import api from './api';

export const fundingService = {
  getAllFunding: async (search = '', useExternalApi = false) => {
    try {
      const params = search ? { search, use_external_api: useExternalApi } : { use_external_api: useExternalApi };
      const response = await api.get('/funding/', { params });
      // Ensure each funding item has id field (backend returns id)
      return response.data.map(funding => ({
        ...funding,
        id: funding.id // Ensure id field exists
      }));
    } catch (error) {
      console.error('Error getting all funding:', error);
      return [];
    }
  },

  getFundingById: async (id) => {
    try {
      const response = await api.get(`/funding/${id}`);
      return {
        ...response.data,
        id: response.data.id // Ensure id field exists
      };
    } catch (error) {
      console.error('Error getting funding by id:', error);
      throw error;
    }
  },

  getSavedFunding: async () => {
    try {
      const response = await api.get('/funding/saved');
      // Backend returns minimal fields, fetch full details for each saved funding
      const savedWithDetails = await Promise.all(
        response.data.map(async (saved) => {
          try {
            const fullDetails = await api.get(`/funding/${saved.funding_id}`);
            return {
              ...fullDetails.data,
              id: fullDetails.data.id // Ensure id field exists
            };
          } catch (error) {
            console.error(`Error fetching details for funding ${saved.funding_id}:`, error);
            // Return minimal data if full details fetch fails
            return {
              ...saved,
              id: saved.funding_id,
              amount: null,
              deadline: null,
              description: '',
              keywords: []
            };
          }
        })
      );
      return savedWithDetails;
    } catch (error) {
      console.error('Error getting saved funding:', error);
      return [];
    }
  },

  getAppliedFunding: async () => {
    try {
      const response = await api.get('/funding/applied');
      // Backend returns minimal fields, fetch full details for each applied funding
      const appliedWithDetails = await Promise.all(
        response.data.map(async (applied) => {
          try {
            const fullDetails = await api.get(`/funding/${applied.funding_id}`);
            return {
              ...fullDetails.data,
              id: fullDetails.data.id, // Ensure id field exists
              applied_at: applied.applied_at // Preserve applied_at from response
            };
          } catch (error) {
            console.error(`Error fetching details for funding ${applied.funding_id}:`, error);
            // Return minimal data if full details fetch fails
            return {
              ...applied,
              id: applied.funding_id,
              amount: null,
              deadline: null,
              description: '',
              keywords: []
            };
          }
        })
      );
      return appliedWithDetails;
    } catch (error) {
      console.error('Error getting applied funding:', error);
      return [];
    }
  },

  getRecommendations: async (userId) => {
    try {
      const response = await api.get(`/funding/recommendations/${userId}`);
      // Map backend response to frontend expectations
      return response.data.map(rec => ({
        ...rec,
        id: rec.funding_id, // Map funding_id to id for card rendering
        keywords: rec.matched_keywords || [] // Use matched_keywords as keywords array
      }));
    } catch (error) {
      console.error('Error getting funding recommendations:', error);
      return [];
    }
  },

  saveFunding: async (fundingId) => {
    const response = await api.post(`/funding/${fundingId}/save`);
    return response.data;
  },

  applyFunding: async (fundingId) => {
    const response = await api.post(`/funding/${fundingId}/apply`);
    return response.data;
  },

  createFunding: async (fundingData) => {
    const response = await api.post('/funding/', fundingData);
    return response.data;
  },

  updateFunding: async (id, fundingData) => {
    const response = await api.put(`/funding/${id}`, fundingData);
    return response.data;
  },

  deleteFunding: async (id) => {
    const response = await api.delete(`/funding/${id}`);
    return response.data;
  }
};

export default fundingService;