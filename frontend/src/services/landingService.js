import axios from 'axios';

const API_URL = 'http://localhost:5000/landing';

const landingService = {
  // Stats & Metrics
  getLandingStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getSystemMetrics: async () => {
    try {
      const response = await axios.get(`${API_URL}/metrics`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Catalog
  getCatalogTools: async (limit = 6) => {
    try {
      const response = await axios.get(`${API_URL}/catalog/tools?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getCatalogReagents: async (limit = 6) => {
    try {
      const response = await axios.get(`${API_URL}/catalog/reagents?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  searchCatalog: async (searchTerm, type = 'all') => {
    try {
      const response = await axios.get(`${API_URL}/catalog/search?q=${encodeURIComponent(searchTerm)}&type=${type}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Featured Items
  getFeaturedTools: async (limit = 6) => {
    try {
      const response = await axios.get(`${API_URL}/featured/tools?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getFeaturedReagents: async (limit = 6) => {
    try {
      const response = await axios.get(`${API_URL}/featured/reagents?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Availability
  getAvailabilityCalendar: async (toolId, startDate, days = 14) => {
    try {
      const response = await axios.get(
        `${API_URL}/availability/${toolId}?start_date=${startDate}&days=${days}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Forms
  submitContactForm: async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/contact`, formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  subscribeNewsletter: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/newsletter`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Complete Data
  getCompleteLandingData: async (limit = 6) => {
    try {
      const response = await axios.get(`${API_URL}/complete?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default landingService;