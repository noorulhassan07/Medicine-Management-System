import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Sale {
  _id: string;
  medicineName: string;
  quantitySold: number;
  salePrice: number;
  totalAmount: number;
  saleDate: string;
  customerName: string;
}

interface Medicine {
  _id: string;
  name: string;
  quantity: number;
  price: number;
}

const Analytics: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days">("30days");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, medicinesRes] = await Promise.all([
        fetch(`${API_URL}/api/sales`),
        fetch(`${API_URL}/api/medicines`)
      ]);
      
      const salesData = await salesRes.json();
      const medicinesData = await medicinesRes.json();
      
      setSales(salesData);
      setMedicines(medicinesData);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter sales by time range
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.saleDate);
    const now = new Date();
    const diffTime = now.getTime() - saleDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    switch (timeRange) {
      case "7days": return diffDays <= 7;
      case "30days": return diffDays <= 30;
      case "90days": return diffDays <= 90;
      default: return true;
    }
  });

  // Calculate daily sales
  const dailySales = filteredSales.reduce((acc, sale) => {
    const date = new Date(sale.saleDate).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { total: 0, count: 0 };
    }
    acc[date].total += sale.totalAmount;
    acc[date].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  // Top selling medicines
  const topMedicines = filteredSales.reduce((acc, sale) => {
    if (!acc[sale.medicineName]) {
      acc[sale.medicineName] = { quantity: 0, revenue: 0 };
    }
    acc[sale.medicineName].quantity += sale.quantitySold;
    acc[sale.medicineName].revenue += sale.totalAmount;
    return acc;
  }, {} as Record<string, { quantity: number; revenue: number }>);

  const topMedicinesArray = Object.entries(topMedicines)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // Calculate statistics
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalTransactions = filteredSales.length;
  const averageSale = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Find max values for chart scaling
  const maxRevenue = Math.max(...Object.values(dailySales).map(d => d.total), 1);
  const maxQuantity = Math.max(...Object.values(dailySales).map(d => d.count), 1);

  return (
    <div style={{ padding: "30px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <h2
        style={{
          marginBottom: "25px",
          fontWeight: "bold",
          fontSize: "32px",
          background: "linear-gradient(90deg, #6f42c1, #e83e8c)",
          color: "white",
          display: "inline-block",
          padding: "15px 30px",
          borderRadius: "50px",
          boxShadow: "0 4px 15px rgba(111, 66, 193, 0.3)",
          letterSpacing: "1px",
        }}
      >
        📈 Sales Analytics
      </h2>

      {/* Time Range Filter */}
      <div style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        marginBottom: "20px",
        display: "flex",
        gap: "15px",
        alignItems: "center"
      }}>
        <label style={{ fontWeight: "bold", color: "#333" }}>Time Range:</label>
        {(["7days", "30days", "90days"] as const).map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            style={{
              backgroundColor: timeRange === range ? "#6f42c1" : "white",
              color: timeRange === range ? "white" : "#6f42c1",
              border: "2px solid #6f42c1",
              padding: "8px 16px",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.3s"
            }}
          >
            {range === "7days" ? "7 Days" : range === "30days" ? "30 Days" : "90 Days"}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginBottom: "30px"
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Total Revenue</h3>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745" }}>
            {totalRevenue.toFixed(2)} PKR
          </div>
        </div>

        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Total Transactions</h3>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#007BFF" }}>
            {totalTransactions}
          </div>
        </div>

        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Average Sale</h3>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ffc107" }}>
            {averageSale.toFixed(2)} PKR
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginBottom: "30px"
      }}>
        {/* Daily Revenue Chart */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>Daily Revenue</h3>
          <div style={{ height: "200px", display: "flex", alignItems: "end", gap: "10px" }}>
            {Object.entries(dailySales).map(([date, data]) => (
              <div key={date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    height: `${(data.total / maxRevenue) * 150}px`,
                    backgroundColor: "#28a745",
                    width: "20px",
                    borderRadius: "5px 5px 0 0",
                    minHeight: "5px"
                  }}
                />
                <div style={{ fontSize: "10px", marginTop: "5px", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                  {new Date(date).getDate()}/{new Date(date).getMonth() + 1}
                </div>
                <div style={{ fontSize: "10px", marginTop: "5px", fontWeight: "bold" }}>
                  {data.total.toFixed(0)}
                </div>
              </div>
            ))}
            {Object.keys(dailySales).length === 0 && (
              <div style={{ textAlign: "center", width: "100%", color: "#666", padding: "40px" }}>
                No sales data available
              </div>
            )}
          </div>
        </div>

        {/* Daily Transactions Chart */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>Daily Transactions</h3>
          <div style={{ height: "200px", display: "flex", alignItems: "end", gap: "10px" }}>
            {Object.entries(dailySales).map(([date, data]) => (
              <div key={date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    height: `${(data.count / maxQuantity) * 150}px`,
                    backgroundColor: "#007BFF",
                    width: "20px",
                    borderRadius: "5px 5px 0 0",
                    minHeight: "5px"
                  }}
                />
                <div style={{ fontSize: "10px", marginTop: "5px", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                  {new Date(date).getDate()}/{new Date(date).getMonth() + 1}
                </div>
                <div style={{ fontSize: "10px", marginTop: "5px", fontWeight: "bold" }}>
                  {data.count}
                </div>
              </div>
            ))}
            {Object.keys(dailySales).length === 0 && (
              <div style={{ textAlign: "center", width: "100%", color: "#666", padding: "40px" }}>
                No sales data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Selling Medicines */}
      <div style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>Top Selling Medicines</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa" }}>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Medicine</th>
              <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Quantity Sold</th>
              <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {topMedicinesArray.map((med, index) => (
              <tr key={med.name}>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                  <span style={{ 
                    backgroundColor: "#007BFF", 
                    color: "white", 
                    borderRadius: "50%", 
                    width: "24px", 
                    height: "24px", 
                    display: "inline-flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    marginRight: "10px",
                    fontSize: "12px"
                  }}>
                    {index + 1}
                  </span>
                  {med.name}
                </td>
                <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #eee", fontWeight: "bold" }}>
                  {med.quantity}
                </td>
                <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #eee", color: "#28a745", fontWeight: "bold" }}>
                  {med.revenue.toFixed(2)} PKR
                </td>
              </tr>
            ))}
            {topMedicinesArray.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                  No sales data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
