import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "@/api/authApi";

export interface OtpState {
  email: string | null;
  step: "email" | "otp" | "reset";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: OtpState = {
  email: null,
  step: "email",
  loading: false,
  error: null,
  successMessage: null,
};

// 1. Send OTP to email
export const sendForgotPasswordOtp = createAsyncThunk(
  "otp/sendOtp",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      return { email, message: response.message };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to send OTP");
    }
  }
);

// 2. Verify the OTP
export const verifyResetOtp = createAsyncThunk(
  "otp/verifyOtp",
  async (
    { email, otp }: { email: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.verifyOtp(email, otp);
      return response.message;
    } catch (error: any) {
      return rejectWithValue(error.message || "Invalid OTP");
    }
  }
);

// 3. Change the password
export const resetPassword = createAsyncThunk(
  "otp/resetPassword",
  async (passwordResetData: any, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(passwordResetData);
      return response.message;
    } catch (error: any) {
      return rejectWithValue(error.message || "Password reset failed");
    }
  }
);

export const otpSlice = createSlice({
  name: "otp",
  initialState,
  reducers: {
    clearOtpState: (state) => {
      state.email = null;
      state.step = "email";
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
    clearOtpError: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // --- Step 1: Send OTP ---
    builder.addCase(sendForgotPasswordOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(sendForgotPasswordOtp.fulfilled, (state, action) => {
      state.loading = false;
      state.email = action.payload.email;
      state.step = "otp";
      state.successMessage = action.payload.message;
    });
    builder.addCase(sendForgotPasswordOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // --- Step 2: Verify OTP ---
    builder.addCase(verifyResetOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(verifyResetOtp.fulfilled, (state, action) => {
      state.loading = false;
      state.step = "reset";
      state.successMessage = action.payload as string;
    });
    builder.addCase(verifyResetOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // --- Step 3: Reset Password ---
    builder.addCase(resetPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(resetPassword.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = action.payload as string;
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearOtpState, clearOtpError } = otpSlice.actions;
export default otpSlice.reducer;
