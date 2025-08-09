import { Calendar, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerLinks = {
  product: [
    { label: 'Features', href: 'features' },
    // { label: 'Pricing', href: 'pricing' },
    // { label: 'Demo', href: 'demo' },
    // { label: 'API', href: 'api' }
  ],
  company: [
    { label: 'About Us', href: 'about' },
    // { label: 'Careers', href: 'careers' },
    // { label: 'Press', href: 'press' },
    { label: 'Blog', href: 'blog' }
  ],
  support: [
    { label: 'Help Center', href: 'mailto:gergessamuel100@gmail.com' },
    { label: 'Contact', href: 'mailto:gergessamuel100@gmail.com' },
    // { label: 'Status', href: 'status' },
    // { label: 'Updates', href: 'updates' }
  ],
  legal: [
    { label: 'Privacy Policy', href: 'privacy' },
    { label: 'Terms of Service', href: 'terms' },
    { label: 'Cookie Policy', href: 'cookie_policy' },
    // { label: 'GDPR', href: 'gdpr' }
  ]
};

const socialLinks = [
  { label: 'Twitter', href: '#twitter' },
  { label: 'LinkedIn', href: '#linkedin' },
  { label: 'Facebook', href: '#facebook' },
  { label: 'Instagram', href: '#instagram' }
];

const contactInfo = [
  { icon: Phone, label: '+20 (12) 1234-5678' },
  { icon: Mail, label: 'supprot@shiftswaper.com' },
  { icon: MapPin, label: 'Egypt, Cairo' },
  { icon: MapPin, label: 'Worldwide company' }
];

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <Calendar className="h-8 w-8 text-primary-400" />
              <span className="ml-2 text-xl font-heading font-bold">Shiftswaper</span>
            </div>
            <p className="text-secondary-300 mb-6 max-w-md">
              Empowering businesses with flexible shift management solutions.
              Make scheduling seamless for you and your employees.
            </p>
            <div className="space-y-2">
              {contactInfo.map((contact, index) => (
                <div key={index} className="flex items-center text-secondary-300">
                  <contact.icon className="h-4 w-4 mr-2" />
                  <span className="text-sm">{contact.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="text-secondary-300 hover:text-white text-sm transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="text-secondary-300 hover:text-white text-sm transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-secondary-300 hover:text-white text-sm transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="text-secondary-300 hover:text-white text-sm transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-secondary-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-secondary-400 text-sm">
              © 2025 Shiftswaper. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-secondary-400 hover:text-white text-sm transition-colors duration-200"
                >
                  {social.label}
                </a>
              ))}
              {/* <a
                href="https://josam-portfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-white text-sm transition-colors duration-200"
              >
                Created by Gerges Samuel
              </a> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};


export default Footer;