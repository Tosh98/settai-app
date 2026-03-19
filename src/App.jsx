import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import RestaurantsList from './pages/RestaurantsList';
import RestaurantDetail from './pages/RestaurantDetail';
import GiftsList from './pages/GiftsList';
import GiftDetail from './pages/GiftDetail';
import Registration from './pages/Registration';
import Login from './pages/Login';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('settai_auth') === 'true';
  });

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <AppProvider>
      <Router>
        <div className="layout-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/restaurants" replace />} />
              <Route path="/restaurants" element={<RestaurantsList />} />
              <Route path="/restaurants/:id" element={<RestaurantDetail />} />
              <Route path="/gifts" element={<GiftsList />} />
              <Route path="/gifts/:id" element={<GiftDetail />} />
              <Route path="/register" element={<Registration />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
