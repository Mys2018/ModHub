import {api} from "../../api/axiosInstance.ts";
import type {User} from "../model/types.ts";

interface UserLoginParams {
  email: string,
  password: string
}

interface LoginResponse {
  message: string,
  token: string,
  user: User
}

export const login = async (params: UserLoginParams) => {
  const response = await api.post<LoginResponse>('/auth/login', params)
  return response.data
}