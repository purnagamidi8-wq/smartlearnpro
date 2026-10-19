import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import Button from '../../components/Button';
import api from '../../services/api';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }
    api.get(`/auth/verify-email/${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message);
      });
  }, [params]);

  return (
    <AuthLayout title="Email verification">
      {status === 'verifying' && <p className="text-sm text-slate-500">Verifying your email...</p>}
      {status !== 'verifying' && (
        <div className={`text-sm rounded-xl p-4 ${status === 'success' ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'}`}>
          {message}
        </div>
      )}
      <Link to="/login"><Button className="w-full mt-4">Go to login</Button></Link>
    </AuthLayout>
  );
}
