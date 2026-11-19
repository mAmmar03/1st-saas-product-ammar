import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
