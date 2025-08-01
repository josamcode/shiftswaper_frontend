import { Calendar, Users, Clock, Shield, Star, ArrowRight, CheckCircle } from 'lucide-react';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuthStatus } from '../utils/checkAuthRedirect';

const features = [
  {
    icon: Calendar,
    title: 'Smart Shift Scheduling',
    description: 'Intelligent scheduling system that adapts to your business needs and employee preferences.'
  },
  {
    icon: Users,
    title: 'Easy Employee Management',
    description: 'Simple approval process for employee registration and seamless team coordination.'
  },
  {
    icon: Clock,
    title: 'Real-time Swapping',
    description: 'Instant shift exchanges with automatic notifications and conflict resolution.'
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with 99.9% uptime guarantee for your critical operations.'
  }
];

const steps = [
  {
    step: '01',
    title: 'Create Company Account',
    description: 'Register your business and set up your workspace in minutes.'
  },
  {
    step: '02',
    title: 'Employee Registration',
    description: 'Employees request to join your company and await approval.'
  },
  {
    step: '03',
    title: 'Start Swapping',
    description: 'Approved employees can exchange shifts and manage day-offs seamlessly.'
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Operations Manager',
    company: 'RetailPlus',
    content: 'Shiftswaper transformed our scheduling chaos into a streamlined process. Our employees love the flexibility!',
    rating: 5
  },
  {
    name: 'Mike Chen',
    role: 'HR Director',
    company: 'Healthcare Solutions',
    content: 'The approval system gives us control while empowering our staff. Highly recommended for any shift-based business.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'Store Manager',
    company: 'FoodService Co',
    content: 'Reduced scheduling conflicts by 80%. The real-time notifications keep everyone informed and happy.',
    rating: 5
  }
];

// Main Homepage Component
const Homepage = () => {

  const navigate = useNavigate();

  useEffect(() => {
    const { isLoggedIn, redirectPath } = checkAuthStatus();
    if (isLoggedIn && redirectPath) {
      navigate(redirectPath);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen font-primary">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-heading font-bold text-secondary-900 mb-6">
                Simplify Shift Management for Your
                <span className="text-primary-600"> Variable Schedule</span> Business
              </h1>
              <p className="text-xl text-secondary-600 mb-8 leading-relaxed">
                Empower your employees to swap shifts seamlessly while maintaining full control.
                Create your company account, approve employees, and watch productivity soar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
                <button className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200">
                  Watch Demo
                </button>
              </div>
              <div className="mt-8 flex items-center space-x-6 text-sm text-secondary-500">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-3">
                        <p className="font-semibold text-secondary-900">Morning Shift</p>
                        <p className="text-sm text-secondary-600">8:00 AM - 4:00 PM</p>
                      </div>
                    </div>
                    <button className="text-primary-600 font-medium">Swap</button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-secondary-400 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-3">
                        <p className="font-semibold text-secondary-900">Evening Shift</p>
                        <p className="text-sm text-secondary-600">4:00 PM - 12:00 AM</p>
                      </div>
                    </div>
                    <button className="text-secondary-600 font-medium">Available</button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-3">
                        <p className="font-semibold text-secondary-900">Day Off</p>
                        <p className="text-sm text-secondary-600">Sunday, March 15</p>
                      </div>
                    </div>
                    <button className="text-green-600 font-medium">Confirmed</button>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary-100 rounded-full opacity-50"></div>
              <div className="absolute -bottom-4 -left-4 w-48 h-48 bg-secondary-100 rounded-full opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
              Everything You Need for Efficient Shift Management
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Our comprehensive platform streamlines every aspect of shift scheduling,
              from employee onboarding to real-time shift exchanges.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-100 transition-colors duration-200">
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

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
              Get Started in Three Simple Steps
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              From setup to active shift swapping, our streamlined process gets your team
              collaborating efficiently in no time.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <div className="text-4xl font-heading font-bold text-primary-600 mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-secondary-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-secondary-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-primary-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
              Trusted by Growing Businesses
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              See how companies across industries are transforming their shift management
              with Shiftswaper.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-primary-50 rounded-2xl p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-secondary-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-heading font-semibold text-secondary-900">
                    {testimonial.name}
                  </p>
                  <p className="text-secondary-600 text-sm">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-6">
            Ready to Transform Your Shift Management?
          </h2>
          <p className="text-xl text-primary-100 mb-8 leading-relaxed">
            Join thousands of businesses that have streamlined their scheduling with Shiftswaper.
            Start your free trial today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center group">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;