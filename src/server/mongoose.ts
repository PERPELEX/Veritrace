import mongoose from "mongoose";

declare global {
  var __mongooseConnection: Promise<typeof mongoose> | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

export async function connectMongo() {
  if (global.__mongooseConnection) {
    return global.__mongooseConnection;
  }

  global.__mongooseConnection = mongoose.connect(MONGODB_URI as string).then((m) => {
    console.log("MongoDB connected");
    return m;
  });

  return global.__mongooseConnection;
}
