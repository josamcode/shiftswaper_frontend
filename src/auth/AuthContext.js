import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = () => {
    const companyToken = Cookies.get('company_token');
    const employeeToken = Cookies.get('employee_token');
    const supervisorToken = Cookies.get('supervisor_token');
    setIsLoggedIn(!!(companyToken || employeeToken || supervisorToken));
    setLoading(false);
  };

  useEffect(() => {
    checkAuthStatus();

    // Listen for storage changes (cookie changes)
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = () => {
    checkAuthStatus();
  };

  const logout = () => {
    Cookies.remove('company_token');
    Cookies.remove('employee_token');
    Cookies.remove('employee_data');
    Cookies.remove('company_data');
    Cookies.remove('supervisor_data');
    Cookies.remove('supervisor_token');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      loading,
      login,
      logout,
      checkAuthStatus,
      setIsLoggedIn
    }}>
      {children}
    </AuthContext.Provider>
  );
};