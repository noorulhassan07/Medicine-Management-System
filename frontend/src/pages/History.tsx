import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface HistoryEntry {
  _id: string;
  medicineId: string;
  medicineName: string;
  action: string;
  details: string;
  timestamp: string;
  previousData?: any;
  newData?: any;
}

const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching history from:", `${API_URL}/api/medicines/history`);
      
      const res = await fetch(`${API_URL}/api/medicines/history/all`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("History data received:", data);
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history", err);
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return '#28a745';
      case 'sold': return '#007BFF'; // Changed from 'sale' to 'sold'
      case 'updated': return '#ffc107';
      case 'deleted': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return '📦';
      case 'sold': return '💰'; // Changed from 'sale' to 'sold'
      case 'updated': return '✏️';
      case 'deleted': return '🗑️';
      default: return '📝';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'created': return 'Medicine Added';
      case 'sold': return 'Sale Recorded'; // Changed from 'sale' to 'sold'
      case 'updated': return 'Medicine Updated';
      case 'deleted': return 'Medicine Deleted';
      default: return action;
    }
  };

  const formatDetails = (entry: HistoryEntry) => {
    // Use the details from backend directly
    return entry.details;
  };

  const filteredHistory = history.filter(entry => {
    const matchesFilter = filter === "all" || entry.action === filter;
    const matchesSearch = entry.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const groupHistoryByDate = (entries: HistoryEntry[]) => {
    const groups: { [key: string]: HistoryEntry[] } = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });
    
    return groups;
  };

  const groupedHistory = groupHistoryByDate(filteredHistory);

  if (loading) {
    return (
      <div style={{ padding: "30px", backgroundColor: "#f8f9fa", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
          <div style={{ fontSize: "18px", color: "#666" }}>Loading history...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <h2
        style={{
          marginBottom: "25px",
          fontWeight: "bold",
          fontSize: "28px",
          background: "linear-gradient(90deg, #6f42c1, #e83e8c)",
          color: "white",
          display: "inline-block",
          padding: "12px 25px",
          borderRadius: "50px",
          boxShadow: "0 4px 10px rgba(111, 66, 193, 0.3)",
          letterSpacing: "1px",
        }}
      >
        📜 Business Activity Log
      </h2>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: "#f8d7da",
          color: "#721c24",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #f5c6cb"
        }}>
          <strong>⚠️ Connection Issue:</strong> {error}
          <div style={{ marginTop: "10px" }}>
            <button 
              onClick={fetchHistory}
              style={{
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        marginBottom: "20px",
        display: "flex",
        gap: "15px",
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: "250px" }}>
          <input
            type="text"
            placeholder="🔍 Search by medicine or details..."
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
            onFocus={(e) => e.target.style.borderColor = "#6f42c1"}
            onBlur={(e) => e.target.style.borderColor = "#ddd"}
          />
        </div>

        {/* Filter Buttons */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {[
            { value: "all", label: "📋 All Activities", emoji: "📋" },
            { value: "sold", label: "Sales", emoji: "💰" }, // Changed from 'sale' to 'sold'
            { value: "created", label: "Additions", emoji: "📦" },
            { value: "updated", label: "Updates", emoji: "✏️" },
            { value: "deleted", label: "Deletions", emoji: "🗑️" }
          ].map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              style={{
                backgroundColor: filter === value ? "#6f42c1" : "white",
                color: filter === value ? "white" : "#6f42c1",
                border: "2px solid #6f42c1",
                padding: "8px 16px",
                borderRadius: "20px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.3s"
              }}
            >
              <span>{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div style={{
        backgroundColor: "white",
        padding: "10px 20px",
        borderRadius: "8px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        marginBottom: "15px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <span style={{ color: "#666", fontSize: "14px" }}>
          Showing {filteredHistory.length} of {history.length} activities
        </span>
        {filter !== "all" && (
          <button
            onClick={() => setFilter("all")}
            style={{
              backgroundColor: "transparent",
              color: "#6f42c1",
              border: "1px solid #6f42c1",
              padding: "4px 12px",
              borderRadius: "15px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* History Timeline */}
      <div style={{ backgroundColor: "white", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        {Object.keys(groupedHistory).length > 0 ? (
          Object.entries(groupedHistory).map(([date, entries]) => (
            <div key={date}>
              {/* Date Header */}
              <div style={{
                backgroundColor: "#f8f9fa",
                padding: "15px 20px",
                borderBottom: "2px solid #e9ecef",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#6f42c1",
                  borderRadius: "50%"
                }} />
                <h3 style={{ margin: 0, color: "#6f42c1", fontSize: "16px", fontWeight: "bold" }}>
                  {date}
                </h3>
                <span style={{ color: "#666", fontSize: "12px" }}>
                  ({entries.length} activities)
                </span>
              </div>

              {/* Activities for this date */}
              <div style={{ padding: "10px" }}>
                {entries.map((entry) => (
                  <div
                    key={entry._id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      padding: "15px",
                      margin: "8px",
                      borderLeft: `4px solid ${getActionColor(entry.action)}`,
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px",
                      gap: "15px",
                      transition: "all 0.3s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#e9ecef";
                      e.currentTarget.style.transform = "translateX(5px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    {/* Icon */}
                    <div style={{ 
                      fontSize: "20px", 
                      flexShrink: 0,
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "white",
                      borderRadius: "50%",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                    }}>
                      {getActionIcon(entry.action)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "flex-start",
                        marginBottom: "5px",
                        flexWrap: "wrap",
                        gap: "10px"
                      }}>
                        <div>
                          <div style={{ fontWeight: "bold", color: "#333", fontSize: "15px" }}>
                            {entry.medicineName}
                          </div>
                          <div style={{ color: "#666", fontSize: "13px", marginTop: "2px" }}>
                            {formatDetails(entry)}
                          </div>
                        </div>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {/* Action Badge */}
                          <div
                            style={{
                              backgroundColor: getActionColor(entry.action),
                              color: "white",
                              padding: "4px 12px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: "bold",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px"
                            }}
                          >
                            {getActionLabel(entry.action)}
                          </div>
                          
                          {/* Time */}
                          <div style={{ 
                            color: "#999", 
                            fontSize: "11px", 
                            fontWeight: "bold",
                            minWidth: "60px",
                            textAlign: "right"
                          }}>
                            {new Date(entry.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <div style={{ fontSize: "48px", marginBottom: "10px" }}>📝</div>
            <div style={{ fontSize: "16px", marginBottom: "5px" }}>No activities found</div>
            <div style={{ fontSize: "14px", color: "#999" }}>
              {searchTerm || filter !== "all" 
                ? "Try changing your search or filter criteria" 
                : "No history records found. Activities will appear here as they occur."
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
