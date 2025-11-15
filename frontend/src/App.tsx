import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DashboardOverview from "./pages/DashboardOverview";
import AddProduct from "./pages/AddProduct";
import History from "./pages/History";
import Navbar from "./components/Navbar";
import { styles } from "./styles/inlineStyles";
import Sales from "./pages/Sales";
import SalesLedger from "./pages/SalesLedger";

const App = () => {
  return (
    <div style={styles.container}>
      <Navbar />
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/overview" element={<DashboardOverview />} />
        <Route path="/add" element={<AddProduct />} />
        <Route path="/history" element={<History />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/sales-ledger" element={<SalesLedger />} />
        {/* Remove Analytics route for now - we'll add it later */}
      </Routes>
    </div>
  );
};

export default App;
