import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LabProvider } from './context/LabContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Physics from './pages/Physics';
import Playground from './pages/Playground';
import Astronomy from './pages/Astronomy';
import './styles/globals.css';

function App() {
  return (
    <LabProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/physics" element={<Physics />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/astronomy" element={<Astronomy />} />
          </Routes>
        </div>
      </Router>
    </LabProvider>
  );
}

export default App;
