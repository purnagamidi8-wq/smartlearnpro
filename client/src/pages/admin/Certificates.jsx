import { useEffect, useState } from 'react';
import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import api from '../../services/api';

export default function AdminCertificates() {
  const toast = useToast();
  const [certificates, setCertificates] = useState(null);

  const load = () => api.get('/certificates').then((res) => setCertificates(res.data.data.certificates));
  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try {
      await api.put(`/certificates/${id}/approve`);
      toast.push('Certificate approved and issued');
      load();
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-ink">Certificates</h1>
      <p className="text-slate-500 mt-1">Review and approve certificate issuance.</p>

      {certificates === null ? (
        <p className="text-slate-400 mt-6">Loading...</p>
      ) : certificates.length === 0 ? (
        <Card className="mt-6"><EmptyState title="No certificates yet" message="Certificates become eligible once students meet course completion requirements." /></Card>
      ) : (
        <div className="space-y-3 mt-6">
          {certificates.map((c) => (
            <Card key={c._id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-ink text-sm">{c.student.name} <span className="text-slate-400 font-normal">→ {c.course.title}</span></p>
                <p className="text-xs text-slate-400 mt-0.5">{c.certificateId} · Score {c.finalScorePercent}%</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={c.status === 'issued' ? 'success' : 'warning'}>{c.status.replace('_', ' ')}</Badge>
                {c.status === 'pending_review' && <Button onClick={() => approve(c._id)}>Approve & issue</Button>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
