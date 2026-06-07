import create from 'zustand';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

// Auth Store
export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  login: async (email, password) => {
    try {
      // API endpoint for login would be configured here
      const response = await axios.post(`${API_BASE}/auth/login/`, {
        email,
        password,
      });
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      set({ token, user });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ token: null, user: null });
  },
}));

// Professors Store
export const useProfessorsStore = create((set) => ({
  professors: [],
  loading: false,
  error: null,
  fetchProfessors: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE}/professors/`, { params: filters });
      set({ professors: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  fetchProfessor: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/professors/${id}/`);
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));

// Matches Store
export const useMatchesStore = create((set) => ({
  matches: [],
  loading: false,
  error: null,
  fetchMatches: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('auth_token');
      const headers = token ? { Authorization: `Token ${token}` } : {};
      const response = await axios.get(`${API_BASE}/matches/`, { headers });
      set({ matches: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  markClicked: async (matchId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { Authorization: `Token ${token}` };
      await axios.post(`${API_BASE}/matches/${matchId}/mark_clicked/`, {}, { headers });
    } catch (error) {
      console.error('Error marking match as clicked:', error);
    }
  },
  markReplied: async (matchId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { Authorization: `Token ${token}` };
      await axios.post(`${API_BASE}/matches/${matchId}/mark_replied/`, {}, { headers });
    } catch (error) {
      console.error('Error marking match as replied:', error);
    }
  },
}));

// User Profile Store
export const useUserStore = create((set) => ({
  profile: null,
  loading: false,
  error: null,
  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { Authorization: `Token ${token}` };
      const response = await axios.get(`${API_BASE}/profile/`, { headers });
      set({ profile: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  updateProfile: async (data) => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { Authorization: `Token ${token}` };
      const response = await axios.put(`${API_BASE}/profile/`, data, { headers });
      set({ profile: response.data });
      return { success: true };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },
}));
