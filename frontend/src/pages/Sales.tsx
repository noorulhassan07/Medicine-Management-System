import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Medicine {
  _id: string;
  name: string;
  quantity: number;
  price: number;
}

interface SaleForm {
  medicineId: string;
  quantitySold: number;
  salePrice: number;
  customerName: string;
}

const Sales: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [saleForm, setSaleForm] = useState<SaleForm>({
    medicineId: "",
    quantitySold: 1,
    salePrice: 0,
    customerName: ""
  });
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (saleForm.medicineId) {
      const medicine = medicines.find(m => m._id === saleForm.medicineId);
      setSelectedMedicine(medicine || null);
      if (medicine) {
        setSaleForm(prev => ({ ...prev, salePrice: medicine.price }));
      }
    }
  }, [saleForm.medicineId, medicines]);

  const fetchMedicines = async () => {
    try {
      const res = await fetch(`${API_URL}/api/medicines`);
      const data = await res.json();
      setMedicines(data);
    } catch (err) {
      console.error("Failed to fetch medicines", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSaleForm(prev => ({
      ...prev,
      [name]: name === 'quantitySold' || name === 'salePrice' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!saleForm.medicineId) {
      alert("Please select a medicine");
      setIsSubmitting(false);
      return;
    }

    if (saleForm.quantitySold <= 0) {
      alert("Quantity must be greater than 0");
      setIsSubmitting(false);
      return;
    }

    if (selectedMedicine && saleForm.quantitySold > selectedMedicine.quantity) {
      alert(`Insufficient stock! Available: ${selectedMedicine.quantity}`);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleForm)
      });

      const responseData = await res.json(); // Always parse response

      if (res.ok) {
        alert("✅ Sale recorded successfully!");
        setSaleForm({
          medicineId: "",
          quantitySold: 1,
          salePrice: 0,
          customerName: ""
        });
        setSelectedMedicine(null);
        fetchMedicines(); // Refresh medicines list
      } else {
        // Show specific error message from backend
        alert(`❌ Failed: ${responseData.error || responseData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Sale recording error:", error);
      alert("❌ Network error - failed to record sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = saleForm.quantitySold * saleForm.salePrice;

  return (
    <div style={{ padding: "30px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <h2
        style={{
          marginBottom: "25px",
          fontWeight: "bold",
          fontSize: "28px",
          background: "linear-gradient(90deg, #28a745, #20c997)",
          color: "white",
          display: "inline-block",
          padding: "12px 25px",
          borderRadius: "50px",
          boxShadow: "0 4px 10px rgba(40, 167, 69, 0.3)",
          letterSpacing: "1px",
        }}
      >
        💰 Record Sale
      </h2>

      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "30px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        maxWidth: "600px"
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Medicine Selection */}
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                Select Medicine *
              </label>
              <select
                name="medicineId"
                value={saleForm.medicineId}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              >
                <option value="">Choose a medicine...</option>
                {medicines.map(medicine => (
                  <option key={medicine._id} value={medicine._id}>
                    {medicine.name} (Stock: {medicine.quantity}, Price: {medicine.price} PKR)
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                Quantity to Sell *
              </label>
              <input
                type="number"
                name="quantitySold"
                value={saleForm.quantitySold}
                onChange={handleInputChange}
                min="1"
                max={selectedMedicine?.quantity || 1}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
              {selectedMedicine && (
                <small style={{ color: "#666", marginTop: "5px", display: "block" }}>
                  Available stock: {selectedMedicine.quantity} units
                </small>
              )}
            </div>

            {/* Sale Price */}
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                Sale Price per Unit (PKR) *
              </label>
              <input
                type="number"
                name="salePrice"
                value={saleForm.salePrice}
                onChange={handleInputChange}
                min="1"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
            </div>

            {/* Customer Name */}
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                Customer Name (Optional)
              </label>
              <input
                type="text"
                name="customerName"
                value={saleForm.customerName}
                onChange={handleInputChange}
                placeholder="Enter customer name"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
            </div>

            {/* Total Amount Display */}
            <div style={{
              backgroundColor: "#e9ecef",
              padding: "15px",
              borderRadius: "4px",
              textAlign: "center"
            }}>
              <strong>Total Amount: {totalAmount} PKR</strong>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: isSubmitting ? "#6c757d" : "#28a745",
                color: "white",
                border: "none",
                padding: "12px 30px",
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                width: "100%"
              }}
              onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#218838")}
              onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#28a745")}
            >
              {isSubmitting ? "⏳ Recording..." : "💰 Record Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sales;
