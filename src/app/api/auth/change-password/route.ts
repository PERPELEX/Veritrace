import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongo } from "@/server/mongoose";
import User from "@/server/models/User";

export async function POST(request: Request) {
  try {
    await connectMongo();
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { message: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user || !user.otp) {
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Check expiry
    if (user.otpExpiry && new Date() > user.otpExpiry) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save({ validateModifiedOnly: true });
      return NextResponse.json(
        { message: "OTP has expired" },
        { status: 400 }
      );
    }

    // Verify OTP one more time
    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (err: any) {
    console.error("Change password error:", err);
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
