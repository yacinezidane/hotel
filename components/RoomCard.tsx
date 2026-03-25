
import React from 'react';
import { Room, RoomStatus, RoomType, Booking } from '../types';
import { useHotel } from '../context/HotelContext';
import { User, Users, Key, AlertTriangle, Brush, CheckCircle, Crown, Bed, Sparkles, Eye, Info, House, Footprints } from 'lucide-react';
import { isZelligeTheme } from '../constants';

interface RoomCardProps {
  room: Room;
  canEdit: boolean;
  onStatusChange: (id: number, status: RoomStatus) => void;
  onTypeChange: (id: number, type: RoomType) => void;
  onClick: (room: Room) => void;
  activeBooking?: Booking; // Changed from number count to full booking object for details
  onViewGuests?: (booking: Booking) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ 
  room, 
  canEdit, 
  onStatusChange, 
  onTypeChange, 
  onClick, 
  activeBooking,
  onViewGuests
}) => {
  const { settings } = useHotel();
  
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'SELECT') return;
    onClick(room);
  };

  const handleGuestBadgeClick = (e: React.MouseEvent) => {
      if (activeBooking && onViewGuests) {
          e.stopPropagation();
          onViewGuests(activeBooking);
      }
  };

  const getStatusIcon = (status: RoomStatus) => {
    switch(status) {
      case 'available': return CheckCircle;
      case 'occupied': return User;
      case 'booked': return Key;
      case 'dirty': return Brush;
      case 'maintenance': return AlertTriangle;
      default: return Bed;
    }
  }

  const getTypeIcon = (type: RoomType) => {
    switch(type) {
      case 'single': return User;
      case 'double': return Users;
      case 'suite': return Crown;
      case 'vip': return Sparkles;
      default: return Bed;
    }
  }

  const getTypeStyles = (type: RoomType) => {
    switch(type) {
      case 'vip': return 'bg-gradient-to-r from-yellow-300 to-yellow-500 text-black border-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.6)]';
      case 'suite': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]';
      case 'double': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-300 shadow-md';
      default: return 'bg-white/20 text-white border-white/30 backdrop-blur-sm shadow-sm hover:bg-white/30';
    }
  };

  const getThemeBorderClass = () => {
      if (settings.darkMode) {
          switch(settings.theme) {
              case 'zellige': return 'border-[2px] md:border-[3px] border-[#cca43b] shadow-lg shadow-[#cca43b]/20';
              case 'zellige-v2': return 'border-[2px] md:border-[3px] border-[#c6e3d8] shadow-lg shadow-[#c6e3d8]/20';
              case 'zellige-algiers': return 'border-[2px] md:border-[3px] border-[#60a5fa] shadow-lg shadow-[#60a5fa]/20';
              case 'zellige-tlemcen': return 'border-[2px] md:border-[3px] border-[#b45309] shadow-lg shadow-[#b45309]/20';
              case 'zellige-sahara': return 'border-[2px] md:border-[3px] border-[#d97706] shadow-lg shadow-[#d97706]/20';
              case 'ceramic-talavera': return 'border-[2px] md:border-[3px] border-[#f59e0b] shadow-lg shadow-[#f59e0b]/20';
              case 'ceramic-majolica': return 'border-[2px] md:border-[3px] border-[#facc15] shadow-lg shadow-[#facc15]/20';
              case 'ceramic-delft': return 'border-[2px] md:border-[3px] border-[#bae6fd] shadow-lg shadow-[#bae6fd]/20';
              case 'ceramic-iznik': return 'border-[2px] md:border-[3px] border-[#0ea5e9] shadow-lg shadow-[#0ea5e9]/20';
              default: return 'border border-white/10';
          }
      }

      switch(settings.theme) {
          case 'instagram': return 'border-2 border-insta-primary shadow-lg shadow-pink-500/20';
          case 'zellige': return 'border-[2px] md:border-[3px] border-[#cca43b] shadow-lg';
          case 'zellige-v2': return 'border-[2px] md:border-[3px] border-[#024d38] shadow-lg shadow-green-500/20';
          case 'zellige-algiers': return 'border-[2px] md:border-[3px] border-[#1e3a8a] shadow-lg shadow-[#1e3a8a]/20';
          case 'zellige-tlemcen': return 'border-[2px] md:border-[3px] border-[#7c2d12] shadow-lg shadow-[#7c2d12]/20';
          case 'zellige-sahara': return 'border-[2px] md:border-[3px] border-[#c2410c] shadow-lg shadow-[#c2410c]/20';
          case 'ceramic-talavera': return 'border-[2px] md:border-[3px] border-[#1e3a8a] shadow-lg shadow-[#1e3a8a]/20';
          case 'ceramic-majolica': return 'border-[2px] md:border-[3px] border-[#15803d] shadow-lg shadow-[#15803d]/20';
          case 'ceramic-delft': return 'border-[2px] md:border-[3px] border-[#0c4a6e] shadow-lg shadow-[#0c4a6e]/20';
          case 'ceramic-iznik': return 'border-[2px] md:border-[3px] border-[#dc2626] shadow-lg shadow-[#dc2626]/20';
          case 'rose': return 'border-[2px] md:border-[3px] border-rose-400/50 shadow-md';
          case 'ocean': return 'border-[2px] md:border-[3px] border-slate-700/50 shadow-md';
          default: return 'border border-white/10';
      }
  };

  const getZelligePatternClass = () => {
      if (settings.theme === 'zellige') return 'bg-zellige-pattern';
      if (settings.theme === 'zellige-v2') return 'bg-zellige-v2-pattern';
      if (settings.theme === 'zellige-algiers') return 'bg-zellige-algiers-pattern';
      if (settings.theme === 'zellige-tlemcen') return 'bg-zellige-tlemcen-pattern';
      if (settings.theme === 'zellige-sahara') return 'bg-zellige-sahara-pattern';
      if (settings.theme === 'ceramic-talavera') return 'bg-zellige-pattern';
      if (settings.theme === 'ceramic-majolica') return 'bg-zellige-pattern';
      if (settings.theme === 'ceramic-delft') return 'bg-zellige-pattern';
      if (settings.theme === 'ceramic-iznik') return 'bg-zellige-pattern';
      return 'bg-zellige-pattern';
  };

  const StatusIcon = getStatusIcon(room.status);
  const TypeIcon = getTypeIcon(room.type);
  const statusLabel = { available: 'متوفرة', occupied: 'مشغولة', booked: 'محجوزة', dirty: 'تنظيف', maintenance: 'صيانة' }[room.status];
  const typeLabel = { single: 'مفردة', double: 'مزدوجة', suite: 'جناح', vip: 'VIP' }[room.type];
  const typeBadgeStyle = getTypeStyles(room.type);
  const themeBorder = getThemeBorderClass();

  const statusColors = {
      available: 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-500/30',
      occupied: 'bg-gradient-to-br from-blue-600 to-indigo-800 shadow-blue-500/30',
      booked: 'bg-gradient-to-br from-amber-500 to-orange-700 shadow-amber-500/30',
      dirty: 'bg-gradient-to-br from-rose-500 to-red-700 shadow-rose-500/30',
      maintenance: 'bg-gradient-to-br from-slate-600 to-gray-800 shadow-gray-500/30'
  };

  const guestCount = activeBooking ? activeBooking.guests.length : 0;
  
  // Presence Logic
  const isGuestIn = room.currentGuestLocation === 'in_hotel';
  const showPresence = room.status === 'occupied';

  return (
      <div onClick={handleCardClick} className="group relative w-full aspect-[4/5] min-h-[140px] md:min-h-[200px] rounded-[1.8rem] md:rounded-[2.5rem] transition-all duration-500 ease-out transform hover:-translate-y-2 hover:scale-[1.02] cursor-pointer perspective-1000">
          <div className={`absolute inset-0 rounded-[1.8rem] md:rounded-[2.5rem] ${statusColors[room.status]} shadow-xl md:shadow-2xl ${themeBorder} overflow-hidden flex flex-col p-3 md:p-5 transition-all duration-300`}>
              <div className="absolute top-0 right-0 w-40 h-40 md:w-72 md:h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              
              {/* Background Decoration Icon (Smaller on Mobile) */}
              <TypeIcon 
                size={160} 
                className="absolute -right-4 -bottom-4 md:-right-6 md:-bottom-6 text-white/5 rotate-12 transition-transform duration-[2000ms] group-hover:rotate-0 group-hover:scale-110 pointer-events-none animate-pulse w-24 h-24 md:w-40 md:h-40" 
                strokeWidth={1} 
              />
              
              {/* Zellige Pattern Overlay */}
              {(isZelligeTheme(settings.theme)) && (
                  <div className={`absolute inset-0 ${getZelligePatternClass()} opacity-10 mix-blend-overlay pointer-events-none rounded-[1.8rem] md:rounded-[2.5rem]`}></div>
              )}
              
              {/* Top Row: Guest Count & Type Badge */}
              <div className="relative z-10 flex justify-between items-start">
                  
                  {/* Interactive Guest Count Badge */}
                  <div 
                    onClick={handleGuestBadgeClick}
                    className={`flex items-center justify-center h-6 md:h-8 px-2 md:px-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg transition-all duration-300 
                        ${guestCount > 0 
                            ? 'bg-blue-600/80 hover:bg-blue-500 text-white cursor-pointer hover:scale-105 hover:shadow-blue-500/50' 
                            : 'bg-black/20 text-white/50 opacity-0 -translate-y-2'
                        }
                    `}
                    title={activeBooking ? 'عرض النزلاء' : ''}
                  >
                      <Users size={12} className="md:w-3.5 md:h-3.5 mr-1" />
                      <span className="font-bold text-xs md:text-sm">{guestCount}</span>
                  </div>
                  
                  {/* Prominent Room Type Badge */}
                  <div className={`flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-white/10 font-black text-[9px] md:text-[10px] uppercase tracking-wider transform transition-transform group-hover:scale-105 shadow-sm backdrop-blur-md ${typeBadgeStyle}`}>
                      <TypeIcon size={10} className={`md:w-3 md:h-3 ${room.type === 'vip' ? 'text-black' : 'text-white'}`} />
                      {canEdit ? (
                          <select 
                            value={room.type} 
                            onChange={(e) => onTypeChange(room.id, e.target.value as RoomType)} 
                            className="bg-transparent outline-none cursor-pointer w-auto min-w-[40px] md:min-w-[60px]"
                          >
                              <option className="text-black" value="single">مفردة</option>
                              <option className="text-black" value="double">مزدوجة</option>
                              <option className="text-black" value="suite">جناح</option>
                              <option className="text-black" value="vip">VIP</option>
                          </select>
                      ) : (
                          <span>{typeLabel}</span>
                      )}
                  </div>
              </div>

              {/* Center Number (Responsive Font Size) */}
              <div className="flex-1 flex flex-col items-center justify-center relative z-10 my-1 md:my-2">
                  <span className="text-white/70 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-1 md:mb-2 drop-shadow-sm transition-opacity group-hover:opacity-100">ROOM</span>
                  <h3 className="text-5xl md:text-8xl font-black text-white drop-shadow-2xl tracking-tighter transform group-hover:scale-110 transition-transform duration-500 leading-none">{room.number}</h3>
                  
                  {/* PRESENCE INDICATOR */}
                  {showPresence && (
                      <div className={`mt-2 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold shadow-md transition-all duration-300 border backdrop-blur-sm
                          ${isGuestIn 
                              ? 'bg-green-500/90 text-white border-green-400' 
                              : 'bg-gray-800/80 text-gray-300 border-gray-600'
                          }
                      `}>
                          {isGuestIn ? <House size={10} className="animate-pulse"/> : <Footprints size={10}/>}
                          <span>{isGuestIn ? 'بالغرفة' : 'بالخارج'}</span>
                      </div>
                  )}
              </div>

              {/* Bottom Row */}
              <div className="relative z-10 mt-auto">
                  <div className="w-full flex items-center justify-between p-1.5 md:p-2 rounded-xl md:rounded-2xl bg-black/20 backdrop-blur-xl border border-white/20 shadow-inner group-hover:bg-black/30 transition-colors">
                      <div className="flex items-center gap-1.5 px-1">
                           <StatusIcon size={14} className="md:w-[18px] md:h-[18px] text-white animate-bounce" strokeWidth={2.5} style={{ animationDuration: '3s' }} />
                           {!canEdit && <span className="text-white text-[10px] md:text-xs font-bold tracking-wide">{statusLabel}</span>}
                      </div>
                      {canEdit ? (
                          <select value={room.status} onChange={(e) => onStatusChange(room.id, e.target.value as RoomStatus)} className="bg-transparent text-white text-[10px] md:text-xs font-bold py-0.5 px-1 outline-none cursor-pointer w-full text-left">
                              <option className="text-black" value="available">متوفرة</option><option className="text-black" value="booked">محجوزة</option><option className="text-black" value="occupied">مشغولة</option><option className="text-black" value="dirty">تنظيف</option><option className="text-black" value="maintenance">صيانة</option>
                          </select>
                      ) : (
                         <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-white animate-pulse mx-1 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                      )}
                  </div>
              </div>
          </div>
          {/* Shadow */}
          <div className="absolute -bottom-2 md:-bottom-4 left-6 right-6 md:left-10 md:right-10 h-4 md:h-6 rounded-[100%] bg-black/20 blur-lg md:blur-xl transition-all duration-500 group-hover:bg-black/40 group-hover:blur-2xl translate-y-1 md:translate-y-2"></div>
      </div>
  );
};
