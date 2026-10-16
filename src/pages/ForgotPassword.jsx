import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, KeyRound, Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';

const FieldError = ({ id, children }) => (
  <p id={id} className="field-error-text">
    <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    {children}
  </p>
);

const Bullet = ({ children }) => (
  <li className="flex gap-2">
    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink/35" aria-hidden="true" />
    <span>{children}</span>
  </li>
);

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
    <AuthLayout aside="reset" topLink={{ label: 'Log in', to: '/employee_login' }}>
      <div className="mx-auto w-full max-w-[440px] lg:max-w-none">
        <button
          type="button"
          onClick={handleGoBack}
          className="-ml-1 mb-5 inline-flex h-10 items-center gap-1.5 rounded-full pl-1 pr-3 text-sm font-medium text-ink/55 transition-colors hover:text-ink disabled:opacity-50"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to log in
        </button>

        <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-peach-200 text-peach-700 lg:hidden">
          <KeyRound className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/45">Employee password reset</p>
        <h1 className="mt-2 font-display text-[30px] leading-tight text-ink sm:text-[34px]">Forgot your password?</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink/60">
          No worries. Enter the email you registered with and we’ll send you a 6-digit code to reset it.
        </p>

        {/* Success Message */}
        <div aria-live="polite">
          {successMessage && (
            <div className="alert alert-success mt-6">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p>{successMessage}</p>
                {countdown > 0 && (
                  <p className="mt-1 text-[13px] opacity-80">
                    Redirecting to reset page in a moment...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          {/* Email Input */}
          <label htmlFor="email" className="field-label">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            className={`field ${errors.email ? 'field-error' : ''}`}
            placeholder="Enter your registered email address"
            disabled={isLoading}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && <FieldError id="email-error">{errors.email}</FieldError>}
        </div>

        {/* Submit Error */}
        <div aria-live="polite">
          {errors.submit && (
            <div className="alert alert-error mt-5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !formData.email.trim()}
          className="btn btn-primary btn-lg mt-7 w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending reset code…
            </>
          ) : (
            'Send reset code'
          )}
        </button>

        {successMessage && (
          <div className="mt-4 flex flex-col items-center gap-1">
            {/* Resend Button */}
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading || countdown > 0}
              className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 disabled:cursor-not-allowed disabled:font-medium disabled:text-ink/45"
            >
              {countdown > 0 ? (
                <>
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span className="tabular-nums">Resend available in {formatTime(countdown)}</span>
                </>
              ) : (
                'Didn\'t receive the code? Resend'
              )}
            </button>

            {/* Manual Navigation Link */}
            <button
              type="button"
              onClick={() => navigate('/reset-password', {
                state: {
                  email: formData.email.toLowerCase().trim(),
                  message: 'Please check your email for the OTP code.',
                  type: 'info'
                }
              })}
              className="link-arrow min-h-[40px] text-sm"
            >
              Continue to reset password
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Information Section */}
        <div className="card-sand mt-7 space-y-5 p-5">
          <div>
            <h2 className="text-sm font-semibold text-ink">What happens next</h2>
            <ul className="mt-2.5 space-y-1.5 text-[13px] leading-relaxed text-ink/65">
              <Bullet>We’ll email you a 6-digit code</Bullet>
              <Bullet>The code expires in 15 minutes</Bullet>
              <Bullet>You can request a new code if needed</Bullet>
              <Bullet>Use the code to choose a new password</Bullet>
            </ul>
          </div>
          {/* Security Notice */}
          <div>
            <h2 className="text-sm font-semibold text-ink">Good to know</h2>
            <ul className="mt-2.5 space-y-1.5 text-[13px] leading-relaxed text-ink/65">
              <Bullet>Only registered employees can reset passwords here</Bullet>
              <Bullet>No account yet? Request employee access first</Bullet>
              <Bullet>Check your spam folder if the email doesn’t arrive</Bullet>
              <Bullet>Contact your company administrator if you need help</Bullet>
            </ul>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
