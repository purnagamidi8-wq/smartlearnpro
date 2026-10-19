import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import { useNotifications } from '../../context/NotificationContext';

export default function NotificationsPage() {
  const { notifications, markRead } = useNotifications();

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-ink">Notifications</h1>
      {notifications.length === 0 ? (
        <Card className="mt-6"><EmptyState title="Nothing here yet" message="Updates about enrollment, quizzes, and certificates will appear here." /></Card>
      ) : (
        <div className="space-y-2 mt-6">
          {notifications.map((n) => (
            <Card key={n.id || n._id} className={`p-4 cursor-pointer ${!n.isRead ? 'border-indigo-100 bg-indigo-50/40' : ''}`} onClick={() => markRead(n.id || n._id)}>
              <p className="text-sm font-medium text-ink">{n.title}</p>
              <p className="text-sm text-slate-500 mt-1">{n.message}</p>
              <p className="text-xs text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
