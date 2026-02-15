import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/auth'
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('staff_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authStaffService = {
  getMe: () => API.get('/staff/me'),
  logout: () => API.post('/logout')
};
