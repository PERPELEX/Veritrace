import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send OTP email to user
 */
export async function sendOtpEmail(to: string, otp: string) {
  const mailOptions = {
    from: `"VeriTrace" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your VeriTrace Verification Code",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8faf9; border-radius: 12px;">
        <h2 style="color: #0c3f2c; margin-bottom: 8px;">VeriTrace</h2>
        <p style="color: #333; font-size: 15px;">You requested a password reset. Use the code below to verify your identity:</p>
        <div style="text-align: center; margin: 28px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0c3f2c; background: #e6f4ee; padding: 16px 32px; border-radius: 8px;">
            ${otp}
          </span>
        </div>
        <p style="color: #666; font-size: 13px;">This code expires in <strong>5 minutes</strong>.</p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error);
    throw error;
  }
}
