import {api} from "../../api/axiosInstance.ts";

export const uploadFile = async (formData: FormData) => {
  return await api.post('/mods', formData)
}