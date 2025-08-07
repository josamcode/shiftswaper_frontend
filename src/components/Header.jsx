import React, { useState } from 'react';
import { Menu, X, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Data arrays for dynamic content
const navigationLinks = [
  { label: 'Shifts', href: '/shift_swaps' },
  { label: 'Days off', href: '/day_off_swaps' },
  { label: 'How It Works?', href: '/how_it_works' },
  { label: 'About', href: '/about' },
];

// Header Component
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleAuthClick = () => {
    navigate('/get_started');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div
              className="flex-shrink-0 flex items-center cursor-pointer"
              onClick={handleLogoClick}
            >
              <Calendar className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-heading font-bold text-secondary-900">Shiftswaper</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4">
            {navigationLinks.map((link, index) => (
              <Link
                key={index}
                to={link.href}
                className="text-secondary-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <button
                onClick={handleDashboardClick}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={handleAuthClick}
                  className="text-primary-600 hover:text-primary-700 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Sign In
                </button>
                <button
                  onClick={handleAuthClick}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-secondary-400 hover:text-secondary-500 p-2"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navigationLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  className="text-secondary-600 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 pb-2 space-y-2">
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      handleDashboardClick();
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200"
                  >
                    Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        handleAuthClick();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left text-primary-600 hover:text-primary-700 px-3 py-2 text-base font-medium transition-colors duration-200"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        handleAuthClick();
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;