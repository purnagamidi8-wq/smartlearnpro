import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { getSocket } from '../../services/socket';
import api from '../../services/api';

const riskTone = { NORMAL: 'success', WARNING: 'warning', HIGH_RISK: 'danger', CRITICAL: 'danger' };

export default function AdminProctoring() {
  const [sessions, setSessions] = useState(null);

  useEffect(() => {
    api.get('/proctor/sessions').then((res) => setSessions(res.data.data.sessions));

    const socket = getSocket();
    if (!socket) return;
    const handler = (updated) => {
      setSessions((prev) => {
        if (!prev) return prev;
        const idx = prev.findIndex((s) => s._id === updated._id);
        if (idx === -1) return [updated, ...prev];
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      });
    };
    socket.on('proctoring:session_update', handler);
    return () => socket.off('proctoring:session_update', handler);
  }, []);

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-ink">Proctoring monitor</h1>
      <p className="text-slate-500 mt-1">Live view of active and recent proctored sessions.</p>

      {sessions === null ? (
        <p className="text-slate-400 mt-6">Loading...</p>
      ) : sessions.length === 0 ? (
        <Card className="mt-6"><EmptyState title="No sessions yet" message="Proctored assessment sessions will appear here in real time." /></Card>
      ) : (
        <div className="space-y-3 mt-6">
          {sessions.map((s) => (
            <Link key={s._id} to={`/admin/proctoring/${s._id}`}>
              <Card className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="font-medium text-ink text-sm">{s.student?.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.course?.title} — {s.quiz?.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{s.eventCount} events</span>
                  <Badge tone={s.status === 'in_progress' ? 'info' : 'neutral'}>{s.status.replace('_', ' ')}</Badge>
                  <Badge tone={riskTone[s.riskLevel]}>{s.riskLevel} ({s.riskScore})</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
