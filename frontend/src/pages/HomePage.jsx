import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiTrendingUp, FiUsers, FiMapPin, FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const HomePage = () => {
  const { isDark } = useTheme();

  const features = [
    {
      icon: <FiMapPin className="w-8 h-8" />,
      title: 'Location-Based Reporting',
      description: 'Report issues with precise location tracking and geospatial visualization',
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: 'Real-Time Analytics',
      description: 'Track issue progress with comprehensive analytics and trending data',
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: 'Community Impact',
      description: 'Connect with other citizens and witness real-world changes in your community',
    },
    {
      icon: <FiCheckCircle className="w-8 h-8" />,
      title: 'AI-Powered Classification',
      description: 'Automatic issue categorization using advanced machine learning technology',
    },
  ];

  const stats = [
    { number: '2500+', label: 'Issues Resolved' },
    { number: '45K+', label: 'Active Citizens' },
    { number: '150+', label: 'Cities Participating' },
    { number: '98%', label: 'Satisfaction Rate' },
  ];

  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Security', href: '/security' },
      { name: 'Roadmap', href: '#roadmap' },
    ],
    Company: [
      { name: 'About Us', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Careers', href: '#careers' },
      { name: 'Press', href: '#press' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'Disclaimer', href: '#disclaimer' },
    ],
    Support: [
      { name: 'Help Center', href: '#help' },
      { name: 'Contact Us', href: '#contact' },
      { name: 'FAQ', href: '#faq' },
      { name: 'Community', href: '#community' },
    ],
  };

  const socialLinks = [
    { icon: FiGithub, href: '#github', label: 'GitHub' },
    { icon: FiTwitter, href: '#twitter', label: 'Twitter' },
    { icon: FiLinkedin, href: '#linkedin', label: 'LinkedIn' },
    { icon: FiMail, href: 'mailto:contact@grievx.com', label: 'Email' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden ${isDark ? 'bg-gradient-dark' : 'bg-gradient-primary'}`}>
        {/* Video Background */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source
              src="/civic-background.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-white opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="space-y-8 fade-in-up">
            {/* Main Heading */}
            <div className="space-y-6 animate-fadeInUp">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight hover:scale-105 transition-transform duration-500 drop-shadow-lg">
                Smart Civic System
              </h1>
              {/* Tagline with Barlow Font */}
              <p className="font-barlow text-lg md:text-2xl lg:text-3xl font-semibold text-white text-opacity-100 max-w-3xl mx-auto leading-relaxed hover:text-opacity-100 transition-all duration-300 drop-shadow-md bg-gradient-to-r from-amber-300 via-rose-300 to-pink-300 bg-clip-text text-transparent hover:from-amber-200 hover:via-rose-200 hover:to-pink-200 animate-pulse tracking-wide">
                Your voice matters—report issues and see real action happen.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 animate-slideInUp">
              <Link
                to="/report"
                className="px-8 py-4 bg-white text-primary-600 font-bold rounded-lg hover:bg-gray-100 transform hover:scale-110 transition-all shadow-lg flex items-center gap-2 group"
              >
                Report an Issue <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-white bg-opacity-20 text-white font-bold rounded-lg hover:bg-opacity-30 border-2 border-white transition-all backdrop-blur-sm hover:shadow-xl"
              >
                View Dashboard
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16 text-white animate-slideInUp delay-500">
              {stats.map((stat, idx) => (
                <div 
                  key={idx} 
                  className="space-y-2 group cursor-pointer transform hover:scale-110 transition-transform duration-300 drop-shadow-md"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="text-3xl md:text-4xl font-bold group-hover:drop-shadow-lg transition-all">
                    {stat.number}
                  </div>
                  <div className="text-sm md:text-base opacity-90 group-hover:opacity-100 transition-opacity">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Why Choose GrievX?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Empowering citizens to drive positive change in their communities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-8 rounded-xl bg-gray-50 dark:bg-gray-800 hover:shadow-2xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-2 animate-fadeInUp"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="text-primary-600 dark:text-primary-400 mb-4 group-hover:scale-125 group-hover:rotate-6 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800 transition-colors">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fadeInUp">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Join thousands of citizens already making their communities better
          </p>
          <Link
            to="/report"
            className="inline-block px-10 py-4 bg-gradient-primary text-white font-bold rounded-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300 group"
          >
            Start Reporting Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white transition-colors">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 mb-8 lg:mb-12">
            {/* Brand Section */}
            <div className="space-y-4 animate-fadeInUp sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 group">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <span className="text-white font-bold text-lg">🏛️</span>
                </div>
                <span className="text-xl font-poppins font-bold text-primary-400">GrievX</span>
              </div>
              <p className="text-gray-400 hover:text-gray-300 transition-colors text-sm">
                Empowering communities through smart civic engagement and real-time action.
              </p>
              {/* Social Links */}
              <div className="flex space-x-3 pt-2">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 rounded-full bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-all duration-300 transform hover:scale-110 group"
                  >
                    <Icon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  </a>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="space-y-3 animate-fadeInUp" style={{ animationDelay: `${(Object.keys(footerLinks).indexOf(category) + 1) * 100}ms` }}>
                <h3 className="text-base sm:text-lg font-semibold text-white hover:text-primary-400 transition-colors">
                  {category}
                </h3>
                <ul className="space-y-1 sm:space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-primary-400 transition-colors duration-300 flex items-center group text-sm"
                      >
                        <span className="w-0 h-0.5 bg-primary-400 group-hover:w-2 transition-all duration-300 mr-2"></span>
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 my-6 sm:my-8"></div>

          {/* Bottom Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mb-6 animate-fadeInUp">
            {/* Copyright */}
            <div className="text-gray-400 hover:text-gray-300 transition-colors text-center sm:text-left">
              <p className="text-sm">© 2026 GrievX. All rights reserved.</p>
              <p className="text-xs mt-1">Making communities smarter, one report at a time.</p>
            </div>

            {/* Developer Credit */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Developed with <span className="text-red-500 animate-pulse">❤️</span> by
              </p>
              <a 
                href="#nishant" 
                className="text-primary-400 font-semibold hover:text-primary-300 transition-colors group text-sm"
              >
                <span className="group-hover:underline">Nishant</span>
              </a>
              <p className="text-gray-500 text-xs mt-1">ML Engineer</p>
            </div>

            {/* Contact & Support */}
            <div className="text-center sm:text-right">
              <p className="text-gray-400 mb-1 text-sm">Need Help?</p>
              <a 
                href="mailto:contact@grievx.com"
                className="text-primary-400 hover:text-primary-300 transition-colors flex items-center justify-center sm:justify-end group text-sm"
              >
                contact@grievx.com
                <FiMail className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Additional Info */}
          <div className="pt-4 sm:pt-6 border-t border-gray-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500 text-center sm:text-left">
              <p className="hover:text-gray-400 transition-colors">
                Version 1.0.0 • Last Updated: January 2026
              </p>
              <p className="sm:text-right hover:text-gray-400 transition-colors">
                Made for communities. By the community.
              </p>
            </div>
          </div>
        </div>

        {/* Scroll to Top Button */}
        <div className="text-center py-3 sm:py-4 border-t border-gray-800">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-gray-400 hover:text-primary-400 transition-colors text-xs sm:text-sm group"
          >
            <span className="inline-block group-hover:translate-y-1 transition-transform">↑</span> Back to Top
          </button>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
