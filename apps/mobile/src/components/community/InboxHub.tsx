import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import {
  MessageSquare,
  Search,
  Send,
  X,
  ChevronRight,
  Check,
  CheckCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Sparkles,
} from 'lucide-react-native';
import { DirectThread, DirectMessage } from '../../types/communityTypes';
import CommunityMascot from './CommunityMascot';
import { useTheme } from '../../context/ThemeContext';

interface InboxHubProps {
  threads: DirectThread[];
  onSendMessage: (threadId: string, text: string) => void;
  onAcceptRequest: (threadId: string) => void;
  onIgnoreRequest: (threadId: string) => void;
  onReportUser: (userName: string) => void;
}

type InboxFilter = 'All' | 'Unread' | 'Requests';

export default function InboxHub({
  threads,
  onSendMessage,
  onAcceptRequest,
  onIgnoreRequest,
  onReportUser,
}: InboxHubProps) {
  const { theme, isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState<InboxFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatThread, setActiveChatThread] = useState<DirectThread | null>(null);
  const [inputMessage, setInputMessage] = useState('');

  const filterTabs: InboxFilter[] = ['All', 'Unread', 'Requests'];

  const quickPrompts = [
    'How is your hydration target going?',
    'Logged my morning steps!',
    'Cheering you on for today!',
    'Ready for the evening reset?',
  ];

  const filteredThreads = threads.filter((t) => {
    const matchesSearch =
      t.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'Unread') return t.unreadCount > 0;
    if (activeFilter === 'Requests') return t.isRequest === true;
    return !t.isRequest; // 'All' shows non-request threads
  });

  const handleSend = () => {
    if (!inputMessage.trim() || !activeChatThread) return;
    const text = inputMessage.trim();
    onSendMessage(activeChatThread.id, text);

    // Optimistic append to modal view
    const newMsg: DirectMessage = {
      id: 'm_' + Date.now(),
      sender: 'me',
      text,
      time: 'Just now',
      status: 'sent',
    };

    setActiveChatThread({
      ...activeChatThread,
      messages: [...activeChatThread.messages, newMsg],
      lastMessage: text,
      timeAgo: 'Just now',
    });
    setInputMessage('');
  };

  return (
    <View style={styles.container}>
      {/* 1. Header */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <MessageSquare size={13} color="#16a34a" />
          <Text style={styles.headerBadgeText}>Private Conversations</Text>
        </View>
        <Text style={styles.title}>Inbox</Text>
        <Text style={styles.subtitle}>Direct wellness messaging with peers and mentors</Text>
      </View>

      {/* 2. Search & Sub-Tabs */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={theme.placeholderText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={15} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterTabsRow}>
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab;
            let badge = 0;
            if (tab === 'Unread') {
              badge = threads.filter((t) => t.unreadCount > 0).length;
            } else if (tab === 'Requests') {
              badge = threads.filter((t) => t.isRequest).length;
            }

            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterTab, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }, isActive && { backgroundColor: theme.accentDeep, borderColor: theme.accent }]}
                onPress={() => setActiveFilter(tab)}
              >
                <Text style={[styles.filterTabText, { color: theme.textSecondary }, isActive && { color: theme.accent, fontWeight: '700' }]}>
                  {tab}
                </Text>
                {badge > 0 && (
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={styles.tabBadgeText}>{badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Conversation Thread List */}
      <ScrollView style={styles.threadsScroll} contentContainerStyle={{ paddingBottom: 40 }}>
        {filteredThreads.length > 0 ? (
          filteredThreads.map((thread) => (
            <TouchableOpacity
              key={thread.id}
              style={[styles.threadRow, thread.unreadCount > 0 && styles.threadRowUnread]}
              onPress={() => setActiveChatThread(thread)}
              activeOpacity={0.85}
            >
              {/* Avatar + Online presence */}
              <View style={styles.avatarContainer}>
                <View style={[styles.avatarCircle, { backgroundColor: thread.avatarBg }]}>
                  <Text style={styles.avatarText}>{thread.avatarText}</Text>
                </View>
                {thread.isOnline && <View style={styles.onlineDot} />}
              </View>

              {/* Thread Info */}
              <View style={{ flex: 1 }}>
                <View style={styles.threadTopRow}>
                  <Text style={[styles.senderName, thread.unreadCount > 0 && styles.senderNameUnread]}>
                    {thread.senderName}
                  </Text>
                  <Text style={styles.timeAgoText}>{thread.timeAgo}</Text>
                </View>

                {thread.roleSubtitle && (
                  <Text style={styles.roleSubtitle}>{thread.roleSubtitle}</Text>
                )}

                <Text
                  style={[styles.lastMessageText, thread.unreadCount > 0 && styles.lastMessageTextUnread]}
                  numberOfLines={1}
                >
                  {thread.lastMessage}
                </Text>
              </View>

              {/* Badges / Actions */}
              {thread.isRequest ? (
                <View style={styles.requestActionRow}>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      onAcceptRequest(thread.id);
                    }}
                  >
                    <UserCheck size={14} color="#16a34a" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.ignoreBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      onIgnoreRequest(thread.id);
                    }}
                  >
                    <UserX size={14} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              ) : thread.unreadCount > 0 ? (
                <View style={styles.unreadCountCircle}>
                  <Text style={styles.unreadCountText}>{thread.unreadCount}</Text>
                </View>
              ) : (
                <ChevronRight size={16} color="#cbd5e1" />
              )}
            </TouchableOpacity>
          ))
        ) : (
          <CommunityMascot
            mood="curious"
            message={
              activeFilter === 'Requests'
                ? 'No pending message requests'
                : activeFilter === 'Unread'
                ? 'No unread messages'
                : 'Your conversations will appear here'
            }
            subtext="Connect with peers from your groups to share accountability and daily tips."
          />
        )}
      </ScrollView>

      {/* ======================================================== */}
      {/* 4. DIRECT MESSAGE MODAL (1-TO-1 CHAT)                    */}
      {/* ======================================================== */}
      {activeChatThread && (
        <Modal
          visible={!!activeChatThread}
          animationType="slide"
          onRequestClose={() => setActiveChatThread(null)}
        >
          <View style={[styles.chatModalContainer, { backgroundColor: theme.surfaceModal, borderColor: theme.border }]}>
            {/* Chat Modal Header */}
            <View style={[styles.chatModalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
              <TouchableOpacity
                onPress={() => setActiveChatThread(null)}
                style={styles.chatBackBtn}
              >
                <X size={20} color="#0f172a" />
              </TouchableOpacity>

              <View style={[styles.avatarCircleSmall, { backgroundColor: activeChatThread.avatarBg }]}>
                <Text style={styles.avatarTextSmall}>{activeChatThread.avatarText}</Text>
              </View>

              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.chatHeaderName}>{activeChatThread.senderName}</Text>
                <Text style={styles.chatHeaderStatus}>
                  {activeChatThread.isOnline ? 'Active now' : 'Encouraging peer'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => onReportUser(activeChatThread.senderName)}
                style={{ padding: 6 }}
              >
                <ShieldAlert size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Chat Messages Body */}
            <ScrollView
              style={styles.chatMessagesBody}
              contentContainerStyle={{ padding: 16, gap: 12 }}
            >
              {activeChatThread.messages.map((msg) => {
                const isMe = msg.sender === 'me';
                return (
                  <View
                    key={msg.id}
                    style={[styles.messageBubbleWrap, isMe ? styles.bubbleWrapMe : styles.bubbleWrapThem]}
                  >
                    <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                      <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
                        {msg.text}
                      </Text>
                    </View>
                    <View style={styles.msgMetaRow}>
                      <Text style={styles.msgTimestamp}>{msg.time}</Text>
                      {isMe && (
                        <CheckCheck size={13} color="#16a34a" style={{ marginLeft: 3 }} />
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Quick Prompts Bar */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickPromptsRow}
            >
              {quickPrompts.map((prompt, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.promptChip}
                  onPress={() => setInputMessage(prompt)}
                >
                  <Text style={styles.promptChipText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Composer Bar */}
            <View style={styles.chatComposerBar}>
              <TextInput
                style={styles.chatComposerInput}
                placeholder={`Message ${activeChatThread.senderName.split(' ')[0]}...`}
                placeholderTextColor={theme.placeholderText}
                value={inputMessage}
                onChangeText={setInputMessage}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  !inputMessage.trim() && styles.sendBtnDisabled,
                ]}
                onPress={handleSend}
                disabled={!inputMessage.trim()}
              >
                <Send size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 12,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#dcfce7',
    marginBottom: 8,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  searchWrap: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#0f172a',
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterTabActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  threadsScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  threadRowUnread: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  threadTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  senderNameUnread: {
    fontWeight: '800',
  },
  timeAgoText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  roleSubtitle: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '500',
    marginBottom: 2,
  },
  lastMessageText: {
    fontSize: 12,
    color: '#64748b',
  },
  lastMessageTextUnread: {
    color: '#0f172a',
    fontWeight: '600',
  },
  unreadCountCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCountText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  requestActionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  acceptBtn: {
    backgroundColor: '#dcfce7',
    padding: 8,
    borderRadius: 8,
  },
  ignoreBtn: {
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 8,
  },
  chatModalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  chatModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  chatBackBtn: {
    padding: 6,
    marginRight: 6,
  },
  avatarCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextSmall: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  chatHeaderName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  chatHeaderStatus: {
    fontSize: 11,
    color: '#16a34a',
  },
  chatMessagesBody: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messageBubbleWrap: {
    maxWidth: '78%',
  },
  bubbleWrapMe: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubbleWrapThem: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleMe: {
    backgroundColor: '#16a34a',
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19,
  },
  messageTextMe: {
    color: '#ffffff',
  },
  messageTextThem: {
    color: '#0f172a',
  },
  msgMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  msgTimestamp: {
    fontSize: 10,
    color: '#94a3b8',
  },
  quickPromptsRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 8,
  },
  promptChip: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  promptChipText: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '500',
  },
  chatComposerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 8,
  },
  chatComposerInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0f172a',
    maxHeight: 90,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
});
