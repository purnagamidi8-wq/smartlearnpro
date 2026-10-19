import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, TrendingUp, Award } from 'lucide-react';
import AppShell from '../../components/AppShell';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';
import CourseCard from '../../components/CourseCard';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/users/dashboard-stats').then((res) => setStats(res.data.data));
  }, []);

  const approvedEnrollments = stats?.enrollments?.filter((e) => e.status === 'approved') || [];

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-ink">Welcome back, {user?.name?.split(' ')[0]}</h1>
      <p className="text-slate-500 mt-1">Here's where you left off.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard label="Enrolled courses" value={stats?.totalEnrolled ?? '—'} icon={BookOpen} />
        <StatCard label="Completed courses" value={stats?.completedCourses ?? '—'} icon={CheckCircle2} />
        <StatCard label="Average quiz score" value={stats ? `${stats.averageQuizScorePercent}%` : '—'} icon={TrendingUp} />
        <StatCard label="Certificates" value={stats?.certificatesCount ?? '—'} icon={Award} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">Continue learning</h2>
        <Link to="/courses" className="text-sm text-indigo font-medium hover:underline">Browse all courses</Link>
      </div>

      {approvedEnrollments.length === 0 ? (
        <Card className="mt-4">
          <EmptyState
            title="No active courses yet"
            message="Browse the catalog and request enrollment in a course to get started."
            action={<Link to="/courses"><Button>Browse courses</Button></Link>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {approvedEnrollments.map((e) => (
            <CourseCard key={e._id} course={e.course} enrollmentStatus={e.status} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
