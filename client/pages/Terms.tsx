import React, { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  Gavel,
  Scale,
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
  AlertCircle,
  HelpCircle,
  BookOpen,
  Award,
  Cookie,
  Settings,
  Bell,
  RefreshCw,
  ArrowLeft,
  Menu,
  Moon,
  Sun,
  Sparkles,
  Rocket,
  UserCheck,
  UserX,
  Ban,
  AlertTriangle,
  Info,
  DollarSign,
  CreditCard,
  ShieldCheck,
  Fingerprint,
  MessageSquare,
  Camera,
  Mic,
  FileText as FileIcon,
  Image,
  Trash2,
  LogOut,
  Key,
  Eye,
  EyeOff,
  MessageCircleCodeIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface TermsProps {
  onBack?: () => void;
}

export const Terms: React.FC<TermsProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("introduction");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    acceptance: true,
    eligibility: false,
    accounts: false,
    acceptableUse: false,
    content: false,
    intellectualProperty: false,
    fees: false,
    termination: false,
    disclaimers: false,
    limitation: false,
    indemnification: false,
    governingLaw: false,
    changes: false,
    contact: false,
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
                onClick={() => scrollToSection("accounts")}
                className={`text-sm font-medium transition-colors ${
                  activeSection === "accounts"
                    ? "text-primary"
                    : "text-secondary hover:text-text-main"
                }`}
              >
                Accounts
              </button>
              <button
                onClick={() => scrollToSection("acceptable-use")}
                className={`text-sm font-medium transition-colors ${
                  activeSection === "acceptable-use"
                    ? "text-primary"
                    : "text-secondary hover:text-text-main"
                }`}
              >
                Acceptable Use
              </button>
              <button
                onClick={() => scrollToSection("content")}
                className={`text-sm font-medium transition-colors ${
                  activeSection === "content"
                    ? "text-primary"
                    : "text-secondary hover:text-text-main"
                }`}
              >
                Content
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
                onClick={() => scrollToSection("accounts")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Accounts
              </button>
              <button
                onClick={() => scrollToSection("acceptable-use")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Acceptable Use
              </button>
              <button
                onClick={() => scrollToSection("content")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Content
              </button>
              <button
                onClick={() => scrollToSection("fees")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Fees & Payments
              </button>
              <button
                onClick={() => scrollToSection("termination")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Termination
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
                <Scale size={16} className="text-primary" />
                <span className="text-sm font-medium">Terms of Service</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight">
                Terms of
                <span className="text-primary block sm:inline"> Service</span>
              </h1>

              <p className="text-lg sm:text-xl text-secondary max-w-2xl mx-auto">
                Please read these terms carefully before using Lineup24x7. By
                using our service, you agree to be bound by these terms.
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
                        onClick={() => scrollToSection("acceptance")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "acceptance"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Acceptance of Terms
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("eligibility")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "eligibility"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Eligibility
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("accounts")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "accounts"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        User Accounts
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("acceptable-use")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "acceptable-use"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Acceptable Use
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("content")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "content"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        User Content
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("intellectual-property")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "intellectual-property"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Intellectual Property
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("fees")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "fees"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Fees & Payments
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
                        onClick={() => scrollToSection("disclaimers")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "disclaimers"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Disclaimers
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("limitation")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "limitation"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Limitation of Liability
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("indemnification")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "indemnification"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Indemnification
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
                        onClick={() => scrollToSection("changes")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "changes"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Changes to Terms
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
                      to="/privacy"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors text-sm"
                    >
                      <span className="text-secondary">Privacy Policy</span>
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
                      Welcome to Lineup24x7 ("Company," "we," "our," or "us").
                      These Terms of Service ("Terms") govern your access to and
                      use of our communication platform, website, mobile
                      applications, and related services (collectively, the
                      "Services").
                    </p>
                    <p>
                      Lineup24x7 is operated by a company registered in Dubai,
                      United Arab Emirates (License #: DED-1234567). By
                      accessing or using our Services, you agree to be bound by
                      these Terms. If you do not agree to these Terms, you may
                      not access or use the Services.
                    </p>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                      <p className="text-sm flex items-start gap-2">
                        <AlertCircle
                          size={18}
                          className="text-primary shrink-0 mt-0.5"
                        />
                        <span>
                          <strong>Important:</strong> These Terms contain
                          important provisions, including an arbitration
                          agreement that requires claims to be submitted to
                          binding arbitration and limits your ability to pursue
                          claims in court.
                        </span>
                      </p>
                    </div>
                  </div>
                </section>

                {/* Acceptance of Terms */}
                <section
                  id="acceptance"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Check size={24} className="text-primary" />
                      Acceptance of Terms
                    </h2>
                    <button
                      onClick={() => toggleSection("acceptance")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.acceptance ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.acceptance && (
                    <div className="space-y-4 text-secondary">
                      <p>
                        By creating an account, accessing, or using our
                        Services, you acknowledge that you have read,
                        understood, and agree to be bound by these Terms. If you
                        are using the Services on behalf of an organization, you
                        represent and warrant that you have the authority to
                        bind that organization to these Terms.
                      </p>
                      <p>
                        We may modify these Terms at any time. When we make
                        changes, we will update the "Last Updated" date at the
                        top of these Terms. Your continued use of the Services
                        after any changes constitutes your acceptance of the
                        revised Terms.
                      </p>
                    </div>
                  )}
                </section>

                {/* Eligibility */}
                <section
                  id="eligibility"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <UserCheck size={24} className="text-primary" />
                      Eligibility
                    </h2>
                    <button
                      onClick={() => toggleSection("eligibility")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.eligibility ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.eligibility && (
                    <div className="space-y-4">
                      <ul className="space-y-3 text-secondary">
                        <li className="flex items-start gap-2">
                          <Check
                            size={16}
                            className="text-green-500 shrink-0 mt-1"
                          />
                          <span>
                            You must be at least 18 years old to use our
                            Services.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check
                            size={16}
                            className="text-green-500 shrink-0 mt-1"
                          />
                          <span>
                            You must have the legal capacity to enter into
                            binding contracts.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check
                            size={16}
                            className="text-green-500 shrink-0 mt-1"
                          />
                          <span>
                            You must not be located in a country that is subject
                            to UAE trade sanctions.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check
                            size={16}
                            className="text-green-500 shrink-0 mt-1"
                          />
                          <span>
                            You must not have been previously suspended or
                            removed from our Services.
                          </span>
                        </li>
                      </ul>
                    </div>
                  )}
                </section>

                {/* User Accounts */}
                <section
                  id="accounts"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Users size={24} className="text-primary" />
                      User Accounts
                    </h2>
                    <button
                      onClick={() => toggleSection("accounts")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.accounts ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.accounts && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="font-bold">Account Registration</h3>
                        <p className="text-secondary text-sm">
                          To use our Services, you must create an account. You
                          agree to provide accurate, current, and complete
                          information and to update it as necessary. You are
                          responsible for all activities that occur under your
                          account.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold">Account Security</h3>
                        <p className="text-secondary text-sm">
                          You are responsible for maintaining the
                          confidentiality of your login credentials. You must
                          notify us immediately of any unauthorized use of your
                          account. We are not liable for any loss or damage
                          arising from your failure to protect your account.
                        </p>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div className="p-3 bg-surface-hover/30 rounded-lg">
                            <Key size={18} className="text-primary mb-2" />
                            <p className="text-xs font-medium">
                              Strong passwords required
                            </p>
                          </div>
                          <div className="p-3 bg-surface-hover/30 rounded-lg">
                            <Shield size={18} className="text-primary mb-2" />
                            <p className="text-xs font-medium">
                              2FA recommended
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold">Account Types</h3>
                        <p className="text-secondary text-sm">
                          Lineup24x7 offers different account types based on
                          your role in the organizational hierarchy:
                        </p>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="w-16 text-xs font-bold text-purple-500">
                              MASTER:
                            </span>
                            <span className="text-secondary">
                              Full system access, user management, and analytics
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-16 text-xs font-bold text-blue-500">
                              ADMIN:
                            </span>
                            <span className="text-secondary">
                              Regional control and branch management
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-16 text-xs font-bold text-orange-500">
                              BRANCH:
                            </span>
                            <span className="text-secondary">
                              Department or location coordination
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-16 text-xs font-bold text-green-500">
                              USER:
                            </span>
                            <span className="text-secondary">
                              Standard user with communication features
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </section>

                {/* Acceptable Use */}
                <section
                  id="acceptable-use"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Shield size={24} className="text-primary" />
                      Acceptable Use Policy
                    </h2>
                    <button
                      onClick={() => toggleSection("acceptableUse")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.acceptableUse ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.acceptableUse && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        You agree not to use the Services to:
                      </p>

                      <div className="grid gap-3">
                        <div className="flex items-start gap-2 p-3 bg-red-500/5 rounded-lg">
                          <Ban
                            size={16}
                            className="text-red-500 shrink-0 mt-1"
                          />
                          <span className="text-sm">
                            <strong>Illegal Activities:</strong> Engage in any
                            unlawful activity or promote illegal acts.
                          </span>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-red-500/5 rounded-lg">
                          <Ban
                            size={16}
                            className="text-red-500 shrink-0 mt-1"
                          />
                          <span className="text-sm">
                            <strong>Harassment:</strong> Harass, abuse, or harm
                            others.
                          </span>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-red-500/5 rounded-lg">
                          <Ban
                            size={16}
                            className="text-red-500 shrink-0 mt-1"
                          />
                          <span className="text-sm">
                            <strong>Impersonation:</strong> Impersonate any
                            person or entity.
                          </span>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-red-500/5 rounded-lg">
                          <Ban
                            size={16}
                            className="text-red-500 shrink-0 mt-1"
                          />
                          <span className="text-sm">
                            <strong>Spam:</strong> Send unsolicited messages or
                            spam.
                          </span>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-red-500/5 rounded-lg">
                          <Ban
                            size={16}
                            className="text-red-500 shrink-0 mt-1"
                          />
                          <span className="text-sm">
                            <strong>Malware:</strong> Distribute viruses,
                            malware, or other harmful code.
                          </span>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-red-500/5 rounded-lg">
                          <Ban
                            size={16}
                            className="text-red-500 shrink-0 mt-1"
                          />
                          <span className="text-sm">
                            <strong>Infringement:</strong> Violate intellectual
                            property rights of others.
                          </span>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-red-500/5 rounded-lg">
                          <Ban
                            size={16}
                            className="text-red-500 shrink-0 mt-1"
                          />
                          <span className="text-sm">
                            <strong>Data Mining:</strong> Scrape or collect user
                            data without consent.
                          </span>
                        </div>
                      </div>

                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4">
                        <p className="text-sm flex items-start gap-2">
                          <AlertTriangle
                            size={18}
                            className="text-amber-500 shrink-0 mt-0.5"
                          />
                          <span>
                            <strong>
                              Violation of these terms may result in immediate
                              account suspension or termination
                            </strong>
                            without notice, and may be reported to relevant
                            authorities in the UAE.
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* User Content */}
                <section
                  id="content"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <FileText size={24} className="text-primary" />
                      User Content
                    </h2>
                    <button
                      onClick={() => toggleSection("content")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.content ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.content && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        Our Services allow you to post, link, store, share, and
                        otherwise make available certain information, text,
                        graphics, videos, or other material ("User Content").
                      </p>

                      <div className="space-y-3">
                        <h3 className="font-bold">Content Ownership</h3>
                        <p className="text-secondary text-sm">
                          You retain all ownership rights to your User Content.
                          We do not claim ownership over it. However, by posting
                          User Content, you grant us a non-exclusive, worldwide,
                          royalty-free license to use, reproduce, modify, and
                          display your content solely to provide and improve our
                          Services.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold">Content Responsibility</h3>
                        <p className="text-secondary text-sm">
                          You are solely responsible for your User Content and
                          the consequences of posting it. You represent and
                          warrant that you have all necessary rights to your
                          User Content and that it does not violate any laws or
                          third-party rights.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold">Content Removal</h3>
                        <p className="text-secondary text-sm">
                          We reserve the right, but have no obligation, to
                          monitor and remove User Content that we believe
                          violates these Terms, any laws, or is otherwise
                          objectionable.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <MessageSquare
                            size={18}
                            className="text-primary mb-2"
                          />
                          <p className="text-xs">
                            Messages are end-to-end encrypted
                          </p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <Camera size={18} className="text-primary mb-2" />
                          <p className="text-xs">Media files stored securely</p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <Trash2 size={18} className="text-primary mb-2" />
                          <p className="text-xs">
                            Deleted content may persist in backups
                          </p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <Download size={18} className="text-primary mb-2" />
                          <p className="text-xs">
                            You can export your data anytime
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Intellectual Property */}
                <section
                  id="intellectual-property"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Award size={24} className="text-primary" />
                      Intellectual Property
                    </h2>
                    <button
                      onClick={() => toggleSection("intellectualProperty")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.intellectualProperty ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.intellectualProperty && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        The Services, including all content, features, and
                        functionality, are owned by Lineup24x7 and are protected
                        by UAE and international copyright, trademark, patent,
                        trade secret, and other intellectual property laws.
                      </p>

                      <div className="space-y-3">
                        <h3 className="font-bold">Our IP</h3>
                        <p className="text-secondary text-sm">
                          You may not copy, modify, distribute, sell, or lease
                          any part of our Services without our prior written
                          consent. The Lineup24x7 name, logo, and all related
                          names, logos, product and service names, designs, and
                          slogans are our trademarks.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold">Feedback</h3>
                        <p className="text-secondary text-sm">
                          If you provide us with any feedback or suggestions,
                          you grant us the right to use them without any
                          restriction or compensation to you.
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Fees & Payments */}
                <section
                  id="fees"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <DollarSign size={24} className="text-primary" />
                      Fees & Payments
                    </h2>
                    <button
                      onClick={() => toggleSection("fees")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.fees ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.fees && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <h3 className="font-bold">Pricing</h3>
                        <p className="text-secondary text-sm">
                          We offer various pricing plans for our Services. The
                          fees, billing periods, and payment terms for your
                          chosen plan will be presented to you at the time of
                          purchase. All fees are exclusive of applicable taxes,
                          which you are responsible for paying.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold">Payment</h3>
                        <p className="text-secondary text-sm">
                          You agree to pay all fees charged to your account.
                          Payments are non-refundable except as required by law
                          or as expressly stated in these Terms. If your payment
                          fails, we may suspend or terminate your access to the
                          Services.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold">Subscription Plans</h3>
                        <ul className="space-y-2 text-sm text-secondary">
                          <li>
                            <strong>Free Plan:</strong> Limited features with
                            message history and file size restrictions.
                          </li>
                          <li>
                            <strong>Pro Plan:</strong> Monthly or annual
                            subscription with full features.
                          </li>
                          <li>
                            <strong>Enterprise:</strong> Custom pricing for
                            organizations with specific needs.
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
                            <strong>UAE VAT:</strong> All fees are subject to
                            UAE Value Added Tax (VAT) at the applicable rate.
                            Tax invoices are available in your account.
                          </span>
                        </p>
                      </div>
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
                      <LogOut size={24} className="text-primary" />
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
                      <div className="space-y-3">
                        <h3 className="font-bold">By You</h3>
                        <p className="text-secondary text-sm">
                          You may terminate your account at any time by
                          following the instructions in your account settings or
                          by contacting us. Your content may be deleted from our
                          servers, though some information may persist in
                          backups.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold">By Us</h3>
                        <p className="text-secondary text-sm">
                          We may suspend or terminate your account immediately,
                          without prior notice or liability, for any reason,
                          including if you breach these Terms. Grounds for
                          termination include:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-secondary">
                          <li>Violation of Acceptable Use Policy</li>
                          <li>Non-payment of fees</li>
                          <li>Fraudulent or illegal activity</li>
                          <li>Extended inactivity</li>
                          <li>Request by law enforcement</li>
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold">Effect of Termination</h3>
                        <p className="text-secondary text-sm">
                          Upon termination, your right to use the Services will
                          immediately cease. All provisions of these Terms which
                          by their nature should survive termination shall
                          survive, including ownership provisions, warranty
                          disclaimers, indemnity, and limitations of liability.
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Disclaimers */}
                <section
                  id="disclaimers"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <AlertCircle size={24} className="text-primary" />
                      Disclaimers
                    </h2>
                    <button
                      onClick={() => toggleSection("disclaimers")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.disclaimers ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.disclaimers && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS
                        AVAILABLE" BASIS. WE MAKE NO WARRANTIES, EXPRESS OR
                        IMPLIED, REGARDING THE SERVICES, INCLUDING BUT NOT
                        LIMITED TO:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-secondary">
                        <li>
                          No warranty of merchantability or fitness for a
                          particular purpose
                        </li>
                        <li>
                          No warranty that the Services will be uninterrupted,
                          timely, secure, or error-free
                        </li>
                        <li>
                          No warranty regarding the accuracy or reliability of
                          any information obtained through the Services
                        </li>
                        <li>No warranty that defects will be corrected</li>
                      </ul>
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4">
                        <p className="text-sm">
                          <strong>UAE Specific:</strong> Some jurisdictions do
                          not allow the exclusion of certain warranties, so some
                          of these exclusions may not apply to you. Check local
                          laws for applicability.
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Limitation of Liability */}
                <section
                  id="limitation"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Scale size={24} className="text-primary" />
                      Limitation of Liability
                    </h2>
                    <button
                      onClick={() => toggleSection("limitation")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.limitation ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.limitation && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        TO THE MAXIMUM EXTENT PERMITTED BY UAE LAW, IN NO EVENT
                        SHALL LINEUP24X7 BE LIABLE FOR:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-secondary">
                        <li>
                          Indirect, incidental, special, consequential, or
                          punitive damages
                        </li>
                        <li>
                          Loss of profits, revenue, data, or business
                          opportunities
                        </li>
                        <li>Damages for business interruption</li>
                        <li>
                          Any damages exceeding the amount you paid us in the 12
                          months preceding the claim
                        </li>
                      </ul>
                      <p className="text-sm text-secondary mt-3">
                        This limitation applies regardless of the legal theory
                        on which the claim is based, even if we have been
                        advised of the possibility of such damages.
                      </p>
                    </div>
                  )}
                </section>

                {/* Indemnification */}
                <section
                  id="indemnification"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Shield size={24} className="text-primary" />
                      Indemnification
                    </h2>
                    <button
                      onClick={() => toggleSection("indemnification")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.indemnification ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.indemnification && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        You agree to indemnify, defend, and hold harmless
                        Lineup24x7, its officers, directors, employees, and
                        agents from and against any claims, liabilities,
                        damages, losses, and expenses, including reasonable
                        legal fees, arising out of or in any way connected with:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-secondary">
                        <li>Your access to or use of the Services</li>
                        <li>Your violation of these Terms</li>
                        <li>Your violation of any third-party rights</li>
                        <li>Your User Content</li>
                        <li>Any harmful activity related to your account</li>
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
                        These Terms shall be governed by and construed in
                        accordance with the laws of the United Arab Emirates,
                        without regard to its conflict of law provisions.
                      </p>

                      <div className="space-y-3">
                        <h3 className="font-bold">Dispute Resolution</h3>
                        <p className="text-secondary text-sm">
                          Any dispute arising out of or relating to these Terms
                          or the Services shall be resolved through binding
                          arbitration in accordance with the Dubai International
                          Arbitration Centre (DIAC) Rules. The arbitration shall
                          be conducted in Dubai, UAE.
                        </p>
                      </div>

                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <p className="text-sm flex items-start gap-2">
                          <Globe
                            size={18}
                            className="text-primary shrink-0 mt-0.5"
                          />
                          <span>
                            <strong>Jurisdiction:</strong> The Dubai Courts
                            shall have exclusive jurisdiction over any appeals
                            and for the enforcement of any arbitration award.
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Changes to Terms */}
                <section
                  id="changes"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <RefreshCw size={24} className="text-primary" />
                      Changes to Terms
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
                        We reserve the right to modify or replace these Terms at
                        any time. If a revision is material, we will provide at
                        least 30 days' notice prior to any new terms taking
                        effect. What constitutes a material change will be
                        determined at our sole discretion.
                      </p>
                      <p className="text-sm text-secondary">
                        By continuing to access or use our Services after any
                        revisions become effective, you agree to be bound by the
                        revised terms. If you do not agree to the new terms, you
                        must stop using the Services.
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
                      If you have any questions about these Terms, please
                      contact us:
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
                            legal@lineup24x7.ae
                          </p>
                          <p className="text-sm text-secondary">
                            support@lineup24x7.ae
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
                          <strong>Legal Notice:</strong> All legal notices must
                          be sent to our registered address in Dubai, UAE, with
                          a copy to legal@lineup24x7.ae.
                        </span>
                      </p>
                    </div>
                  </div>
                </section>

                {/* Download Terms */}
                <div className="flex justify-center pt-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-surface border border-border rounded-xl hover:bg-surface-hover transition-colors text-sm font-medium">
                    <Download size={18} />
                    Download Terms of Service (PDF)
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
              Ready to Get Started?
            </h2>
            <p className="text-lg text-secondary mb-8">
              Join thousands of businesses trusting Lineup24x7 for secure
              communication.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/25 transition-all active:scale-95"
            >
              Create Your Account
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
            <p className="mt-2">License #: DED-1234567 | VAT: AE123456789</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
