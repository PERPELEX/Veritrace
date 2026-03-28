import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { signSessionToken } from "@/lib/auth-token";
import { getSqlPool } from "@/lib/db";

const loginSchema = z.object({
  username: z.string().trim().min(3).max(100),
  password: z.string().min(8).max(128),
});

type AdminUserRecord = {
  id: number;
  username: string;
  password_hash: string;
  full_name: string;
  role: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = loginSchema.parse(body);

    const pool = await getSqlPool();
    const result = await pool
      .request()
      .input("username", payload.username)
      .query<AdminUserRecord>(`
        SELECT TOP 1 id, username, password_hash, full_name, role
        FROM dbo.AdminLogin
        WHERE username = @username AND is_active = 1
      `);

    const user = result.recordset[0];

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid username or password." }, { status: 401 });
    }

    const valid = await bcrypt.compare(payload.password, user.password_hash);

    if (!valid) {
      return NextResponse.json({ success: false, message: "Invalid username or password." }, { status: 401 });
    }

    const token = await signSessionToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      fullName: user.full_name,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set("veritrace_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Enter valid credentials." }, { status: 400 });
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown login error";
    console.error("Login route error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development"
            ? `Login failed: ${errorMessage}`
            : "Login failed due to server configuration. Please verify DB settings.",
      },
      { status: 500 },
    );
  }
}
