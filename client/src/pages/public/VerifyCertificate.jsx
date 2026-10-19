import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, ShieldX } from 'lucide-react';
import api from '../../services/api';

export default function VerifyCertificate() {
  const { certificateId } = useParams();
  const [state, setState] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    api.get(`/certificates/verify/${certificateId}`)
      .then((res) => setState({ loading: false, data: res.data.data, error: null }))
      .catch((err) => setState({ loading: false, data: null, error: err.message }));
  }, [certificateId]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl2 border border-slate-100 shadow-sm p-8 text-center">
        <span className="font-display font-semibold text-lg text-ink">SmartLearn <span className="text-indigo">Pro</span></span>
        <h1 className="font-display text-xl font-semibold text-ink mt-4">Certificate verification</h1>

        {state.loading && <p className="text-slate-400 mt-6">Checking...</p>}

        {!state.loading && state.data && (
          <div className="mt-6">
            <ShieldCheck className="mx-auto text-success" size={40} />
            <p className="text-success font-medium mt-2">Valid certificate</p>
            <div className="text-left text-sm text-slate-600 mt-4 space-y-1 bg-slate-50 rounded-xl p-4">
              <p><b>Student:</b> {state.data.studentName}</p>
              <p><b>Course:</b> {state.data.courseTitle}</p>
              <p><b>Score:</b> {state.data.finalScorePercent}%</p>
              <p><b>Issued:</b> {new Date(state.data.issuedAt).toLocaleDateString()}</p>
              <p><b>Certificate ID:</b> {state.data.certificateId}</p>
            </div>
          </div>
        )}

        {!state.loading && state.error && (
          <div className="mt-6">
            <ShieldX className="mx-auto text-danger" size={40} />
            <p className="text-danger font-medium mt-2">{state.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
