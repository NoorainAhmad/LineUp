import React, { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  FileText,
  Download,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Users,
  Server,
  Database,
  Fingerprint,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Award,
  Scale,
  Gavel,
  Cookie,
  Settings,
  Bell,
  UserCheck,
  UserX,
  RefreshCw,
  ArrowLeft,
  Menu,
  Moon,
  Sun,
  Sparkles,
  Rocket,
  MessageSquare,
  BarChart3,
  MessageCircleCodeIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface PrivacyProps {
  onBack?: () => void;
}

export const Privacy: React.FC<PrivacyProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("introduction");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    dataCollection: true,
    dataUsage: false,
    dataSecurity: false,
    dataSharing: false,
    userRights: false,
    cookies: false,
    children: false,
    changes: false,
    contact: false,
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Update active section based on scroll position
      const sections = document.querySelectorAll("section[id]");
      const scrollPosition = window.scrollY + 100;

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).clientHeight;
        const sectionId = section.getAttribute("id") || "";

        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          setActiveSection(sectionId);
        }
      });
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

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
    setMobileMenuOpen(false);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/");
    }
  };

  const lastUpdated = "February 23, 2026";

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
            {/* Logo */}
            <div className="flex items-center gap-2">
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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => scrollToSection("introduction")}
                className={`text-sm font-medium transition-colors ${
                  activeSection === "introduction"
                    ? "text-primary"
                    : "text-secondary hover:text-text-main"
                }`}
              >
                Introduction
              </button>
              <button
                onClick={() => scrollToSection("data-collection")}
                className={`text-sm font-medium transition-colors ${
                  activeSection === "data-collection"
                    ? "text-primary"
                    : "text-secondary hover:text-text-main"
                }`}
              >
                Data Collection
              </button>
              <button
                onClick={() => scrollToSection("data-usage")}
                className={`text-sm font-medium transition-colors ${
                  activeSection === "data-usage"
                    ? "text-primary"
                    : "text-secondary hover:text-text-main"
                }`}
              >
                Data Usage
              </button>
              <button
                onClick={() => scrollToSection("data-security")}
                className={`text-sm font-medium transition-colors ${
                  activeSection === "data-security"
                    ? "text-primary"
                    : "text-secondary hover:text-text-main"
                }`}
              >
                Security
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className={`text-sm font-medium transition-colors ${
                  activeSection === "contact"
                    ? "text-primary"
                    : "text-secondary hover:text-text-main"
                }`}
              >
                Contact
              </button>
            </div>

            {/* Right Actions */}
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-16 bg-surface z-40 md:hidden overflow-y-auto">
            <div className="px-4 py-6 space-y-4">
              <button
                onClick={() => scrollToSection("introduction")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Introduction
              </button>
              <button
                onClick={() => scrollToSection("data-collection")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Data Collection
              </button>
              <button
                onClick={() => scrollToSection("data-usage")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Data Usage
              </button>
              <button
                onClick={() => scrollToSection("data-security")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Security
              </button>
              <button
                onClick={() => scrollToSection("user-rights")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Your Rights
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

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 px-4 relative overflow-hidden bg-linear-to-br from-primary/5 to-purple-600/5">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(var(--color-pattern), 0.1) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          ></div>

          <div className="max-w-4xl mx-auto relative z-10">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-6 group"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="text-sm">Back to Home</span>
            </button>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-6">
                <Shield size={16} className="text-primary" />
                <span className="text-sm font-medium">Privacy Policy</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight">
                Your Privacy
                <span className="text-primary block sm:inline"> Matters</span>
              </h1>

              <p className="text-lg sm:text-xl text-secondary max-w-2xl mx-auto">
                At Lineup24x7, we take your data privacy seriously. Learn how we
                protect and handle your information in compliance with UAE laws.
              </p>

              <div className="flex items-center justify-center gap-4 mt-8 text-sm text-secondary">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  <span>Last Updated: {lastUpdated}</span>
                </div>
                <div className="w-px h-4 bg-border"></div>
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-primary" />
                  <span>Dubai, UAE</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 sm:py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-surface border border-border rounded-xl p-4">
                  <h4 className="font-bold text-sm mb-3 px-2">On this page</h4>
                  <ul className="space-y-1">
                    <li>
                      <button
                        onClick={() => scrollToSection("introduction")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "introduction"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Introduction
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("data-collection")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "data-collection"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Data Collection
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("data-usage")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "data-usage"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Data Usage
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("data-security")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "data-security"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Security
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("data-sharing")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "data-sharing"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Data Sharing
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("user-rights")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "user-rights"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Your Rights
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("cookies")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "cookies"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Cookies
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("children")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "children"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Children's Privacy
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("changes")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "changes"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Policy Changes
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("contact")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "contact"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Contact Us
                      </button>
                    </li>
                  </ul>

                  <div className="mt-6 pt-4 border-t border-border">
                    <Link
                      to="/terms"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors text-sm"
                    >
                      <span className="text-secondary">Terms of Service</span>
                      <ChevronRight size={14} className="text-secondary" />
                    </Link>
                    <Link
                      to="/data-processing"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors text-sm"
                    >
                      <span className="text-secondary">Data Processing</span>
                      <ChevronRight size={14} className="text-secondary" />
                    </Link>
                    <Link
                      to="/compliance"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors text-sm"
                    >
                      <span className="text-secondary">UAE Compliance</span>
                      <ChevronRight size={14} className="text-secondary" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3 space-y-8">
                {/* Introduction */}
                <section
                  id="introduction"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <BookOpen size={24} className="text-primary" />
                    Introduction
                  </h2>
                  <div className="space-y-4 text-secondary">
                    <p>
                      Welcome to Lineup24x7 ("we," "our," or "us"). We are
                      committed to protecting your privacy and ensuring the
                      security of your personal information. This Privacy Policy
                      explains how we collect, use, disclose, and safeguard your
                      information when you use our communication platform,
                      website, and services (collectively, the "Services").
                    </p>
                    <p>
                      Lineup24x7 is operated by a company registered in Dubai,
                      United Arab Emirates. By accessing or using our Services,
                      you acknowledge that you have read, understood, and agree
                      to be bound by this Privacy Policy. If you do not agree
                      with our policies and practices, please do not use our
                      Services.
                    </p>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                      <p className="text-sm font-medium flex items-start gap-2">
                        <AlertCircle
                          size={18}
                          className="text-primary shrink-0 mt-0.5"
                        />
                        <span>
                          <strong>Data Controller:</strong> Lineup24x7, Office
                          2405, Tiffany Tower, Cluster W, JLT, Dubai, UAE.
                          Email: privacy@lineup24x7.ae
                        </span>
                      </p>
                    </div>
                  </div>
                </section>

                {/* Data Collection */}
                <section
                  id="data-collection"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Database size={24} className="text-primary" />
                      Information We Collect
                    </h2>
                    <button
                      onClick={() => toggleSection("dataCollection")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.dataCollection ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.dataCollection && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                          <UserCheck size={16} className="text-primary" />
                          Personal Information
                        </h3>
                        <ul className="space-y-2 text-secondary">
                          <li className="flex items-start gap-2">
                            <Check
                              size={16}
                              className="text-green-500 shrink-0 mt-1"
                            />
                            <span>
                              <strong>Account Information:</strong> Name, email
                              address, phone number, and password when you
                              register.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check
                              size={16}
                              className="text-green-500 shrink-0 mt-1"
                            />
                            <span>
                              <strong>Profile Information:</strong> Avatar,
                              location, status, and other profile details you
                              choose to add.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check
                              size={16}
                              className="text-green-500 shrink-0 mt-1"
                            />
                            <span>
                              <strong>Contact Information:</strong> Your
                              contacts list if you choose to sync it (with
                              permission).
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                          <MessageSquare size={16} className="text-primary" />
                          Communication Data
                        </h3>
                        <ul className="space-y-2 text-secondary">
                          <li className="flex items-start gap-2">
                            <Check
                              size={16}
                              className="text-green-500 shrink-0 mt-1"
                            />
                            <span>
                              <strong>Messages:</strong> Text, images, files,
                              and voice messages you send and receive.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check
                              size={16}
                              className="text-green-500 shrink-0 mt-1"
                            />
                            <span>
                              <strong>Metadata:</strong> Timestamps, read
                              receipts, delivery status, and interaction data.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check
                              size={16}
                              className="text-green-500 shrink-0 mt-1"
                            />
                            <span>
                              <strong>Status Updates:</strong> Content you post
                              as status updates, including expiration.
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                          <Server size={16} className="text-primary" />
                          Technical Data
                        </h3>
                        <ul className="space-y-2 text-secondary">
                          <li className="flex items-start gap-2">
                            <Check
                              size={16}
                              className="text-green-500 shrink-0 mt-1"
                            />
                            <span>
                              <strong>Device Information:</strong> IP address,
                              browser type, operating system, device
                              identifiers.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check
                              size={16}
                              className="text-green-500 shrink-0 mt-1"
                            />
                            <span>
                              <strong>Usage Data:</strong> Pages visited,
                              features used, time spent, and navigation paths.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check
                              size={16}
                              className="text-green-500 shrink-0 mt-1"
                            />
                            <span>
                              <strong>Log Data:</strong> Error reports,
                              performance data, and system activity logs.
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                        <p className="text-sm flex items-start gap-2">
                          <AlertCircle
                            size={18}
                            className="text-amber-500 shrink-0 mt-0.5"
                          />
                          <span>
                            <strong>Note:</strong> We do not collect or store
                            message content beyond what is necessary for the
                            functionality of our Services. End-to-end encryption
                            ensures that your messages remain private.
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Data Usage */}
                <section
                  id="data-usage"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Settings size={24} className="text-primary" />
                      How We Use Your Information
                    </h2>
                    <button
                      onClick={() => toggleSection("dataUsage")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.dataUsage ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.dataUsage && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        We use the information we collect for the following
                        purposes:
                      </p>
                      <div className="grid gap-4">
                        <div className="flex items-start gap-3 p-3 bg-surface-hover/30 rounded-lg">
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                            <MessageSquare size={18} />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">
                              To Provide and Maintain Our Services
                            </h4>
                            <p className="text-sm text-secondary">
                              Deliver messages, process communications, and
                              ensure platform functionality.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-surface-hover/30 rounded-lg">
                          <div className="p-2 rounded-lg bg-green-500/10 text-green-500 shrink-0">
                            <Shield size={18} />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">
                              For Security and Fraud Prevention
                            </h4>
                            <p className="text-sm text-secondary">
                              Monitor for suspicious activity, protect against
                              unauthorized access.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-surface-hover/30 rounded-lg">
                          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
                            <BarChart3 size={18} />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">
                              To Improve Our Services
                            </h4>
                            <p className="text-sm text-secondary">
                              Analyze usage patterns, develop new features,
                              enhance user experience.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-surface-hover/30 rounded-lg">
                          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 shrink-0">
                            <Bell size={18} />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">
                              To Communicate With You
                            </h4>
                            <p className="text-sm text-secondary">
                              Send updates, security alerts, and support
                              messages.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Data Security */}
                <section
                  id="data-security"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <ShieldCheck size={24} className="text-primary" />
                      Data Security
                    </h2>
                    <button
                      onClick={() => toggleSection("dataSecurity")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.dataSecurity ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.dataSecurity && (
                    <div className="space-y-6">
                      <p className="text-secondary">
                        We implement comprehensive security measures to protect
                        your information:
                      </p>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="border border-border rounded-lg p-4">
                          <Lock size={24} className="text-primary mb-3" />
                          <h4 className="font-bold mb-2">Encryption</h4>
                          <p className="text-sm text-secondary">
                            256-bit encryption for all data in transit and at
                            rest.
                          </p>
                        </div>
                        <div className="border border-border rounded-lg p-4">
                          <Fingerprint
                            size={24}
                            className="text-primary mb-3"
                          />
                          <h4 className="font-bold mb-2">2FA Authentication</h4>
                          <p className="text-sm text-secondary">
                            Multi-factor authentication for account security.
                          </p>
                        </div>
                        <div className="border border-border rounded-lg p-4">
                          <Server size={24} className="text-primary mb-3" />
                          <h4 className="font-bold mb-2">Dubai Data Center</h4>
                          <p className="text-sm text-secondary">
                            All data stored in UAE with strict access controls.
                          </p>
                        </div>
                        <div className="border border-border rounded-lg p-4">
                          <RefreshCw size={24} className="text-primary mb-3" />
                          <h4 className="font-bold mb-2">Regular Audits</h4>
                          <p className="text-sm text-secondary">
                            Continuous security monitoring and penetration
                            testing.
                          </p>
                        </div>
                      </div>

                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                        <p className="text-sm flex items-start gap-2">
                          <Check
                            size={18}
                            className="text-emerald-500 shrink-0 mt-0.5"
                          />
                          <span>
                            <strong>UAE Compliance:</strong> Our security
                            practices comply with UAE data protection laws and
                            international standards (ISO 27001).
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Data Sharing */}
                <section
                  id="data-sharing"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Users size={24} className="text-primary" />
                      Data Sharing and Disclosure
                    </h2>
                    <button
                      onClick={() => toggleSection("dataSharing")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.dataSharing ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.dataSharing && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        We may share your information in the following
                        circumstances:
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <Check
                            size={16}
                            className="text-green-500 shrink-0 mt-1"
                          />
                          <span className="text-sm">
                            <strong>With Your Consent:</strong> When you
                            explicitly agree to share information.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check
                            size={16}
                            className="text-green-500 shrink-0 mt-1"
                          />
                          <span className="text-sm">
                            <strong>Service Providers:</strong> Trusted third
                            parties who assist in operating our services (under
                            strict confidentiality agreements).
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check
                            size={16}
                            className="text-green-500 shrink-0 mt-1"
                          />
                          <span className="text-sm">
                            <strong>Legal Requirements:</strong> When required
                            by UAE law or to protect our rights.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check
                            size={16}
                            className="text-green-500 shrink-0 mt-1"
                          />
                          <span className="text-sm">
                            <strong>Business Transfers:</strong> In connection
                            with a merger, acquisition, or sale of assets.
                          </span>
                        </li>
                      </ul>
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-4">
                        <p className="text-sm flex items-start gap-2">
                          <X
                            size={18}
                            className="text-red-500 shrink-0 mt-0.5"
                          />
                          <span>
                            <strong>We Do Not Sell Your Data:</strong> We never
                            sell your personal information to third parties for
                            marketing purposes.
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Your Rights */}
                <section
                  id="user-rights"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <UserCheck size={24} className="text-primary" />
                      Your Rights
                    </h2>
                    <button
                      onClick={() => toggleSection("userRights")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.userRights ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.userRights && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        You have the following rights regarding your data:
                      </p>
                      <div className="grid gap-3">
                        <div className="flex items-start gap-2">
                          <Check
                            size={16}
                            className="text-primary shrink-0 mt-1"
                          />
                          <span>
                            <strong>Access:</strong> Request a copy of your
                            personal data.
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check
                            size={16}
                            className="text-primary shrink-0 mt-1"
                          />
                          <span>
                            <strong>Correction:</strong> Update inaccurate or
                            incomplete information.
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check
                            size={16}
                            className="text-primary shrink-0 mt-1"
                          />
                          <span>
                            <strong>Deletion:</strong> Request deletion of your
                            data ("right to be forgotten").
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check
                            size={16}
                            className="text-primary shrink-0 mt-1"
                          />
                          <span>
                            <strong>Portability:</strong> Receive your data in a
                            structured, commonly used format.
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check
                            size={16}
                            className="text-primary shrink-0 mt-1"
                          />
                          <span>
                            <strong>Restriction:</strong> Limit how we process
                            your data.
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check
                            size={16}
                            className="text-primary shrink-0 mt-1"
                          />
                          <span>
                            <strong>Objection:</strong> Object to certain types
                            of processing.
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-secondary mt-4">
                        To exercise any of these rights, please contact us at
                        privacy@lineup24x7.ae. We will respond within 30 days as
                        required by UAE law.
                      </p>
                    </div>
                  )}
                </section>

                {/* Cookies */}
                <section
                  id="cookies"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Cookie size={24} className="text-primary" />
                      Cookies and Tracking
                    </h2>
                    <button
                      onClick={() => toggleSection("cookies")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.cookies ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.cookies && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        We use cookies and similar technologies to enhance your
                        experience:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-secondary">
                        <li>
                          <strong>Essential Cookies:</strong> Required for
                          platform functionality.
                        </li>
                        <li>
                          <strong>Preference Cookies:</strong> Remember your
                          settings and preferences.
                        </li>
                        <li>
                          <strong>Analytics Cookies:</strong> Help us understand
                          how you use our services.
                        </li>
                      </ul>
                      <p className="text-sm">
                        You can control cookies through your browser settings.
                        Disabling certain cookies may affect platform
                        functionality.
                      </p>
                    </div>
                  )}
                </section>

                {/* Children's Privacy */}
                <section
                  id="children"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <UserX size={24} className="text-primary" />
                      Children's Privacy
                    </h2>
                    <button
                      onClick={() => toggleSection("children")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.children ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.children && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        Our Services are not intended for individuals under the
                        age of 18. We do not knowingly collect personal
                        information from children. If you become aware that a
                        child has provided us with personal information, please
                        contact us immediately.
                      </p>
                    </div>
                  )}
                </section>

                {/* Policy Changes */}
                <section
                  id="changes"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <RefreshCw size={24} className="text-primary" />
                      Changes to This Policy
                    </h2>
                    <button
                      onClick={() => toggleSection("changes")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.changes ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.changes && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        We may update this Privacy Policy from time to time. We
                        will notify you of any changes by posting the new policy
                        on this page with an updated effective date. For
                        significant changes, we will provide additional notice
                        (such as an in-app notification).
                      </p>
                      <p className="text-sm text-secondary">
                        Last updated: {lastUpdated}
                      </p>
                    </div>
                  )}
                </section>

                {/* Contact Us */}
                <section
                  id="contact"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Mail size={24} className="text-primary" />
                    Contact Us
                  </h2>

                  <div className="space-y-6">
                    <p className="text-secondary">
                      If you have questions or concerns about this Privacy
                      Policy or our data practices, please contact us:
                    </p>

                    <div className="grid gap-4">
                      <div className="flex items-start gap-3 p-4 bg-surface-hover/30 rounded-lg">
                        <Mail
                          size={20}
                          className="text-primary shrink-0 mt-1"
                        />
                        <div>
                          <h4 className="font-bold mb-1">Email</h4>
                          <p className="text-sm text-secondary">
                            privacy@lineup24x7.ae
                          </p>
                          <p className="text-sm text-secondary">
                            dpo@lineup24x7.ae (Data Protection Officer)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-surface-hover/30 rounded-lg">
                        <Phone
                          size={20}
                          className="text-primary shrink-0 mt-1"
                        />
                        <div>
                          <h4 className="font-bold mb-1">Phone</h4>
                          <p className="text-sm text-secondary">
                            +971 4 123 4567
                          </p>
                          <p className="text-sm text-secondary">
                            Sun-Thu, 9:00 AM - 6:00 PM (GST)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-surface-hover/30 rounded-lg">
                        <MapPin
                          size={20}
                          className="text-primary shrink-0 mt-1"
                        />
                        <div>
                          <h4 className="font-bold mb-1">Address</h4>
                          <p className="text-sm text-secondary">
                            Office 2405, Tiffany Tower
                          </p>
                          <p className="text-sm text-secondary">
                            Cluster W, Jumeirah Lakes Towers
                          </p>
                          <p className="text-sm text-secondary">
                            Dubai, United Arab Emirates
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <p className="text-sm flex items-start gap-2">
                        <Award
                          size={18}
                          className="text-primary shrink-0 mt-0.5"
                        />
                        <span>
                          <strong>Data Protection Officer:</strong> We have
                          appointed a Data Protection Officer who oversees our
                          compliance with data protection laws. You can reach
                          our DPO at dpo@lineup24x7.ae.
                        </span>
                      </p>
                    </div>
                  </div>
                </section>

                {/* Download Policy */}
                <div className="flex justify-center pt-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-surface border border-border rounded-xl hover:bg-surface-hover transition-colors text-sm font-medium">
                    <Download size={18} />
                    Download Privacy Policy (PDF)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-linear-to-br from-primary/5 to-purple-600/5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Ready to Communicate Securely?
            </h2>
            <p className="text-lg text-secondary mb-8">
              Join thousands of businesses trusting Lineup24x7 for secure
              communication.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/25 transition-all active:scale-95"
            >
              Start Free Trial
              <Rocket size={20} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
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
              <p className="text-sm text-secondary max-w-md">
                Enterprise-grade communication platform with complete hierarchy
                control, hosted in Dubai, UAE.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/privacy"
                    className="text-sm text-secondary hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-sm text-secondary hover:text-primary transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/data-processing"
                    className="text-sm text-secondary hover:text-primary transition-colors"
                  >
                    Data Processing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/compliance"
                    className="text-sm text-secondary hover:text-primary transition-colors"
                  >
                    UAE Compliance
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/about"
                    className="text-sm text-secondary hover:text-primary transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-sm text-secondary hover:text-primary transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/careers"
                    className="text-sm text-secondary hover:text-primary transition-colors"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center text-xs text-secondary">
            <p>
              © {new Date().getFullYear()} Lineup24x7. All rights reserved.
              Dubai, UAE.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
