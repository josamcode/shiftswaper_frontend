import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { checkAuthStatus } from '../utils/checkAuthRedirect';

// Employee OTP Verification Component
const EmployeeVerifyOTP = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [email, setEmail] = useState('');
  const [requestId, setRequestId] = useState('');

  useEffect(() => {
    const { isLoggedIn, redirectPath } = checkAuthStatus();
    if (isLoggedIn && redirectPath) {
      navigate(redirectPath);
    }
  }, [navigate]);

  // Get email from session storage on component mount
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('employee_request_email');
    const storedRequestId = sessionStorage.getItem('employee_request_id');

    if (!storedEmail) {
      // No email found, redirect to registration
      if (navigate) navigate('/employee_register');
      return;
    }

    setEmail(storedEmail);
    setRequestId(storedRequestId || '');

    // Start initial cooldown
    setResendCooldown(120);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleOtpChange = (index, value) => {
    // Prevent multiple characters
    if (value.length > 1) return;

    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }

    // Handle Enter key to submit
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);

    // Only allow digits
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    setError('');
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    if (isLocked) {
      setError('Account is temporarily locked. Please try again later.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/employee-requests/verify-request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otpString
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success - show success state
        setSuccess(true);

        // Clear session storage
        sessionStorage.removeItem('employee_request_email');
        sessionStorage.removeItem('employee_request_id');

        // Redirect after short delay
        setTimeout(() => {
          if (navigate) {
            navigate('/employee_login', {
              state: {
                message: 'Email verified successfully! Your request is pending company approval. You can login once approved.',
                type: 'success'
              }
            });
          }
        }, 2000);

      } else {
        // Handle API errors
        if (data.message) {
          if (data.message.includes('locked') || data.message.includes('Too many')) {
            setIsLocked(true);
            setError(data.message);
          } else if (data.message.includes('attempts remaining')) {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            setError(data.message);
          } else if (data.message.includes('expired')) {
            setError('OTP has expired. Please request a new one.');
          } else if (data.message.includes('No pending request')) {
            setError('No pending request found. Please register again.');
            setTimeout(() => {
              if (navigate) navigate('/employee_register');
            }, 3000);
          } else {
            setError(data.message);
          }
        } else {
          setError('Verification failed. Please try again.');
        }

        // Clear OTP inputs on error
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }

    } catch (error) {
      console.error('OTP verification error:', error);

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Unable to connect to server. Please check your internet connection and try again.');
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/employee-requests/resend-request-ot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success - start cooldown
        setResendCooldown(120);
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setError('');
        setAttempts(0); // Reset attempts on resend
        setIsLocked(false);

        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
        successMsg.textContent = 'OTP resent successfully!';
        document.body.appendChild(successMsg);
        setTimeout(() => {
          successMsg.style.opacity = '0';
          setTimeout(() => document.body.removeChild(successMsg), 300);
        }, 3000);

      } else {
        if (data.message) {
          if (data.message.includes('wait') || data.message.includes('minutes')) {
            setError(data.message);
          } else if (data.message.includes('No pending request')) {
            setError('No pending request found. Please register again.');
            setTimeout(() => {
              if (navigate) navigate('/employee_register');
            }, 3000);
          } else {
            setError(data.message);
          }
        } else {
          setError('Failed to resend OTP. Please try again.');
        }
      }

    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Failed to resend OTP. Please check your connection and try again.');
    }
  };

  const handleGoBack = () => {
    // Clear session storage when going back
    sessionStorage.removeItem('employee_request_email');
    sessionStorage.removeItem('employee_request_id');
    if (navigate) navigate(-1);
  };

  if (success) {
    // Redirect after 3 seconds (3000 milliseconds) instead of 2
    setTimeout(() => {
      if (navigate) {
        navigate('/employee_login', {
          state: {
            message: 'Email verified successfully! Your request is pending company approval. You can login once approved.',
            type: 'success'
          }
        });
      }
    }, 3000); // Changed from 2000 to 3000

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Email Verified!</h2>
          <p className="text-gray-600">
            Your email has been successfully verified. Your request is now pending company approval.
          </p>
          <p className="text-sm text-gray-500">
            You'll be redirected to the login page shortly...
          </p>
          <div className="flex justify-center">
            <Loader className="animate-spin h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>
    );
  }

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
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-sm font-medium text-gray-900 break-all">{email}</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Enter verification code
            </label>
            <div className="flex justify-center space-x-2 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isLoading || success}
                  className={`w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${error
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } ${isLoading ? 'bg-gray-50' : 'bg-white'
                    }`}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center justify-center space-x-2 mb-4">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Attempts Counter */}
            {attempts > 0 && !isLocked && (
              <p className="text-xs text-gray-500 text-center">
                {attempts}/5 attempts used
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || otp.join('').length !== 6 || isLocked}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || isLoading}
              className={`text-sm font-medium transition-colors duration-200 ${resendCooldown > 0 || isLoading
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:text-blue-700'
                }`}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
            </button>
          </div>

          {/* Help Text */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Troubleshooting:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you entered the correct email</li>
              <li>• The code expires in 15 minutes</li>
              <li>• After 5 failed attempts, account will be locked for 30 minutes</li>
              <li>• Contact support if you continue having issues</li>
            </ul>
          </div>

          {/* Process Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">What's Next:</h4>
            <ol className="text-xs text-blue-800 space-y-1">
              <li>1. ✅ Submit registration request</li>
              <li>2. 🔄 Verify your email address</li>
              <li>3. ⏳ Wait for company approval</li>
              <li>4. 🎉 Start swapping shifts!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeVerifyOTP;