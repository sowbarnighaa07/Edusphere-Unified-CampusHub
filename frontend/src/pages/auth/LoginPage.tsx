import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/feedback/Toast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.fullName}`, 'success');

      switch (user.role) {
        case 'STUDENT':
          navigate('/student/dashboard');
          break;
        case 'STAFF':
          navigate('/staff/dashboard');
          break;
        case 'HOD':
          navigate('/hod/dashboard');
          break;
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid email or password';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-6 text-left">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Account Sign In</h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your official college email credentials to access your academic workspace.
        </p>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="College Email"
          type="email"
          required
          placeholder="e.g. student1@edusphere.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
        >
          Sign In to Portal
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          First-year student without an account?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Enrol here
          </Link>
        </p>
      </div>
    </div>
  );
};
