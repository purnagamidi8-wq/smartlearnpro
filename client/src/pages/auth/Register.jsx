import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import Button from '../../components/Button';
import api from '../../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthLayout title="Check your email" subtitle="One more step to get started">
        <p className="text-sm text-slate-600 bg-indigo-50 rounded-xl p-4">
          We've sent a verification link to <b>{form.email}</b>. Click it to activate your account, then log in.
        </p>
        <Button className="w-full mt-4" onClick={() => navigate('/login')}>Go to login</Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start learning in minutes">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-danger bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <div>
          <label className="text-sm font-medium text-ink">Full name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring" placeholder="Ada Lovelace" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring" placeholder="you@example.com" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Password</label>
          <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring" placeholder="At least 8 characters" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Confirm password</label>
          <input type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring" placeholder="Repeat password" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</Button>
      </form>
      <p className="text-sm text-slate-500 mt-6 text-center">
        Already have an account? <Link to="/login" className="text-indigo font-medium hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
}
