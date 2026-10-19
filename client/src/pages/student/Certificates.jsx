import { useEffect, useState } from 'react';
import { Award, Download } from 'lucide-react';
import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';

export default function Certificates() {
  const [certificates, setCertificates] = useState(null);

  useEffect(() => {
    api.get('/certificates').then((res) => setCertificates(res.data.data.certificates));
  }, []);

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-ink">Certificates</h1>
      <p className="text-slate-500 mt-1">Download and share proof of your completed courses.</p>

      {certificates === null ? (
        <p className="text-slate-400 mt-6">Loading...</p>
      ) : certificates.length === 0 ? (
        <Card className="mt-6"><EmptyState title="No certificates yet" message="Complete a course's requirements to become eligible for a certificate." /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {certificates.map((c) => (
            <Card key={c._id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-indigo-50 text-indigo p-2.5"><Award size={20} /></div>
                <Badge tone={c.status === 'issued' ? 'success' : 'warning'}>{c.status.replace('_', ' ')}</Badge>
              </div>
              <p className="font-display font-semibold text-ink mt-3">{c.course.title}</p>
              <p className="text-xs text-slate-400 mt-1">Certificate ID: {c.certificateId}</p>
              <p className="text-sm text-slate-500 mt-1">Final score: {c.finalScorePercent}%</p>
              {c.status === 'issued' && c.pdfUrl && (
                <a href={c.pdfUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm text-indigo font-medium hover:underline">
                  <Download size={14} /> Download PDF
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
