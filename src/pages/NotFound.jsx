import React, { useState, useEffect } from 'react';
import { Home, ArrowLeft, Calendar, Building, User, RefreshCw, Mail, Phone } from 'lucide-react';

// Configuration for easy customization
const notFoundConfig = {
  title: "Page Not Found",
  subtitle: "The page you're looking for doesn't exist or has been moved.",
  image: {
    emoji: "🔍",
    alt: "Page not found illustration"
  },
  quickLinks: [
    {
      id: 'home',
      title: 'Go Home',
      subtitle: 'Back to the main page',
      icon: Home,
      route: '/',
      color: 'blue',
      primary: true
    },
    {
      id: 'company_register',
      title: 'Company Registration',
      subtitle: 'Register your business',
      icon: Building,
      route: '/company_register',
      color: 'green'
    },
    {
      id: 'employee-register',
      title: 'Employee Access',
      subtitle: 'Request to join a company',
      icon: User,
      route: '/employee_register',
      color: 'purple'
    },
    {
      id: 'auth-flow',
      title: 'Registration Flow',
      subtitle: 'Guided account setup',
      icon: Calendar,
      route: '/',
      color: 'orange'
    }
  ],
  helpSection: {
    title: "Need Help?",
    description: "If you think this is an error, here are some things you can try:",
    suggestions: [
      "Check the URL for typos",
      "Go back to the previous page",
      "Use the search feature",
      "Contact our support team"
    ]
  },
  contact: {
    email: "support@shiftswap.com",
    phone: "+1 (555) 123-4567"
  }
};

// 404 Not Found Component
const NotFoundPage = ({ navigate }) => {
  const [countdown, setCountdown] = useState(null);

  // Optional auto-redirect countdown (disabled by default)
  useEffect(() => {
    // Uncomment below to enable auto-redirect after 10 seconds
    // setCountdown(10);
    // const timer = setInterval(() => {
    //   setCountdown(prev => {
    //     if (prev <= 1) {
    //       clearInterval(timer);
    //       handleNavigation('/');
    //       return 0;
    //     }
    //     return prev - 1;
    //   });
    // }, 1000);
    // return () => clearInterval(timer);
  }, []);

  const handleNavigation = (route) => {
    if (navigate) {
      navigate(route);
    } else {
      // Fallback for environments without navigation
      window.location.href = route;
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      handleNavigation('/');
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-12">
        {/* Main Error Section */}
        <div className="text-center space-y-6">
          {/* Large 404 Display */}
          <div className="relative">
            <h1 className="text-9xl font-bold text-gray-200 select-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl">{notFoundConfig.image.emoji}</span>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {notFoundConfig.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {notFoundConfig.subtitle}
            </p>
          </div>

          {/* Auto-redirect countdown (if enabled) */}
          {countdown && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-blue-800 text-sm">
                Redirecting to home page in <span className="font-semibold">{countdown}</span> seconds...
              </p>
            </div>
          )}
        </div>

        {/* Quick Navigation Links */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 text-center">
            Where would you like to go?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {notFoundConfig.quickLinks.map((link) => {
              const IconComponent = link.icon;
              const colorClasses = {
                blue: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-600',
                green: 'border-green-200 hover:border-green-400 hover:bg-green-50 text-green-600',
                purple: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-600',
                orange: 'border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-orange-600'
              };

              return (
                <button
                  key={link.id}
                  onClick={() => handleNavigation(link.route)}
                  className={`bg-white border-2 rounded-xl p-6 text-left transition-all duration-200 hover:shadow-lg group ${colorClasses[link.color] || colorClasses.blue
                    } ${link.primary ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                >
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-lg ${link.color === 'green' ? 'bg-green-100' :
                      link.color === 'purple' ? 'bg-purple-100' :
                        link.color === 'orange' ? 'bg-orange-100' :
                          'bg-blue-100'
                      }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {link.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {link.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </button>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="text-center space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">
              {notFoundConfig.helpSection.title}
            </h3>
            <p className="text-gray-600">
              {notFoundConfig.helpSection.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Suggestions */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Suggestions:</h4>
              <ul className="space-y-2">
                {notFoundConfig.helpSection.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 flex-shrink-0"></div>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Contact Support:</h4>
              <div className="space-y-2">
                <a
                  href={`mailto:${notFoundConfig.contact.email}`}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {notFoundConfig.contact.email}
                </a>
                <a
                  href={`tel:${notFoundConfig.contact.phone}`}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {notFoundConfig.contact.phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>&copy; 2025 Shiftswaper. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;