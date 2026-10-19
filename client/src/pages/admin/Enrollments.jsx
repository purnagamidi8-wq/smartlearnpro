import { useEffect, useState } from 'react';
import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import api from '../../services/api';

export default function AdminEnrollments() {
  const toast = useToast();
  const [enrollments, setEnrollments] = useState(null);
  const [filter, setFilter] = useState('pending');

  const load = () => api.get(`/enrollments${filter ? `?status=${filter}` : ''}`).then((res) => setEnrollments(res.data.data.enrollments));
  useEffect(() => { load(); }, [filter]);

  const approve = async (id) => {
    try {
      await api.put(`/enrollments/${id}/approve`);
      toast.push('Enrollment approved');
      load();
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  const reject = async (id) => {
    const reason = prompt('Reason for rejection (optional):') || '';
    try {
      await api.put(`/enrollments/${id}/reject`, { reason });
      toast.push('Enrollment rejected');
      load();
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-ink">Enrollment requests</h1>
      <div className="flex gap-2 mt-4">
        {['pending', 'approved', 'rejected', ''].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${filter === s ? 'bg-indigo text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {enrollments === null ? (
        <p className="text-slate-400 mt-6">Loading...</p>
      ) : enrollments.length === 0 ? (
        <Card className="mt-6"><EmptyState title="No requests" message="Nothing to review in this filter." /></Card>
      ) : (
        <div className="space-y-3 mt-6">
          {enrollments.map((e) => (
            <Card key={e._id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-ink text-sm">{e.student.name} <span className="text-slate-400 font-normal">→ {e.course.title}</span></p>
                <p className="text-xs text-slate-400 mt-0.5">{e.student.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={e.status === 'approved' ? 'success' : e.status === 'rejected' ? 'danger' : 'warning'}>{e.status}</Badge>
                {e.status === 'pending' && (
                  <>
                    <Button variant="secondary" onClick={() => reject(e._id)}>Reject</Button>
                    <Button onClick={() => approve(e._id)}>Approve</Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
