import { useEffect, useState } from 'react';
import AppShell from '../../components/AppShell';
import CourseCard from '../../components/CourseCard';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
import api from '../../services/api';

export default function CourseCatalog() {
  const [courses, setCourses] = useState(null);

  useEffect(() => {
    api.get('/courses').then((res) => setCourses(res.data.data.courses));
  }, []);

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-ink">Course catalog</h1>
      <p className="text-slate-500 mt-1">Find your next skill to learn.</p>

      {courses === null ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState title="No courses published yet" message="Check back soon — administrators are preparing new content." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {courses.map((c) => <CourseCard key={c._id} course={c} />)}
        </div>
      )}
    </AppShell>
  );
}
