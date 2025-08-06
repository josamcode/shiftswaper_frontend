import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, ArrowLeft, Eye, EyeOff, Loader } from 'lucide-react';
import { checkAuthStatus } from '../utils/checkAuthRedirect';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Register Your Company</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your company account to start managing shifts
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Company Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="Enter your company name"
                disabled={isLoading}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Company Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="Describe your company and what you do"
                disabled={isLoading}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/500 characters
              </p>
            </div>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Company Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="company@example.com"
                disabled={isLoading}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="Enter your password"
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
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
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
            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="+201234567890"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Include country code (e.g.,+20, +971, +1, +44)
              </p>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
            {/* Logo Upload */}
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                Logo *
              </label>
              <input
                id="logo"
                name="logo"
                type="file"
                onChange={handleLogoChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${errors.logo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                accept="image/*"
                disabled={isLoading}
              />
              {errors.logo && <p className="mt-1 text-sm text-red-600">{errors.logo}</p>}
            </div>
          </div>
          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
          {/* Terms Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              By creating an account, you agree to our{' '}
              <a href="#terms" className="underline hover:text-blue-900">Terms of Service</a> and{' '}
              <a href="#privacy" className="underline hover:text-blue-900">Privacy Policy</a>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Creating Account...
              </>
            ) : (
              'Create Company Account'
            )}
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/company_login')}
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

export default CompanyRegister;