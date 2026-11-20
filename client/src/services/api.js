import axios from 'axios';

const getApiBase = () => {
  let envUrl = (import.meta.env.VITE_API_URL || '').trim();

  // 1. Sanitize double protocol typos (e.g. https://https:// or http://https://)
  if (envUrl) {
    envUrl = envUrl.replace(/^(https?:\/\/)+/i, 'https://');
  }

  // 2. Production fallback if env variable is missing or empty on Vercel
  if (!envUrl) {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return 'https://onest-saas-product-ammar.onrender.com/api';
    }
    return 'http://localhost:5000/api';
  }

  const clean = envUrl.replace(/\/+$/, '');
  if (clean.endsWith('/api')) {
    return clean;
  }
  return `${clean}/api`;
};

const API_BASE = getApiBase();

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto attach Authorization Bearer token from sessionStorage (Strict Single-Session Security)
client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('ammardev_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Authentication & Enterprise Security
  login: (credentials) => client.post('/auth/login', credentials),
  register: (userData) => client.post('/auth/register', userData),
  signup: (userData) => client.post('/auth/signup', userData),
  verifyEmail: (data) => client.post('/auth/verify-email', data),
  resendVerification: (data) => client.post('/auth/resend-verification', data),
  forgotPassword: (data) => client.post('/auth/forgot-password', data),
  resetPassword: (data) => client.post('/auth/reset-password', data),
  getMe: () => client.get('/auth/me'),
  setSuperAdminPassword: (data) =>
    client.post('/auth/set-superadmin-password', data),
  createAdmin: (data) => client.post('/auth/create-admin', data),
  manageAdminAccount: (data) => client.post('/auth/manage-admin', data),
  deleteAdmin: (id) => client.delete(`/auth/users/${id}`),
  getUsersList: () => client.get('/auth/users'),

  // Influencers
  getInfluencers: () => client.get('/influencers'),
  getInfluencerDossier: (id) => client.get(`/influencers/${id}/dossier`),
  createInfluencer: (data) => client.post('/influencers', data),
  updateInfluencer: (id, data) => client.put(`/influencers/${id}`, data),
  deleteInfluencer: (id) => client.delete(`/influencers/${id}`),

  // Articles & PR Quota
  getArticles: () => client.get('/articles'),
  createArticle: (data) => client.post('/articles', data),
  updateArticle: (id, data) => client.put(`/articles/${id}`, data),
  deleteArticle: (id) => client.delete(`/articles/${id}`),

  // Collaborations & Deals
  getDeals: () => client.get('/deals'),
  getDashboardStats: () => client.get('/deals/dashboard-stats'),
  createDeal: (data) => client.post('/deals', data),
  dispatchPR: (dealId, prItemId, payload) =>
    client.patch(`/deals/${dealId}/pr/${prItemId}/dispatch`, payload),
  deliverPR: (dealId, prItemId) =>
    client.patch(`/deals/${dealId}/pr/${prItemId}/deliver`),
  revertPR: (dealId, prItemId) =>
    client.patch(`/deals/${dealId}/pr/${prItemId}/revert`),
  updateVideo: (dealId, videoId, payload) =>
    client.patch(`/deals/${dealId}/videos/${videoId}`, payload),
  updatePayment: (dealId, payload) =>
    client.patch(`/deals/${dealId}/payment`, payload),
  deleteDeal: (id) => client.delete(`/deals/${id}`),

  // PR Budget & Spend Planning
  getBudgetOverview: () => client.get('/budget'),
  setBudget: (data) => client.post('/budget', data),
  deleteBudget: (id) => client.delete(`/budget/${id}`),

  // Brand / Company Profile Settings
  getBrandProfile: () => client.get('/settings/brand'),
  updateBrandProfile: (data) => client.put('/settings/brand', data),

  // Backup & Migration
  exportBackup: () => client.get('/backup/export'),
  importBackup: (data, mode = 'overwrite') =>
    client.post('/backup/import', { data, mode }),

  // Enterprise Cloudinary CDN Media Upload
  uploadImage: (base64Image, folder = 'ammardev/slips') =>
    client.post('/upload/image', { image: base64Image, folder }),
};
