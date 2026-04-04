"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "@/store/slices/authSlice";
import { AppDispatch, RootState } from "@/store/store";
import { usePathname, useRouter } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();

  const { user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (loading) return;

    const isPublicRoute =
      pathname === "/" ||
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/forgot-password";

    const isProtectedRoute = pathname.startsWith("/dashboard");

    if (user) {
      if (isPublicRoute) {
        // Do not redirect immediately if we are on a route with the splash screen
        // and the splash screen hasn't finished showing yet.
        const isLoginPage = pathname === "/" || pathname === "/login";
        const splashDone =
          typeof window !== "undefined" &&
          sessionStorage.getItem("hasShownSplash") === "true";

        if (isLoginPage && !splashDone) {
          return; // Let the splash screen and transition finish
        }

        if (
          typeof window !== "undefined" &&
          sessionStorage.getItem("isAuthTransitioning") === "true"
        ) {
          return; // Let the exit transitions on forms finish
        }

        router.push("/dashboard");
      }
    } else {
      if (isProtectedRoute) {
        router.push("/login");
      }
    }
  }, [user, loading, pathname, router]);

  return <>{children}</>;
}
