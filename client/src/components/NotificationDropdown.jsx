import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationDropdown() {
  const { notifications, unreadCount, markRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full p-2 hover:bg-slate-100 focus-ring"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl2 border border-slate-100 shadow-lg z-40 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-slate-100 font-display font-semibold text-sm">Notifications</div>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-400 p-4 text-center">You're all caught up.</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id || n._id}
                onClick={() => markRead(n.id || n._id)}
                className={`w-full text-left p-3 border-b border-slate-50 hover:bg-slate-50 ${
                  !n.isRead ? 'bg-indigo-50/40' : ''
                }`}
              >
                <p className="text-sm font-medium text-ink">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
