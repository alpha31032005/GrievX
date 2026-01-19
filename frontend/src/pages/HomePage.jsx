import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiCheckCircle,
  FiTrendingUp,
  FiUsers,
  FiMapPin,
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiMail,
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const HomePage = () => {
  const { isDark } = useTheme();

  const features = [
    {
      icon: <FiMapPin className="w-8 h-8" />,
      title: "Location-Based Reporting",
      description:
        "Report issues with precise location tracking and geospatial visualization",
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: "Real-Time Analytics",
      description:
        "Track issue progress with comprehensive analytics and trending data",
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Community Impact",
      description:
        "Connect with other citizens and witness real-world changes in your community",
    },
    {
      icon: <FiCheckCircle className="w-8 h-8" />,
      title: "AI-Powered Classification",
      description:
        "Automatic issue categorization using advanced machine learning technology",
    },
  ];

  const stats = [
    { number: "2500+", label: "Issues Resolved" },
    { number: "45K+", label: "Active Citizens" },
    { number: "150+", label: "Cities Participating" },
    { number: "98%", label: "Satisfaction Rate" },
  ];

  // Footer Links (Non-functional but safe)
  const footerLinks = {
    Product: [
      { name: "Features", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Security", href: "#" },
      { name: "Roadmap", href: "#" },
    ],
    Company: [
      { name: "About Us", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Press", href: "#" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "Disclaimer", href: "#" },
    ],
    Support: [
      { name: "Help Center", href: "#" },
      { name: "Contact Us", href: "#" },
      { name: "FAQ", href: "#" },
      { name: "Community", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: FiGithub, href: "#", label: "GitHub" },
    { icon: FiTwitter, href: "#", label: "Twitter" },
    { icon: FiLinkedin, href: "#", label: "LinkedIn" },
    { icon: FiMail, href: "mailto:contact@grievx.com", label: "Email" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* ======================= HERO SECTION ======================= */}
      <section
        className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden ${
          isDark ? "bg-gradient-dark" : "bg-gradient-primary"
        }`}
      >
        {/* Background video */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source src="/civic-background.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Good color blur */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Main Hero Content */}
        <div className="max-w-7xl mx-auto text-center relative z-10 fade-in-up space-y-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg transition-transform hover:scale-105">
            Smart Civic System
          </h1>

          <p className="text-xl md:text-3xl text-white bg-gradient-to-r from-amber-300 via-rose-300 to-pink-300 bg-clip-text text-transparent font-semibold animate-pulse">
            Your voice matters—report issues and see real action happen.
          </p>

          {/* CTA BUTTONS — FIXED ROUTES */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideInUp">
            <Link
              to="/citizen/complaint"
              className="px-8 py-4 bg-white text-blue-700 font-bold rounded-lg hover:bg-gray-100 transition shadow-lg flex items-center gap-2"
            >
              Report an Issue <FiArrowRight />
            </Link>

            <Link
              to="/citizen/dashboard"
              className="px-8 py-4 bg-white/20 text-white font-bold rounded-lg border border-white backdrop-blur-sm hover:bg-white/30 transition"
            >
              View Dashboard
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 text-white animate-slideInUp">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="hover:scale-110 transition cursor-pointer text-center"
              >
                <p className="text-4xl font-bold">{stat.number}</p>
                <p className="opacity-90">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= FEATURES ======================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Why Choose GrievX?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, idx) => (
              <div
                key={idx}
                className="p-8 bg-gray-50 dark:bg-gray-800 rounded-xl shadow hover:-translate-y-2 hover:shadow-2xl transition cursor-pointer"
              >
                <div className="mb-4 text-blue-600 dark:text-blue-400">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {f.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= CTA ======================= */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          Ready to Make a Difference?
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">
          Join thousands of citizens already improving their communities.
        </p>

        <Link
          to="/citizen/complaint"
          className="inline-block mt-6 px-10 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Start Reporting Now
        </Link>
      </section>

      {/* ======================= FOOTER ======================= */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">

          {/* Brand + Social */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center text-xl">
                🏛️
              </div>
              <h3 className="text-2xl font-bold">GrievX</h3>
            </div>

            <div className="flex gap-3 mt-4 sm:mt-0">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-semibold text-lg mb-3">{category}</h4>
                <ul className="space-y-2">
                  {links.map((l) => (
                    <li key={l.name}>
                      <a href="#" className="text-gray-400 hover:text-white transition">
                        {l.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center text-gray-500 mt-10">
            © 2026 GrievX — Building smarter communities.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
