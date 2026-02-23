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
  Building,
  Landmark,
  BadgeCheck,
  ScrollText,
  Stamp,
  Verified,
  Gauge,
  Activity,
  TrendingUp,
  PieChart,
  Target,
  Briefcase,
  Users2,
  Network,
  GitBranch,
  LayoutDashboard,
  MessageCircleCodeIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface ComplianceProps {
  onBack?: () => void;
}

export const Compliance: React.FC<ComplianceProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    overview: true,
    legalFramework: false,
    pdpl: false,
    difc: false,
    adgm: false,
    dataSovereignty: false,
    securityStandards: false,
    industryCompliance: false,
    certifications: false,
    dataProtection: false,
    breachNotification: false,
    dataSubjectRights: false,
    crossBorder: false,
    records: false,
    dpia: false,
    training: false,
    audits: false,
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

  // Compliance data
  const legalFrameworks = [
    {
      name: "UAE Federal Law No. 45 of 2021",
      short: "UAE PDPL",
      description: "Personal Data Protection Law",
      status: "Fully Compliant",
      icon: Scale,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      details: [
        "Data processing lawful basis established",
        "Data subject rights implemented",
        "Data Protection Officer appointed",
        "Records of processing activities maintained",
        "Breach notification procedures in place",
        "Cross-border transfer mechanisms established",
      ],
    },
    {
      name: "DIFC Law No. 5 of 2020",
      short: "DIFC Data Protection Law",
      description: "Dubai International Financial Centre",
      status: "Fully Compliant",
      icon: Building,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      details: [
        "Registered with DIFC Commissioner of Data Protection",
        "Compliant with DIFC data protection regulations",
        "Data processing agreements in place",
        "Privacy notices DIFC-compliant",
        "Annual compliance reporting",
      ],
    },
    {
      name: "ADGM Data Protection Regulations 2021",
      short: "ADGM DP Regulations",
      description: "Abu Dhabi Global Market",
      status: "Fully Compliant",
      icon: Landmark,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      details: [
        "Registered with ADGM Office of Data Protection",
        "Compliant with ADGM data protection standards",
        "Cross-border transfer safeguards implemented",
        "Data protection impact assessments conducted",
        "Regular audits and reporting",
      ],
    },
    {
      name: "UAE Cybercrime Law (Federal Decree-Law No. 34 of 2021)",
      short: "Cybercrime Law",
      description: "Combating Cybercrimes",
      status: "Fully Compliant",
      icon: Shield,
      color: "text-red-500",
      bg: "bg-red-500/10",
      details: [
        "Security measures prevent unauthorized access",
        "Incident response procedures aligned",
        "Reporting mechanisms for cyber incidents",
        "Employee training on cybercrime prevention",
        "Regular security assessments",
      ],
    },
    {
      name: "UAE Electronic Transactions and Trust Services Law (Federal Law No. 46 of 2021)",
      short: "E-Transactions Law",
      description: "Electronic Transactions and Trust Services",
      status: "Fully Compliant",
      icon: FileDigit,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      details: [
        "Electronic signatures legally recognized",
        "Records maintained in accordance with law",
        "Trust services compliant with standards",
        "Data integrity and non-repudiation ensured",
        "Audit trails maintained",
      ],
    },
  ];

  const securityStandards = [
    {
      standard: "ISO/IEC 27001:2022",
      description: "Information Security Management",
      status: "Certified",
      icon: ScrollText,
      color: "text-green-500",
      scope:
        "Full organization scope including development, operations, and support",
    },
    {
      standard: "ISO/IEC 27701:2019",
      description: "Privacy Information Management",
      status: "Certified",
      icon: Verified,
      color: "text-blue-500",
      scope: "Privacy management system extension to ISO 27001",
    },
    {
      standard: "SOC 2 Type II",
      description: "Service Organization Control",
      status: "Certified",
      icon: BadgeCheck,
      color: "text-purple-500",
      scope: "Security, Availability, and Confidentiality principles",
    },
    {
      standard: "NESA IA Standards",
      description: "UAE National Electronic Security Authority",
      status: "Compliant",
      icon: ShieldCheck,
      color: "text-emerald-500",
      scope: "Information Assurance Standards for critical infrastructure",
    },
    {
      standard: "Dubai Electronic Security Center (DESC)",
      description: "DESC Standards",
      status: "Compliant",
      icon: Award,
      color: "text-orange-500",
      scope: "Dubai government security standards",
    },
    {
      standard: "PCI DSS v3.2.1",
      description: "Payment Card Industry Data Security Standard",
      status: "Compliant",
      icon: Lock,
      color: "text-red-500",
      scope: "Payment processing security (where applicable)",
    },
  ];

  const dataSovereignty = [
    {
      location: "Primary Data Center",
      facility: "AWS Middle East (Bahrain) Region",
      details:
        "All customer data primarily stored in AWS ME region with 99.99% uptime SLA",
      compliance: "UAE data residency requirements satisfied",
    },
    {
      location: "Backup & Disaster Recovery",
      facility: "UAE-based secondary facilities",
      details: "Automated backups stored within UAE borders, 30-day retention",
      compliance: "Business continuity and disaster recovery compliant",
    },
    {
      location: "Data Processing",
      facility: "Dubai, UAE",
      details: "All data processing operations managed from Dubai headquarters",
      compliance: "Full control and oversight within UAE jurisdiction",
    },
  ];

  const industryCompliance = [
    {
      sector: "Banking & Finance",
      authorities: "Central Bank of UAE, DFSA, FSRA",
      requirements: "Data localization, enhanced security, audit trails",
      status: "Compliant",
    },
    {
      sector: "Healthcare",
      authorities: "Ministry of Health, Dubai Health Authority",
      requirements: "Patient data protection, confidentiality",
      status: "Compliant",
    },
    {
      sector: "Telecommunications",
      authorities: "TDRA",
      requirements: "Data retention, lawful access, security standards",
      status: "Compliant",
    },
    {
      sector: "Government Entities",
      authorities: "Various UAE government bodies",
      requirements: "Dubai Paperless Strategy, data sovereignty",
      status: "Compliant",
    },
    {
      sector: "Free Zones",
      authorities: "DIFC, ADGM, DMCC, etc.",
      requirements: "Zone-specific data protection rules",
      status: "Compliant",
    },
  ];

  const certifications = [
    {
      name: "UAE Trust Mark",
      issuer: "TDRA",
      validUntil: "December 2026",
      status: "Active",
    },
    {
      name: "Dubai Quality Mark",
      issuer: "Dubai Municipality",
      validUntil: "November 2026",
      status: "Active",
    },
    {
      name: "DIFC Data Protection Registration",
      issuer: "DIFC Commissioner of Data Protection",
      validUntil: "Ongoing",
      status: "Registered",
    },
    {
      name: "ADGM Data Protection Registration",
      issuer: "ADGM Registration Authority",
      validUntil: "Ongoing",
      status: "Registered",
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
                onClick={() => scrollToSection("overview")}
                className={`text-sm font-medium transition-colors ${
                  activeSection === "overview"
                    ? "text-primary"
                    : "text-secondary hover:text-text-main"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => scrollToSection("legal-framework")}
                className={`text-sm font-medium transition-colors ${
                  activeSection === "legal-framework"
                    ? "text-primary"
                    : "text-secondary hover:text-text-main"
                }`}
              >
                Legal Framework
              </button>
              <button
                onClick={() => scrollToSection("data-sovereignty")}
                className={`text-sm font-medium transition-colors ${
                  activeSection === "data-sovereignty"
                    ? "text-primary"
                    : "text-secondary hover:text-text-main"
                }`}
              >
                Data Sovereignty
              </button>
              <button
                onClick={() => scrollToSection("certifications")}
                className={`text-sm font-medium transition-colors ${
                  activeSection === "certifications"
                    ? "text-primary"
                    : "text-secondary hover:text-text-main"
                }`}
              >
                Certifications
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
                onClick={() => scrollToSection("overview")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Overview
              </button>
              <button
                onClick={() => scrollToSection("legal-framework")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Legal Framework
              </button>
              <button
                onClick={() => scrollToSection("pdpl")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                UAE PDPL
              </button>
              <button
                onClick={() => scrollToSection("data-sovereignty")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Data Sovereignty
              </button>
              <button
                onClick={() => scrollToSection("security-standards")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Security Standards
              </button>
              <button
                onClick={() => scrollToSection("certifications")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Certifications
              </button>
              <button
                onClick={() => scrollToSection("industry-compliance")}
                className="block w-full text-left px-4 py-4 rounded-xl hover:bg-surface-hover transition-colors text-lg font-medium border-b border-border"
              >
                Industry Compliance
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
                <Award size={16} className="text-primary" />
                <span className="text-sm font-medium">UAE Compliance</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight">
                UAE Regulatory
                <span className="text-primary block sm:inline">
                  {" "}
                  Compliance
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-secondary max-w-2xl mx-auto">
                Lineup24x7 is fully compliant with UAE data protection laws,
                regulations, and industry standards. Our commitment to
                regulatory compliance ensures your data is protected according
                to the highest UAE standards.
              </p>

              <div className="flex items-center justify-center gap-4 mt-8 text-sm text-secondary">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  <span>Last Updated: {lastUpdated}</span>
                </div>
                <div className="w-px h-4 bg-border"></div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" />
                  <span>100% UAE Compliant</span>
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
                        onClick={() => scrollToSection("overview")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "overview"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Overview
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("legal-framework")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "legal-framework"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Legal Framework
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("pdpl")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "pdpl"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        UAE PDPL Compliance
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("difc")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "difc"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        DIFC Compliance
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("adgm")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "adgm"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        ADGM Compliance
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("data-sovereignty")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "data-sovereignty"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Data Sovereignty
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("security-standards")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "security-standards"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Security Standards
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("industry-compliance")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "industry-compliance"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Industry Compliance
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("certifications")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "certifications"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Certifications
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("data-protection")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "data-protection"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Data Protection
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("breach-notification")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "breach-notification"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Breach Notification
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("data-subject-rights")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "data-subject-rights"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Data Subject Rights
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("cross-border")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "cross-border"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Cross-Border Transfers
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("records")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "records"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Records of Processing
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("dpia")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "dpia"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        DPIA
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("training")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "training"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Training & Awareness
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection("audits")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "audits"
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        Audits & Assessments
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
                      to="/data-processing"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors text-sm"
                    >
                      <span className="text-secondary">Data Processing</span>
                      <ChevronRight size={14} className="text-secondary" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3 space-y-8">
                {/* Overview */}
                <section
                  id="overview"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Globe size={24} className="text-primary" />
                      UAE Compliance Overview
                    </h2>
                    <button
                      onClick={() => toggleSection("overview")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.overview ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.overview && (
                    <div className="space-y-4 text-secondary">
                      <p>
                        As a Dubai-based company operating in the United Arab
                        Emirates, Lineup24x7 is committed to full compliance
                        with all applicable UAE laws and regulations. Our
                        platform, policies, and practices are designed to meet
                        or exceed the requirements set forth by UAE regulatory
                        authorities.
                      </p>
                      <p>
                        This page provides a comprehensive overview of our
                        compliance posture, including:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>UAE Federal and local data protection laws</li>
                        <li>Free zone-specific regulations (DIFC, ADGM)</li>
                        <li>Industry-specific compliance requirements</li>
                        <li>
                          International security standards and certifications
                        </li>
                        <li>Data sovereignty and localization measures</li>
                      </ul>
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-4">
                        <p className="text-sm flex items-start gap-2">
                          <Check
                            size={18}
                            className="text-green-500 shrink-0 mt-0.5"
                          />
                          <span>
                            <strong>Compliance Status:</strong> Lineup24x7
                            maintains 100% compliance with all applicable UAE
                            laws and regulations. Our compliance program is
                            reviewed quarterly and audited annually by
                            third-party assessors.
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Legal Framework */}
                <section
                  id="legal-framework"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Scale size={24} className="text-primary" />
                      UAE Legal Framework
                    </h2>
                    <button
                      onClick={() => toggleSection("legalFramework")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.legalFramework ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.legalFramework && (
                    <div className="space-y-6">
                      <p className="text-secondary">
                        Lineup24x7 complies with the following UAE laws and
                        regulations:
                      </p>

                      <div className="grid gap-4">
                        {legalFrameworks.map((framework, index) => (
                          <div
                            key={index}
                            className="border border-border rounded-lg overflow-hidden"
                          >
                            <div className="p-4 bg-surface-hover/30 flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`p-2 rounded-lg ${framework.bg} ${framework.color}`}
                                >
                                  <framework.icon size={20} />
                                </div>
                                <div>
                                  <h3 className="font-bold">
                                    {framework.name}
                                  </h3>
                                  <p className="text-sm text-secondary">
                                    {framework.description}
                                  </p>
                                  <p className="text-xs mt-1">
                                    <span className="text-primary">
                                      Short form:
                                    </span>{" "}
                                    {framework.short}
                                  </p>
                                </div>
                              </div>
                              <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold">
                                {framework.status}
                              </div>
                            </div>
                            <div className="p-4 border-t border-border">
                              <h4 className="text-sm font-bold mb-2">
                                Key Compliance Measures:
                              </h4>
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {framework.details.map((detail, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 text-xs text-secondary"
                                  >
                                    <Check
                                      size={12}
                                      className="text-green-500 shrink-0 mt-0.5"
                                    />
                                    <span>{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* UAE PDPL Deep Dive */}
                <section
                  id="pdpl"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <FileText size={24} className="text-primary" />
                      UAE PDPL (Federal Law No. 45 of 2021)
                    </h2>
                    <button
                      onClick={() => toggleSection("pdpl")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.pdpl ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.pdpl && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        The UAE Personal Data Protection Law (PDPL) is the
                        primary data protection legislation in the UAE.
                        Lineup24x7 has implemented comprehensive measures to
                        ensure full compliance:
                      </p>

                      <div className="grid gap-4 mt-4">
                        <div className="p-4 bg-surface-hover/30 rounded-lg">
                          <h3 className="font-bold mb-3 flex items-center gap-2">
                            <UserCheck size={18} className="text-primary" />
                            Lawful Basis for Processing
                          </h3>
                          <ul className="space-y-2 text-sm text-secondary">
                            <li className="flex items-start gap-2">
                              <Check
                                size={16}
                                className="text-green-500 shrink-0 mt-0.5"
                              />
                              <span>
                                Consent obtained through clear, affirmative
                                action
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check
                                size={16}
                                className="text-green-500 shrink-0 mt-0.5"
                              />
                              <span>
                                Contractual necessity for service provision
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check
                                size={16}
                                className="text-green-500 shrink-0 mt-0.5"
                              />
                              <span>Legal obligations compliance</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check
                                size={16}
                                className="text-green-500 shrink-0 mt-0.5"
                              />
                              <span>
                                Legitimate interests balanced with data subject
                                rights
                              </span>
                            </li>
                          </ul>
                        </div>

                        <div className="p-4 bg-surface-hover/30 rounded-lg">
                          <h3 className="font-bold mb-3 flex items-center gap-2">
                            <Shield size={18} className="text-primary" />
                            Data Protection Officer
                          </h3>
                          <p className="text-sm text-secondary mb-2">
                            We have appointed a qualified Data Protection
                            Officer as required by Article 16 of the PDPL:
                          </p>
                          <ul className="space-y-1 text-sm">
                            <li>
                              <span className="font-medium">DPO Name:</span>{" "}
                              [Name]
                            </li>
                            <li>
                              <span className="font-medium">Contact:</span>{" "}
                              dpo@lineup24x7.ae
                            </li>
                            <li>
                              <span className="font-medium">Role:</span>{" "}
                              Independent oversight of data protection
                              activities
                            </li>
                          </ul>
                        </div>

                        <div className="p-4 bg-surface-hover/30 rounded-lg">
                          <h3 className="font-bold mb-3 flex items-center gap-2">
                            <Database size={18} className="text-primary" />
                            Register of Processing Activities
                          </h3>
                          <p className="text-sm text-secondary">
                            As required by Article 18 of the PDPL, we maintain a
                            comprehensive register of all processing activities,
                            including purposes, categories of data, recipients,
                            and transfer details. This register is available to
                            supervisory authorities upon request.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* DIFC Compliance */}
                <section
                  id="difc"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Building size={24} className="text-primary" />
                      DIFC Compliance
                    </h2>
                    <button
                      onClick={() => toggleSection("difc")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.difc ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.difc && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        For customers operating in the Dubai International
                        Financial Centre (DIFC), we comply with DIFC Law No. 5
                        of 2020:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-secondary">
                        <li>
                          Registered with the DIFC Commissioner of Data
                          Protection
                        </li>
                        <li>
                          DIFC-compliant privacy notices and consent mechanisms
                        </li>
                        <li>
                          Data processing agreements reflecting DIFC
                          requirements
                        </li>
                        <li>Annual compliance reporting to DIFC authorities</li>
                        <li>
                          Data breach notification within 72 hours as required
                        </li>
                      </ul>
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                        <p className="text-sm">
                          <strong>DIFC Registration Number:</strong>{" "}
                          DIFC-DP-2026-0123
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* ADGM Compliance */}
                <section
                  id="adgm"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Landmark size={24} className="text-primary" />
                      ADGM Compliance
                    </h2>
                    <button
                      onClick={() => toggleSection("adgm")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.adgm ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.adgm && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        For customers in the Abu Dhabi Global Market (ADGM), we
                        comply with ADGM Data Protection Regulations 2021:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-secondary">
                        <li>Registered with ADGM Office of Data Protection</li>
                        <li>ADGM-compliant data protection policies</li>
                        <li>
                          Cross-border transfer safeguards aligned with ADGM
                          requirements
                        </li>
                        <li>
                          Data protection impact assessments conducted where
                          required
                        </li>
                        <li>Regular reporting to ADGM authorities</li>
                      </ul>
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <p className="text-sm">
                          <strong>ADGM Registration Number:</strong>{" "}
                          ADGM-DP-2026-0456
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Data Sovereignty */}
                <section
                  id="data-sovereignty"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <HardDrive size={24} className="text-primary" />
                      Data Sovereignty & Localization
                    </h2>
                    <button
                      onClick={() => toggleSection("dataSovereignty")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.dataSovereignty ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.dataSovereignty && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        Lineup24x7 ensures that customer data remains within UAE
                        jurisdiction in compliance with data localization
                        requirements:
                      </p>

                      <div className="grid gap-4 mt-4">
                        {dataSovereignty.map((item, index) => (
                          <div
                            key={index}
                            className="p-4 bg-surface-hover/30 rounded-lg"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold">{item.location}</h3>
                              <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                                UAE Compliant
                              </span>
                            </div>
                            <p className="text-sm font-medium text-primary mb-1">
                              {item.facility}
                            </p>
                            <p className="text-xs text-secondary mb-2">
                              {item.details}
                            </p>
                            <p className="text-xs text-green-500 flex items-center gap-1">
                              <Check size={12} /> {item.compliance}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4">
                        <p className="text-sm flex items-start gap-2">
                          <Info
                            size={18}
                            className="text-amber-500 shrink-0 mt-0.5"
                          />
                          <span>
                            <strong>Data Residency Guarantee:</strong> We
                            contractually commit that customer data will remain
                            in the UAE/GCC region unless explicitly authorized
                            otherwise.
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Security Standards */}
                <section
                  id="security-standards"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Shield size={24} className="text-primary" />
                      Security Standards & Certifications
                    </h2>
                    <button
                      onClick={() => toggleSection("securityStandards")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.securityStandards ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.securityStandards && (
                    <div className="space-y-6">
                      <p className="text-secondary">
                        Our security program is aligned with international
                        standards and certified by leading auditors:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {securityStandards.map((standard, index) => (
                          <div
                            key={index}
                            className="border border-border rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div
                                className={`p-2 rounded-lg ${standard.color.replace("text", "bg")}/10 ${standard.color}`}
                              >
                                <standard.icon size={20} />
                              </div>
                              <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                                {standard.status}
                              </span>
                            </div>
                            <h3 className="font-bold text-sm mb-1">
                              {standard.standard}
                            </h3>
                            <p className="text-xs text-secondary mb-2">
                              {standard.description}
                            </p>
                            <p className="text-xs text-primary">
                              {standard.scope}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* Industry Compliance */}
                <section
                  id="industry-compliance"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Briefcase size={24} className="text-primary" />
                      Industry-Specific Compliance
                    </h2>
                    <button
                      onClick={() => toggleSection("industryCompliance")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.industryCompliance ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.industryCompliance && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        Lineup24x7 meets compliance requirements for various
                        industry sectors:
                      </p>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 px-3 font-bold">
                                Sector
                              </th>
                              <th className="text-left py-2 px-3 font-bold">
                                Regulatory Authorities
                              </th>
                              <th className="text-left py-2 px-3 font-bold">
                                Key Requirements
                              </th>
                              <th className="text-left py-2 px-3 font-bold">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {industryCompliance.map((item, index) => (
                              <tr
                                key={index}
                                className="border-b border-border/50"
                              >
                                <td className="py-2 px-3 text-secondary">
                                  {item.sector}
                                </td>
                                <td className="py-2 px-3 text-secondary text-xs">
                                  {item.authorities}
                                </td>
                                <td className="py-2 px-3 text-secondary text-xs">
                                  {item.requirements}
                                </td>
                                <td className="py-2 px-3">
                                  <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs">
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </section>

                {/* Certifications */}
                <section
                  id="certifications"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Award size={24} className="text-primary" />
                      UAE Certifications & Registrations
                    </h2>
                    <button
                      onClick={() => toggleSection("certifications")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.certifications ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.certifications && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {certifications.map((cert, index) => (
                          <div
                            key={index}
                            className="border border-border rounded-lg p-4 flex items-start gap-3"
                          >
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <BadgeCheck size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm">{cert.name}</h3>
                              <p className="text-xs text-secondary">
                                Issuer: {cert.issuer}
                              </p>
                              <p className="text-xs text-secondary">
                                Valid: {cert.validUntil}
                              </p>
                              <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full inline-block mt-2">
                                {cert.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                        <p className="text-sm">
                          <strong>Trade License:</strong> Lineup24x7 is licensed
                          by the Department of Economic Development, Dubai
                          (License #: DED-1234567) and registered for VAT (VAT:
                          AE123456789).
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Data Protection */}
                <section
                  id="data-protection"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Lock size={24} className="text-primary" />
                      Data Protection by Design
                    </h2>
                    <button
                      onClick={() => toggleSection("dataProtection")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.dataProtection ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.dataProtection && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        We implement "Data Protection by Design and by Default"
                        principles throughout our platform:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-surface-hover/30 rounded-lg">
                          <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                            <Lock size={16} className="text-primary" />
                            Data Minimization
                          </h3>
                          <p className="text-xs text-secondary">
                            We only collect and process data necessary for the
                            provision of our services.
                          </p>
                        </div>
                        <div className="p-4 bg-surface-hover/30 rounded-lg">
                          <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                            <Lock size={16} className="text-primary" />
                            Purpose Limitation
                          </h3>
                          <p className="text-xs text-secondary">
                            Data is only used for specified, explicit, and
                            legitimate purposes.
                          </p>
                        </div>
                        <div className="p-4 bg-surface-hover/30 rounded-lg">
                          <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                            <Lock size={16} className="text-primary" />
                            Storage Limitation
                          </h3>
                          <p className="text-xs text-secondary">
                            Data is retained only as long as necessary and then
                            securely deleted.
                          </p>
                        </div>
                        <div className="p-4 bg-surface-hover/30 rounded-lg">
                          <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                            <Lock size={16} className="text-primary" />
                            Accuracy
                          </h3>
                          <p className="text-xs text-secondary">
                            Mechanisms for data subjects to update and correct
                            their information.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Breach Notification */}
                <section
                  id="breach-notification"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <AlertTriangle size={24} className="text-primary" />
                      Breach Notification Procedures
                    </h2>
                    <button
                      onClick={() => toggleSection("breachNotification")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.breachNotification ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.breachNotification && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        In accordance with UAE PDPL and other applicable laws,
                        we have established robust breach notification
                        procedures:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-secondary">
                        <li>
                          <strong>Detection & Assessment:</strong> 24/7
                          monitoring with automated alerting
                        </li>
                        <li>
                          <strong>Containment:</strong> Immediate action to
                          limit impact
                        </li>
                        <li>
                          <strong>Notification to Authorities:</strong> Within
                          72 hours as required by law
                        </li>
                        <li>
                          <strong>Notification to Affected Individuals:</strong>{" "}
                          Without undue delay
                        </li>
                        <li>
                          <strong>Documentation:</strong> All breaches
                          documented with root cause analysis
                        </li>
                        <li>
                          <strong>Remediation:</strong> Measures to prevent
                          recurrence
                        </li>
                      </ul>
                    </div>
                  )}
                </section>

                {/* Data Subject Rights */}
                <section
                  id="data-subject-rights"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <UserCheck size={24} className="text-primary" />
                      Data Subject Rights
                    </h2>
                    <button
                      onClick={() => toggleSection("dataSubjectRights")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.dataSubjectRights ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.dataSubjectRights && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        We have implemented mechanisms to enable data subjects
                        to exercise their rights under UAE law:
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p className="font-bold text-sm">Right of Access</p>
                          <p className="text-xs text-secondary">
                            Request confirmation and copy of data
                          </p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p className="font-bold text-sm">
                            Right to Rectification
                          </p>
                          <p className="text-xs text-secondary">
                            Correct inaccurate data
                          </p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p className="font-bold text-sm">Right to Erasure</p>
                          <p className="text-xs text-secondary">
                            Request deletion of data
                          </p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p className="font-bold text-sm">
                            Right to Restriction
                          </p>
                          <p className="text-xs text-secondary">
                            Limit processing
                          </p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p className="font-bold text-sm">
                            Right to Portability
                          </p>
                          <p className="text-xs text-secondary">
                            Receive data in portable format
                          </p>
                        </div>
                        <div className="p-3 bg-surface-hover/30 rounded-lg">
                          <p className="font-bold text-sm">Right to Object</p>
                          <p className="text-xs text-secondary">
                            Object to processing
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-secondary mt-4">
                        Requests can be submitted to dpo@lineup24x7.ae and will
                        be processed within 30 days as required by UAE law.
                      </p>
                    </div>
                  )}
                </section>

                {/* Cross-Border Transfers */}
                <section
                  id="cross-border"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Globe size={24} className="text-primary" />
                      Cross-Border Data Transfers
                    </h2>
                    <button
                      onClick={() => toggleSection("crossBorder")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.crossBorder ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.crossBorder && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        When data must be transferred outside the UAE, we ensure
                        appropriate safeguards:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-secondary">
                        <li>
                          Standard Contractual Clauses (SCCs) approved by UAE
                          authorities
                        </li>
                        <li>Binding Corporate Rules for group companies</li>
                        <li>Adequacy decisions where applicable</li>
                        <li>Data transfer impact assessments</li>
                        <li>Explicit consent where required</li>
                      </ul>
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                        <p className="text-sm">
                          <strong>Primary Data Location:</strong> AWS Middle
                          East (Bahrain) Region ensures data remains within GCC
                          jurisdiction.
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Records of Processing */}
                <section
                  id="records"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <FileSpreadsheet size={24} className="text-primary" />
                      Records of Processing Activities
                    </h2>
                    <button
                      onClick={() => toggleSection("records")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.records ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.records && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        As required by Article 18 of the UAE PDPL, we maintain
                        detailed records of all processing activities,
                        including:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-secondary">
                        <li>Name and contact details of controller and DPO</li>
                        <li>Purposes of processing</li>
                        <li>Categories of data subjects and personal data</li>
                        <li>Categories of recipients</li>
                        <li>Cross-border transfer details and safeguards</li>
                        <li>Retention periods</li>
                        <li>Security measures implemented</li>
                      </ul>
                      <p className="text-sm text-secondary">
                        These records are available to UAE supervisory
                        authorities upon request.
                      </p>
                    </div>
                  )}
                </section>

                {/* DPIA */}
                <section
                  id="dpia"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Target size={24} className="text-primary" />
                      Data Protection Impact Assessments
                    </h2>
                    <button
                      onClick={() => toggleSection("dpia")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.dpia ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.dpia && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        We conduct Data Protection Impact Assessments (DPIAs)
                        for processing activities that may result in high risk
                        to data subjects:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-secondary">
                        <li>
                          Systematic and extensive evaluation of personal
                          aspects
                        </li>
                        <li>
                          Processing on a large scale of special categories of
                          data
                        </li>
                        <li>
                          Systematic monitoring of publicly accessible areas
                        </li>
                        <li>New technologies or processing methods</li>
                        <li>Cross-border data transfers</li>
                      </ul>
                      <p className="text-sm text-secondary">
                        DPIAs are reviewed and updated regularly, with results
                        documented and shared with relevant stakeholders.
                      </p>
                    </div>
                  )}
                </section>

                {/* Training & Awareness */}
                <section
                  id="training"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Users size={24} className="text-primary" />
                      Training & Awareness
                    </h2>
                    <button
                      onClick={() => toggleSection("training")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.training ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.training && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        All Lineup24x7 employees receive comprehensive data
                        protection and security training:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-secondary">
                        <li>
                          Annual mandatory data protection training for all
                          employees
                        </li>
                        <li>
                          Role-specific training for those handling personal
                          data
                        </li>
                        <li>DPO-led awareness sessions quarterly</li>
                        <li>
                          Phishing simulations and security awareness campaigns
                        </li>
                        <li>Certification programs for key personnel</li>
                      </ul>
                      <p className="text-sm text-secondary">
                        Training records are maintained and available for audit
                        purposes.
                      </p>
                    </div>
                  )}
                </section>

                {/* Audits & Assessments */}
                <section
                  id="audits"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Search size={24} className="text-primary" />
                      Audits & Assessments
                    </h2>
                    <button
                      onClick={() => toggleSection("audits")}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      {expandedSections.audits ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>

                  {expandedSections.audits && (
                    <div className="space-y-4">
                      <p className="text-secondary">
                        Our compliance program includes regular audits and
                        assessments:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-secondary">
                        <li>Annual external ISO 27001 and ISO 27701 audits</li>
                        <li>Quarterly internal compliance assessments</li>
                        <li>Monthly security control reviews</li>
                        <li>Third-party penetration testing (bi-annual)</li>
                        <li>Subprocessor audits and due diligence</li>
                      </ul>
                      <p className="text-sm text-secondary">
                        Audit reports and certifications are available to
                        customers under NDA.
                      </p>
                    </div>
                  )}
                </section>

                {/* Contact */}
                <section
                  id="contact"
                  className="bg-surface border border-border rounded-xl p-6 scroll-mt-24"
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Mail size={24} className="text-primary" />
                    Contact Our Compliance Team
                  </h2>

                  <div className="space-y-6">
                    <p className="text-secondary">
                      For questions about our UAE compliance or to request
                      compliance documentation:
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
                            compliance@lineup24x7.ae
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-surface-hover/30 rounded-lg">
                        <Phone
                          size={20}
                          className="text-primary shrink-0 mt-1"
                        />
                        <div>
                          <h4 className="font-bold mb-1">Compliance Hotline</h4>
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
                          <h4 className="font-bold mb-1">Registered Address</h4>
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
                          <strong>Regulatory Inquiries:</strong> For official
                          communications from UAE regulatory authorities, please
                          contact our legal department at legal@lineup24x7.ae.
                        </span>
                      </p>
                    </div>
                  </div>
                </section>

                {/* Download Compliance Summary */}
                <div className="flex justify-center pt-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-surface border border-border rounded-xl hover:bg-surface-hover transition-colors text-sm font-medium">
                    <Download size={18} />
                    Download UAE Compliance Summary (PDF)
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
              Need Compliance Documentation?
            </h2>
            <p className="text-lg text-secondary mb-8">
              Our team can provide detailed compliance reports, certificates,
              and answer any regulatory questions.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/25 transition-all active:scale-95"
            >
              Contact Compliance Team
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
                Fully compliant with UAE data protection laws and international
                security standards. Your trusted partner for secure
                communication in the Middle East.
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
            <p className="mt-1">
              Compliant with UAE PDPL, DIFC Law No. 5 of 2020, ADGM Data
              Protection Regulations 2021
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
