import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,

  login: async (googleToken) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/google', { token: googleToken });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, loading: false });
    } catch (error) {
      console.error('Login error', error);
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  
  // mock hydration
  hydrate: () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        set({ user: payload });
      } catch (e) {
        set({ user: { name: 'User', email: 'user@example.com', role: 'USER' } });
      }
    }
  }
}));

export default useAuthStore;
