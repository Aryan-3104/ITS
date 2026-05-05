import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DriverPage from './pages/DriverPage';
import AdminPage from './pages/AdminPage';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DriverPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
