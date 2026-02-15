import axios from 'axios';

const API_URL = 'http://localhost:5000/reporting';

const reportingService = {
  // Summary & Overview
  getSummaryStats: async (range = 'this_month') => {
    try {
      const response = await axios.get(`${API_URL}/summary?range=${range}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getCategoryStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Detailed Reports
  getReagentUsageReport: async (range = 'this_month', limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}/reagent-usage?range=${range}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getTopUsersReport: async (range = 'this_month', limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}/top-users?range=${range}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getWeeklyActivity: async (weeks = 1) => {
    try {
      const response = await axios.get(`${API_URL}/weekly-activity?weeks=${weeks}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getFinancialReport: async (range = 'this_month') => {
    try {
      const response = await axios.get(`${API_URL}/financial?range=${range}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getInventoryReport: async () => {
    try {
      const response = await axios.get(`${API_URL}/inventory`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getBorrowingReport: async (range = 'this_month') => {
    try {
      const response = await axios.get(`${API_URL}/borrowing?range=${range}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getMonthlyComparison: async (months = 6) => {
    try {
      const response = await axios.get(`${API_URL}/monthly-comparison?months=${months}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Report Generation
  generateReport: async (reportType, dateRange = 'this_month', format = 'PDF') => {
    try {
      const response = await axios.post(`${API_URL}/generate`, {
        reportType,
        dateRange,
        format
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getRecentReports: async (limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Complete Dashboard Data
  getCompleteReportingData: async (range = 'this_month') => {
    try {
      const response = await axios.get(`${API_URL}/complete?range=${range}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default reportingService;