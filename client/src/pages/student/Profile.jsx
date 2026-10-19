import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-ink">Profile</h1>
      <Card className="p-6 mt-6 max-w-lg">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-indigo text-white flex items-center justify-center font-display text-xl font-semibold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-display font-semibold text-ink">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-slate-100 text-sm text-slate-500">
          Role: <span className="font-medium text-ink capitalize">{user?.role}</span>
        </div>
      </Card>
    </AppShell>
  );
}
