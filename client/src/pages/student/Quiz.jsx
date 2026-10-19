import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useToast } from '../../components/Toast';
import api from '../../services/api';

export default function Quiz() {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    api.get(`/quizzes/${id}`)
      .then((res) => {
        setQuiz(res.data.data.quiz);
        setTimeLeft(res.data.data.quiz.timeLimitMinutes * 60);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || result) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, result]);

  const handleSubmit = async () => {
    try {
      const payload = Object.entries(answers).map(([questionId, selectedIndex]) => ({ questionId, selectedIndex }));
      const res = await api.post(`/quizzes/${id}/submit`, { answers: payload });
      setResult(res.data.data);
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  if (error) return <AppShell><Card className="p-8 text-center text-danger">{error}</Card></AppShell>;
  if (!quiz) return <AppShell><p className="text-slate-400">Loading...</p></AppShell>;

  if (result) {
    return (
      <AppShell>
        <Card className="p-8 max-w-lg mx-auto text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">Quiz complete</h1>
          <p className={`text-4xl font-display font-semibold mt-4 ${result.passed ? 'text-success' : 'text-danger'}`}>
            {result.scorePercent}%
          </p>
          <p className="text-sm text-slate-500 mt-1">{result.marksObtained} / {result.totalMarks} marks</p>
          <p className={`mt-3 font-medium ${result.passed ? 'text-success' : 'text-danger'}`}>
            {result.passed ? 'Passed' : 'Not passed'}
          </p>
          <Button className="mt-6" onClick={() => navigate(-1)}>Back to lesson</Button>
        </Card>
      </AppShell>
    );
  }

  const question = quiz.questions[current];
  const minutes = Math.floor((timeLeft || 0) / 60);
  const seconds = (timeLeft || 0) % 60;

  return (
    <AppShell>
      <Card className="max-w-2xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-xl font-semibold text-ink">{quiz.title}</h1>
          <span className="text-sm font-mono text-slate-500">{minutes}:{String(seconds).padStart(2, '0')}</span>
        </div>
        <p className="text-xs text-slate-400 mb-2">Question {current + 1} of {quiz.questions.length}</p>
        <p className="text-base font-medium text-ink mb-4">{question.questionText}</p>
        <div className="space-y-2">
          {question.options.map((opt, idx) => (
            <label
              key={idx}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm cursor-pointer transition-colors ${
                answers[question._id] === idx ? 'border-indigo bg-indigo-50 text-indigo' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name={question._id}
                checked={answers[question._id] === idx}
                onChange={() => setAnswers({ ...answers, [question._id]: idx })}
                className="accent-indigo-600"
              />
              {opt}
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between mt-8">
          <Button variant="secondary" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>Previous</Button>
          {current < quiz.questions.length - 1 ? (
            <Button onClick={() => setCurrent((c) => c + 1)}>Next</Button>
          ) : (
            <Button onClick={() => setConfirming(true)}>Submit quiz</Button>
          )}
        </div>

        {confirming && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setConfirming(false)}>
            <div className="bg-white rounded-xl2 p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-display font-semibold text-ink">Submit your answers?</h3>
              <p className="text-sm text-slate-500 mt-2">
                You've answered {Object.keys(answers).length} of {quiz.questions.length} questions. This cannot be undone.
              </p>
              <div className="flex justify-end gap-2 mt-5">
                <Button variant="secondary" onClick={() => setConfirming(false)}>Keep reviewing</Button>
                <Button onClick={handleSubmit}>Submit</Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
