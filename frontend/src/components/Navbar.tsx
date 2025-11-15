import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "📊 Dashboard", color: "#00ff9d" },
    { path: "/dashboard", label: "📋 View All Medicines", color: "#00b8ff" },
    { path: "/analytics", label: "📈 Sales Analytics", color: "#ff00ff" },
    { path: "/add", label: "➕ Add Medicine", color: "#ffeb3b" },
    { path: "/sales", label: "💰 Record Sale", color: "#ff4081" },
    { path: "/sales-ledger", label: "📋 Sales Ledger", color: "#00ffff" },
    { path: "/history", label: "📜 History", color: "#ff9800" }
  ];

  return (
    <nav
      style={{
        backgroundColor: "white",
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "#333",
            fontSize: "20px",
            fontWeight: "bold",
            textShadow: "0 0 10px #00ff9d, 0 0 20px #00ff9d",
          }}
        >
          💊 Medicine Management
        </Link>
        
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: "none",
                color: location.pathname === item.path ? item.color : "#666",
                fontSize: "14px",
                fontWeight: location.pathname === item.path ? "bold" : "normal",
                padding: "8px 15px",
                borderRadius: "20px",
                backgroundColor: location.pathname === item.path ? `${item.color}20` : "transparent",
                border: location.pathname === item.path ? `2px solid ${item.color}` : "2px solid transparent",
                textShadow: location.pathname === item.path ? `0 0 8px ${item.color}` : "none",
                boxShadow: location.pathname === item.path ? `0 0 15px ${item.color}40` : "none",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.textShadow = `0 0 8px ${item.color}`;
                  e.currentTarget.style.color = item.color;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.textShadow = "none";
                  e.currentTarget.style.color = "#666";
                }
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
