import axios from "axios";
import { AxiosErrorType } from "@/types/error/apiError";

// Same-origin — Next.js API routes are at /api
const API_URL = "/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      "✅ [AXIOS] API Response:",
      response.status,
      response.config.url
    );
    return response;
  },
  async (error: AxiosErrorType) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401) {
      console.error("🔒 [AXIOS] Unauthorized 401:", message);
    } else if (status === 403) {
      console.error("🚫 [AXIOS] Forbidden 403:", message);
    } else if (status === 404) {
      console.error("📍 [AXIOS] Not Found:", message);
    } else if (status === 500) {
      console.error("⚠️ [AXIOS] Server Error 500:", message);
    } else if (!error.response) {
      console.error(
        "🌐 [AXIOS] Network Error - Backend unreachable at:",
        API_URL
      );
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
