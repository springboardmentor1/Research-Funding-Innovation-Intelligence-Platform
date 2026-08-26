import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const publicationService = {
  /** Sync publications from OpenAlex using the user's research profile. */
  searchPublications: async () => {
    const response = await axios.get(`${API_URL}/publications/search`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  /** Retrieve the current user's saved publications from the local DB. */
  getPublications: async (filters = {}) => {
    const response = await axios.get(`${API_URL}/publications`, {
      headers: getAuthHeaders(),
      params: filters,
    });
    return response.data;
  },

  /**
   * Live keyword search — hits OpenAlex directly and returns the most-cited
   * high-quality papers for the given keyword / topic.
   *
   * Each paper includes:
   *   title, link (clickable DOI / publisher page), doi, doi_url,
   *   authors[], journal, publication_year, citation_count,
   *   open_access, abstract, keywords[]
   *
   * @param {string} keyword  - research keyword or topic (e.g. "Quantum Computing")
   * @param {number} [limit]  - max results (1–50, default 20)
   * @returns {Promise<Array>}
   */
  searchGlobalPublications: async (keyword, limit = 20) => {
    const response = await axios.get(`${API_URL}/global/publications/keyword-search`, {
      headers: getAuthHeaders(),
      params: { keyword, limit },
    });
    return response.data;
  },
};

export default publicationService;
