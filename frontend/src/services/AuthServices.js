import axios from 'axios';

const API_URL = 'http://localhost:5000/auth';

// Create axios instance dengan interceptor
const axiosInstance = axios.create({
  baseURL: API_URL
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  getUserInfo: () => axiosInstance.get('/user-info'),
  logout: () => axiosInstance.post('/logout'),
};