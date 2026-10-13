import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { AdminMonitoringData } from '../../types/admin.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/feedback/LoadingState';
import {
  Users,
  Building2,
  UserCheck,
  ShieldCheck,
  UserPlus,
  Layers,
  Activity,
  ArrowRight,
  FileBarChart,
  Award,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardShell: React.FC = () => {
  const [data, setData] = useState<AdminMonitoringData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getCampusMonitoring()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const overview = data?.campusOverview;
  const queues = data?.queueOverview;

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Institutional System Administration"
        description="EduSphere CampusHub Institutional Governance, Infrastructure & Access Control"
        badge={<Badge variant="indigo">Administrator Authority</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Link to="/admin/registrations">
              <Button variant="primary" size="sm">
                <UserCheck className="w-4 h-4 mr-1.5" />
                Pending Registrations ({queues?.pendingRegistrationsCount || 0})
              </Button>
            </Link>
            <Link to="/admin/teaching-assignments">
              <Button variant="outline" size="sm">
                <UserPlus className="w-4 h-4 mr-1.5" />
                Teaching Assignments
              </Button>
            </Link>
          </div>
        }
      />

      {loading ? (
        <LoadingState message="Loading institutional governance metrics..." />
      ) : (
        <>
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Academic Departments
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {overview?.totalDepartments || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-brand-50 text-brand-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {overview?.totalSections || 0} Sections • {overview?.totalSubjects || 0} Subjects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Active Faculty & HODs
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {overview?.totalActiveFaculty || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {overview?.totalHods || 0} Department Heads appointed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Total Enrolled Students
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {overview?.totalStudents || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Active student profiles</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Pending Approvals
                    </p>
                    <p className="text-2xl font-bold text-amber-700 mt-1">
                      {overview?.pendingRegistrations || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                    <UserPlus className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-amber-600 mt-2 font-medium">New student registration queue</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Management Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Institutional Oversight & Audit</CardTitle>
                <CardDescription>Campus-wide monitoring, reports, and security trail</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  to="/admin/monitoring"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-brand-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Campus Monitoring Dashboard</p>
                      <p className="text-xs text-slate-500">Cross-department analytics and attendance overview</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  to="/admin/reports"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileBarChart className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Institution Reports</p>
                      <p className="text-xs text-slate-500">Department distribution and academic reports</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  to="/admin/audit-logs"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Security Audit Trail</p>
                      <p className="text-xs text-slate-500">Filterable activity history and change details</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Administrative Infrastructure Modules</CardTitle>
                <CardDescription>Academic setup and account management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  to="/admin/users"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-slate-700" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">User Account Management</p>
                      <p className="text-xs text-slate-500">Provision Faculty & HODs, status toggling</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  to="/admin/departments"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Department Hierarchy</p>
                      <p className="text-xs text-slate-500">Curriculum subjects and cohort sections</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  to="/admin/teaching-assignments"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Teaching Allocations</p>
                      <p className="text-xs text-slate-500">Course mappings and classroom containers</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  to="/admin/results"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Semester Results &amp; Transition</p>
                      <p className="text-xs text-slate-500">Verification, grade publication &amp; cohort progression</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
