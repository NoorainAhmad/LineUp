import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Users,
  ArrowRight,
  Zap,
  Activity,
  Clock,
  Image,
  FileText,
  Mic,
  BarChart3,
  HardDrive,
  Plus,
  UserPlus,
  Radio,
  Settings,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { User, Chat, Status, DashboardStats } from "../../../types";
import { Avatar } from "../../../components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { UserService } from "@/services/user.service";

interface DashboardProps {
  currentUser: User;
  chats?: Chat[];
  statuses?: Status[];
  isLoading?: boolean;
  onNavigate: (tab: string) => void;
  onChatSelect: (chat: Chat) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  chats = [],
  statuses = [],
  isLoading: propLoading = false,
  onNavigate,
  onChatSelect,
}) => {
  const { user } = useAuth();
  
  // State for API data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<"24h" | "7d">("24h");

  // 🟢 MOVE HELPER FUNCTIONS TO THE TOP - BEFORE useMemo
  const generateChartPath = (data: number[]) => {
    if (!data || data.length === 0) {
      // Return empty path if no data
      return "M0,40 L100,40 L100,40 L0,40 Z";
    }
    const width = 100;
    const height = 40;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    });
    return `M0,${height} L${points.join(" L")} L${width},${height} Z`;
  };

  const generateLinePath = (data: number[]) => {
    if (!data || data.length === 0) {
      // Return empty path if no data
      return "M0,40";
    }
    const width = 100;
    const height = 40;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    });
    return `M${points.join(" L")}`;
  };

  // Generate SVG Path for Activity Chart using real data
  const chartPath = useMemo(() => {
    if (!stats?.messageVolume?.data || stats.messageVolume.data.length === 0) {
      // Fallback to sample data if no real data
      const sampleData = [20, 45, 30, 60, 55, 80, 65, 90, 85, 100, 95, 110];
      return generateChartPath(sampleData);
    }
    return generateChartPath(stats.messageVolume.data);
  }, [stats?.messageVolume?.data]);

  const linePath = useMemo(() => {
    if (!stats?.messageVolume?.data || stats.messageVolume.data.length === 0) {
      const sampleData = [20, 45, 30, 60, 55, 80, 65, 90, 85, 100, 95, 110];
      return generateLinePath(sampleData);
    }
    return generateLinePath(stats.messageVolume.data);
  }, [stats?.messageVolume?.data]);

  // Fetch dashboard stats
  const fetchStats = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const data = await UserService.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching dashboard stats:", err);
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <div className="flex-1 h-full bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex-1 h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Failed to load dashboard"}</p>
          <button
            onClick={() => fetchStats()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-background overflow-y-auto custom-scrollbar p-4 md:p-8 animate-in fade-in duration-500">
      <div className="mx-auto space-y-8 pb-24 md:pb-12">
        {/* Hero Section */}
        <div className="relative rounded-2xl bg-linear-to-br from-surface to-background border border-border overflow-hidden shadow-lg group">
          <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full"></div>
                <Avatar user={currentUser} size="xl" showStatus />
              </div>
              <div>
                <h1 className="text-lg md:text-4xl font-black text-text-main tracking-tight mb-2">
                  {getTimeGreeting()}, {stats.user.name.split(" ")[0]}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-secondary">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-border backdrop-blur-xs text-xs font-medium">
                    <Activity size={14} className="text-green-500" />
                    System Online
                  </span>
                  <p className="text-xs flex items-center gap-2">
                    <span className="hidden md:inline text-primary me-2">
                      •
                    </span>
                    You have{" "}
                    <span className="text-primary font-bold">
                      {stats.metrics.unreadMessages} unread message{stats.metrics.unreadMessages !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => fetchStats(true)}
                      disabled={refreshing}
                      className="ml-2 p-1 hover:bg-surface-hover rounded-full transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                    </button>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <QuickActionButton
                icon={MessageSquare}
                label="Chats"
                onClick={() => onNavigate("chat")}
                primary
              />
              {user?.role === "DEVELOPER" && (
                <QuickActionButton
                  icon={Settings}
                  label="Settings"
                  onClick={() => onNavigate("setting")}
                />
              )}
            </div>
          </div>
        </div>

        {/* Metrics Grid - Using API data */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={MessageSquare}
            label="Active Chats"
            value={stats.metrics.activeChats.toString()}
            trend={`+${stats.messageVolume.trend}%`}
            color="text-blue-500"
            bg="bg-blue-500/10"
          />
          <MetricCard
            icon={Users}
            label="Online Team"
            value={stats.metrics.onlineTeamMembers.toString()}
            trend={`+${Math.floor(stats.metrics.onlineTeamMembers * 0.1)}`}
            color="text-purple-500"
            bg="bg-purple-500/10"
          />
          <MetricCard
            icon={Zap}
            label="Messages Today"
            value={stats.metrics.messagesToday.toString()}
            trend={`+${Math.floor(stats.metrics.messagesToday * 0.15)}%`}
            color="text-orange-500"
            bg="bg-orange-500/10"
          />
          <MetricCard
            icon={HardDrive}
            label="Total Messages"
            value={stats.metrics.totalMessages.toString()}
            trend={`+${Math.floor(stats.metrics.totalMessages * 0.08)}%`}
            color="text-green-500"
            bg="bg-green-500/10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Activity & Chats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Chart - Using real data */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
                    <BarChart3 size={20} className="text-primary" />
                    Message Volume
                  </h2>
                  <p className="text-xs text-secondary">
                    Total: {stats.messageVolume.total} messages • {stats.messageVolume.trend}% vs last hour
                  </p>
                </div>
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as "24h" | "7d")}
                  className="bg-surface-hover border border-border text-xs rounded-lg px-2 py-1 text-text-main focus:outline-none"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                </select>
              </div>

              <div className="h-48 w-full relative">
                <svg
                  viewBox="0 0 100 40"
                  className="w-full h-full preserve-3d"
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
                    d={chartPath}
                    fill="url(#chartGradient)"
                    className="transition-all duration-1000 ease-in-out"
                  />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="0.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[8px] text-secondary">
                  {stats.messageVolume.labels.slice(0, 6).map((label, i) => (
                    <span key={i}>{label}</span>
                  ))}
                </div>

                {/* Overlay Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                  <div className="border-t border-text-main w-full"></div>
                  <div className="border-t border-text-main w-full"></div>
                  <div className="border-t border-text-main w-full"></div>
                  <div className="border-t border-text-main w-full"></div>
                  <div className="border-t border-text-main w-full"></div>
                </div>
              </div>
            </div>

            {/* Pinned Chats - Using API data */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
                  <Zap size={20} className="text-yellow-500" />
                  Pinned Conversations
                </h2>
                <span className="text-xs text-secondary">
                  {stats.pinnedChats.length} pinned
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.pinnedChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      onNavigate("chat");
                      // You'll need to handle chat selection properly
                    }}
                    className="group relative bg-surface hover:bg-surface-hover border border-border rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <Avatar
                        user={chat.avatar}
                        size="md"
                        showStatus={!chat.isGroup}
                      />
                      {chat.unreadCount > 0 && (
                        <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg shadow-primary/30">
                          {chat.unreadCount} new
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-text-main mb-1 truncate">
                      {chat.name}
                    </h3>
                    {chat.lastMessage && (
                      <p className="text-xs text-secondary line-clamp-2 min-h-[2.5em]">
                        {chat.lastMessage.isMe ? "You: " : `${chat.lastMessage.sender}: `}
                        {chat.lastMessage.content}
                      </p>
                    )}

                    {chat.lastMessage && (
                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[10px] text-secondary">
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {chat.lastMessage.time}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-primary font-bold flex items-center gap-1">
                          Open Chat <ArrowRight size={10} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Add New Pinned Placeholder */}
                <div
                  onClick={() => onNavigate("chat")}
                  className="border-2 border-dashed border-border rounded-2xl p-4 flex flex-col items-center justify-center text-secondary hover:text-primary hover:border-primary hover:bg-primary/5 transition-all cursor-pointer min-h-40"
                >
                  <Plus size={24} className="mb-2" />
                  <span className="text-sm font-medium">
                    Pin a conversation
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Actions & Status - Using API data */}
          <div className="space-y-6">
            {/* Quick Actions Panel */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <QuickActionItem
                  icon={UserPlus}
                  label="Add User"
                  onClick={() => onNavigate("user")}
                />
                <QuickActionItem
                  icon={Users}
                  label="New Group"
                  onClick={() => onNavigate("chat")}
                /> 
                <QuickActionItem
                  icon={Image}
                  label="Post Status"
                  onClick={() => onNavigate("status")}
                />
              </div>
            </div>

            {/* Recent Updates Feed - Using API data */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-main">
                  Recent Updates
                </h2>
                <button
                  onClick={() => onNavigate("status")}
                  className="text-primary text-xs font-bold hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {stats.recentStatuses.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-start gap-3 group cursor-pointer"
                    onClick={() => onNavigate("status")}
                  >
                    <div className="mt-1 p-0.5 rounded-full bg-linear-to-tr from-primary to-green-400">
                      <div className="p-0.5 bg-surface rounded-full">
                        <Avatar user={status.user as User} size="md" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text-main group-hover:text-primary transition-colors">
                        {status.user.name}
                      </p>
                      <p className="text-xs text-secondary truncate">
                        {status.type === "IMAGE"
                          ? "Posted a photo"
                          : status.content}
                      </p>
                      <p className="text-[10px] text-secondary mt-0.5">
                        {status.time}
                      </p>
                    </div>
                  </div>
                ))}
                
                {stats.recentStatuses.length === 0 && (
                  <div className="text-center py-8 text-secondary">
                    <Image size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent status updates</p>
                  </div>
                )}
              </div>
            </div>

            {/* Online Team - Using API data */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Online Now ({stats.onlineTeam.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {stats.onlineTeam.map((user) => (
                  <div
                    key={user.id}
                    className="relative group cursor-pointer"
                    title={user.name}
                  >
                    <Avatar user={user as User} size="md" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full"></div>
                  </div>
                ))}
                
                {stats.onlineTeam.length === 0 && (
                  <div className="text-sm text-secondary italic">
                    No team members online
                  </div>
                )}
                
                <button
                  onClick={() => onNavigate("user")}
                  className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center text-secondary hover:text-primary hover:bg-primary/10 transition-all"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Message Types Breakdown - Using API data */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4">
                Message Types
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <MessageTypeStat
                  icon={MessageSquare}
                  label="Text"
                  count={stats.messageTypes.text}
                  color="text-blue-500"
                  bg="bg-blue-500/10"
                />
                <MessageTypeStat
                  icon={Image}
                  label="Images"
                  count={stats.messageTypes.images}
                  color="text-purple-500"
                  bg="bg-purple-500/10"
                />
                <MessageTypeStat
                  icon={Mic}
                  label="Audio"
                  count={stats.messageTypes.audio}
                  color="text-orange-500"
                  bg="bg-orange-500/10"
                />
                <MessageTypeStat
                  icon={FileText}
                  label="Files"
                  count={stats.messageTypes.files}
                  color="text-green-500"
                  bg="bg-green-500/10"
                />
              </div>
            </div>

            {/* Admin Stats - Show if available */}
            {stats.adminStats && (
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4">
                  System Overview
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold">{stats.adminStats.totalUsers}</p>
                    <p className="text-xs text-secondary">Total Users</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.adminStats.activeUsers}</p>
                    <p className="text-xs text-secondary">Active</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.adminStats.totalGroups}</p>
                    <p className="text-xs text-secondary">Groups</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.adminStats.storageUsed}</p>
                    <p className="text-xs text-secondary">Storage</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-secondary flex items-center justify-between">
                    <span>New users today</span>
                    <span className="font-bold text-primary">+{stats.adminStats.newUsersToday}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Keep all your existing helper components (QuickActionButton, MetricCard, etc.)
const QuickActionButton = ({ icon: Icon, label, onClick, primary }: any) => (
  <button
    onClick={onClick}
    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 ${
      primary
        ? "bg-primary text-white hover:bg-primary/90 shadow-primary/25"
        : "bg-surface text-text-main border border-border hover:bg-surface-hover"
    }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

const MetricCard = ({
  icon: Icon,
  label,
  value,
  trend,
  trendDown,
  color,
  bg,
}: any) => (
  <div className="bg-surface border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors shadow-sm group">
    <div className="flex justify-between items-start mb-4">
      <div
        className={`p-3 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform`}
      >
        <Icon size={20} />
      </div>
      <span
        className={`text-xs font-bold px-2 py-1 rounded-lg ${trendDown ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}
      >
        {trend}
      </span>
    </div>
    <h3 className="text-2xl font-black text-text-main mb-1">{value}</h3>
    <p className="text-xs font-medium text-secondary uppercase tracking-wide">
      {label}
    </p>
  </div>
);

const QuickActionItem = ({ icon: Icon, label, onClick }: any) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-surface-hover/50 hover:bg-surface-hover border border-transparent hover:border-primary/20 transition-all group"
  >
    <Icon
      size={20}
      className="text-secondary group-hover:text-primary transition-colors"
    />
    <span className="text-xs font-bold text-text-main">{label}</span>
  </button>
);

const MessageTypeStat = ({ icon: Icon, label, count, color, bg }: any) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-hover/50">
    <div className={`p-2 rounded-lg ${bg} ${color}`}>
      <Icon size={16} />
    </div>
    <div>
      <div className="text-sm font-bold text-text-main">{count}</div>
      <div className="text-xs text-secondary">{label}</div>
    </div>
  </div>
);