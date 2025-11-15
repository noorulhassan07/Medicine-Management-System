import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import History from "./pages/History"; // ADD THIS IMPORT
import Navbar from "./components/Navbar";
import { styles } from "./styles/inlineStyles";

const App = () => {
  return (
    <div style={styles.container}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add" element={<AddProduct />} />
        <Route path="/history" element={<History />} /> {/* ADD THIS ROUTE */}
      </Routes>
    </div>
  );
};

export default App;
