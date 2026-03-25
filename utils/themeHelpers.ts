
import { AppTheme, AppSettings } from '../types';

export const getZelligePatternClass = (theme: AppTheme) => {
    if (theme === 'zellige') return 'bg-zellige-pattern';
    if (theme === 'zellige-v2') return 'bg-zellige-v2-pattern';
    if (theme === 'zellige-algiers') return 'bg-zellige-algiers-pattern';
    return 'bg-zellige-pattern';
};

export const getMobileHeaderStyle = (settings: AppSettings) => {
    const { theme, darkMode } = settings;
    if (darkMode) {
        switch (theme) {
            case 'zellige': return "pointer-events-auto bg-[#001e21]/95 border border-[#cca43b]/30 backdrop-blur-md shadow-lg rounded-2xl p-3 flex justify-between items-center text-[#cca43b] shadow-[#cca43b]/10";
            case 'zellige-v2': return "pointer-events-auto bg-[#012a20]/95 border border-[#024d38]/30 backdrop-blur-md shadow-lg rounded-2xl p-3 flex justify-between items-center text-[#c6e3d8] shadow-[#024d38]/10";
            case 'zellige-algiers': return "pointer-events-auto bg-[#0f172a]/95 border border-[#1e3a8a]/30 backdrop-blur-md shadow-lg rounded-2xl p-3 flex justify-between items-center text-[#f8fafc] shadow-[#1e3a8a]/10";
            default: return "pointer-events-auto bg-gray-900/90 backdrop-blur-md shadow-lg rounded-2xl p-3 flex justify-between items-center text-white";
        }
    }
    switch (theme) {
        case 'zellige': return "pointer-events-auto bg-[#FDFBF7]/95 border border-[#cca43b]/30 backdrop-blur-md shadow-lg rounded-2xl p-3 flex justify-between items-center text-[#006269] shadow-[#cca43b]/10";
        case 'zellige-v2': return "pointer-events-auto bg-[#f5fcf9]/95 border border-[#c6e3d8]/30 backdrop-blur-md shadow-lg rounded-2xl p-3 flex justify-between items-center text-[#024d38] shadow-[#024d38]/10";
        case 'zellige-algiers': return "pointer-events-auto bg-[#eff6ff]/95 border border-[#1e3a8a]/30 backdrop-blur-md shadow-lg rounded-2xl p-3 flex justify-between items-center text-[#1e3a8a] shadow-[#1e3a8a]/10";
        default: return "pointer-events-auto bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-3 flex justify-between items-center text-gray-900";
    }
};

export const getBottomNavContainerStyle = (settings: AppSettings) => {
    const { theme, darkMode } = settings;
    const base = "fixed bottom-6 left-6 right-6 z-50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex justify-between items-center px-6 py-3 rounded-[2.5rem] shadow-2xl backdrop-blur-xl border";
    
    if (darkMode) {
        switch (theme) {
            case 'zellige': return `${base} bg-[#001e21]/95 border-[#cca43b]/40 shadow-[#cca43b]/10`;
            case 'zellige-v2': return `${base} bg-[#012a20]/95 border-[#024d38]/40 shadow-[#024d38]/10`;
            case 'zellige-algiers': return `${base} bg-[#0f172a]/95 border-[#1e3a8a]/40 shadow-[#1e3a8a]/10`;
            default: return `${base} bg-gray-900/95 border-gray-700`;
        }
    }
    switch (theme) {
        case 'zellige': return `${base} bg-[#FDFBF7]/95 border-[#cca43b]/40 shadow-[#cca43b]/10`;
        case 'zellige-v2': return `${base} bg-[#f5fcf9]/95 border-[#c6e3d8]/40 shadow-[#024d38]/10`;
        case 'zellige-algiers': return `${base} bg-[#eff6ff]/95 border-[#1e3a8a]/40 shadow-[#1e3a8a]/10`;
        default: return `${base} bg-white/95 border-gray-200`;
    }
};

export const getSectionTitleClass = (settings: AppSettings) => {
    const { theme, darkMode } = settings;
    if (darkMode) {
        switch (theme) {
            case 'zellige': return 'text-[#cca43b] opacity-90 font-serif tracking-widest';
            case 'zellige-v2': return 'text-[#c6e3d8] opacity-90 font-serif tracking-widest';
            case 'zellige-algiers': return 'text-[#f8fafc] opacity-90 font-serif tracking-widest';
            default: return 'text-gray-400';
        }
    }
    switch (theme) {
        case 'zellige': return 'text-[#006269] font-serif tracking-widest';
        case 'zellige-v2': return 'text-[#024d38] font-serif tracking-widest';
        case 'zellige-algiers': return 'text-[#1e3a8a] font-serif tracking-widest';
        default: return 'text-gray-400';
    }
};

export const getNavItemClass = (settings: AppSettings, isActive: boolean) => {
    const { theme, darkMode } = settings;
    const base = "w-full flex items-center gap-3 relative group p-3 rounded-2xl transition-all duration-300 font-bold text-sm mb-2";
    
    if (isActive) {
        if (darkMode) {
            switch (theme) {
                case 'zellige': return `${base} bg-[#002a2d] text-[#cca43b] border border-[#cca43b]/50 shadow-md shadow-[#cca43b]/10`;
                case 'zellige-v2': return `${base} bg-[#012a20] text-[#c6e3d8] border border-[#024d38]/50 shadow-md shadow-[#024d38]/10`;
                case 'zellige-algiers': return `${base} bg-[#0f172a] text-[#f8fafc] border border-[#1e3a8a]/50 shadow-md shadow-[#1e3a8a]/10`;
                default: return `${base} bg-blue-600 text-white shadow-lg`;
            }
        }
        switch (theme) {
            case 'zellige': return `${base} bg-[#fdfbf7] text-[#006269] border border-[#cca43b]/50 shadow-md shadow-[#cca43b]/10`;
            case 'zellige-v2': return `${base} bg-[#f5fcf9] text-[#024d38] border border-[#c6e3d8]/50 shadow-md shadow-[#024d38]/10`;
            case 'zellige-algiers': return `${base} bg-[#eff6ff] text-[#1e3a8a] border border-[#1e3a8a]/50 shadow-md shadow-[#1e3a8a]/10`;
            default: return `${base} bg-blue-600 text-white shadow-lg`;
        }
    }
    
    if (darkMode) {
        switch (theme) {
            case 'zellige': return `${base} text-[#cca43b]/70 hover:bg-[#cca43b]/10 hover:text-[#cca43b]`;
            case 'zellige-v2': return `${base} text-[#c6e3d8]/70 hover:bg-[#024d38]/20 hover:text-[#c6e3d8]`;
            case 'zellige-algiers': return `${base} text-[#f8fafc]/70 hover:bg-[#1e3a8a]/20 hover:text-[#f8fafc]`;
            default: return `${base} text-gray-400 hover:bg-gray-800 hover:text-white`;
        }
    }
    return `${base} text-gray-600 hover:bg-gray-50 hover:text-gray-900`;
};

export const getIconBoxClass = (settings: AppSettings, isActive: boolean, isBottomNav: boolean = false) => {
    const { theme, darkMode } = settings;
    const base = `flex items-center justify-center transition-all duration-500 shrink-0 relative overflow-hidden ${isBottomNav ? "w-12 h-12 rounded-2xl" : "w-10 h-10 rounded-xl"}`;
    
    if (isActive) {
        if (darkMode) {
            switch (theme) {
                case 'zellige': return `${base} bg-[#cca43b] text-[#001e21] shadow-[0_0_15px_rgba(204,164,59,0.3)]`;
                case 'zellige-v2': return `${base} bg-[#024d38] text-[#c6e3d8] shadow-[0_0_15px_rgba(2,77,56,0.3)]`;
                case 'zellige-algiers': return `${base} bg-[#1e3a8a] text-[#f8fafc] shadow-[0_0_15px_rgba(30,58,138,0.3)]`;
                default: return `${base} bg-blue-600 text-white`;
            }
        }
        switch (theme) {
            case 'zellige': return `${base} bg-[#006269] text-[#cca43b]`;
            case 'zellige-v2': return `${base} bg-[#024d38] text-[#c6e3d8]`;
            case 'zellige-algiers': return `${base} bg-[#1e3a8a] text-white`;
            default: return `${base} bg-blue-600 text-white`;
        }
    }
    
    if (darkMode) {
        return `${base} text-gray-400 bg-gray-800/50`;
    }
    return `${base} text-gray-500 bg-gray-100`;
};

export const getBrandCardStyle = (settings: AppSettings, isSidebarCollapsed: boolean) => {
    const { theme, darkMode } = settings;
    const base = `w-full ${isSidebarCollapsed ? 'p-3' : 'p-6'} rounded-[2rem] mb-6 relative overflow-hidden group shadow-lg transition-all duration-500 hover:shadow-xl flex flex-col items-center text-center`;
    
    if (darkMode) {
        switch (theme) {
            case 'zellige': return `${base} bg-[#002a2d] border-[3px] border-[#cca43b] text-[#cca43b]`;
            case 'zellige-v2': return `${base} bg-[#012a20] border-[3px] border-[#024d38] text-[#c6e3d8]`;
            case 'zellige-algiers': return `${base} bg-[#0f172a] border-[3px] border-[#1e3a8a] text-[#f8fafc]`;
            default: return `${base} bg-gray-800 border-gray-700 text-white`;
        }
    }
    switch (theme) {
        case 'zellige': return `${base} bg-[#fdfbf7] border-[3px] border-[#cca43b] text-[#006269]`;
        case 'zellige-v2': return `${base} bg-[#f5fcf9] border-[3px] border-[#c6e3d8] text-[#024d38]`;
        case 'zellige-algiers': return `${base} bg-[#eff6ff] border-[3px] border-[#1e3a8a] text-[#1e3a8a]`;
        default: return `${base} bg-white border-gray-200 text-gray-900`;
    }
};

export const getHeaderBtnStyle = (settings: AppSettings) => {
    const { theme, darkMode } = settings;
    const base = "p-2 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center relative overflow-hidden";
    
    if (darkMode) {
        switch (theme) {
            case 'zellige': return `${base} bg-[#002a2d] text-[#cca43b] border border-[#cca43b]/30`;
            case 'zellige-v2': return `${base} bg-[#012a20] text-[#c6e3d8] border border-[#024d38]/30`;
            case 'zellige-algiers': return `${base} bg-[#0f172a] text-[#f8fafc] border border-[#1e3a8a]/30`;
            default: return `${base} bg-gray-800 text-white border-gray-700`;
        }
    }
    switch (theme) {
        case 'zellige': return `${base} bg-[#FDFBF7] text-[#006269] border border-[#cca43b]/30`;
        case 'zellige-v2': return `${base} bg-[#f5fcf9] text-[#024d38] border border-[#c6e3d8]/30`;
        case 'zellige-algiers': return `${base} bg-[#eff6ff] text-[#1e3a8a] border border-[#1e3a8a]/30`;
        default: return `${base} bg-white text-gray-900 border-gray-200`;
    }
};

export const getMenuIconStyle = (settings: AppSettings) => {
    const { theme, darkMode } = settings;
    const base = "p-4 rounded-2xl mb-2 transition-all duration-300 group-active:scale-95 shadow-md relative overflow-hidden flex items-center justify-center";
    
    if (darkMode) {
        switch (theme) {
            case 'zellige': return `${base} bg-[#002a2d] text-[#cca43b] border border-[#cca43b]/30`;
            case 'zellige-v2': return `${base} bg-[#012a20] text-[#c6e3d8] border border-[#024d38]/30`;
            case 'zellige-algiers': return `${base} bg-[#0f172a] text-[#f8fafc] border border-[#1e3a8a]/30`;
            default: return `${base} bg-gray-800 text-white border-gray-700`;
        }
    }
    switch (theme) {
        case 'zellige': return `${base} bg-[#FDFBF7] text-[#006269] border border-[#cca43b]/30`;
        case 'zellige-v2': return `${base} bg-[#f5fcf9] text-[#024d38] border border-[#c6e3d8]/30`;
        case 'zellige-algiers': return `${base} bg-[#eff6ff] text-[#1e3a8a] border border-[#1e3a8a]/30`;
        default: return `${base} bg-white text-gray-900 border-gray-200`;
    }
};

export const getMainBackground = (settings: AppSettings) => {
    const { theme, darkMode } = settings;
    if (darkMode) {
        if (theme === 'zellige') return "bg-[#001517] text-gray-100"; // Deep Dark Teal
        if (theme === 'zellige-v2') return "bg-[#001a14] text-gray-100";
        if (theme === 'zellige-algiers') return "bg-[#0f172a] text-gray-100"; // Dark Slate
        return "bg-[#001517] text-gray-100";
    }
    if (theme === 'zellige-v2') return "bg-[#f5fcf9] text-slate-900";
    if (theme === 'zellige-algiers') return "bg-[#eff6ff] text-slate-900";
    return "bg-[#f8fafc] text-slate-900";
};

export const getSidebarStyle = (settings: AppSettings, isSidebarCollapsed: boolean) => {
    const { theme, darkMode } = settings;
    const base = `hidden flex-col h-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] relative z-40 shadow-2xl border-l ${isSidebarCollapsed ? 'w-24' : 'w-80'}`;
    
    if (darkMode) {
        switch (theme) {
            case 'zellige': return `${base} bg-[#001e21] border-[#cca43b]/30`;
            case 'zellige-v2': return `${base} bg-[#012a20] border-[#024d38]/30`;
            case 'zellige-algiers': return `${base} bg-[#0f172a] border-[#1e3a8a]/30`;
            default: return `${base} bg-gray-900 border-gray-800`;
        }
    }
    switch (theme) {
        case 'zellige': return `${base} bg-[#FDFBF7] border-[#cca43b]/30`;
        case 'zellige-v2': return `${base} bg-[#f5fcf9] border-[#c6e3d8]/30`;
        case 'zellige-algiers': return `${base} bg-[#eff6ff] border-[#1e3a8a]/30`;
        default: return `${base} bg-white border-gray-200`;
    }
};

export const getThemeColor = (settings: AppSettings, type: 'text' | 'bg' | 'border' | 'icon') => {
    const { theme, darkMode } = settings;
    
    if (darkMode) {
        switch (theme) {
            case 'zellige': return type === 'text' ? 'text-[#cca43b]' : type === 'bg' ? 'bg-[#cca43b]' : type === 'border' ? 'border-[#cca43b]' : 'text-[#cca43b]';
            case 'zellige-v2': return type === 'text' ? 'text-[#c6e3d8]' : type === 'bg' ? 'bg-[#024d38]' : type === 'border' ? 'border-[#024d38]' : 'text-[#c6e3d8]';
            case 'zellige-algiers': return type === 'text' ? 'text-[#f8fafc]' : type === 'bg' ? 'bg-[#1e3a8a]' : type === 'border' ? 'border-[#1e3a8a]' : 'text-[#f8fafc]';
            default: return type === 'text' ? 'text-white' : type === 'bg' ? 'bg-blue-600' : type === 'border' ? 'border-gray-700' : 'text-blue-500';
        }
    }
    
    switch (theme) {
        case 'zellige': return type === 'text' ? 'text-[#006269]' : type === 'bg' ? 'bg-[#006269]' : type === 'border' ? 'border-[#cca43b]' : 'text-[#006269]';
        case 'zellige-v2': return type === 'text' ? 'text-[#024d38]' : type === 'bg' ? 'bg-[#024d38]' : type === 'border' ? 'border-[#c6e3d8]' : 'text-[#024d38]';
        case 'zellige-algiers': return type === 'text' ? 'text-[#1e3a8a]' : type === 'bg' ? 'bg-[#1e3a8a]' : type === 'border' ? 'border-[#1e3a8a]' : 'text-[#1e3a8a]';
        default: return type === 'text' ? 'text-gray-900' : type === 'bg' ? 'bg-blue-600' : type === 'border' ? 'border-gray-200' : 'text-blue-600';
    }
};
