import React, { useState, useEffect, useRef } from 'react';
import { Key, ArrowLeft, Eye, EyeOff, Loader, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const otpRefs = useRef([]);

  // Get email from navigation state
  const emailFromState = location?.state?.email || '';

  const [formData, setFormData] = useState({
    email: emailFromState,
    otp: ['', '', '', '', '', ''],
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Handle navigation state messages
  useEffect(() => {
    if (location?.state?.message) {
      if (location.state.type === 'success') {
        setSuccessMessage(location.state.message);
      } else if (location.state.type === 'error') {
        setErrors({ submit: location.state.message });
      } else if (location.state.type === 'info') {
        setInfoMessage(location.state.message);
      }
    }
  }, [location]);

  // Redirect if no email provided
  useEffect(() => {
    if (!emailFromState) {
      navigate('/forgot-password', {
        state: {
          message: 'Please enter your email address first.',
          type: 'error'
        }
      });
    }
  }, [emailFromState, navigate]);

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

  const handleOTPChange = (index, value) => {
    // Only allow numbers and limit to 1 character
    const sanitizedValue = value.replace(/\D/g, '').slice(0, 1);

    const newOTP = [...formData.otp];
    newOTP[index] = sanitizedValue;
    setFormData(prev => ({ ...prev, otp: newOTP }));

    // Auto-focus next input
    if (sanitizedValue && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Clear OTP error
    if (errors.otp) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.otp;
        return newErrors;
      });
    }
  };

  const handleOTPKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (paste) {
      const newOTP = Array(6).fill('');
      for (let i = 0; i < Math.min(paste.length, 6); i++) {
        newOTP[i] = paste[i];
      }
      setFormData(prev => ({ ...prev, otp: newOTP }));

      // Focus the next empty field or the last field
      const nextIndex = Math.min(paste.length, 5);
      otpRefs.current[nextIndex]?.focus();
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

    const otpString = formData.otp.join('');
    if (!otpString) {
      newErrors.otp = 'Please enter the verification code';
    } else if (otpString.length !== 6) {
      newErrors.otp = 'Please enter all 6 digits';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    setInfoMessage('');

    try {
      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/employee-requests/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          otp: formData.otp.join(''),
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(data.message);

        // Clear form
        setFormData(prev => ({
          ...prev,
          otp: ['', '', '', '', '', ''],
          newPassword: '',
          confirmPassword: ''
        }));

        // Navigate to login after 3 seconds
        setTimeout(() => {
          navigate('/employee_login', {
            state: {
              message: 'Password reset successful! You can now login with your new password.',
              type: 'success'
            }
          });
        }, 3000);
      } else {
        if (response.status === 400) {
          // Handle specific validation errors
          if (data.message.includes('Invalid or expired OTP')) {
            setErrors({ otp: data.message });
          } else if (data.message.includes('password')) {
            setErrors({ newPassword: data.message });
          } else {
            setErrors({ submit: data.message });
          }
        } else {
          setErrors({ submit: data.message || 'Failed to reset password. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setErrors({ submit: 'Unable to connect to server. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    setErrors({});
    setInfoMessage('');

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
        setInfoMessage(data.message);
        setCountdown(180); // Reset countdown

        // Clear current OTP
        setFormData(prev => ({ ...prev, otp: ['', '', '', '', '', ''] }));
        otpRefs.current[0]?.focus();
      } else {
        setErrors({ submit: data.message || 'Failed to resend code. Please try again.' });
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setErrors({ submit: 'Unable to connect to server. Please try again.' });
    } finally {
      setIsResending(false);
    }
  };

  const handleGoBack = () => {
    navigate('/forgot-password');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!emailFromState) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <button
            onClick={handleGoBack}
            className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200"
            disabled={isLoading || isResending}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <Key className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the verification code sent to <span className="font-medium">{formData.email}</span>
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
                  <p className="text-xs text-green-500 mt-1">
                    Redirecting to login page...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Message */}
          {infoMessage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <p className="text-sm text-blue-600">{infoMessage}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Input (readonly) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                disabled
              />
            </div>

            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code *
              </label>
              <div className="flex space-x-2 justify-center">
                {formData.otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => otpRefs.current[index] = el}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    onPaste={handleOTPPaste}
                    className={`w-12 h-12 text-center text-lg font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.otp ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    disabled={isLoading || isResending}
                  />
                ))}
              </div>
              {errors.otp && (
                <div className="flex items-center justify-center space-x-1 mt-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.otp}</p>
                </div>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password *
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.newPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="Enter new password"
                  disabled={isLoading || isResending}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('newPassword')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  disabled={isLoading || isResending}
                >
                  {showPasswords.newPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.newPassword}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="Confirm new password"
                  disabled={isLoading || isResending}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  disabled={isLoading || isResending}
                >
                  {showPasswords.confirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
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
            disabled={isLoading || isResending || !formData.otp.join('') || !formData.newPassword || !formData.confirmPassword}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>

          {/* Resend Button */}
          <div className="text-center">
            <button
              onClick={handleResendOTP}
              disabled={isLoading || isResending || countdown > 0}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center mx-auto"
            >
              {isResending ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-1" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                <>
                  <Clock className="h-4 w-4 mr-1" />
                  Resend available in {formatTime(countdown)}
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Didn't receive the code? Resend
                </>
              )}
            </button>
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Password Requirements:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• At least 6 characters long</li>
              <li>• Contains uppercase letter (A-Z)</li>
              <li>• Contains lowercase letter (a-z)</li>
              <li>• Contains at least one number (0-9)</li>
            </ul>
          </div>

          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-amber-900 mb-2">Security Tips:</h4>
            <ul className="text-xs text-amber-800 space-y-1">
              <li>• The verification code expires in 15 minutes</li>
              <li>• Don't share your verification code with anyone</li>
              <li>• Choose a strong, unique password</li>
              <li>• Keep your login credentials secure</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;