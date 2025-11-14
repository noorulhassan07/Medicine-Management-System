import React, { useState } from "react";

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AddProduct: React.FC = () => {
  const [medicine, setMedicine] = useState({
    name: "",
    quantity: "",
    manufacturingDate: "",
    expiryDate: "",
    dateOfEntry: "",
    price: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMedicine({ ...medicine, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/medicines`, {  // CHANGED THIS LINE
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(medicine),
    });
    if (res.ok) alert("✅ Medicine added successfully!");
  };

  return (
    <div style={{ padding: "40px 80px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <h1
        style={{
          textAlign: "center",
          color: "#007BFF",
          marginBottom: "40px",
          fontWeight: "bold",
          fontSize: "28px",
          letterSpacing: "0.5px",
        }}
      >
        ➕ Add New Medicine
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "25px 40px",
          backgroundColor: "#fff",
          padding: "40px 50px",
          borderRadius: "12px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
        }}
      >
        {[
          { label: "Medicine Name", name: "name", type: "text" },
          { label: "Quantity", name: "quantity", type: "number" },
          { label: "Manufacturing Date", name: "manufacturingDate", type: "date" },
          { label: "Expiry Date", name: "expiryDate", type: "date" },
          { label: "Date of Entry", name: "dateOfEntry", type: "date" },
          { label: "Price (PKR)", name: "price", type: "number" },
        ].map((field) => (
          <div key={field.name} style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor={field.name}
              style={{
                fontWeight: "bold",
                marginBottom: "8px",
                fontSize: "15px",
                color: "#333",
              }}
            >
              {field.label}
            </label>
            <input
              type={field.type}
              name={field.name}
              value={(medicine as any)[field.name]}
              onChange={handleChange}
              required
              style={{
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                outline: "none",
                fontSize: "15px",
                transition: "0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#007BFF")}
              onBlur={(e) => (e.target.style.borderColor = "#ccc")}
            />
          </div>
        ))}

        <div
          style={{
            gridColumn: "1 / span 2",
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <button
            type="submit"
            style={{
              backgroundColor: "#007BFF",
              color: "white",
              border: "none",
              padding: "14px 50px",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#007BFF")}
          >
            Add Medicine
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
