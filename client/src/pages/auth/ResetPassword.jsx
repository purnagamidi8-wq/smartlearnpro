import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import Button from '../../components/Button';
import api from '../../services/api';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token: params.get('token'), ...form });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="Choose a new password">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-danger bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <div>
          <label className="text-sm font-medium text-ink">New password</label>
          <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Confirm new password</label>
          <input type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Resetting...' : 'Reset password'}</Button>
      </form>
      <p className="text-sm text-slate-500 mt-6 text-center">
        <Link to="/login" className="text-indigo font-medium hover:underline">Back to login</Link>
      </p>
    </AuthLayout>
  );
}
