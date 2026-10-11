import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messageService } from '../../services/messageService';
import {
  MessageSquare,
  Send,
  Search,
  User,
  Shield,
  Stethoscope,
  Briefcase,
  Clock,
  Loader2,
  RefreshCw
} from 'lucide-react';

const ChatPage = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const backendUrl = 'http://localhost:5000';
  const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${backendUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const fetchContacts = async () => {
    try {
      const res = await messageService.getContacts();
      if (res.success && res.data) {
        setContacts(res.data);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchMessages = async (partnerId) => {
    if (!partnerId) return;
    try {
      const res = await messageService.getMessages(partnerId);
      if (res.success && res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    // Refresh contacts every 8s
    const contactInterval = setInterval(fetchContacts, 8000);
    return () => clearInterval(contactInterval);
  }, []);

  useEffect(() => {
    if (!selectedPartner) return;
    setLoadingMessages(true);
    fetchMessages(selectedPartner.id);

    // Poll current chat every 3 seconds for new responses
    const msgInterval = setInterval(() => {
      fetchMessages(selectedPartner.id);
    }, 3000);

    return () => clearInterval(msgInterval);
  }, [selectedPartner]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPartner || sending) return;

    const textToSend = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const res = await messageService.sendMessage({
        receiver_id: selectedPartner.id,
        message: textToSend
      });

      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        fetchContacts(); // update unread counters or recency
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />;
      case 'doctor':
        return <Stethoscope className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const fullName = (c.name || `${c.first_name || ''} ${c.last_name || ''}`).toLowerCase();
    const role = (c.role || '').toLowerCase();
    const spec = (c.specialization || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return fullName.includes(q) || role.includes(q) || spec.includes(q);
  });

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Hospital Staff Direct Messaging
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Internal secure coordination channel between Administrators, Doctors, and Receptionists.
          </p>
        </div>
        <button
          onClick={() => {
            fetchContacts();
            if (selectedPartner) fetchMessages(selectedPartner.id);
          }}
          title="Refresh messages"
          className="p-2 rounded-lg bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 transition-colors shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Chat Layout Container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden shadow-md dark:shadow-2xl">
        {/* Left Column: Contacts Directory (md:col-span-4) */}
        <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/70 dark:bg-[#081426]/70">
          {/* Search Box */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff by name or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {loadingContacts ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                <span className="text-xs">Loading staff directory...</span>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No staff members found matching criteria.
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedPartner?.id === contact.id;
                const contactName = contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email;
                const hasUnread = contact.unread_count > 0;

                return (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedPartner(contact)}
                    className={`w-full text-left p-3.5 transition-all flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800/50 ${
                      isSelected ? 'bg-emerald-50/80 dark:bg-slate-800/90 border-l-4 border-emerald-500' : ''
                    }`}
                  >
                    {/* Avatar with Green Dot for Unread Messages */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center text-slate-800 dark:text-white font-bold text-sm">
                        {contact.profile_image ? (
                          <img
                            src={getAvatarUrl(contact.profile_image)}
                            alt={contactName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#064e3b] to-[#0a192f] flex items-center justify-center text-white font-bold">
                            {contactName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Green dot symbolising received unread messages */}
                      {hasUnread && (
                        <span
                          className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-[#081426] shadow-sm"
                          title="New unread message received"
                        />
                      )}
                    </div>

                    {/* Contact Details: Name FIRST, Title UNDER */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {contactName}
                        </span>
                        {hasUnread && (
                          <span className="px-2 py-0.5 bg-emerald-500 text-black text-[11px] font-black rounded-full shadow-sm">
                            {contact.unread_count}
                          </span>
                        )}
                      </div>

                      {/* Role and Title in small text underneath the name */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {getRoleIcon(contact.role)}
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">
                          {contact.role === 'admin' ? 'Administrator' : contact.role === 'doctor' ? 'Doctor' : 'Receptionist'}
                        </span>
                        {contact.specialization && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                            • {contact.specialization}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Stream & Message Input (md:col-span-8) */}
        <div className="md:col-span-8 flex flex-col h-full bg-slate-50/30 dark:bg-[#0a192f]">
          {selectedPartner ? (
            <>
              {/* Partner Header */}
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#0b1b33]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center text-slate-800 dark:text-white font-bold text-sm">
                    {selectedPartner.profile_image ? (
                      <img
                        src={getAvatarUrl(selectedPartner.profile_image)}
                        alt={selectedPartner.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#064e3b] to-[#0a192f] flex items-center justify-center text-white font-bold">
                        {(selectedPartner.name || selectedPartner.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedPartner.name || selectedPartner.email}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="capitalize text-emerald-700 dark:text-emerald-400 font-semibold">
                        {selectedPartner.role === 'admin' ? 'Administrator' : selectedPartner.role === 'doctor' ? 'Doctor' : 'Receptionist'}
                      </span>
                      {selectedPartner.specialization && (
                        <span>• Specialization: {selectedPartner.specialization}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message History List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                    <span className="text-xs">Loading conversation history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 space-y-2">
                    <MessageSquare className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No previous messages yet.</p>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Send a secure message to start the consultation or triage dialogue with{' '}
                      {selectedPartner.name || selectedPartner.first_name || 'your colleague'}.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                            isMine
                              ? 'bg-[#064e3b] text-white rounded-br-none border border-emerald-600 dark:border-emerald-500/40'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700/80'
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Footer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#081426]/70 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Write a message to ${selectedPartner.name || 'colleague'}...`}
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2.5 bg-[#064e3b] hover:bg-[#047857] border border-emerald-500/50 text-white rounded-lg transition-all flex items-center gap-1.5 font-medium text-sm disabled:opacity-40 disabled:hover:bg-[#064e3b] cursor-pointer"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Select a Colleague to Chat</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Choose any Administrator, Doctor, or Receptionist from the staff directory on the
                left to communicate regarding appointments, patient transfers, or triage questions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
