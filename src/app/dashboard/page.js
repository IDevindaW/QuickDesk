"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["hardware", "software", "network", "account", "other"];
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "other",
  });
  const [error, setError] = useState("");

  // filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");

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
    setForm({ title: "", description: "", priority: "medium", category: "other" });
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

  async function deleteTicket(id) {
    if (!confirm("Delete this ticket permanently?")) return;
    await fetch(`/api/tickets/${id}`, { method: "DELETE" });
    loadTickets();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const stats = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      progress: tickets.filter((t) => t.status === "in-progress").length,
      closed: tickets.filter((t) => t.status === "closed").length,
    }),
    [tickets]
  );

  const visible = useMemo(() => {
    const q = search.toLowerCase();
    const list = tickets.filter(
      (t) =>
        (statusFilter === "all" || t.status === statusFilter) &&
        `${t.title} ${t.description}`.toLowerCase().includes(q)
    );
    list.sort((a, b) => {
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "priority") return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return list;
  }, [tickets, search, statusFilter, sort]);

  if (!user) return <p>Loading...</p>;

  return (
    <>
      <div className="card header-card">
        <div>
          <h1>🎫 QuickDesk</h1>
          <small>
            Signed in as {user.name} <span className="badge">{user.role}</span>
          </small>
        </div>
        <button className="secondary" onClick={logout}>Logout</button>
      </div>

      <div className="stats">
        <div className="stat"><div className="num">{stats.total}</div><div className="label">Total</div></div>
        <div className="stat"><div className="num">{stats.open}</div><div className="label">Open</div></div>
        <div className="stat"><div className="num">{stats.progress}</div><div className="label">In progress</div></div>
        <div className="stat"><div className="num">{stats.closed}</div><div className="label">Closed</div></div>
      </div>

      <div className="card">
        <h2>New ticket</h2>
        <form onSubmit={createTicket}>
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            placeholder="Describe the issue"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid-2">
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit">Submit ticket</button>
        </form>
      </div>

      <h2>{user.role === "admin" ? "All tickets" : "My tickets"}</h2>
      <div className="card toolbar">
        <input
          placeholder="🔍 Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ margin: 0 }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ margin: 0 }}>
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In progress</option>
          <option value="closed">Closed</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ margin: 0 }}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="priority">Highest priority</option>
        </select>
      </div>

      {visible.length === 0 && <div className="empty">No tickets found.</div>}

      {visible.map((t) => (
        <div className="card" key={t._id}>
          <div className="row">
            <strong>{t.title}</strong>
            <div className="tags">
              <span className={`badge category`}>{t.category || "other"}</span>
              <span className={`badge priority-${t.priority}`}>{t.priority}</span>
              <span className={`badge status-${t.status}`}>{t.status}</span>
            </div>
          </div>
          <p style={{ marginTop: 10 }}>{t.description}</p>
          <small>
            By {t.createdByName} · {new Date(t.createdAt).toLocaleString()}
          </small>

          {user.role === "admin" && (
            <div className="ticket-actions">
              <select value={t.status} onChange={(e) => updateStatus(t._id, e.target.value)}>
                <option value="open">Open</option>
                <option value="in-progress">In progress</option>
                <option value="closed">Closed</option>
              </select>
              <button className="danger" onClick={() => deleteTicket(t._id)}>Delete</button>
            </div>
          )}
        </div>
      ))}
    </>
  );
}