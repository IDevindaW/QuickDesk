import { connectDB } from "@/lib/db";
import Ticket from "@/models/Ticket";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const filter = session.role === "admin" ? {} : { createdBy: session.id };
  const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
  return Response.json(tickets);
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, priority, category } = await request.json();
  if (!title || !description) {
    return Response.json({ error: "Title and description required" }, { status: 400 });
  }

  await connectDB();
  const ticket = await Ticket.create({
    title,
    description,
    priority,
    category,
    createdBy: session.id,
    createdByName: session.name,
  });
  return Response.json(ticket, { status: 201 });
}