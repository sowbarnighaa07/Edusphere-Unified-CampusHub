import { useState, useEffect, useRef } from 'react';
import { groupService } from '../../services/group.service';
import { GroupSummary, GroupDetail, GroupMessage } from '../../types/group.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Textarea';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { useAuth } from '../../hooks/useAuth';
import {
  Users,
  MessageSquare,
  Send,
  LogOut,
  RefreshCw,
  BookOpen,
  Briefcase,
  Building2,
  Globe,
  Star,
  Tag,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GROUP_TYPE_LABELS: Record<string, string> = {
  ACADEMIC: 'Academic',
  PROJECT: 'Project',
  DEPARTMENT: 'Department',
  INSTITUTIONAL: 'Institutional',
  CLUB: 'Club',
  OTHER: 'Other',
};

type LucideIcon = React.FC<{ className?: string }>;

const GROUP_TYPE_ICONS: Record<string, LucideIcon> = {
  ACADEMIC: BookOpen,
  PROJECT: Briefcase,
  DEPARTMENT: Building2,
  INSTITUTIONAL: Globe,
  CLUB: Star,
  OTHER: Tag,
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffH = (now.getTime() - d.getTime()) / 3600000;
  if (diffH < 24) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffH < 48) return 'Yesterday';
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatMessageDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
}

function groupMessagesByDate(messages: GroupMessage[]): { date: string; messages: GroupMessage[] }[] {
  const groups: { date: string; messages: GroupMessage[] }[] = [];
  let currentDate = '';
  for (const msg of messages) {
    const dateKey = new Date(msg.createdAt).toDateString();
    if (dateKey !== currentDate) {
      currentDate = dateKey;
      groups.push({ date: msg.createdAt, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }
  return groups;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const StudentGroupsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const [groupDetail, setGroupDetail] = useState<GroupDetail | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [leavingGroup, setLeavingGroup] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ─── Load groups ───────────────────────────────────────────────────────────

  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const data = await groupService.getMyGroups();
      setGroups(data);
      if (data.length > 0 && selectedGroupId === null) {
        setSelectedGroupId(data[0].id);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load campus groups.', 'error');
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Load detail + messages on selection ──────────────────────────────────

  useEffect(() => {
    if (selectedGroupId === null) return;
    loadGroupDetail(selectedGroupId);
    loadMessages(selectedGroupId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroupId]);

  const loadGroupDetail = async (groupId: number) => {
    setLoadingDetail(true);
    try {
      const detail = await groupService.getGroupDetail(groupId);
      setGroupDetail(detail);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load group details.', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadMessages = async (groupId: number, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const msgs = await groupService.getMessages(groupId);
      setMessages(msgs);
      setGroups(prev => prev.map(g => (g.id === groupId ? { ...g, unreadCount: 0 } : g)));
    } catch (err: any) {
      if (!silent) showToast(err.response?.data?.message || 'Failed to load messages.', 'error');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Send message ──────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!messageText.trim() || selectedGroupId === null) return;
    setSending(true);
    try {
      const newMsg = await groupService.sendMessage(selectedGroupId, { content: messageText.trim() });
      setMessages(prev => [...prev, newMsg]);
      setMessageText('');
      setGroups(prev =>
        prev.map(g =>
          g.id === selectedGroupId
            ? {
                ...g,
                latestMessagePreview: newMsg.content.length > 60 ? newMsg.content.substring(0, 57) + '...' : newMsg.content,
                latestMessageSenderName: newMsg.senderName,
                latestMessageAt: newMsg.createdAt,
                unreadCount: 0,
              }
            : g
        )
      );
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to send message.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── Refresh ───────────────────────────────────────────────────────────────

  const handleRefresh = async () => {
    if (selectedGroupId === null) return;
    setRefreshing(true);
    try {
      await loadMessages(selectedGroupId, true);
    } finally {
      setRefreshing(false);
    }
  };

  // ─── Leave group ───────────────────────────────────────────────────────────

  const handleLeave = async () => {
    if (selectedGroupId === null) return;
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    setLeavingGroup(true);
    try {
      await groupService.leaveGroup(selectedGroupId);
      showToast('You have left the group.', 'success');
      const prevId = selectedGroupId;
      setSelectedGroupId(null);
      setGroupDetail(null);
      setMessages([]);
      setGroups(prev => prev.filter(g => g.id !== prevId));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to leave group.', 'error');
    } finally {
      setLeavingGroup(false);
    }
  };

  // ─── Select group ──────────────────────────────────────────────────────────

  const handleSelectGroup = (groupId: number) => {
    if (groupId === selectedGroupId) return;
    setSelectedGroupId(groupId);
    setGroupDetail(null);
    setMessages([]);
    setShowMembers(false);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Campus Groups"
        description="Academic and institutional group communication"
      />

      {loadingGroups ? (
        <LoadingState message="Loading your groups..." />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No Groups Yet"
          description="You haven't been added to any campus groups. Contact your faculty to be added."
        />
      ) : (
        <div
          className="flex flex-1 gap-0 min-h-0 rounded-xl border border-gray-200 bg-white overflow-hidden"
          style={{ height: 'calc(100vh - 180px)' }}
        >
          {/* ── Sidebar ── */}
          <div className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                My Groups ({groups.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {groups.map(group => {
                const Icon = GROUP_TYPE_ICONS[group.groupType] || Tag;
                const isSelected = group.id === selectedGroupId;
                return (
                  <button
                    key={group.id}
                    onClick={() => handleSelectGroup(group.id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                            {group.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {group.latestMessagePreview
                              ? `${group.latestMessageSenderName}: ${group.latestMessagePreview}`
                              : GROUP_TYPE_LABELS[group.groupType] || group.groupType}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {group.latestMessageAt && (
                          <span className="text-xs text-gray-400">{formatTime(group.latestMessageAt)}</span>
                        )}
                        {group.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                            {group.unreadCount > 99 ? '99+' : group.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Chat Area ── */}
          {selectedGroup && (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                    {(() => {
                      const Icon = GROUP_TYPE_ICONS[selectedGroup.groupType] || Tag;
                      return <Icon className="w-5 h-5 text-blue-600" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedGroup.name}</h2>
                    <p className="text-xs text-gray-500">
                      {selectedGroup.memberCount} member{selectedGroup.memberCount !== 1 ? 's' : ''}
                      {' · '}
                      <Badge variant="slate" className="text-xs">
                        {GROUP_TYPE_LABELS[selectedGroup.groupType] || selectedGroup.groupType}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMembers(v => !v)}
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLeave}
                    disabled={leavingGroup}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-1 min-h-0">
                {/* Messages */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
                    {loadingMessages ? (
                      <LoadingState message="Loading messages..." />
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm">No messages yet. Be the first to say something!</p>
                      </div>
                    ) : (
                      groupMessagesByDate(messages).map(dateGroup => (
                        <div key={dateGroup.date}>
                          <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs text-gray-400 font-medium px-2">
                              {formatMessageDate(dateGroup.date)}
                            </span>
                            <div className="flex-1 h-px bg-gray-200" />
                          </div>
                          {dateGroup.messages.map(msg => {
                            const isOwn = msg.senderUserId === user?.id;
                            return (
                              <div
                                key={msg.id}
                                className={`flex flex-col mb-3 ${isOwn ? 'items-end' : 'items-start'}`}
                              >
                                {!isOwn && (
                                  <span className="text-xs font-medium text-gray-600 mb-1 px-1">
                                    {msg.senderName}
                                    {msg.senderRole !== 'STUDENT' && (
                                      <span className="ml-1 text-blue-500 text-xs">
                                        [{msg.senderRole === 'HOD' ? 'HOD' : 'Staff'}]
                                      </span>
                                    )}
                                  </span>
                                )}
                                <div
                                  className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-2xl px-4 py-2 ${
                                    isOwn
                                      ? 'bg-blue-600 text-white rounded-br-sm'
                                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                                  }`}
                                >
                                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                </div>
                                <span className="text-xs text-gray-400 mt-1 px-1">
                                  {formatMessageTime(msg.createdAt)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message composer */}
                  <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                    <div className="flex items-end gap-2">
                      <Textarea
                        placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 resize-none min-h-[44px] max-h-32"
                        rows={1}
                        disabled={sending}
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!messageText.trim() || sending}
                        className="flex-shrink-0 h-11"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Members panel */}
                {showMembers && (
                  <div className="w-64 border-l border-gray-200 flex flex-col bg-gray-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Members {groupDetail ? `(${groupDetail.memberCount})` : ''}
                      </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto px-3 py-2">
                      {loadingDetail ? (
                        <LoadingState message="Loading members..." />
                      ) : groupDetail ? (
                        <>
                          {groupDetail.members.filter(m => m.memberRole === 'ADMIN').length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-1">
                                Admins
                              </p>
                              {groupDetail.members
                                .filter(m => m.memberRole === 'ADMIN')
                                .map(m => (
                                  <div key={m.userId} className="flex items-center gap-2 px-1 py-1.5 rounded hover:bg-gray-100">
                                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                      {m.fullName?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-gray-800 truncate">{m.fullName}</p>
                                      <p className="text-xs text-gray-500 truncate">
                                        {m.role === 'STUDENT' ? m.registerNumber : m.employeeId || m.role}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                          {groupDetail.members.filter(m => m.memberRole === 'MEMBER').length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-1">
                                Members
                              </p>
                              {groupDetail.members
                                .filter(m => m.memberRole === 'MEMBER')
                                .map(m => (
                                  <div key={m.userId} className="flex items-center gap-2 px-1 py-1.5 rounded hover:bg-gray-100">
                                    <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                      {m.fullName?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-gray-800 truncate">{m.fullName}</p>
                                      <p className="text-xs text-gray-500 truncate">
                                        {m.role === 'STUDENT' ? m.registerNumber : m.employeeId || m.role}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
