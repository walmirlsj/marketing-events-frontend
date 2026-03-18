import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth-storage');
  if (stored) {
    const { state } = JSON.parse(stored);
    if (state?.token) {
      config.headers['Authorization'] = `Bearer ${state.token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const eventsApi = {
  list: (params) => api.get('/events', { params }),
  get: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  remove: (id) => api.delete(`/events/${id}`),
  review: (id, action, rejection_reason) =>
    api.patch(`/events/${id}/review`, { action, rejection_reason }),
  import: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/events/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getPending: () => api.get('/admin/events/pending'),
};

export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: (ids) => api.patch('/notifications/read', { ids }),
};

export const regionsApi = {
  list: () => api.get('/regions'),
};

export default api;
