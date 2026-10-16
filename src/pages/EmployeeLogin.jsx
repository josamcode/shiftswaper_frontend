import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { checkAuthStatus } from '../utils/checkAuthRedirect';
import { useAuth } from '../auth/AuthContext';
import AuthLayout from '../components/layout/AuthLayout';
import { StatusBadge } from '../components/product/Mockups';

const FieldError = ({ id, children }) => (
  <p id={id} className="field-error-text">
    <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    {children}
  </p>
);

const STATUS_GUIDE = [
  { status: 'pending', text: 'Your request is awaiting company approval' },
  { status: 'approved', text: 'You can log in and start swapping shifts' },
  { status: 'rejected', text: 'Your request was declined by the company' },
];

const TIPS = [
  'Make sure you’ve submitted a request to join your company',
  'Verify your email address if you haven’t already',
  'Wait for company approval before logging in',
  'Check that Caps Lock is off',
  'Still stuck? Contact your company administrator',
];

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
    identifier: '',
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

    const identifier = formData.identifier.trim();
    if (!identifier) {
      newErrors.identifier = 'Email or Employee ID is required';
    }

    // Optional: Validate email format only if it looks like an email
    if (identifier && /\S+@\S+\.\S+/.test(identifier)) {
      if (!/\S+@\S+\.\S+/.test(identifier)) {
        newErrors.identifier = 'Please enter a valid email address';
      }
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
      const identifier = formData.identifier.trim();

      // Determine if it's an email or employee ID
      const isEmail = /\S+@\S+\.\S+/.test(identifier);
      const payload = {
        password: formData.password
      };

      if (isEmail) {
        payload.email = identifier.toLowerCase();
      } else {
        payload.employeeId = identifier.toUpperCase(); // Ensure uppercase
      }

      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/employee-requests/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { position } = data.data.employee;
        let prefix;
        if (position === 'supervisor') {
          prefix = 'supervisor';
        } else if (position === 'moderator') {
          prefix = 'moderator';
        } else {
          prefix = 'employee';
        }

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

        login();
        setSuccessMessage(`Welcome back, ${data.data.employee.fullName}!`);

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        let errorMsg = 'Invalid credentials. Please check and try again.';
        if (data.message) {
          if (data.message.includes('pending approval')) {
            errorMsg = 'Your registration request is still pending approval.';
          } else if (data.message.includes('rejected')) {
            errorMsg = data.message;
          } else if (data.message.includes('Employee not found')) {
            errorMsg = 'No account found with that email or ID.';
          } else if (data.message.includes('Invalid email or password')) {
            errorMsg = 'Incorrect password or ID.';
          }
        }
        setErrors({ submit: errorMsg });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'Unable to connect to server. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password page
    navigate('/forgot-password');
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
    <AuthLayout
      aside="employee"
      topLink={{ label: 'Request to join', to: '/employee_register' }}
      footer={
        <p>
          Don’t have an account?{' '}
          <button
            type="button"
            onClick={handleRegisterRedirect}
            className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
            disabled={isLoading}
          >
            Request employee access
          </button>
        </p>
      }
    >
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

        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/45">Employee account</p>
        <h1 className="mt-2 font-display text-[30px] leading-tight text-ink sm:text-[34px]">Welcome back</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink/60">
          Log in with your email or employee ID to see your swap requests and offers.
        </p>

        <Link
          to="/company_login"
          className="group mt-5 inline-block rounded-full bg-lavender-200 px-4 py-2 text-[13px] leading-snug text-lavender-700 transition-colors hover:bg-lavender-300 sm:text-sm"
        >
          Managing a company account?{' '}
          <span className="whitespace-nowrap font-semibold">
            Company log in
            <ChevronRight className="ml-0.5 inline h-4 w-4 align-[-3px] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </Link>

        {/* Success Message */}
        <div aria-live="polite">
          {successMessage && (
            <div className="alert alert-success mt-6">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{successMessage}</p>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-5">
          {/* Email or Employee ID */}
          <div>
            <label htmlFor="identifier" className="field-label">
              Email or employee ID
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              value={formData.identifier}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              className={`field ${errors.identifier ? 'field-error' : ''}`}
              placeholder="Enter your email or employee ID"
              disabled={isLoading}
              aria-invalid={!!errors.identifier}
              aria-describedby={errors.identifier ? 'identifier-error' : undefined}
            />
            {errors.identifier && <FieldError id="identifier-error">{errors.identifier}</FieldError>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-end justify-between gap-3">
              <label htmlFor="password" className="field-label">
                Password
              </label>
              {/* Forgot Password Link */}
              <button
                type="button"
                onClick={handleForgotPassword}
                className="inline-flex h-10 items-end pb-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className={`field pr-12 ${errors.password ? 'field-error' : ''}`}
                placeholder="Enter your password"
                disabled={isLoading}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-ink/45 transition-colors hover:text-ink disabled:cursor-not-allowed"
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" /> : <Eye className="h-[18px] w-[18px]" aria-hidden="true" />}
              </button>
            </div>
            {errors.password && <FieldError id="password-error">{errors.password}</FieldError>}
          </div>
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
          disabled={isLoading || !formData.identifier || !formData.password}
          className="btn btn-primary btn-lg mt-7 w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Logging in…
            </>
          ) : (
            'Log in'
          )}
        </button>

        {/* Status Information + Help */}
        <details className="group mt-6 rounded-2xl bg-sand-200">
          <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
            Can’t log in yet?
            <ChevronDown className="h-4 w-4 shrink-0 text-ink/50 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="px-5 pb-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/45">Request status</p>
            <ul className="mt-2.5 space-y-2">
              {STATUS_GUIDE.map((s) => (
                <li key={s.status} className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-ink/65">
                  <StatusBadge status={s.status} className="min-w-[78px] justify-center" />
                  {s.text}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/45">Troubleshooting</p>
            <ul className="mt-2.5 space-y-1.5 text-[13px] leading-relaxed text-ink/65">
              {TIPS.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink/35" aria-hidden="true" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </details>
      </div>
    </AuthLayout>
  );
};

export default EmployeeLogin;
