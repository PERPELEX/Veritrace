import { NextResponse } from "next/server";
import { connectMongo } from "@/server/mongoose";
import Profile from "@/server/models/Profile";
import { getTokensFromRequest, verifyAccessToken, verifyRefreshToken } from "@/server/utils/authUtils";

const getAuthUser = async (request: Request) => {
  const { accessToken, refreshToken } = getTokensFromRequest(request);
  
  let decoded = verifyAccessToken(accessToken);
  if (!decoded && refreshToken) {
    decoded = verifyRefreshToken(refreshToken);
  }

  return decoded; // { userId, role } or null
};

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const profile = await Profile.findOne({ user: auth.userId });
    
    if (!profile) {
      return NextResponse.json({}); // Return empty object if no profile yet
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pfpUrl, bio, birthdate, organisation, address } = body;

    await connectMongo();
    
    const updateData: any = {
      pfpUrl: pfpUrl || "",
      bio: bio || "",
      organisation: organisation || "",
      address: address || "",
    };

    if (birthdate) {
      updateData.birthdate = new Date(birthdate);
    }

    const profile = await Profile.findOneAndUpdate(
      { user: auth.userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
