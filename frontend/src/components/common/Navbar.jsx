import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX, FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Report Issue', path: '/report' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'FAQ', path: '/faq' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 hover:shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <span className="text-white font-bold text-lg">🏛️</span>
            </div>
            <span className="text-xl font-poppins font-bold text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
              GrievX
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, idx) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-all duration-300 relative group"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900 transition-all duration-300 transform hover:scale-110 group"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <FiSun className="w-5 h-5 text-yellow-500 group-hover:rotate-180 transition-transform duration-500" />
              ) : (
                <FiMoon className="w-5 h-5 text-gray-600 group-hover:rotate-180 transition-transform duration-500" />
              )}
            </button>

            {/* Auth Links - Desktop */}
            <div className="hidden sm:flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-all duration-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-600 dark:hover:border-primary-400"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-110"
            >
              {isOpen ? (
                <FiX className="w-6 h-6 animate-fadeInUp" />
              ) : (
                <FiMenu className="w-6 h-6 animate-fadeInUp" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-slideInUp">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 group"
                onClick={() => setIsOpen(false)}
              >
                <span className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                  <span className="w-1 h-1 rounded-full bg-primary-600 dark:bg-primary-400 group-hover:w-2 transition-all"></span>
                  {link.name}
                </span>
              </Link>
            ))}
            
            {/* Mobile Auth Links */}
            <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 space-y-2">
              <Link
                to="/login"
                className="block px-4 py-2 text-center text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-all duration-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block px-4 py-2 text-center bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
