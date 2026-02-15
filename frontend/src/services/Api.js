// import axios from 'axios';

// const API_URL = 'http://localhost:5000';

// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json'
//   },
//   withCredentials: true
// });

// // Add token to requests if available
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Handle response errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Token expired or invalid
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// // Auth services
// export const authService = {
//   register: (data) => api.post('/auth/register', data),
//   login: (data) => api.post('/auth/login', data),
//   checkEmail: (email) => api.get(`/auth/check-email?email=${email}`),
//   getCurrentUser: () => api.get('/auth/me'),
//   googleLogin: () => {
//     window.location.href = `${API_URL}/auth/google`;
//   }
// };

// export default api;

import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Adjust to your backend port

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  // Customer registration
  register: (data) => api.post('/auth/register', data),
  
  // Customer login (email based)
  login: (data) => api.post('/auth/login', data),
  
  // Staff login (username based)
  staffLogin: (data) => api.post('/auth/staff/login', data),
  
  // Google OAuth
  googleLogin: () => {
    window.location.href = `${API_URL}/auth/google`;
  },
  
  // Check email availability
  checkEmail: (email) => api.get(`/auth/check-email?email=${email}`),
  
  // Get current user
  getCurrentUser: () => api.get('/auth/me')
};

export default api;