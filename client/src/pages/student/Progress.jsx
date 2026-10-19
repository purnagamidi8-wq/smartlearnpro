import { useEffect, useState } from 'react';
import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';

export default function StudentProgress() {
  const [enrollments, setEnrollments] = useState(null);
  const [progressMap, setProgressMap] = useState({});

  useEffect(() => {
    api.get('/enrollments').then(async (res) => {
      const approved = res.data.data.enrollments.filter((e) => e.status === 'approved');
      setEnrollments(approved);
      const entries = await Promise.all(
        approved.map((e) =>
          api.get(`/progress/${e.course._id}`).then((r) => [e.course._id, r.data.data.progress]).catch(() => [e.course._id, null])
        )
      );
      setProgressMap(Object.fromEntries(entries));
    });
  }, []);

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-ink">Your progress</h1>
      <p className="text-slate-500 mt-1">Track completion across every enrolled course.</p>

      {enrollments === null ? (
        <p className="text-slate-400 mt-6">Loading...</p>
      ) : enrollments.length === 0 ? (
        <Card className="mt-6"><EmptyState title="No active courses" message="Enroll in a course to start tracking your progress." /></Card>
      ) : (
        <div className="space-y-4 mt-6">
          {enrollments.map((e) => {
            const p = progressMap[e.course._id];
            return (
              <Card key={e._id} className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-display font-semibold text-ink">{e.course.title}</p>
                  <span className="text-sm text-slate-500">{p?.overallCompletionPercent ?? 0}%</span>
                </div>
                <ProgressBar percent={p?.overallCompletionPercent ?? 0} />
                <div className="flex gap-6 mt-3 text-xs text-slate-500">
                  <span>Avg quiz score: {p?.averageQuizScorePercent ?? 0}%</span>
                  <span>Final assessment: {p?.finalAssessmentPassed ? 'Passed' : 'Not yet passed'}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
