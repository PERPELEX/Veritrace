import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import otpReducer from "@/store/slices/otpSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    otp: otpReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
