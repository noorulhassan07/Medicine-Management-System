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

  // Calculate inventory data for first chart: Quantity in Inventory vs Revenue
  const getInventoryVsRevenueData = () => {
    // Group by medicine and calculate total revenue per medicine
    const medicineRevenue = filteredSales.reduce((acc, sale) => {
      if (!acc[sale.medicineName]) {
        acc[sale.medicineName] = { revenue: 0, quantitySold: 0 };
      }
      acc[sale.medicineName].revenue += sale.totalAmount;
      acc[sale.medicineName].quantitySold += sale.quantitySold;
      return acc;
    }, {} as Record<string, { revenue: number; quantitySold: number }>);

    // Combine with current inventory data
    const inventoryData = medicines.map(medicine => {
      const salesData = medicineRevenue[medicine.name] || { revenue: 0, quantitySold: 0 };
      return {
        medicineName: medicine.name,
        quantityInInventory: medicine.quantity,
        totalRevenue: salesData.revenue,
        quantitySold: salesData.quantitySold
      };
    });

    return inventoryData
      .filter(item => item.totalRevenue > 0) // Only show medicines with sales
      .sort((a, b) => b.totalRevenue - a.totalRevenue) // Sort by revenue descending
      .slice(0, 15); // Limit to top 15 for readability
  };

  // Calculate daily sales data for second chart: Quantity Sold vs Revenue
  const getDailySalesData = () => {
    const dailyData: Record<string, { totalRevenue: number; totalQuantitySold: number; date: Date }> = {};
    
    filteredSales.forEach(sale => {
      const date = new Date(sale.saleDate);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { totalRevenue: 0, totalQuantitySold: 0, date };
      }
      dailyData[dateKey].totalRevenue += sale.totalAmount;
      dailyData[dateKey].totalQuantitySold += sale.quantitySold;
    });

    return Object.entries(dailyData)
      .map(([dateKey, data]) => ({
        ...data,
        date: new Date(dateKey)
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const inventoryVsRevenueData = getInventoryVsRevenueData();
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
  const totalQuantitySold = filteredSales.reduce((sum, sale) => sum + sale.quantitySold, 0);

  // Find max values for chart scaling
  const maxInventoryRevenue = inventoryVsRevenueData.length > 0 ? 
    Math.max(...inventoryVsRevenueData.map(d => d.totalRevenue), 1) : 1;
  const maxInventoryQuantity = inventoryVsRevenueData.length > 0 ? 
    Math.max(...inventoryVsRevenueData.map(d => d.quantityInInventory), 1) : 1;
  
  const maxDailyRevenue = dailySalesData.length > 0 ? 
    Math.max(...dailySalesData.map(d => d.totalRevenue), 1) : 1;
  const maxDailyQuantity = dailySalesData.length > 0 ? 
    Math.max(...dailySalesData.map(d => d.totalQuantitySold), 1) : 1;

  // Scatter Plot Component for Inventory vs Revenue
  const ScatterPlot = ({ 
    data, 
    xKey, 
    yKey, 
    xLabel, 
    yLabel, 
    title,
    color 
  }: { 
    data: any[], 
    xKey: string, 
    yKey: string, 
    xLabel: string,
    yLabel: string,
    title: string,
    color: string 
  }) => {
    const chartHeight = 300;
    const chartWidth = 500;
    const padding = 60;

    if (data.length === 0) {
      return (
        <div>
          <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>{title}</h3>
          <div style={{ 
            height: `${chartHeight}px`, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            color: "#666"
          }}>
            No data available for the selected period
          </div>
        </div>
      );
    }

    const getX = (value: number, maxValue: number) => {
      return padding + ((value / maxValue) * (chartWidth - 2 * padding));
    };

    const getY = (value: number, maxValue: number) => {
      return chartHeight - padding - ((value / maxValue) * (chartHeight - 2 * padding));
    };

    return (
      <div>
        <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>{title}</h3>
        <div style={{ position: "relative" }}>
          <svg width={chartWidth} height={chartHeight}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={`x-grid-${i}`}
                x1={padding}
                y1={padding + (chartHeight - 2 * padding) * ratio}
                x2={chartWidth - padding}
                y2={padding + (chartHeight - 2 * padding) * ratio}
                stroke="#f0f0f0"
                strokeWidth="1"
              />
            ))}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={`y-grid-${i}`}
                x1={padding + (chartWidth - 2 * padding) * ratio}
                y1={padding}
                x2={padding + (chartWidth - 2 * padding) * ratio}
                y2={chartHeight - padding}
                stroke="#f0f0f0"
                strokeWidth="1"
              />
            ))}

            {/* Y-axis labels */}
            {[0, 0.5, 1].map((ratio, i) => {
              const value = Math.round(maxInventoryRevenue * ratio);
              return (
                <text
                  key={`y-label-${i}`}
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

            {/* X-axis labels */}
            {[0, 0.5, 1].map((ratio, i) => {
              const value = Math.round(maxInventoryQuantity * ratio);
              return (
                <text
                  key={`x-label-${i}`}
                  x={padding + (chartWidth - 2 * padding) * ratio}
                  y={chartHeight - padding + 15}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#666"
                >
                  {value}
                </text>
              );
            })}

            {/* Data points */}
            {data.map((item, index) => {
              const xValue = item[xKey];
              const yValue = item[yKey];
              const x = getX(xValue, xKey === 'quantityInInventory' ? maxInventoryQuantity : maxDailyQuantity);
              const y = getY(yValue, yKey === 'totalRevenue' ? maxInventoryRevenue : maxDailyRevenue);
              
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                    opacity="0.7"
                  />
                  {/* Value label */}
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="bold"
                    fill={color}
                  >
                    {item.medicineName || `Day ${index + 1}`}
                  </text>
                  {/* Coordinates label */}
                  <text
                    x={x}
                    y={y + 20}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#666"
                  >
                    ({xValue}, {yValue.toFixed(0)})
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

            {/* Axis titles */}
            <text
              x={chartWidth / 2}
              y={chartHeight - 10}
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill="#333"
            >
              {xLabel}
            </text>
            <text
              x={10}
              y={chartHeight / 2}
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill="#333"
              transform={`rotate(-90, 10, ${chartHeight / 2})`}
            >
              {yLabel}
            </text>
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

      {/* Debug Info */}
      <div style={{
        backgroundColor: "#fff3cd",
        padding: "10px",
        borderRadius: "5px",
        marginBottom: "20px",
        border: "1px solid #ffeaa7",
        fontSize: "12px"
      }}>
        <strong>Data Summary:</strong> {filteredSales.length} sales, {inventoryVsRevenueData.length} medicines with sales, {dailySalesData.length} days with data
      </div>

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
          <small style={{ color: "#666" }}>Selected period</small>
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
          <small style={{ color: "#666" }}>Selected period</small>
        </div>

        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Quantity Sold</h3>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ffc107" }}>
            {totalQuantitySold}
          </div>
          <small style={{ color: "#666" }}>Units sold</small>
        </div>

        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Average Sale</h3>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#e83e8c" }}>
            {averageSale.toFixed(2)} PKR
          </div>
          <small style={{ color: "#666" }}>Per transaction</small>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginBottom: "30px"
      }}>
        {/* Inventory vs Revenue Scatter Plot */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <ScatterPlot 
            data={inventoryVsRevenueData}
            xKey="quantityInInventory"
            yKey="totalRevenue"
            xLabel="Quantity in Inventory"
            yLabel="Total Revenue (PKR)"
            title="Inventory vs Revenue by Medicine"
            color="#28a745"
          />
          <div style={{ fontSize: "12px", color: "#666", marginTop: "10px", textAlign: "center" }}>
            Each point represents a medicine. Shows relationship between current stock levels and total revenue generated.
          </div>
        </div>

        {/* Daily Sales: Quantity Sold vs Revenue */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <ScatterPlot 
            data={dailySalesData}
            xKey="totalQuantitySold"
            yKey="totalRevenue"
            xLabel="Total Quantity Sold"
            yLabel="Total Revenue (PKR)"
            title="Daily Sales: Quantity vs Revenue"
            color="#007BFF"
          />
          <div style={{ fontSize: "12px", color: "#666", marginTop: "10px", textAlign: "center" }}>
            Each point represents a day. Shows relationship between units sold and revenue generated per day.
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
              <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Current Stock</th>
            </tr>
          </thead>
          <tbody>
            {topMedicinesArray.map((med, index) => {
              const medicine = medicines.find(m => m.name === med.name);
              const currentStock = medicine ? medicine.quantity : 0;
              
              return (
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
                  <td style={{ 
                    padding: "12px", 
                    textAlign: "right", 
                    borderBottom: "1px solid #eee", 
                    fontWeight: "bold",
                    color: currentStock < 15 ? "#dc3545" : currentStock < 30 ? "#ffc107" : "#28a745"
                  }}>
                    {currentStock} units
                  </td>
                </tr>
              );
            })}
            {topMedicinesArray.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "20px", textAlign: "center", color: "#666" }}>
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
