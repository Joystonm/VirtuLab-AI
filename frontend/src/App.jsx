import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LabProvider } from './context/LabContext';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLab from './components/MainLab';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <LabProvider>
          <Router>
            <div className="h-screen bg-gray-50 dark:bg-gray-900">
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <MainLab />
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
