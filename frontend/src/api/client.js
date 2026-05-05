import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to admin requests
export const setAdminToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = token;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Public endpoints
export const getSlots = (filters = {}) => {
  return api.get('/slots', { params: filters });
};

export const createBooking = (data) => {
  return api.post('/bookings', data);
};

export const cancelBooking = (bookingId) => {
  return api.delete(`/bookings/${bookingId}`);
};

export const checkIn = (qrPayload) => {
  return api.post('/checkin', { qr_payload: qrPayload });
};

export const checkOut = (qrPayload) => {
  return api.post('/checkout', { qr_payload: qrPayload });
};

export const createWalkinBooking = (data) => {
  return api.post('/bookings/walkin', data);
};

export const getPrediction = () => {
  return api.get('/predict/today');
};

// Admin endpoints
export const adminLogin = (password) => {
  return api.post('/admin/login', { password });
};

export const getAnalytics = () => {
  return api.get('/admin/analytics');
};

export const updateSlot = (slotId, data) => {
  return api.patch(`/admin/slots/${slotId}`, data);
};

export const forceReleaseSlot = (slotId) => {
  return api.post(`/admin/slots/${slotId}/force-release`);
};

export const getSessions = (params) => {
  return api.get('/admin/sessions', { params });
};

export const getUtilizationHeatmap = (days = 7) => {
  return api.get('/admin/utilization-heatmap', { params: { days } });
};

export default api;
