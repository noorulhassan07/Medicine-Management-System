import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#007BFF",
        padding: "14px 40px",
        color: "#fff",
        boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Left side - App Title */}
      <h2
        style={{
          margin: 0,
          fontSize: "22px",
          letterSpacing: "0.5px",
          fontWeight: 700,
        }}
      >
        💊 Medicine Management
      </h2>

      {/* Right side - Navigation Links */}
      <div style={{ display: "flex", gap: "20px" }}>
        <Link
          to="/"
          style={{
            color: "#007BFF",
            backgroundColor: "#fff",
            textDecoration: "none",
            fontSize: "16px",
            fontWeight: 700,
            padding: "10px 20px",
            borderRadius: "25px", // Bubble shape
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLAnchorElement).style.backgroundColor = "#0056b3";
            (e.target as HTMLAnchorElement).style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLAnchorElement).style.backgroundColor = "#fff";
            (e.target as HTMLAnchorElement).style.color = "#007BFF";
          }}
        >
          <b>Dashboard</b>
        </Link>

        <Link
          to="/add"
          style={{
            color: "#007BFF",
            backgroundColor: "#fff",
            textDecoration: "none",
            fontSize: "16px",
            fontWeight: 700,
            padding: "10px 20px",
            borderRadius: "25px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLAnchorElement).style.backgroundColor = "#0056b3";
            (e.target as HTMLAnchorElement).style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLAnchorElement).style.backgroundColor = "#fff";
            (e.target as HTMLAnchorElement).style.color = "#007BFF";
          }}
        >
          <b>Add Medicine</b>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
