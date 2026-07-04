import type { AxiosRequestConfig } from 'axios'

// 通用后端返回结构
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

// 👇 关键：继承 AxiosRequestConfig，而不是自己独立写！
export interface CustomRequestConfig extends AxiosRequestConfig {
  loading?: boolean
  cancelRepeat?: boolean
}
