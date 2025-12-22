// resume-app/frontend/src/services/auth.ts
import api from '../lib/api';

export async function signup(name: string, email: string, password: string) {
  const { data } = await api.post('/auth/signup', { name, email, password });
  return data; // backend returns user object
}

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  return data; // user object + HttpOnly cookie set
}

export async function logout() {
  const { data } = await api.post('/auth/logout');
  return data;
}
