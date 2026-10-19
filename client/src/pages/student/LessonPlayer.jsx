import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, PlayCircle, ClipboardList } from 'lucide-react';
import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import TutorialContent from '../../components/TutorialContent';
import { useToast } from '../../components/Toast';
import api from '../../services/api';

export default function LessonPlayer() {
  const { courseId, lessonId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const videoRef = useRef(null);
  const lastReported = useRef(0);

  useEffect(() => {
    api.get(`/courses/${courseId}`).then((res) => setCourse(res.data.data.course));
    api.get(`/courses/lessons/${lessonId}`).then((res) => setLesson(res.data.data.lesson));
    api.get(`/progress/${courseId}`).then((res) => setProgress(res.data.data.progress)).catch(() => setProgress(null));
  }, [courseId, lessonId]);

  const reportVideoProgress = async (percent) => {
    if (percent - lastReported.current < 5) return; // avoid spamming the API
    lastReported.current = percent;
    try {
      const res = await api.post('/progress/video', {
        courseId,
        lessonId,
        videoProgressPercent: percent,
        threshold: lesson?.video?.completionThresholdPercent || 90,
      });
      setProgress(res.data.data.progress);
    } catch {
      // non-fatal; progress will sync on next update
    }
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    reportVideoProgress(Math.round((v.currentTime / v.duration) * 100));
  };

  const markTutorialComplete = async () => {
    try {
      const res = await api.post('/progress/lesson', { courseId, lessonId });
      setProgress(res.data.data.progress);
      toast.push('Lesson marked complete');
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  if (!course || !lesson) return <AppShell><p className="text-slate-400">Loading...</p></AppShell>;

  const lessonProgress = progress?.lessons?.find((l) => String(l.lesson) === String(lessonId));
  const allLessons = course.moduleOrder.flatMap((m) => m.lessonOrder || []);
  const currentIndex = allLessons.findIndex((l) => String(l._id) === String(lessonId));
  const prevLesson = allLessons[currentIndex - 1];
  const nextLesson = allLessons[currentIndex + 1];

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT: module/lesson tree (Section 11) */}
        <Card className="lg:col-span-1 p-4 h-fit lg:sticky lg:top-6">
          <p className="font-display font-semibold text-ink text-sm mb-3">{course.title}</p>
          {course.moduleOrder.map((mod, mi) => (
            <div key={mod._id} className="mb-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Module {mi + 1}: {mod.title}</p>
              <div className="mt-1 space-y-1">
                {(mod.lessonOrder || []).map((l) => {
                  const lp = progress?.lessons?.find((p) => String(p.lesson) === String(l._id));
                  const isCurrent = String(l._id) === String(lessonId);
                  return (
                    <Link
                      key={l._id}
                      to={`/learn/${courseId}/${l._id}`}
                      className={`flex items-center gap-2 text-sm rounded-lg px-2 py-1.5 ${
                        isCurrent ? 'bg-indigo-50 text-indigo font-medium' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {lp?.completed ? <CheckCircle2 size={14} className="text-success shrink-0" /> : <PlayCircle size={14} className="text-slate-300 shrink-0" />}
                      <span className="truncate">{l.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </Card>

        {/* CENTER: video + tutorial content */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-0 overflow-hidden">
            {lesson.video?.url ? (
              <video
                ref={videoRef}
                src={lesson.video.url}
                controls
                onTimeUpdate={handleTimeUpdate}
                className="w-full aspect-video bg-black"
              />
            ) : (
              <div className="w-full aspect-video bg-slate-900 flex items-center justify-center text-slate-400 text-sm">
                No video attached to this lesson yet — read the tutorial below.
              </div>
            )}
          </Card>
          <Card className="p-6">
            <h1 className="font-display text-xl font-semibold text-ink">{lesson.title}</h1>
            <p className="text-sm text-slate-500 mt-1">{lesson.description}</p>
            <div className="mt-5">
              <TutorialContent blocks={lesson.tutorialContent} />
            </div>
            {lesson.resources?.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-sm font-medium text-ink mb-2">Resources</p>
                {lesson.resources.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noreferrer" className="block text-sm text-indigo hover:underline">
                    {r.title}
                  </a>
                ))}
              </div>
            )}
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="secondary" disabled={!prevLesson} onClick={() => prevLesson && navigate(`/learn/${courseId}/${prevLesson._id}`)}>
              Previous lesson
            </Button>
            <div className="flex gap-2">
              {!lessonProgress?.completed && (
                <Button variant="secondary" onClick={markTutorialComplete}>Mark lesson complete</Button>
              )}
              {lesson.quiz && (
                <Link to={`/quiz/${lesson.quiz._id || lesson.quiz}`}>
                  <Button variant="secondary" className="!text-cyan"><ClipboardList size={16} /> Take quiz</Button>
                </Link>
              )}
              <Button disabled={!nextLesson} onClick={() => nextLesson && navigate(`/learn/${courseId}/${nextLesson._id}`)}>
                Next lesson
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT: progress panel */}
        <Card className="lg:col-span-1 p-5 h-fit">
          <p className="font-display font-semibold text-ink text-sm mb-2">Your progress</p>
          <ProgressBar percent={progress?.overallCompletionPercent || 0} />
          <p className="text-xs text-slate-500 mt-2">{progress?.overallCompletionPercent || 0}% of course complete</p>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">This lesson</p>
            <ProgressBar percent={lessonProgress?.videoProgressPercent || 0} tone="cyan" />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
