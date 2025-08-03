import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  Building,
  User,
  Shield,
  AlertTriangle,
  ArrowRight,
  Home,
  LogIn,
  Loader,
  Clock
} from 'lucide-react';
import CompanyDashboard from './CompanyDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import SupervisorDashboard from './SupervisorDashboard';
import ModeratorDashboard from './ModeratorDashboard';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  const companyToken = Cookies.get('company_token') || null;
  const supervisorToken = Cookies.get('supervisor_token') || null;
  const employeeToken = Cookies.get('employee_token') || null;
  const moderatorToken = Cookies.get('moderator_token') || null;

  useEffect(() => {
    const checkAuthentication = () => {
      setTimeout(() => {
        if (companyToken) {
          setUserType('company');
        } else if (supervisorToken) {
          setUserType('supervisor');
        } else if (employeeToken) {
          setUserType('employee');
        } else if (moderatorToken) {
          setUserType('moderator');
        }
        setIsLoading(false);
      }, 0);
    };

    checkAuthentication();
  }, [companyToken, employeeToken]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">Authenticating...</h2>
            <p className="text-gray-600">Please wait while we verify your credentials</p>
          </div>
          <div className="flex items-center justify-center space-x-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>This may take a moment</span>
          </div>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on token
  if (userType === 'company') {
    return <CompanyDashboard />;
  } else if (userType === 'supervisor') {
    return <SupervisorDashboard />;
  } else if (userType === 'employee') {
    return <EmployeeDashboard />;
  } else if (userType === 'moderator') {
    return <ModeratorDashboard />;
  }

  // Unauthorized access page
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Access Restricted</h1>
                <p className="text-sm text-gray-500">Authentication Required</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Session Expired</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full">
          {/* Error Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            {/* Error Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Unauthorized Access</h2>
              <p className="text-red-100">Authentication credentials required to proceed</p>
            </div>

            {/* Error Body */}
            <div className="px-6 py-8 space-y-6">
              {/* Problem Description */}
              <div className="text-center space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">You must be logged in to view the dashboard</h3>
                <p className="text-gray-600">
                  Your session has expired or you haven't logged in yet. Please authenticate to access your dashboard.
                </p>
              </div>

              {/* Account Types */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 text-center">Available Account Types:</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <Building className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <span className="text-xs font-medium text-blue-800">Company</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center opacity-50">
                    <User className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                    <span className="text-xs font-medium text-gray-500">Employee</span>
                    {/* <span className="text-xs text-gray-500">(Coming Soon)</span> */}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href="/get_started"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center group shadow-lg"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Go to Login
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </a>

                <a
                  href="/"
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </a>
              </div>

              {/* Help Text */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Make sure you're using the correct login credentials</li>
                  <li>• Check if your session has expired</li>
                  <li>• Clear your browser cache and cookies</li>
                  <li>• Contact support if the problem persists</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Session Status: Not Authenticated</span>
                <span>Error Code: 401</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Secure access powered by Shiftswaper authentication system
            </p>
          </div>
        </div>
      </main>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-red-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-orange-200 rounded-full opacity-20 blur-3xl"></div>
      </div>
    </div>
  );
};

export default Dashboard;