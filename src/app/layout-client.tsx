"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import AuthProvider from "@/app/AuthProvider";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
}
