import axios from 'axios';

const API_URL = 'http://localhost:5000/dashboard';

const dashboardService = {
  // 1. KPI Dashboard
  getKPI: async () => {
    try {
      const response = await axios.get(`${API_URL}/kpi`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 2. Operational Dashboard
  getRequestFlow: async (days = 30) => {
    try {
      const response = await axios.get(`${API_URL}/request-flow?days=${days}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getToolUsage: async (limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}/tool-usage?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getToolStatus: async () => {
    try {
      const response = await axios.get(`${API_URL}/tool-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getScheduleStatus: async (days = 30) => {
    try {
      const response = await axios.get(`${API_URL}/schedule-status?days=${days}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 3. Financial Dashboard
  getRevenueBreakdown: async (months = 6) => {
    try {
      const response = await axios.get(`${API_URL}/revenue-breakdown?months=${months}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getPaymentStatus: async () => {
    try {
      const response = await axios.get(`${API_URL}/payment-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getRevenueTrend: async (days = 30) => {
    try {
      const response = await axios.get(`${API_URL}/revenue-trend?days=${days}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 4. Inventory & Safety
  getReagentAlert: async () => {
    try {
      const response = await axios.get(`${API_URL}/reagent-alert`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getReagentConsumption: async (limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}/reagent-consumption?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getReagentConsumptionTrend: async (reagentId, days = 30) => {
    try {
      const response = await axios.get(`${API_URL}/reagent-consumption/${reagentId}?days=${days}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 5. User & Behavior
  getUserDistribution: async () => {
    try {
      const response = await axios.get(`${API_URL}/user-distribution`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getTopUsers: async (limit = 10, days = 30) => {
    try {
      const response = await axios.get(`${API_URL}/top-users?limit=${limit}&days=${days}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 6. Recent Activity
  getRecentRequests: async (limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}/recent-requests?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 7. Complete Dashboard
  getCompleteDashboard: async () => {
    try {
      const response = await axios.get(`${API_URL}/complete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default dashboardService;