import { useEffect, useState } from 'react';
import { Users, BookOpen, ClipboardList, Award, ShieldAlert, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import AppShell from '../../components/AppShell';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/analytics/admin-dashboard').then((res) => setStats(res.data.data));
  }, []);

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-ink">Admin overview</h1>
      <p className="text-slate-500 mt-1">Platform-wide activity at a glance.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard label="Total students" value={stats?.totalStudents ?? '—'} sub={`${stats?.activeStudents ?? 0} active`} icon={Users} />
        <StatCard label="Total courses" value={stats?.totalCourses ?? '—'} icon={BookOpen} />
        <StatCard label="Pending enrollments" value={stats?.pendingEnrollments ?? '—'} icon={ClipboardList} />
        <StatCard label="Certificates issued" value={stats?.certificatesIssued ?? '—'} icon={Award} />
        <StatCard label="Course completion rate" value={stats ? `${stats.courseCompletionRate}%` : '—'} icon={TrendingUp} />
        <StatCard label="Average quiz score" value={stats ? `${stats.averageQuizScorePercent}%` : '—'} icon={TrendingUp} />
        <StatCard label="Active proctored sessions" value={stats?.activeProctorSessions ?? '—'} icon={ShieldAlert} />
        <StatCard label="High-risk sessions" value={stats?.highRiskSessions ?? '—'} icon={ShieldAlert} />
      </div>

      <Card className="p-6 mt-6">
        <h2 className="font-display font-semibold text-ink mb-4">Enrollment trend (last 6 months)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stats?.enrollmentTrend || []}>
            <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#4338CA" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </AppShell>
  );
}
