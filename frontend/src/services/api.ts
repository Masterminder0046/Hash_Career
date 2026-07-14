import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  signup: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  logout: () => api.post('/auth/logout'),
};

export const resumeApi = {
  upload: (formData: FormData) =>
    api.post('/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  analyze: () => api.post('/resume/analyze'),
  get: () => api.get('/resume'),
  download: () => api.get('/resume/download', { responseType: 'blob' }),
};

export const companyApi = {
  getAll: (params?: any) => api.get('/companies', { params }),
  getById: (id: string) => api.get(`/companies/${id}`),
  create: (data: any) => api.post('/companies', data),
  update: (id: string, data: any) => api.put(`/companies/${id}`, data),
  delete: (id: string) => api.delete(`/companies/${id}`),
};

export const matchingApi = {
  getMatches: () => api.get('/matching'),
  getMatchDetail: (companyId: string) => api.get(`/matching/${companyId}`),
};

export const predictionApi = {
  predict: () => api.post('/prediction'),
  getHistory: () => api.get('/prediction/history'),
};

export const skillGapApi = {
  analyze: (company?: string) => api.get('/skill-gap', { params: { company } }),
};

export const roadmapApi = {
  create: (data: { duration: number; targetCompany?: string }) => api.post('/roadmap', data),
  getAll: () => api.get('/roadmap'),
  getById: (id: string) => api.get(`/roadmap/${id}`),
  updateWeek: (id: string, week: number) => api.put(`/roadmap/${id}/week`, { week }),
  delete: (id: string) => api.delete(`/roadmap/${id}`),
};

export const interviewApi = {
  start: (type: string) => api.post('/interview/start', { type }),
  submitAnswer: (data: { interviewId: string; answer: string; questionIndex: number }) =>
    api.post('/interview/submit', data),
  getHistory: () => api.get('/interview/history'),
  getById: (id: string) => api.get(`/interview/${id}`),
};

export const chatbotApi = {
  chat: (message: string) => api.post('/chatbot/chat', { message }),
  getQuickReplies: () => api.get('/chatbot/quick-replies'),
};

export const officerApi = {
  getDashboard: () => api.get('/officer/dashboard'),
  getStudents: (params?: any) => api.get('/officer/students', { params }),
  getStudentDetail: (id: string) => api.get(`/officer/students/${id}`),
  createStudent: (data: any) => api.post('/officer/students', data),
  exportCsv: () => api.get('/officer/export/csv', { responseType: 'blob' }),
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getLogs: () => api.get('/admin/logs'),
  getAnalytics: () => api.get('/admin/analytics'),
  manageUser: (userId: string, data: any) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: { geminiApiKey: string }) => api.put('/admin/settings', data),
  uploadHistory: (formData: FormData) => api.post('/admin/upload-history', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getRetrainStatus: () => api.get('/admin/retrain-status'),
};

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};
