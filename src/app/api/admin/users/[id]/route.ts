import { NextResponse } from "next/server";
import { connectMongo } from "@/server/mongoose";
import User from "@/server/models/User";
import { getTokensFromRequest, verifyAccessToken, verifyRefreshToken } from "@/server/utils/authUtils";

const checkAdminAuth = async (request: Request) => {
  const { accessToken, refreshToken } = getTokensFromRequest(request);
  let decoded = verifyAccessToken(accessToken);
  if (!decoded && refreshToken) {
    decoded = verifyRefreshToken(refreshToken);
  }
  if (!decoded || decoded.role !== "admin") return false;
  return true;
};

// PUT update user role
export async function PUT(request: Request, context: any) {
  try {
    await connectMongo();
    if (!(await checkAdminAuth(request))) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const id = context.params.id;
    const body = await request.json();
    const { role } = body;

    if (!role || !["admin", "analyst", "client"].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password -otp -otpExpiry");

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(request: Request, context: any) {
  try {
    await connectMongo();
    if (!(await checkAdminAuth(request))) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const id = context.params.id;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
