import React, { useMemo } from "react";
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
} from "lucide-react";
import { User, Chat, Status, MessageType } from "../../../types";
import { Avatar } from "../../../components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardProps {
  currentUser: User;
  chats: Chat[];
  statuses: Status[];
  isLoading?: boolean;
  onNavigate: (tab: string) => void;
  onChatSelect: (chat: Chat) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  chats,
  statuses,
  isLoading = false,
  onNavigate,
  onChatSelect,
}) => {
  const { user } = useAuth();

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Generate SVG Path for Activity Chart
  const chartPath = useMemo(() => {
    const data = [20, 45, 30, 60, 55, 80, 65, 90, 85, 100, 95, 110];
    const width = 100;
    const height = 40;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    });

    return `M0,${height} L${points.join(" L")} L${width},${height} Z`;
  }, []);

  const linePath = useMemo(() => {
    const data = [20, 45, 30, 60, 55, 80, 65, 90, 85, 100, 95, 110];
    const width = 100;
    const height = 40;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    });
    return `M${points.join(" L")}`;
  }, []);

  // Calculate metrics
  const activeChats = useMemo(() => {
    return chats.filter(chat => 
      chat.members.some(member => 
        member.userId === currentUser.id && !member.isArchived
      )
    ).length;
  }, [chats, currentUser.id]);

  const pinnedChats = useMemo(() => {
    return chats.filter(chat => 
      chat.members.some(member => 
        member.userId === currentUser.id && member.isPinned && !member.isArchived
      )
    ).slice(0, 3); // Show only 3 pinned chats
  }, [chats, currentUser.id]);

  const recentStatuses = useMemo(() => {
    return statuses
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4); // Show only 4 recent statuses
  }, [statuses]);

  const onlineUsers = useMemo(() => {
    // Extract unique users from all chats
    const allUsers = new Map<string, User>();
    chats.forEach(chat => {
      chat.members.forEach(member => {
        if (member.user.id !== currentUser.id) {
          allUsers.set(member.user.id, member.user);
        }
      });
    });
    return Array.from(allUsers.values()).filter(user => user.status === "ONLINE");
  }, [chats, currentUser.id]);

  const unreadMessages = useMemo(() => {
    return chats.reduce((total, chat) => {
      const member = chat.members.find(m => m.userId === currentUser.id);
      return total + (member?.unreadCount || 0);
    }, 0);
  }, [chats, currentUser.id]);

  // Calculate message statistics
  const messageStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const messagesLast24h = chats.reduce((total, chat) => {
      return total + chat.messages.filter(msg => 
        new Date(msg.createdAt) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length;
    }, 0);

    const totalMessages = chats.reduce((total, chat) => 
      total + chat.messages.length, 0
    );

    const messagesByType = chats.reduce((stats, chat) => {
      chat.messages.forEach(msg => {
        if (msg.type === MessageType.TEXT) stats.text++;
        else if (msg.type === MessageType.IMAGE) stats.images++;
        else if (msg.type === MessageType.AUDIO) stats.audio++;
        else if (msg.type === MessageType.FILE) stats.files++;
      });
      return stats;
    }, { text: 0, images: 0, audio: 0, files: 0 });

    return {
      today: messagesLast24h,
      total: totalMessages,
      byType: messagesByType
    };
  }, [chats]);

  if (isLoading) {
    return (
      <div className="flex-1 h-full bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                  {getTimeGreeting()}, {currentUser.name.split(" ")[0]}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-secondary">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-border backdrop-blur-xs text-xs font-medium">
                    <Activity size={14} className="text-green-500" />
                    System Online
                  </span>
                  <p className="text-xs">
                    <span className="hidden md:inline text-primary me-2">
                      •
                    </span>
                    You have{" "}
                    <span className="text-primary font-bold">
                      {unreadMessages} unread message{unreadMessages !== 1 ? 's' : ''}
                    </span>
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

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={MessageSquare}
            label="Active Chats"
            value={activeChats.toString()}
            trend={`+${Math.floor(activeChats * 0.12)}%`}
            color="text-blue-500"
            bg="bg-blue-500/10"
          />
          <MetricCard
            icon={Users}
            label="Team Members"
            value={onlineUsers.length.toString()}
            trend={`+${Math.floor(onlineUsers.length * 0.16)}`}
            color="text-purple-500"
            bg="bg-purple-500/10"
          />
          <MetricCard
            icon={Zap}
            label="Messages Today"
            value={messageStats.today.toString()}
            trend={`+${Math.floor(messageStats.today * 0.25)}%`}
            color="text-orange-500"
            bg="bg-orange-500/10"
          />
          <MetricCard
            icon={HardDrive}
            label="Total Messages"
            value={messageStats.total.toString()}
            trend={`+${Math.floor(messageStats.total * 0.08)}%`}
            color="text-green-500"
            bg="bg-green-500/10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Activity & Chats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Chart */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
                    <BarChart3 size={20} className="text-primary" />
                    Message Volume
                  </h2>
                  <p className="text-xs text-secondary">
                    Real-time message traffic across all channels
                  </p>
                </div>
                <select className="bg-surface-hover border border-border text-xs rounded-lg px-2 py-1 text-text-main focus:outline-none">
                  <option>Last 24 Hours</option>
                  <option>Last 7 Days</option>
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

            {/* Pinned Chats */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
                  <Zap size={20} className="text-yellow-500" />
                  Pinned Conversations
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pinnedChats.map((chat) => {
                  const otherMember = chat.members.find(m => m.userId !== currentUser.id);
                  const myMember = chat.members.find(m => m.userId === currentUser.id);
                  
                  return (
                    <div
                      key={chat.id}
                      onClick={() => {
                        onNavigate("chat");
                        onChatSelect(chat);
                      }}
                      className="group relative bg-surface hover:bg-surface-hover border border-border rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <Avatar
                          user={otherMember?.user}
                          size="md"
                          showStatus={!chat.isGroup}
                        />
                        {myMember?.unreadCount && myMember.unreadCount > 0 && (
                          <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg shadow-primary/30">
                            {myMember.unreadCount} new
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-text-main mb-1 truncate">
                        {chat.isGroup ? chat.groupName : otherMember?.user.name || "Unknown"}
                      </h3>
                      <p className="text-xs text-secondary line-clamp-2 min-h-[2.5em]">
                        {chat.lastMessage?.senderId === currentUser.id ? "You: " : ""}
                        {chat.lastMessage?.content || "Attachment"}
                      </p>

                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[10px] text-secondary">
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {chat.lastMessage?.createdAt || "Just now"}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-primary font-bold flex items-center gap-1">
                          Open Chat <ArrowRight size={10} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                
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

          {/* Right Column: Quick Actions & Status */}
          <div className="space-y-6">
            {/* Quick Actions Panel */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
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
                  icon={Radio}
                  label="Broadcast"
                  onClick={() => {}}
                />
                <QuickActionItem
                  icon={Image}
                  label="Post Status"
                  onClick={() => onNavigate("status")}
                />
              </div>
            </div>

            {/* Recent Updates Feed */}
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
                {recentStatuses.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-start gap-3 group cursor-pointer"
                    onClick={() => onNavigate("status")}
                  >
                    <div className="mt-1 p-0.5 rounded-full bg-linear-to-tr from-primary to-green-400">
                      <div className="p-0.5 bg-surface rounded-full">
                        <Avatar user={status.user} size="md" />
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
                        {new Date(status.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {recentStatuses.length === 0 && (
                  <div className="text-center py-8 text-secondary">
                    <Image size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent status updates</p>
                  </div>
                )}
              </div>
            </div>

            {/* Online Team */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Online Now ({onlineUsers.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {onlineUsers.map((user) => (
                  <div
                    key={user.id}
                    className="relative group cursor-pointer"
                    title={user.name}
                  >
                    <Avatar user={user} size="md" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full"></div>
                  </div>
                ))}
                
                {onlineUsers.length === 0 && (
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

            {/* Message Types Breakdown */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4">
                Message Types
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <MessageTypeStat
                  icon={MessageSquare}
                  label="Text"
                  count={messageStats.byType.text}
                  color="text-blue-500"
                  bg="bg-blue-500/10"
                />
                <MessageTypeStat
                  icon={Image}
                  label="Images"
                  count={messageStats.byType.images}
                  color="text-purple-500"
                  bg="bg-purple-500/10"
                />
                <MessageTypeStat
                  icon={Mic}
                  label="Audio"
                  count={messageStats.byType.audio}
                  color="text-orange-500"
                  bg="bg-orange-500/10"
                />
                <MessageTypeStat
                  icon={FileText}
                  label="Files"
                  count={messageStats.byType.files}
                  color="text-green-500"
                  bg="bg-green-500/10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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