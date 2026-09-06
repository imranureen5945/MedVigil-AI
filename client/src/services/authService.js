import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  signup: async (data) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },
  doctorLogin: async (doctorId, password) => {
    const response = await api.post('/auth/doctor-login', { doctorId, password });
    return response.data;
  },
  doctorSignup: async (data) => {
    const response = await api.post('/auth/doctor-signup', data);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
