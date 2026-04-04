import axiosInstance from "./axiosInstance";
import { AxiosErrorType } from "@/types/error/apiError";
import LoginPayload from "@/types/auth/loginPayload";

const authService = {
  async register(payload: any) {
    try {
      const response = await axiosInstance.post(`/auth/register`, payload);
      return response.data;
    } catch (error) {
      const err = error as AxiosErrorType;
      const message = err.response?.data?.message || "Registration Failed";
      throw new Error(message);
    }
  },

  async login(payload: LoginPayload) {
    try {
      const response = await axiosInstance.post(`/auth/login`, payload);
      const { message, user } = response.data;
      return { message, user };
    } catch (error) {
      const err = error as AxiosErrorType;
      const message = err.response?.data?.message || "Login Failed";
      throw new Error(message);
    }
  },

  async logout() {
    try {
      const response = await axiosInstance.post(`/auth/logout`);
      const { message } = response.data;
      return { message };
    } catch (error) {
      const err = error as AxiosErrorType;
      const message = err.response?.data?.message || "Logout Failed";
      throw new Error(message);
    }
  },

  async forgotPassword(email: string) {
    try {
      const response = await axiosInstance.post("/auth/forgot-password", {
        email,
      });
      return response.data;
    } catch (error) {
      const err = error as AxiosErrorType;
      const message =
        err.response?.data?.message || "Forgot Password Failed";
      throw new Error(message);
    }
  },

  async verifyOtp(email: string, otp: string) {
    try {
      const response = await axiosInstance.post("/auth/verify-otp", {
        email,
        otp,
      });
      return response.data;
    } catch (error) {
      const err = error as AxiosErrorType;
      const message =
        err.response?.data?.message || "OTP Verification Failed";
      throw new Error(message);
    }
  },

  async changePassword(passwordResetData: any) {
    try {
      const response = await axiosInstance.post(
        "/auth/change-password",
        passwordResetData
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosErrorType;
      const message =
        err.response?.data?.message || "Change Password Failed";
      throw new Error(message);
    }
  },

  async checkToken() {
    try {
      const response = await axiosInstance.get("/auth/check-token");

      if (response.data.message === "Token is valid") {
        const user = response.data.user;
        return { authenticated: true, user };
      } else {
        throw new Error("Token verification failed");
      }
    } catch (error) {
      const err = error as AxiosErrorType;
      const message =
        err.response?.data?.message || "Token Verification Failed";
      throw new Error(message);
    }
  },
};

export default authService;
