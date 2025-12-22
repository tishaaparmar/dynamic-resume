// resume-app/frontend/src/lib/api.ts
import axios from 'axios';

// ✅ Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // include cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
