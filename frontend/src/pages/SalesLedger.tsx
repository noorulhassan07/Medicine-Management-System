import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Sale {
  _id: string;
  medicineName: string;
  quantitySold: number;
  salePrice: number;
  totalAmount: number;
  saleDate: string;
  remainingQuantity: number;
  customerName: string;
}

const SalesLedger: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sales`);
      const data = await res.json();
      setSales(data);
    } catch (err) {
      console.error("Failed to fetch sales", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        📋 Sales Ledger
      </h2>

      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        {sales.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#6f42c1", color: "white" }}>
                <th style={thStyle}>Date & Time</th>
                <th style={thStyle}>Medicine</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Qty Sold</th>
                <th style={thStyle}>Price/Unit</th>
                <th style={thStyle}>Total Amount</th>
                <th style={thStyle}>Remaining Qty</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, index) => (
                <tr key={sale._id} style={{ 
                  textAlign: "center",
                  backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white"
                }}>
                  <td style={tdStyle}>{formatDate(sale.saleDate)}</td>
                  <td style={tdStyle}>{sale.medicineName}</td>
                  <td style={tdStyle}>{sale.customerName || "Walk-in"}</td>
                  <td style={tdStyle}>{sale.quantitySold}</td>
                  <td style={tdStyle}>{sale.salePrice} PKR</td>
                  <td style={{...tdStyle, fontWeight: "bold", color: "#28a745"}}>
                    {sale.totalAmount} PKR
                  </td>
                  <td style={tdStyle}>{sale.remainingQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            No sales records found.
          </div>
        )}
      </div>
    </div>
  );
};

const thStyle = {
  padding: "12px",
  textAlign: "center" as const,
  fontWeight: "bold",
  fontSize: "14px",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
  fontSize: "13px",
};

export default SalesLedger;
