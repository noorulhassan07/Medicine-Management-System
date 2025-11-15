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

  // Calculate daily sales data for line charts
  const getDailySalesData = () => {
    const dailyData: Record<string, { total: number; count: number; date: Date }> = {};
    
    filteredSales.forEach(sale => {
      const date = new Date(sale.saleDate);
      const dateKey = date.toLocaleDateString();
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { total: 0, count: 0, date };
      }
      dailyData[dateKey].total += sale.totalAmount;
      dailyData[dateKey].count += 1;
    });

    // Convert to array and sort by date
    return Object.entries(dailyData)
      .map(([_, data]) => data)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const dailySalesData = getDailySalesData();

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
  const maxRevenue = Math.max(...dailySalesData.map(d => d.total), 1);
  const maxQuantity = Math.max(...dailySalesData.map(d => d.count), 1);

  // Line chart component
  const LineChart = ({ data, valueKey, color, title }: { 
    data: { date: Date; total: number; count: number }[], 
    valueKey: 'total' | 'count',
    color: string,
    title: string 
  }) => {
    if (data.length === 0) {
      return (
        <div style={{ textAlign: "center", width: "100%", color: "#666", padding: "40px" }}>
          No sales data available
        </div>
      );
    }

    const chartHeight = 200;
    const chartWidth = Math.max(400, data.length * 40);
    const padding = 40;

    const getX = (index: number) => padding + (index * (chartWidth - 2 * padding)) / (data.length - 1);
    const getY = (value: number, maxValue: number) => {
      const scaledValue = (value / maxValue) * (chartHeight - 2 * padding);
      return chartHeight - padding - scaledValue;
    };

    const points = data.map((item, index) => {
      const value = valueKey === 'total' ? item.total : item.count;
      const maxValue = valueKey === 'total' ? maxRevenue : maxQuantity;
      return `${getX(index)},${getY(value, maxValue)}`;
    }).join(' ');

    return (
      <div>
        <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>{title}</h3>
        <div style={{ position: "relative", height: `${chartHeight}px`, overflowX: "auto" }}>
          <svg width={chartWidth} height={chartHeight} style={{ minWidth: "100%" }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={i}
                x1={padding}
                y1={padding + (chartHeight - 2 * padding) * ratio}
                x2={chartWidth - padding}
                y2={padding + (chartHeight - 2 * padding) * ratio}
                stroke="#f0f0f0"
                strokeWidth="1"
              />
            ))}

            {/* Y-axis labels */}
            {[0, 0.5, 1].map((ratio, i) => {
              const value = Math.round((valueKey === 'total' ? maxRevenue : maxQuantity) * ratio);
              return (
                <text
                  key={i}
                  x={padding - 5}
                  y={padding + (chartHeight - 2 * padding) * (1 - ratio)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#666"
                >
                  {value}
                </text>
              );
            })}

            {/* Line */}
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={points}
            />

            {/* Data points and labels */}
            {data.map((item, index) => {
              const value = valueKey === 'total' ? item.total : item.count;
              const maxValue = valueKey === 'total' ? maxRevenue : maxQuantity;
              const x = getX(index);
              const y = getY(value, maxValue);
              
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                  />
                  {/* Value label */}
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill={color}
                  >
                    {valueKey === 'total' ? value.toFixed(0) : value}
                  </text>
                  {/* Date label */}
                  <text
                    x={x}
                    y={chartHeight - 5}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#666"
                  >
                    {item.date.getDate()}/{item.date.getMonth() + 1}
                  </text>
                </g>
              );
            })}

            {/* Axes */}
            <line
              x1={padding}
              y1={chartHeight - padding}
              x2={chartWidth - padding}
              y2={chartHeight - padding}
              stroke="#ddd"
              strokeWidth="2"
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={chartHeight - padding}
              stroke="#ddd"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    );
  };

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
        {/* Daily Revenue Line Chart */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <LineChart 
            data={dailySalesData}
            valueKey="total"
            color="#28a745"
            title="Daily Revenue Trend"
          />
        </div>

        {/* Daily Transactions Line Chart */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <LineChart 
            data={dailySalesData}
            valueKey="count"
            color="#007BFF"
            title="Daily Transactions Trend"
          />
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
