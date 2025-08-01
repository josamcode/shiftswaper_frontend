import React, { useState, useEffect } from 'react';
import { User, ArrowLeft, Eye, EyeOff, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { checkAuthStatus } from '../utils/checkAuthRedirect';
import { useAuth } from '../auth/AuthContext';

// Employee Login Form
const EmployeeLogin = () => {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { isLoggedIn, redirectPath } = checkAuthStatus();
    if (isLoggedIn && redirectPath) {
      navigate(redirectPath);
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Check for messages from navigation state
  useEffect(() => {
    if (location?.state?.message) {
      if (location.state.type === 'success') {
        setSuccessMessage(location.state.message);
        // Clear the message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      } else if (location.state.type === 'error') {
        setErrors({ submit: location.state.message });
      }

      // Clear the navigation state to prevent message showing on refresh
      if (navigate) {
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/employee-requests/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store authentication token and employee data
        if (data.data.token) {
          const { position } = data.data.employee;
          const prefix = position === 'supervisor' ? 'supervisor' : 'employee';

          Cookies.set(`${prefix}_token`, data.data.token, {
            expires: 7,
            secure: true,
            sameSite: 'strict'
          });

          Cookies.set(`${prefix}_data`, JSON.stringify(data.data.employee), {
            expires: 7,
            secure: true,
            sameSite: 'strict'
          });
        }

        login();

        // Success - redirect to employee dashboard
        setSuccessMessage(`Welcome back, ${data.data.employee.fullName}!`);

        setTimeout(() => {
          if (navigate) {
            navigate('/dashboard');
          } else {
            // Fallback for demo
            alert(`Login successful! Welcome ${data.data.employee.fullName}`);
          }
        }, 1500);

      } else {
        // Handle API errors
        if (data.message) {
          if (data.message.includes('pending approval')) {
            setErrors({
              submit: 'Your registration request is still pending approval from the company. Please wait for approval before attempting to login.'
            });
          } else if (data.message.includes('rejected')) {
            // Extract rejection reason if available
            const reasonMatch = data.message.match(/Reason: (.+)$/);
            const reason = reasonMatch ? reasonMatch[1] : 'No reason provided';
            setErrors({
              submit: `Your registration request was rejected. Reason: ${reason}. Please contact your company for more information.`
            });
          } else if (data.message.includes('Employee not found')) {
            setErrors({
              submit: 'No employee account found with this email. Please check your email or register for an account.'
            });
          } else if (data.message.includes('Invalid email or password')) {
            setErrors({
              submit: 'Invalid email or password. Please check your credentials and try again.'
            });
          } else if (data.errors && data.errors.length > 0) {
            // Handle validation errors from backend
            const backendErrors = {};
            data.errors.forEach(error => {
              if (error.path) {
                backendErrors[error.path] = error.msg;
              }
            });
            setErrors(backendErrors);
          } else {
            setErrors({ submit: data.message });
          }
        } else {
          setErrors({ submit: 'Login failed. Please try again.' });
        }
      }

    } catch (error) {
      console.error('Login error:', error);

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setErrors({
          submit: 'Unable to connect to server. Please check your internet connection and try again.'
        });
      } else {
        setErrors({
          submit: 'An unexpected error occurred. Please try again later.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // this would navigate to forgot password page
    alert('Forgot password functionality would be implemented here. Please contact your company administrator for password reset assistance.');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleGoBack = () => {
    if (navigate) {
      navigate(-1);
    }
  };

  const handleRegisterRedirect = () => {
    if (navigate) {
      navigate('/employee_register');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <button
            onClick={handleGoBack}
            className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200"
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Employee Login</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your employee account
          </p>
        </div>

        <div className="space-y-6">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-600">{successMessage}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="your.email@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.email}</p>
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.password}</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
              disabled={isLoading}
            >
              Forgot your password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !formData.email || !formData.password}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={handleRegisterRedirect}
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                disabled={isLoading}
              >
                Request employee access
              </button>
            </p>
          </div>

          {/* Status Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Account Status Guide:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• <strong>Pending:</strong> Your request is awaiting company approval</li>
              <li>• <strong>Rejected:</strong> Your request was declined by the company</li>
              <li>• <strong>Approved:</strong> You can login and access shift swapping</li>
              <li>• <strong>Need help?</strong> Contact your company administrator</li>
            </ul>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Troubleshooting:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Make sure you've submitted an employee request</li>
              <li>• Verify your email address if you haven't already</li>
              <li>• Wait for company approval before attempting to login</li>
              <li>• Check that Caps Lock is off</li>
              <li>• Contact support if issues persist</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;