import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Questions ──────────────────────────────────────────────────────────────

export const getRandomQuestion = (params = {}) =>
  api.get('/questions/random', { params }).then((r) => r.data);

export const getQuestions = (params = {}) =>
  api.get('/questions', { params }).then((r) => r.data);

export const getQuestionById = (id) =>
  api.get(`/questions/${id}`).then((r) => r.data);

export const getSubjectOverview = () =>
  api.get('/questions/subjects').then((r) => r.data);

export const getCategories = () =>
  api.get('/questions/categories').then((r) => r.data);

// ─── Practice ───────────────────────────────────────────────────────────────

export const savePractice = (data) =>
  api.post('/practice', data).then((r) => r.data);

export const transcribeAudio = (audioBase64, mimeType = 'audio/webm') =>
  api.post('/practice/transcribe', { audioBase64, mimeType }).then((r) => r.data);

export const getHistory = (params = {}) =>
  api.get('/practice/history', { params }).then((r) => r.data);

export const getStats = () =>
  api.get('/practice/stats').then((r) => r.data);

export default api;
