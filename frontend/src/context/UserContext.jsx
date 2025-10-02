import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({
    experimentsCompleted: 0,
    totalScore: 0,
    achievements: []
  });

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    setProgress({
      experimentsCompleted: 0,
      totalScore: 0,
      achievements: []
    });
  };

  const updateProgress = (newProgress) => {
    setProgress(prev => ({ ...prev, ...newProgress }));
  };

  const value = {
    user,
    progress,
    login,
    logout,
    updateProgress
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
