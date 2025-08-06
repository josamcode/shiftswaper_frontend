import React, { useState } from 'react';
import {
  Cookie,
  Info,
  Settings,
  BarChart3,
  Shield,
  Users,
  Globe,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  RefreshCw,
  Eye,
  Lock
} from 'lucide-react';

const CookiePolicy = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always true, can't be disabled
    functional: true,
    analytics: true,
    marketing: false
  });

  const sections = [
    { id: 'overview', title: 'What Are Cookies?', icon: Info },
    { id: 'types', title: 'Cookie Types', icon: Cookie },
    { id: 'usage', title: 'How We Use Cookies', icon: Settings },
    { id: 'third-party', title: 'Third-Party Cookies', icon: Globe },
    { id: 'management', title: 'Managing Cookies', icon: ToggleLeft },
    { id: 'preferences', title: 'Your Preferences', icon: Users },
    { id: 'contact', title: 'Contact Us', icon: Mail }
  ];

  const lastUpdated = "January 15, 2025";

  const togglePreference = (type) => {
    if (type === 'essential') return; // Can't disable essential cookies
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const cookieTypes = [
    {
      name: 'Essential Cookies',
      type: 'essential',
      required: true,
      description: 'Required for basic website functionality and security',
      examples: ['Login authentication', 'Session management', 'Security tokens', 'Form submissions'],
      duration: 'Session or up to 30 days',
      color: 'bg-red-50 border-red-200 text-red-800'
    },
    {
      name: 'Functional Cookies',
      type: 'functional',
      required: false,
      description: 'Remember your preferences and improve your experience',
      examples: ['Language preferences', 'Dashboard layout', 'Notification settings', 'Theme choices'],
      duration: 'Up to 1 year',
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      name: 'Analytics Cookies',
      type: 'analytics',
      required: false,
      description: 'Help us understand how you use our platform to improve it',
      examples: ['Page views', 'Feature usage', 'Performance metrics', 'Error tracking'],
      duration: 'Up to 2 years',
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      name: 'Marketing Cookies',
      type: 'marketing',
      required: false,
      description: 'Used to deliver relevant advertisements and track campaign effectiveness',
      examples: ['Ad preferences', 'Campaign tracking', 'Social media integration', 'Retargeting'],
      duration: 'Up to 1 year',
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Cookie className="h-10 w-10 text-orange-600" />
            <h1 className="text-4xl lg:text-5xl font-heading font-bold text-secondary-900">
              Cookie Policy
            </h1>
          </div>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto mb-4">
            Learn about how we use cookies to improve your Shiftswaper experience and protect your privacy.
          </p>
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Last updated: {lastUpdated}</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                      activeSection === section.id
                        ? 'bg-primary-100 text-primary-700 border-primary-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <section.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md">
              {/* Overview Section */}
              {activeSection === 'overview' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Info className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">What Are Cookies?</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      Cookies are small text files stored on your device when you visit websites. They help websites 
                      remember your preferences, keep you logged in, and provide personalized experiences.
                    </p>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      <div className="flex items-start space-x-3">
                        <Cookie className="h-6 w-6 text-orange-600 mt-0.5" />
                        <div>
                          <h3 className="text-lg font-semibold text-orange-900 mb-3">Why Shiftswaper Uses Cookies</h3>
                          <ul className="text-orange-800 space-y-2">
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Keep you securely logged in to your account</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Remember your dashboard preferences and settings</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Analyze how our platform is used to improve features</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Provide security and prevent unauthorized access</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <Smartphone className="h-8 w-8 text-blue-600 mb-3" />
                        <h3 className="font-semibold text-blue-900 mb-2">Session Cookies</h3>
                        <p className="text-blue-800 text-sm">
                          Temporary cookies that disappear when you close your browser. 
                          Essential for keeping you logged in during your session.
                        </p>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <Lock className="h-8 w-8 text-green-600 mb-3" />
                        <h3 className="font-semibold text-green-900 mb-2">Persistent Cookies</h3>
                        <p className="text-green-800 text-sm">
                          Stored on your device for a specific period. 
                          Help remember your preferences between visits.
                        </p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-yellow-800 font-medium">Your Control:</p>
                          <p className="text-yellow-700 text-sm">
                            You can control which cookies we use through your browser settings or our cookie preferences panel below.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cookie Types Section */}
              {activeSection === 'types' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Cookie className="h-6 w-6 text-orange-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Types of Cookies We Use</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      We use different types of cookies for various purposes. Here's what each type does:
                    </p>

                    <div className="space-y-6">
                      {cookieTypes.map((cookie, index) => (
                        <div key={index} className={`border rounded-lg p-6 ${cookie.color.replace('text-', 'border-').replace('-800', '-200')}`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${cookie.color.split(' ')[0]}`}>
                                <Cookie className={`h-5 w-5 ${cookie.color.split(' ')[2]}`} />
                              </div>
                              <div>
                                <h3 className={`text-lg font-semibold ${cookie.color.split(' ')[2]}`}>
                                  {cookie.name}
                                </h3>
                                {cookie.required && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                                    Required
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <p className={`mb-4 ${cookie.color.split(' ')[2]}`}>
                            {cookie.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className={`font-medium ${cookie.color.split(' ')[2]} mb-2`}>Examples:</h4>
                              <ul className={`space-y-1 ${cookie.color.split(' ')[2]} text-sm`}>
                                {cookie.examples.map((example, i) => (
                                  <li key={i} className="flex items-center space-x-2">
                                    <div className="w-1 h-1 bg-current rounded-full"></div>
                                    <span>{example}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className={`font-medium ${cookie.color.split(' ')[2]} mb-2`}>Storage Duration:</h4>
                              <p className={`${cookie.color.split(' ')[2]} text-sm`}>
                                {cookie.duration}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Usage Section */}
              {activeSection === 'usage' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Settings className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold text-gray-900">How We Use Cookies</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      Here's exactly how cookies help us provide you with the best Shiftswaper experience:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <Shield className="h-8 w-8 text-blue-600 mb-3" />
                        <h3 className="font-semibold text-blue-900 mb-3">Security & Authentication</h3>
                        <ul className="text-blue-800 text-sm space-y-2">
                          <li>• Keep you logged in securely across sessions</li>
                          <li>• Verify your identity for sensitive actions</li>
                          <li>• Protect against unauthorized access attempts</li>
                          <li>• Remember your security preferences</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <Users className="h-8 w-8 text-green-600 mb-3" />
                        <h3 className="font-semibold text-green-900 mb-3">Personalization</h3>
                        <ul className="text-green-800 text-sm space-y-2">
                          <li>• Save your dashboard layout preferences</li>
                          <li>• Remember notification settings</li>
                          <li>• Store language and timezone settings</li>
                          <li>• Keep track of your frequently used features</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <BarChart3 className="h-8 w-8 text-purple-600 mb-3" />
                        <h3 className="font-semibold text-purple-900 mb-3">Analytics & Improvement</h3>
                        <ul className="text-purple-800 text-sm space-y-2">
                          <li>• Track which features are most used</li>
                          <li>• Identify areas for improvement</li>
                          <li>• Monitor platform performance</li>
                          <li>• Understand user behavior patterns (anonymized)</li>
                        </ul>
                      </div>

                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                        <RefreshCw className="h-8 w-8 text-orange-600 mb-3" />
                        <h3 className="font-semibold text-orange-900 mb-3">Platform Functionality</h3>
                        <ul className="text-orange-800 text-sm space-y-2">
                          <li>• Enable smooth page navigation</li>
                          <li>• Support real-time notifications</li>
                          <li>• Facilitate shift swap workflows</li>
                          <li>• Maintain form data during sessions</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Data Processing</h3>
                      <p className="text-gray-600 text-sm">
                        All cookie data is processed in accordance with our Privacy Policy. 
                        We use industry-standard security measures to protect cookie information, 
                        and we never sell cookie data to third parties.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Third-Party Section */}
              {activeSection === 'third-party' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Globe className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Third-Party Cookies</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      Some cookies are set by third-party services we use to provide you with additional functionality:
                    </p>

                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Analytics Services</h3>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <BarChart3 className="h-5 w-5 text-blue-600 mt-1" />
                            <div>
                              <p className="font-medium text-blue-800">Google Analytics</p>
                              <p className="text-blue-700 text-sm">
                                Helps us understand how users interact with our platform to improve user experience.
                              </p>
                            </div>
                          </div>
                          <div className="ml-8 text-blue-700 text-sm">
                            <p><strong>Purpose:</strong> Website analytics, performance monitoring</p>
                            <p><strong>Data:</strong> Anonymized usage statistics</p>
                            <p><strong>Control:</strong> Opt out through our cookie preferences</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-green-900 mb-4">Support Services</h3>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <Mail className="h-5 w-5 text-green-600 mt-1" />
                            <div>
                              <p className="font-medium text-green-800">Customer Support Tools</p>
                              <p className="text-green-700 text-sm">
                                Enable our support team to provide you with personalized assistance.
                              </p>
                            </div>
                          </div>
                          <div className="ml-8 text-green-700 text-sm">
                            <p><strong>Purpose:</strong> Customer support, help desk functionality</p>
                            <p><strong>Data:</strong> Support interaction history</p>
                            <p><strong>Control:</strong> Managed through functional cookie settings</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-orange-900 mb-4">Security Services</h3>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <Shield className="h-5 w-5 text-orange-600 mt-1" />
                            <div>
                              <p className="font-medium text-orange-800">Security Monitoring</p>
                              <p className="text-orange-700 text-sm">
                                Detect and prevent malicious activity and unauthorized access attempts.
                              </p>
                            </div>
                          </div>
                          <div className="ml-8 text-orange-700 text-sm">
                            <p><strong>Purpose:</strong> Fraud prevention, security monitoring</p>
                            <p><strong>Data:</strong> IP addresses, security events</p>
                            <p><strong>Control:</strong> Essential for platform security (cannot be disabled)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-yellow-800 font-medium">Third-Party Privacy:</p>
                          <p className="text-yellow-700 text-sm">
                            Third-party cookies are governed by their respective privacy policies. 
                            We only work with trusted partners who maintain high privacy standards.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Management Section */}
              {activeSection === 'management' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <ToggleLeft className="h-6 w-6 text-gray-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Managing Your Cookies</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      You have full control over cookies. Here are the different ways to manage them:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <Settings className="h-8 w-8 text-blue-600 mb-3" />
                        <h3 className="font-semibold text-blue-900 mb-3">Browser Settings</h3>
                        <p className="text-blue-800 text-sm mb-3">
                          Control cookies through your browser's privacy settings:
                        </p>
                        <ul className="text-blue-700 text-sm space-y-1">
                          <li>• Block all cookies</li>
                          <li>• Block third-party cookies only</li>
                          <li>• Delete existing cookies</li>
                          <li>• Get notifications when cookies are set</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <Users className="h-8 w-8 text-green-600 mb-3" />
                        <h3 className="font-semibold text-green-900 mb-3">Our Cookie Preferences</h3>
                        <p className="text-green-800 text-sm mb-3">
                          Use our built-in preference center (see next section):
                        </p>
                        <ul className="text-green-700 text-sm space-y-1">
                          <li>• Enable/disable non-essential cookies</li>
                          <li>• Granular control by cookie type</li>
                          <li>• Save your preferences</li>
                          <li>• Apply changes immediately</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Browser-Specific Instructions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-white rounded border">
                          <h4 className="font-medium text-gray-800 mb-2">Chrome</h4>
                          <p className="text-gray-600 text-sm">Settings → Privacy → Cookies</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded border">
                          <h4 className="font-medium text-gray-800 mb-2">Firefox</h4>
                          <p className="text-gray-600 text-sm">Options → Privacy → Cookies</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded border">
                          <h4 className="font-medium text-gray-800 mb-2">Safari</h4>
                          <p className="text-gray-600 text-sm">Preferences → Privacy → Cookies</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-red-800 font-medium">Important Note:</p>
                          <p className="text-red-700 text-sm">
                            Disabling essential cookies may prevent core features of Shiftswaper from working properly, 
                            including login, security, and basic functionality.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Section */}
              {activeSection === 'preferences' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Users className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Your Cookie Preferences</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      Customize your cookie preferences below. Changes take effect immediately and are saved to your account.
                    </p>

                    <div className="space-y-4">
                      {cookieTypes.map((cookie, index) => (
                        <div key={index} className={`border rounded-lg p-6 ${cookie.color.replace('text-', 'border-').replace('-800', '-200')}`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${cookie.color.split(' ')[0]}`}>
                                <Cookie className={`h-5 w-5 ${cookie.color.split(' ')[2]}`} />
                              </div>
                              <div>
                                <h3 className={`text-lg font-semibold ${cookie.color.split(' ')[2]}`}>
                                  {cookie.name}
                                </h3>
                                <p className={`text-sm ${cookie.color.split(' ')[2]} opacity-80`}>
                                  {cookie.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {cookie.required && (
                                <span className="text-xs font-medium text-red-600">Required</span>
                              )}
                              <button
                                onClick={() => togglePreference(cookie.type)}
                                disabled={cookie.required}
                                className={`p-1 rounded-full transition-colors duration-200 ${
                                  cookiePreferences[cookie.type]
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-300 text-gray-600'
                                } ${cookie.required ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}`}
                              >
                                {cookiePreferences[cookie.type] ? (
                                  <ToggleRight className="h-6 w-6" />
                                ) : (
                                  <ToggleLeft className="h-6 w-6" />
                                )}
                              </button>
                            </div>
                          </div>
                          
                          <div className="text-sm space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={cookie.color.split(' ')[2]}>Status:</span>
                              <span className={`font-medium ${cookiePreferences[cookie.type] ? 'text-green-600' : 'text-red-600'}`}>
                                {cookiePreferences[cookie.type] ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={cookie.color.split(' ')[2]}>Storage Duration:</span>
                              <span className={`font-medium ${cookie.color.split(' ')[2]}`}>
                                {cookie.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Preference Summary</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {cookieTypes.map((cookie, index) => (
                          <div key={index} className="text-center">
                            <div className={`text-sm font-medium mb-1 ${cookiePreferences[cookie.type] ? 'text-green-600' : 'text-red-600'}`}>
                              {cookie.name.replace(' Cookies', '')}
                            </div>
                            <div className={`text-xs ${cookiePreferences[cookie.type] ? 'text-green-600' : 'text-red-600'}`}>
                              {cookiePreferences[cookie.type] ? '✓ Enabled' : '✗ Disabled'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-center space-x-4">
                      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        Save Preferences
                      </button>
                      <button className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200">
                        Reset to Defaults
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Section */}
              {activeSection === 'contact' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Mail className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      Have questions about our cookie policy or need help managing your preferences? We're here to help.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Cookie & Privacy Questions</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-blue-600" />
                            <span className="text-blue-800">privacy@shiftswaper.com</span>
                          </div>
                          <p className="text-blue-700 text-sm">
                            Specific questions about cookies, data processing, and privacy practices.
                          </p>
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-green-900 mb-4">Technical Support</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-green-600" />
                            <span className="text-green-800">support@shiftswaper.com</span>
                          </div>
                          <p className="text-green-700 text-sm">
                            Help with cookie settings, browser issues, and platform functionality.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Policy Updates</h3>
                      <p className="text-gray-600 mb-4">
                        We may update this cookie policy from time to time to reflect changes in our practices or legal requirements. When we do:
                      </p>
                      <ul className="text-gray-600 space-y-2">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>We'll update the "Last Modified" date at the top</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Major changes will be communicated via email</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>You'll have the opportunity to review new cookie preferences</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Continued use of our platform constitutes acceptance of updates</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-orange-600 text-white rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-3">Transparency Commitment</h3>
                      <p className="mb-4">
                        We believe in complete transparency about how we use cookies and handle your data. 
                        This policy is designed to be clear and comprehensive, giving you full control over your privacy.
                      </p>
                      <div className="flex items-center space-x-2 text-orange-100">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">Updated regularly to reflect our current practices</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;