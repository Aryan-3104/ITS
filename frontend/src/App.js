import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import DriverPage from './pages/DriverPage';
import AdminPage from './pages/AdminPage';
import './index.css';
import Navbar from './components/Navbar';

function AnimatedRoutes() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  const onAnimationEnd = () => {
    if (transitionStage === "fadeOut") {
      setTransitionStage("fadeIn");
      setDisplayLocation(location);
    }
  }

  return (
    <div
      className={`${transitionStage === 'fadeIn' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      onAnimationEnd={onAnimationEnd}
    >
      <Routes location={displayLocation}>
        <Route path="/" element={<DriverPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  );
}


function App() {
  return (
    <Router>
      <Navbar />
      <main className="bg-[--bg-base] min-h-screen text-[--text-primary]">
        <AnimatedRoutes />
      </main>
    </Router>
  );
}

export default App;
