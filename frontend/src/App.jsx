import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LabProvider } from './context/LabContext';
import { UserProvider } from './context/UserContext';
import MainLab from './components/MainLab';
import './styles/globals.css';

function App() {
  return (
    <UserProvider>
      <LabProvider>
        <Router>
          <div className="h-screen bg-gray-50 dark:bg-gray-900">
            <Routes>
              <Route path="/" element={<MainLab />} />
            </Routes>
          </div>
        </Router>
      </LabProvider>
    </UserProvider>
  );
}

export default App;
