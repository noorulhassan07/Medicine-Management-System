import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

interface Sale {
  _id: string;
  medicineName: string;
  quantitySold: number;
  totalAmount: number;
  saleDate: string;
}

const DashboardOverview: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [medicinesRes, salesRes] = await Promise.all([
        fetch(`${API_URL}/api/medicines`),
        fetch(`${API_URL}/api/sales`)
      ]);
      
      const medicinesData = await medicinesRes.json();
      const salesData = await salesRes.json();
      
      setMedicines(medicinesData);
      setSales(salesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalMedicines = medicines.length;
  
  const lowStockItems = medicines.filter(med => med.quantity < 15).length;
  
  const expiringSoon = medicines.filter(med => {
    const expDate = new Date(med.expiryDate);
    const now = new Date();
    const diffMonths = (expDate.getFullYear() - now.getFullYear()) * 12 + 
                      (expDate.getMonth() - now.getMonth());
    return diffMonths <= 6 && diffMonths >= 0;
  }).length;

  const needRestock = medicines.filter(med => med.quantity === 0).length;

  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.saleDate).toDateString();
    const today = new Date().toDateString();
    return saleDate === today;
  }).reduce((total, sale) => total + sale.totalAmount, 0);

  const todaySalesCount = sales.filter(sale => {
    const saleDate = new Date(sale.saleDate).toDateString();
    const today = new Date().toDateString();
    return saleDate === today;
  }).length;

  if (loading) {
    return <div style={{ padding: "30px", textAlign: "center" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
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
          boxShadow: "0 4px 15px rgba(0, 123, 255, 0.3)",
          letterSpacing: "1px",
        }}
      >
        📊 Dashboard Overview
      </h2>

      {/* Summary Cards - 3 in a row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "15px",
        marginBottom: "25px"
      }}>
        {/* Total Medicines Card */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
          textAlign: "center",
          borderLeft: "4px solid #007BFF",
          minHeight: "120px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>💊</div>
          <h3 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "14px", fontWeight: "600" }}>Total Medicines</h3>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#007BFF", marginBottom: "5px" }}>
            {totalMedicines}
          </div>
          <small style={{ color: "#666", fontSize: "12px" }}>Active products in inventory</small>
        </div>

        {/* Low Stock Card */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
          textAlign: "center",
          borderLeft: "4px solid #ffc107",
          minHeight: "120px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>📉</div>
          <h3 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "14px", fontWeight: "600" }}>Low Stock Items</h3>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#ffc107", marginBottom: "5px" }}>
            {lowStockItems}
          </div>
          <small style={{ color: "#666", fontSize: "12px" }}>Stock below 15 units</small>
        </div>

        {/* Expiring Soon Card */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
          textAlign: "center",
          borderLeft: "4px solid #fd7e14",
          minHeight: "120px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>⚠️</div>
          <h3 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "14px", fontWeight: "600" }}>Expiring Soon</h3>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#fd7e14", marginBottom: "5px" }}>
            {expiringSoon}
          </div>
          <small style={{ color: "#666", fontSize: "12px" }}>Expires within 6 months</small>
        </div>

        {/* Need Restock Card */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
          textAlign: "center",
          borderLeft: "4px solid #dc3545",
          minHeight: "120px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔄</div>
          <h3 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "14px", fontWeight: "600" }}>Need Restock</h3>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#dc3545", marginBottom: "5px" }}>
            {needRestock}
          </div>
          <small style={{ color: "#666", fontSize: "12px" }}>Out of stock items</small>
        </div>

        {/* Today's Sales Card */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
          textAlign: "center",
          borderLeft: "4px solid #28a745",
          minHeight: "120px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>💰</div>
          <h3 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "14px", fontWeight: "600" }}>Today's Sales</h3>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#28a745", marginBottom: "5px" }}>
            {todaySales} PKR
          </div>
          <div style={{ fontSize: "14px", color: "#666" }}>
            {todaySalesCount} transactions
          </div>
        </div>

        {/* Total Inventory Value */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
          textAlign: "center",
          borderLeft: "4px solid #6f42c1",
          minHeight: "120px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>📦</div>
          <h3 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "14px", fontWeight: "600" }}>Inventory Value</h3>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#6f42c1" }}>
            {medicines.reduce((total, med) => total + (med.quantity * med.price), 0)} PKR
          </div>
          <small style={{ color: "#666", fontSize: "12px" }}>Total stock value</small>
        </div>
      </div>

      {/* Quick Lists */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "15px",
        marginTop: "10px"
      }}>
        {/* Low Stock List */}
        <div style={{
          backgroundColor: "white",
          padding: "15px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          <h4 style={{ 
            margin: "0 0 12px 0", 
            color: "#ffc107", 
            display: "flex", 
            alignItems: "center", 
            gap: "8px",
            fontSize: "14px"
          }}>
            📉 Low Stock Items ({lowStockItems})
          </h4>
          {medicines.filter(med => med.quantity < 15).slice(0, 5).map(med => (
            <div key={med._id} style={{
              padding: "8px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "13px"
            }}>
              <span>{med.name}</span>
              <span style={{ 
                color: med.quantity === 0 ? "#dc3545" : "#ffc107",
                fontWeight: "bold"
              }}>
                {med.quantity} units
              </span>
            </div>
          ))}
          {lowStockItems === 0 && <div style={{ padding: "8px", color: "#666", textAlign: "center", fontSize: "13px" }}>No low stock items</div>}
        </div>

        {/* Expiring Soon List */}
        <div style={{
          backgroundColor: "white",
          padding: "15px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          <h4 style={{ 
            margin: "0 0 12px 0", 
            color: "#fd7e14", 
            display: "flex", 
            alignItems: "center", 
            gap: "8px",
            fontSize: "14px"
          }}>
            ⚠️ Expiring Soon ({expiringSoon})
          </h4>
          {medicines.filter(med => {
            const expDate = new Date(med.expiryDate);
            const now = new Date();
            const diffMonths = (expDate.getFullYear() - now.getFullYear()) * 12 + 
                              (expDate.getMonth() - now.getMonth());
            return diffMonths <= 6 && diffMonths >= 0;
          }).slice(0, 5).map(med => (
            <div key={med._id} style={{
              padding: "8px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "13px"
            }}>
              <span>{med.name}</span>
              <span style={{ color: "#fd7e14", fontWeight: "bold" }}>
                {new Date(med.expiryDate).toLocaleDateString()}
              </span>
            </div>
          ))}
          {expiringSoon === 0 && <div style={{ padding: "8px", color: "#666", textAlign: "center", fontSize: "13px" }}>No expiring items</div>}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
