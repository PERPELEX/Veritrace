import { NextResponse } from "next/server";
import { connectMongo } from "@/server/mongoose";
import User from "@/server/models/User";
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  getTokensFromRequest,
} from "@/server/utils/authUtils";

export async function GET(request: Request) {
  try {
    await connectMongo();
    const { accessToken, refreshToken } = getTokensFromRequest(request);

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { message: "No tokens provided" },
        { status: 401 }
      );
    }

    // Try access token first
    let decoded = verifyAccessToken(accessToken);

    if (decoded) {
      const user = await User.findById(decoded.userId).select(
        "-password -otp -otpExpiry"
      );
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: "Token is valid",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    }

    // Access token expired — try refresh token
    if (refreshToken) {
      decoded = verifyRefreshToken(refreshToken);

      if (!decoded) {
        return NextResponse.json(
          { message: "Refresh token expired. Please login again." },
          { status: 401 }
        );
      }

      const user = await User.findById(decoded.userId).select(
        "-password -otp -otpExpiry"
      );
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken(
        user._id.toString(),
        user.role
      );
      const newRefreshToken = generateRefreshToken(
        user._id.toString(),
        user.role
      );

      const response = NextResponse.json({
        message: "Token is valid",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });

      setAccessTokenCookie(response, newAccessToken);
      setRefreshTokenCookie(response, newRefreshToken);

      return response;
    }

    return NextResponse.json(
      { message: "Invalid or expired tokens" },
      { status: 401 }
    );
  } catch (err: any) {
    console.error("Check token error:", err);
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
