import { useState, useEffect, useRef } from 'react';
import { groupService } from '../../services/group.service';
import {
  GroupSummary,
  GroupDetail,
  GroupMessage,
  GroupType,
  CreateGroupRequest,
  StudentSearchResult,
} from '../../types/group.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { useAuth } from '../../hooks/useAuth';
import {
  Users,
  MessageSquare,
  Send,
  Plus,
  RefreshCw,
  UserPlus,
  UserMinus,
  BookOpen,
  Briefcase,
  Building2,
  Globe,
  Star,
  Tag,
  Search,
  X,
  Shield,
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

const ALL_GROUP_TYPES: GroupType[] = [
  'ACADEMIC', 'PROJECT', 'DEPARTMENT', 'INSTITUTIONAL', 'CLUB', 'OTHER',
];

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

export const StaffGroupsPage = () => {
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
  const [refreshing, setRefreshing] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateGroupRequest>({
    name: '',
    description: '',
    groupType: 'ACADEMIC',
  });
  const [creating, setCreating] = useState(false);

  const [showAddMember, setShowAddMember] = useState(false);
  const [searchRegNo, setSearchRegNo] = useState('');
  const [searchResult, setSearchResult] = useState<StudentSearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);

  // ─── Fetch groups ──────────────────────────────────────────────────────────

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

  // ─── Create group ──────────────────────────────────────────────────────────

  const handleCreateGroup = async () => {
    if (!createForm.name.trim()) {
      showToast('Group name is required.', 'error');
      return;
    }
    setCreating(true);
    try {
      const created = await groupService.createGroup({
        name: createForm.name.trim(),
        description: createForm.description?.trim() || undefined,
        groupType: createForm.groupType,
      });
      showToast('Group created successfully!', 'success');
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '', groupType: 'ACADEMIC' });
      await fetchGroups();
      setSelectedGroupId(created.id);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create group.', 'error');
    } finally {
      setCreating(false);
    }
  };

  // ─── Search student ────────────────────────────────────────────────────────

  const handleSearchStudent = async () => {
    if (!searchRegNo.trim()) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const result = await groupService.searchStudent(searchRegNo.trim());
      setSearchResult(result);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Student not found.', 'error');
    } finally {
      setSearching(false);
    }
  };

  // ─── Add member ────────────────────────────────────────────────────────────

  const handleAddMember = async () => {
    if (!searchResult || selectedGroupId === null) return;
    setAddingMember(true);
    try {
      await groupService.addMember(selectedGroupId, { userId: searchResult.userId, memberRole: 'MEMBER' });
      showToast(`${searchResult.fullName} added to group.`, 'success');
      setSearchRegNo('');
      setSearchResult(null);
      setShowAddMember(false);
      await loadGroupDetail(selectedGroupId);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add member.', 'error');
    } finally {
      setAddingMember(false);
    }
  };

  // ─── Remove member ─────────────────────────────────────────────────────────

  const handleRemoveMember = async (userId: number, name: string) => {
    if (selectedGroupId === null) return;
    if (!window.confirm(`Remove ${name} from this group?`)) return;
    setRemovingMemberId(userId);
    try {
      await groupService.removeMember(selectedGroupId, userId);
      showToast(`${name} removed from group.`, 'success');
      await loadGroupDetail(selectedGroupId);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to remove member.', 'error');
    } finally {
      setRemovingMemberId(null);
    }
  };

  // ─── Select group ──────────────────────────────────────────────────────────

  const handleSelectGroup = (groupId: number) => {
    if (groupId === selectedGroupId) return;
    setSelectedGroupId(groupId);
    setGroupDetail(null);
    setMessages([]);
    setShowMembers(false);
    setShowAddMember(false);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const isGroupAdmin = groupDetail?.currentUserRole === 'ADMIN';

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Campus Groups"
        description="Faculty group management and communication"
        action={
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            New Group
          </Button>
        }
      />

      {loadingGroups ? (
        <LoadingState message="Loading your groups..." />
      ) : (
        <div
          className="flex flex-1 gap-0 min-h-0 rounded-xl border border-gray-200 bg-white overflow-hidden"
          style={{ height: 'calc(100vh - 180px)' }}
        >
          {/* ── Sidebar ── */}
          <div className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                My Groups ({groups.length})
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {groups.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <Users className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No groups yet.</p>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(true)} className="mt-2">
                  Create your first group
                </Button>
              </div>
            ) : (
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
                            <div className="flex items-center gap-1">
                              <p className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                                {group.name}
                              </p>
                              {group.memberRole === 'ADMIN' && (
                                <Shield className="w-3 h-3 text-blue-500 flex-shrink-0" />
                              )}
                            </div>
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
            )}
          </div>

          {/* ── Right Panel ── */}
          {!selectedGroup ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="w-16 h-16 text-gray-200 mb-4" />
              <p className="text-gray-400 text-sm">Select a group to view messages</p>
              <Button variant="ghost" className="mt-4" onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-1" /> Create New Group
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Chat header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                    {(() => {
                      const Icon = GROUP_TYPE_ICONS[selectedGroup.groupType] || Tag;
                      return <Icon className="w-5 h-5 text-blue-600" />;
                    })()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-gray-900">{selectedGroup.name}</h2>
                      {selectedGroup.memberRole === 'ADMIN' && (
                        <Badge variant="slate" className="text-xs">Admin</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {selectedGroup.memberCount} member{selectedGroup.memberCount !== 1 ? 's' : ''}
                      {' · '}
                      {GROUP_TYPE_LABELS[selectedGroup.groupType] || selectedGroup.groupType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                  {isGroupAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setShowAddMember(v => !v); setShowMembers(false); }}
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setShowMembers(v => !v); setShowAddMember(false); }}
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-1 min-h-0">
                {/* Messages area */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    {loadingMessages ? (
                      <LoadingState message="Loading messages..." />
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
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

                  {/* Composer */}
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
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Members {groupDetail ? `(${groupDetail.memberCount})` : ''}
                      </h3>
                      <button onClick={() => setShowMembers(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-3 py-2">
                      {loadingDetail ? (
                        <LoadingState message="Loading..." />
                      ) : groupDetail ? (
                        <>
                          {(['ADMIN', 'MEMBER'] as const).map(roleGroup => {
                            const filtered = groupDetail.members.filter(m => m.memberRole === roleGroup);
                            if (filtered.length === 0) return null;
                            return (
                              <div key={roleGroup} className="mb-3">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-1">
                                  {roleGroup === 'ADMIN' ? 'Admins' : 'Members'}
                                </p>
                                {filtered.map(m => (
                                  <div key={m.userId} className="flex items-center gap-2 px-1 py-1.5 rounded hover:bg-gray-100 group">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${roleGroup === 'ADMIN' ? 'bg-blue-600' : 'bg-gray-400'}`}>
                                      {m.fullName?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-gray-800 truncate">{m.fullName}</p>
                                      <p className="text-xs text-gray-500 truncate">
                                        {m.role === 'STUDENT' ? m.registerNumber : m.employeeId || m.role}
                                      </p>
                                    </div>
                                    {isGroupAdmin && m.userId !== user?.id && (
                                      <button
                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                                        onClick={() => handleRemoveMember(m.userId, m.fullName)}
                                        disabled={removingMemberId === m.userId}
                                      >
                                        <UserMinus className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Add member panel */}
                {showAddMember && isGroupAdmin && (
                  <div className="w-72 border-l border-gray-200 flex flex-col bg-gray-50">
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <UserPlus className="w-4 h-4" /> Add Member
                      </h3>
                      <button
                        onClick={() => { setShowAddMember(false); setSearchResult(null); setSearchRegNo(''); }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-xs text-gray-500">
                        Search a student by register number to add them to this group.
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. CSE2026001"
                          value={searchRegNo}
                          onChange={e => { setSearchRegNo(e.target.value); setSearchResult(null); }}
                          onKeyDown={e => { if (e.key === 'Enter') handleSearchStudent(); }}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={handleSearchStudent}
                          disabled={!searchRegNo.trim() || searching}
                        >
                          {searching ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                        </Button>
                      </div>

                      {searchResult && (
                        <Card>
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                                {searchResult.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-900 text-sm">{searchResult.fullName}</p>
                                <p className="text-xs text-gray-500">{searchResult.registerNumber}</p>
                                <p className="text-xs text-gray-400">
                                  {searchResult.departmentCode} · {searchResult.sectionName}
                                </p>
                              </div>
                            </div>
                            <Button
                              className="w-full mt-3"
                              size="sm"
                              onClick={handleAddMember}
                              disabled={addingMember}
                            >
                              {addingMember ? 'Adding...' : 'Add to Group'}
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Create Group Modal ── */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => { setShowCreateModal(false); setCreateForm({ name: '', description: '', groupType: 'ACADEMIC' }); }}
          title="Create New Group"
        >
          <div className="space-y-4 p-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
              <Input
                placeholder="e.g. Java - CSE A"
                value={createForm.name}
                onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea
                placeholder="Optional: describe the group's purpose"
                value={createForm.description || ''}
                onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group Type *</label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_GROUP_TYPES.map(type => {
                  const Icon = GROUP_TYPE_ICONS[type] || Tag;
                  const isSelected = createForm.groupType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setCreateForm(f => ({ ...f, groupType: type }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {GROUP_TYPE_LABELS[type]}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => { setShowCreateModal(false); setCreateForm({ name: '', description: '', groupType: 'ACADEMIC' }); }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateGroup}
                disabled={!createForm.name.trim() || creating}
              >
                {creating ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
