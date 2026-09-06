import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, CheckCircle2, Clock, MessageCircle, X } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      if (data && data.length > 0) {
        setNotifications(data.map(n => ({
          id: n.id,
          type: n.type || 'info',
          title: n.title,
          message: n.message,
          time: n.createdAt ? n.createdAt.substring(11, 16) : 'Recent',
          read: Boolean(n.isRead),
          link: n.type === 'verified' || n.type === 'doctor' ? '/doctor-connect' : (n.type === 'safety' || n.type === 'recall' ? '/safety-center' : '/dashboard')
        })));
      } else {
        setNotifications([]);
      }
    } catch (e) {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await notificationService.markAllRead();
    } catch (e) {}
  };

  const handleItemClick = async (n) => {
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
    setOpen(false);
    try {
      await notificationService.markRead(n.id);
    } catch (e) {}
    if (n.link) navigate(n.link);
  };

  const displayList = notifications;

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-sea-green" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Health Notifications ({unreadCount} unread)
                </h3>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead} 
                  className="text-[11px] text-sea-green font-bold hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
              {displayList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Bell className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">No notifications yet.</p>
                  <p className="text-[10px] text-slate-400">Health alerts and updates will appear here.</p>
                </div>
              ) : (
              displayList.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3 ${
                    !n.read ? 'bg-teal-50/30' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${
                    n.type === 'recall' || n.type === 'safety' ? 'bg-red-500' : (n.type === 'doctor' || n.type === 'verified' ? 'bg-sea-green' : 'bg-med-navy')
                  }`}>
                    {n.type === 'recall' || n.type === 'safety' ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : (n.type === 'doctor' || n.type === 'verified') ? (
                      <MessageCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold truncate ${!n.read ? 'text-slate-900' : 'text-slate-600'}`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-semibold">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button 
                onClick={() => { setOpen(false); navigate('/safety-center'); }} 
                className="text-xs text-sea-green font-bold hover:underline"
              >
                View Medicine Safety Center →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
