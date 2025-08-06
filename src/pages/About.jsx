import React, { useState } from 'react';
import {
  Building2,
  Users,
  Clock,
  Shield,
  Star,
  ArrowRight,
  CheckCircle,
  Target,
  Heart,
  Award,
  TrendingUp,
  Globe,
  Zap,
  Calendar,
  Handshake,
  Mail,
  MessageCircle,
  Eye,
  Bell,
  RefreshCw,
  Filter,
  Search,
  UserCheck,
  CalendarDays,
  ArrowLeftRight,
  Plus
} from 'lucide-react';

const About = () => {
  const [activeStatsTab, setActiveStatsTab] = useState('overview');

  const stats = [
    { label: 'Active Companies', value: '500+', icon: Building2, color: 'text-blue-600' },
    { label: 'Happy Employees', value: '15,000+', icon: Users, color: 'text-green-600' },
    { label: 'Shifts Swapped', value: '50,000+', icon: Clock, color: 'text-purple-600' },
    { label: 'Hours Saved Monthly', value: '25,000+', icon: TrendingUp, color: 'text-orange-600' }
  ];

  const features = [
    {
      icon: Handshake,
      title: 'Smart Shift Swapping',
      description: 'Advanced algorithm matches employees for optimal shift exchanges with real-time notifications.'
    },
    {
      icon: CalendarDays,
      title: 'Day-Off Management',
      description: 'Seamless day-off swapping system with intelligent matching and supervisor oversight.'
    },
    {
      icon: Shield,
      title: 'Multi-Level Approval',
      description: 'Comprehensive approval workflow with company owners, supervisors, and employee controls.'
    },
    {
      icon: Bell,
      title: 'Real-Time Notifications',
      description: 'Instant email notifications keep everyone informed throughout the swap process.'
    },
    {
      icon: Search,
      title: 'Advanced Filtering',
      description: 'Powerful search and filter capabilities to find the perfect shift matches quickly.'
    },
    {
      icon: RefreshCw,
      title: 'Live Updates',
      description: 'Real-time dashboard updates ensure everyone has the latest information.'
    }
  ];

  const values = [
    {
      icon: Target,
      title: 'Efficiency First',
      description: 'We believe in streamlining processes to save time and reduce administrative burden for everyone involved.'
    },
    {
      icon: Heart,
      title: 'Employee Wellbeing',
      description: 'Our platform empowers employees with flexibility while maintaining operational excellence for businesses.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Enterprise-grade security ensures your data is protected while maintaining transparency in all operations.'
    },
    {
      icon: Globe,
      title: 'Accessibility',
      description: 'Designed to be intuitive and accessible for users of all technical backgrounds across different industries.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Co-Founder',
      bio: 'Former Operations Director with 15+ years in workforce management.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Michael Chen',
      role: 'CTO & Co-Founder',
      bio: 'Software architect specializing in scalable enterprise solutions.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      bio: 'UX expert focused on creating intuitive workplace management tools.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'David Kim',
      role: 'Lead Developer',
      bio: 'Full-stack developer with expertise in real-time systems and notifications.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const testimonials = [
    {
      name: 'Rachel Martinez',
      role: 'Operations Manager',
      company: 'HealthCare Plus',
      content: 'Shiftswaper has revolutionized how we manage our nursing schedules. The flexibility it provides to our staff while maintaining coverage is incredible.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&crop=face'
    },
    {
      name: 'James Wilson',
      role: 'Store Manager',
      company: 'RetailMax',
      content: 'Our employee satisfaction has increased dramatically. The easy swap system means fewer last-minute staffing issues and happier employees.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=60&h=60&fit=crop&crop=face'
    },
    {
      name: 'Lisa Thompson',
      role: 'HR Director',
      company: 'Manufacturing Corp',
      content: 'The supervisor approval system gives us the control we need while empowering our workforce. It\'s the perfect balance.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&fit=crop&crop=face'
    }
  ];

  const milestones = [
    { year: '2020', event: 'Company Founded', description: 'Started with a simple idea to make shift swapping easier' },
    { year: '2021', event: 'First 100 Companies', description: 'Reached our first major milestone with diverse industry adoption' },
    { year: '2022', event: 'Advanced Features Launch', description: 'Introduced day-off swapping and multi-supervisor approval' },
    { year: '2023', event: '10,000+ Employees', description: 'Platform scaled to serve over 10,000 active employees' },
    { year: '2024', event: 'Enterprise Expansion', description: 'Launched enterprise features and advanced analytics' },
    { year: '2025', event: 'Global Reach', description: 'Serving companies worldwide with 24/7 support' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Building2 className="h-12 w-12 text-blue-600" />
              <h1 className="text-5xl lg:text-6xl font-heading font-bold text-secondary-900">
                About Shiftswaper
              </h1>
            </div>
            <p className="text-xl lg:text-2xl text-secondary-600 max-w-4xl mx-auto mb-8 leading-relaxed">
              Empowering businesses and employees with intelligent shift management solutions that make scheduling flexible, efficient, and stress-free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center group">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <button className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200">
                Contact Our Team
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-secondary-600">
              Our platform is making a real difference in workplaces around the world
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group hover:transform hover:scale-105 transition-transform duration-200">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-50 transition-colors duration-200">
                  <stat.icon className={`h-10 w-10 ${stat.color} group-hover:text-primary-600 transition-colors duration-200`} />
                </div>
                <h3 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-2">
                  {stat.value}
                </h3>
                <p className="text-secondary-600 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-6">
            Our Mission
          </h2>
          <p className="text-xl text-blue-100 leading-relaxed mb-8">
            To revolutionize workforce management by creating a seamless bridge between business needs and employee flexibility. We believe that when employees have control over their schedules, everyone wins – businesses operate more efficiently, and employees enjoy better work-life balance.
          </p>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-center space-x-4 text-white">
              <Target className="h-8 w-8" />
              <span className="text-lg font-semibold">Building the future of flexible work</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
              What Makes Us Different
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Our comprehensive platform goes beyond simple scheduling to create an intelligent ecosystem for shift management.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow duration-200 group">
                <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-100 transition-colors duration-200">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-secondary-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              These principles guide every decision we make and every feature we build.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div className="bg-primary-100 p-3 rounded-full flex-shrink-0">
                  <value.icon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-heading font-semibold text-secondary-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-secondary-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey/Timeline Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-secondary-600">
              From startup to industry leader – here's how we've grown
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-primary-200"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 w-3 h-3 bg-primary-600 rounded-full border-4 border-white shadow-md"></div>
                  <div className={`bg-white rounded-lg shadow-md p-6 ml-12 md:ml-0 md:w-5/12 ${index % 2 === 0 ? 'md:mr-auto md:text-right' : 'md:ml-auto md:text-left'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-bold">
                        {milestone.year}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                      {milestone.event}
                    </h3>
                    <p className="text-secondary-600">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {/* <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-secondary-600">
              The passionate professionals behind Shiftswaper
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-40 h-40 rounded-full mx-auto object-cover border-4 border-primary-100 group-hover:border-primary-300 transition-colors duration-200"
                  />
                  <div className="absolute inset-0 bg-primary-600 bg-opacity-0 group-hover:bg-opacity-10 rounded-full transition-opacity duration-200"></div>
                </div>
                <h3 className="text-xl font-heading font-semibold text-secondary-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-secondary-600 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Testimonials Section */}
      {/* <section className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-secondary-600">
              Real feedback from real businesses using Shiftswaper
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-secondary-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-heading font-semibold text-secondary-900">
                      {testimonial.name}
                    </p>
                    <p className="text-secondary-600 text-sm">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-6">
            Ready to Transform Your Workplace?
          </h2>
          <p className="text-xl text-primary-100 mb-8 leading-relaxed">
            Join thousands of businesses that have already revolutionized their shift management with Shiftswaper. Start your free trial today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center group">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center group">
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Sales
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-primary-100 text-sm">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>30-day free trial</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;