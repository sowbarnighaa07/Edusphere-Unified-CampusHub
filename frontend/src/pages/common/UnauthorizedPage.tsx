import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  const getHomeLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'STUDENT': return '/student/dashboard';
      case 'STAFF': return '/staff/dashboard';
      case 'HOD': return '/hod/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/login';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">403 – Access Denied</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            You do not have the necessary institutional authorization to view or access this resource.
          </p>
        </div>

        <Link to={getHomeLink()} className="inline-block w-full">
          <Button variant="primary" fullWidth>
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
