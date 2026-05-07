import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import DriverPage from './pages/DriverPage';
import AdminPage from './pages/AdminPage_main';
import './index.css';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <main className="bg-[--bg-base] min-h-screen text-[--text-primary]">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/driver" element={<DriverPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
