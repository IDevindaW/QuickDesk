import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("Define MONGODB_URI in environment variables");

let cached = global.mongooseCache;
if (!cached) cached = global.mongooseCache = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // allow retry on next request
    throw e;
  }
  return cached.conn;
}