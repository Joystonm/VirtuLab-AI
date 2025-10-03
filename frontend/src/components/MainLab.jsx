import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ExperimentDashboard from './ExperimentDashboard';
import ExperimentSimulation from './ExperimentSimulation';

const MainLab = () => {
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="h-screen bg-lab-bg">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
        <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
      
      {selectedExperiment ? (
        <ExperimentSimulation 
          experiment={selectedExperiment}
          onBack={() => setSelectedExperiment(null)}
        />
      ) : (
        <ExperimentDashboard onSelectExperiment={setSelectedExperiment} />
      )}
    </div>
  );
};

export default MainLab;
