import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto">
          <FileQuestion className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">404 – Page Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The academic portal route you requested does not exist or has been relocated.
          </p>
        </div>

        <Link to="/" className="inline-block w-full">
          <Button variant="primary" fullWidth>
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Go to Portal Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
