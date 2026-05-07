import * as axios from "axios";
import {useAuthStore} from "../user/model/store";

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
})

api.interceptors.request.use(
    (config) => {
      const token = useAuthStore.getState().token
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    }
)

api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error.response?.status, error.response?.data);
      if (error.response?.status === 401 || error.response?.status === 403) {
        useAuthStore.getState().logout()
      }
      return Promise.reject(error);
    }
)