import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["open", "in-progress", "closed"], default: "open" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdByName: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);