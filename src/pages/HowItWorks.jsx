import React, { useState } from 'react';
import {
  Building2,
  User,
  Shield,
  Users,
  CheckCircle,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Star,
  Mail,
  MessageCircle,
  Eye,
  Bell,
  FileText,
  Settings,
  UserPlus,
  Handshake,
  ArrowLeftRight,
  Plus,
  Search,
  Filter
} from 'lucide-react';

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState(null);

  const userTypes = [
    {
      id: 'company',
      title: 'Company Owner/Manager',
      icon: Building2,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      iconColor: 'text-blue-600',
      description: 'Register your business, manage employees, and oversee all shift swap operations.'
    },
    {
      id: 'supervisor',
      title: 'Supervisor',
      icon: Shield,
      color: 'bg-green-50 border-green-200 text-green-800',
      iconColor: 'text-green-600',
      description: 'Approve or reject shift swap requests and manage team schedules.'
    },
    {
      id: 'employee',
      title: 'Employee',
      icon: User,
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      iconColor: 'text-purple-600',
      description: 'Create swap requests, browse available shifts, and manage your schedule.'
    }
  ];

  const companySteps = [
    {
      step: 1,
      title: 'Register Your Company',
      icon: Building2,
      description: 'Create your company account with business details',
      details: [
        'Go to the registration page and select "Company"',
        'Fill in your company name, description, email, and password',
        'Verify your email with the OTP sent to your inbox',
        'Your company account is now active and ready to use'
      ]
    },
    {
      step: 2,
      title: 'Manage Employee Requests',
      icon: Users,
      description: 'Review and approve employee registration requests',
      details: [
        'Navigate to your Company Dashboard',
        'View pending employee requests in the "Employee Requests" section',
        'Review each employee\'s information and credentials',
        'Approve suitable candidates and assign supervisors',
        'Reject requests that don\'t meet your criteria with reasons'
      ]
    },
    {
      step: 3,
      title: 'Monitor Operations',
      icon: FileText,
      description: 'Track all shift swap activities and maintain oversight',
      details: [
        'Use the dashboard to view all active shift swaps',
        'Monitor employee activity and swap patterns',
        'Review approved and rejected requests',
        'Generate reports for business insights',
        'Manage company settings and preferences'
      ]
    }
  ];

  const employeeSteps = [
    {
      step: 1,
      title: 'Request to Join Company',
      icon: UserPlus,
      description: 'Submit your registration request to your company',
      details: [
        'Select "Employee" from the registration options',
        'Choose your company from the dropdown list',
        'Fill in your personal details and position',
        'Verify your email with the OTP code',
        'Wait for company approval (you\'ll receive email notification)'
      ]
    },
    {
      step: 2,
      title: 'Create Swap Requests',
      icon: Plus,
      description: 'Post your shifts or day-offs for swapping',
      details: [
        'Login to your Employee Dashboard',
        'Click "New Request" to create a swap request',
        'Choose between "Shift Swap" or "Day Off Swap"',
        'Fill in shift details, dates, and reason for swap',
        'Submit your request and wait for colleagues to respond'
      ]
    },
    {
      step: 3,
      title: 'Browse Available Swaps',
      icon: Search,
      description: 'Find shifts or day-offs that match your needs',
      details: [
        'Visit the "Shift Swaps" or "Day Off Swaps" pages',
        'Use search and filters to find suitable swaps',
        'View detailed information about each request',
        'Make counter offers or accept direct swaps',
        'Wait for supervisor approval once matched'
      ]
    },
    {
      step: 4,
      title: 'Manage Your Requests',
      icon: Settings,
      description: 'Track and manage your swap activities',
      details: [
        'View all your requests in the dashboard',
        'Edit or delete requests before they\'re accepted',
        'Accept or reject offers from other employees',
        'Monitor approval status from supervisors',
        'Receive email notifications for all updates'
      ]
    }
  ];

  const supervisorSteps = [
    {
      step: 1,
      title: 'Access Supervisor Dashboard',
      icon: Shield,
      description: 'Login with your approved supervisor account',
      details: [
        'Use your employee credentials to login',
        'Access the Supervisor Dashboard automatically',
        'View all requests requiring your approval',
        'See pending, approved, and rejected requests',
        'Monitor team swap activities and patterns'
      ]
    },
    {
      step: 2,
      title: 'Review Swap Requests',
      icon: Eye,
      description: 'Evaluate shift and day-off swap requests',
      details: [
        'Review request details including dates and reasons',
        'Check employee information and shift compatibility',
        'Verify that swaps don\'t conflict with business needs',
        'Consider workload distribution and fairness',
        'Make informed approval or rejection decisions'
      ]
    },
    {
      step: 3,
      title: 'Approve or Reject',
      icon: CheckCircle,
      description: 'Make final decisions on swap requests',
      details: [
        'Click approve for suitable swap requests',
        'Add optional comments for approved requests',
        'Reject requests that don\'t meet criteria',
        'Provide clear rejection reasons to help employees',
        'Automatic email notifications sent to all parties'
      ]
    }
  ];

  const features = [
    {
      title: 'Shift Swap System',
      icon: Handshake,
      description: 'Advanced shift swapping with counter-offer negotiations',
      capabilities: [
        'Create shift swap requests with detailed timing',
        'Receive and make counter offers with different times',
        'Accept specific offers from multiple proposals',
        'Same-day requirement with flexible timing',
        'Automatic email notifications throughout process'
      ]
    },
    {
      title: 'Day Off Swap System',
      icon: ArrowLeftRight,
      description: 'Seamless day-off exchanges between employees',
      capabilities: [
        'Request to swap your day off for another date',
        'Match with employees who have your desired day off',
        'Include optional shift details for the day',
        'Multiple match proposals with selection choice',
        'Supervisor approval for final confirmation'
      ]
    },
    {
      title: 'Smart Notifications',
      icon: Bell,
      description: 'Comprehensive email notification system',
      capabilities: [
        'New offer notifications for requesters',
        'Offer accepted confirmations for proposers',
        'Supervisor notifications for pending approvals',
        'Final approval/rejection notifications',
        'Professional HTML email templates'
      ]
    },
    {
      title: 'Advanced Filtering',
      icon: Filter,
      description: 'Powerful search and filter capabilities',
      capabilities: [
        'Search by employee name or swap reason',
        'Filter by status (pending, approved, rejected)',
        'Sort by urgency, date, or relevance',
        'Separate views for different swap types',
        'Real-time updates and refresh options'
      ]
    }
  ];

  const faqs = [
    {
      question: 'How do I get started as a company?',
      answer: 'Register your company account, verify your email, then approve employee requests who want to join your organization. You can then monitor all swap activities from your dashboard.'
    },
    {
      question: 'Can employees swap shifts with anyone?',
      answer: 'Employees can only swap with colleagues from the same company. All swaps require supervisor approval before being finalized.'
    },
    {
      question: 'What\'s the difference between shift swaps and day-off swaps?',
      answer: 'Shift swaps exchange specific work shifts on the same day with potentially different times. Day-off swaps exchange entire days off between employees.'
    },
    {
      question: 'How does the approval process work?',
      answer: 'Once employees agree on a swap, it goes to their supervisors for approval. Either supervisor involved can approve or reject the request with optional comments.'
    },
    {
      question: 'Can I edit my swap request after posting?',
      answer: 'Yes, you can edit or delete your requests before anyone accepts them. Once accepted or if offers are received, editing may be restricted.'
    },
    {
      question: 'How are notifications handled?',
      answer: 'The system sends email notifications for all major events: new offers, acceptances, approvals, rejections, and other status changes.'
    },
    {
      question: 'What happens if my request is rejected?',
      answer: 'You\'ll receive an email with the rejection reason. You can create a new request or contact your supervisor for clarification.'
    },
    {
      question: 'Is there a limit to how many requests I can make?',
      answer: 'There\'s no built-in limit, but you can only have one active request per shift or day-off. Previous requests must be resolved first.'
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const renderUserTypeGuide = (userType) => {
    let steps = [];
    if (userType === 'company') steps = companySteps;
    else if (userType === 'employee') steps = employeeSteps;
    else if (userType === 'supervisor') steps = supervisorSteps;

    return (
      <div className="space-y-8">
        {steps.map((step, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                <step.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                    Step {step.step}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{step.description}</p>
                <div className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3">
              <BookOpen className="h-10 w-10" />
              <h1 className="text-4xl font-bold">How to Use Shiftswaper</h1>
            </div>
            {/* <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Complete guide to mastering shift and day-off swaps for companies, supervisors, and employees
            </p> */}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex flex-col items-center px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-0 inline-block m-auto rounded-t-lg bg-white p-2">
          <nav className="flex flex-wrap justify-center space-x-1 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'company', label: 'For Companies', icon: Building2 },
              { id: 'employee', label: 'For Employees', icon: User },
              { id: 'supervisor', label: 'For Supervisors', icon: Shield },
              { id: 'features', label: 'Features', icon: Star },
              { id: 'faq', label: 'FAQ', icon: HelpCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className='w-full'>
          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-lg">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="p-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Shiftswaper</h2>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Shiftswaper is a comprehensive platform that enables companies to manage employee schedules
                    while allowing flexible shift and day-off exchanges between team members.
                  </p>
                </div>

                {/* User Types */}
                <div className="mb-12">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Choose Your Role</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {userTypes.map((userType) => (
                      <div
                        key={userType.id}
                        className={`border-2 rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-200 ${userType.color}`}
                      >
                        <div className="flex justify-center mb-4">
                          <div className="bg-white rounded-full p-3">
                            <userType.icon className={`h-8 w-8 ${userType.iconColor}`} />
                          </div>
                        </div>
                        <h4 className="text-xl font-semibold mb-3">{userType.title}</h4>
                        <p className="text-sm">{userType.description}</p>
                        <button
                          onClick={() => setActiveTab(userType.id)}
                          className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          Learn More <ArrowRight className="ml-1 h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Start */}
                <div className="bg-blue-50 rounded-lg p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">Quick Start Guide</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">1</div>
                      <h4 className="font-semibold mb-2">Register</h4>
                      <p className="text-sm text-gray-600">Create your account based on your role</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">2</div>
                      <h4 className="font-semibold mb-2">Verify</h4>
                      <p className="text-sm text-gray-600">Complete email verification process</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">3</div>
                      <h4 className="font-semibold mb-2">Setup</h4>
                      <p className="text-sm text-gray-600">Configure your profile and preferences</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl font-bold">4</div>
                      <h4 className="font-semibold mb-2">Start Swapping</h4>
                      <p className="text-sm text-gray-600">Begin creating and managing swaps</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Company Tab */}
            {activeTab === 'company' && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Company Owner Guide</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Learn how to set up your company, manage employees, and oversee shift swap operations.
                  </p>
                </div>
                {renderUserTypeGuide('company')}
              </div>
            )}

            {/* Employee Tab */}
            {activeTab === 'employee' && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <User className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Employee Guide</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Discover how to join your company, create swap requests, and manage your schedule effectively.
                  </p>
                </div>
                {renderUserTypeGuide('employee')}
              </div>
            )}

            {/* Supervisor Tab */}
            {activeTab === 'supervisor' && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <Shield className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Supervisor Guide</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Master the approval process and learn how to effectively manage team swap requests.
                  </p>
                </div>
                {renderUserTypeGuide('supervisor')}
              </div>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <Star className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Explore the comprehensive features that make Shiftswaper the ideal shift management solution.
                  </p>
                </div>

                <div className="space-y-8">
                  {features.map((feature, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-white rounded-full p-3 shadow-sm">
                          <feature.icon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                          <p className="text-gray-600 mb-4">{feature.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {feature.capabilities.map((capability, capIndex) => (
                              <div key={capIndex} className="flex items-start space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{capability}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <HelpCircle className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Find answers to common questions about using Shiftswaper effectively.
                  </p>
                </div>

                <div className="space-y-4 max-w-4xl mx-auto">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleSection(`faq-${index}`)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        <ArrowRight
                          className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${expandedSection === `faq-${index}` ? 'rotate-90' : ''
                            }`}
                        />
                      </button>
                      {expandedSection === `faq-${index}` && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Support Section */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Need Additional Help?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Our support team is here to help you get the most out of Shiftswaper.
                Don't hesitate to reach out if you have questions or need assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="mailto:support@shiftswaper.com"
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Email Support
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;