import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiCheckCircle,
  FiTrendingUp,
  FiUsers,
  FiMapPin,
  FiGithub,
  FiLinkedin,
  FiMail,
  FiAlertCircle,
  FiClock,
  FiXCircle,
  FiClipboard,
  FiBarChart2,
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import HelpChatbot from '../components/common/HelpChatbot';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const HomePage = () => {
  const { isDark } = useTheme();
  const { isAuthenticated, isCitizen, isAdmin, isChief } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  // Broadcast active section to navbar whenever tab changes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('activeSection', { detail: activeTab }));
  }, [activeTab]);
  
  const [stats, setStats] = useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    rejectedComplaints: 0,
    pendingComplaints: 0,
    activeCitizens: 0,
    resolvedPercentage: 0,
    rejectedPercentage: 0,
    pendingPercentage: 0,
    resolutionTimeDistribution: {
      under7Days: 0,
      from7To15Days: 0,
      moreThan15Days: 0,
    },
    categoryDistribution: [],
    monthlyTrends: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch real-time statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/analytics/public/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
        // Fallback to demo data if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Listen for tab change events from Navbar
  useEffect(() => {
    const handleSetTab = (event) => {
      const tabId = event.detail;
      const validTabs = ['home', 'analytics', 'features', 'about', 'faq'];
      if (validTabs.includes(tabId)) {
        setActiveTab(tabId);
        // Scroll to the section
        const section = document.getElementById(tabId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };
    window.addEventListener('setHomeTab', handleSetTab);
    return () => window.removeEventListener('setHomeTab', handleSetTab);
  }, []);

  // Scroll spy to detect active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'analytics', 'features', 'about', 'faq'];
      const scrollPosition = window.scrollY + 150; // Offset for navbar + buffer

      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (section) {
          const { offsetTop, offsetHeight } = section;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            if (activeTab !== sectionId) {
              setActiveTab(sectionId);
            }
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    const animatedElements = document.querySelectorAll('.scroll-fade-in');
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Role-specific features
  const getRoleFeatures = () => {
    // Guest / General features
    const generalFeatures = [
      {
        icon: <FiMapPin className="w-8 h-8" />,
        title: "Location-Based Reporting",
        description: "Report issues with precise location tracking and geospatial visualization",
      },
      {
        icon: <FiTrendingUp className="w-8 h-8" />,
        title: "Real-Time Analytics",
        description: "Track issue progress with comprehensive analytics and trending data",
      },
      {
        icon: <FiUsers className="w-8 h-8" />,
        title: "Community Impact",
        description: "Connect with other citizens and witness real-world changes in your community",
      },
      {
        icon: <FiCheckCircle className="w-8 h-8" />,
        title: "AI-Powered Classification",
        description: "Automatic issue categorization using advanced machine learning technology",
      },
    ];

    // Citizen-specific features
    const citizenFeatures = [
      {
        icon: <FiMapPin className="w-8 h-8" />,
        title: "GPS-Enabled Reporting",
        description: "Capture precise location automatically when filing complaints for faster resolution",
      },
      {
        icon: <FiClock className="w-8 h-8" />,
        title: "Real-Time Tracking",
        description: "Monitor your complaint status live with timeline updates and notifications",
      },
      {
        icon: <FiCheckCircle className="w-8 h-8" />,
        title: "Smart Categorization",
        description: "AI automatically classifies your complaint to route it to the right department",
      },
      {
        icon: <FiUsers className="w-8 h-8" />,
        title: "Community Dashboard",
        description: "View analytics and see how your reports contribute to community improvements",
      },
    ];

    // Admin-specific features
    const adminFeatures = [
      {
        icon: <FiClipboard className="w-8 h-8" />,
        title: "Department Management",
        description: "Handle complaints assigned to your department with streamlined workflows",
      },
      {
        icon: <FiTrendingUp className="w-8 h-8" />,
        title: "Performance Analytics",
        description: "Track resolution rates, response times, and department efficiency metrics",
      },
      {
        icon: <FiMapPin className="w-8 h-8" />,
        title: "Geospatial Insights",
        description: "Visualize complaint hotspots on maps to prioritize resource allocation",
      },
      {
        icon: <FiCheckCircle className="w-8 h-8" />,
        title: "AI-Assisted Routing",
        description: "Leverage ML classification to auto-assign complaints to appropriate teams",
      },
    ];

    // Chief Officer-specific features
    const chiefFeatures = [
      {
        icon: <FiTrendingUp className="w-8 h-8" />,
        title: "Strategic Analytics",
        description: "Access system-wide insights across all departments and complaint categories",
      },
      {
        icon: <FiUsers className="w-8 h-8" />,
        title: "Cross-Department Oversight",
        description: "Monitor and compare performance metrics across all municipal departments",
      },
      {
        icon: <FiMapPin className="w-8 h-8" />,
        title: "City-Wide Heatmaps",
        description: "Identify problem areas and resource needs with comprehensive geospatial data",
      },
      {
        icon: <FiBarChart2 className="w-8 h-8" />,
        title: "Executive Reports",
        description: "Generate detailed reports for stakeholders with actionable recommendations",
      },
    ];

    if (isChief) return { features: chiefFeatures, heading: "Chief Officer Tools", subtitle: "Strategic oversight and analytics for city-wide management" };
    if (isAdmin) return { features: adminFeatures, heading: "Admin Tools", subtitle: "Efficient complaint management for your department" };
    if (isCitizen) return { features: citizenFeatures, heading: "Citizen Features", subtitle: "Tools to report issues and track progress in your community" };
    return { features: generalFeatures, heading: "Why Choose GrievX?", subtitle: "Powerful features to make civic engagement simple and effective" };
  };

  const roleFeatureData = getRoleFeatures();

  // Role-specific FAQ
  const getRoleFAQs = () => {
    // Guest / General FAQs
    const generalFAQs = [
      {
        question: "What is GrievX?",
        answer: "GrievX is a Smart Civic System that enables citizens to report civic issues, track their resolution, and witness real change in their community through a transparent and efficient platform."
      },
      {
        question: "How do I report an issue?",
        answer: "Sign up for a free account, log in, and navigate to the Report Issue page. Fill in the complaint details, add photos if needed, and our AI will automatically categorize it for the right department."
      },
      {
        question: "Is my personal information secure?",
        answer: "Yes! We use industry-standard encryption and follow strict privacy policies. Your data is protected and only used for complaint resolution purposes."
      },
      {
        question: "How long does it take to resolve complaints?",
        answer: "Average resolution time is under 10 days, though it varies by complaint type and severity. You can track real-time status updates in your dashboard."
      },
      {
        question: "Can I track my complaint?",
        answer: "Absolutely! Once you submit a complaint, you can track its status in real-time through your dashboard with detailed timeline updates."
      },
      {
        question: "What types of issues can I report?",
        answer: "You can report various civic issues including potholes, streetlight problems, garbage collection, water supply issues, fallen trees, and more."
      }
    ];

    // Citizen-specific FAQs
    const citizenFAQs = [
      {
        question: "How do I file a complaint?",
        answer: "Go to 'Report Issue' from the Services menu, fill in the complaint details with location and photos. Our AI will automatically categorize it and route it to the appropriate department."
      },
      {
        question: "Why isn't my complaint being resolved?",
        answer: "Resolution times vary by issue type and severity. Check the status timeline in 'My Complaints' for updates. If it's urgent, contact the department directly via the support helpline."
      },
      {
        question: "Can I edit my complaint after submission?",
        answer: "You cannot edit a submitted complaint, but you can add comments or additional information through the complaint details page."
      },
      {
        question: "How accurate is the GPS location capture?",
        answer: "GPS location is highly accurate (within 10-15 meters). Make sure location services are enabled on your device for best results."
      },
      {
        question: "What happens if my complaint is rejected?",
        answer: "Rejected complaints include a reason from the department. You can review the rejection reason in your complaint details and file a new complaint if needed."
      },
      {
        question: "Can I report anonymously?",
        answer: "No, you need to be logged in to report issues for accountability and communication purposes. Your personal details remain private and secure."
      }
    ];

    // Admin-specific FAQs
    const adminFAQs = [
      {
        question: "How do I manage complaints assigned to my department?",
        answer: "Navigate to 'Manage' from the Services menu. You'll see all complaints assigned to your department. You can filter, search, update status, and add resolution comments."
      },
      {
        question: "What are the complaint status options?",
        answer: "Complaints can be marked as: Pending (initial state), In Progress (being worked on), Resolved (issue fixed), or Rejected (not actionable with reason)."
      },
      {
        question: "How does AI classification work?",
        answer: "Our ML model analyzes complaint text and images to automatically categorize issues. You can manually update the category if the AI misclassifies something."
      },
      {
        question: "Can I reassign complaints to other departments?",
        answer: "Currently, only Chief Officers can reassign complaints across departments. Contact your Chief Officer if a complaint needs reassignment."
      },
      {
        question: "How do I interpret the analytics dashboard?",
        answer: "Your dashboard shows department-specific metrics: total complaints, resolution rate, pending issues, and response time. Use filters to analyze trends by category or time period."
      },
      {
        question: "What should I do for urgent complaints?",
        answer: "Urgent complaints are flagged in the system. Prioritize these in your queue and update their status frequently to keep citizens informed."
      }
    ];

    // Chief Officer-specific FAQs
    const chiefFAQs = [
      {
        question: "How do I access cross-department analytics?",
        answer: "Your dashboard provides system-wide insights. Navigate to 'All Reports' to see comprehensive analytics across all departments with comparative metrics."
      },
      {
        question: "Can I see individual department performance?",
        answer: "Yes! Use the department filter in analytics to view specific department metrics including resolution rates, response times, and complaint volumes."
      },
      {
        question: "How do I reassign complaints between departments?",
        answer: "Access the complaint from 'Manage' view, click on the complaint details, and use the 'Reassign Department' option to move it to the correct department."
      },
      {
        question: "What reports can I generate?",
        answer: "You can export comprehensive reports including monthly summaries, department comparisons, category trends, and resolution time analytics in CSV or PDF format."
      },
      {
        question: "How do geospatial heatmaps work?",
        answer: "Heatmaps visualize complaint density across the city. Darker areas indicate higher complaint volumes, helping you identify problem zones for resource allocation."
      },
      {
        question: "Can I monitor admin activity?",
        answer: "Yes, the system tracks all admin actions including status updates, assignments, and resolutions. Access the activity log in the Reports section."
      }
    ];

    if (isChief) return { faqs: chiefFAQs, heading: "Chief Officer FAQ", subtitle: "Common questions about system oversight and management" };
    if (isAdmin) return { faqs: adminFAQs, heading: "Admin FAQ", subtitle: "Frequently asked questions for department administrators" };
    if (isCitizen) return { faqs: citizenFAQs, heading: "Citizen FAQ", subtitle: "Your questions about reporting and tracking complaints" };
    return { faqs: generalFAQs, heading: "Frequently Asked Questions", subtitle: "Everything you need to know about GrievX" };
  };

  const roleFAQData = getRoleFAQs();

  // Format numbers for display
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+';
    }
    return num.toString();
  };

  const displayStats = [
    { 
      number: loading ? '...' : formatNumber(stats.resolvedComplaints), 
      label: "Issues Resolved" 
    },
    { 
      number: loading ? '...' : formatNumber(stats.activeCitizens), 
      label: "Active Citizens" 
    },
    { 
      number: loading ? '...' : formatNumber(stats.totalComplaints), 
      label: "Total Complaints" 
    },
    { 
      number: loading ? '...' : `${stats.resolvedPercentage}%`, 
      label: "Resolution Rate" 
    },
  ];
  
  // Prepare chart data
  const statusDistributionData = [
    { name: 'Resolved', value: stats.resolvedComplaints, color: '#10b981' },
    { name: 'Rejected', value: stats.rejectedComplaints, color: '#ef4444' },
    { name: 'Pending', value: stats.pendingComplaints, color: '#f59e0b' },
  ];
  
  const timeDistributionData = [
    { name: 'Under 7 Days', value: stats.resolutionTimeDistribution?.under7Days || 0, color: '#10b981' },
    { name: '7-15 Days', value: stats.resolutionTimeDistribution?.from7To15Days || 0, color: '#3b82f6' },
    { name: 'Over 15 Days', value: stats.resolutionTimeDistribution?.moreThan15Days || 0, color: '#f59e0b' },
  ];
  
  const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  // Footer Links (Civic-appropriate)
  const footerLinks = {
    Services: [
      { name: "Report Issue", href: "/citizen/complaint" },
      { name: "Track Complaint", href: "/citizen/my-complaints" },
      { name: "View Analytics", href: "#", onClick: () => setActiveTab('analytics') },
    ],
    Resources: [
      { name: "Help Center", href: "#", onClick: () => window.dispatchEvent(new Event('openHelpChatbot')) },
      ...(isCitizen ? [
        { name: "How to Report", href: "#", onClick: () => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }) },
        // { name: "Track Your Complaint", href: "/citizen/track-status" },
      ] : (isAdmin ? [
        { name: "Managing Complaints", href: "/admin/manage" },
        { name: "Department Analytics", href: "/admin/reports" },
      ] : isChief ? [
        { name: "System Overview", href: "/admin/dashboard" },
        { name: "City-wide Analytics", href: "/admin/analytics" },
      ] : [
        { name: "Getting Started", href: "/register" },
      ])),
      { name: "FAQ", href: "#faq", onClick: () => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }) },
    ],
    Legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Use", href: "#" },
      { name: "Accessibility", href: "#" },
      { name: "RTI Information", href: "#" },
    ],
    Contact: [
      { name: "Municipal Office", href: "#" },
      { name: "Helpline", href: "tel:1800-XXX-XXXX" },
      { name: "Email Support", href: "mailto:support@grievx.gov" },
    ],
  };

  const socialLinks = [
    { icon: FiGithub, href: "https://www.github.com/alpha31032005", label: "GitHub" },
    { icon: FiLinkedin, href: "https://www.linkedin.com/in/nishant-bayaskar-ba1323262/", label: "LinkedIn" },
    { icon: FiMail, href: "mailto:sarikishor31032005@gmail.com", label: "Email" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">

      {/* ======================= HOME SECTION ======================= */}
      <section
        id="home"
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

            {/* CTA BUTTONS — Role-based */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideInUp">
              {!isAuthenticated ? (
                // Guest CTAs
                <>
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-white text-blue-700 font-bold rounded-lg hover:bg-gray-100 transition shadow-lg flex items-center gap-2 justify-center"
                  >
                    Get Started <FiArrowRight />
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 bg-white/20 text-white font-bold rounded-lg border border-white backdrop-blur-sm hover:bg-white/30 transition"
                  >
                    Login
                  </Link>
                </>
              ) : isCitizen ? (
                // Citizen CTAs
                <>
                  <Link
                    to="/citizen/complaint"
                    className="px-8 py-4 bg-white text-blue-700 font-bold rounded-lg hover:bg-gray-100 transition shadow-lg flex items-center gap-2 justify-center"
                  >
                    Report an Issue <FiArrowRight />
                  </Link>
                  <Link
                    to="/citizen/dashboard"
                    className="px-8 py-4 bg-white/20 text-white font-bold rounded-lg border border-white backdrop-blur-sm hover:bg-white/30 transition"
                  >
                    My Dashboard
                  </Link>
                </>
              ) : isChief ? (
                // Chief Officer CTAs
                <>
                  <Link
                    to="/admin/reports"
                    className="px-8 py-4 bg-white text-blue-700 font-bold rounded-lg hover:bg-gray-100 transition shadow-lg flex items-center gap-2 justify-center"
                  >
                    View Reports <FiArrowRight />
                  </Link>
                  <Link
                    to="/admin/dashboard"
                    className="px-8 py-4 bg-white/20 text-white font-bold rounded-lg border border-white backdrop-blur-sm hover:bg-white/30 transition"
                  >
                    System Dashboard
                  </Link>
                </>
              ) : isAdmin ? (
                // Admin CTAs
                <>
                  <Link
                    to="/admin/manage"
                    className="px-8 py-4 bg-white text-blue-700 font-bold rounded-lg hover:bg-gray-100 transition shadow-lg flex items-center gap-2 justify-center"
                  >
                    Manage Complaints <FiArrowRight />
                  </Link>
                  <Link
                    to="/admin/dashboard"
                    className="px-8 py-4 bg-white/20 text-white font-bold rounded-lg border border-white backdrop-blur-sm hover:bg-white/30 transition"
                  >
                    View Dashboard
                  </Link>
                </>
              ) : null}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 text-white animate-slideInUp">
              {displayStats.map((stat, idx) => (
                <div
                  key={idx}
                  className="hover:scale-110 transition cursor-pointer text-center"
                >
                  <p className="text-4xl font-bold">{stat.number}</p>
                  <p className="opacity-90">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Action to Analytics */}
            <div className="pt-6">
              <button
                onClick={() => setActiveTab('analytics')}
                className="px-8 py-3 bg-white/10 text-white font-semibold rounded-lg border border-white/30 backdrop-blur-sm hover:bg-white/20 transition flex items-center gap-2 mx-auto"
              >
                View Detailed Analytics <FiTrendingUp />
              </button>
            </div>
          </div>
        </section>

      {/* ======================= ANALYTICS SECTION ======================= */}
      <section id="analytics" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 scroll-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Real-Time Analytics Dashboard
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Track complaint resolution progress and community impact
              </p>
            </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 scroll-fade-in">
            {/* Total Complaints */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FiAlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : formatNumber(stats.totalComplaints)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Total Complaints</p>
            </div>

            {/* Resolved Complaints */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
                </div>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {loading ? '...' : `${stats.resolvedPercentage}%`}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : formatNumber(stats.resolvedComplaints)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Resolved</p>
            </div>

            {/* Rejected Complaints */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <FiXCircle className="w-6 h-6 text-red-600 dark:text-red-300" />
                </div>
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {loading ? '...' : `${stats.rejectedPercentage}%`}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : formatNumber(stats.rejectedComplaints)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Rejected</p>
            </div>

            {/* Pending Complaints */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <FiClock className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
                </div>
                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                  {loading ? '...' : `${stats.pendingPercentage}%`}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : formatNumber(stats.pendingComplaints)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Pending</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 scroll-fade-in">
            {/* Status Distribution Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Complaint Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Resolution Time Distribution Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Resolution Time Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="name" 
                    stroke={isDark ? '#9ca3af' : '#6b7280'}
                    angle={-15}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                      color: isDark ? '#f3f4f6' : '#111827'
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {timeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Full Width Charts */}
          <div className="grid grid-cols-1 gap-8">
            {/* Category Distribution Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Complaints by Category (Top 10)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.categoryDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="name" 
                    stroke={isDark ? '#9ca3af' : '#6b7280'}
                    angle={-30}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                      color: isDark ? '#f3f4f6' : '#111827'
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {(stats.categoryDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Trends Line Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Monthly Trends (Last 6 Months)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.monthlyTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="month" 
                    stroke={isDark ? '#9ca3af' : '#6b7280'}
                  />
                  <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                      color: isDark ? '#f3f4f6' : '#111827'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                    name="Resolved"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pending" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b' }}
                    name="Pending"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rejected" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ fill: '#ef4444' }}
                    name="Rejected"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        </section>

      {/* ======================= FEATURES SECTION ======================= */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 min-h-screen bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 scroll-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {roleFeatureData.heading}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {roleFeatureData.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 scroll-fade-in">
              {roleFeatureData.features.map((f, idx) => (
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

            {/* Additional Features Info */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 scroll-fade-in">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">24/7</div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold">Available</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Report issues anytime, anywhere</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">Fast</div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold">Response Time</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Average resolution under 10 days</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">Secure</div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold">Data Protection</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Your privacy is our priority</p>
              </div>
            </div>
          </div>
        </section>

      {/* ======================= ABOUT SECTION ======================= */}
      <div id="about" className="min-h-screen">
          {/* About Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
            <div className="max-w-4xl mx-auto text-center scroll-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
                About GrievX
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Smart Civic System (GrievX) is your trusted platform to report civic issues, 
                track their resolution, and witness real change in your community.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                We empower citizens to be active participants in community development by providing 
                a seamless, transparent, and efficient way to communicate with local authorities.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Join thousands of active citizens already making a difference in their neighborhoods.
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800 text-center scroll-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {isAuthenticated ? 'Continue Making a Difference' : 'Ready to Make a Difference?'}
            </h2>

            <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 mb-8">
              {isAuthenticated 
                ? 'Access your dashboard and manage civic issues efficiently.' 
                : 'Join thousands of citizens already improving their communities.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
                >
                  Get Started <FiArrowRight />
                </Link>
              ) : isCitizen ? (
                <Link
                  to="/citizen/complaint"
                  className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
                >
                  Report an Issue <FiArrowRight />
                </Link>
              ) : (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
                >
                  Go to Dashboard <FiArrowRight />
                </Link>
              )}
              <button
                onClick={() => setActiveTab('analytics')}
                className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition shadow-lg"
              >
                View Analytics <FiTrendingUp />
              </button>
            </div>
          </section>

          {/* Contact Info (Optional) */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Get in Touch</h3>
              <div className="flex flex-wrap justify-center gap-6">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-gray-700 dark:text-gray-300">{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </div>

      {/* ======================= FAQ SECTION ======================= */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 min-h-screen bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 scroll-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {roleFAQData.heading}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {roleFAQData.subtitle}
              </p>
            </div>

            <div className="space-y-4 scroll-fade-in">
              {roleFAQData.faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="group bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow"
                >
                  <summary className="flex justify-between items-center cursor-pointer px-6 py-5 font-semibold text-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <span>{faq.question}</span>
                    <span className="ml-4 flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-blue-600 dark:text-blue-400 transform group-open:rotate-180 transition-transform duration-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-5 pt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>

            {/* Additional Help CTA */}
            <div className="mt-16 text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Still have questions?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Can't find the answer you're looking for? Reach out to our support team.
              </p>
              <a
                href="mailto:sarikishor31032005@gmail.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
              >
                <FiMail className="w-5 h-5" />
                Contact Support
              </a>
            </div>
          </div>
        </section>

      {/* ======================= FOOTER (Always visible) ======================= */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white border-t border-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-12">

          {/* Brand + Social */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center text-xl">
                🏛️
              </div>
              <h3 className="text-2xl font-bold">GrievX</h3>
            </div>

            <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
              {socialLinks.map(({ icon: Icon, href, label }) => {
                const isEmail = href.startsWith('mailto:');

                return (
                  <a
                    key={label}
                    href={href}
                    target={isEmail ? undefined : '_blank'}
                    rel={isEmail ? undefined : 'noopener noreferrer'}
                    aria-label={label}
                    title={label}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-blue-600 transition"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{label}</span>
                  </a>
                );
              })}
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
                      {l.href.startsWith('/') ? (
                        <Link to={l.href} className="text-gray-400 hover:text-white transition">
                          {l.name}
                        </Link>
                      ) : l.onClick ? (
                        <button onClick={l.onClick} className="text-gray-400 hover:text-white transition text-left">
                          {l.name}
                        </button>
                      ) : (
                        <a href={l.href} className="text-gray-400 hover:text-white transition">
                          {l.name}
                        </a>
                      )}
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

      {/* Help Chatbot */}
      <HelpChatbot />
    </div>
  );
};

export default HomePage;
