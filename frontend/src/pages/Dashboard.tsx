import React, { useEffect, useState } from "react";
import UpdateModal from "../components/UpdateModal";

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

interface Notification {
  id: string;
  type: "warning" | "danger" | "info";
  title: string;
  message: string;
  medicine: Medicine;
  timestamp: Date;
}

const Dashboard: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStock, setFilterStock] = useState("all");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(true);

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    filterMedicines();
    generateNotifications();
  }, [medicines, searchTerm, filterStock]);

  const fetchMedicines = async () => {
    try {
      const res = await fetch(`${API_URL}/api/medicines`);
      const data = await res.json();
      setMedicines(data);
    } catch (err) {
      console.error(err);
    }
  };

  const filterMedicines = () => {
    let filtered = medicines;

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by stock status
    if (filterStock !== "all") {
      filtered = filtered.filter(medicine => {
        const status = getStatusDot(medicine.expiryDate, medicine.quantity);
        return status.label.toLowerCase().includes(filterStock);
      });
    }

    setFilteredMedicines(filtered);
  };

  const generateNotifications = () => {
    const newNotifications: Notification[] = [];

    medicines.forEach(medicine => {
      const status = getStatusDot(medicine.expiryDate, medicine.quantity);
      
      if (status.color === "#ffc107") { // 🟡 Yellow: Low Stock AND Expiring Soon
        newNotifications.push({
          id: `${medicine._id}-warning`,
          type: "warning",
          title: "⚠️ Critical Alert",
          message: `${medicine.name} is low on stock (${medicine.quantity} units) AND expiring soon!`,
          medicine,
          timestamp: new Date()
        });
      } else if (status.color === "#dc3545") { // 🔴 Red: Expired or Out of Stock
        const isExpired = new Date(medicine.expiryDate) < new Date();
        newNotifications.push({
          id: `${medicine._id}-danger`,
          type: "danger",
          title: isExpired ? "🚨 Expired Medicine" : "🚨 Out of Stock",
          message: isExpired 
            ? `${medicine.name} has expired! Remove immediately.`
            : `${medicine.name} is out of stock! Restock needed.`,
          medicine,
          timestamp: new Date()
        });
      } else if (status.color === "#fd7e14") { // 🟠 Orange: Either Low Stock OR Expiring Soon
        const isLowStock = medicine.quantity < 15;
        const isExpiringSoon = isMedicineExpiringSoon(medicine.expiryDate);
        
        if (isLowStock && isExpiringSoon) {
          // This case should already be handled by yellow, but just in case
        } else if (isLowStock) {
          newNotifications.push({
            id: `${medicine._id}-info-lowstock`,
            type: "info",
            title: "📉 Low Stock Alert",
            message: `${medicine.name} is running low (${medicine.quantity} units). Consider restocking.`,
            medicine,
            timestamp: new Date()
          });
        } else if (isExpiringSoon) {
          newNotifications.push({
            id: `${medicine._id}-info-expiring`,
            type: "info",
            title: "⏰ Expiring Soon",
            message: `${medicine.name} is expiring within 6 months. Plan accordingly.`,
            medicine,
            timestamp: new Date()
          });
        }
      }
    });

    setNotifications(newNotifications);
  };

  const isMedicineExpiringSoon = (expiryDate: string): boolean => {
    const expDate = new Date(expiryDate);
    const now = new Date();
    const diffMonths = (expDate.getFullYear() - now.getFullYear()) * 12 + 
                      (expDate.getMonth() - now.getMonth());
    return diffMonths <= 6 && diffMonths >= 0;
  };

  const handleUpdate = async (updatedData: Partial<Medicine>) => {
    if (!selectedMedicine) return;

    try {
      const res = await fetch(`${API_URL}/api/medicines/${selectedMedicine._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });

      if (res.ok) {
        alert("✅ Medicine updated successfully!");
        setUpdateModalOpen(false);
        setSelectedMedicine(null);
        fetchMedicines(); // Refresh the list
      } else {
        const error = await res.json();
        alert(`❌ Failed to update: ${error.error}`);
      }
    } catch (error) {
      alert("❌ Failed to update medicine");
    }
  };

  const openUpdateModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setUpdateModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await fetch(`${API_URL}/api/medicines/${id}`, {
          method: "DELETE",
        });
        await fetchMedicines();
        alert("✅ Medicine deleted successfully!");
      } catch (error) {
        alert("❌ Failed to delete medicine");
      }
    }
  };

  const getStatusDot = (expiry: string, qty: number) => {
    const expDate = new Date(expiry);
    const now = new Date();
    
    // Calculate months difference for medicines (6 months threshold)
    const diffMonths = 
      (expDate.getFullYear() - now.getFullYear()) * 12 + 
      (expDate.getMonth() - now.getMonth());
    
    const isExpiringSoon = diffMonths <= 6 && diffMonths >= 0;
    const isLowStock = qty < 15;

    // Yellow: Low stock AND expiring soon (within 6 months)
    if (isLowStock && isExpiringSoon) {
      return { color: "#ffc107", label: "Low Stock & Expiring Soon" };
    }
    
    // Red: Expired or out of stock
    if (diffMonths < 0 || qty === 0) {
      return { color: "#dc3545", label: diffMonths < 0 ? "Expired" : "Out of Stock" };
    }
    
    // Orange: Only low stock
    if (isLowStock) {
      return { color: "#fd7e14", label: "Low Stock" };
    }
    
    // Orange: Only expiring soon (within 6 months)
    if (isExpiringSoon) {
      return { color: "#fd7e14", label: "Expiring Soon" };
    }
    
    // Green: Good stock and not expiring soon
    return { color: "#28a745", label: "Healthy Stock" };
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "danger": return "🚨";
      case "warning": return "⚠️";
      case "info": return "ℹ️";
      default: return "📢";
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "danger":
        return {
          background: "linear-gradient(135deg, #dc3545, #c82333)",
          borderLeft: "4px solid #dc3545"
        };
      case "warning":
        return {
          background: "linear-gradient(135deg, #ffc107, #e0a800)",
          borderLeft: "4px solid #ffc107"
        };
      case "info":
        return {
          background: "linear-gradient(135deg, #fd7e14, #e96a10)",
          borderLeft: "4px solid #fd7e14"
        };
      default:
        return {
          background: "linear-gradient(135deg, #007BFF, #0056b3)",
          borderLeft: "4px solid #007BFF"
        };
    }
  };

  return (
    <div style={{ padding: "30px" }}>
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
          boxShadow: "0 4px 10px rgba(0, 123, 255, 0.3)",
          letterSpacing: "1px",
        }}
      >
        📊 Medicine Dashboard
      </h2>

      {/* NOTIFICATIONS PANEL */}
      {notifications.length > 0 && showNotifications && (
        <div style={{
          marginBottom: "20px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px 20px",
            backgroundColor: "#f8f9fa",
            borderBottom: "1px solid #dee2e6"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>🔔</span>
              <h3 style={{ margin: 0, color: "#333", fontSize: "16px", fontWeight: "bold" }}>
                Important Alerts ({notifications.length})
              </h3>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                color: "#666",
                padding: "5px"
              }}
            >
              ✕
            </button>
          </div>
          
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                style={{
                  padding: "15px 20px",
                  color: "white",
                  margin: "8px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  ...getNotificationStyle(notification.type)
                }}
              >
                <div style={{ fontSize: "20px", flexShrink: 0 }}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-start",
                    marginBottom: "5px" 
                  }}>
                    <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
                      {notification.title}
                    </h4>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        border: "none",
                        color: "white",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>
                    {notification.message}
                  </p>
                  <div style={{ 
                    display: "flex", 
                    gap: "10px", 
                    marginTop: "8px",
                    fontSize: "12px",
                    opacity: 0.8
                  }}>
                    <span>Stock: {notification.medicine.quantity} units</span>
                    <span>Expires: {new Date(notification.medicine.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SHOW NOTIFICATIONS BUTTON (when hidden) */}
      {!showNotifications && notifications.length > 0 && (
        <button
          onClick={() => setShowNotifications(true)}
          style={{
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "25px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(220, 53, 69, 0.3)"
          }}
        >
          🔔 Show Alerts ({notifications.length})
        </button>
      )}

      {/* SEARCH AND FILTER BAR */}
      <div style={{
        display: "flex",
        gap: "15px",
        marginBottom: "20px",
        flexWrap: "wrap",
        alignItems: "center",
        backgroundColor: "white",
        padding: "15px",
        borderRadius: "8px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
      }}>
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: "250px" }}>
          <input
            type="text"
            placeholder="🔍 Search medicines by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 15px",
              border: "1px solid #ddd",
              borderRadius: "25px",
              fontSize: "14px",
              outline: "none",
              transition: "0.3s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#007BFF"}
            onBlur={(e) => e.target.style.borderColor = "#ddd"}
          />
        </div>

        {/* Filter Dropdown */}
        <div>
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            style={{
              padding: "10px 15px",
              border: "1px solid #ddd",
              borderRadius: "25px",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="all">📦 All Medicines</option>
            <option value="low stock & expiring soon">🟡 Low Stock & Expiring Soon</option>
            <option value="low stock">🟠 Low Stock</option>
            <option value="expiring soon">🟠 Expiring Soon</option>
            <option value="expired">🔴 Expired/Out of Stock</option>
            <option value="healthy">🟢 Healthy Stock</option>
          </select>
        </div>

        {/* Results Count */}
        <div style={{ color: "#666", fontSize: "14px" }}>
          Showing {filteredMedicines.length} of {medicines.length} medicines
        </div>
      </div>

      {/* MEDICINES TABLE */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#fff",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#007BFF", color: "white" }}>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Qty</th>
            <th style={thStyle}>MFG</th>
            <th style={thStyle}>EXP</th>
            <th style={thStyle}>Entry</th>
            <th style={thStyle}>Price (PKR)</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMedicines.length > 0 ? (
            filteredMedicines.map((m, i) => {
              const status = getStatusDot(m.expiryDate, m.quantity);
              return (
                <tr key={m._id} style={{ textAlign: "center" }}>
                  <td style={tdStyle}>{i + 1}</td>
                  <td style={tdStyle}>{m.name}</td>
                  <td style={tdStyle}>{m.quantity}</td>
                  <td style={tdStyle}>{m.manufacturingDate.slice(0, 10)}</td>
                  <td style={tdStyle}>{m.expiryDate.slice(0, 10)}</td>
                  <td style={tdStyle}>{m.dateOfEntry.slice(0, 10)}</td>
                  <td style={tdStyle}>{m.price}</td>
                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          height: "12px",
                          width: "12px",
                          backgroundColor: status.color,
                          borderRadius: "50%",
                          display: "inline-block",
                        }}
                      ></span>
                      <small style={{ color: "#555" }}>{status.label}</small>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button
                        onClick={() => openUpdateModal(m)}
                        style={{
                          backgroundColor: "#007BFF",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0056b3"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#007BFF"}
                      >
                        ✏️ Update
                      </button>
                      <button
                        onClick={() => handleDelete(m._id, m.name)}
                        style={{
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#c82333"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#dc3545"}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={9} style={{ textAlign: "center", padding: "15px" }}>
                {medicines.length === 0 ? "No medicines found." : "No medicines match your search."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Update Modal */}
      {selectedMedicine && (
        <UpdateModal
          medicine={selectedMedicine}
          isOpen={updateModalOpen}
          onClose={() => setUpdateModalOpen(false)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

const thStyle = {
  padding: "10px",
  textAlign: "center" as const,
  fontWeight: "bold",
  fontSize: "14px",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
  fontSize: "13px",
};

export default Dashboard;
