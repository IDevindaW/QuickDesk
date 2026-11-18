import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  const { name, email, password } = await request.json();
  if (!name || !email || !password) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  await connectDB();
  const existing = await User.findOne({ email });
  if (existing) {
    return Response.json({ error: "Email already registered" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashed });
  return Response.json({ message: "Registered successfully" }, { status: 201 });
}