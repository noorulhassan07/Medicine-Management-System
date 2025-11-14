import React from "react";
import { Medicine } from "../types/Medicine";

interface Props {
  medicines: Medicine[];
}

const MedicineTable: React.FC<Props> = ({ medicines }) => {
  // Helper: calculate status color
  const getStatusColor = (exp: string) => {
    const today = new Date();
    const expDate = new Date(exp);
    const diffDays = (expDate.getTime() - today.getTime()) / (1000 * 3600 * 24);

    if (diffDays < 0) return "#dc3545"; // expired = red
    if (diffDays < 30) return "#ffc107"; // near expiry = yellow
    return "#28a745"; // good = green
  };

  return (
    <div
      style={{
        padding: "40px 80px",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#007BFF",
          marginBottom: "30px",
          fontWeight: "bold",
          fontSize: "26px",
        }}
      >
        💊 Medicine Dashboard
      </h1>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#fff",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#007BFF", color: "white" }}>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Qty</th>
            <th style={thStyle}>MFG</th>
            <th style={thStyle}>EXP</th>
            <th style={thStyle}>Entry</th>
            <th style={thStyle}>Price</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {medicines.length > 0 ? (
            medicines.map((m) => (
              <tr
                key={m._id}
                style={{
                  textAlign: "center",
                  borderBottom: "1px solid #ddd",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f2f6ff")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "white")
                }
              >
                <td style={tdStyle}>{m.name}</td>
                <td style={tdStyle}>{m.quantity}</td>
                <td style={tdStyle}>{m.manufacturingDate}</td>
                <td style={tdStyle}>{m.expiryDate}</td>
                <td style={tdStyle}>{m.dateOfEntry}</td>
                <td style={tdStyle}>Rs. {m.price}</td>
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
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: getStatusColor(m.expiryDate),
                        boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                      }}
                    ></span>
                    <span style={{ fontSize: "14px", color: "#333" }}>
                      {getStatusColor(m.expiryDate) === "#dc3545"
                        ? "Expired"
                        : getStatusColor(m.expiryDate) === "#ffc107"
                        ? "Near Expiry"
                        : "Active"}
                    </span>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={7}
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#999",
                }}
              >
                No medicines found 😕
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Shared styles
const thStyle: React.CSSProperties = {
  padding: "14px 8px",
  fontSize: "15px",
  fontWeight: "bold",
  letterSpacing: "0.5px",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 8px",
  fontSize: "14px",
  color: "#333",
};

export default MedicineTable;
