
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useHotel } from '../context/HotelContext';
import { 
    Send, User, Lock, MessageSquare, BellOff, Bell, Briefcase, Headphones, Radio, 
    Hash, Search, Shield, ChevronDown, MessageCircle, ArrowRight, Image, Mic, Paperclip, Smile,
    Sparkles, Crown, Users, Zap, Star
} from 'lucide-react';
import { CHAT_GROUPS } from '../constants';

// --- Sub-Component: Theme-Aware User Group Header ---
const UserGroupHeader = ({ title, theme }: { title: string, theme: string }) => {
    let icon = <Users size={14} />;
    let colorClass = "text-gray-400";
    let borderClass = "border-gray-100 dark:border-gray-700";
    let bgClass = "bg-gray-50 dark:bg-gray-800";

    if (title.includes('الإدارة')) { icon = <Crown size={14} />; } 
    else if (title.includes('المساعدين')) { icon = <Shield size={14} />; } 
    else if (title.includes('الاستقبال')) { icon = <Headphones size={14} />; }

    // Authentic Zellige Styling
    if (theme === 'zellige') {
        colorClass = "text-[#cca43b]";
        borderClass = "border-[#cca43b]/30";
        bgClass = "bg-[#002a2d]"; // Dark teal background
    } else if (theme === 'zellige-v2') {
        colorClass = "text-[#024d38]";
        borderClass = "border-[#c6e3d8]";
        bgClass = "bg-[#024d38]/5";
    }

    return (
        <div className={`flex items-center gap-3 mb-3 mt-6 px-4 py-1.5 rounded-full w-fit mx-auto md:mx-0 border ${borderClass} ${bgClass} backdrop-blur-sm shadow-sm`}>
            <span className={`p-1 rounded-full ${
                theme === 'zellige' ? 'bg-[#cca43b] text-[#001e21]' : 
                'bg-current text-white opacity-80'
            }`}>
                {React.cloneElement(icon as React.ReactElement<any>, { className: theme === 'zellige' ? "text-[#001e21]" : "text-white", size: 10 })}
            </span>
            <h4 className={`text-[10px] font-black uppercase tracking-widest ${colorClass}`}>
                {title}
            </h4>
        </div>
    );
};

// --- Sub-Component: 3D User Item with Zellige Tile Effect ---
const UserGroup = ({ title, usersList, selectedChatId, handleUserSelect, theme, darkMode }: { title: string, usersList: any[], selectedChatId: string | null, handleUserSelect: (id: string) => void, theme: string, darkMode?: boolean }) => {
    if (usersList.length === 0) return null;
    return (
        <div className="mb-2 animate-fade-in">
            <UserGroupHeader title={title} theme={theme} />
            <div className="space-y-2 px-2">
                {usersList.map(user => {
                    const isSelected = selectedChatId === user.id;
                    
                    // Dynamic Zellige Styles for Items
                    let activeStyle = 'bg-white dark:bg-gray-700 shadow-md translate-x-1 ring-1 ring-black/5 dark:ring-white/10';
                    let hoverStyle = 'hover:bg-white/60 dark:hover:bg-gray-800/60 hover:shadow-sm hover:translate-x-1';
                    
                    if (theme === 'zellige') {
                        if (darkMode) {
                             activeStyle = 'bg-[#cca43b] text-[#001e21] shadow-lg shadow-[#cca43b]/20 translate-x-2 border-r-4 border-[#f0c04a]';
                             hoverStyle = 'hover:bg-[#002a2d] hover:shadow-sm hover:border-r-4 hover:border-[#cca43b]/30 transition-all text-[#cca43b]/70';
                        } else {
                             activeStyle = 'bg-[#002a2d] shadow-lg shadow-[#cca43b]/10 translate-x-2 border-r-4 border-[#cca43b]';
                             hoverStyle = 'hover:bg-[#002a2d]/60 hover:shadow-sm hover:border-r-4 hover:border-[#cca43b]/30 transition-all text-[#cca43b]/70';
                        }
                    } else if (theme === 'zellige-v2') {
                        activeStyle = 'bg-[#f5fcf9] shadow-lg translate-x-2 border-r-4 border-[#024d38]';
                    } else if (theme === 'zellige-algiers') {
                        activeStyle = 'bg-[#eff6ff] shadow-lg translate-x-2 border-r-4 border-[#1e3a8a] text-[#1e3a8a]';
                        hoverStyle = 'hover:bg-[#eff6ff]/60 hover:shadow-sm hover:translate-x-1 text-[#1e3a8a]/70';
                    }

                    return (
                      <button
                          key={user.id}
                          onClick={() => handleUserSelect(user.id)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-right transition-all duration-300 group relative overflow-hidden
                              ${isSelected ? activeStyle : hoverStyle}
                          `}
                      >
                          {/* Zellige Decorative Pattern Overlay for Active Item */}
                          {isSelected && theme.startsWith('zellige') && (
                              <div className={`absolute inset-0 opacity-10 bg-zellige-pattern ${darkMode ? 'mix-blend-screen' : 'mix-blend-overlay'} pointer-events-none`}></div>
                          )}
                          
                          <div className="relative shrink-0 z-10">
                              <div className={`w-11 h-11 rounded-full p-0.5 border-2 ${isSelected ? (theme === 'zellige' ? 'border-[#cca43b]' : theme === 'zellige-algiers' ? 'border-[#1e3a8a]' : 'border-blue-500') : 'border-transparent group-hover:border-gray-200'}`}>
                                <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                              </div>
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full shadow-sm"></span>
                          </div>
                          <div className="flex-1 min-w-0 z-10">
                              <p className={`text-xs font-bold truncate transition-colors ${isSelected && theme === 'zellige' ? (darkMode ? 'text-[#001e21]' : 'text-[#cca43b]') : isSelected ? 'text-black dark:text-white' : theme === 'zellige' ? 'text-[#cca43b]/80' : 'text-gray-700 dark:text-gray-300'}`}>{user.name}</p>
                              <p className={`text-[9px] font-medium truncate opacity-80 flex items-center gap-1 ${theme === 'zellige' ? (isSelected && darkMode ? 'text-[#001e21]/70' : 'text-[#cca43b]/60') : 'text-gray-400'}`}>
                                  {user.role === 'manager' ? <Crown size={10} className={theme === 'zellige' && isSelected && darkMode ? "text-[#001e21]" : "text-yellow-500"}/> : null}
                                  {user.role === 'manager' ? 'المدير العام' : user.role === 'assistant_manager' ? 'مساعد إداري' : 'موظف استقبال'}
                              </p>
                          </div>
                          {isSelected && theme !== 'zellige' && !theme.startsWith('ceramic') && <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-white/90 dark:from-gray-700/90 to-transparent pointer-events-none"></div>}
                      </button>
                    );
                })}
            </div>
        </div>
    )
};

export const MessagesPage: React.FC = () => {
  const { messages, sendMessage, replyToGuest, currentUser, users, chatSessions, toggleChatMute, settings, bookings, addNotification } = useHotel();
  const [activeTab, setActiveTab] = useState<string>(CHAT_GROUPS.GENERAL);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  
  // Ref for auto-scrolling input into view
  const inputRef = useRef<HTMLInputElement>(null);

  const canChat = currentUser?.permissions.canUseChat;
  const role = currentUser?.role;

  // Define Channels
  const channels = [
    { id: CHAT_GROUPS.GENERAL, label: 'المنتدى العام', icon: Sparkles, allowed: true, color: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-500/30' },
    { id: CHAT_GROUPS.MANAGEMENT, label: 'مجلس الإدارة', icon: Crown, allowed: role === 'manager' || role === 'assistant_manager', color: 'from-purple-400 to-purple-600', shadow: 'shadow-purple-500/30' },
    { id: CHAT_GROUPS.OPERATIONS, label: 'العمليات والتنسيق', icon: Zap, allowed: true, color: 'from-orange-400 to-orange-600', shadow: 'shadow-orange-500/30' },
    { id: CHAT_GROUPS.RECEPTION, label: 'مكتب الاستقبال', icon: Headphones, allowed: role === 'manager' || role === 'receptionist', color: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/30' },
  ];

  const activeChannel = channels.find(c => c.id === activeTab);

  useEffect(() => {
      if (activeTab === CHAT_GROUPS.MANAGEMENT && role === 'receptionist') setActiveTab(CHAT_GROUPS.OPERATIONS);
      if (activeTab === CHAT_GROUPS.RECEPTION && role === 'assistant_manager') setActiveTab(CHAT_GROUPS.OPERATIONS);
  }, [role, activeTab]);

  const handleChannelSelect = (channelId: string) => { setActiveTab(channelId); setSelectedChatId(null); setIsMobileChatOpen(true); };
  const handleUserSelect = (userId: string) => { setSelectedChatId(userId); setIsMobileChatOpen(true); };
  const handleBackToList = () => { setIsMobileChatOpen(false); };

  const handleInputFocus = () => {
      setTimeout(() => {
          inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
  };

  const displayMessages = messages.filter(m => {
    if (activeTab === 'private') {
      if (!selectedChatId) return false;
      return !m.isGuestMessage && ((m.senderId === currentUser?.id && m.receiverId === selectedChatId) || (m.senderId === selectedChatId && m.receiverId === currentUser?.id));
    } else if (activeTab === 'guest') {
      if (!selectedChatId) return false;
      return m.senderId === selectedChatId || m.receiverId === selectedChatId;
    } else {
        if (activeTab === CHAT_GROUPS.GENERAL) return m.receiverId === CHAT_GROUPS.GENERAL || !m.receiverId; 
        return m.receiverId === activeTab;
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canChat) return;
    if (activeTab === 'guest' && selectedChatId) replyToGuest(selectedChatId, input);
    else if (activeTab === 'private' && selectedChatId) sendMessage(input, selectedChatId);
    else sendMessage(input, activeTab);
    setInput('');
  };

  const getSenderName = (id: string) => {
      const staff = users.find(u => u.id === id);
      if (staff) return staff.name;
      const session = chatSessions.find(s => s.id === id);
      if (session) return `${session.name} (غرفة ${session.roomNumber})`;
      return 'Unknown';
  };

  const getChannelDescription = (id: string) => {
      switch(id) {
          case CHAT_GROUPS.GENERAL: return 'مساحة عامة لجميع الموظفين';
          case CHAT_GROUPS.MANAGEMENT: return 'للمدراء والمساعدين فقط';
          case CHAT_GROUPS.OPERATIONS: return 'تنسيق العمليات بين الأقسام';
          case CHAT_GROUPS.RECEPTION: return 'تواصل موظفي الاستقبال';
          default: return 'قناة محادثة';
      }
  };

  const getSidebarStyle = () => {
      switch(settings.theme) {
          case 'zellige': return settings.darkMode ? 'bg-[#001e21] border-l border-[#cca43b]/20 shadow-inner' : 'bg-[#FDFBF7] border-l border-[#cca43b]/20 shadow-inner';
          case 'zellige-v2': return 'bg-[#f5fcf9] border-l border-[#024d38]/10';
          case 'zellige-algiers': return settings.darkMode ? 'bg-[#0f172a] border-l border-[#1e3a8a]/20' : 'bg-[#eff6ff] border-l border-[#1e3a8a]/20';
          default: return 'bg-gray-50/80 dark:bg-gray-900/90 border-l dark:border-gray-700 backdrop-blur-2xl';
      }
  };

  const getSendButtonStyle = () => {
      const base = "p-3 rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center text-white";
      switch(settings.theme) {
          case 'zellige': return `${base} ${settings.darkMode ? 'bg-[#cca43b] text-[#001e21] shadow-[#cca43b]/20 border border-[#cca43b]/50 hover:bg-[#b08d30]' : 'bg-[#006269] text-[#cca43b] shadow-[#006269]/20 border border-[#cca43b]/50 hover:bg-[#004d53]'}`;
          case 'zellige-v2': return `${base} bg-[#024d38] shadow-[#024d38]/30 hover:bg-[#013b2b]`;
          case 'zellige-algiers': return `${base} ${settings.darkMode ? 'bg-[#1e3a8a] text-[#f8fafc] hover:bg-[#1e40af]' : 'bg-[#1e3a8a] text-white hover:bg-[#1e40af]'}`;
          default: return `${base} bg-black dark:bg-white dark:text-black shadow-gray-500/30`;
      }
  };

  const getMyBubbleStyle = () => {
      switch(settings.theme) {
          case 'zellige': return settings.darkMode ? 'bg-[#cca43b] text-[#001e21] shadow-md shadow-[#cca43b]/20 border border-[#cca43b]/50 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl font-bold' : 'bg-[#006269] text-[#cca43b] shadow-md shadow-[#006269]/20 border border-[#cca43b]/50 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl font-bold';
          case 'zellige-v2': return 'bg-[#024d38] text-white shadow-md shadow-green-900/20 border-b-2 border-[#c6e3d8]';
          case 'zellige-algiers': return settings.darkMode ? 'bg-[#1e3a8a] text-[#f8fafc]' : 'bg-[#1e3a8a] text-white';
          default: return 'bg-blue-600 text-white shadow-lg shadow-blue-500/30';
      }
  };

  const getTabStyle = (isActive: boolean) => {
      const base = "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 relative z-10 flex items-center justify-center gap-2";
      if (!isActive) return `${base} text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 ${settings.theme === 'zellige' ? (settings.darkMode ? 'text-[#cca43b]/60 hover:bg-[#cca43b]/10' : 'text-[#006269]/60 hover:bg-[#006269]/10') : ''}`;
      switch(settings.theme) {
          case 'zellige': return `${base} ${settings.darkMode ? 'bg-[#cca43b] text-[#001e21] shadow-md border border-[#cca43b]' : 'bg-[#006269] text-[#cca43b] shadow-md border border-[#cca43b]'}`;
          case 'zellige-v2': return `${base} bg-[#024d38] text-white shadow-md`;
          case 'zellige-algiers': return `${base} ${settings.darkMode ? 'bg-[#1e3a8a] text-[#f8fafc]' : 'bg-[#1e3a8a] text-white'}`;
          default: return `${base} bg-white dark:bg-gray-700 text-black dark:text-white shadow-md`;
      }
  };

  const filteredUsers = useMemo(() => {
      return users.filter(u => u.id !== currentUser?.id && (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || (u.role === 'manager' && 'مدير'.includes(searchTerm)) || (u.role === 'receptionist' && 'استقبال'.includes(searchTerm))));
  }, [users, currentUser, searchTerm]);

  const groupedUsers = {
      manager: filteredUsers.filter(u => u.role === 'manager'),
      assistant: filteredUsers.filter(u => u.role === 'assistant_manager'),
      receptionist: filteredUsers.filter(u => u.role === 'receptionist'),
  };

  const isZellige = settings.theme.startsWith('zellige');

  return (
    <div className={`flex h-[calc(100dvh-130px)] rounded-[2.5rem] shadow-2xl overflow-hidden border relative transition-all duration-500
        ${settings.theme === 'zellige' ? (settings.darkMode ? 'bg-[#001e21] border-[#cca43b]/40' : 'bg-[#FDFBF7] border-[#cca43b]/40') : 
          settings.theme === 'zellige-v2' ? 'bg-[#f5fcf9] border-[#024d38]/10' :
          settings.theme === 'zellige-algiers' ? (settings.darkMode ? 'bg-[#0f172a] border-[#1e3a8a]/40' : 'bg-[#eff6ff] border-[#1e3a8a]/40') :
          'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}
    `}>
      
      {/* Sidebar List */}
      <div className={`
        absolute inset-y-0 right-0 z-20 w-full md:w-80 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:relative md:translate-x-0
        ${isMobileChatOpen ? 'translate-x-full md:translate-x-0 hidden md:flex' : 'translate-x-0 flex'}
        ${getSidebarStyle()}
      `}>
        {/* Background Pattern for Sidebar (Zellige) */}
        {isZellige && (
            <div className={`absolute inset-0 bg-zellige-pattern opacity-10 pointer-events-none ${settings.darkMode ? 'mix-blend-screen' : 'mix-blend-multiply'}`}></div>
        )}

        <div className="p-6 pb-2 relative z-10">
            <h2 className={`text-xl font-black flex items-center gap-3 mb-6 tracking-tight ${settings.theme === 'zellige' ? (settings.darkMode ? 'text-[#f0c04a]' : 'text-[#006269]') : 'text-gray-900 dark:text-white'}`}>
                <div className={`p-2.5 rounded-2xl shadow-sm ${isZellige ? (settings.darkMode ? 'bg-[#002a2d] text-[#cca43b] border border-[#cca43b]/30' : 'bg-[#006269] text-[#cca43b] border border-[#cca43b]/30') : 'bg-gray-100 text-blue-600'}`}>
                    <MessageCircle size={20} strokeWidth={2.5} /> 
                </div>
                المركز المراسلات
            </h2>
            
            <div className={`p-1.5 rounded-2xl flex relative mb-4 shadow-inner ${isZellige ? (settings.darkMode ? 'bg-[#002a2d] border border-[#cca43b]/20' : 'bg-white border border-[#cca43b]/20') : 'bg-gray-200/50 dark:bg-gray-800/50'}`}>
                <button onClick={() => { setActiveTab(CHAT_GROUPS.GENERAL); setSelectedChatId(null); setIsMobileChatOpen(false); }} className={getTabStyle(activeTab !== 'private' && activeTab !== 'guest')}><Hash size={14}/> القنوات</button>
                <button onClick={() => { setActiveTab('private'); setSelectedChatId(null); }} className={getTabStyle(activeTab === 'private')}><User size={14}/> خاص</button>
                <button onClick={() => { setActiveTab('guest'); setSelectedChatId(null); }} className={getTabStyle(activeTab === 'guest')}><Star size={14}/> النزلاء</button>
            </div>
            
            {activeTab === 'private' && (
                <div className="relative group mb-2 animate-fade-in">
                    <input type="text" placeholder="بحث عن موظف..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full border-none rounded-2xl py-3 pr-10 pl-4 text-xs font-bold shadow-sm focus:ring-2 focus:shadow-md transition-all outline-none ${settings.theme === 'zellige' ? (settings.darkMode ? 'bg-[#002a2d] text-[#cca43b] placeholder-[#cca43b]/50 focus:ring-[#cca43b]/20' : 'bg-white text-[#006269] placeholder-[#006269]/50 focus:ring-[#006269]/20') : 'bg-white dark:bg-gray-800 focus:ring-blue-500/20 text-gray-900 dark:text-white'}`}/>
                    <Search className={`absolute right-3.5 top-3 transition-colors ${settings.theme === 'zellige' ? (settings.darkMode ? 'text-[#cca43b]' : 'text-[#006269]') : 'text-gray-400 group-hover:text-blue-500'}`} size={16} />
                </div>
            )}
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-hide relative z-10">
            {activeTab !== 'private' && activeTab !== 'guest' && (
                <div className="space-y-3 mt-2 animate-fade-in">
                    {channels.filter(c => c.allowed).map(channel => (
                        <button key={channel.id} onClick={() => handleChannelSelect(channel.id)} className={`w-full relative overflow-hidden p-4 rounded-3xl text-right transition-all duration-500 group ${activeTab === channel.id ? `bg-gradient-to-br ${channel.color} text-white ${channel.shadow} shadow-lg scale-[1.02]` : `shadow-sm hover:shadow-md border border-transparent ${settings.theme === 'zellige' ? (settings.darkMode ? 'bg-[#002a2d] text-[#cca43b] hover:bg-[#00383d] border-[#cca43b]/20' : 'bg-white text-[#006269] hover:bg-[#f0f9fa] border-[#cca43b]/20') : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}`}>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`p-3 rounded-2xl backdrop-blur-sm ${activeTab === channel.id ? 'bg-white/20' : settings.theme === 'zellige' ? (settings.darkMode ? 'bg-[#001e21] text-[#cca43b]' : 'bg-[#FDFBF7] text-[#006269]') : 'bg-gray-100 dark:bg-gray-700'}`}><channel.icon size={22} strokeWidth={activeTab === channel.id ? 2.5 : 2} /></div>
                                <div><div className="font-bold text-sm">{channel.label}</div><div className={`text-[10px] font-medium mt-0.5 opacity-80`}>{channel.id === CHAT_GROUPS.GENERAL ? 'مساحة عامة للجميع' : 'مساحة عمل مشتركة'}</div></div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
            {activeTab === 'private' && (
                <div className="mt-2">
                    <UserGroup title="الإدارة العليا" usersList={groupedUsers.manager} selectedChatId={selectedChatId} handleUserSelect={handleUserSelect} theme={settings.theme} darkMode={settings.darkMode} />
                    <UserGroup title="المساعدين الإداريين" usersList={groupedUsers.assistant} selectedChatId={selectedChatId} handleUserSelect={handleUserSelect} theme={settings.theme} darkMode={settings.darkMode} />
                    <UserGroup title="طاقم الاستقبال" usersList={groupedUsers.receptionist} selectedChatId={selectedChatId} handleUserSelect={handleUserSelect} theme={settings.theme} darkMode={settings.darkMode} />
                </div>
            )}
            {activeTab === 'guest' && (
                <div className="space-y-3 mt-2 animate-fade-in">
                    {chatSessions.length === 0 ? <div className="text-center py-12 opacity-50 flex flex-col items-center"><MessageSquare size={32} className={`mb-2 ${settings.theme === 'zellige' ? (settings.darkMode ? 'text-[#cca43b]/50' : 'text-[#006269]/50') : 'text-gray-300'}`} /><p className={`text-sm font-bold ${settings.theme === 'zellige' ? (settings.darkMode ? 'text-[#cca43b]/70' : 'text-[#006269]/70') : 'text-gray-500'}`}>صندوق الوارد فارغ</p></div> : 
                        chatSessions.map(session => (
                            <div key={session.id} className={`group flex items-center gap-2 p-2 pr-3 rounded-2xl transition-all duration-300 border ${selectedChatId === session.id ? (settings.theme === 'zellige' ? (settings.darkMode ? 'bg-[#002a2d] shadow-md border-[#cca43b]/50' : 'bg-white shadow-md border-[#cca43b]/50') : 'bg-white dark:bg-gray-800 shadow-md border-purple-200 dark:border-purple-900') : (settings.theme === 'zellige' ? (settings.darkMode ? 'border-transparent hover:bg-[#002a2d]/50 hover:border-[#cca43b]/20' : 'border-transparent hover:bg-white hover:border-[#cca43b]/20') : 'border-transparent hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm')}`}>
                                <button onClick={() => handleUserSelect(session.id)} className="flex-1 flex items-center gap-3 text-right min-w-0">
                                    <div className="relative">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-inner ${settings.theme === 'zellige' ? (settings.darkMode ? 'bg-[#001e21] text-[#cca43b] border border-[#cca43b]/30' : 'bg-[#FDFBF7] text-[#006269] border border-[#cca43b]/30') : 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700'}`}>{session.roomNumber}</div>
                                        {session.unreadCount > 0 && <span className={`absolute -top-1 -right-1 text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm border-2 ${settings.theme === 'zellige' ? (settings.darkMode ? 'bg-[#cca43b] text-[#001e21] border-[#001e21]' : 'bg-[#006269] text-[#cca43b] border-white') : 'bg-red-500 text-white border-white dark:border-gray-800'}`}>{session.unreadCount}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5"><span className={`text-sm font-bold truncate ${settings.theme === 'zellige' ? (settings.darkMode ? 'text-[#cca43b]' : 'text-[#006269]') : 'text-gray-800 dark:text-gray-200'}`}>{session.name}</span></div>
                                        <p className={`text-xs truncate font-medium ${settings.theme === 'zellige' ? (settings.darkMode ? 'text-[#cca43b]/60' : 'text-[#006269]/60') : 'text-gray-400'}`}>{session.lastMessage}</p>
                                    </div>
                                </button>
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col relative transition-all duration-500 w-full z-10 ${isMobileChatOpen ? 'flex' : 'hidden md:flex'} ${
          settings.theme === 'zellige' ? (settings.darkMode ? 'bg-[#001e21]' : 'bg-[#FDFBF7]') : 
          settings.theme === 'zellige-algiers' ? (settings.darkMode ? 'bg-[#0f172a]' : 'bg-[#eff6ff]') :
          'bg-[#f8fafc] dark:bg-[#0f172a]'
      }`}>
        
        {/* Decorative Background Pattern for Chat */}
        {isZellige && <div className={`absolute inset-0 bg-zellige-pattern opacity-10 pointer-events-none ${settings.darkMode ? 'mix-blend-screen' : 'mix-blend-multiply'}`}></div>}

        {/* Header */}
        <div className={`p-4 z-20 flex justify-between items-center shadow-sm backdrop-blur-xl border-b ${
            settings.theme === 'zellige' ? (settings.darkMode ? 'bg-[#002a2d]/90 border-[#cca43b]/30' : 'bg-white/80 border-[#cca43b]/30') : 
            settings.theme === 'ceramic-talavera' ? (settings.darkMode ? 'bg-[#1e3a8a]/90 border-[#f59e0b]/30' : 'bg-[#fffbeb]/80 border-[#f59e0b]/30') :
            settings.theme === 'ceramic-majolica' ? (settings.darkMode ? 'bg-[#15803d]/90 border-[#facc15]/30' : 'bg-[#fefce8]/80 border-[#facc15]/30') :
            settings.theme === 'ceramic-delft' ? (settings.darkMode ? 'bg-[#0c4a6e]/90 border-[#bae6fd]/30' : 'bg-[#f0f9ff]/80 border-[#bae6fd]/30') :
            settings.theme === 'ceramic-iznik' ? (settings.darkMode ? 'bg-[#7f1d1d]/90 border-[#0ea5e9]/30' : 'bg-[#fef2f2]/80 border-[#0ea5e9]/30') :
            'bg-white/80 dark:bg-gray-900/80 border-gray-100 dark:border-gray-800'
        }`}>
            <div className="flex items-center gap-4">
                <button onClick={handleBackToList} className={`md:hidden p-2 rounded-full ${settings.theme === 'zellige' ? (settings.darkMode ? 'text-[#cca43b] hover:bg-[#cca43b]/10' : 'text-[#006269] hover:bg-[#006269]/10') : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}><ArrowRight size={20} /></button>
                {/* ... Header Content ... */}
                {(activeTab === 'private' || activeTab === 'guest') && selectedChatId ? (
                    <div className="flex items-center gap-3 animate-fade-in">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg relative overflow-hidden border-2 ${isZellige ? (settings.darkMode ? 'border-[#cca43b] bg-[#002a2d]' : 'border-[#006269] bg-[#006269]') : 'border-blue-500 bg-blue-600'}`}>
                            {activeTab === 'guest' ? <User size={22} className={isZellige ? 'text-[#cca43b]' : ''} /> : <img src={users.find(u=>u.id===selectedChatId)?.avatar} className="w-full h-full object-cover" alt="" />}
                        </div>
                        <div>
                            <div className={`font-black flex items-center gap-2 text-base ${isZellige ? (settings.darkMode ? 'text-[#cca43b]' : 'text-[#006269]') : 'text-gray-800 dark:text-white'}`}>{getSenderName(selectedChatId)}</div>
                            <p className="text-xs text-green-600 flex items-center gap-1.5 font-bold"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span> متصل الآن</p>
                        </div>
                        {activeTab === 'guest' && (
                            <button 
                                onClick={() => {
                                    const session = chatSessions.find(s => s.id === selectedChatId);
                                    const booking = bookings.find(b => b.roomNumber === session?.roomNumber && b.status === 'active');
                                    const phone = booking?.guests[0]?.phone?.replace(/[^\d+]/g, '');
                                    if (phone) {
                                        window.open(`https://wa.me/${phone}`, '_blank');
                                    } else {
                                        addNotification('رقم الهاتف غير متوفر لهذا النزيل', 'warning');
                                    }
                                }}
                                className="mr-4 p-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition active:scale-95 shadow-lg flex items-center gap-2 text-xs font-bold"
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                رد عبر واتساب
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-3 animate-fade-in">
                        <div className={`p-2.5 rounded-2xl shadow-inner ${settings.theme === 'zellige' ? (settings.darkMode ? 'bg-[#001e21] text-[#cca43b] border border-[#cca43b]/30' : 'bg-[#FDFBF7] text-[#006269] border border-[#cca43b]/30') : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                            {activeChannel?.icon && <activeChannel.icon size={22} strokeWidth={2.5} />}
                        </div>
                        <div>
                            <div className={`font-black flex items-center gap-2 text-base ${isZellige ? (settings.darkMode ? 'text-[#cca43b]' : 'text-[#006269]') : 'text-gray-800 dark:text-white'}`}>{activeChannel?.label}</div>
                            <p className={`text-xs font-medium ${isZellige ? (settings.darkMode ? 'text-[#cca43b]/70' : 'text-[#006269]/70') : 'text-gray-500'}`}>{getChannelDescription(activeTab)}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Messages List - Scrollable area with padding to avoid hiding behind sticky input */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth z-0 custom-scrollbar pb-24 md:pb-24 relative">
           {displayMessages.length === 0 && selectedChatId && <div className="h-full flex flex-col items-center justify-center opacity-60 gap-6"><div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-inner ${settings.theme === 'zellige' ? (settings.darkMode ? 'bg-[#002a2d] border border-[#cca43b]/20' : 'bg-white border border-[#cca43b]/20') : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700'}`}><Shield size={64} className={`${settings.theme === 'zellige' ? (settings.darkMode ? 'text-[#cca43b]/50' : 'text-[#006269]/50') : 'text-gray-400'} drop-shadow-sm`} strokeWidth={1} /></div><div className="text-center max-w-xs"><p className={`font-black text-xl mb-2 ${settings.theme === 'zellige' ? (settings.darkMode ? 'text-[#cca43b]' : 'text-[#006269]') : 'text-gray-700 dark:text-gray-300'}`}>مساحة آمنة</p><p className={`text-sm leading-relaxed ${settings.theme === 'zellige' ? (settings.darkMode ? 'text-[#cca43b]/70' : 'text-[#006269]/70') : 'text-gray-500'}`}>هذه المحادثة مشفرة ومؤمنة بالكامل.</p></div></div>}
           {displayMessages.map((msg, idx) => {
             const isMe = msg.senderId === currentUser?.id || (!msg.isGuestMessage && activeTab === 'guest' && msg.senderId === 'STAFF'); 
             const showSenderName = !isMe && (idx === 0 || displayMessages[idx-1].senderId !== msg.senderId);
             const bubbleStyle = getMyBubbleStyle();
             const otherBubbleStyle = isZellige ? (settings.darkMode ? 'bg-[#002a2d] text-[#cca43b] shadow-sm border border-[#cca43b]/30' : 'bg-white text-[#006269] shadow-sm border border-[#cca43b]/30') : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm border border-gray-100 dark:border-gray-700';

             return (
               <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-scale-in group`}>
                 {!isMe && showSenderName && <span className={`text-[10px] font-bold mb-1 px-2 flex items-center gap-1 ${settings.theme === 'zellige' ? (settings.darkMode ? 'text-[#cca43b]/70' : 'text-[#006269]/70') : 'text-gray-500'}`}>{getSenderName(msg.senderId)}</span>}
                 <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-3 px-5 relative transition-all duration-200 ${isMe ? `${bubbleStyle} rounded-br-none` : `${otherBubbleStyle} rounded-bl-none`}`}>
                   <p className="text-sm leading-7 whitespace-pre-wrap font-medium">{msg.content}</p>
                   <span className={`text-[9px] block text-left mt-1 font-mono font-bold opacity-70 ${isMe ? (settings.theme === 'zellige' && settings.darkMode ? 'text-[#001e21]/70' : 'text-[#cca43b]/50') : settings.theme === 'zellige' ? (settings.darkMode ? 'text-[#cca43b]/50' : 'text-[#006269]/50') : 'text-gray-400'}`}>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                 </div>
               </div>
             )
           })}
        </div>
        
        {/* Sticky Input Area - Positioned absolutely at bottom */}
        <div className={`p-2 z-30 sticky bottom-0 backdrop-blur border-t w-full ${
            settings.theme === 'zellige' ? (settings.darkMode ? 'bg-[#001e21]/90 border-[#cca43b]/30' : 'bg-[#FDFBF7]/90 border-[#cca43b]/30') : 
            settings.theme === 'zellige-v2' ? (settings.darkMode ? 'bg-[#012a20]/90 border-[#024d38]/30' : 'bg-[#f5fcf9]/90 border-[#024d38]/30') :
            settings.theme === 'zellige-algiers' ? (settings.darkMode ? 'bg-[#0f172a]/90 border-[#1e3a8a]/30' : 'bg-[#eff6ff]/90 border-[#1e3a8a]/30') :
            'bg-white/95 dark:bg-gray-900/95 border-gray-100 dark:border-gray-700'
        }`}>
            {canChat ? (
                <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-end gap-2">
                    <button type="button" className={`p-3 rounded-full shadow-sm hover:shadow-md transition border ${
                        settings.theme === 'zellige' ? (settings.darkMode ? 'bg-[#002a2d] text-[#cca43b] border-[#cca43b]/30' : 'bg-white text-[#006269] border-[#cca43b]/30') : 
                        settings.theme === 'zellige-v2' ? (settings.darkMode ? 'bg-[#012a20] text-[#c6e3d8] border-[#024d38]/30' : 'bg-white text-[#024d38] border-[#024d38]/30') :
                        settings.theme === 'zellige-algiers' ? (settings.darkMode ? 'bg-[#0f172a] text-[#f8fafc] border-[#1e3a8a]/30' : 'bg-white text-[#1e3a8a] border-[#1e3a8a]/30') :
                        'bg-white dark:bg-gray-800 text-gray-400 border-gray-100'
                    }`}><Paperclip size={20} /></button>
                    <div className={`flex-1 rounded-[2rem] p-1 flex items-center border transition-all shadow-sm ${
                        settings.theme === 'zellige' ? (settings.darkMode ? 'bg-[#002a2d] border-[#cca43b]/40 focus-within:border-[#cca43b] focus-within:ring-1 focus-within:ring-[#cca43b]/20' : 'bg-white border-[#cca43b]/40 focus-within:border-[#006269] focus-within:ring-1 focus-within:ring-[#006269]/20') : 
                        settings.theme === 'zellige-v2' ? (settings.darkMode ? 'bg-[#012a20] border-[#024d38]/40 focus-within:border-[#024d38]' : 'bg-white border-[#024d38]/40 focus-within:border-[#024d38]') :
                        settings.theme === 'zellige-algiers' ? (settings.darkMode ? 'bg-[#0f172a] border-[#1e3a8a]/40 focus-within:border-[#1e3a8a]' : 'bg-white border-[#1e3a8a]/40 focus-within:border-[#1e3a8a]') :
                        'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}>
                        <input 
                            ref={inputRef}
                            type="text" 
                            value={input}
                            onFocus={handleInputFocus}
                            onChange={e => setInput(e.target.value)}
                            placeholder={selectedChatId ? "اكتب رسالة..." : "اكتب للمجموعة..."}
                            disabled={(activeTab === 'private' || activeTab === 'guest') && !selectedChatId}
                            className={`flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-sm outline-none font-bold ${
                                settings.theme === 'zellige' ? (settings.darkMode ? 'text-[#cca43b] placeholder-[#cca43b]/40' : 'text-[#006269] placeholder-[#006269]/40') : 
                                settings.theme === 'zellige-v2' ? (settings.darkMode ? 'text-[#c6e3d8] placeholder-[#c6e3d8]/40' : 'text-[#024d38] placeholder-[#024d38]/40') :
                                settings.theme === 'zellige-algiers' ? (settings.darkMode ? 'text-[#f8fafc] placeholder-[#f8fafc]/40' : 'text-[#1e3a8a] placeholder-[#1e3a8a]/40') :
                                'text-gray-800 dark:text-white placeholder-gray-400'
                            }`}
                            autoComplete="off"
                        />
                        <div className="flex items-center gap-1 pl-1">
                            {input.trim() && <button type="submit" disabled={(activeTab === 'private' || activeTab === 'guest') && !selectedChatId} className={getSendButtonStyle()}><Send size={18} className="-translate-x-0.5" /></button>}
                        </div>
                    </div>
                </form>
            ) : (
                <div className="p-3 mx-auto max-w-lg bg-red-50 text-center text-red-500 font-bold rounded-2xl border border-red-100 text-xs flex items-center justify-center gap-2"><Lock size={14} /> المحادثة غير مفعلة</div>
            )}
        </div>
      </div>
    </div>
  );
};
