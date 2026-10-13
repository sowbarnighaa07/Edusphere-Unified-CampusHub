import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import api from '../../services/api';
import { useToast } from '../../components/feedback/Toast';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

interface DepartmentItem {
  id: number;
  name: string;
  code: string;
}

interface SectionItem {
  id: number;
  name: string;
  departmentId: number;
}

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [sectionId, setSectionId] = useState<number | ''>('');
  const [enrollmentYear] = useState<number>(2026); // Default 1st year intake
  const [expectedGraduationYear] = useState<number>(2030);

  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [isLoadingDepts, setIsLoadingDepts] = useState(false);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepts = async () => {
      setIsLoadingDepts(true);
      try {
        const res = await api.get('/public/departments');
        if (res.data.success) {
          setDepartments(res.data.data);
          if (res.data.data.length > 0) {
            setDepartmentId(res.data.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load departments', err);
      } finally {
        setIsLoadingDepts(false);
      }
    };
    fetchDepts();
  }, []);

  useEffect(() => {
    if (!departmentId) return;
    const fetchSections = async () => {
      setIsLoadingSections(true);
      try {
        const res = await api.get(`/public/sections?departmentId=${departmentId}`);
        if (res.data.success) {
          setSections(res.data.data);
          if (res.data.data.length > 0) {
            setSectionId(res.data.data[0].id);
          } else {
            setSectionId('');
          }
        }
      } catch (err) {
        console.error('Failed to load sections', err);
      } finally {
        setIsLoadingSections(false);
      }
    };
    fetchSections();
  }, [departmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!departmentId || !sectionId) {
      setError('Please select a department and section');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.registerStudent({
        fullName,
        email,
        password,
        registerNumber,
        departmentId: Number(departmentId),
        sectionId: Number(sectionId),
        enrollmentYear,
        expectedGraduationYear,
      });

      showToast('Registration submitted successfully. Pending Admin review.', 'success');
      navigate('/registration-pending');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-5 text-left">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">First-Year Enrolment</h2>
        <p className="text-xs text-slate-500 mt-1">
          Submit your official institutional details for administrative review.
        </p>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Full Legal Name"
          type="text"
          required
          placeholder="e.g. John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="College Email"
            type="email"
            required
            placeholder="e.g. student@edusphere.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Register Number / ID"
            type="text"
            required
            placeholder="e.g. 2026CSE001"
            value={registerNumber}
            onChange={(e) => setRegisterNumber(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Department"
            required
            value={departmentId}
            onChange={(e) => setDepartmentId(Number(e.target.value))}
            disabled={isLoadingDepts}
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.name}
              </option>
            ))}
          </Select>

          <Select
            label="Section"
            required
            value={sectionId}
            onChange={(e) => setSectionId(Number(e.target.value))}
            disabled={isLoadingSections || sections.length === 0}
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                Section {s.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Academic Trajectory (Derived) */}
        <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Academic Intake:</span>
            <span className="font-semibold text-slate-800">First Year ({enrollmentYear}–{expectedGraduationYear})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Initial Academic Level:</span>
            <span className="font-semibold text-slate-800">Semester 1</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Password"
            type="password"
            required
            placeholder="Min 6 chars"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirm Password"
            type="password"
            required
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isSubmitting}
          className="mt-2"
        >
          Submit Enrolment
        </Button>
      </form>

      <div className="mt-4 pt-3 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
