import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkAuthStatus } from '../utils/checkAuthRedirect';
import AuthLayout from '../components/layout/AuthLayout';
import { CONTACT_EMAIL } from '../components/Footer';

const formatCooldown = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

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
        toast.className = 'fixed top-4 right-4 z-50 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-float animate-fade-in';
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
      <AuthLayout aside="verify">
        <div className="mx-auto w-full max-w-[440px] py-6 text-center lg:max-w-none" role="status" aria-live="polite">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint-200 text-mint-700 animate-scale-in">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </span>
          <h1 className="mt-6 font-display text-[30px] leading-tight text-ink sm:text-[34px]">You’re verified</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink/60">Your company email has been successfully verified.</p>
          <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink/55">
            <Loader2 className="h-4 w-4 animate-spin text-mint-500" aria-hidden="true" />
            Taking you to log in…
          </p>
        </div>
      </AuthLayout>
    );
  }

  const resendDisabled = resendCooldown > 0 || isLoading || isLocked;

  return (
    <AuthLayout aside="verify" topLink={{ label: 'Log in', to: '/company_login' }}>
      <div className="mx-auto w-full max-w-[440px] lg:max-w-none">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="-ml-1 mb-5 inline-flex h-10 items-center gap-1.5 rounded-full pl-1 pr-3 text-sm font-medium text-ink/55 transition-colors hover:text-ink disabled:opacity-50"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>

        <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-200 text-mint-700 lg:hidden">
          <Mail className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/45">Step 2 of 2 · Verify email</p>
        <h1 className="mt-2 font-display text-[30px] leading-tight text-ink sm:text-[34px]">Check your email</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink/60">
          We’ve sent a 6-digit code to{' '}
          <span className="break-all font-semibold text-ink">{email || 'your email'}</span>
        </p>

        <fieldset className="mt-8">
          <legend className="field-label mb-0">Enter the code</legend>
          <div className="mt-2 grid max-w-[360px] grid-cols-6 gap-2 sm:gap-3">
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
                aria-label={`Digit ${index + 1} of 6`}
                aria-invalid={!!error}
                className={`h-14 w-full min-w-0 rounded-xl border text-center font-display text-2xl text-ink shadow-soft transition-[border-color,box-shadow] duration-200 focus:shadow-ring focus:outline-none ${
                  error
                    ? 'border-rose-300 bg-rose-100 focus:border-rose-500'
                    : 'border-ink/15 bg-white hover:border-ink/25 focus:border-brand-500'
                } ${isLoading ? 'cursor-not-allowed opacity-60' : ''}`}
              />
            ))}
          </div>
        </fieldset>

        <div aria-live="polite">
          {error && (
            <div className="alert alert-error mt-5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {attempts > 0 && !isLocked && (
          <p className="mt-3 text-[13px] text-ink/50">{attempts}/5 attempts used</p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || otp.join('').length !== 6 || isLocked}
          className="btn btn-primary btn-lg mt-7 w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Verifying…
            </>
          ) : (
            'Verify email'
          )}
        </button>

        <p className="mt-5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-sm text-ink/60">
          <span>Didn’t receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendDisabled}
            className={`inline-flex min-h-[40px] items-center font-semibold transition-colors duration-200 ${
              resendDisabled ? 'cursor-not-allowed text-ink/40' : 'text-brand-600 hover:text-brand-700'
            }`}
          >
            {resendCooldown > 0 ? (
              <span className="tabular-nums">Resend in {formatCooldown(resendCooldown)}</span>
            ) : (
              'Resend code'
            )}
          </button>
        </p>

        <div className="card-sand mt-7 p-5">
          <h2 className="text-sm font-semibold text-ink">Need help?</h2>
          <ul className="mt-2.5 space-y-1.5 text-[13px] leading-relaxed text-ink/65">
            <li className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink/35" aria-hidden="true" />
              Check your spam or junk folder
            </li>
            <li className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink/35" aria-hidden="true" />
              Make sure the email address above is correct
            </li>
            <li className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink/35" aria-hidden="true" />
              Codes expire after 15 minutes
            </li>
            <li className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink/35" aria-hidden="true" />
              <span>
                Still stuck? Email{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="break-all font-semibold text-brand-600 hover:text-brand-700">
                  {CONTACT_EMAIL}
                </a>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </AuthLayout>
  );
};

export default CompanyVerifyOTP;
