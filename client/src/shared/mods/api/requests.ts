import {api} from "../../api/axiosInstance.ts";

export const uploadFile = async (formData: FormData) => {
  return await api.post('/mods', formData)
}

export const getAllMods = async () => {
  return await api.get('/mods')
}

export const getModById = async (id: string) => {
  const response = await api.get(`/mods/${id}`);
  return response.data;
}

export const getMyMods = async () => {
  const response = await api.get('/mods/me/all');
  return response.data;
}

export const uploadNewVersion = async (modId: string, formData: FormData) => {
  const response = await api.post(`/mods/${modId}/versions`, formData);
  return response.data;
}