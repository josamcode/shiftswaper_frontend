// src/components/CompanyLogin.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import Cookies from 'js-cookie';
import { checkAuthStatus } from '../utils/checkAuthRedirect';
import { useAuth } from '../auth/AuthContext';
import AuthLayout from '../components/layout/AuthLayout';
import { CONTACT_EMAIL } from '../components/Footer';

const FieldError = ({ id, children }) => (
  <p id={id} className="field-error-text">
    <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    {children}
  </p>
);

// Company Login Form
const CompanyLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const { isLoggedIn, redirectPath } = checkAuthStatus();
    if (isLoggedIn && redirectPath) {
      navigate(redirectPath);
    }
  }, [navigate]);


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
    try {
      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/company-auth/login`, {
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
        // Store authentication token (Consider using secure cookies instead)
        if (data.token) {
          // Save token and company data to cookies, expires in 7 days
          Cookies.set('company_token', data.token, { expires: 7, secure: true, sameSite: 'strict' });
          Cookies.set('company_data', JSON.stringify(data.company), { expires: 7, secure: true, sameSite: 'strict' });
        }

        login();

        navigate('/dashboard'); // Navigate to dashboard
      } else {
        // Handle API errors
        if (data.message) {
          if (data.message.includes('verify')) {
            setErrors({
              submit: 'Please verify your email first. Check your inbox for the verification code.'
            });
            // Navigate to OTP verification if needed
            navigate('/company_verify_otp', { state: { email: formData.email } });
          } else if (data.message.includes('Invalid')) {
            setErrors({
              submit: 'Invalid email or password. Please check your credentials and try again.'
            });
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <AuthLayout
      aside="company"
      topLink={{ label: 'Create an account', to: '/company_register' }}
      footer={
        <p>
          Don’t have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/company_register')} // Navigate to register
            className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
            disabled={isLoading}
          >
            Create a company account
          </button>
        </p>
      }
    >
      <div className="mx-auto w-full max-w-[440px] lg:max-w-none">
        <button
          type="button"
          onClick={() => navigate(-1)} // Navigate to back step
          className="-ml-1 mb-5 inline-flex h-10 items-center gap-1.5 rounded-full pl-1 pr-3 text-sm font-medium text-ink/55 transition-colors hover:text-ink disabled:opacity-50"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>

        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/45">Company account</p>
        <h1 className="mt-2 font-display text-[30px] leading-tight text-ink sm:text-[34px]">Welcome back</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink/60">
          Log in to review join requests and manage your team’s employee IDs.
        </p>

        <Link
          to="/employee_login"
          className="group mt-5 inline-block rounded-full bg-lavender-200 px-4 py-2 text-[13px] leading-snug text-lavender-700 transition-colors hover:bg-lavender-300 sm:text-sm"
        >
          Are you an employee?{' '}
          <span className="whitespace-nowrap font-semibold">
            Employee log in
            <ChevronRight className="ml-0.5 inline h-4 w-4 align-[-3px] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </Link>

        <div className="mt-8 space-y-5">
          {/* Email */}
          <div>
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
              placeholder="company@example.com"
              disabled={isLoading}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && <FieldError id="email-error">{errors.email}</FieldError>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="field-label">
              Password
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
          disabled={isLoading || !formData.email || !formData.password}
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

        {/* Help Section */}
        <details className="group mt-6 rounded-2xl bg-sand-200">
          <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
            Trouble logging in?
            <ChevronDown className="h-4 w-4 shrink-0 text-ink/50 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
          </summary>
          <ul className="space-y-1.5 px-5 pb-5 text-[13px] leading-relaxed text-ink/65">
            <li className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink/35" aria-hidden="true" />
              Make sure you’ve verified your company email
            </li>
            <li className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink/35" aria-hidden="true" />
              Check that Caps Lock is off
            </li>
            <li className="flex gap-2">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink/35" aria-hidden="true" />
              <span>
                Company accounts don’t have a self-service password reset. Forgot yours? Email{' '}
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

export default CompanyLogin;
