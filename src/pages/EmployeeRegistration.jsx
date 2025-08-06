import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { User, ArrowLeft, Eye, EyeOff, Loader, ChevronDown, AlertCircle, CheckCircle, Building } from 'lucide-react';
import { checkAuthStatus } from '../utils/checkAuthRedirect';

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

// Employee Registration Form
const EmployeeRegistration = () => { // Remove setCurrentPage prop
  const navigate = useNavigate(); // Initialize navigate function

  const [formData, setFormData] = useState({
    fullName: '',
    accountName: '',
    email: '',
    position: '',
    password: '',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Use navigate(-1) for back button */}
          <button
            onClick={() => navigate(-1)} // Go back in history
            className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200"
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Request Employee Access</h2>
          <p className="mt-2 text-sm text-gray-600">
            Submit a request to join your company
          </p>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
              {errors.fullName && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.fullName}</p>
                </div>
              )}
            </div>
            {/* Account Name - Changed to Select */}
            <div className={`${formData.accountName ? 'mb-8' : 'mb-0'} transition-all duration-300`}>
              <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">
                Account Name *
              </label>
              <div className="relative">
                {/* Hidden select element for form data binding - Keep it but don't let it block interaction */}
                <select
                  id="accountName"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleChange}
                  className="sr-only" // Use screen reader only class to hide it completely from view and interaction
                >
                  <option value="">Choose an account name</option>
                  {filteredAccountNames.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {/* Custom searchable select UI */}
                <div
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors duration-200 bg-white flex items-center justify-between ${errors.accountName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } ${loadingCompanies || companies.length === 0 ? 'bg-gray-50' : ''}`}
                >
                  <input
                    id="account-name-search-input"
                    type="text"
                    value={accountNameSearchTerm}
                    onChange={(e) => setAccountNameSearchTerm(e.target.value)}
                    placeholder={
                      formData.accountName
                        ? accountNameOptions.find(opt => opt.value === formData.accountName)?.label || 'Select account name'
                        : 'Write your account name and choose!'
                    }
                    className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-0 text-gray-900 placeholder-gray-500"
                    disabled={loadingCompanies || isLoading || companies.length === 0}
                  />
                  {/* <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" /> */}
                </div>
                {/* Dropdown list */}
                {accountNameSearchTerm && !loadingCompanies && accountNameOptions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 max-h-60 overflow-auto">
                    {filteredAccountNames.length === 0 ? (
                      <div className="px-4 py-2 text-gray-500">No account names found</div>
                    ) : (
                      filteredAccountNames.map((option) => (
                        <div
                          key={option.value}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center"
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
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {errors.accountName && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.accountName}</p>
                </div>
              )}
            </div>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="your.email@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.email}</p>
                </div>
              )}
            </div>

            {/* Company Selection - Searchable */}
            <div className={`${formData.companyId ? 'mb-8' : 'mb-0'} transition-all duration-300`}>
              <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-1">
                Your Company Name *
              </label>
              <div className="relative">
                {/* Hidden select element for form data binding - Keep it but don't let it block interaction */}
                <select
                  id="companyId"
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleChange}
                  className="sr-only" // Use screen reader only class to hide it completely from view and interaction
                >
                  <option value="">Select a company</option>
                  {filteredCompanies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.name}
                    </option>
                  ))}
                </select>

                {/* Custom searchable select UI */}
                <div
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors duration-200 bg-white flex items-center justify-between ${errors.companyId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } ${loadingCompanies || companies.length === 0 ? 'bg-gray-50' : ''}`}
                >
                  <input
                    id="company-search-input"
                    type="text"
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
                    className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-0 text-gray-900 placeholder-gray-500"
                    disabled={loadingCompanies || isLoading || companies.length === 0}
                  />
                  {/* <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" /> */}
                </div>

                {/* Dropdown list */}
                {companySearchTerm && !loadingCompanies && companies.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 max-h-60 overflow-auto">
                    {filteredCompanies.length === 0 ? (
                      <div className="px-4 py-2 text-gray-500">No companies found</div>
                    ) : (
                      filteredCompanies.map((company) => (
                        <div
                          key={company._id}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center"
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
                            className="h-8 w-8 object-contain mr-3 rounded-full"
                          />
                          <span className="truncate">{company.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {errors.companyId && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.companyId}</p>
                </div>
              )}
              {companiesError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-600">{companiesError}</p>
                    </div>
                    <button
                      onClick={retryFetchCompanies}
                      className="text-sm text-red-600 hover:text-red-800 underline"
                      disabled={loadingCompanies}
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>

            {formData.companyId && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                ✅ You have selected a company: <strong>{companies.find(c => c._id === formData.companyId)?.name}</strong>
              </div>
            )}

            {/* Position */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                Position *
              </label>
              <div className="relative">
                <select
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 appearance-none bg-white ${errors.position ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select your position</option>
                  {positionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute inset-y-0 right-0 h-full w-8 text-gray-400 pointer-events-none flex items-center justify-center" />
              </div>
              {errors.position && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.position}</p>
                </div>
              )}
            </div>
            {/* Employee ID */}
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID *
              </label>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                value={formData.employeeId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.employeeId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="EMP-XXXX-EXP-12345"
                disabled={isLoading}
              />
              {errors.employeeId && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.employeeId}</p>
                </div>
              )}
            </div>
            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="+201234567890"
                disabled={isLoading}
              />
              {errors.phoneNumber && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.phoneNumber}</p>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Include country code (e.g.,+20, +971, +1, +44)
              </p>
            </div>
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="Create a password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.password}</p>
                </div>
              )}
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <p>Password must:</p>
                <ul className="list-disc list-inside ml-1 space-y-1">
                  <li>Be at least 6 characters long</li>
                  <li>Include a combination of letters and numbers</li>
                  <li>Include at least one special character (e.g., !@#$%&*)</li>
                  <li>Include at least one uppercase letter</li>
                </ul>
              </div>
            </div>
          </div>
          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            </div>
          )}
          {/* Process Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Request Process:</p>
                <ol className="mt-2 space-y-1">
                  <li>1. Verify your email address</li>
                  <li>2. Wait for company approval</li>
                  <li>3. Gain access to shift swapping</li>
                </ol>
              </div>
            </div>
          </div>
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || loadingCompanies || companies.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Submitting Request...
              </>
            ) : (
              'Submit Employee Request'
            )}
          </button>
          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              {/* Use navigate for login link */}
              <button
                type="button"
                onClick={() => navigate('/employee_login')} // Adjust the path as needed
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                disabled={isLoading}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRegistration;