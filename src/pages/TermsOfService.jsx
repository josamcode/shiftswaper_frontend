import React, { useState } from 'react';
import {
  FileText,
  UserCheck,
  Shield,
  Users,
  Settings,
  CreditCard,
  Copyright,
  AlertTriangle,
  Scale,
  RefreshCw,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Lock,
  Zap,
  Building2
} from 'lucide-react';

const TermsOfService = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: FileText },
    { id: 'eligibility', title: 'Eligibility', icon: UserCheck },
    { id: 'services', title: 'Our Services', icon: Settings },
    { id: 'responsibilities', title: 'Your Responsibilities', icon: Users },
    { id: 'acceptable-use', title: 'Acceptable Use', icon: Shield },
    { id: 'payment', title: 'Payment Terms', icon: CreditCard },
    { id: 'intellectual', title: 'Intellectual Property', icon: Copyright },
    { id: 'termination', title: 'Termination', icon: AlertTriangle },
    { id: 'disclaimers', title: 'Disclaimers', icon: Scale },
    { id: 'contact', title: 'Contact Us', icon: Mail }
  ];

  const lastUpdated = "January 15, 2025";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <FileText className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl lg:text-5xl font-heading font-bold text-secondary-900">
              Terms of Service
            </h1>
          </div>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto mb-4">
            These terms govern your use of Shiftswaper. Please read them carefully before using our services.
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
                    <FileText className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Terms Overview</h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 mb-6">
                      Welcome to Shiftswaper! These Terms of Service ("Terms") create a legal agreement between you and 
                      Shiftswaper for the use of our shift management platform and related services.
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">By using Shiftswaper, you agree to:</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-blue-800">Follow our community guidelines and acceptable use policies</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-blue-800">Respect other users' privacy and information</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-blue-800">Use the platform only for legitimate business purposes</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-blue-800">Comply with all applicable laws and regulations</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-yellow-800 font-medium">Important Note:</p>
                          <p className="text-yellow-700 text-sm">
                            If you don't agree with these terms, please don't use our services. 
                            By creating an account or using Shiftswaper, you're accepting these terms.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Eligibility Section */}
              {activeSection === 'eligibility' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <UserCheck className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Eligibility & Account Registration</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Who Can Use Shiftswaper</h3>
                      <ul className="text-green-800 space-y-2">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Businesses and organizations that manage shift-based employees</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Employees aged 18 or older (or with employer authorization if younger)</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Users who provide accurate and complete registration information</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Organizations operating legally in their jurisdiction</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Requirements</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-800">Company Accounts</h4>
                          <ul className="text-gray-600 text-sm space-y-1">
                            <li>• Valid business email address</li>
                            <li>• Accurate company information</li>
                            <li>• Authorization to act on behalf of the business</li>
                            <li>• Compliance with employment laws</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-800">Employee Accounts</h4>
                          <ul className="text-gray-600 text-sm space-y-1">
                            <li>• Valid email address</li>
                            <li>• Employment with a registered company</li>
                            <li>• Approval from your employer</li>
                            <li>• Accurate personal information</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-red-800 font-medium">Account Security:</p>
                          <p className="text-red-700 text-sm">
                            You're responsible for maintaining the security of your account credentials. 
                            Don't share your login information with others.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Services Section */}
              {activeSection === 'services' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Settings className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Our Services</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      Shiftswaper provides a comprehensive shift management platform with the following features:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <Zap className="h-8 w-8 text-blue-600 mb-3" />
                        <h3 className="font-semibold text-blue-900 mb-2">Shift Swapping</h3>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Create and manage shift swap requests</li>
                          <li>• Receive and make counter offers</li>
                          <li>• Real-time notifications and updates</li>
                          <li>• Supervisor approval workflow</li>
                        </ul>
                      </div>

                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                        <Users className="h-8 w-8 text-orange-600 mb-3" />
                        <h3 className="font-semibold text-orange-900 mb-2">Day-Off Management</h3>
                        <ul className="text-orange-800 text-sm space-y-1">
                          <li>• Request day-off swaps with colleagues</li>
                          <li>• Intelligent matching system</li>
                          <li>• Flexible scheduling options</li>
                          <li>• Approval tracking and management</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <Building2 className="h-8 w-8 text-green-600 mb-3" />
                        <h3 className="font-semibold text-green-900 mb-2">Company Management</h3>
                        <ul className="text-green-800 text-sm space-y-1">
                          <li>• Employee registration approval</li>
                          <li>• Supervisor assignment and management</li>
                          <li>• Company-wide visibility and control</li>
                          <li>• Employee ID management</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <Shield className="h-8 w-8 text-purple-600 mb-3" />
                        <h3 className="font-semibold text-purple-900 mb-2">Security & Privacy</h3>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• Secure data encryption</li>
                          <li>• Role-based access controls</li>
                          <li>• Audit trails and logging</li>
                          <li>• Privacy protection measures</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Service Availability</h3>
                      <p className="text-gray-600 text-sm">
                        We strive to maintain 99.9% uptime, but occasional maintenance and updates may temporarily 
                        affect service availability. We'll notify users in advance of any planned downtime when possible.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Responsibilities Section */}
              {activeSection === 'responsibilities' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Users className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Your Responsibilities</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-indigo-900 mb-3">Account Management</h3>
                        <ul className="text-indigo-800 text-sm space-y-2">
                          <li>• Keep your account information accurate and up-to-date</li>
                          <li>• Protect your login credentials and report unauthorized access</li>
                          <li>• Only create accounts you're authorized to create</li>
                          <li>• Notify us immediately of any security breaches</li>
                        </ul>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">Platform Usage</h3>
                        <ul className="text-blue-800 text-sm space-y-2">
                          <li>• Use the platform only for legitimate business purposes</li>
                          <li>• Provide accurate information in all requests and communications</li>
                          <li>• Respect other users' time and commitments</li>
                          <li>• Follow your company's internal policies and procedures</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-green-900 mb-3">Data & Privacy</h3>
                        <ul className="text-green-800 text-sm space-y-2">
                          <li>• Respect the privacy of other users' information</li>
                          <li>• Don't access or attempt to access unauthorized data</li>
                          <li>• Report any privacy or security concerns promptly</li>
                          <li>• Use personal data only as permitted by your role</li>
                        </ul>
                      </div>

                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-orange-900 mb-3">Legal Compliance</h3>
                        <ul className="text-orange-800 text-sm space-y-2">
                          <li>• Comply with all applicable employment laws</li>
                          <li>• Follow workplace safety and health regulations</li>
                          <li>• Respect intellectual property rights</li>
                          <li>• Don't engage in discriminatory or harassing behavior</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-yellow-800 font-medium">Company-Specific Policies:</p>
                          <p className="text-yellow-700 text-sm">
                            Your use of Shiftswaper must also comply with your employer's policies, procedures, 
                            and any applicable collective bargaining agreements.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Acceptable Use Section */}
              {activeSection === 'acceptable-use' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Shield className="h-6 w-6 text-red-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Acceptable Use Policy</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">✅ What's Allowed</h3>
                      <ul className="text-green-800 space-y-2">
                        <li>• Creating legitimate shift swap and day-off requests</li>
                        <li>• Communicating professionally with colleagues and supervisors</li>
                        <li>• Using the platform to improve work-life balance</li>
                        <li>• Providing constructive feedback to improve the service</li>
                        <li>• Accessing only the information you're authorized to see</li>
                      </ul>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-red-900 mb-3">❌ What's Prohibited</h3>
                      <ul className="text-red-800 space-y-2">
                        <li>• Creating fake or fraudulent accounts or requests</li>
                        <li>• Harassing, bullying, or discriminating against other users</li>
                        <li>• Attempting to access unauthorized areas or data</li>
                        <li>• Sharing login credentials or allowing unauthorized access</li>
                        <li>• Using the platform for non-work related activities</li>
                        <li>• Disrupting or interfering with the platform's operation</li>
                        <li>• Uploading malicious software or harmful content</li>
                        <li>• Violating any applicable laws or regulations</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Reporting Violations</h3>
                      <p className="text-blue-800 mb-3">
                        If you encounter behavior that violates these guidelines, please report it to us immediately:
                      </p>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-800">support@shiftswaper.com</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Enforcement</h3>
                      <p className="text-gray-600 text-sm">
                        Violations of this policy may result in account suspension or termination, 
                        depending on the severity and frequency of the violation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Section */}
              {activeSection === 'payment' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <CreditCard className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Payment Terms</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Subscription Plans</h3>
                      <ul className="text-green-800 space-y-2">
                        <li>• Monthly and annual subscription options available</li>
                        <li>• 30-day free trial for new company accounts</li>
                        <li>• Pricing based on number of active employees</li>
                        <li>• Enterprise plans with custom features available</li>
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="font-semibold text-blue-900 mb-3">Payment Processing</h3>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Automatic billing on subscription date</li>
                          <li>• Secure payment processing</li>
                          <li>• Major credit cards accepted</li>
                          <li>• Invoice billing for enterprise accounts</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <h3 className="font-semibold text-purple-900 mb-3">Refund Policy</h3>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• 30-day money-back guarantee</li>
                          <li>• Prorated refunds for cancellations</li>
                          <li>• No refunds for partial months</li>
                          <li>• Contact support for refund requests</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-yellow-800 font-medium">Payment Failure:</p>
                          <p className="text-yellow-700 text-sm">
                            If payment fails, your account may be suspended until payment is resolved. 
                            We'll notify you before any suspension occurs.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Intellectual Property Section */}
              {activeSection === 'intellectual' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Copyright className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Intellectual Property</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Our Rights</h3>
                      <p className="text-blue-800 mb-3">
                        Shiftswaper owns all rights to our platform, including:
                      </p>
                      <ul className="text-blue-800 space-y-1">
                        <li>• Software code, algorithms, and technical infrastructure</li>
                        <li>• Trademarks, logos, and brand materials</li>
                        <li>• User interface design and user experience</li>
                        <li>• Documentation, help materials, and content</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Your Rights</h3>
                      <p className="text-green-800 mb-3">
                        You retain ownership of your business data and information, including:
                      </p>
                      <ul className="text-green-800 space-y-1">
                        <li>• Employee schedules and shift information</li>
                        <li>• Company data and organizational information</li>
                        <li>• Communications and messages within the platform</li>
                        <li>• Any content you upload or create</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">License Grant</h3>
                      <p className="text-gray-600">
                        We grant you a limited, non-exclusive, non-transferable license to use Shiftswaper 
                        for your business purposes while your subscription is active. This license automatically 
                        terminates when your subscription ends.
                      </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <Copyright className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-yellow-800 font-medium">Restrictions:</p>
                          <p className="text-yellow-700 text-sm">
                            You may not copy, modify, distribute, or reverse engineer our software or attempt 
                            to extract our source code or proprietary algorithms.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Termination Section */}
              {activeSection === 'termination' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Account Termination</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">Your Right to Cancel</h3>
                        <ul className="text-blue-800 text-sm space-y-2">
                          <li>• Cancel your subscription at any time</li>
                          <li>• Access continues until the end of billing period</li>
                          <li>• No cancellation fees or penalties</li>
                          <li>• Easy cancellation through account settings</li>
                        </ul>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-red-900 mb-3">Our Right to Terminate</h3>
                        <ul className="text-red-800 text-sm space-y-2">
                          <li>• Violation of terms of service</li>
                          <li>• Abusive or inappropriate behavior</li>
                          <li>• Non-payment of subscription fees</li>
                          <li>• Illegal or fraudulent activity</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">What Happens After Termination</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Immediate loss of access to the platform</li>
                        <li>• Data retention for 30 days for potential recovery</li>
                        <li>• Automatic deletion of data after retention period</li>
                        <li>• Option to export your data before cancellation</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-green-800 font-medium">Data Export:</p>
                          <p className="text-green-700 text-sm">
                            You can export your data at any time while your account is active. 
                            Contact support for assistance with data exports.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Disclaimers Section */}
              {activeSection === 'disclaimers' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Scale className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Disclaimers & Limitations</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-yellow-900 mb-3">Service Availability</h3>
                      <p className="text-yellow-800">
                        While we strive for 99.9% uptime, we cannot guarantee uninterrupted service. 
                        Maintenance, updates, or technical issues may temporarily affect availability.
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Employment Relationships</h3>
                      <p className="text-blue-800">
                        Shiftswaper is a tool to facilitate shift management. We are not responsible for 
                        employment decisions, workplace disputes, or compliance with labor laws. 
                        These remain between employers and employees.
                      </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-red-900 mb-3">Limitation of Liability</h3>
                      <p className="text-red-800">
                        Our liability is limited to the amount you paid for the service in the past 12 months. 
                        We are not liable for indirect, incidental, or consequential damages.
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Data Accuracy</h3>
                      <p className="text-green-800">
                        Users are responsible for the accuracy of data entered into the system. 
                        We provide tools but cannot guarantee the accuracy of user-generated content.
                      </p>
                    </div>

                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                      <p className="text-gray-700 text-sm font-medium">
                        These terms are governed by the laws of [Jurisdiction]. Any disputes will be resolved 
                        through binding arbitration or in the courts of [Jurisdiction].
                      </p>
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
                      Questions about these terms? Need help with your account? We're here to assist you.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Legal & Terms Questions</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-blue-600" />
                            <span className="text-blue-800">legal@shiftswaper.com</span>
                          </div>
                          <p className="text-blue-700 text-sm">
                            For questions about these terms, privacy policy, or legal matters.
                          </p>
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-green-900 mb-4">General Support</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-green-600" />
                            <span className="text-green-800">support@shiftswaper.com</span>
                          </div>
                          <p className="text-green-700 text-sm">
                            For account issues, technical support, and general questions.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Updates to Terms</h3>
                      <p className="text-gray-600 mb-3">
                        We may update these terms from time to time. When we do, we'll:
                      </p>
                      <ul className="text-gray-600 space-y-1">
                        <li>• Email all registered users about significant changes</li>
                        <li>• Update the "Last Modified" date at the top of this page</li>
                        <li>• Post a notice on our platform</li>
                        <li>• Give you at least 30 days notice of material changes</li>
                      </ul>
                    </div>

                    <div className="bg-blue-600 text-white rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-3">Thank You</h3>
                      <p>
                        Thank you for choosing Shiftswaper. We're committed to providing you with 
                        the best shift management experience while maintaining clear, fair terms of service.
                      </p>
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

export default TermsOfService;