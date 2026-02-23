import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Users,
  Shield,
  Zap,
  Globe,
  Star,
  ArrowRight,
  Check,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  Sparkles,
  Rocket,
  Lock,
  Heart,
  Camera,
  Mic,
  FileText,
  Image,
  Smile,
  Clock,
  Download,
  Award,
  ChevronDown,
  BarChart3,
  GitBranch,
  Building2,
  UserCog,
  Users2,
  Network,
  ShieldCheck,
  Fingerprint,
  Eye,
  EyeOff,
  Briefcase,
  LayoutDashboard,
  TrendingUp,
  PieChart,
  Target,
  MessageCircleCodeIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

// Features data with hierarchy focus
const features = [
  {
    icon: ShieldCheck,
    title: "Bank-Grade Security",
    description:
      "256-bit encryption, two-factor authentication, and complete data sovereignty from our Dubai data center.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: GitBranch,
    title: "Multi-Level Hierarchy",
    description:
      "Complete control with MASTER, ADMIN, BRANCH, and USER roles. Perfect for organizational structure.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: LayoutDashboard,
    title: "Advanced Analytics",
    description:
      "Real-time dashboards with message volume trends, user activity, and performance metrics.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Network,
    title: "Role-Based Access",
    description:
      "Granular permissions for each hierarchy level. MASTERs oversee, ADMINS manage, BRANCHes coordinate, USERS communicate.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: BarChart3,
    title: "Master Control Panel",
    description:
      "Complete oversight with user management, subordinate views, and system-wide analytics.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Users2,
    title: "Team Collaboration",
    description:
      "Secure messaging, file sharing, and group chats with complete hierarchy visibility.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
];

// Hierarchy showcase
const hierarchyLevels = [
  {
    role: "MASTER",
    icon: Award,
    description: "Full system oversight, user management, and analytics",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    capabilities: [
      "Create/Manage ADMINS",
      "View all analytics",
      "System configuration",
      "Global settings",
    ],
  },
  {
    role: "ADMIN",
    icon: UserCog,
    description: "Regional control and branch management",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    capabilities: [
      "Manage BRANCHES",
      "Regional analytics",
      "User oversight",
      "Content moderation",
    ],
  },
  {
    role: "BRANCH",
    icon: Building2,
    description: "Department or location coordination",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    capabilities: [
      "Team management",
      "Local analytics",
      "Customer communication",
      "File sharing",
    ],
  },
  {
    role: "USER",
    icon: Users,
    description: "Secure daily communication",
    color: "text-green-500",
    bg: "bg-green-500/10",
    capabilities: [
      "Instant messaging",
      "File transfer",
      "Group chats",
      "Status updates",
    ],
  },
];

// Stats data with Dubai emphasis
const stats = [
  { value: "99.99%", label: "Uptime SLA", icon: Zap },
  { value: "256-bit", label: "Encryption", icon: Lock },
  { value: "50ms", label: "Avg. Latency", icon: Globe },
  { value: "24/7", label: "Dubai Support", icon: Clock },
];

// Testimonials from regional businesses
const testimonials = [
  {
    name: "Ahmed Al Mansouri",
    role: "CEO, Dubai Tech Group",
    content:
      "The hierarchical control is exactly what we needed. MASTER view gives me complete oversight while my ADMINS manage daily operations seamlessly.",
    avatar: "AM",
    rating: 5,
    location: "Dubai, UAE",
  },
  {
    name: "Sarah Johnson",
    role: "Operations Director",
    content:
      "Having our data hosted in Dubai ensures compliance with local regulations. The branch management features transformed how our teams coordinate.",
    avatar: "SJ",
    rating: 5,
    location: "Abu Dhabi, UAE",
  },
  {
    name: "Rajiv Kumar",
    role: "IT Manager",
    content:
      "The analytics dashboard is incredibly detailed. We can track message volume, user activity, and system performance in real-time.",
    avatar: "RK",
    rating: 5,
    location: "Dubai, UAE",
  },
];

export const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Height of fixed navbar
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-text-main overflow-x-hidden">
      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-surface/90 backdrop-blur-xl border-b border-border shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Responsive */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold shrink-0">
                <MessageCircleCodeIcon size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-xl leading-tight">
                  Lineup24x7
                </span>
                <span className="text-[8px] sm:text-[10px] text-secondary -mt-1">
                  Secure Communication
                </span>
              </div>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-secondary hover:text-text-main transition-colors text-sm font-medium"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("hierarchy")}
                className="text-secondary hover:text-text-main transition-colors text-sm font-medium"
              >
                Hierarchy
              </button>
              <button
                onClick={() => scrollToSection("analytics")}
                className="text-secondary hover:text-text-main transition-colors text-sm font-medium"
              >
                Analytics
              </button>
              <button
                onClick={() => scrollToSection("security")}
                className="text-secondary hover:text-text-main transition-colors text-sm font-medium"
              >
                Security
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-secondary hover:text-text-main transition-colors text-sm font-medium"
              >
                Contact
              </button>
            </div>

            {/* Right Actions - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-secondary hover:text-text-main transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium shadow-lg shadow-primary/25 transition-all active:scale-95"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-surface-hover transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Fixed positioning */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-16 bg-surface z-40 md:hidden overflow-y-auto">
            <div className="px-4 py-6 space-y-4">
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("hierarchy")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Hierarchy
              </button>
              <button
                onClick={() => scrollToSection("analytics")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Analytics
              </button>
              <button
                onClick={() => scrollToSection("security")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Security
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Contact
              </button>

              <div className="pt-6 space-y-4">
                <Link
                  to="/login"
                  className="block w-full px-4 py-4 text-center bg-surface-hover rounded-xl text-lg font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-4 py-4 text-center bg-primary text-white rounded-xl text-lg font-medium"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content - Add padding for fixed navbar */}
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-12 sm:py-20 px-4 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(var(--color-pattern), 0.1) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          ></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-6 sm:mb-8">
                <ShieldCheck
                  size={14}
                  className="sm:w-4 sm:h-4 text-emerald-500"
                />
                <span className="text-xs sm:text-sm font-medium">
                  Dubai, UAE • Enterprise Security
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 tracking-tight px-2">
                <span className="bg-linear-to-r from-primary to-emerald-600 bg-clip-text text-transparent block sm:inline">
                  Secure Communication
                </span>
                <br className="hidden sm:block" />
                <span className="block sm:inline">
                  with Complete Hierarchy Control
                </span>
              </h1>

              <p className="text-base sm:text-xl text-secondary mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
                Lineup24x7 provides bank-grade security and multi-level
                hierarchy management for organizations in Dubai and beyond.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary hover:bg-primary/90 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Start Secure Trial
                  <Rocket size={18} className="sm:w-5 sm:h-5" />
                </Link>
                <button
                  onClick={() => scrollToSection("hierarchy")}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-surface hover:bg-surface-hover border border-border rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  View Hierarchy
                  <ChevronDown size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Trust Badges - Responsive grid */}
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap justify-center gap-4 sm:gap-8 mt-8 sm:mt-12 px-4">
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-secondary">
                  <ShieldCheck
                    size={14}
                    className="sm:w-4 sm:h-4 text-emerald-500"
                  />
                  <span>Dubai Data Center</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-secondary">
                  <Lock size={14} className="sm:w-4 sm:h-4 text-emerald-500" />
                  <span>256-bit Encryption</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-secondary">
                  <Fingerprint
                    size={14}
                    className="sm:w-4 sm:h-4 text-emerald-500"
                  />
                  <span>2FA Authentication</span>
                </div>
              </div>

              {/* Stats - Responsive grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mt-12 sm:mt-16 px-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2">
                      <div className="p-2 sm:p-3 rounded-xl bg-surface-hover border border-border">
                        <stat.icon
                          size={18}
                          className="sm:w-6 sm:h-6 text-primary"
                        />
                      </div>
                    </div>
                    <div className="text-lg sm:text-2xl font-black">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-secondary">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Hierarchy Section */}
        <section id="hierarchy" className="py-16 sm:py-20 px-4 bg-surface/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 px-2">
                Complete
                <span className="text-primary block sm:inline">
                  {" "}
                  Hierarchy Control
                </span>
              </h2>
              <p className="text-base sm:text-xl text-secondary max-w-2xl mx-auto px-4">
                MASTER, ADMIN, BRANCH, USER - each level with precise
                permissions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-2">
              {hierarchyLevels.map((level, index) => (
                <div
                  key={index}
                  className="bg-surface border border-border rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:shadow-lg transition-all hover:-translate-y-1 group"
                >
                  <div
                    className={`p-2 sm:p-3 rounded-xl ${level.bg} ${level.color} w-fit mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <level.icon size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">
                    {level.role}
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary mb-3 sm:mb-4">
                    {level.description}
                  </p>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {level.capabilities.map((cap, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-secondary"
                      >
                        <Check
                          size={10}
                          className="sm:w-3 sm:h-3 text-primary shrink-0 mt-0.5"
                        />
                        <span className="leading-tight">{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Hierarchy Visual - Responsive */}
            <div className="mt-12 sm:mt-16 p-4 sm:p-8 bg-linear-to-r from-primary/5 to-purple-600/5 rounded-xl sm:rounded-2xl border border-primary/20 mx-2">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs sm:text-sm">MASTER</span>
                </div>
                <ChevronRight
                  size={14}
                  className="sm:w-4 sm:h-4 text-secondary rotate-90 sm:rotate-0"
                />
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs sm:text-sm">ADMIN</span>
                </div>
                <ChevronRight
                  size={14}
                  className="sm:w-4 sm:h-4 text-secondary rotate-90 sm:rotate-0"
                />
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-500"></div>
                  <span className="text-xs sm:text-sm">BRANCH</span>
                </div>
                <ChevronRight
                  size={14}
                  className="sm:w-4 sm:h-4 text-secondary rotate-90 sm:rotate-0"
                />
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs sm:text-sm">USER</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Showcase */}
        <section id="analytics" className="py-16 sm:py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="px-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 rounded-full border border-primary/20 mb-4 sm:mb-6">
                  <BarChart3 size={14} className="sm:w-4 sm:h-4 text-primary" />
                  <span className="text-xs sm:text-sm font-medium">
                    Real-time Analytics
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6">
                  Complete
                  <span className="text-primary block sm:inline">
                    {" "}
                    Control Panel
                  </span>
                </h2>
                <p className="text-sm sm:text-lg text-secondary mb-6 sm:mb-8">
                  Every hierarchy level gets the analytics they need:
                </p>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
                      <TrendingUp size={18} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base mb-1">
                        MASTER Dashboard
                      </h3>
                      <p className="text-xs sm:text-sm text-secondary">
                        Complete system overview, user growth, message volume
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                      <PieChart size={18} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base mb-1">
                        ADMIN Analytics
                      </h3>
                      <p className="text-xs sm:text-sm text-secondary">
                        Regional performance, branch activity, user engagement
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-xl bg-orange-500/10 text-orange-500 shrink-0">
                      <Target size={18} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base mb-1">
                        BRANCH Insights
                      </h3>
                      <p className="text-xs sm:text-sm text-secondary">
                        Team productivity, response times, communication
                        patterns
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-surface border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl mx-2">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-500"></div>
                    <span className="text-xs sm:text-sm font-bold">
                      MASTER View
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-secondary">
                    Last 24 hours
                  </div>
                </div>
                <div className="h-32 sm:h-48 w-full relative mb-4">
                  <svg
                    viewBox="0 0 100 40"
                    className="w-full h-full"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="chartGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="var(--color-primary)"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--color-primary)"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,40 L5,35 L10,38 L15,30 L20,25 L25,28 L30,20 L35,22 L40,15 L45,18 L50,10 L55,12 L60,5 L65,8 L70,10 L75,6 L80,8 L85,4 L90,3 L95,2 L100,0 L100,40 Z"
                      fill="url(#chartGradient)"
                    />
                    <path
                      d="M0,40 L5,35 L10,38 L15,30 L20,25 L25,28 L30,20 L35,22 L40,15 L45,18 L50,10 L55,12 L60,5 L65,8 L70,10 L75,6 L80,8 L85,4 L90,3 L95,2 L100,0"
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="0.5"
                    />
                  </svg>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-lg bg-surface-hover">
                    <div className="text-lg sm:text-2xl font-bold">12.5k</div>
                    <div className="text-[10px] sm:text-xs text-secondary">
                      Messages Today
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-surface-hover">
                    <div className="text-lg sm:text-2xl font-bold">156</div>
                    <div className="text-[10px] sm:text-xs text-secondary">
                      Active Users
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="py-16 sm:py-20 px-4 bg-surface/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-4 sm:mb-6">
                <ShieldCheck
                  size={14}
                  className="sm:w-4 sm:h-4 text-emerald-500"
                />
                <span className="text-xs sm:text-sm font-medium">
                  Dubai Data Sovereignty
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
                Enterprise-Grade
                <span className="text-emerald-500 block sm:inline">
                  {" "}
                  Security
                </span>
              </h2>
              <p className="text-base sm:text-xl text-secondary max-w-2xl mx-auto px-4">
                Your data remains in Dubai, protected by the highest security
                standards.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 px-2">
              <div className="bg-surface border border-border rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="p-3 sm:p-4 rounded-2xl bg-emerald-500/10 text-emerald-500">
                    <Lock size={24} className="sm:w-8 sm:h-8" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">
                  256-bit Encryption
                </h3>
                <p className="text-xs sm:text-sm text-secondary">
                  Military-grade encryption for all messages
                </p>
              </div>
              <div className="bg-surface border border-border rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="p-3 sm:p-4 rounded-2xl bg-emerald-500/10 text-emerald-500">
                    <Fingerprint size={24} className="sm:w-8 sm:h-8" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">
                  2FA Authentication
                </h3>
                <p className="text-xs sm:text-sm text-secondary">
                  Multi-factor authentication for all accounts
                </p>
              </div>
              <div className="bg-surface border border-border rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center sm:col-span-2 lg:col-span-1">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="p-3 sm:p-4 rounded-2xl bg-emerald-500/10 text-emerald-500">
                    <Globe size={24} className="sm:w-8 sm:h-8" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">
                  Dubai Data Center
                </h3>
                <p className="text-xs sm:text-sm text-secondary">
                  Data residency in UAE with full compliance
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 sm:py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
                Trusted by
                <span className="text-primary block sm:inline">
                  {" "}
                  UAE Businesses
                </span>
              </h2>
              <p className="text-base sm:text-xl text-secondary max-w-2xl mx-auto px-4">
                Join organizations across Dubai that rely on Lineup24x7.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 px-2">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-surface border border-border rounded-xl sm:rounded-2xl p-5 sm:p-8 hover:shadow-lg transition-all"
                >
                  <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className="sm:w-4 sm:h-4 fill-yellow-500 text-yellow-500"
                      />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-secondary mb-4 sm:mb-6">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm sm:text-base">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-sm sm:text-base">
                        {testimonial.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-secondary">
                        {testimonial.role}
                      </p>
                      <p className="text-[10px] sm:text-xs text-primary">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-linear-to-br from-primary/20 to-emerald-600/20 rounded-xl sm:rounded-3xl p-6 sm:p-12 border border-primary/30 mx-2">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4">
                Ready to secure your communication?
              </h2>
              <p className="text-sm sm:text-xl text-secondary mb-6 sm:mb-8 px-2">
                Join Dubai's most secure communication platform.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary hover:bg-primary/90 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg shadow-lg shadow-primary/25 transition-all active:scale-95"
              >
                Start Free Trial
                <Rocket size={16} className="sm:w-5 sm:h-5" />
              </Link>
              <p className="text-xs sm:text-sm text-secondary mt-3 sm:mt-4">
                No credit card required • Dubai data residency
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          id="contact"
          className="bg-surface border-t border-border py-12 sm:py-16 px-4"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-8 mb-8 sm:mb-12">
              {/* Company Info */}
              <div className="col-span-1 lg:col-span-2">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold shrink-0">
                    <MessageCircleCodeIcon size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-base sm:text-xl leading-tight">
                      Lineup24x7
                    </span>
                    <span className="text-[8px] sm:text-[10px] text-secondary -mt-1">
                      Secure Communication Solutions
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-secondary mb-3 sm:mb-4 max-w-md">
                  Enterprise-grade communication platform with complete
                  hierarchy control, hosted in Dubai, UAE.
                </p>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-secondary">
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={14}
                      className="shrink-0 mt-0.5 text-primary"
                    />
                    <span>
                      Office 2405, Tiffany Tower, Cluster W, JLT, Dubai, UAE
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-primary" />
                    <span>contact@lineup24x7.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-primary" />
                    <span>+971 4 123 4567</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">
                  Product
                </h4>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => scrollToSection("features")}
                      className="text-xs sm:text-sm text-secondary hover:text-primary transition-colors"
                    >
                      Features
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("hierarchy")}
                      className="text-xs sm:text-sm text-secondary hover:text-primary transition-colors"
                    >
                      Hierarchy
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("analytics")}
                      className="text-xs sm:text-sm text-secondary hover:text-primary transition-colors"
                    >
                      Analytics
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("security")}
                      className="text-xs sm:text-sm text-secondary hover:text-primary transition-colors"
                    >
                      Security
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">
                  Legal
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/privacy"
                      className="text-xs sm:text-sm text-secondary hover:text-primary transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/terms"
                      className="text-xs sm:text-sm text-secondary hover:text-primary transition-colors"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/data-processing"
                      className="text-xs sm:text-sm text-secondary hover:text-primary transition-colors"
                    >
                      Data Processing
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/compliance"
                      className="text-xs sm:text-sm text-secondary hover:text-primary transition-colors"
                    >
                      UAE Compliance
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-border pt-6 sm:pt-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                <p className="text-[10px] sm:text-xs text-secondary text-center sm:text-left">
                  © {new Date().getFullYear()} Lineup24x7. All rights reserved.
                  A company registered in Dubai, United Arab Emirates.
                </p>
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-[8px] sm:text-xs text-secondary">
                    License #: DED-1234567
                  </span>
                  <span className="text-[8px] sm:text-xs text-secondary">
                    VAT: AE123456789
                  </span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
