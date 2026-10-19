import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import StatCard from '../../components/StatCard';
import { TrendingUp, Award, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/analytics/admin-dashboard').then((res) => setStats(res.data.data));
  }, []);

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-ink">Analytics</h1>
      <p className="text-slate-500 mt-1">Deeper performance and engagement metrics.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <StatCard label="Course completion rate" value={stats ? `${stats.courseCompletionRate}%` : '—'} icon={TrendingUp} />
        <StatCard label="Average quiz score" value={stats ? `${stats.averageQuizScorePercent}%` : '—'} icon={Award} />
        <StatCard label="High-risk proctoring sessions" value={stats?.highRiskSessions ?? '—'} icon={ShieldAlert} />
      </div>

      <Card className="p-6 mt-6">
        <h2 className="font-display font-semibold text-ink mb-4">Enrollment trend</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stats?.enrollmentTrend || []}>
            <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#06B6D4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <p className="text-xs text-slate-400 mt-4">
        Additional breakdowns (per-course performance, cohort comparisons) can be added by extending
        <code> analyticsController.js</code> with further aggregation queries.
      </p>
    </AppShell>
  );
}
