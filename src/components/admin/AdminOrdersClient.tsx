"use client";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

type AdminOrder = {
  id: string;
  status: string;
  createdAt: string;
  totalPaid: number;
  pages: number | null;
  copies: number | null;
  printType: string | null;
  paperType: string | null;
  deliveryAddress: string | null;
  student: { name: string | null; email: string };
  vendor: { shopName: string };
  files: { id: string; fileName: string; fileUrl: string }[];
};

type AdminNote = {
  id: string;
  details: string | null;
  createdAt: string;
  user: { name: string | null; email: string };
};

function extractNote(details: string | null, orderId: string) {
  if (!details) return "";
  const prefix = `ORDER_NOTE:${orderId}:`;
  return details.startsWith(prefix) ? details.slice(prefix.length) : details;
}

export function AdminOrdersClient() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [noteText, setNoteText] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search.trim()) params.set("q", search.trim());
      const suffix = params.toString() ? `?${params.toString()}` : "";

      const res = await fetch(`/api/admin/orders${suffix}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async (orderId: string) => {
    setNoteLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/notes?orderId=${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      } else {
        setNotes([]);
      }
    } finally {
      setNoteLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const setOrderStatus = async (orderId: string, status: string) => {
    setError("");
    setPendingId(orderId);
    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status, note: "Updated by admin oversight panel" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to update order status" }));
        setError(data.error || "Failed to update order status");
        return;
      }

      await loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status } : prev));
      }
    } finally {
      setPendingId(null);
    }
  };

  const addNote = async () => {
    if (!selectedOrder || noteText.trim().length < 3) return;
    setNoteSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrder.id, note: noteText.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to add note" }));
        setError(data.error || "Failed to add note");
        return;
      }

      setNoteText("");
      await loadNotes(selectedOrder.id);
    } finally {
      setNoteSaving(false);
    }
  };

  return (
    <div className="reveal-up active">
      <header className="admin-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 className="fraunces text-ink" style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Order Oversight</h2>
          <p className="lora italic opacity-60">"Tracking fulfillment across the platform's vendor network."</p>
        </div>
        <div className="admin-controls">
          <input
            className="ink-input"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
            style={{ width: '220px', padding: '8px 12px', fontSize: '11px' }}
          />
          <select
            className="ink-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', fontSize: '11px' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="READY">Ready for Pickup</option>
            <option value="COMPLETED">Completed</option>
            <option value="DISPUTED">Disputed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </header>

      {error && <div className="paper-sheet mb-4" style={{ padding: '10px', color: 'var(--wax-red)', fontSize: '12px' }}>{error}</div>}

      <section className="paper-sheet" style={{ padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '920px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(62,32,40,0.1)', textAlign: 'left' }}>
                <th style={{ padding: '15px 12px' }} className="label">Order & Content</th>
                <th style={{ padding: '15px 12px' }} className="label">Participants</th>
                <th style={{ padding: '15px 12px' }} className="label">Specifications</th>
                <th style={{ padding: '15px 12px' }} className="label">Status</th>
                <th style={{ padding: '15px 12px' }} className="label">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center' }}>Searching archives...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', opacity: 0.4 }} className="lora italic">No orders match the current criteria.</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid rgba(62,32,40,0.05)' }}>
                  <td style={{ padding: '20px 12px' }}>
                    <div style={{ fontWeight: 800, fontSize: '13px' }} className="text-ink">#{order.id.slice(0, 8).toUpperCase()}</div>
                    <div style={{ fontSize: '10px', fontWeight: 600, marginTop: '4px' }}>{order.files?.[0]?.fileName || "Generic Doc"}</div>
                    <div style={{ fontSize: '9px', opacity: 0.5, marginTop: '4px' }}>{format(new Date(order.createdAt), "MMM d, HH:mm")}</div>
                  </td>
                  <td style={{ padding: '20px 12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700 }} className="text-ink">{order.student?.name || "Anonymous Student"}</div>
                    <div style={{ fontSize: '10px', opacity: 0.5 }}>By: <span style={{ fontWeight: 600 }}>{order.vendor?.shopName || "Vendor"}</span></div>
                  </td>
                  <td style={{ padding: '20px 12px' }}>
                    <div style={{ fontSize: '10px' }}>
                      <span style={{ fontWeight: 700 }}>{order.pages || "?"} pgs</span> • <span style={{ fontWeight: 700 }}>{order.copies || "?"} copies</span>
                    </div>
                    <div style={{ fontSize: '9px', marginTop: '4px', display: 'flex', gap: '4px' }}>
                      <span style={{ background: 'rgba(62,32,40,0.05)', padding: '2px 4px', borderRadius: '2px' }}>{order.printType || 'BW'}</span>
                      <span style={{ background: 'rgba(62,32,40,0.05)', padding: '2px 4px', borderRadius: '2px' }}>{order.paperType || 'Standard'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 12px' }}>
                    <span style={{
                      fontSize: '8px',
                      padding: '3px 7px',
                      background: order.status === 'COMPLETED' ? '#10b981' : order.status === 'DISPUTED' ? 'var(--wax-red)' : 'var(--ink-primary)',
                      color: 'white',
                      borderRadius: '2px',
                      fontWeight: 900,
                      letterSpacing: '0.5px'
                    }}>{order.status}</span>
                  </td>
                  <td style={{ padding: '20px 12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-signin"
                        style={{ padding: '6px 10px', fontSize: '9px', minWidth: '60px' }}
                        onClick={() => { setSelectedOrder(order); loadNotes(order.id); }}
                      >Details</button>
                      <button
                        className="btn-signin"
                        style={{
                          padding: '6px',
                          background: 'white',
                          border: '1px solid rgba(62,32,40,0.1)',
                          color: 'var(--wax-red)'
                        }}
                        onClick={() => setOrderStatus(order.id, 'CANCELLED')}
                        disabled={pendingId === order.id}
                      >⛌</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── ORDER DETAIL SIDEBAR ── */}
      {selectedOrder && (
        <div className="admin-drawer reveal-up active">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h3 className="fraunces text-ink" style={{ fontSize: '1.5rem', fontWeight: 900 }}>Order Analysis</h3>
            <button onClick={() => setSelectedOrder(null)} className="label" style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '9px' }}>[ Close ]</button>
          </div>

          <section className="paper-sheet mb-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div className="label" style={{ fontSize: '8px', opacity: 0.5 }}>Serial Number</div>
                <div className="fraunces" style={{ fontWeight: 800 }}>#{selectedOrder.id}</div>
              </div>
              <div className="wax-seal" style={{ width: '40px', height: '40px' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div className="label" style={{ fontSize: '8px', opacity: 0.5 }}>Fulfillment Status</div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--wax-red)' }}>{selectedOrder.status}</div>
              </div>
              <div>
                <div className="label" style={{ fontSize: '8px', opacity: 0.5 }}>Value Settled</div>
                <div style={{ fontSize: '10px', fontWeight: 800 }}>₹{selectedOrder.totalPaid.toFixed(2)}</div>
              </div>
            </div>
          </section>

          <section className="paper-sheet mb-6" style={{ background: 'rgba(62,32,40,0.02)' }}>
            <h4 className="fraunces mb-3" style={{ fontSize: '0.9rem' }}>Delivery & Location</h4>
            <p className="lora italic" style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              {selectedOrder.deliveryAddress || "Self-pickup scheduled at vendor station."}
            </p>
          </section>

          <section className="paper-sheet mb-6">
            <h4 className="fraunces mb-4" style={{ fontSize: '0.9rem' }}>Administrative Notes</h4>
            <textarea
              className="ink-input"
              rows={3}
              placeholder="Log internal observations..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              style={{ fontSize: '11px', marginBottom: '12px' }}
            ></textarea>
            <button className="btn-signup" style={{ width: '100%', fontSize: '10px' }} onClick={addNote} disabled={noteSaving}>
              {noteSaving ? "Recording..." : "Archive Note"}
            </button>

            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {noteLoading ? (
                <div className="lora italic" style={{ fontSize: '10px', opacity: 0.5 }}>Retrieving timeline...</div>
              ) : notes.map(n => (
                <div key={n.id} style={{ borderLeft: '1px solid var(--wax-red)', paddingLeft: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800 }}>{n.user.name || "System Admin"}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7, margin: '4px 0' }}>{extractNote(n.details, selectedOrder.id)}</div>
                  <div style={{ fontSize: '8px', opacity: 0.4 }}>{format(new Date(n.createdAt), "MMM d, HH:mm")}</div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ padding: '10px 0' }}>
            <div className="label" style={{ fontSize: '8px', opacity: 0.5, marginBottom: '10px' }}>System Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button className="btn-signin" style={{ fontSize: '9px' }} onClick={() => setOrderStatus(selectedOrder.id, 'DISPUTED')}>Flag Dispute</button>
              <button className="btn-signin" style={{ fontSize: '9px' }} onClick={() => setOrderStatus(selectedOrder.id, 'COMPLETED')}>Mark Completed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
