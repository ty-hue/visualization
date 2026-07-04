import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { ElLoading, ElMessage } from "element-plus";
import type { LoadingInstance } from "element-plus";
import type { ApiResponse, CustomRequestConfig } from "./types";
import { BASE_URL, TIME_OUT, SUCCESS_CODE } from "./config";
import { useRouter } from "vue-router";
let loadingInstance: LoadingInstance | null = null;
const router = useRouter();
const pendingMap = new Map<string, AbortController>();

const getRequestKey = (config: InternalAxiosRequestConfig) => {
  const { method, url, params, data } = config;
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join("&");
};

const addPending = (config: InternalAxiosRequestConfig) => {
  const key = getRequestKey(config);
  if (!pendingMap.has(key)) {
    const controller = new AbortController();
    config.signal = controller.signal;
    pendingMap.set(key, controller);
  }
};

const removePending = (config: InternalAxiosRequestConfig) => {
  const key = getRequestKey(config);
  if (pendingMap.has(key)) {
    pendingMap.get(key)!.abort();
    pendingMap.delete(key);
  }
};

const service: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIME_OUT,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const customConfig = config as CustomRequestConfig;
    if (customConfig.cancelRepeat !== false) {
      removePending(config);
      addPending(config);
    }

    if (customConfig.loading) {
      loadingInstance = ElLoading.service({
        text: "加载中...",
        background: "rgba(0,0,0,0.1)",
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    loadingInstance?.close();
    loadingInstance = null;
    removePending(response.config);

    const res = response.data as ApiResponse<unknown>;
    const { code, message } = res;

    if (code === SUCCESS_CODE) {
      return response.data;
    }

    ElMessage.error(message || "请求失败");
    return Promise.reject(res);
  },
  async (error) => {
    loadingInstance?.close();
    loadingInstance = null;
    pendingMap.clear();

    const status = error.response?.status;
    const errMsg: Record<string, string> = {
      400: "请求参数错误",
      401: "未登录或登录已过期",
      403: "无权限访问",
      404: "接口不存在",
      500: "服务器错误",
    };

    if (status === 401) {
      router.push({ name: "Login" });
    }

    ElMessage.error(errMsg[String(status)] || "网络异常");
    return Promise.reject(error);
  },
);

// 请求封装（已修复）
const request = {
  get<T = unknown>(
    url: string,
    params?: unknown,
    config?: CustomRequestConfig,
  ): Promise<T> {
    return service.get(url, { params, ...config }).then((res) => res.data);
  },

  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: CustomRequestConfig,
  ): Promise<T> {
    return service.post(url, data, config).then((res) => res.data);
  },

  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: CustomRequestConfig,
  ): Promise<T> {
    return service.put(url, data, config).then((res) => res.data);
  },

  delete<T = unknown>(
    url: string,
    params?: unknown,
    config?: CustomRequestConfig,
  ): Promise<T> {
    return service.delete(url, { params, ...config }).then((res) => res.data);
  },

  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: CustomRequestConfig,
  ): Promise<T> {
    return service.patch(url, data, config).then((res) => res.data);
  },
};

export default request;
