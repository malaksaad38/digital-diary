// lib/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Prayer API
export const prayerApi = {
  getAll: async () => {
    const { data } = await apiClient.get('/prayers');
    return data;
  },

  getByDate: async (date: string) => {
    const { data } = await apiClient.get(`/prayers?date=${date}`);
    return data;
  },

  create: async (prayerData: any) => {
    const { data } = await apiClient.post('/prayers', prayerData);
    return data;
  },

  update: async (id: string, prayerData: any) => {
    const { data } = await apiClient.put('/prayers', { id, ...prayerData });
    return data;
  },
};

// Diary API
export const diaryApi = {
  getAll: async () => {
    const { data } = await apiClient.get('/diary');
    return data;
  },

  getByDate: async (date: string) => {
    const { data } = await apiClient.get(`/diary?date=${date}`);
    return data;
  },

  create: async (diaryData: any) => {
    const { data } = await apiClient.post('/diary', diaryData);
    return data;
  },

  update: async (id: string, diaryData: any) => {
    const { data } = await apiClient.put('/diary', { id, ...diaryData });
    return data;
  },
};

// Combined API for history page
export const historyApi = {
  getCombined: async () => {
    const [prayerRes, diaryRes] = await Promise.all([
      prayerApi.getAll(),
      diaryApi.getAll(),
    ]);

    return {
      prayers: prayerRes.data || [],
      diaries: diaryRes.data || [],
    };
  },
};