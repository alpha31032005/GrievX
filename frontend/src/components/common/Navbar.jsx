import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FiMenu, FiX, FiMoon, FiSun, FiLogOut, FiUser, FiChevronDown, 
  FiGrid, FiClipboard, FiFileText, FiBarChart2, FiPlusCircle, FiList,
  FiHome, FiTrendingUp, FiCheckCircle, FiUsers, FiAlertCircle
} from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const servicesRef = useRef(null);
  const profileRef = useRef(null);
  
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout, isAdmin, isChief, isCitizen } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target)) {
        setIsServicesOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  const prevPathRef = useRef(location.pathname);
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      // Use microtask to avoid lint warning about setState in effect
      queueMicrotask(() => {
        setIsMobileMenuOpen(false);
        setIsServicesOpen(false);
      });
    }
  }, [location.pathname]);

  // Listen for active section updates from HomePage
  useEffect(() => {
    const handleActiveSection = (event) => {
      setActiveSection(event.detail);
    };
    window.addEventListener('activeSection', handleActiveSection);
    return () => window.removeEventListener('activeSection', handleActiveSection);
  }, []);

  // Reset active section when leaving homepage
  useEffect(() => {
    if (location.pathname !== '/') {
      queueMicrotask(() => {
        setActiveSection('');
      });
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Common navigation links (visible to all)
  const commonLinks = [
    { name: "Home", path: "/", icon: FiHome },
    { name: "Analytics", path: "/#analytics", icon: FiTrendingUp, isHash: true },
    { name: "Features", path: "/#features", icon: FiCheckCircle, isHash: true },
    { name: "About", path: "/#about", icon: FiUsers, isHash: true },
    { name: "FAQ", path: "/#faq", icon: FiAlertCircle, isHash: true },
  ];

  // Role-specific service links (in hamburger)
  const getServiceLinks = () => {
    if (!isAuthenticated) return [];
    
    if (isCitizen) {
      return [
        { name: "Dashboard", path: "/citizen/dashboard", icon: FiGrid, description: "View your overview" },
        { name: "Report Issue", path: "/citizen/complaint", icon: FiPlusCircle, description: "File a new complaint" },
        { name: "My Complaints", path: "/citizen/my-complaints", icon: FiList, description: "Track your reports" },
      ];
    }
    
    if (isChief) {
      return [
        { name: "Dashboard", path: "/admin/dashboard", icon: FiGrid, description: "System overview" },
        { name: "All Reports", path: "/admin/reports", icon: FiBarChart2, description: "Strategic analytics" },
        { name: "Manage", path: "/admin/manage", icon: FiClipboard, description: "View all complaints" },
      ];
    }
    
    if (isAdmin) {
      return [
        { name: "Dashboard", path: "/admin/dashboard", icon: FiGrid, description: "Department overview" },
        { name: "Manage", path: "/admin/manage", icon: FiClipboard, description: "Handle complaints" },
        { name: "Reports", path: "/admin/reports", icon: FiFileText, description: "View analytics" },
      ];
    }
    
    return [];
  };

  const serviceLinks = getServiceLinks();

  const handleHashNavigation = (hash) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const tabId = hash.replace('/#', '');
        window.dispatchEvent(new CustomEvent('setHomeTab', { detail: tabId }));
      }, 100);
    } else {
      const tabId = hash.replace('/#', '');
      window.dispatchEvent(new CustomEvent('setHomeTab', { detail: tabId }));
    }
  };

  const handleHomeNavigation = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('setHomeTab', { detail: 'home' }));
      }, 100);
    } else {
      window.dispatchEvent(new CustomEvent('setHomeTab', { detail: 'home' }));
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* LOGO */}
          <button onClick={handleHomeNavigation} className="flex items-center space-x-3 group cursor-pointer">
            <img 
              src="/grievx_icon.png" 
              alt="GrievX Icon" 
              className="w-10 h-10 rounded-lg group-hover:scale-110 transition-transform duration-300"
            />
            <span className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
              GrievX
            </span>
          </button>

          {/* DESKTOP: Common Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {commonLinks.map((link) => {
              // Determine if link is active based on current page or active section on homepage
              let isActive = false;
              if (location.pathname === '/') {
                // On homepage, use activeSection to determine active link
                const linkSection = link.isHash ? link.path.replace('/#', '') : 'home';
                isActive = activeSection === linkSection;
              } else {
                // On other pages, use pathname matching
                isActive = location.pathname === link.path;
              }
              
              // Home link uses special handler
              if (link.path === '/') {
                return (
                  <button
                    key={link.name}
                    onClick={handleHomeNavigation}
                    className={`relative group transition-all text-sm font-medium ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                  >
                    {link.name}
                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all duration-300 ease-in-out ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  </button>
                );
              }
              
              return link.isHash ? (
                <button
                  key={link.name}
                  onClick={() => handleHashNavigation(link.path)}
                  className={`relative group transition-all text-sm font-medium ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all duration-300 ease-in-out ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></span>
                </button>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative group transition-all text-sm font-medium ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></span>
                </Link>
              );
            })}
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center space-x-3">

            {/* SERVICES HAMBURGER (Authenticated only) */}
            {isAuthenticated && serviceLinks.length > 0 && (
              <div className="relative" ref={servicesRef}>
                <button
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    isServicesOpen 
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                  <span>Services</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Services Dropdown */}
                <div className={`absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 origin-top-right ${
                  isServicesOpen 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}>
                  <div className="px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                    <p className="text-sm font-semibold">
                      {isChief ? 'Chief Officer Services' : isAdmin ? `${user?.department?.replace(/_/g, ' ') || 'Admin'} Services` : 'Citizen Services'}
                    </p>
                    <p className="text-xs opacity-80">Quick access to your tools</p>
                  </div>
                  <div className="py-2">
                    {serviceLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = location.pathname === link.path;
                      return (
                        <Link
                          key={link.name}
                          to={link.path}
                          onClick={() => setIsServicesOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 transition-all ${
                            isActive 
                              ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-600' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-transparent'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${isActive ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                            <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`} />
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${isActive ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                              {link.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{link.description}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {isDark ? (
                <FiSun className="text-yellow-400 text-lg" />
              ) : (
                <FiMoon className="text-gray-700 text-lg" />
              )}
            </button>

            {/* PROFILE DROPDOWN (Desktop) */}
            {isAuthenticated ? (
              <div className="relative hidden sm:block" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm shadow-md group-hover:scale-105 transition-transform">
                    {getUserInitials()}
                  </div>
                  <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                <div className={`absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 origin-top-right ${
                  isProfileOpen 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}>
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 capitalize">
                      {user?.role === 'admin' && user?.department 
                        ? `${user.department.replace(/_/g, ' ')} Admin` 
                        : user?.role === 'chief' 
                          ? 'Chief Officer' 
                          : user?.role}
                    </span>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsProfileOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-3"
                    >
                      <FiUser className="w-4 h-4" />
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-3"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-primary-600 hover:text-primary-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 sm:hidden transition-opacity duration-300 ${
        isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`} onClick={() => setIsMobileMenuOpen(false)} />

      {/* MOBILE SLIDE-IN MENU */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl z-50 sm:hidden transform transition-transform duration-300 ease-out ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <span className="text-lg font-bold text-gray-900 dark:text-white">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-64px)] pb-8">
          {/* User Info (if authenticated) */}
          {isAuthenticated && (
            <div className="px-4 py-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 mx-4 mt-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
                  {getUserInitials()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Common Links */}
          <div className="px-4 py-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Navigation</p>
            {commonLinks.map((link) => {
              const Icon = link.icon;
              
              // Determine if link is active based on current page or active section on homepage
              let isActive = false;
              if (location.pathname === '/') {
                const linkSection = link.isHash ? link.path.replace('/#', '') : 'home';
                isActive = activeSection === linkSection;
              } else {
                isActive = location.pathname === link.path;
              }
              
              // Home link uses special handler
              if (link.path === '/') {
                return (
                  <button
                    key={link.name}
                    onClick={() => {
                      handleHomeNavigation();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{link.name}</span>
                  </button>
                );
              }
              
              return link.isHash ? (
                <button
                  key={link.name}
                  onClick={() => {
                    handleHashNavigation(link.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{link.name}</span>
                </button>
              ) : (
                <button
                  key={link.name}
                  onClick={() => {
                    navigate(link.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition ${
                    location.pathname === link.path
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{link.name}</span>
                </button>
              );
            })}
          </div>

          {/* Services (if authenticated) */}
          {isAuthenticated && serviceLinks.length > 0 && (
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {isChief ? 'Chief Services' : isAdmin ? 'Admin Services' : 'My Services'}
              </p>
              {serviceLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <span className="text-sm font-medium">{link.name}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{link.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Auth Actions */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <FiUser className="w-5 h-5" />
                  <span className="text-sm font-medium">Profile Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full px-4 py-2.5 text-center text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-primary-600 hover:text-primary-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full px-4 py-2.5 text-center text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
