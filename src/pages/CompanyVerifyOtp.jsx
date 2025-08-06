import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkAuthStatus } from '../utils/checkAuthRedirect';

const CompanyVerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const { isLoggedIn, redirectPath } = checkAuthStatus();
    if (isLoggedIn && redirectPath) {
      navigate(redirectPath);
    }
  }, [navigate]);

  // Get email from registration
  const email = location.state?.email || '';

  // Validate email on mount
  useEffect(() => {
    if (!email) {
      setError('No email provided. Please register again.');
      // Optionally redirect
      const timer = setTimeout(() => navigate('/company_register'), 3000);
      return () => clearTimeout(timer);
    } else {
      setResendCooldown(180); // Start cooldown
    }
  }, [email, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

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
  }, [resendCooldown]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle backspace and Enter
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    setError('');
    const focusIndex = Math.min(pasted.length, 5);
    document.getElementById(`otp-${focusIndex}`)?.focus();
  };

  // Submit OTP to backend
  const handleSubmit = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    if (isLocked) {
      setError('Too many attempts. Try again later.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/company-auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
        credentials: 'include' // If using cookies for session
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to company dashboard after success
        setTimeout(() => {
          navigate('/company_login', { replace: true });
        }, 1500);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= 5) {
          setIsLocked(true);
          setError('Too many failed attempts. Account locked for 30 minutes.');
        } else {
          setError(data.message || `Invalid OTP. ${5 - newAttempts} attempts left.`);
        }

        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0 || isLoading || isLocked) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/company-auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setResendCooldown(180);
        setAttempts(0);
        setIsLocked(false);
        setError('');
        // Optional: Show toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
        toast.textContent = 'OTP resent to your email.';
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
      } else {
        setError(data.message || 'Failed to resend OTP. Try again.');
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError('Could not resend OTP. Check your network.');
    }
  };

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Verified!</h2>
          <p className="text-gray-600">Your company email has been successfully verified.</p>
          <Loader className="animate-spin h-6 w-6 text-green-600 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <button
            onClick={() => navigate(-1)}
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
          <p className="mt-2 text-sm text-gray-600">We've sent a 6-digit code to</p>
          <p className="text-sm font-medium text-gray-900">{email}</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Enter the code
            </label>
            <div className="flex justify-center space-x-2 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isLoading || success}
                  className={`w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${error
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center justify-center space-x-2 mb-4">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {attempts > 0 && !isLocked && (
              <p className="text-xs text-gray-500 text-center">{attempts}/5 attempts used</p>
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
            <p className="text-sm text-gray-600">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || isLoading || isLocked}
              className={`text-sm font-medium transition-colors duration-200 ${resendCooldown > 0 || isLoading || isLocked
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:text-blue-700'
                }`}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Need help?</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Check spam or junk folder</li>
              <li>• Ensure the email is correct</li>
              <li>• Code expires in 15 minutes</li>
              <li>• Contact support@example.com</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyVerifyOTP;