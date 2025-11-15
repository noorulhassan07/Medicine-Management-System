import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DashboardOverview from "./pages/DashboardOverview"; // ADD THIS
import AddProduct from "./pages/AddProduct";
import History from "./pages/History";
import Navbar from "./components/Navbar";
import { styles } from "./styles/inlineStyles";
import Sales from "./pages/Sales";
import SalesLedger from "./pages/SalesLedger";
import Analytics from "./pages/Analytics"; // We'll create this next

const App = () => {
  return (
    <div style={styles.container}>
      <Navbar />
      <Routes>
        <Route path="/" element={<DashboardOverview />} /> {/* Change default to overview */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* Keep original dashboard */}
        <Route path="/overview" element={<DashboardOverview />} /> {/* New overview page */}
        <Route path="/add" element={<AddProduct />} />
        <Route path="/history" element={<History />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/sales-ledger" element={<SalesLedger />} />
        <Route path="/analytics" element={<Analytics />} /> {/* New analytics page */}
      </Routes>
    </div>
  );
};

export default App;
