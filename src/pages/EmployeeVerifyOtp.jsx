import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Check, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { checkAuthStatus } from '../utils/checkAuthRedirect';
import AuthLayout from '../components/layout/AuthLayout';
import { CONTACT_EMAIL } from '../components/Footer';

const NEXT_STEPS = [
  { label: 'Submit your request', state: 'done' },
  { label: 'Verify your email address', state: 'current' },
  { label: 'Wait for company approval', state: 'upcoming' },
  { label: 'Start swapping shifts', state: 'upcoming' },
];

const formatCooldown = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

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
    setResendCooldown(1);
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
      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/employee-requests/resend-request-otp`, {
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
        setResendCooldown(1);
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
        successMsg.className = 'fixed top-4 right-4 z-50 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-float transition-opacity duration-300';
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
      <AuthLayout aside="verify">
        <div className="mx-auto w-full max-w-[440px] py-6 text-center lg:max-w-none" role="status" aria-live="polite">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint-200 text-mint-700 animate-scale-in">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </span>
          <h1 className="mt-6 font-display text-[30px] leading-tight text-ink sm:text-[34px]">Email verified</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink/60">
            Your email has been successfully verified. Your request is now pending company approval.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink/55">
            <Loader2 className="h-4 w-4 animate-spin text-mint-500" aria-hidden="true" />
            Taking you to the login page…
          </p>
        </div>
      </AuthLayout>
    );
  }

  const resendDisabled = resendCooldown > 0 || isLoading;

  return (
    <AuthLayout aside="verify" topLink={{ label: 'Log in', to: '/employee_login' }}>
      <div className="mx-auto w-full max-w-[440px] lg:max-w-none">
        <button
          type="button"
          onClick={handleGoBack}
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
          We’ve sent a 6-digit verification code to{' '}
          <span className="break-all font-semibold text-ink">{email}</span>
        </p>

        <fieldset className="mt-8">
          <legend className="field-label mb-0">Enter verification code</legend>
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

        {/* Error Message */}
        <div aria-live="polite">
          {error && (
            <div className="alert alert-error mt-5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Attempts Counter */}
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

        {/* Process Information */}
        <div className="card-sand mt-7 p-5">
          <h2 className="text-sm font-semibold text-ink">What’s next</h2>
          <ol className="mt-3 space-y-2.5">
            {NEXT_STEPS.map((step, i) => (
              <li key={step.label} className="flex items-center gap-3 text-[13px]">
                {step.state === 'done' ? (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint-500 text-white">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                ) : (
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-[13px] ${
                      step.state === 'current' ? 'bg-brand-500 text-white' : 'bg-white text-ink/50 shadow-soft'
                    }`}
                  >
                    {i + 1}
                  </span>
                )}
                <span className={step.state === 'upcoming' ? 'text-ink/55' : 'font-medium text-ink'}>
                  {step.label}
                  {step.state === 'current' && <span className="sr-only"> (current step)</span>}
                  {step.state === 'done' && <span className="sr-only"> (done)</span>}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Help Text */}
        <details className="group mt-4 rounded-2xl border border-ink/[0.07]">
          <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
            Didn’t get the email?
            <ChevronDown className="h-4 w-4 shrink-0 text-ink/50 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
          </summary>
          <ul className="space-y-1.5 px-5 pb-5 text-[13px] leading-relaxed text-ink/65">
            <li className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink/35" aria-hidden="true" />
              Check your spam or junk folder
            </li>
            <li className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink/35" aria-hidden="true" />
              Make sure you entered the correct email
            </li>
            <li className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink/35" aria-hidden="true" />
              The code expires in 15 minutes
            </li>
            <li className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink/35" aria-hidden="true" />
              After 5 failed attempts, verification is locked for 30 minutes
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
        </details>
      </div>
    </AuthLayout>
  );
};

export default EmployeeVerifyOTP;
