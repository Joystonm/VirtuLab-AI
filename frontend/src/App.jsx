import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LabProvider } from './context/LabContext';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Physics from './pages/Physics';
import Playground from './pages/Playground';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <LabProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <Navbar />
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/physics" element={
                  <ProtectedRoute>
                    <Navbar />
                    <Physics />
                  </ProtectedRoute>
                } />
                <Route path="/playground" element={
                  <ProtectedRoute>
                    <Navbar />
                    <Playground />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </Router>
        </LabProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
