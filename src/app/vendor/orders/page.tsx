"use client";
import React, { useCallback, useEffect, useState } from "react";

type VendorOrder = {
  id: string;
  status: string;
  createdAt: string;
  student: { name: string | null; email: string } | null;
  files: { fileName: string; fileUrl: string }[];
};

const statusFlow: Record<string, string[]> = {
  PAYMENT_PENDING: ["ACCEPTED", "REJECTED"],
  PAID: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["READY"],
  READY: ["COMPLETED"],
};

function labelStatus(status: string) {
  return status.replace(/_/g, " ");
}

export default function VendorOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = statusFilter === "ALL" ? "" : `?status=${statusFilter}`;
      const res = await fetch(`/api/vendor/orders${query}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    setPendingOrderId(orderId);
    try {
      const res = await fetch("/api/vendor/order-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });

      if (res.ok) {
        await loadOrders();
        setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status } : prev));
      }
    } finally {
      setPendingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    return (
      order.id.toLowerCase().includes(q) ||
      (order.student?.name || "").toLowerCase().includes(q) ||
      (order.student?.email || "").toLowerCase().includes(q) ||
      (order.files?.[0]?.fileName || "").toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ position: "relative", minHeight: "calc(100vh - 160px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 className="fraunces text-ink" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
          Order Management
        </h2>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            className="ink-input"
            placeholder="Search id, student, file"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "220px" }}
          />
          <select
            className="paper-sheet"
            style={{ padding: "8px 16px", fontSize: "12px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PAYMENT_PENDING">Payment Pending</option>
            <option value="PAID">Paid</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="READY">Ready</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <section className="paper-sheet" style={{ overflow: "hidden" }}>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(62,32,40,0.1)", background: "rgba(62,32,40,0.02)" }}>
                <th className="label" style={{ padding: "12px 16px", fontSize: "9px" }}>
                  ORDER ID
                </th>
                <th className="label" style={{ padding: "12px 16px", fontSize: "9px" }}>
                  STUDENT
                </th>
                <th className="label" style={{ padding: "12px 16px", fontSize: "9px" }}>
                  FILE
                </th>
                <th className="label" style={{ padding: "12px 16px", fontSize: "9px" }}>
                  STATUS
                </th>
                <th className="label" style={{ padding: "12px 16px", fontSize: "9px" }}>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="label" style={{ padding: "16px" }} colSpan={5}>
                    Loading orders...
                  </td>
                </tr>
              )}

              {!isLoading && filteredOrders.length === 0 && (
                <tr>
                  <td className="label" style={{ padding: "16px" }} colSpan={5}>
                    No orders found.
                  </td>
                </tr>
              )}

              {filteredOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: "1px solid rgba(62,32,40,0.05)" }}>
                  <td className="nav-text" style={{ padding: "16px", fontSize: "13px", fontWeight: 700 }}>
                    #{order.id.slice(0, 8)}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div className="lora" style={{ fontSize: "13px", fontWeight: 600 }}>
                      {order.student?.name || "Student"}
                    </div>
                    <div className="label" style={{ fontSize: "9px", opacity: 0.5 }}>
                      {order.student?.email || "-"}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div className="nav-text" style={{ fontSize: "12px", color: "var(--wax-red)", textDecoration: "underline" }}>
                      {order.files?.[0]?.fileName || "Document"}
                    </div>
                    <div className="label" style={{ fontSize: "9px", opacity: 0.5 }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 900,
                        padding: "4px 8px",
                        borderRadius: "4px",
                        background: order.status === "READY" ? "rgba(45,90,39,0.1)" : "rgba(139,30,43,0.05)",
                        color: order.status === "READY" ? "#2d5a27" : "var(--wax-red)",
                      }}
                    >
                      {labelStatus(order.status)}
                    </span>
                  </td>
                  <td style={{ padding: "16px", display: "flex", gap: "8px", alignItems: "center" }}>
                    {(statusFlow[order.status] || []).map((nextStatus) => (
                      <button
                        key={nextStatus}
                        onClick={() => updateStatus(order.id, nextStatus)}
                        className="btn-signup"
                        style={{ padding: "4px 10px", fontSize: "9px" }}
                        disabled={pendingOrderId === order.id}
                      >
                        {labelStatus(nextStatus)}
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="btn-signin"
                      style={{ padding: "4px 12px", fontSize: "10px", width: "auto" }}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedOrder && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "450px",
            height: "100vh",
            background: "var(--bg-parchment)",
            boxShadow: "-10px 0 30px rgba(0,0,0,0.1)",
            zIndex: 100,
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            borderLeft: "1px solid rgba(62,32,40,0.1)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="fraunces text-ink" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
              Order #{selectedOrder.id.slice(0, 8)}
            </h3>
            <button onClick={() => setSelectedOrder(null)} style={{ fontSize: "20px", opacity: 0.5 }}>
              x
            </button>
          </div>

          <div className="founders-rule" style={{ opacity: 0.1 }}></div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <section>
              <div className="label" style={{ fontSize: "10px", marginBottom: "8px" }}>
                ORDER DETAILS
              </div>
              <div className="paper-sheet" style={{ padding: "20px", background: "rgba(62,32,40,0.02)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                  <div>
                    <div className="label" style={{ fontSize: "8px", opacity: 0.5 }}>
                      FILE
                    </div>
                    <div className="nav-text" style={{ fontSize: "13px" }}>
                      {selectedOrder.files?.[0]?.fileName || "Document"}
                    </div>
                  </div>
                  <div>
                    <div className="label" style={{ fontSize: "8px", opacity: 0.5 }}>
                      STUDENT
                    </div>
                    <div className="nav-text" style={{ fontSize: "13px" }}>
                      {selectedOrder.student?.name || "Student"}
                    </div>
                  </div>
                  <div>
                    <div className="label" style={{ fontSize: "8px", opacity: 0.5 }}>
                      CURRENT STATUS
                    </div>
                    <div className="nav-text" style={{ fontSize: "13px" }}>
                      {labelStatus(selectedOrder.status)}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="label" style={{ fontSize: "10px", marginBottom: "8px" }}>
                STATUS UPDATE
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {(statusFlow[selectedOrder.status] || []).map((nextStatus) => (
                  <button
                    key={nextStatus}
                    className="btn-signup"
                    style={{ fontSize: "11px" }}
                    onClick={() => updateStatus(selectedOrder.id, nextStatus)}
                    disabled={pendingOrderId === selectedOrder.id}
                  >
                    Mark as {labelStatus(nextStatus)}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
