import axios from 'axios';
import { API_BASE_URL } from '../../constants/api';
import { tokenStorage } from '../auth/tokenStorage';

export const apiClient = axios.create({ baseURL: API_BASE_URL });

apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
