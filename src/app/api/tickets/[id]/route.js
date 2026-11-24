import { connectDB } from "@/lib/db";
import Ticket from "@/models/Ticket";
import { getSession } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await request.json();

  await connectDB();
  const ticket = await Ticket.findByIdAndUpdate(id, { status }, { new: true });
  if (!ticket) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(ticket);
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await connectDB();
  const ticket = await Ticket.findByIdAndDelete(id);
  if (!ticket) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ message: "Deleted" });
}