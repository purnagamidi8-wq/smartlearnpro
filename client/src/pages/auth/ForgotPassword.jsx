import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import Button from '../../components/Button';
import api from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
    } finally {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot password" subtitle="We'll email you a reset link">
      {sent ? (
        <p className="text-sm text-slate-600 bg-indigo-50 rounded-xl p-4">
          If an account exists for {email}, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring" placeholder="you@example.com" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</Button>
        </form>
      )}
      <p className="text-sm text-slate-500 mt-6 text-center">
        <Link to="/login" className="text-indigo font-medium hover:underline">Back to login</Link>
      </p>
    </AuthLayout>
  );
}
