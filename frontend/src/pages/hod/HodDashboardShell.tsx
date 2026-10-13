import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { hodService } from '../../services/hod.service';
import { HodDepartmentOverview } from '../../types/hod.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Building2, Users, FileClock, UserCheck, BookOpen, Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HodDashboardShell: React.FC = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<HodDepartmentOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hodService
      .getDepartmentOverview()
      .then(setOverview)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={`Department Leadership – ${user?.fullName || 'Head of Department'}`}
        description={`Department of ${overview?.departmentName || user?.departmentName || 'Engineering'} • Institutional Governance & Oversight`}
        badge={<Badge variant="indigo">{overview?.departmentCode || 'HOD'} Portal</Badge>}
        action={
          <Link to="/hod/leave">
            <Button variant="outline" size="sm">
              <FileClock className="w-4 h-4 mr-1.5 text-amber-600" />
              Review Leaves ({overview?.pendingLeaveRequests || 0})
            </Button>
          </Link>
        }
      />

      {loading ? (
        <LoadingState message="Loading department governance metrics..." />
      ) : (
        <>
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Department Faculty
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {overview?.totalFaculty || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Active teaching faculty</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Enrolled Students
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {overview?.totalStudents || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Across all cohort sections</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Active Subjects
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {overview?.totalSubjects || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  In {overview?.activeSemesters || 0} active semesters
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Pending Leaves
                    </p>
                    <p className="text-2xl font-bold text-amber-700 mt-1">
                      {overview?.pendingLeaveRequests || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                    <FileClock className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-amber-600 mt-2 font-medium">Awaiting final approval</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Management Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Department Governance Modules</CardTitle>
                <CardDescription>Academic administration and monitoring utilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  to="/hod/department"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-brand-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Department Overview</p>
                      <p className="text-xs text-slate-500">Curriculum catalog and section breakdown</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  to="/hod/students"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Student Monitoring</p>
                      <p className="text-xs text-slate-500">Cohort directory, attendance and standing</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  to="/hod/staff"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Faculty & Workload</p>
                      <p className="text-xs text-slate-500">Teaching assignments and course allocations</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  to="/hod/attendance"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Attendance Analytics</p>
                      <p className="text-xs text-slate-500">Subject benchmarks and &lt;75% defaulters alert</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Section Cohorts</CardTitle>
                <CardDescription>Enrolled students distribution in {overview?.departmentName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overview?.sections.map((sec) => (
                    <div
                      key={sec.sectionId}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <span className="font-semibold text-slate-900 text-sm">
                        Section {sec.sectionName}
                      </span>
                      <Badge variant="emerald">{sec.studentCount} Students</Badge>
                    </div>
                  ))}
                  {(!overview?.sections || overview.sections.length === 0) && (
                    <p className="text-xs text-slate-500 italic p-4 text-center">
                      No cohort sections registered.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
