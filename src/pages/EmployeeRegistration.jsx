import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { ArrowLeft, Eye, EyeOff, Loader2, ChevronDown, ChevronRight, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { checkAuthStatus } from '../utils/checkAuthRedirect';
import AuthLayout from '../components/layout/AuthLayout';

// Position options for employee registration
const positionOptions = [
  { value: 'expert', label: 'Expert' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'sme', label: 'Subject Matter Expert (SME)' }
];

// Account name options for employee registration
const accountNameOptions = [
  { value: 'account_one', label: 'Account One' },
  { value: 'account_two', label: 'Account Two' },
  { value: 'account_three', label: 'Account Three' },
  { value: 'user_expert', label: 'User Expert' },
  { value: 'user_sme', label: 'User SME' }
  // Add more options as needed
];

const sectionLabel = 'block text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/45';

const FieldError = ({ id, children }) => (
  <p id={id} className="field-error-text">
    <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    {children}
  </p>
);

const NEXT_STEPS = [
  'Verify your email with the 6-digit code we send you',
  'Your company reviews and approves your request',
  'Log in and start swapping shifts and days off',
];

// Employee Registration Form
const EmployeeRegistration = () => { // Remove setCurrentPage prop
  const navigate = useNavigate(); // Initialize navigate function

  const [formData, setFormData] = useState({
    fullName: '',
    accountName: '',
    email: '',
    position: '',
    password: '',
    confirmPassword: '',
    companyId: '',
    employeeId: '',
    phoneNumber: ''
  });

  useEffect(() => {
    const { isLoggedIn, redirectPath } = checkAuthStatus();
    if (isLoggedIn && redirectPath) {
      navigate(redirectPath);
    }
  }, [navigate]);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [companiesError, setCompaniesError] = useState('');
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [accountNameSearchTerm, setAccountNameSearchTerm] = useState('');

  // Filter companies based on search term
  const filteredCompanies = useMemo(() => {
    if (!companySearchTerm) return companies;
    return companies.filter(company =>
      company.name.toLowerCase().includes(companySearchTerm.toLowerCase())
    );
  }, [companies, companySearchTerm]);

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      setCompaniesError('');
      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/company-auth/companies`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.success && data.data) {
        setCompanies(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch companies');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompaniesError('Failed to load companies. Please refresh the page.');
      // Fallback to empty array
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

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
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    } else if (formData.fullName.length > 100) {
      newErrors.fullName = 'Full name must be less than 100 characters';
    }
    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    } else if (formData.accountName.length < 3) {
      newErrors.accountName = 'Account name must be at least 3 characters';
    } else if (formData.accountName.length > 50) {
      newErrors.accountName = 'Account name must be less than 50 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.accountName)) {
      newErrors.accountName = 'Account name can only contain letters, numbers, and underscores';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.position) {
      newErrors.position = 'Position is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.companyId) {
      newErrors.companyId = 'Company selection is required';
    }
    // Validate Employee ID
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    // Validate Phone Number
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else {
      const phone = formData.phoneNumber.trim();
      // Simple international format check: starts with +, has 8–15 digits
      const phoneRegex = /^\+[1-9]\d{0,2}[ -]?\d{4,14}$/;
      if (!phoneRegex.test(phone)) {
        newErrors.phoneNumber = 'Enter a valid international phone number (e.g., +1 555-123-4567)';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const response = await fetch(`${process.env.REACT_APP_URI_API_URL}/api/employee-requests/submit-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          accountName: formData.accountName.trim(),
          email: formData.email.toLowerCase().trim(),
          position: formData.position,
          password: formData.password,
          companyId: formData.companyId,
          employeeId: formData.employeeId.trim(),
          phoneNumber: formData.phoneNumber.trim()
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        // Success - navigate to OTP verification
        // Store email for OTP verification page
        sessionStorage.setItem('employee_request_email', formData.email);
        sessionStorage.setItem('employee_request_id', data.requestId);
        // Use navigate instead of setCurrentPage
        navigate('/employee_verify_otp'); // Adjust the path as needed
      } else {
        // Handle API errors
        if (data.message) {
          if (data.message.includes('already pending')) {
            setErrors({
              submit: 'A request with this email is already pending approval. Please check your email for verification or contact the company.'
            });
          } else if (data.message.includes('already registered')) {
            setErrors({
              submit: 'An employee with this email is already registered. Try logging in instead.'
            });
          } else if (data.message.includes('Company not found')) {
            setErrors({
              companyId: 'Selected company not found. Please refresh and try again.'
            });
          } else if (data.errors && data.errors.length > 0) {
            // Handle validation errors from backend
            const backendErrors = {};
            data.errors.forEach(error => {
              if (error.path) {
                backendErrors[error.path] = error.msg;
              }
            });
            setErrors(backendErrors);
          } else {
            setErrors({ submit: data.message });
          }
        } else {
          setErrors({ submit: 'Registration failed. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
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

  const filteredAccountNames = useMemo(() => {
    if (!accountNameSearchTerm) return accountNameOptions;
    return accountNameOptions.filter(option =>
      option.label.toLowerCase().includes(accountNameSearchTerm.toLowerCase())
    );
  }, [accountNameOptions, accountNameSearchTerm]);

  const retryFetchCompanies = () => {
    fetchCompanies();
  };

  const comboDisabled = loadingCompanies || companies.length === 0;

  return (
    <AuthLayout
      aside="employee"
      wide
      topLink={{ label: 'Log in', to: '/employee_login' }}
      footer={
        <p>
          Already have an account?{' '}
          {/* Use navigate for login link */}
          <button
            type="button"
            onClick={() => navigate('/employee_login')} // Adjust the path as needed
            className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
            disabled={isLoading}
          >
            Log in
          </button>
        </p>
      }
    >
      <div className="mx-auto w-full max-w-[600px] lg:max-w-none">
        {/* Use navigate(-1) for back button */}
        <button
          type="button"
          onClick={() => navigate(-1)} // Go back in history
          className="-ml-1 mb-5 inline-flex h-10 items-center gap-1.5 rounded-full pl-1 pr-3 text-sm font-medium text-ink/55 transition-colors hover:text-ink disabled:opacity-50"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>

        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/45">Step 1 of 2 · Your details</p>
        <h1 className="mt-2 font-display text-[30px] leading-tight text-ink sm:text-[34px]">Request to join your company</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink/60">
          Pick your company and enter the employee ID it gave you. After you verify your email, your company reviews the request.
        </p>

        <Link
          to="/company_register"
          className="group mt-5 inline-block rounded-full bg-lavender-200 px-4 py-2 text-[13px] leading-snug text-lavender-700 transition-colors hover:bg-lavender-300 sm:text-sm"
        >
          Registering a new company?{' '}
          <span className="whitespace-nowrap font-semibold">
            Company sign-up
            <ChevronRight className="ml-0.5 inline h-4 w-4 align-[-3px] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </Link>

        <div className="mt-8 space-y-8">
          {/* About you */}
          <fieldset>
            <legend className={sectionLabel}>About you</legend>
            <div className="mt-4 space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="field-label">
                  Full name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`field ${errors.fullName ? 'field-error' : ''}`}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                />
                {errors.fullName && <FieldError id="fullName-error">{errors.fullName}</FieldError>}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Email */}
                <div className="min-w-0">
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
                    className={`field ${errors.email ? 'field-error' : ''}`}
                    placeholder="your.email@example.com"
                    disabled={isLoading}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && <FieldError id="email-error">{errors.email}</FieldError>}
                </div>

                {/* Phone Number */}
                <div className="min-w-0">
                  <label htmlFor="phoneNumber" className="field-label">
                    Phone number
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`field ${errors.phoneNumber ? 'field-error' : ''}`}
                    placeholder="+201234567890"
                    disabled={isLoading}
                    aria-invalid={!!errors.phoneNumber}
                    aria-describedby={errors.phoneNumber ? 'phoneNumber-error phoneNumber-hint' : 'phoneNumber-hint'}
                  />
                  {errors.phoneNumber && <FieldError id="phoneNumber-error">{errors.phoneNumber}</FieldError>}
                  <p id="phoneNumber-hint" className="field-hint">
                    Include your country code, e.g. +20, +971, +1, +44
                  </p>
                </div>
              </div>
            </div>
          </fieldset>

          {/* Your company */}
          <fieldset>
            <legend className={sectionLabel}>Your company</legend>
            <div className="mt-4 space-y-5">
              {/* Company Selection - Searchable */}
              <div>
                <label htmlFor="company-search-input" className="field-label">
                  Company
                </label>
                <div className="relative">
                  {/* Hidden select element for form data binding - Keep it but don't let it block interaction */}
                  <select
                    id="companyId"
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleChange}
                    className="sr-only" // Use screen reader only class to hide it completely from view and interaction
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <option value="">Select a company</option>
                    {filteredCompanies.map((company) => (
                      <option key={company._id} value={company._id}>
                        {company.name}
                      </option>
                    ))}
                  </select>

                  {/* Custom searchable select UI */}
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden="true" />
                    <input
                      id="company-search-input"
                      type="text"
                      autoComplete="off"
                      value={companySearchTerm}
                      onChange={(e) => setCompanySearchTerm(e.target.value)}
                      placeholder={
                        loadingCompanies
                          ? 'Loading companies...'
                          : companies.length === 0
                            ? 'No companies available'
                            : formData.companyId
                              ? companies.find(c => c._id === formData.companyId)?.name || 'Select company'
                              : 'Write your company name and choose!'
                      }
                      className={`field pl-11 pr-11 ${errors.companyId ? 'field-error' : ''} ${
                        comboDisabled ? 'cursor-not-allowed bg-sand-100' : ''
                      } ${formData.companyId ? 'placeholder:text-ink' : ''}`}
                      disabled={loadingCompanies || isLoading || companies.length === 0}
                      aria-invalid={!!errors.companyId}
                      aria-describedby={errors.companyId ? 'companyId-error' : undefined}
                    />
                    {loadingCompanies && (
                      <Loader2 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink/40" aria-hidden="true" />
                    )}
                  </div>

                  {/* Dropdown list */}
                  {companySearchTerm && !loadingCompanies && companies.length > 0 && (
                    <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-ink/[0.07] bg-white p-1.5 shadow-float animate-slide-down">
                      {filteredCompanies.length === 0 ? (
                        <div className="px-3 py-2.5 text-sm text-ink/50">No companies found</div>
                      ) : (
                        filteredCompanies.map((company) => (
                          <button
                            type="button"
                            key={company._id}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-brand-50 focus-visible:bg-brand-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData(prev => ({ ...prev, companyId: company._id }));
                              setCompanySearchTerm('');
                              if (errors.companyId) {
                                setErrors(prev => ({ ...prev, companyId: '' }));
                              }
                              if (errors.submit) {
                                setErrors(prev => ({ ...prev, submit: '' }));
                              }
                            }}
                          >
                            <img
                              src={`${process.env.REACT_APP_URI_API_URL}/images/companies/logos/${company.logo}`}
                              alt={`${company.name} Logo`}
                              className="h-8 w-8 shrink-0 rounded-lg border border-ink/[0.07] bg-white object-contain"
                            />
                            <span className="truncate font-medium">{company.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {errors.companyId && <FieldError id="companyId-error">{errors.companyId}</FieldError>}
                {companiesError && (
                  <div className="alert alert-error mt-3 items-center justify-between">
                    <span className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {companiesError}
                    </span>
                    <button
                      type="button"
                      onClick={retryFetchCompanies}
                      className="inline-flex min-h-[36px] shrink-0 items-center rounded-full px-3 font-semibold underline underline-offset-2 hover:text-rose-500"
                      disabled={loadingCompanies}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {formData.companyId && (
                  <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-mint-300 bg-mint-100 px-4 py-3 text-sm text-mint-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <p className="min-w-0">
                      Selected company: <strong className="font-semibold">{companies.find(c => c._id === formData.companyId)?.name}</strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Employee ID */}
                <div className="min-w-0">
                  <label htmlFor="employeeId" className="field-label">
                    Employee ID
                  </label>
                  <input
                    id="employeeId"
                    name="employeeId"
                    type="text"
                    autoComplete="off"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className={`field ${errors.employeeId ? 'field-error' : ''}`}
                    placeholder="EMP-XXXX-EXP-12345"
                    disabled={isLoading}
                    aria-invalid={!!errors.employeeId}
                    aria-describedby={errors.employeeId ? 'employeeId-error employeeId-hint' : 'employeeId-hint'}
                  />
                  {errors.employeeId && <FieldError id="employeeId-error">{errors.employeeId}</FieldError>}
                  <p id="employeeId-hint" className="field-hint">
                    The ID your company gave you
                  </p>
                </div>

                {/* Position */}
                <div className="min-w-0">
                  <label htmlFor="position" className="field-label">
                    Position
                  </label>
                  <div className="relative">
                    <select
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`field appearance-none pr-11 ${errors.position ? 'field-error' : ''} ${
                        formData.position ? '' : 'text-ink/45'
                      } [&>option]:text-ink`}
                      aria-invalid={!!errors.position}
                      aria-describedby={errors.position ? 'position-error' : undefined}
                    >
                      <option value="">Select your position</option>
                      {positionOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" aria-hidden="true" />
                  </div>
                  {errors.position && <FieldError id="position-error">{errors.position}</FieldError>}
                </div>
              </div>

              {/* Account Name - Changed to Select */}
              <div>
                <label htmlFor="account-name-search-input" className="field-label">
                  Account name
                </label>
                <div className="relative">
                  {/* Hidden select element for form data binding - Keep it but don't let it block interaction */}
                  <select
                    id="accountName"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleChange}
                    className="sr-only" // Use screen reader only class to hide it completely from view and interaction
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <option value="">Choose an account name</option>
                    {filteredAccountNames.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {/* Custom searchable select UI */}
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden="true" />
                    <input
                      id="account-name-search-input"
                      type="text"
                      autoComplete="off"
                      value={accountNameSearchTerm}
                      onChange={(e) => setAccountNameSearchTerm(e.target.value)}
                      placeholder={
                        formData.accountName
                          ? accountNameOptions.find(opt => opt.value === formData.accountName)?.label || 'Select account name'
                          : 'Write your account name and choose!'
                      }
                      className={`field pl-11 ${errors.accountName ? 'field-error' : ''} ${
                        comboDisabled ? 'cursor-not-allowed bg-sand-100' : ''
                      } ${formData.accountName ? 'placeholder:text-ink' : ''}`}
                      disabled={loadingCompanies || isLoading || companies.length === 0}
                      aria-invalid={!!errors.accountName}
                      aria-describedby={errors.accountName ? 'accountName-error accountName-hint' : 'accountName-hint'}
                    />
                  </div>
                  {/* Dropdown list */}
                  {accountNameSearchTerm && !loadingCompanies && accountNameOptions.length > 0 && (
                    <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-ink/[0.07] bg-white p-1.5 shadow-float animate-slide-down">
                      {filteredAccountNames.length === 0 ? (
                        <div className="px-3 py-2.5 text-sm text-ink/50">No account names found</div>
                      ) : (
                        filteredAccountNames.map((option) => (
                          <button
                            type="button"
                            key={option.value}
                            className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-brand-50 focus-visible:bg-brand-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData(prev => ({ ...prev, accountName: option.value }));
                              setAccountNameSearchTerm('');
                              if (errors.accountName) {
                                setErrors(prev => ({ ...prev, accountName: '' }));
                              }
                              if (errors.submit) {
                                setErrors(prev => ({ ...prev, submit: '' }));
                              }
                            }}
                          >
                            <span className="truncate">{option.label}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {errors.accountName && <FieldError id="accountName-error">{errors.accountName}</FieldError>}
                <p id="accountName-hint" className="field-hint">
                  Start typing, then pick your account from the list
                </p>
              </div>
            </div>
          </fieldset>

          {/* Password */}
          <fieldset>
            <legend className={sectionLabel}>Password</legend>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="min-w-0">
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
                    aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" /> : <Eye className="h-[18px] w-[18px]" aria-hidden="true" />}
                  </button>
                </div>
                {errors.password && <FieldError id="password-error">{errors.password}</FieldError>}
              </div>

              <div className="min-w-0">
                <label htmlFor="confirmPassword" className="field-label">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`field pr-12 ${errors.confirmPassword ? 'field-error' : ''}`}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-ink/45 transition-colors hover:text-ink disabled:cursor-not-allowed"
                    disabled={isLoading}
                    aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" /> : <Eye className="h-[18px] w-[18px]" aria-hidden="true" />}
                  </button>
                </div>
                {errors.confirmPassword && <FieldError id="confirmPassword-error">{errors.confirmPassword}</FieldError>}
              </div>
            </div>
            <p id="password-hint" className="field-hint">
              Use at least 6 characters. Mixing upper- and lowercase letters, numbers and a symbol makes it stronger.
            </p>
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

        {/* Process Information */}
        <div className="card-sand mt-7 p-5">
          <h2 className="text-sm font-semibold text-ink">What happens next</h2>
          <ol className="mt-3 space-y-2.5">
            {NEXT_STEPS.map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-[13px] leading-relaxed text-ink/70">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white font-display text-[13px] text-ink shadow-soft">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || loadingCompanies || companies.length === 0}
          className="btn btn-primary btn-lg mt-7 w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Submitting request…
            </>
          ) : (
            'Submit request'
          )}
        </button>
      </div>
    </AuthLayout>
  );
};

export default EmployeeRegistration;
