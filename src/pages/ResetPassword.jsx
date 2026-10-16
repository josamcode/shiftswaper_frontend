import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, ArrowLeft, Eye, EyeOff, Loader2, AlertCircle, Check, CheckCircle2, Clock, Info, RefreshCw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';

const FieldError = ({ id, children }) => (
  <p id={id} className="field-error-text">
    <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    {children}
  </p>
);

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

  // Live checklist mirroring the validation rules above (display only).
  const passwordRequirements = [
    { label: 'At least 6 characters', met: formData.newPassword.length >= 6 },
    { label: 'An uppercase letter (A–Z)', met: /[A-Z]/.test(formData.newPassword) },
    { label: 'A lowercase letter (a–z)', met: /[a-z]/.test(formData.newPassword) },
    { label: 'A number (0–9)', met: /\d/.test(formData.newPassword) },
  ];

  return (
    <AuthLayout aside="reset" topLink={{ label: 'Log in', to: '/employee_login' }}>
      <div className="mx-auto w-full max-w-[440px] lg:max-w-none">
        <button
          type="button"
          onClick={handleGoBack}
          className="-ml-1 mb-5 inline-flex h-10 items-center gap-1.5 rounded-full pl-1 pr-3 text-sm font-medium text-ink/55 transition-colors hover:text-ink disabled:opacity-50"
          disabled={isLoading || isResending}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>

        <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-peach-200 text-peach-700 lg:hidden">
          <KeyRound className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/45">Employee password reset</p>
        <h1 className="mt-2 font-display text-[30px] leading-tight text-ink sm:text-[34px]">Choose a new password</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink/60">
          Enter the verification code sent to <span className="break-all font-semibold text-ink">{formData.email}</span>
        </p>

        <div aria-live="polite">
          {/* Success Message */}
          {successMessage && (
            <div className="alert alert-success mt-6">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p>{successMessage}</p>
                <p className="mt-1 text-[13px] opacity-80">
                  Redirecting to login page...
                </p>
              </div>
            </div>
          )}

          {/* Info Message */}
          {infoMessage && (
            <div className="alert alert-info mt-6">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{infoMessage}</p>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-6">
          {/* Email Input (readonly) */}
          <div>
            <label htmlFor="email" className="field-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="field cursor-not-allowed bg-sand-100 text-ink/55 hover:border-ink/15"
              disabled
            />
          </div>

          {/* OTP Input */}
          <fieldset>
            <legend className="field-label mb-0">Verification code</legend>
            <div className="mt-2 grid max-w-[360px] grid-cols-6 gap-2 sm:gap-3">
              {formData.otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => otpRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(index, e)}
                  onPaste={handleOTPPaste}
                  aria-label={`Digit ${index + 1} of 6`}
                  aria-invalid={!!errors.otp}
                  aria-describedby={errors.otp ? 'otp-error' : undefined}
                  className={`h-14 w-full min-w-0 rounded-xl border text-center font-display text-2xl text-ink shadow-soft transition-[border-color,box-shadow] duration-200 focus:shadow-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
                    errors.otp
                      ? 'border-rose-300 bg-rose-100 focus:border-rose-500'
                      : 'border-ink/15 bg-white hover:border-ink/25 focus:border-brand-500'
                  }`}
                  disabled={isLoading || isResending}
                />
              ))}
            </div>
            {errors.otp && <FieldError id="otp-error">{errors.otp}</FieldError>}

            {/* Resend Button */}
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isLoading || isResending || countdown > 0}
              className="mt-2 inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 disabled:cursor-not-allowed disabled:font-medium disabled:text-ink/45"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                <>
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span className="tabular-nums">Resend available in {formatTime(countdown)}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Didn't receive the code? Resend
                </>
              )}
            </button>
          </fieldset>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="field-label">
              New password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showPasswords.newPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.newPassword}
                onChange={handleChange}
                className={`field pr-12 ${errors.newPassword ? 'field-error' : ''}`}
                placeholder="Enter new password"
                disabled={isLoading || isResending}
                aria-invalid={!!errors.newPassword}
                aria-describedby={errors.newPassword ? 'newPassword-error password-requirements' : 'password-requirements'}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('newPassword')}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-ink/45 transition-colors hover:text-ink disabled:cursor-not-allowed"
                disabled={isLoading || isResending}
                aria-label={showPasswords.newPassword ? 'Hide new password' : 'Show new password'}
              >
                {showPasswords.newPassword ? <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" /> : <Eye className="h-[18px] w-[18px]" aria-hidden="true" />}
              </button>
            </div>
            {errors.newPassword && <FieldError id="newPassword-error">{errors.newPassword}</FieldError>}

            {/* Password Requirements */}
            <ul id="password-requirements" className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
              {passwordRequirements.map((req) => (
                <li
                  key={req.label}
                  className={`flex items-center gap-2 text-[13px] transition-colors ${req.met ? 'text-mint-700' : 'text-ink/55'}`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors ${
                      req.met ? 'bg-mint-500 text-white' : 'border border-ink/20 bg-white'
                    }`}
                    aria-hidden="true"
                  >
                    {req.met && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                  </span>
                  {req.label}
                  <span className="sr-only">{req.met ? '(met)' : '(not met yet)'}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="field-label">
              Confirm new password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`field pr-12 ${errors.confirmPassword ? 'field-error' : ''}`}
                placeholder="Confirm new password"
                disabled={isLoading || isResending}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirmPassword')}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-ink/45 transition-colors hover:text-ink disabled:cursor-not-allowed"
                disabled={isLoading || isResending}
                aria-label={showPasswords.confirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
              >
                {showPasswords.confirmPassword ? <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" /> : <Eye className="h-[18px] w-[18px]" aria-hidden="true" />}
              </button>
            </div>
            {errors.confirmPassword && <FieldError id="confirmPassword-error">{errors.confirmPassword}</FieldError>}
          </div>
        </div>

        {/* Submit Error */}
        <div aria-live="polite">
          {errors.submit && (
            <div className="alert alert-error mt-6">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || isResending || !formData.otp.join('') || !formData.newPassword || !formData.confirmPassword}
          className="btn btn-primary btn-lg mt-7 w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Resetting password…
            </>
          ) : (
            'Reset password'
          )}
        </button>

        {/* Security Notice */}
        <div className="card-sand mt-7 p-5">
          <h2 className="text-sm font-semibold text-ink">Security tips</h2>
          <ul className="mt-2.5 space-y-1.5 text-[13px] leading-relaxed text-ink/65">
            {[
              'The verification code expires in 15 minutes',
              'Don’t share your verification code with anyone',
              'Choose a strong, unique password',
              'Keep your login credentials secure',
            ].map((tip) => (
              <li key={tip} className="flex gap-2">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink/35" aria-hidden="true" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
