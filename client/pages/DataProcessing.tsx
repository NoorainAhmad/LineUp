import React, { useState, useEffect } from "react";
import {
  Shield,
  Lock,
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
  RefreshCw,
  ArrowLeft,
  Menu,
  Sparkles,
  Rocket,
  HardDrive,
  Cloud,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
  Key,
  FileJson,
  FileSpreadsheet,
  FileDigit,
  Trash2,
  Download as DownloadIcon,
  Upload,
  Copy,
  Printer,
  Search,
  Filter,
  Plus,
  Minus,
  AlertTriangle,
  Info,
  MessageCircleCodeIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface DataProcessingProps {
  onBack?: () => void;
}

export const DataProcessing: React.FC<DataProcessingProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("introduction");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    introduction: true,
    definitions: false,
    scope: false,
    obligations: false,
    dataDetails: false,
    subprocessors: false,
    security: false,
    breach: false,
    rights: false,
    transfers: false,
    deletion: false,
    audit: false,
    liability: false,
    termination: false,
    governingLaw: false,
    schedules: false,
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

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
  const effectiveDate = "March 1, 2026";

  // Sample data for schedules/tables
  const personalDataCategories = [
    {
      category: "Identity Data",
      examples: "Name, username, avatar, profile picture",
      purpose: "User identification and personalization",
    },
    {
      category: "Contact Data",
      examples: "Email address, phone number",
      purpose: "Communication and account management",
    },
    {
      category: "Technical Data",
      examples: "IP address, device info, browser type, logs",
      purpose: "Service operation and security",
    },
    {
      category: "Communication Data",
      examples: "Messages, files, voice notes, status updates",
      purpose: "Core service functionality",
    },
    {
      category: "Metadata",
      examples: "Timestamps, read receipts, delivery status",
      purpose: "Message delivery and analytics",
    },
    {
      category: "Hierarchy Data",
      examples: "Role, parent/child relationships, permissions",
      purpose: "Organizational structure management",
    },
  ];

  const dataSubjects = [
    "MASTER users (system administrators)",
    "ADMIN users (regional managers)",
    "BRANCH users (department coordinators)",
    "USER (end users/employees)",
    "Customers or clients communicating via the platform",
  ];

  const subprocessors = [
    {
      name: "Amazon Web Services (AWS)",
      location: "Bahrain (ME Region)",
      service: "Cloud infrastructure and data hosting",
    },
    {
      name: "MongoDB Atlas",
      location: "Bahrain/ UAE",
      service: "Database management",
    },
    { name: "SendGrid", location: "USA", service: "Email notifications" },
    {
      name: "Twilio",
      location: "USA",
      service: "SMS and WhatsApp OTP delivery",
    },
    {
      name: "Cloudflare",
      location: "Global",
      service: "CDN and DDoS protection",
    },
    {
      name: "Sentry",
      location: "USA",
      service: "Error tracking and monitoring",
    },
  ];

  const securityMeasures = [
    {
      measure: "Encryption",
      description:
        "256-bit AES encryption for data at rest; TLS 1.3 for data in transit",
    },
    {
      measure: "Access Controls",
      description:
        "Role-based access control (RBAC), least privilege principle, multi-factor authentication",
    },
    {
      measure: "Data Segregation",
      description: "Logical separation of customer data in shared databases",
    },
    {
      measure: "Backup & Recovery",
      description:
        "Daily automated backups with 30-day retention; tested quarterly",
    },
    {
      measure: "Incident Response",
      description:
        "24/7 security monitoring; documented incident response plan",
    },
    {
      measure: "Penetration Testing",
      description: "Annual third-party security audits and penetration tests",
    },
    {
      measure: "Employee Training",
      description: "Annual security awareness training for all employees",
    },
    {
      measure: "Physical Security",
      description:
        "Dubai data center with 24/7 surveillance and biometric access",
    },
  ];

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
                onClick={() => scrollToSection("obligations")}
                className={`text-sm font-medium transition-colors ${
                  activeSection === "obligations"
                    ? "text-primary"
                    : "text-secondary hover:text-text-main"
                }`}
              >
                Obligations
              </button>
              <button
                onClick={() => scrollToSection("security")}
                className={`text-sm font-medium transition-colors ${
                  activeSection === "security"
                    ? "text-primary"
                    : "text-secondary hover:text-text-main"
                }`}
              >
                Security
              </button>
              <button
                onClick={() => scrollToSection("subprocessors")}
                className={`text-sm font-medium transition-colors ${
                  activeSection === "subprocessors"
                    ? "text-primary"
                    : "text-secondary hover:text-text-main"
                }`}
              >
                Subprocessors
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
                onClick={() => scrollToSection("definitions")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Definitions
              </button>
              <button
                onClick={() => scrollToSection("obligations")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Obligations
              </button>
              <button
                onClick={() => scrollToSection("data-details")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Data Details
              </button>
              <button
                onClick={() => scrollToSection("security")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Security Measures
              </button>
              <button
                onClick={() => scrollToSection("subprocessors")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Subprocessors
              </button>
              <button
                onClick={() => scrollToSection("breach")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Data Breach
              </button>
              <button
                onClick={() => scrollToSection("rights")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Data Subject Rights
              </button>
              <button
                onClick={() => scrollToSection("governing-law")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Governing Law
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
                <FileText size={16} className="text-primary" />
                <span className="text-sm font-medium">
                  Data Processing Agreement
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight">
                Data Processing
                <span className="text-primary block sm:inline"> Agreement</span>
              </h1>

              <p className="text-lg sm:text-xl text-secondary max-w-2xl mx-auto">
                This Data Processing Agreement (DPA) governs how Lineup24x7
                processes personal data on behalf of its customers, in
                compliance with UAE data protection laws and GDPR standards.
              </p>

              <div className="flex items-center justify-center gap-4 mt-8 text-sm text-secondary">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  <span>Last Updated: {lastUpdated}</span>
                </div>
                <div className="w-px h-4 bg-border"></div>
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-primary" />
                  <span>Effective: {effectiveDate}</span>
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
                        onClick={() => scrollToSection("definitions")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "definitions"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Definitions
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("scope")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "scope"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Scope & Duration
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("obligations")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "obligations"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Party Obligations
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("data-details")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "data-details"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Data Details
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("subprocessors")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "subprocessors"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Subprocessors
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("security")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "security"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Security Measures
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("breach")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "breach"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Data Breach
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("rights")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "rights"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Data Subject Rights
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("transfers")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "transfers"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Data Transfers
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("deletion")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "deletion"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Data Deletion
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("audit")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "audit"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Audit Rights
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("liability")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "liability"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Liability
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("termination")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "termination"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Termination
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("governing-law")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "governing-law"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Governing Law
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("schedules")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "schedules"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Schedules
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
                        Contact
                      </button>
                    </li>
                  </ul>

                  <div className="mt-6 pt-4 border-t border-border">
                    <Link
                      to="/privacy"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors text-sm"
                    >
                      <span className="text-secondary">Privacy Policy</span>
                      <ChevronRight size={14} className="text-secondary" />
                    </Link>
                    <Link
                      to="/terms"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors text-sm"
                    >
                      <span className="text-secondary">Terms of Service</span>
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
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <BookOpen size={24} className="text-primary" />
                      Introduction
                    </h2>
                    <button
                      onClick={() => toggleSection("introduction")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.introduction ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.introduction && (
                    <div className="space-y-4 text-secondary">
                      <p>
                        This Data Processing Agreement ("DPA") forms part of the
                        agreement between Lineup24x7 ("Processor") and the
                        customer ("Controller") for the provision of
                        communication platform services (the "Services"). This
                        DPA reflects the parties' agreement with respect to the
                        processing of personal data on behalf of the Controller.
                      </p>
                      <p>This DPA is designed to comply with:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          UAE Federal Law No. 45 of 2021 on Personal Data
                          Protection ("UAE PDPL")
                        </li>
                        <li>
                          Dubai International Financial Centre (DIFC) Law No. 5
                          of 2020
                        </li>
                        <li>
                          Abu Dhabi Global Market (ADGM) Data Protection
                          Regulations 2021
                        </li>
                        <li>
                          EU General Data Protection Regulation (GDPR) 2016/679
                          (for international customers)
                        </li>
                      </ul>
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                        <p className="text-sm flex items-start gap-2">
                          <AlertCircle
                            size={18}
                            className="text-primary shrink-0 mt-0.5"
                          />
                          <span>
                            <strong>Incorporation:</strong> This DPA is
                            incorporated into and forms part of the Terms of
                            Service or any other written agreement between the
                            parties.
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Definitions */}
                <section
                  id="definitions"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <BookOpen size={24} className="text-primary" />
                      Definitions
                    </h2>
                    <button
                      onClick={() => toggleSection("definitions")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.definitions ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.definitions && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        For the purposes of this DPA, the following terms have
                        the meanings set forth below:
                      </p>

                      <div className="grid gap-3">
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p>
                            <strong className="text-primary">
                              "Controller"
                            </strong>{" "}
                            <span className="text-secondary">
                              means the customer entity that determines the
                              purposes and means of the processing of Personal
                              Data.
                            </span>
                          </p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p>
                            <strong className="text-primary">
                              "Processor"
                            </strong>{" "}
                            <span className="text-secondary">
                              means Lineup24x7, which processes Personal Data on
                              behalf of the Controller.
                            </span>
                          </p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p>
                            <strong className="text-primary">
                              "Personal Data"
                            </strong>{" "}
                            <span className="text-secondary">
                              means any information relating to an identified or
                              identifiable natural person processed by the
                              Processor on behalf of the Controller.
                            </span>
                          </p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p>
                            <strong className="text-primary">
                              "Data Subject"
                            </strong>{" "}
                            <span className="text-secondary">
                              means the individual to whom Personal Data
                              relates.
                            </span>
                          </p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p>
                            <strong className="text-primary">
                              "Processing"
                            </strong>{" "}
                            <span className="text-secondary">
                              means any operation performed on Personal Data,
                              including collection, recording, storage, use,
                              disclosure, or deletion.
                            </span>
                          </p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p>
                            <strong className="text-primary">
                              "Subprocessor"
                            </strong>{" "}
                            <span className="text-secondary">
                              means any third-party processor engaged by the
                              Processor to process Personal Data on behalf of
                              the Controller.
                            </span>
                          </p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p>
                            <strong className="text-primary">
                              "Data Breach"
                            </strong>{" "}
                            <span className="text-secondary">
                              means a breach of security leading to accidental
                              or unlawful destruction, loss, alteration,
                              unauthorized disclosure of, or access to Personal
                              Data.
                            </span>
                          </p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p>
                            <strong className="text-primary">
                              "Applicable Law"
                            </strong>{" "}
                            <span className="text-secondary">
                              means all applicable data protection laws in the
                              UAE and any other jurisdiction where Data Subjects
                              are located.
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Scope & Duration */}
                <section
                  id="scope"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Globe size={24} className="text-primary" />
                      Scope & Duration
                    </h2>
                    <button
                      onClick={() => toggleSection("scope")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.scope ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.scope && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <h3 className="font-bold">Scope</h3>
                        <p className="text-secondary text-sm">
                          This DPA applies to all Processing of Personal Data by
                          the Processor on behalf of the Controller in
                          connection with the Services provided under the
                          principal agreement. The subject-matter of Processing
                          is the provision of the Lineup24x7 communication
                          platform and related services.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold">Duration</h3>
                        <p className="text-secondary text-sm">
                          This DPA shall remain in effect as long as the
                          Processor processes Personal Data on behalf of the
                          Controller and for the duration of the principal
                          agreement. Upon termination of the agreement, the
                          Processor shall delete or return all Personal Data in
                          accordance with Section 11.
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Party Obligations */}
                <section
                  id="obligations"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Users size={24} className="text-primary" />
                      Party Obligations
                    </h2>
                    <button
                      onClick={() => toggleSection("obligations")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.obligations ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.obligations && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="font-bold text-primary">
                          Controller's Obligations
                        </h3>
                        <p className="text-secondary text-sm">
                          The Controller shall:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-secondary">
                          <li>
                            Ensure it has all necessary consents and legal bases
                            for the Processing of Personal Data
                          </li>
                          <li>
                            Provide the Processor with lawful instructions
                            regarding the Processing
                          </li>
                          <li>
                            Respond to Data Subject requests and exercise their
                            rights
                          </li>
                          <li>
                            Maintain records of Processing activities as
                            required by Applicable Law
                          </li>
                          <li>
                            Conduct Data Protection Impact Assessments where
                            required
                          </li>
                          <li>
                            Notify the Processor of any changes in applicable
                            law
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold text-primary">
                          Processor's Obligations
                        </h3>
                        <p className="text-secondary text-sm">
                          The Processor shall:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-secondary">
                          <li>
                            Process Personal Data only on documented
                            instructions from the Controller
                          </li>
                          <li>
                            Ensure personnel authorized to process Personal Data
                            are bound by confidentiality
                          </li>
                          <li>
                            Implement appropriate technical and organizational
                            security measures
                          </li>
                          <li>
                            Assist the Controller in fulfilling its obligations
                            regarding Data Subject rights
                          </li>
                          <li>
                            Notify the Controller of any Data Breach without
                            undue delay
                          </li>
                          <li>
                            Assist with Data Protection Impact Assessments and
                            consultations
                          </li>
                          <li>
                            Delete or return Personal Data upon termination
                          </li>
                          <li>
                            Make available information to demonstrate compliance
                            with this DPA
                          </li>
                        </ul>
                      </div>

                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <p className="text-sm flex items-start gap-2">
                          <Info
                            size={18}
                            className="text-primary shrink-0 mt-0.5"
                          />
                          <span>
                            <strong>Instructions:</strong> The Controller's
                            initial instructions for Processing are set out in
                            the principal agreement. The Controller may provide
                            additional instructions that are consistent with the
                            terms of this DPA and Applicable Law.
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Data Details */}
                <section
                  id="data-details"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Database size={24} className="text-primary" />
                      Data Details
                    </h2>
                    <button
                      onClick={() => toggleSection("dataDetails")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.dataDetails ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.dataDetails && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="font-bold">
                          Categories of Data Subjects
                        </h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-secondary">
                          {dataSubjects.map((subject, index) => (
                            <li key={index}>{subject}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold">
                          Categories of Personal Data
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left py-2 px-3 font-bold">
                                  Category
                                </th>
                                <th className="text-left py-2 px-3 font-bold">
                                  Examples
                                </th>
                                <th className="text-left py-2 px-3 font-bold">
                                  Purpose
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {personalDataCategories.map((item, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-border/50"
                                >
                                  <td className="py-2 px-3 text-secondary">
                                    {item.category}
                                  </td>
                                  <td className="py-2 px-3 text-secondary text-xs">
                                    {item.examples}
                                  </td>
                                  <td className="py-2 px-3 text-secondary text-xs">
                                    {item.purpose}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold">
                          Special Categories of Data
                        </h3>
                        <p className="text-secondary text-sm">
                          The Processor does not intentionally process special
                          categories of data (sensitive data) such as health
                          information, biometric data, political opinions,
                          religious beliefs, or criminal records. The Controller
                          is responsible for ensuring that no special categories
                          of data are uploaded to the Services without
                          appropriate safeguards.
                        </p>
                      </div>

                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                        <p className="text-sm flex items-start gap-2">
                          <AlertTriangle
                            size={18}
                            className="text-amber-500 shrink-0 mt-0.5"
                          />
                          <span>
                            <strong>Special Data Notice:</strong> If you intend
                            to process special categories of data, please
                            contact us to discuss additional safeguards and
                            separate processing terms.
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Subprocessors */}
                <section
                  id="subprocessors"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Cloud size={24} className="text-primary" />
                      Subprocessors
                    </h2>
                    <button
                      onClick={() => toggleSection("subprocessors")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.subprocessors ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.subprocessors && (
                    <div className="space-y-6">
                      <p className="text-secondary text-sm">
                        The Controller authorizes the Processor to engage the
                        following subprocessors for the provision of the
                        Services. The Processor shall remain fully liable for
                        the acts and omissions of its subprocessors.
                      </p>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 px-3 font-bold">
                                Subprocessor
                              </th>
                              <th className="text-left py-2 px-3 font-bold">
                                Location
                              </th>
                              <th className="text-left py-2 px-3 font-bold">
                                Service
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {subprocessors.map((sub, index) => (
                              <tr
                                key={index}
                                className="border-b border-border/50"
                              >
                                <td className="py-2 px-3 text-secondary">
                                  {sub.name}
                                </td>
                                <td className="py-2 px-3 text-secondary">
                                  {sub.location}
                                </td>
                                <td className="py-2 px-3 text-secondary text-xs">
                                  {sub.service}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold">Subprocessor Updates</h3>
                        <p className="text-secondary text-sm">
                          The Processor may update its list of subprocessors
                          from time to time. The Controller may subscribe to
                          notifications of new subprocessors. If the Controller
                          objects to a new subprocessor on reasonable grounds
                          relating to data protection, the Controller may
                          terminate the Services within 30 days of notice.
                        </p>
                      </div>

                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <p className="text-sm flex items-start gap-2">
                          <Mail
                            size={18}
                            className="text-primary shrink-0 mt-0.5"
                          />
                          <span>
                            <strong>Subscribe to Updates:</strong> To receive
                            notifications of subprocessor changes, please email
                            dpo@lineup24x7.ae with the subject "Subprocessor
                            Updates".
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Security Measures */}
                <section
                  id="security"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Shield size={24} className="text-primary" />
                      Security Measures
                    </h2>
                    <button
                      onClick={() => toggleSection("security")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.security ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.security && (
                    <div className="space-y-6">
                      <p className="text-secondary text-sm">
                        The Processor maintains the following technical and
                        organizational security measures to protect Personal
                        Data against accidental or unlawful destruction, loss,
                        alteration, unauthorized disclosure, or access:
                      </p>

                      <div className="grid gap-4">
                        {securityMeasures.map((measure, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-surface-hover/30 rounded-lg"
                          >
                            <ShieldCheck
                              size={18}
                              className="text-primary shrink-0 mt-1"
                            />
                            <div>
                              <h4 className="font-bold text-sm">
                                {measure.measure}
                              </h4>
                              <p className="text-xs text-secondary">
                                {measure.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <p className="text-sm flex items-start gap-2">
                          <Check
                            size={18}
                            className="text-green-500 shrink-0 mt-0.5"
                          />
                          <span>
                            <strong>Certifications:</strong> Lineup24x7
                            maintains ISO 27001 certification and undergoes
                            annual third-party security audits. Audit reports
                            are available under NDA upon request.
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Data Breach */}
                <section
                  id="breach"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <AlertTriangle size={24} className="text-primary" />
                      Data Breach
                    </h2>
                    <button
                      onClick={() => toggleSection("breach")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.breach ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.breach && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        In the event of a Data Breach, the Processor shall:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-secondary">
                        <li>
                          Notify the Controller without undue delay and within
                          24 hours of becoming aware of the breach
                        </li>
                        <li>
                          Provide the Controller with available information
                          about the nature, scope, and likely consequences of
                          the breach
                        </li>
                        <li>
                          Take reasonable steps to mitigate the effects and
                          prevent further breaches
                        </li>
                        <li>
                          Cooperate with the Controller in notifying supervisory
                          authorities and affected Data Subjects
                        </li>
                        <li>
                          Document all breaches, including facts, effects, and
                          remedial actions taken
                        </li>
                      </ul>
                      <p className="text-sm text-secondary mt-3">
                        Notification shall include: (i) description of the
                        breach; (ii) categories and approximate number of Data
                        Subjects and records affected; (iii) contact information
                        for further information; and (iv) measures taken or
                        proposed to address the breach.
                      </p>
                    </div>
                  )}
                </section>

                {/* Data Subject Rights */}
                <section
                  id="rights"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <UserCheck size={24} className="text-primary" />
                      Data Subject Rights
                    </h2>
                    <button
                      onClick={() => toggleSection("rights")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.rights ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.rights && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        The Processor shall assist the Controller in fulfilling
                        its obligations to respond to requests by Data Subjects
                        exercising their rights under Applicable Law, including:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p className="font-bold text-sm">Right of Access</p>
                          <p className="text-xs text-secondary">
                            Data Subjects can request confirmation of whether
                            their data is being processed
                          </p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p className="font-bold text-sm">
                            Right to Rectification
                          </p>
                          <p className="text-xs text-secondary">
                            Data Subjects can correct inaccurate data
                          </p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p className="font-bold text-sm">Right to Erasure</p>
                          <p className="text-xs text-secondary">
                            "Right to be forgotten" under certain conditions
                          </p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p className="font-bold text-sm">
                            Right to Restriction
                          </p>
                          <p className="text-xs text-secondary">
                            Limit processing in certain circumstances
                          </p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p className="font-bold text-sm">
                            Right to Data Portability
                          </p>
                          <p className="text-xs text-secondary">
                            Receive data in structured, commonly used format
                          </p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p className="font-bold text-sm">Right to Object</p>
                          <p className="text-xs text-secondary">
                            Object to processing based on legitimate interests
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-secondary mt-3">
                        The Controller shall forward any Data Subject request to
                        the Processor without undue delay. The Processor shall
                        provide the Controller with the ability to fulfill such
                        requests through the Services or through reasonable
                        assistance.
                      </p>
                    </div>
                  )}
                </section>

                {/* Data Transfers */}
                <section
                  id="transfers"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Globe size={24} className="text-primary" />
                      Data Transfers
                    </h2>
                    <button
                      onClick={() => toggleSection("transfers")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.transfers ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.transfers && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        The Processor's primary data center is located in
                        Bahrain (AWS Middle East Region) with backups in the
                        UAE. To provide the Services, Personal Data may be
                        transferred to subprocessors located in various
                        jurisdictions.
                      </p>
                      <div className="space-y-3">
                        <h3 className="font-bold">Transfer Mechanisms</h3>
                        <p className="text-secondary text-sm">
                          The Processor relies on the following transfer
                          mechanisms for international data transfers:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-secondary">
                          <li>
                            <strong>Standard Contractual Clauses (SCCs)</strong>{" "}
                            - EU Commission Decision 2021/914
                          </li>
                          <li>
                            <strong>Binding Corporate Rules (BCRs)</strong> -
                            For group companies where applicable
                          </li>
                          <li>
                            <strong>Adequacy Decisions</strong> - For countries
                            recognized as providing adequate protection
                          </li>
                          <li>
                            <strong>UAE Adequacy</strong> - For transfers within
                            the UAE and GCC region
                          </li>
                        </ul>
                      </div>
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <p className="text-sm flex items-start gap-2">
                          <Info
                            size={18}
                            className="text-primary shrink-0 mt-0.5"
                          />
                          <span>
                            <strong>Data Location:</strong> Customer data is
                            primarily stored in the Middle East region. For the
                            current list of data center locations, please
                            contact support.
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Data Deletion */}
                <section
                  id="deletion"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Trash2 size={24} className="text-primary" />
                      Data Deletion
                    </h2>
                    <button
                      onClick={() => toggleSection("deletion")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.deletion ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.deletion && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        Upon termination of the Services, the Processor shall,
                        at the choice of the Controller, delete or return all
                        Personal Data to the Controller, unless Applicable Law
                        requires storage of the data.
                      </p>
                      <div className="space-y-3">
                        <h3 className="font-bold">Deletion Process</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-secondary">
                          <li>
                            The Controller may export their data through the
                            Services prior to termination
                          </li>
                          <li>
                            Upon request, the Processor will provide a one-time
                            data export
                          </li>
                          <li>
                            After 30 days, Personal Data will be permanently
                            deleted from active systems
                          </li>
                          <li>Backup data will be deleted within 90 days</li>
                          <li>
                            The Processor will provide written confirmation of
                            deletion upon request
                          </li>
                        </ul>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                        <p className="text-sm flex items-start gap-2">
                          <AlertTriangle
                            size={18}
                            className="text-amber-500 shrink-0 mt-0.5"
                          />
                          <span>
                            <strong>Retention Requirements:</strong> Some data
                            may be retained to comply with UAE legal
                            obligations, such as financial records or audit
                            logs. Such data will be restricted from further
                            processing.
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Audit Rights */}
                <section
                  id="audit"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Search size={24} className="text-primary" />
                      Audit Rights
                    </h2>
                    <button
                      onClick={() => toggleSection("audit")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.audit ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.audit && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        The Processor shall make available to the Controller all
                        information necessary to demonstrate compliance with
                        this DPA and allow for and contribute to audits,
                        including inspections, conducted by the Controller or an
                        auditor mandated by the Controller.
                      </p>
                      <div className="space-y-3">
                        <h3 className="font-bold">Audit Process</h3>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-secondary">
                          <li>
                            Audit requests must be made in writing at least 30
                            days in advance
                          </li>
                          <li>
                            Audits shall not exceed once per 12-month period
                          </li>
                          <li>
                            The Controller shall bear the costs of the audit
                          </li>
                          <li>
                            Audits must be conducted during normal business
                            hours
                          </li>
                          <li>
                            Third-party auditors must sign a confidentiality
                            agreement
                          </li>
                        </ul>
                      </div>
                      <p className="text-sm text-secondary">
                        As an alternative to on-site audits, the Processor may
                        provide a third-party audit report (e.g., SOC 2 Type II,
                        ISO 27001 certification) demonstrating compliance.
                      </p>
                    </div>
                  )}
                </section>

                {/* Liability */}
                <section
                  id="liability"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Scale size={24} className="text-primary" />
                      Liability
                    </h2>
                    <button
                      onClick={() => toggleSection("liability")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.liability ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.liability && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        Each party's liability arising out of or related to this
                        DPA shall be subject to the limitations and exclusions
                        of liability set out in the principal agreement.
                        However:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-secondary">
                        <li>
                          The Processor's liability shall not be limited in the
                          case of intentional misconduct or gross negligence
                        </li>
                        <li>
                          The Processor shall be liable to the Controller for
                          any fines imposed by supervisory authorities due to
                          the Processor's failure to comply with this DPA
                        </li>
                        <li>
                          The Controller shall be liable for fines resulting
                          from the Controller's instructions or failure to
                          comply with Applicable Law
                        </li>
                      </ul>
                    </div>
                  )}
                </section>

                {/* Termination */}
                <section
                  id="termination"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <X size={24} className="text-primary" />
                      Termination
                    </h2>
                    <button
                      onClick={() => toggleSection("termination")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.termination ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.termination && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        This DPA shall terminate automatically upon termination
                        of the principal agreement. Upon termination:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-secondary">
                        <li>
                          The Processor shall, at the choice of the Controller,
                          delete or return all Personal Data
                        </li>
                        <li>
                          The Processor may retain Personal Data to the extent
                          required by Applicable Law
                        </li>
                        <li>
                          Any provisions which by their nature should survive
                          termination shall survive
                        </li>
                      </ul>
                    </div>
                  )}
                </section>

                {/* Governing Law */}
                <section
                  id="governing-law"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Gavel size={24} className="text-primary" />
                      Governing Law
                    </h2>
                    <button
                      onClick={() => toggleSection("governingLaw")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.governingLaw ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.governingLaw && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        This DPA shall be governed by the laws of the United
                        Arab Emirates. Any dispute arising out of or in
                        connection with this DPA shall be submitted to the Dubai
                        International Arbitration Centre (DIAC) in accordance
                        with its rules.
                      </p>
                      <p className="text-sm text-secondary">
                        Notwithstanding the foregoing, either party may seek
                        injunctive relief from any court of competent
                        jurisdiction to protect its intellectual property rights
                        or confidential information.
                      </p>
                    </div>
                  )}
                </section>

                {/* Schedules */}
                <section
                  id="schedules"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <FileDigit size={24} className="text-primary" />
                      Schedules
                    </h2>
                    <button
                      onClick={() => toggleSection("schedules")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.schedules ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.schedules && (
                    <div className="space-y-6">
                      <p className="text-secondary">
                        The following schedules form an integral part of this
                        DPA:
                      </p>

                      <div className="space-y-4">
                        <div className="p-4 bg-surface-hover/30 rounded-lg">
                          <h3 className="font-bold mb-2">
                            Schedule 1: Details of Processing
                          </h3>
                          <p className="text-sm text-secondary">
                            As set forth in Section 5 (Data Details) above.
                          </p>
                        </div>

                        <div className="p-4 bg-surface-hover/30 rounded-lg">
                          <h3 className="font-bold mb-2">
                            Schedule 2: Security Measures
                          </h3>
                          <p className="text-sm text-secondary">
                            As set forth in Section 7 (Security Measures) above.
                          </p>
                        </div>

                        <div className="p-4 bg-surface-hover/30 rounded-lg">
                          <h3 className="font-bold mb-2">
                            Schedule 3: Subprocessors
                          </h3>
                          <p className="text-sm text-secondary">
                            As set forth in Section 6 (Subprocessors) above.
                          </p>
                        </div>

                        <div className="p-4 bg-surface-hover/30 rounded-lg">
                          <h3 className="font-bold mb-2">
                            Schedule 4: Standard Contractual Clauses (EU/UK)
                          </h3>
                          <p className="text-sm text-secondary">
                            For transfers of Personal Data from the European
                            Economic Area or the United Kingdom, the EU Standard
                            Contractual Clauses (Commission Implementing
                            Decision 2021/914) are incorporated by reference and
                            available upon request.
                          </p>
                        </div>

                        <div className="p-4 bg-surface-hover/30 rounded-lg">
                          <h3 className="font-bold mb-2">
                            Schedule 5: UAE Specific Addendum
                          </h3>
                          <p className="text-sm text-secondary">
                            This addendum addresses requirements specific to UAE
                            Federal Law No. 45 of 2021, including:
                          </p>
                          <ul className="list-disc pl-5 mt-2 text-sm text-secondary">
                            <li>Data localization requirements</li>
                            <li>UAE regulatory authority notifications</li>
                            <li>
                              Specific requirements for Processing within UAE
                              sectors
                            </li>
                          </ul>
                        </div>
                      </div>
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
                      For questions about this DPA or to exercise any rights
                      under this agreement, please contact our Data Protection
                      Officer:
                    </p>

                    <div className="grid gap-4">
                      <div className="flex items-start gap-3 p-4 bg-surface-hover/30 rounded-lg">
                        <Mail
                          size={20}
                          className="text-primary shrink-0 mt-1"
                        />
                        <div>
                          <h4 className="font-bold mb-1">
                            Data Protection Officer
                          </h4>
                          <p className="text-sm text-secondary">
                            dpo@lineup24x7.ae
                          </p>
                          <p className="text-sm text-secondary">
                            privacy@lineup24x7.ae
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
                          <strong>Representative in the EU/UK:</strong> For
                          customers in the European Union or United Kingdom, we
                          have appointed a representative who can be contacted
                          at eu-rep@lineup24x7.ae.
                        </span>
                      </p>
                    </div>
                  </div>
                </section>

                {/* Download DPA */}
                <div className="flex justify-center pt-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-surface border border-border rounded-xl hover:bg-surface-hover transition-colors text-sm font-medium">
                    <Download size={18} />
                    Download DPA (PDF)
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
              Need Help with Data Protection?
            </h2>
            <p className="text-lg text-secondary mb-8">
              Our team is ready to answer any questions about data processing
              and compliance.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/25 transition-all active:scale-95"
            >
              Contact Data Protection Team
              <Mail size={20} />
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
                control, hosted in Dubai, UAE. Compliant with UAE PDPL and
                international standards.
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
            <p className="mt-2">
              License #: DED-1234567 | VAT: AE123456789 | DPO: dpo@lineup24x7.ae
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
