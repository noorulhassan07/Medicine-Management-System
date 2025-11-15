import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ADD THIS IMPORT

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
  const navigate = useNavigate(); // ADD THIS

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
    <div style={{ padding: "30px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <h2
        style={{
          marginBottom: "20px", // Reduced margin
          fontWeight: "bold",
          fontSize: "32px",
          background: "linear-gradient(90deg, #007BFF, #00C6FF)",
          color: "white",
          display: "inline-block",
          padding: "15px 30px",
          borderRadius: "50px",
          boxShadow: "0 4px 15px rgba(0, 123, 255, 0.3)",
          letterSpacing: "1px",
        }}
      >
        📊 Dashboard Overview
      </h2>

      {/* QUICK ACTION BUTTONS - ADD THIS SECTION */}
      <div style={{
        display: "flex",
        gap: "15px",
        marginBottom: "30px",
        flexWrap: "wrap"
      }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            padding: "12px 25px",
            borderRadius: "25px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 2px 8px rgba(0, 123, 255, 0.3)",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          📋 View All Medicines
        </button>

        <button
          onClick={() => navigate("/analytics")}
          style={{
            backgroundColor: "#6f42c1",
            color: "white",
            border: "none",
            padding: "12px 25px",
            borderRadius: "25px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 2px 8px rgba(111, 66, 193, 0.3)",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          📈 Sales Analytics
        </button>

        <button
          onClick={() => navigate("/sales")}
          style={{
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            padding: "12px 25px",
            borderRadius: "25px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 2px 8px rgba(40, 167, 69, 0.3)",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          💰 Record Sale
        </button>

        <button
          onClick={() => navigate("/add")}
          style={{
            backgroundColor: "#fd7e14",
            color: "white",
            border: "none",
            padding: "12px 25px",
            borderRadius: "25px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 2px 8px rgba(253, 126, 20, 0.3)",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          ➕ Add New Medicine
        </button>
      </div>

      {/* Summary Cards - REST OF YOUR EXISTING CODE */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
        marginBottom: "30px"
      }}>
        {/* Total Medicines Card */}
        <div style={{
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "15px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          textAlign: "center",
          borderLeft: "6px solid #007BFF"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>💊</div>
          <h3 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "18px" }}>Total Medicines</h3>
          <div style={{ fontSize: "36px", fontWeight: "bold", color: "#007BFF" }}>
            {totalMedicines}
          </div>
          <small style={{ color: "#666" }}>Active products in inventory</small>
        </div>

        {/* Low Stock Card */}
        <div style={{
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "15px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          textAlign: "center",
          borderLeft: "6px solid #ffc107"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>📉</div>
          <h3 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "18px" }}>Low Stock Items</h3>
          <div style={{ fontSize: "36px", fontWeight: "bold", color: "#ffc107" }}>
            {lowStockItems}
          </div>
          <small style={{ color: "#666" }}>Stock below 15 units</small>
        </div>

        {/* Expiring Soon Card */}
        <div style={{
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "15px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          textAlign: "center",
          borderLeft: "6px solid #fd7e14"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>⚠️</div>
          <h3 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "18px" }}>Expiring Soon</h3>
          <div style={{ fontSize: "36px", fontWeight: "bold", color: "#fd7e14" }}>
            {expiringSoon}
          </div>
          <small style={{ color: "#666" }}>Expires within 6 months</small>
        </div>

        {/* Need Restock Card */}
        <div style={{
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "15px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          textAlign: "center",
          borderLeft: "6px solid #dc3545"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>🔄</div>
          <h3 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "18px" }}>Need Restock</h3>
          <div style={{ fontSize: "36px", fontWeight: "bold", color: "#dc3545" }}>
            {needRestock}
          </div>
          <small style={{ color: "#666" }}>Out of stock items</small>
        </div>

        {/* Today's Sales Card */}
        <div style={{
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "15px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          textAlign: "center",
          borderLeft: "6px solid #28a745"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>💰</div>
          <h3 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "18px" }}>Today's Sales</h3>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#28a745", marginBottom: "5px" }}>
            {todaySales} PKR
          </div>
          <div style={{ fontSize: "16px", color: "#666" }}>
            {todaySalesCount} transactions
          </div>
        </div>

        {/* Total Inventory Value */}
        <div style={{
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "15px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          textAlign: "center",
          borderLeft: "6px solid #6f42c1"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>📦</div>
          <h3 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "18px" }}>Inventory Value</h3>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#6f42c1" }}>
            {medicines.reduce((total, med) => total + (med.quantity * med.price), 0)} PKR
          </div>
          <small style={{ color: "#666" }}>Total stock value</small>
        </div>
      </div>

      {/* Quick Lists */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginTop: "20px"
      }}>
        {/* Low Stock List */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <h4 style={{ margin: "0 0 15px 0", color: "#ffc107", display: "flex", alignItems: "center", gap: "8px" }}>
            📉 Low Stock Items ({lowStockItems})
          </h4>
          {medicines.filter(med => med.quantity < 15).slice(0, 5).map(med => (
            <div key={med._id} style={{
              padding: "10px",
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
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
          {lowStockItems === 0 && <div style={{ padding: "10px", color: "#666", textAlign: "center" }}>No low stock items</div>}
        </div>

        {/* Expiring Soon List */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <h4 style={{ margin: "0 0 15px 0", color: "#fd7e14", display: "flex", alignItems: "center", gap: "8px" }}>
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
              padding: "10px",
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span>{med.name}</span>
              <span style={{ color: "#fd7e14", fontWeight: "bold" }}>
                {new Date(med.expiryDate).toLocaleDateString()}
              </span>
            </div>
          ))}
          {expiringSoon === 0 && <div style={{ padding: "10px", color: "#666", textAlign: "center" }}>No expiring items</div>}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
