import { NextResponse } from "next/server";
import { connectMongo } from "@/server/mongoose";
import User from "@/server/models/User";
import { getTokensFromRequest, verifyAccessToken, verifyRefreshToken } from "@/server/utils/authUtils";

// Check if requester is admin
const checkAdminAuth = async (request: Request) => {
  const { accessToken, refreshToken } = getTokensFromRequest(request);
  
  let decoded = verifyAccessToken(accessToken);
  if (!decoded && refreshToken) {
    decoded = verifyRefreshToken(refreshToken);
  }

  if (!decoded || decoded.role !== "admin") return false;
  return true;
};

// GET all users
export async function GET(request: Request) {
  try {
    await connectMongo();
    if (!(await checkAdminAuth(request))) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const users = await User.find().select("-password -otp -otpExpiry").sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

// POST create a new user
export async function POST(request: Request) {
  try {
    await connectMongo();
    if (!(await checkAdminAuth(request))) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role
    });

    await newUser.save();

    const userObj = newUser.toObject();
    const { password: _, ...secureUserObj } = userObj;

    return NextResponse.json(secureUserObj, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
