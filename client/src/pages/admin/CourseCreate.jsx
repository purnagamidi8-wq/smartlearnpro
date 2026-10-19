import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useToast } from '../../components/Toast';
import api from '../../services/api';

export default function CourseCreate() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    title: '', description: '', category: 'General', difficulty: 'beginner',
    instructor: '', durationHours: 10, requiresApproval: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/courses', form);
      toast.push('Course created');
      navigate(`/admin/courses/${res.data.data.course._id}`);
    } catch (err) {
      toast.push(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-ink">Create course</h1>
      <Card className="p-6 mt-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink">Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Description</label>
            <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink">Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Difficulty</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink">Instructor</label>
              <input value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Duration (hours)</label>
              <input type="number" min={0} value={form.durationHours} onChange={(e) => setForm({ ...form, durationHours: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={form.requiresApproval} onChange={(e) => setForm({ ...form, requiresApproval: e.target.checked })} />
            Require admin approval for enrollment
          </label>
          <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create course'}</Button>
        </form>
      </Card>
    </AppShell>
  );
}
