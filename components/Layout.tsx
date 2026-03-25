import React, { useState, useEffect } from 'react';
import {
  Menu, X, LayoutDashboard, Calendar, Users, Settings, LogOut, Bell,
  Bed, Utensils, Waves, Briefcase, Package, FileText, Database,
  Hotel, ChevronRight, ChevronLeft,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: any[];
  onNotificationClick: (notification: any) => void;
  onClearNotifications: () => void;
  onMarkAllAsRead: () => void;
  onSettingsClick: () => void;
  onProfileClick: () => void;
  onSearch: (query: string) => void;
  onTabChange?: (tab: string) => void;
}

const navGroups = [
  {
    label: 'CORE',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'bookings', label: 'Bookings', icon: Calendar, badge: '12' },
      { id: 'rooms', label: 'Rooms', icon: Bed },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { id: 'guests', label: 'Guests', icon: Users },
      { id: 'services', label: 'Services', icon: Utensils },
      { id: 'facilities', label: 'Facilities', icon: Waves },
      { id: 'staff', label: 'Staff', icon: Briefcase },
      { id: 'inventory', label: 'Inventory', icon: Package },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { id: 'reports', label: 'Reports', icon: FileText },
      { id: 'database', label: 'Database', icon: Database },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

const allItems = navGroups.flatMap(g => g.items);

const mobileNavItems = [
  navGroups[0].items[0],
  navGroups[0].items[1],
  navGroups[0].items[2],
  navGroups[1].items[0],
  navGroups[2].items[2],
];

type ScreenSize = 'mobile' | 'tablet' | 'desktop';

function getSize(w: number): ScreenSize {
  if (w < 640) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

export const Layout: React.FC<LayoutProps> = ({
  children, user, onLogout, activeTab, setActiveTab,
  notifications, onNotificationClick, onClearNotifications,
  onMarkAllAsRead, onSettingsClick, onProfileClick, onSearch, onTabChange,
}) => {
  const [screen, setScreen] = useState<ScreenSize>(
    getSize(typeof window !== 'undefined' ? window.innerWidth : 1280)
  );
  const [expanded, setExpanded] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [tooltip, setTooltip] = useState<{ id: string; y: number } | null>(null);

  useEffect(() => {
    const fn = () => { setScreen(getSize(window.innerWidth)); };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const go = (tab: string) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
    if (screen === 'mobile') setDrawerOpen(false);
  };

  const unread = notifications.filter(n => !n.read).length;
  const label = allItems.find(i => i.id === activeTab)?.label || 'Dashboard';
  const isMobile = screen === 'mobile';
  const isTablet = screen === 'tablet';
  const isDesktop = screen === 'desktop';
  const iconMode = isTablet || (isDesktop && !expanded);

  const SidebarContents = () => (
    <>
      <div className="sb-logo">
        <div className="sb-logo-box"><Hotel size={18} color="#0A0A0F" /></div>
        <div className={iconMode ? 'sb-hide' : ''}>
          <div className="sb-logo-name">HotelPro</div>
          <div className="sb-logo-tag">Management Suite</div>
        </div>
      </div>

      <div className="sb-profile" onClick={onProfileClick}>
        <div className="sb-avatar">{user?.name?.charAt(0) || 'A'}</div>
        {!iconMode && (
          <>
            <div style={{flex:1,minWidth:0}}>
              <div className="sb-pname">{user?.name || 'Admin'}</div>
              <div className="sb-prole">{user?.role || 'Administrator'}</div>
            </div>
            <ChevronRight size={12} style={{color:'rgba(232,228,220,0.3)',flexShrink:0}} />
          </>
        )}
      </div>

      <nav className="sb-nav">
        {navGroups.map((g, gi) => (
          <div key={g.label}>
            {!iconMode && <div className="sb-glabel">{g.label}</div>}
            {iconMode && gi > 0 && <div className="sb-div" />}
            {g.items.map(item => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`sb-item${active ? ' active' : ''}${iconMode ? ' icon' : ''}`}
                  onClick={() => go(item.id)}
                  onMouseEnter={e => {
                    if (iconMode) {
                      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setTooltip({ id: item.id, y: r.top + r.height / 2 });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <item.icon size={16} style={{flexShrink:0,width:16,height:16}} />
                  {!iconMode && <span style={{flex:1}}>{item.label}</span>}
                  {!iconMode && (item as any).badge && (
                    <span className="sb-badge">{(item as any).badge}</span>
                  )}
                </button>
              );
            })}
            {!iconMode && gi < navGroups.length - 1 && <div className="sb-div" style={{marginTop:8}} />}
          </div>
        ))}
      </nav>

      <div className="sb-foot">
        <div className="sb-div" style={{margin:'0 0 8px'}} />
        <button className={`sb-logout${iconMode ? ' icon' : ''}`} onClick={onLogout}>
          <LogOut size={15} />
          {!iconMode && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box}

        :root {
          --bg:#0A0A0F; --border:rgba(255,255,255,0.06);
          --gold:#C9A84C; --gold-dim:rgba(201,168,76,0.10); --gold-glow:rgba(201,168,76,0.35);
          --text:#E8E4DC; --muted:rgba(232,228,220,0.35);
          --hover:rgba(255,255,255,0.04); --main:#0D0D14;
          --ease:280ms cubic-bezier(0.4,0,0.2,1);
        }

        .hp-shell{display:flex;height:100vh;height:100dvh;overflow:hidden;background:var(--main);font-family:'DM Sans',sans-serif}

        /* SIDEBAR */
        .hp-sb{
          background:var(--bg);border-right:1px solid var(--border);
          display:flex;flex-direction:column;height:100%;flex-shrink:0;
          overflow:hidden;position:relative;transition:width var(--ease);z-index:40;
        }
        .hp-sb::before{
          content:'';position:absolute;top:-80px;left:50%;transform:translateX(-50%);
          width:200px;height:200px;
          background:radial-gradient(circle,rgba(201,168,76,0.14) 0%,transparent 70%);
          pointer-events:none;
        }
        .hp-sb.full{width:260px}
        .hp-sb.slim{width:68px}

        /* Collapse btn */
        .sb-collapse{
          position:absolute;top:26px;right:-12px;
          width:24px;height:24px;background:#1A1A24;
          border:1px solid rgba(255,255,255,0.1);border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;z-index:50;color:var(--muted);
          transition:background .15s,color .15s;
        }
        .sb-collapse:hover{background:#252530;color:var(--gold)}

        /* Logo */
        .sb-logo{
          padding:22px 14px 16px;border-bottom:1px solid var(--border);
          display:flex;align-items:center;gap:10px;overflow:hidden;
          flex-shrink:0;position:relative;z-index:1;
        }
        .sb-logo-box{
          width:36px;height:36px;border-radius:10px;flex-shrink:0;
          background:linear-gradient(135deg,#C9A84C,#8B6914);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 14px var(--gold-glow);
        }
        .sb-logo-name{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;color:var(--text);line-height:1;white-space:nowrap}
        .sb-logo-tag{font-size:8px;font-weight:500;color:var(--gold);letter-spacing:.18em;text-transform:uppercase;margin-top:3px;white-space:nowrap}
        .sb-hide{display:none}

        /* Profile */
        .sb-profile{
          margin:14px 10px 10px;padding:10px 12px;
          background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;
          display:flex;align-items:center;gap:10px;cursor:pointer;overflow:hidden;
          flex-shrink:0;position:relative;z-index:1;
          transition:background .2s,border-color .2s;
        }
        .sb-profile:hover{background:rgba(255,255,255,0.05);border-color:rgba(201,168,76,0.25)}
        .sb-avatar{
          width:36px;height:36px;border-radius:9px;flex-shrink:0;
          background:linear-gradient(135deg,#C9A84C,#7A5C10);
          display:flex;align-items:center;justify-content:center;
          font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;color:#fff;
          box-shadow:0 2px 10px rgba(201,168,76,0.3);
        }
        .sb-pname{font-size:12px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .sb-prole{font-size:9px;color:var(--gold);letter-spacing:.12em;text-transform:uppercase;font-weight:500;margin-top:2px}

        /* Nav */
        .sb-nav{flex:1;overflow-y:auto;overflow-x:hidden;padding:6px 8px;scrollbar-width:none;position:relative;z-index:1}
        .sb-nav::-webkit-scrollbar{display:none}
        .sb-glabel{font-size:8px;font-weight:600;letter-spacing:.2em;color:var(--muted);padding:10px 10px 5px;text-transform:uppercase;white-space:nowrap}
        .sb-div{height:1px;background:var(--border);margin:4px 8px 2px}

        .sb-item{
          display:flex;align-items:center;gap:10px;padding:9px 10px;
          border-radius:9px;border:1px solid transparent;background:none;
          width:100%;text-align:left;color:var(--muted);
          font-size:12px;font-weight:500;font-family:'DM Sans',sans-serif;
          cursor:pointer;transition:background .15s,color .15s,border-color .15s;
          position:relative;white-space:nowrap;overflow:hidden;margin-bottom:2px;
        }
        .sb-item:hover{background:var(--hover);color:var(--text);border-color:rgba(255,255,255,0.06)}
        .sb-item.active{background:var(--gold-dim);border-color:rgba(201,168,76,0.2);color:var(--gold)}
        .sb-item.active::before{
          content:'';position:absolute;left:-8px;top:50%;transform:translateY(-50%);
          width:3px;height:18px;background:linear-gradient(180deg,#C9A84C,#8B6914);border-radius:0 2px 2px 0;
        }
        .sb-item.icon{justify-content:center;padding:11px 0}
        .sb-badge{background:var(--gold);color:#0A0A0F;font-size:8px;font-weight:700;padding:2px 6px;border-radius:20px;margin-left:auto;flex-shrink:0}

        /* Footer */
        .sb-foot{padding:8px 8px 14px;flex-shrink:0;position:relative;z-index:1}
        .sb-logout{
          display:flex;align-items:center;gap:10px;width:100%;padding:9px 10px;
          border-radius:9px;background:none;border:1px solid transparent;
          color:rgba(232,228,220,0.28);cursor:pointer;
          font-size:12px;font-weight:500;font-family:'DM Sans',sans-serif;
          transition:background .15s,color .15s,border-color .15s;white-space:nowrap;overflow:hidden;
        }
        .sb-logout:hover{background:rgba(239,68,68,0.08);border-color:rgba(239,68,68,0.15);color:#F87171}
        .sb-logout.icon{justify-content:center}

        /* Tooltip */
        .sb-tip{
          position:fixed;left:76px;background:#1A1A24;color:var(--text);
          font-size:11px;font-weight:500;padding:6px 12px;
          border-radius:8px;border:1px solid rgba(255,255,255,0.1);
          pointer-events:none;white-space:nowrap;z-index:9999;
          box-shadow:0 8px 24px rgba(0,0,0,0.5);
        }

        /* DRAWER (mobile) */
        .hp-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(3px);z-index:100}
        .hp-drawer{
          position:fixed;top:0;left:0;bottom:0;width:260px;
          background:var(--bg);border-right:1px solid var(--border);
          display:flex;flex-direction:column;z-index:110;overflow:hidden;
          transform:translateX(-100%);transition:transform var(--ease);
        }
        .hp-drawer.open{transform:translateX(0)}
        .hp-drawer::before{
          content:'';position:absolute;top:-80px;left:50%;transform:translateX(-50%);
          width:200px;height:200px;
          background:radial-gradient(circle,rgba(201,168,76,0.14) 0%,transparent 70%);
          pointer-events:none;
        }
        .drawer-x{
          position:absolute;top:14px;right:14px;width:30px;height:30px;
          background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
          border-radius:8px;display:flex;align-items:center;justify-content:center;
          cursor:pointer;color:var(--muted);z-index:1;transition:background .15s,color .15s;
        }
        .drawer-x:hover{background:rgba(255,255,255,0.1);color:var(--text)}

        /* HEADER */
        .hp-hdr{
          height:56px;background:rgba(10,10,15,0.98);border-bottom:1px solid var(--border);
          display:flex;align-items:center;justify-content:space-between;
          padding:0 18px;gap:10px;flex-shrink:0;
          backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
        }
        .hp-hdr-l{display:flex;align-items:center;gap:10px}
        .hp-hbtn{
          width:34px;height:34px;background:rgba(255,255,255,0.04);
          border:1px solid var(--border);border-radius:8px;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;color:var(--muted);flex-shrink:0;
          transition:background .15s,color .15s;
        }
        .hp-hbtn:hover{background:rgba(255,255,255,0.08);color:var(--text)}
        .hp-bread{
          font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:400;
          color:rgba(232,228,220,0.4);letter-spacing:.08em;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;
        }
        .hp-hdr-r{display:flex;align-items:center;gap:8px;flex-shrink:0}
        .hp-bell{
          width:34px;height:34px;background:rgba(255,255,255,0.04);
          border:1px solid var(--border);border-radius:8px;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;color:var(--muted);position:relative;
          transition:background .15s,color .15s;
        }
        .hp-bell:hover{background:rgba(255,255,255,0.08);color:var(--text)}
        .hp-dot{
          position:absolute;top:5px;right:5px;min-width:8px;height:8px;
          background:var(--gold);border-radius:50%;border:2px solid rgba(10,10,15,0.98);
          font-size:7px;font-weight:700;color:#0A0A0F;
          display:flex;align-items:center;justify-content:center;
        }
        .hp-pill{
          display:flex;align-items:center;gap:8px;
          background:rgba(255,255,255,0.04);border:1px solid var(--border);
          border-radius:40px;padding:4px 10px 4px 4px;cursor:pointer;
          transition:background .15s,border-color .15s;
        }
        .hp-pill:hover{background:rgba(255,255,255,0.07);border-color:rgba(201,168,76,0.2)}
        .hp-pill-av{
          width:28px;height:28px;border-radius:50%;
          background:linear-gradient(135deg,#C9A84C,#7A5C10);
          display:flex;align-items:center;justify-content:center;
          font-family:'Cormorant Garamond',serif;font-size:14px;font-weight:700;color:#fff;flex-shrink:0;
        }
        .hp-pill-name{font-size:12px;font-weight:600;color:var(--text);white-space:nowrap}

        /* MAIN */
        .hp-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
        .hp-content{
          flex:1;overflow-y:auto;padding:28px;
          scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.08) transparent;
        }

        /* BOTTOM NAV */
        .hp-bnav{
          position:fixed;bottom:0;left:0;right:0;height:64px;
          background:var(--bg);border-top:1px solid var(--border);
          display:flex;align-items:stretch;padding:0 2px;
          z-index:60;padding-bottom:env(safe-area-inset-bottom);
        }
        .hp-bitem{
          flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:3px;background:none;border:none;cursor:pointer;color:var(--muted);
          font-size:9px;font-weight:500;font-family:'DM Sans',sans-serif;
          letter-spacing:.05em;text-transform:uppercase;position:relative;border-radius:8px;
          transition:color .15s;padding:6px 2px;
        }
        .hp-bitem.active{color:var(--gold)}
        .hp-bpill{
          position:absolute;top:7px;width:38px;height:30px;
          background:rgba(201,168,76,0.12);border-radius:20px;
          opacity:0;transition:opacity .15s;
        }
        .hp-bitem.active .hp-bpill{opacity:1}
        .hp-bbadge{
          position:absolute;top:3px;right:calc(50% - 16px);
          min-width:14px;height:14px;background:var(--gold);color:#0A0A0F;
          font-size:7px;font-weight:800;border-radius:20px;padding:0 3px;
          display:flex;align-items:center;justify-content:center;
          border:1.5px solid var(--bg);
        }

        /* NOTIF PANEL */
        .hp-np{
          position:fixed;top:64px;right:12px;
          width:min(320px,calc(100vw - 24px));max-height:440px;
          background:#111118;border:1px solid rgba(255,255,255,0.09);
          border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,0.7);
          z-index:200;display:flex;flex-direction:column;overflow:hidden;
          font-family:'DM Sans',sans-serif;
        }
        .hp-np-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.07)}
        .hp-np-ttl{font-size:13px;font-weight:600;color:var(--text)}
        .hp-np-x{background:none;border:none;cursor:pointer;color:var(--muted);display:flex;transition:color .15s}
        .hp-np-x:hover{color:var(--text)}
        .hp-np-list{flex:1;overflow-y:auto;scrollbar-width:none}
        .hp-np-empty{padding:28px;text-align:center;color:rgba(232,228,220,0.2);font-size:12px}
        .hp-np-item{
          display:block;width:100%;text-align:left;padding:12px 16px;
          border:none;border-bottom:1px solid rgba(255,255,255,0.04);
          background:none;cursor:pointer;transition:background .15s;
        }
        .hp-np-item:hover{background:rgba(255,255,255,0.03)}
        .hp-np-item.unread{border-left:2px solid var(--gold)}
        .hp-np-t{font-size:12px;font-weight:600;color:var(--text);margin-bottom:3px}
        .hp-np-m{font-size:10px;color:var(--muted);line-height:1.5}
        .hp-np-time{font-size:9px;color:rgba(232,228,220,0.2);margin-top:4px;letter-spacing:.05em}
        .hp-np-ft{display:flex;justify-content:space-between;padding:10px 16px;border-top:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.02)}
        .hp-np-act{font-size:10px;font-weight:600;color:var(--gold);background:none;border:none;cursor:pointer;letter-spacing:.08em;text-transform:uppercase;transition:opacity .15s}
        .hp-np-act:hover{opacity:.7}

        /* RESPONSIVE */
        @media(max-width:639px){
          .hp-pill-name{display:none}
          .hp-pill{padding:4px;border-radius:50%}
          .hp-bread{max-width:140px;font-size:13px}
          .hp-content{padding:16px 14px 84px}
        }
        @media(min-width:640px) and (max-width:1023px){
          .hp-content{padding:20px}
        }
      `}</style>

      <div className="hp-shell">

        {/* Desktop + Tablet sidebar */}
        {!isMobile && (
          <aside className={`hp-sb ${iconMode ? 'slim' : 'full'}`}>
            {isDesktop && (
              <button className="sb-collapse" onClick={() => setExpanded(p => !p)}>
                {expanded ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
              </button>
            )}

            <div className="sb-logo">
              <div className="sb-logo-box"><Hotel size={18} color="#0A0A0F" /></div>
              {!iconMode && (
                <div>
                  <div className="sb-logo-name">HotelPro</div>
                  <div className="sb-logo-tag">Management Suite</div>
                </div>
              )}
            </div>

            <div className={`sb-profile${iconMode ? ' icon' : ''}`} onClick={onProfileClick} style={iconMode ? {justifyContent:'center',padding:'8px'} : {}}>
              <div className="sb-avatar">{user?.name?.charAt(0) || 'A'}</div>
              {!iconMode && (
                <>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="sb-pname">{user?.name || 'Admin'}</div>
                    <div className="sb-prole">{user?.role || 'Administrator'}</div>
                  </div>
                  <ChevronRight size={12} style={{color:'rgba(232,228,220,0.3)',flexShrink:0}} />
                </>
              )}
            </div>

            <nav className="sb-nav">
              {navGroups.map((g, gi) => (
                <div key={g.label}>
                  {!iconMode && <div className="sb-glabel">{g.label}</div>}
                  {iconMode && gi > 0 && <div className="sb-div" />}
                  {g.items.map(item => {
                    const active = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        className={`sb-item${active ? ' active' : ''}${iconMode ? ' icon' : ''}`}
                        onClick={() => go(item.id)}
                        onMouseEnter={e => {
                          if (iconMode) {
                            const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setTooltip({ id: item.id, y: r.top + r.height / 2 });
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        <item.icon size={16} style={{flexShrink:0}} />
                        {!iconMode && <span style={{flex:1}}>{item.label}</span>}
                        {!iconMode && (item as any).badge && (
                          <span className="sb-badge">{(item as any).badge}</span>
                        )}
                      </button>
                    );
                  })}
                  {!iconMode && gi < navGroups.length - 1 && <div className="sb-div" style={{marginTop:8}} />}
                </div>
              ))}
            </nav>

            <div className="sb-foot">
              <div className="sb-div" style={{margin:'0 0 8px'}} />
              <button className={`sb-logout${iconMode ? ' icon' : ''}`} onClick={onLogout} style={iconMode ? {justifyContent:'center'} : {}}>
                <LogOut size={15} />
                {!iconMode && <span>Sign Out</span>}
              </button>
            </div>
          </aside>
        )}

        {/* Tooltip */}
        {tooltip && iconMode && (
          <div className="sb-tip" style={{top: tooltip.y - 14}}>
            {allItems.find(i => i.id === tooltip.id)?.label}
          </div>
        )}

        {/* Mobile drawer */}
        {isMobile && (
          <>
            {drawerOpen && <div className="hp-overlay" onClick={() => setDrawerOpen(false)} />}
            <div className={`hp-drawer${drawerOpen ? ' open' : ''}`}>
              <button className="drawer-x" onClick={() => setDrawerOpen(false)}><X size={14} /></button>

              <div className="sb-logo" style={{paddingTop:20}}>
                <div className="sb-logo-box"><Hotel size={18} color="#0A0A0F" /></div>
                <div>
                  <div className="sb-logo-name">HotelPro</div>
                  <div className="sb-logo-tag">Management Suite</div>
                </div>
              </div>

              <div className="sb-profile" onClick={onProfileClick}>
                <div className="sb-avatar">{user?.name?.charAt(0) || 'A'}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="sb-pname">{user?.name || 'Admin'}</div>
                  <div className="sb-prole">{user?.role || 'Administrator'}</div>
                </div>
                <ChevronRight size={12} style={{color:'rgba(232,228,220,0.3)',flexShrink:0}} />
              </div>

              <nav className="sb-nav">
                {navGroups.map((g, gi) => (
                  <div key={g.label}>
                    <div className="sb-glabel">{g.label}</div>
                    {g.items.map(item => (
                      <button
                        key={item.id}
                        className={`sb-item${activeTab === item.id ? ' active' : ''}`}
                        onClick={() => go(item.id)}
                      >
                        <item.icon size={16} style={{flexShrink:0}} />
                        <span style={{flex:1}}>{item.label}</span>
                        {(item as any).badge && <span className="sb-badge">{(item as any).badge}</span>}
                      </button>
                    ))}
                    {gi < navGroups.length - 1 && <div className="sb-div" style={{marginTop:8}} />}
                  </div>
                ))}
              </nav>

              <div className="sb-foot">
                <div className="sb-div" style={{margin:'0 0 8px'}} />
                <button className="sb-logout" onClick={onLogout}>
                  <LogOut size={15} /><span>Sign Out</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Main */}
        <div className="hp-main">
          <header className="hp-hdr">
            <div className="hp-hdr-l">
              <button className="hp-hbtn" onClick={() => isMobile ? setDrawerOpen(p => !p) : setExpanded(p => !p)}>
                <Menu size={17} />
              </button>
              <span className="hp-bread">{label}</span>
            </div>
            <div className="hp-hdr-r">
              <button className="hp-bell" onClick={() => setNotifOpen(p => !p)}>
                <Bell size={16} />
                {unread > 0 && <span className="hp-dot">{unread > 9 ? '9+' : unread}</span>}
              </button>
              <div className="hp-pill" onClick={onProfileClick}>
                <div className="hp-pill-av">{user?.name?.charAt(0) || 'A'}</div>
                <span className="hp-pill-name">{user?.name || 'Admin'}</span>
              </div>
            </div>
          </header>

          <main className="hp-content">{children}</main>

          {/* Mobile bottom nav */}
          {isMobile && (
            <nav className="hp-bnav">
              {mobileNavItems.map(item => {
                const active = activeTab === item.id;
                return (
                  <button key={item.id} className={`hp-bitem${active ? ' active' : ''}`} onClick={() => go(item.id)}>
                    <div className="hp-bpill" />
                    {(item as any).badge && <span className="hp-bbadge">{(item as any).badge}</span>}
                    <item.icon size={20} style={{position:'relative',zIndex:1}} />
                    <span style={{position:'relative',zIndex:1}}>{item.label}</span>
                  </button>
                );
              })}
              <button className="hp-bitem" onClick={() => setDrawerOpen(true)}>
                <Menu size={20} /><span>More</span>
              </button>
            </nav>
          )}
        </div>

        {/* Notifications */}
        {notifOpen && (
          <>
            <div style={{position:'fixed',inset:0,zIndex:180}} onClick={() => setNotifOpen(false)} />
            <div className="hp-np">
              <div className="hp-np-hdr">
                <span className="hp-np-ttl">Notifications</span>
                <button className="hp-np-x" onClick={() => setNotifOpen(false)}><X size={15} /></button>
              </div>
              <div className="hp-np-list">
                {notifications.length === 0
                  ? <div className="hp-np-empty">No new notifications</div>
                  : notifications.map(n => (
                    <button key={n.id} className={`hp-np-item${!n.read ? ' unread' : ''}`}
                      onClick={() => { onNotificationClick(n); setNotifOpen(false); }}>
                      <div className="hp-np-t">{n.title}</div>
                      <div className="hp-np-m">{n.message}</div>
                      <div className="hp-np-time">{n.time}</div>
                    </button>
                  ))}
              </div>
              <div className="hp-np-ft">
                <button className="hp-np-act" onClick={onMarkAllAsRead}>Mark all read</button>
                <button className="hp-np-act" onClick={onClearNotifications}>Clear all</button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Layout;