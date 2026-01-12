import axios, { AxiosError } from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";

const API_CONFIG = {
    BASE_URL: process.env.NEXT_ENDPOINT || "http://localhost:3000",
    TIMEOUT: 60000,
    HEADERS: {
        "Content-Type": "application/json",
    },
} as const;

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_CONFIG.BASE_URL,
            timeout: API_CONFIG.TIMEOUT,
            headers: API_CONFIG.HEADERS,
            withCredentials: true,
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        this.api.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                if (error.response?.status === 401) {
                    //refresh-token
                }
                return Promise.reject(error.response?.data);
            },
        );
    }

    public async get<T>(url: string, config?: AxiosRequestConfig) {
        const response = await this.api.get<T>(url, config);
        return response.data;
    }

    public async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
        const response = await this.api.post<T>(url, data, config);
        return response.data;
    }

    public async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
        const response = await this.api.put<T>(url, data, config);
        return response.data;
    }

    public async delete<T>(url: string, config?: AxiosRequestConfig) {
        const response = await this.api.delete<T>(url, config);
        return response.data;
    }

    public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
        const response = await this.api.patch<T>(url, data, config);
        return response.data;
    }
}

export const apiService = new ApiService();
