import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldAlert, Camera, Mic, Maximize } from 'lucide-react';
import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { useToast } from '../../components/Toast';
import useProctoring from '../../hooks/useProctoring';
import api from '../../services/api';

export default function ProctoredExam() {
  const { id: quizId } = useParams();
  const [params] = useSearchParams();
  const courseId = params.get('courseId');
  const navigate = useNavigate();
  const toast = useToast();
  const containerRef = useRef(null);

  const [stage, setStage] = useState('instructions'); // instructions -> exam -> submitted
  const [quiz, setQuiz] = useState(null);
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);
  const [riskInfo, setRiskInfo] = useState({ riskScore: 0, riskLevel: 'NORMAL' });
  const [permError, setPermError] = useState('');

  const handleEvent = useCallback(async (eventType, metadata) => {
    if (!session) return;
    try {
      const res = await api.post('/proctor/event', { sessionId: session._id, eventType, metadata });
      setRiskInfo({ riskScore: res.data.data.riskScore, riskLevel: res.data.data.riskLevel });
    } catch {
      // best-effort logging; don't block the exam if a single event post fails
    }
  }, [session]);

  const proctoring = useProctoring({ onEvent: handleEvent });

  useEffect(() => {
    api.get(`/quizzes/${quizId}`).then((res) => setQuiz(res.data.data.quiz));
  }, [quizId]);

  const handleBegin = async () => {
    setPermError('');
    try {
      await proctoring.requestPermissions();
      await proctoring.enterFullscreen(containerRef.current);
      const res = await api.post('/proctor/start', {
        courseId,
        quizId,
        cameraGranted: true,
        micGranted: true,
      });
      setSession(res.data.data.session);
      setStage('exam');
    } catch (err) {
      setPermError('Camera and microphone access are required to begin this proctored assessment. Please allow permissions and try again.');
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = Object.entries(answers).map(([questionId, selectedIndex]) => ({ questionId, selectedIndex }));
      const res = await api.post(`/quizzes/${quizId}/submit`, { answers: payload, proctorSessionId: session._id });
      await api.post('/proctor/end', { sessionId: session._id });
      proctoring.stopAll();
      setResult(res.data.data);
      setStage('submitted');
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  if (stage === 'instructions') {
    return (
      <AppShell>
        <Card className="max-w-xl mx-auto p-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="text-indigo" size={28} />
            <h1 className="font-display text-xl font-semibold text-ink">Proctored assessment</h1>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-2"><Camera size={16} className="mt-0.5 text-indigo shrink-0" /> Camera access is required for the duration of the exam.</li>
            <li className="flex gap-2"><Mic size={16} className="mt-0.5 text-indigo shrink-0" /> Microphone access is required for the duration of the exam.</li>
            <li className="flex gap-2"><Maximize size={16} className="mt-0.5 text-indigo shrink-0" /> Fullscreen mode is required; exiting it will be recorded.</li>
          </ul>
          <div className="bg-slate-50 rounded-xl p-4 mt-5 text-xs text-slate-500 space-y-1">
            <p>Keep your face visible in the frame throughout the assessment.</p>
            <p>Do not switch browser tabs or applications during the exam.</p>
            <p>Proctoring events may be recorded for assessment integrity and reviewed by an administrator. These events flag potential integrity concerns for review — they are not automatic proof of misconduct.</p>
          </div>
          {permError && <p className="text-sm text-danger bg-red-50 rounded-lg px-3 py-2 mt-4">{permError}</p>}
          <Button className="w-full mt-6" onClick={handleBegin}>I understand, begin assessment</Button>
        </Card>
      </AppShell>
    );
  }

  if (stage === 'submitted') {
    return (
      <AppShell>
        <Card className="max-w-lg mx-auto p-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">Assessment submitted</h1>
          <p className={`text-4xl font-display font-semibold mt-4 ${result.passed ? 'text-success' : 'text-danger'}`}>{result.scorePercent}%</p>
          <p className="text-sm text-slate-500 mt-1">Academic score — separate from any integrity/proctoring signal.</p>
          <Button className="mt-6" onClick={() => navigate(`/courses/${courseId}`)}>Back to course</Button>
        </Card>
      </AppShell>
    );
  }

  if (!quiz) return <AppShell><p className="text-slate-400">Loading...</p></AppShell>;
  const question = quiz.questions[current];

  return (
    <div ref={containerRef} className="min-h-screen bg-ink p-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl2 p-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display text-lg font-semibold text-ink">{quiz.title}</h1>
            <Badge tone={riskInfo.riskLevel === 'NORMAL' ? 'success' : riskInfo.riskLevel === 'WARNING' ? 'warning' : 'danger'}>
              Integrity: {riskInfo.riskLevel}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mb-2">Question {current + 1} of {quiz.questions.length}</p>
          <p className="text-base font-medium text-ink mb-4">{question.questionText}</p>
          <div className="space-y-2">
            {question.options.map((opt, idx) => (
              <label key={idx} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm cursor-pointer ${answers[question._id] === idx ? 'border-indigo bg-indigo-50 text-indigo' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input type="radio" name={question._id} checked={answers[question._id] === idx}
                  onChange={() => setAnswers({ ...answers, [question._id]: idx })} className="accent-indigo-600" />
                {opt}
              </label>
            ))}
          </div>
          <div className="flex items-center justify-between mt-8">
            <Button variant="secondary" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>Previous</Button>
            {current < quiz.questions.length - 1 ? (
              <Button onClick={() => setCurrent((c) => c + 1)}>Next</Button>
            ) : (
              <Button onClick={handleSubmit}>Submit assessment</Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl2 p-4 h-fit">
          <p className="text-xs font-medium text-slate-400 mb-2">Live proctoring feed</p>
          <video ref={proctoring.videoRef} muted className="w-full rounded-lg bg-black aspect-video" />
          <div className="mt-3 space-y-1 text-xs text-slate-500">
            <p>Camera: {proctoring.cameraGranted ? 'Active' : 'Inactive'}</p>
            <p>Microphone: {proctoring.micGranted ? 'Active' : 'Inactive'}</p>
            <p>Fullscreen: {proctoring.isFullscreen ? 'Yes' : 'No — please re-enter fullscreen'}</p>
            <p>
              Face detection:{' '}
              {proctoring.faceDetectionSupported
                ? 'Active (browser-native)'
                : 'Unavailable in this browser — tab/fullscreen/audio signals still active'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
