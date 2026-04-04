import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/server/utils/authUtils";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });
  clearAuthCookies(response);
  return response;
}
