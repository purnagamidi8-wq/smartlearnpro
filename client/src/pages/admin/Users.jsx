import { useEffect, useState } from 'react';
import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { useToast } from '../../components/Toast';
import api from '../../services/api';

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState(null);

  const load = () => api.get('/users?role=student').then((res) => setUsers(res.data.data.users));
  useEffect(() => { load(); }, []);

  const toggleActive = async (user) => {
    try {
      await api.put(`/users/${user._id}/status`, { isActive: !user.isActive });
      toast.push(`${user.name} ${user.isActive ? 'deactivated' : 'activated'}`);
      load();
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-ink">Students</h1>
      <p className="text-slate-500 mt-1">Manage student accounts.</p>

      <Card className="mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Verified</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u._id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-medium text-ink">{u.name}</td>
                <td className="px-5 py-3 text-slate-500">{u.email}</td>
                <td className="px-5 py-3"><Badge tone={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Active' : 'Deactivated'}</Badge></td>
                <td className="px-5 py-3"><Badge tone={u.isEmailVerified ? 'info' : 'neutral'}>{u.isEmailVerified ? 'Verified' : 'Unverified'}</Badge></td>
                <td className="px-5 py-3 text-right">
                  <Button variant="secondary" onClick={() => toggleActive(u)}>{u.isActive ? 'Deactivate' : 'Activate'}</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
