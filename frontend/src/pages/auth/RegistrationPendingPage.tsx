import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const RegistrationPendingPage: React.FC = () => {
  return (
    <div className="w-full max-w-sm mx-auto text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
        <Clock className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Registration Under Review</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your account request has been submitted and is currently pending institutional administrator approval.
        </p>
      </div>

      <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 text-left space-y-1.5">
        <p className="font-semibold text-slate-800">Next Steps:</p>
        <p className="text-slate-500 text-[11px] leading-relaxed">
          1. The administrative office verifies student ID and enrollment details.<br />
          2. Upon approval, your account status will transition to Active.<br />
          3. You may then sign in using your registered credentials.
        </p>
      </div>

      <Link to="/login" className="inline-block w-full">
        <Button variant="outline" fullWidth>
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Login
        </Button>
      </Link>
    </div>
  );
};
