import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { createToken, setSessionCookie } from "@/lib/auth";

export async function POST(request) {
  const { email, password } = await request.json();
  await connectDB();

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createToken({
    id: user._id.toString(),
    name: user.name,
    role: user.role,
  });
  await setSessionCookie(token);
  return Response.json({ message: "Logged in", role: user.role });
}