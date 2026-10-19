import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import api from '../../services/api';

const riskTone = { NORMAL: 'success', WARNING: 'warning', HIGH_RISK: 'danger', CRITICAL: 'danger' };

export default function ProctoringDetail() {
  const { sessionId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/proctor/session/${sessionId}`).then((res) => setData(res.data.data));
  }, [sessionId]);

  if (!data) return <AppShell><p className="text-slate-400">Loading...</p></AppShell>;
  const { session, events } = data;

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{session.student.name}</h1>
          <p className="text-slate-500 mt-1">{session.course.title} — {session.quiz.title}</p>
        </div>
        <Badge tone={riskTone[session.riskLevel]}>{session.riskLevel} — score {session.riskScore}</Badge>
      </div>

      <p className="text-xs text-slate-400 mt-3 max-w-xl">
        Risk score reflects browser-observed integrity signals only. It is entirely separate from the student's
        academic quiz score and does not by itself prove misconduct — review events below before making a decision.
      </p>

      <Card className="p-6 mt-6">
        <h2 className="font-display font-semibold text-ink mb-4">Event timeline</h2>
        {events.length === 0 ? (
          <p className="text-sm text-slate-400">No events recorded for this session.</p>
        ) : (
          <div className="space-y-2">
            {events.map((e) => (
              <div key={e._id} className="flex items-center justify-between text-sm border-b border-slate-50 pb-2">
                <span className="text-ink">{e.label}</span>
                <span className="text-slate-400 text-xs">{new Date(e.timestamp).toLocaleTimeString()} · weight +{e.severityWeight}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </AppShell>
  );
}
