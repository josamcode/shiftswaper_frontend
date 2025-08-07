import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Loader, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Handle navigation state messages
  useEffect(() => {
    if (location?.state?.message) {
      if (location.state.type === 'success') {
        setSuccessMessage(location.state.message);
      } else if (location.state.type === 'error') {
        setErrors({ submit: location.state.message });
      }

      // Clear navigation state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Countdown timer for resend functionality
  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error on typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const email = formData.email.trim();
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
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
      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/employee-requests/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim()
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(data.message);
        setCountdown(180); // 3 minutes countdown for resend

        // Navigate to reset password page after 3 seconds
        setTimeout(() => {
          navigate('/reset-password', {
            state: {
              email: formData.email.toLowerCase().trim(),
              message: 'Please check your email for the OTP code.',
              type: 'info'
            }
          });
        }, 3000);
      } else {
        if (response.status === 429) {
          // Rate limit error
          setErrors({ submit: data.message });
        } else {
          setErrors({ submit: data.message || 'Failed to send reset email. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrors({ submit: 'Unable to connect to server. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/employee-requests/resend-reset-password-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim()
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(data.message);
        setCountdown(180); // Reset countdown
      } else {
        setErrors({ submit: data.message || 'Failed to resend OTP. Please try again.' });
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setErrors({ submit: 'Unable to connect to server. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleGoBack = () => {
    navigate('/employee_login');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
            Back to Login
          </button>
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Forgot Password?</h2>
          <p className="mt-2 text-sm text-gray-600">
            No worries! Enter your email address and we'll send you a code to reset your password.
          </p>
        </div>

        <div className="space-y-6">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-green-600">{successMessage}</p>
                  {countdown > 0 && (
                    <p className="text-xs text-green-500 mt-1">
                      Redirecting to reset page in a moment...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Input */}
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
                placeholder="Enter your registered email address"
                disabled={isLoading}
              />
              {errors.email && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.email}</p>
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

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !formData.email.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Sending Reset Code...
              </>
            ) : (
              'Send Reset Code'
            )}
          </button>

          {/* Resend Button */}
          {successMessage && (
            <div className="text-center">
              <button
                onClick={handleResend}
                disabled={isLoading || countdown > 0}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center mx-auto"
              >
                {countdown > 0 ? (
                  <>
                    <Clock className="h-4 w-4 mr-1" />
                    Resend available in {formatTime(countdown)}
                  </>
                ) : (
                  'Didn\'t receive the code? Resend'
                )}
              </button>
            </div>
          )}

          {/* Manual Navigation Link */}
          {successMessage && (
            <div className="text-center">
              <button
                onClick={() => navigate('/reset-password', {
                  state: {
                    email: formData.email.toLowerCase().trim(),
                    message: 'Please check your email for the OTP code.',
                    type: 'info'
                  }
                })}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Continue to Reset Password →
              </button>
            </div>
          )}

          {/* Information Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">What happens next?</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• We'll send a 6-digit code to your email address</li>
              <li>• The code expires in 15 minutes for security</li>
              <li>• You can request a new code if needed</li>
              <li>• Use the code to create a new password</li>
            </ul>
          </div>

          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-amber-900 mb-2">Security Notice:</h4>
            <ul className="text-xs text-amber-800 space-y-1">
              <li>• Only registered employees can reset passwords</li>
              <li>• If you don't have an account, request employee access first</li>
              <li>• Check your spam folder if you don't see the email</li>
              <li>• Contact your company administrator if you need help</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;