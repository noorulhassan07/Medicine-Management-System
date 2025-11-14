import React, { useEffect, useState } from "react";

// Add this line - Vite uses import.meta.env
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Medicine {
  _id: string;
  name: string;
  quantity: number;
  manufacturingDate: string;
  expiryDate: string;
  dateOfEntry: string;
  price: number;
}

const Dashboard: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    // CHANGED: Use the environment variable
    fetch(`${API_URL}/api/medicines`)
      .then((res) => res.json())
      .then((data) => setMedicines(data))
      .catch((err) => console.error(err));
  }, []);

  const getStatusDot = (expiry: string, qty: number) => {
    const expDate = new Date(expiry);
    const now = new Date();
    const diffMonths =
      (expDate.getFullYear() - now.getFullYear()) * 12 +
      (expDate.getMonth() - now.getMonth());

    if (diffMonths <= 8) return { color: "red", label: "Expiring Soon" };
    if (qty < 15) return { color: "blue", label: "Restock Needed" };
    return { color: "green", label: "Healthy Stock" };
  };

  return (
    <div style={{ padding: "30px" }}>
<h2
  style={{
    marginBottom: "25px",
    fontWeight: "bold",
    fontSize: "28px",
    background: "linear-gradient(90deg, #007BFF, #00C6FF)",
    color: "white",
    display: "inline-block",
    padding: "12px 25px",
    borderRadius: "50px",
    boxShadow: "0 4px 10px rgba(0, 123, 255, 0.3)",
    letterSpacing: "1px",
  }}
>
  📊 Medicine Dashboard
</h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#fff",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#007BFF", color: "white" }}>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Qty</th>
            <th style={thStyle}>MFG</th>
            <th style={thStyle}>EXP</th>
            <th style={thStyle}>Entry</th>
            <th style={thStyle}>Price (PKR)</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {medicines.length > 0 ? (
            medicines.map((m, i) => {
              const status = getStatusDot(m.expiryDate, m.quantity);
              return (
                <tr key={m._id} style={{ textAlign: "center" }}>
                  <td style={tdStyle}>{i + 1}</td>
                  <td style={tdStyle}>{m.name}</td>
                  <td style={tdStyle}>{m.quantity}</td>
                  <td style={tdStyle}>{m.manufacturingDate.slice(0, 10)}</td>
                  <td style={tdStyle}>{m.expiryDate.slice(0, 10)}</td>
                  <td style={tdStyle}>{m.dateOfEntry.slice(0, 10)}</td>
                  <td style={tdStyle}>{m.price}</td>
                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          height: "12px",
                          width: "12px",
                          backgroundColor: status.color,
                          borderRadius: "50%",
                          display: "inline-block",
                        }}
                      ></span>
                      <small style={{ color: "#555" }}>{status.label}</small>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", padding: "15px" }}>
                No medicines found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = {
  padding: "10px",
  textAlign: "center" as const,
  fontWeight: "bold",
  fontSize: "14px",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
  fontSize: "13px",
};

export default Dashboard;
