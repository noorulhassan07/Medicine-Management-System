import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface HistoryEntry {
  _id: string;
  medicineId: string;
  medicineName: string;
  action: string;
  details: string;
  timestamp: string;
}

const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/medicines/history`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return '#28a745';
      case 'updated': return '#ffc107';
      case 'deleted': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return '➕';
      case 'updated': return '✏️';
      case 'deleted': return '🗑️';
      default: return '📝';
    }
  };

  return (
    <div style={{ padding: "30px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <h2
        style={{
          marginBottom: "25px",
          fontWeight: "bold",
          fontSize: "28px",
          background: "linear-gradient(90deg, #6f42c1, #e83e8c)",
          color: "white",
          display: "inline-block",
          padding: "12px 25px",
          borderRadius: "50px",
          boxShadow: "0 4px 10px rgba(111, 66, 193, 0.3)",
          letterSpacing: "1px",
        }}
      >
        📜 Medicine History
      </h2>

      <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        {history.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {history.map((entry, index) => (
              <div
                key={entry._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "15px",
                  borderLeft: `4px solid ${getActionColor(entry.action)}`,
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  gap: "15px"
                }}
              >
                <div style={{ fontSize: "20px" }}>
                  {getActionIcon(entry.action)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", color: "#333" }}>
                    {entry.medicineName}
                  </div>
                  <div style={{ color: "#666", fontSize: "14px" }}>
                    {entry.details}
                  </div>
                  <div style={{ color: "#999", fontSize: "12px", marginTop: "5px" }}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: getActionColor(entry.action),
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    textTransform: "capitalize"
                  }}
                >
                  {entry.action}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            No history records found.
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
