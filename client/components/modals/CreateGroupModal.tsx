import React, { useEffect, useState } from "react";
import { X, Check, Search, Users, Loader2 } from "lucide-react";
import { User, UserStatus } from "../../types";
import { Avatar } from "../ui/Avatar";
import { UserService } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";

interface CreateGroupModalProps {
  onClose: () => void;
  onCreate: (name: string, participants: User[]) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  onClose,
  onCreate,
}) => {
  const { user: currentUser } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [allSubordinates, setAllSubordinates] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Recursive function to fetch all subordinates at all levels
  const fetchAllSubordinates = async (userId: string): Promise<User[]> => {
    try {
      // Get direct subordinates
      const directSubs = await UserService.getUserSubordinates(userId);
      
      // For each direct subordinate, fetch their subordinates recursively
      const nestedSubsPromises = directSubs.map(async (sub: User) => {
        const deeperSubs = await fetchAllSubordinates(sub.id);
        return [sub, ...deeperSubs];
      });
      
      const nestedSubs = await Promise.all(nestedSubsPromises);
      
      // Flatten the array and remove duplicates
      return directSubs.concat(...nestedSubs.flat());
    } catch (error) {
      console.error(`Error fetching subordinates for user ${userId}:`, error);
      return [];
    }
  };

  const fetchAllContacts = async () => {
    if (!currentUser?.id) return;
    
    setLoading(true);
    try {
      // For DEVELOPMENT - get all users
      if (currentUser.role === 'DEVELOPER') {
        const allUsers = await UserService.getAllUsers();
        // Filter out current user
        setAllSubordinates(allUsers.filter((u: User) => u.id !== currentUser.id));
      } else {
        // For other roles - get all subordinates at all levels
        const subs = await fetchAllSubordinates(currentUser.id);
        
        // Remove duplicates (same user might appear multiple times in hierarchy)
        const uniqueSubs = Array.from(
          new Map(subs.map((user: User) => [user.id, user])).values()
        );
        
        setAllSubordinates(uniqueSubs);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllContacts();
  }, [currentUser]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleCreate = () => {
    if (!groupName.trim()) return;
    const participants = allSubordinates.filter((u) =>
      selectedIds.has(u.id),
    );
    onCreate(groupName, participants);
    onClose();
  };

  // Filter contacts based on search
  const filteredContacts = allSubordinates.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.guid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery)
  );

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="h-16 px-6 bg-surface border-b border-border flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-text-main">
            {step === 1 ? "Add Participants" : "New Group"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-secondary hover:text-text-main rounded-full hover:bg-surface-hover"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          {step === 1 ? (
            <div className="p-2">
              {/* Search */}
              <div className="px-4 py-2">
                <div className="bg-input rounded-lg flex items-center px-3 py-2 border border-transparent focus-within:border-primary/30 transition-colors">
                  <Search size={18} className="text-secondary mr-2" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    className="bg-transparent w-full focus:outline-none text-text-main placeholder-secondary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Loading state */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={32} className="animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* Selected count */}
                  {selectedIds.size > 0 && (
                    <div className="px-4 py-2 text-sm text-secondary">
                      <span className="font-medium text-primary">{selectedIds.size}</span> selected
                    </div>
                  )}

                  {/* Contacts list */}
                  <div className="mt-2 space-y-1">
                    {filteredContacts.length === 0 ? (
                      <div className="text-center py-8 text-secondary">
                        No contacts found
                      </div>
                    ) : (
                      filteredContacts.map((user) => {
                        const isSelected = selectedIds.has(user.id);
                        return (
                          <div
                            key={user.id}
                            onClick={() => toggleSelection(user.id)}
                            className={`flex items-center gap-3 p-3 mx-2 rounded-xl cursor-pointer transition-colors ${
                              isSelected ? "bg-primary/10" : "hover:bg-surface-hover"
                            }`}
                          >
                            <div className="relative">
                              <Avatar user={user} size="md" showStatus />
                              {isSelected && (
                                <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-0.5 border-2 border-surface">
                                  <Check size={12} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`font-medium truncate ${
                                    isSelected ? "text-primary" : "text-text-main"
                                  }`}
                                >
                                  {user.name}
                                </p>
                                <span className="text-[10px] text-secondary bg-surface-hover px-1.5 py-0.5 rounded-full shrink-0">
                                  {user.role}
                                </span>
                              </div>
                              <p className="text-xs text-secondary truncate">
                                {user.email || `GUID: ${user.guid}` || "No contact info"}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="p-8 flex flex-col items-center">
              {/* Group icon */}
              <div className="w-24 h-24 bg-surface-hover rounded-full mb-6 flex items-center justify-center border-2 border-dashed border-secondary/30 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                <Users
                  size={32}
                  className="text-secondary group-hover:text-primary"
                />
              </div>

              {/* Group name input */}
              <input
                type="text"
                placeholder="Group Subject"
                autoFocus
                className="w-full bg-input text-text-main px-4 py-3 rounded-xl border-b-2 border-primary focus:outline-none text-center text-lg mb-6"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />

              {/* Participants list */}
              <div className="w-full">
                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Participants: {selectedIds.size}</span>
                  <button
                    onClick={() => setStep(1)}
                    className="text-primary text-xs hover:underline"
                  >
                    Edit
                  </button>
                </p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                  {filteredContacts.filter((u) => selectedIds.has(u.id)).length === 0 ? (
                    <p className="text-sm text-secondary">No participants selected</p>
                  ) : (
                    filteredContacts
                      .filter((u) => selectedIds.has(u.id))
                      .map((u) => (
                        <span
                          key={u.id}
                          className="text-xs bg-surface-hover text-text-main px-2 py-1 rounded-md border border-border flex items-center gap-1"
                        >
                          {u.name}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelection(u.id);
                            }}
                            className="ml-1 hover:bg-surface rounded-full p-0.5"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-hover/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-medium text-secondary hover:bg-surface-hover transition-colors"
          >
            Cancel
          </button>
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={selectedIds.size === 0}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              Next ({selectedIds.size})
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={!groupName.trim()}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <Check size={18} />
              Create Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
};