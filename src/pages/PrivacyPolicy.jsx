import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Eye,
  Users,
  Mail,
  Calendar,
  Database,
  UserCheck,
  Settings,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  MessageCircle,
  Globe,
  Clock
} from 'lucide-react';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: Eye },
    { id: 'collection', title: 'Data Collection', icon: Database },
    { id: 'usage', title: 'How We Use Data', icon: Settings },
    { id: 'sharing', title: 'Information Sharing', icon: Users },
    { id: 'security', title: 'Data Security', icon: Lock },
    { id: 'rights', title: 'Your Rights', icon: UserCheck },
    { id: 'contact', title: 'Contact Us', icon: Mail }
  ];

  const lastUpdated = "January 15, 2025";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl lg:text-5xl font-heading font-bold text-secondary-900">
              Privacy Policy
            </h1>
          </div>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto mb-4">
            We're committed to protecting your privacy. This policy explains how we handle your information.
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
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${activeSection === section.id
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
                    <Eye className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Privacy Overview</h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 mb-6">
                      At Shiftswaper, we believe your privacy is fundamental. This policy outlines how we collect,
                      use, and protect your personal information when you use our shift management platform.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Key Points:</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-blue-800">We only collect information necessary to provide our service</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-blue-800">Your data is never sold to third parties</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-blue-800">You have control over your personal information</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-blue-800">We use industry-standard security measures</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600">
                      This policy applies to all users of Shiftswaper - whether you're a company owner, supervisor,
                      or employee. If you have any questions, please don't hesitate to contact us.
                    </p>
                  </div>
                </div>
              )}

              {/* Data Collection Section */}
              {activeSection === 'collection' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Database className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Information</h3>
                      <ul className="text-gray-600 space-y-1">
                        <li>• Full name and email address</li>
                        <li>• Company name and position</li>
                        <li>• Account username and encrypted password</li>
                        <li>• Profile picture (optional)</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Shift Management Data</h3>
                      <ul className="text-gray-600 space-y-1">
                        <li>• Shift schedules and swap requests</li>
                        <li>• Day-off preferences and swaps</li>
                        <li>• Approval decisions and comments</li>
                        <li>• Communication within the platform</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Information</h3>
                      <ul className="text-gray-600 space-y-1">
                        <li>• Login times and activity logs</li>
                        <li>• Browser type and device information</li>
                        <li>• IP address for security purposes</li>
                        <li>• Platform usage statistics (anonymized)</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-yellow-800 font-medium">Note:</p>
                          <p className="text-yellow-700 text-sm">
                            We never collect sensitive personal information like social security numbers,
                            bank details, or personal health information unless specifically required and authorized.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Usage Section */}
              {activeSection === 'usage' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Settings className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      We use your information solely to provide and improve our shift management services:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <Calendar className="h-8 w-8 text-green-600 mb-3" />
                        <h3 className="font-semibold text-green-900 mb-2">Service Delivery</h3>
                        <ul className="text-green-800 text-sm space-y-1">
                          <li>• Process shift swap requests</li>
                          <li>• Send notifications and updates</li>
                          <li>• Facilitate communication between users</li>
                          <li>• Generate scheduling reports</li>
                        </ul>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <Shield className="h-8 w-8 text-blue-600 mb-3" />
                        <h3 className="font-semibold text-blue-900 mb-2">Account Security</h3>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Verify user identities</li>
                          <li>• Prevent unauthorized access</li>
                          <li>• Monitor for suspicious activity</li>
                          <li>• Maintain audit logs</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <Globe className="h-8 w-8 text-purple-600 mb-3" />
                        <h3 className="font-semibold text-purple-900 mb-2">Platform Improvement</h3>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• Analyze usage patterns (anonymized)</li>
                          <li>• Fix bugs and improve features</li>
                          <li>• Develop new functionality</li>
                          <li>• Optimize performance</li>
                        </ul>
                      </div>

                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                        <Mail className="h-8 w-8 text-orange-600 mb-3" />
                        <h3 className="font-semibold text-orange-900 mb-2">Communication</h3>
                        <ul className="text-orange-800 text-sm space-y-1">
                          <li>• Send important system updates</li>
                          <li>• Provide customer support</li>
                          <li>• Share platform announcements</li>
                          <li>• Respond to your inquiries</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sharing Section */}
              {activeSection === 'sharing' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Users className="h-6 w-6 text-orange-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Information Sharing</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">✅ What We DO Share</h3>
                      <ul className="text-green-800 space-y-2">
                        <li><strong>Within Your Company:</strong> Shift information with your supervisors and colleagues as needed for scheduling</li>
                        <li><strong>Service Providers:</strong> Limited data with trusted partners who help us operate the platform (email services, hosting)</li>
                        <li><strong>Legal Requirements:</strong> Information when required by law or to protect rights and safety</li>
                      </ul>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-red-900 mb-3">❌ What We DON'T Share</h3>
                      <ul className="text-red-800 space-y-2">
                        <li>• We never sell your personal information to anyone</li>
                        <li>• We don't share data with other companies for marketing</li>
                        <li>• We don't give third parties access to your account</li>
                        <li>• We don't share information across different companies</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800">
                        <strong>Important:</strong> All service providers we work with are required to protect your
                        information and can only use it for the specific services they provide to us.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Section */}
              {activeSection === 'security' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Lock className="h-6 w-6 text-red-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      We take data security seriously and use industry-standard measures to protect your information:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Technical Security</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">SSL/TLS encryption for all data transmission</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">Secure password hashing and storage</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">Regular security updates and patches</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">Secure cloud hosting infrastructure</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Access Controls</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">Role-based access permissions</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">Multi-factor authentication support</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">Automatic session timeouts</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">Activity monitoring and logging</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-yellow-800 font-medium">Your Role in Security:</p>
                          <p className="text-yellow-700 text-sm">
                            Keep your login credentials secure, use a strong password, and log out when using shared devices.
                            Report any suspicious activity immediately.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rights Section */}
              {activeSection === 'rights' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <UserCheck className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      You have full control over your personal information. Here are your rights:
                    </p>

                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <Eye className="h-5 w-5 text-indigo-600" />
                          <span>Access Your Data</span>
                        </h3>
                        <p className="text-gray-600">
                          You can request a copy of all personal information we have about you. This includes your
                          profile data, shift history, and communications within the platform.
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <Settings className="h-5 w-5 text-indigo-600" />
                          <span>Update Your Information</span>
                        </h3>
                        <p className="text-gray-600">
                          You can update your profile information, change your password, and modify your notification
                          preferences at any time through your account settings.
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5 text-indigo-600" />
                          <span>Delete Your Account</span>
                        </h3>
                        <p className="text-gray-600">
                          You can delete your account and personal information at any time. Note that some information
                          may be retained for legal compliance or operational purposes.
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <Mail className="h-5 w-5 text-indigo-600" />
                          <span>Control Communications</span>
                        </h3>
                        <p className="text-gray-600">
                          You can opt out of non-essential emails and choose your notification preferences.
                          System-critical notifications may still be sent for security and operational purposes.
                        </p>
                      </div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-indigo-900 mb-3">How to Exercise Your Rights</h3>
                      <p className="text-indigo-800 mb-3">
                        To exercise any of these rights, simply contact us using the information below.
                        We'll respond to your request within 30 days.
                      </p>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-indigo-600" />
                        <span className="text-indigo-800">privacy@shiftswaper.com</span>
                      </div>
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
                      Have questions about this privacy policy or how we handle your data? We're here to help.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Privacy Questions</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-blue-600" />
                            <span className="text-blue-800">privacy@shiftswaper.com</span>
                          </div>
                          <p className="text-blue-700 text-sm">
                            Dedicated email for all privacy-related inquiries and data requests.
                          </p>
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-green-900 mb-4">General Support</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <MessageCircle className="h-5 w-5 text-green-600" />
                            <span className="text-green-800">support@shiftswaper.com</span>
                          </div>
                          <p className="text-green-700 text-sm">
                            General questions about your account or our services.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Times</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">24 hours</div>
                          <div className="text-sm text-gray-600">Privacy Requests</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">4 hours</div>
                          <div className="text-sm text-gray-600">General Support</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">30 days</div>
                          <div className="text-sm text-gray-600">Data Requests</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-600 text-white rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-3">Policy Updates</h3>
                      <p className="mb-4">
                        We may update this privacy policy from time to time. When we do, we'll notify you by:
                      </p>
                      <ul className="space-y-1">
                        <li>• Sending an email to your registered address</li>
                        <li>• Posting a notice on our platform</li>
                        <li>• Updating the "Last Modified" date above</li>
                      </ul>
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

export default PrivacyPolicy;