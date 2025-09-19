import axios, { type InternalAxiosRequestConfig } from "axios";

const axiosClient = axios.create({
    baseURL: "https://localhost:7016/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Add token from localStorage to every request
axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;
