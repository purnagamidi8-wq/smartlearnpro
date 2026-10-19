import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PlusCircle, Trash2 } from 'lucide-react';
import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useToast } from '../../components/Toast';
import api from '../../services/api';

export default function CourseManage() {
  const { id } = useParams();
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [lessonForms, setLessonForms] = useState({}); // moduleId -> {title, description}

  const load = () => api.get(`/courses/${id}`).then((res) => setCourse(res.data.data.course));
  useEffect(() => { load(); }, [id]);

  const addModule = async () => {
    if (!newModuleTitle.trim()) return;
    try {
      await api.post(`/courses/${id}/modules`, { title: newModuleTitle });
      setNewModuleTitle('');
      load();
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  const addLesson = async (moduleId) => {
    const form = lessonForms[moduleId] || {};
    if (!form.title?.trim()) return;
    try {
      await api.post(`/courses/modules/${moduleId}/lessons`, {
        title: form.title,
        description: form.description || '',
        tutorialContent: [
          { type: 'heading', data: { text: form.title }, order: 0 },
          { type: 'paragraph', data: { text: form.description || 'Add tutorial content for this lesson.' }, order: 1 },
        ],
      });
      setLessonForms({ ...lessonForms, [moduleId]: { title: '', description: '' } });
      load();
      toast.push('Lesson added');
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  if (!course) return <AppShell><p className="text-slate-400">Loading...</p></AppShell>;

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-ink">{course.title}</h1>
      <p className="text-slate-500 mt-1">Manage modules, lessons, and structure.</p>

      <div className="space-y-4 mt-6">
        {course.moduleOrder.map((mod, idx) => (
          <Card key={mod._id} className="p-5">
            <p className="font-display font-semibold text-ink">Module {idx + 1}: {mod.title}</p>
            <div className="mt-3 space-y-1">
              {(mod.lessonOrder || []).map((l) => (
                <div key={l._id} className="text-sm text-slate-600 py-1.5 border-t border-slate-50 first:border-t-0">{l.title}</div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <input
                placeholder="New lesson title"
                value={lessonForms[mod._id]?.title || ''}
                onChange={(e) => setLessonForms({ ...lessonForms, [mod._id]: { ...lessonForms[mod._id], title: e.target.value } })}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus-ring"
              />
              <Button variant="secondary" onClick={() => addLesson(mod._id)}><PlusCircle size={16} /> Add lesson</Button>
            </div>
          </Card>
        ))}

        <Card className="p-5">
          <p className="font-display font-semibold text-ink mb-3">Add a new module</p>
          <div className="flex gap-2">
            <input
              placeholder="Module title (e.g. Advanced Topics)"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus-ring"
            />
            <Button onClick={addModule}><PlusCircle size={16} /> Add module</Button>
          </div>
        </Card>
      </div>

      <p className="text-xs text-slate-400 mt-6">
        Quiz creation, video uploads, and cloud storage wiring are available via the API
        (<code>POST /api/quizzes</code>, lesson <code>video</code> fields) — a dedicated UI for those can be added
        as a next iteration; see the README's "Known extension points" section.
      </p>
    </AppShell>
  );
}
