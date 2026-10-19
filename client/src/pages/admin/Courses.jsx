import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { useToast } from '../../components/Toast';
import api from '../../services/api';

export default function AdminCourses() {
  const toast = useToast();
  const [courses, setCourses] = useState(null);

  const load = () => api.get('/courses').then((res) => setCourses(res.data.data.courses));
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this course and all its content? This cannot be undone.')) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.push('Course deleted');
      load();
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  const togglePublish = async (course) => {
    try {
      await api.put(`/courses/${course._id}`, { status: course.status === 'published' ? 'draft' : 'published' });
      toast.push('Course status updated');
      load();
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Courses</h1>
          <p className="text-slate-500 mt-1">Create and manage course content.</p>
        </div>
        <Link to="/admin/courses/create"><Button>New course</Button></Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {courses?.map((c) => (
          <Card key={c._id} className="p-5">
            <div className="flex items-center justify-between">
              <Badge tone={c.status === 'published' ? 'success' : c.status === 'draft' ? 'neutral' : 'warning'}>{c.status}</Badge>
            </div>
            <p className="font-display font-semibold text-ink mt-3">{c.title}</p>
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{c.description}</p>
            <div className="flex gap-2 mt-4">
              <Link to={`/admin/courses/${c._id}`}><Button variant="secondary">Manage</Button></Link>
              <Button variant="secondary" onClick={() => togglePublish(c)}>{c.status === 'published' ? 'Unpublish' : 'Publish'}</Button>
              <Button variant="danger" onClick={() => handleDelete(c._id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
