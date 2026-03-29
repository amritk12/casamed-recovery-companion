import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Sessions
export const createSession = (data) => api.post('/api/sessions', data);
export const getSessions = () => api.get('/api/sessions');
export const getSessionById = (id) => api.get(`/api/sessions/${id}`);

// Chat
export const sendMessage = (data) => api.post('/api/chat', data);
export const getChatHistory = (sessionId) => api.get(`/api/chat/${sessionId}`);

// Pain Score
export const logPainScore = (data) => api.post('/api/pain-score', data);
export const getPainScores = (patientId) => api.get(`/api/pain-score/${patientId}`);

// Reminders
export const triggerReminder = (sessionId) =>
  api.post('/api/reminders/trigger', { sessionId });