import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Lock, CheckCircle2, PlayCircle, Clock, BarChart3 } from 'lucide-react';
import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { useToast } from '../../components/Toast';
import api from '../../services/api';

export default function CourseDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [requesting, setRequesting] = useState(false);

  const load = () => api.get(`/courses/${id}`).then((res) => setData(res.data.data));

  useEffect(() => { load(); }, [id]);

  const handleRequestEnrollment = async () => {
    setRequesting(true);
    try {
      const res = await api.post('/enrollments', { courseId: id });
      toast.push(res.data.message);
      load();
    } catch (err) {
      toast.push(err.message, 'error');
    } finally {
      setRequesting(false);
    }
  };

  if (!data) return <AppShell><p className="text-slate-400">Loading...</p></AppShell>;

  const { course, enrollment } = data;
  const isApproved = enrollment?.status === 'approved';

  return (
    <AppShell>
      <div className="bg-gradient-to-br from-indigo-700 to-cyan rounded-xl2 p-8 text-white">
        <Badge tone="neutral">{course.category}</Badge>
        <h1 className="font-display text-3xl font-semibold mt-3">{course.title}</h1>
        <p className="mt-2 text-indigo-100 max-w-2xl">{course.description}</p>
        <div className="flex items-center gap-6 mt-4 text-sm text-indigo-100">
          <span className="flex items-center gap-1"><Clock size={16} /> {course.durationHours}h</span>
          <span className="flex items-center gap-1"><BarChart3 size={16} /> {course.difficulty}</span>
        </div>
        {!enrollment && (
          <Button className="mt-5 bg-white text-indigo hover:bg-slate-100" onClick={handleRequestEnrollment} disabled={requesting}>
            {requesting ? 'Requesting...' : 'Request Enrollment'}
          </Button>
        )}
        {enrollment?.status === 'pending' && <Badge tone="warning" className="mt-5">Enrollment pending approval</Badge>}
        {enrollment?.status === 'rejected' && <Badge tone="danger" className="mt-5">Enrollment request was declined</Badge>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-2 p-6">
          <h2 className="font-display font-semibold text-ink mb-4">Course content</h2>
          <div className="space-y-3">
            {course.moduleOrder.map((mod, idx) => (
              <div key={mod._id} className="border border-slate-100 rounded-xl p-4">
                <p className="font-medium text-ink text-sm">Module {idx + 1}: {mod.title}</p>
                <div className="mt-2 space-y-1">
                  {(mod.lessonOrder || []).map((lesson) => (
                    <div key={lesson._id} className="flex items-center justify-between text-sm py-1.5">
                      <span className="flex items-center gap-2 text-slate-600">
                        {isApproved ? <PlayCircle size={16} className="text-indigo" /> : <Lock size={16} className="text-slate-300" />}
                        {lesson.title}
                      </span>
                      {isApproved && (
                        <Link to={`/learn/${course._id}/${lesson._id}`} className="text-xs text-indigo font-medium hover:underline">
                          Open
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold text-ink mb-3">Learning objectives</h2>
          <ul className="space-y-2">
            {course.learningObjectives?.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" /> {obj}
              </li>
            ))}
          </ul>
          {course.prerequisites?.length > 0 && (
            <>
              <h2 className="font-display font-semibold text-ink mb-2 mt-5">Prerequisites</h2>
              <ul className="text-sm text-slate-500 list-disc pl-4 space-y-1">
                {course.prerequisites.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
