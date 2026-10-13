import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { AdminProfileData } from '../../types/admin.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import {
  ShieldCheck,
  Mail,
  Calendar,
  Users,
  GraduationCap,
  Briefcase,
  Building2,
  BookOpen,
  Server,
  Lock,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export const AdminProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<AdminProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await adminService.getProfile();
      setProfile(data);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load admin profile';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading administrator profile..." />;
  }

  if (!profile) {
    return (
      <div className="p-6 text-center text-slate-700">
        Administrator profile information could not be loaded.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 text-left">
      <PageHeader
        title="Administrator Profile"
        description="System administrative credentials, security authority, and campus-wide governance metrics."
      />

      {/* Main Identity Banner Card */}
      <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
        <div className="h-28 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900" />
        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between -mt-12 mb-4 gap-4">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-indigo-700 font-bold text-3xl">
                <ShieldCheck className="w-12 h-12 text-indigo-600" />
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-bold text-slate-900">
                    System Administrator
                  </h2>
                  <Badge variant="indigo">ROOT ADMIN</Badge>
                  <Badge variant="emerald">ACTIVE</Badge>
                </div>
                <p className="text-sm font-medium text-slate-600 flex items-center gap-2 mt-1">
                  <span className="font-semibold text-slate-800">ID: #{profile.id}</span>
                  <span>•</span>
                  <span className="text-slate-700">EduSphere Core Governance</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Full System Privileges</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Account Email</p>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {profile.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Account Created</p>
                <p className="text-sm font-bold text-slate-900">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
                <Server className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Environment</p>
                <p className="text-sm font-bold text-slate-900">
                  Production / Active
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campus System Metrics */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          Campus Governance &amp; Entity Totals
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Total Users</p>
                <p className="text-2xl font-bold text-slate-900">{profile.totalUsers}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Students</p>
                <p className="text-2xl font-bold text-slate-900">{profile.totalStudents}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-700">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Faculty</p>
                <p className="text-2xl font-bold text-slate-900">{profile.totalFaculty}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Departments</p>
                <p className="text-2xl font-bold text-slate-900">{profile.totalDepartments}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Subjects</p>
                <p className="text-2xl font-bold text-slate-900">{profile.totalSubjects}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Security & Access Authority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              Authority &amp; Privileges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-900">User &amp; Role Management</p>
                <p className="text-xs text-slate-600 mt-0.5">Approve student registrations, activate/suspend accounts, provision HODs and faculty.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-900">Academic Structure Allocation</p>
                <p className="text-xs text-slate-600 mt-0.5">Maintain departments, sections, curriculum subjects, and faculty teaching assignments.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-900">Audit &amp; Security Oversight</p>
                <p className="text-xs text-slate-600 mt-0.5">Inspect system-wide immutable audit trail logs and monitor real-time security events.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Platform</span>
              <span className="font-bold text-slate-900">EduSphere CampusHub V2</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Backend Engine</span>
              <span className="font-bold text-slate-900">Spring Boot 3.3.3 + JPA</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-semibold text-slate-600">Database</span>
              <span className="font-bold text-slate-900">MySQL 8.0</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold text-slate-600">Authentication</span>
              <span className="font-bold text-slate-900">Stateless JWT + BCrypt</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProfilePage;
