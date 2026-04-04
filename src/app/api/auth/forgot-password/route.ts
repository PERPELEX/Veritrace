import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongo } from "@/server/mongoose";
import User from "@/server/models/User";
import { sendOtpEmail } from "@/server/helpers/emailHelper";

export async function POST(request: Request) {
  try {
    await connectMongo();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether user exists
      return NextResponse.json({
        message: "If an account with that email exists, an OTP has been sent",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before storing
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Save hashed OTP + 5 minute expiry
    user.otp = hashedOtp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save({ validateModifiedOnly: true });

    // Send plain OTP via email
    await sendOtpEmail(email, otp);

    return NextResponse.json({
      message: "If an account with that email exists, an OTP has been sent",
    });
  } catch (err: any) {
    console.error("🔥 [FORGOT-PASSWORD] Error:", err);
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
