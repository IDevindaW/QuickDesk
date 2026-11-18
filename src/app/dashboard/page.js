"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" });
  const [error, setError] = useState("");

  async function loadTickets() {
    const res = await fetch("/api/tickets");
    if (res.ok) setTickets(await res.json());
  }

  useEffect(() => {
    async function init() {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return router.push("/login");
      setUser(await res.json());
      loadTickets();
    }
    init();
  }, [router]);

  async function createTicket(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setForm({ title: "", description: "", priority: "medium" });
    loadTickets();
  }

  async function updateStatus(id, status) {
    await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadTickets();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (!user) return <p>Loading...</p>;

  return (
    <>
      <div className="card row">
        <div>
          <h1>QuickDesk</h1>
          <span>{user.name} <span className="badge">{user.role}</span></span>
        </div>
        <button className="secondary" onClick={logout}>Logout</button>
      </div>

      <div className="card">
        <h2>New ticket</h2>
        <form onSubmit={createTicket}>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea placeholder="Describe the issue" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {error && <p className="error">{error}</p>}
          <button type="submit">Submit ticket</button>
        </form>
      </div>

      <h2>{user.role === "admin" ? "All tickets" : "My tickets"}</h2>
      {tickets.length === 0 && <p>No tickets yet.</p>}
      {tickets.map((t) => (
        <div className="card" key={t._id}>
          <div className="row">
            <strong>{t.title}</strong>
            <span className="badge">{t.priority}</span>
          </div>
          <p>{t.description}</p>
          <small>By {t.createdByName} · {new Date(t.createdAt).toLocaleString()}</small>
          <div style={{ marginTop: 10 }}>
            {user.role === "admin" ? (
              <select value={t.status} onChange={(e) => updateStatus(t._id, e.target.value)}>
                <option value="open">Open</option>
                <option value="in-progress">In progress</option>
                <option value="closed">Closed</option>
              </select>
            ) : (
              <span className="badge">{t.status}</span>
            )}
          </div>
        </div>
      ))}
    </>
  );
}