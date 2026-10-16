import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ChevronRight, Eye, EyeOff, ImageIcon, Loader2, Upload } from 'lucide-react';
import { checkAuthStatus } from '../utils/checkAuthRedirect';
import AuthLayout from '../components/layout/AuthLayout';

const sectionLabel = 'block text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/45';

const FieldError = ({ id, children }) => (
  <p id={id} className="field-error-text">
    <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    {children}
  </p>
);

const CompanyRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    password: '',
    phone: '', // New state for phone number
  });
  const [logoFile, setLogoFile] = useState(null); // New state for logo file
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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogoFile(file);
    if (errors.logo) {
      setErrors(prev => ({ ...prev, logo: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Company name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Company name must be less than 100 characters';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+[\d]{1,3}[- ]?)?[\d- ]{4,14}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be a valid international number';
    }
    if (!logoFile) {
      newErrors.logo = 'Logo is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('logo', logoFile);

    try {
      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/company-auth/register`, {
        method: 'POST',
        body: formDataToSend // Do not set Content-Type here
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          const fieldErrors = {};
          errorData.errors.forEach(err => {
            fieldErrors[err.path] = err.msg;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ submit: errorData.message || 'Registration failed' });
        }
        return;
      }
      const data = await response.json();
      navigate('/company_verify_otp', { state: { email: formData.email } });
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      aside="company"
      wide
      topLink={{ label: 'Log in', to: '/company_login' }}
      footer={
        <p>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/company_login')}
            className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
            disabled={isLoading}
          >
            Log in
          </button>
        </p>
      }
    >
      <div className="mx-auto w-full max-w-[600px] lg:max-w-none">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="-ml-1 mb-5 inline-flex h-10 items-center gap-1.5 rounded-full pl-1 pr-3 text-sm font-medium text-ink/55 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>

        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/45">Step 1 of 2 · Company details</p>
        <h1 className="mt-2 font-display text-[30px] leading-tight text-ink sm:text-[34px]">Create your company account</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink/60">
          Register your business, verify it by email, then decide who joins your team.
        </p>

        <Link
          to="/employee_register"
          className="group mt-5 inline-block rounded-full bg-lavender-200 px-4 py-2 text-[13px] leading-snug text-lavender-700 transition-colors hover:bg-lavender-300 sm:text-sm"
        >
          Joining an existing company?{' '}
          <span className="whitespace-nowrap font-semibold">
            Employee sign-up
            <ChevronRight className="ml-0.5 inline h-4 w-4 align-[-3px] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </Link>

        <div className="mt-8 space-y-8">
          {/* Company */}
          <fieldset>
            <legend className={sectionLabel}>Your company</legend>
            <div className="mt-4 space-y-5">
              <div>
                <label htmlFor="name" className="field-label">
                  Company name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="organization"
                  value={formData.name}
                  onChange={handleChange}
                  className={`field ${errors.name ? 'field-error' : ''}`}
                  placeholder="Enter your company name"
                  disabled={isLoading}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && <FieldError id="name-error">{errors.name}</FieldError>}
              </div>

              <div>
                <label htmlFor="description" className="field-label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className={`field resize-none ${errors.description ? 'field-error' : ''}`}
                  placeholder="Describe your company and what you do"
                  disabled={isLoading}
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? 'description-error description-count' : 'description-count'}
                />
                <div className="mt-1.5 flex items-start justify-between gap-3">
                  {errors.description ? (
                    <p id="description-error" className="flex items-center gap-1 text-[13px] font-medium text-rose-700">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {errors.description}
                    </p>
                  ) : (
                    <p className="text-[13px] text-ink/50">At least 10 characters</p>
                  )}
                  <p id="description-count" className="shrink-0 text-[13px] tabular-nums text-ink/45">
                    {formData.description.length}/500 characters
                  </p>
                </div>
              </div>
            </div>
          </fieldset>

          {/* Account */}
          <fieldset>
            <legend className={sectionLabel}>Account &amp; contact</legend>
            <div className="mt-4 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="min-w-0">
                  <label htmlFor="email" className="field-label">
                    Company email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`field ${errors.email ? 'field-error' : ''}`}
                    placeholder="company@example.com"
                    disabled={isLoading}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && <FieldError id="email-error">{errors.email}</FieldError>}
                </div>

                <div className="min-w-0">
                  <label htmlFor="phone" className="field-label">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`field ${errors.phone ? 'field-error' : ''}`}
                    placeholder="+201234567890"
                    disabled={isLoading}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'phone-hint phone-error' : 'phone-hint'}
                  />
                  <p id="phone-hint" className="field-hint">
                    Include your country code, e.g. +20, +971, +1, +44
                  </p>
                  {errors.phone && <FieldError id="phone-error">{errors.phone}</FieldError>}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="field-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`field pr-12 ${errors.password ? 'field-error' : ''}`}
                    placeholder="Create a password"
                    disabled={isLoading}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error password-hint' : 'password-hint'}
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
                <p id="password-hint" className="field-hint">
                  Use at least 6 characters. Mixing upper- and lowercase letters, numbers and a symbol makes it stronger.
                </p>
              </div>
            </div>
          </fieldset>

          {/* Logo */}
          <fieldset>
            <legend className={sectionLabel}>Company logo</legend>
            <input
              id="logo"
              name="logo"
              type="file"
              onChange={handleLogoChange}
              className="peer sr-only"
              accept="image/*"
              disabled={isLoading}
              aria-invalid={!!errors.logo}
              aria-describedby={errors.logo ? 'logo-error' : undefined}
            />
            <label
              htmlFor="logo"
              className={`mt-4 flex min-h-[84px] cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed px-4 py-4 transition-colors duration-200 peer-focus-visible:border-brand-500 peer-focus-visible:shadow-ring peer-disabled:cursor-not-allowed peer-disabled:opacity-60 sm:px-5 ${
                errors.logo
                  ? 'border-rose-300 bg-rose-100'
                  : logoFile
                    ? 'border-mint-300 bg-mint-100'
                    : 'border-ink/15 bg-sand-100 hover:border-brand-400 hover:bg-brand-50'
              }`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-soft ${
                  logoFile ? 'text-mint-700' : 'text-ink'
                }`}
              >
                {logoFile ? <ImageIcon className="h-5 w-5" aria-hidden="true" /> : <Upload className="h-5 w-5" aria-hidden="true" />}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink">
                  {logoFile ? logoFile.name : 'Upload your company logo'}
                </span>
                <span className="mt-0.5 block text-[13px] text-ink/55">
                  {logoFile ? 'Click to choose a different image' : 'JPEG, PNG or GIF, up to 5 MB'}
                </span>
              </span>
            </label>
            {errors.logo && <FieldError id="logo-error">{errors.logo}</FieldError>}
          </fieldset>
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

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="btn btn-primary btn-lg mt-7 w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Creating account…
            </>
          ) : (
            'Create company account'
          )}
        </button>

        {/* Terms Notice */}
        <p className="mt-4 text-center text-[13px] leading-relaxed text-ink/55">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="font-semibold text-brand-600 hover:text-brand-700">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="font-semibold text-brand-600 hover:text-brand-700">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </AuthLayout>
  );
};

export default CompanyRegister;
