import React, { useState } from 'react';
import {
  Zap,
  ArrowLeftRight,
  Building2,
  Bell,
  Search,
  Shield,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  Eye,
  RefreshCw,
  Filter,
  BarChart3,
  Lock,
  Smartphone,
  Mail,
  Settings,
  UserCheck,
  Hash,
  Upload,
  Download,
  MessageCircle,
  Star,
  Globe,
  Handshake,
  CalendarDays,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  TrendingUp,
  Database,
  FileText,
  Target,
  XCircle
} from 'lucide-react';

const Features = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedFeature, setSelectedFeature] = useState(null);

  const categories = [
    { id: 'all', name: 'All Features', icon: Star },
    { id: 'swapping', name: 'Shift Management', icon: Zap },
    { id: 'management', name: 'Company Tools', icon: Building2 },
    { id: 'communication', name: 'Communication', icon: Bell },
    { id: 'security', name: 'Security & Privacy', icon: Shield }
  ];

  const mainFeatures = [
    {
      id: 'shift-swapping',
      title: 'Advanced Shift Swapping',
      category: 'swapping',
      description: 'Intelligent shift exchange system with counter-offers and real-time negotiations',
      icon: Zap,
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
      features: [
        'Create detailed shift swap requests with timing flexibility',
        'Receive and make counter offers with different shift times',
        'Accept specific offers from multiple proposals',
        'Same-day requirement validation with flexible timing options',
        'Automatic conflict detection and resolution suggestions'
      ],
      benefits: [
        'Reduce scheduling conflicts by 80%',
        'Save 15+ hours per week on manual coordination',
        'Increase employee satisfaction with flexible options',
        'Maintain operational coverage with smart matching'
      ]
    },
    {
      id: 'dayoff-swapping',
      title: 'Day-Off Management',
      category: 'swapping',
      description: 'Seamless day-off exchanges with intelligent matching and supervisor oversight',
      icon: ArrowLeftRight,
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600',
      features: [
        'Request day-off swaps with automatic colleague matching',
        'Include optional shift details for comprehensive planning',
        'Multiple match proposals with easy selection interface',
        'Calendar integration for visual schedule planning',
        'Bulk day-off management for special events or holidays'
      ],
      benefits: [
        'Improve work-life balance for all employees',
        'Reduce absenteeism through flexible planning',
        'Maintain fair distribution of preferred days off',
        'Streamline holiday and vacation scheduling'
      ]
    },
    {
      id: 'company-management',
      title: 'Company Management Suite',
      category: 'management',
      description: 'Comprehensive tools for company owners to manage employees and operations',
      icon: Building2,
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      features: [
        'Employee registration approval with detailed review process',
        'Supervisor assignment and hierarchical management',
        'Company-wide visibility and control over all operations',
        'Employee ID management with bulk upload capabilities',
        'Custom company policies and approval workflows'
      ],
      benefits: [
        'Maintain complete control over workforce management',
        'Ensure only authorized employees access the system',
        'Streamline onboarding with automated workflows',
        'Scale efficiently as your business grows'
      ]
    },
    {
      id: 'real-time-notifications',
      title: 'Smart Notification System',
      category: 'communication',
      description: 'Comprehensive email and in-app notifications keep everyone informed',
      icon: Bell,
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      features: [
        'Instant email notifications for all swap activities',
        'Customizable notification preferences by user type',
        'Professional HTML email templates with branding',
        'In-app notification center with action buttons',
        'Digest emails for managers with daily/weekly summaries'
      ],
      benefits: [
        'Never miss important swap requests or approvals',
        'Reduce response times with instant alerts',
        'Maintain professional communication standards',
        'Keep all stakeholders informed automatically'
      ]
    },
    {
      id: 'advanced-filtering',
      title: 'Advanced Search & Filtering',
      category: 'swapping',
      description: 'Powerful search capabilities to find exactly what you need, when you need it',
      icon: Search,
      color: 'bg-indigo-50 border-indigo-200',
      iconColor: 'text-indigo-600',
      features: [
        'Multi-criteria search across all requests and employees',
        'Smart filters by date range, status, position, and urgency',
        'Saved search preferences for frequently used filters',
        'Real-time search results with instant updates',
        'Export filtered results for reporting and analysis'
      ],
      benefits: [
        'Find perfect swap matches in seconds',
        'Reduce time spent browsing through requests',
        'Focus on most urgent or relevant swaps first',
        'Generate custom reports with filtered data'
      ]
    },
    {
      id: 'approval-system',
      title: 'Multi-Level Approval System',
      category: 'management',
      description: 'Flexible approval workflows with supervisor oversight and company control',
      icon: UserCheck,
      color: 'bg-cyan-50 border-cyan-200',
      iconColor: 'text-cyan-600',
      features: [
        'Hierarchical approval process with supervisor assignments',
        'Customizable approval rules based on company policies',
        'Bulk approval capabilities for managers',
        'Detailed approval history and audit trails',
        'Escalation procedures for complex requests'
      ],
      benefits: [
        'Maintain operational control while empowering employees',
        'Ensure swaps comply with business requirements',
        'Create accountability with clear approval chains',
        'Reduce management overhead with smart defaults'
      ]
    },
    {
      id: 'security-privacy',
      title: 'Enterprise Security & Privacy',
      category: 'security',
      description: 'Bank-level security with comprehensive privacy controls and compliance',
      icon: Shield,
      color: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600',
      features: [
        'SSL/TLS encryption for all data transmission',
        'Role-based access controls with granular permissions',
        'Multi-factor authentication support',
        'Regular security audits and compliance monitoring',
        'GDPR and privacy law compliance built-in'
      ],
      benefits: [
        '99.9% uptime with enterprise-grade infrastructure',
        'Protect sensitive employee and company data',
        'Meet regulatory requirements automatically',
        'Peace of mind with industry-leading security'
      ]
    },
    {
      id: 'analytics-reporting',
      title: 'Analytics & Reporting',
      category: 'management',
      description: 'Comprehensive insights into your workforce scheduling patterns and trends',
      icon: BarChart3,
      color: 'bg-teal-50 border-teal-200',
      iconColor: 'text-teal-600',
      features: [
        'Real-time dashboard with key performance metrics',
        'Detailed reports on swap patterns and employee activity',
        'Trend analysis for better workforce planning',
        'Custom report generation with export capabilities',
        'Predictive analytics for scheduling optimization'
      ],
      benefits: [
        'Make data-driven scheduling decisions',
        'Identify and address potential staffing issues early',
        'Optimize employee satisfaction and productivity',
        'Demonstrate ROI and cost savings to stakeholders'
      ]
    },
    {
      id: 'mobile-responsive',
      title: 'Mobile-First Design',
      category: 'communication',
      description: 'Fully responsive platform that works perfectly on all devices',
      icon: Smartphone,
      color: 'bg-pink-50 border-pink-200',
      iconColor: 'text-pink-600',
      features: [
        'Native mobile experience with touch-optimized interface',
        'Offline capabilities for viewing schedules and requests',
        'Push notifications on mobile devices',
        'Quick actions for approvals and responses on mobile',
        'Consistent experience across desktop, tablet, and phone'
      ],
      benefits: [
        'Access schedules and make swaps from anywhere',
        'Faster response times with mobile notifications',
        'Improved user adoption across all age groups',
        'No need for separate mobile apps or downloads'
      ]
    }
  ];

  const quickFeatures = [
    { name: 'Real-time Updates', icon: RefreshCw, description: 'Live dashboard updates' },
    { name: 'Email Integration', icon: Mail, description: 'Professional notifications' },
    { name: 'Bulk Operations', icon: Database, description: 'Mass import/export' },
    { name: 'Audit Trails', icon: FileText, description: 'Complete activity logs' },
    { name: 'Custom Branding', icon: Settings, description: 'White-label options' },
    { name: 'API Access', icon: Globe, description: 'Integration capabilities' },
    { name: 'Multi-language', icon: MessageCircle, description: 'Global workforce support' },
    { name: 'Backup & Recovery', icon: Shield, description: 'Data protection' }
  ];

  const filteredFeatures = activeCategory === 'all'
    ? mainFeatures
    : mainFeatures.filter(feature => feature.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Star className="h-12 w-12 text-blue-600" />
            <h1 className="text-5xl lg:text-6xl font-heading font-bold text-secondary-900">
              Platform Features
            </h1>
          </div>
          <p className="text-xl lg:text-2xl text-secondary-600 max-w-4xl mx-auto mb-8">
            Discover the comprehensive tools and capabilities that make Shiftswaper
            the ultimate solution for modern workforce scheduling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center group">
              Try All Features Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <button className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200">
              Schedule Demo
            </button>
          </div>
        </div>
      </header>

      {/* Feature Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
              Explore by Category
            </h2>
            <p className="text-xl text-secondary-600">
              Browse features by functionality to find exactly what you need
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${activeCategory === category.id
                  ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }`}
              >
                <category.icon className="h-5 w-5 mr-2" />
                {category.name}
              </button>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFeatures.map((feature) => (
              <div
                key={feature.id}
                className={`${feature.color} border rounded-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer group`}
                onClick={() => setSelectedFeature(feature)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                  </div>
                  <ArrowRight className={`h-5 w-5 ${feature.iconColor} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                </div>

                <h3 className={`text-xl font-heading font-semibold mb-3 ${feature.iconColor.replace('text-', 'text-').replace('-600', '-900')}`}>
                  {feature.title}
                </h3>

                <p className={`text-sm mb-4 ${feature.iconColor.replace('text-', 'text-').replace('-600', '-700')}`}>
                  {feature.description}
                </p>

                <div className="space-y-2">
                  {feature.features.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className={`h-4 w-4 ${feature.iconColor} mt-0.5 flex-shrink-0`} />
                      <span className={`text-xs ${feature.iconColor.replace('text-', 'text-').replace('-600', '-700')}`}>
                        {item}
                      </span>
                    </div>
                  ))}
                  {feature.features.length > 3 && (
                    <div className={`text-xs ${feature.iconColor} font-medium`}>
                      +{feature.features.length - 3} more features
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Features */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
              Additional Capabilities
            </h2>
            <p className="text-xl text-secondary-600">
              More features that make your workflow smoother and more efficient
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {quickFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 text-center hover:shadow-lg transition-shadow duration-200 group"
              >
                <div className="bg-primary-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-100 transition-colors duration-200">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900 mb-1">{feature.name}</h3>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
              Why Choose Shiftswaper?
            </h2>
            <p className="text-xl text-secondary-600">
              See how we compare to traditional scheduling methods
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {/* Traditional Method */}
              <div className="p-8 text-center">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Traditional Methods</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Manual phone calls and emails</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Paper-based tracking systems</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>No central coordination</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Time-consuming approvals</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Limited visibility and reporting</span>
                  </li>
                </ul>
              </div>

              {/* Basic Software */}
              <div className="p-8 text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Scheduling Software</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Digital schedule management</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Limited swap functionality</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>No automated approvals</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Poor mobile experience</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span>Basic reporting capabilities</span>
                  </li>
                </ul>
              </div>

              {/* Shiftswaper */}
              <div className="p-8 text-center bg-primary-50">
                <div className="bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary-900 mb-4">Shiftswaper</h3>
                <ul className="space-y-3 text-sm text-primary-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Intelligent swap matching</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Multi-level approval workflows</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Real-time notifications</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Mobile-first responsive design</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Advanced analytics & reporting</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration & API */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
              Integration & Extensibility
            </h2>
            <p className="text-xl text-secondary-600">
              Connect Shiftswaper with your existing systems and workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">REST API</h3>
              <p className="text-gray-600 text-sm mb-3">
                Comprehensive API for custom integrations with your existing HR and payroll systems.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Full CRUD operations for all data</li>
                <li>• Webhook support for real-time updates</li>
                <li>• Rate limiting and authentication</li>
                <li>• Comprehensive documentation</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Import/Export</h3>
              <p className="text-gray-600 text-sm mb-3">
                Seamlessly migrate from existing systems or export data for analysis.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Excel/CSV bulk import capabilities</li>
                <li>• Automated data validation</li>
                <li>• Custom export formats</li>
                <li>• Scheduled backup exports</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Custom Workflows</h3>
              <p className="text-gray-600 text-sm mb-3">
                Configure approval processes and business rules to match your organization.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Flexible approval hierarchies</li>
                <li>• Custom notification templates</li>
                <li>• Business rule configuration</li>
                <li>• White-label branding options</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-6">
            Ready to Experience All Features?
          </h2>
          <p className="text-xl text-primary-100 mb-8 leading-relaxed">
            Start your free trial today and discover how Shiftswaper can transform your
            workforce scheduling with these powerful features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center group">
              Start 30-Day Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center group">
              <Eye className="h-5 w-5 mr-2" />
              Watch Demo Video
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-primary-100 text-sm">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>All features included</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>Setup assistance included</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Detail Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${selectedFeature.color.split(' ')[0]}`}>
                    <selectedFeature.icon className={`h-8 w-8 ${selectedFeature.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedFeature.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-lg text-gray-600">{selectedFeature.description}</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className={`${selectedFeature.color} border rounded-lg p-6`}>
                    <h4 className={`text-lg font-semibold mb-4 ${selectedFeature.iconColor.replace('text-', 'text-').replace('-600', '-900')}`}>
                      Key Features
                    </h4>
                    <div className="space-y-3">
                      {selectedFeature.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircle className={`h-5 w-5 ${selectedFeature.iconColor} mt-0.5 flex-shrink-0`} />
                          <span className={`text-sm ${selectedFeature.iconColor.replace('text-', 'text-').replace('-600', '-700')}`}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Business Benefits</h4>
                    <div className="space-y-3">
                      {selectedFeature.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setSelectedFeature(null)}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                  >
                    Close
                  </button>
                  <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center">
                    Try This Feature
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Features;