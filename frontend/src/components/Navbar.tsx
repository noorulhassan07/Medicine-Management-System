import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav
      style={{
        backgroundColor: "#007BFF",
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "white",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          💊 Medicine Management
        </Link>
        
        <div style={{ display: "flex", gap: "20px" }}>
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "white",
              fontSize: "16px",
              fontWeight: location.pathname === "/" ? "bold" : "normal",
              opacity: location.pathname === "/" ? 1 : 0.8,
            }}
          >
            📊 Dashboard
          </Link>
          <Link
            to="/add"
            style={{
              textDecoration: "none",
              color: "white",
              fontSize: "16px",
              fontWeight: location.pathname === "/add" ? "bold" : "normal",
              opacity: location.pathname === "/add" ? 1 : 0.8,
            }}
          >
            ➕ Add Medicine
          </Link>
          <Link
            to="/sales"
            style={{
              textDecoration: "none",
              color: "white",
              fontSize: "16px",
              fontWeight: location.pathname === "/sales" ? "bold" : "normal",
              opacity: location.pathname === "/sales" ? 1 : 0.8,
            }}
          >
            💰 Record Sale
          </Link>
          <Link
            to="/sales-ledger"
            style={{
              textDecoration: "none",
              color: "white",
              fontSize: "16px",
              fontWeight: location.pathname === "/sales-ledger" ? "bold" : "normal",
              opacity: location.pathname === "/sales-ledger" ? 1 : 0.8,
            }}
          >
            📋 Sales Ledger
          </Link>
          <Link
            to="/history"
            style={{
              textDecoration: "none",
              color: "white",
              fontSize: "16px",
              fontWeight: location.pathname === "/history" ? "bold" : "normal",
              opacity: location.pathname === "/history" ? 1 : 0.8,
            }}
          >
            📜 History
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
