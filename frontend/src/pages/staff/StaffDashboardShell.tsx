import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { EmptyState } from '../../components/feedback/EmptyState';
import { BookOpen, Users, CalendarCheck, ClipboardCheck, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { staffService } from '../../services/staff.service';
import { StaffClassSummary } from '../../types/staff.types';

export const StaffDashboardShell: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<StaffClassSummary[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  useEffect(() => {
    staffService.getAssignedClasses()
      .then(setClasses)
      .catch(() => { /* silently fail */ })
      .finally(() => setLoadingClasses(false));
  }, []);

  // Total students across all assigned sections
  const totalStudents = classes.reduce((sum, c) => sum + (c.enrolledStudentCount ?? 0), 0);
  const totalClasses = classes.length;

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={`Faculty Dashboard – ${user?.fullName || 'Faculty'}`}
        description={`${user?.departmentName || user?.departmentCode || 'Department'} • Faculty ID: ${user?.employeeId || 'N/A'}`}
        action={
          <Link to="/staff/excel">
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-brand-600" />
              Excel Data Import
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assigned Classes */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Assigned Classes</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  {loadingClasses ? '—' : totalClasses}
                </p>
              </div>
              <div className="p-2.5 rounded-md bg-brand-50 text-brand-600">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Active teaching assignments</p>
          </CardContent>
        </Card>

        {/* Students Managed */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Students Managed</p>
                {loadingClasses ? (
                  <p className="text-xl font-bold text-slate-400 mt-0.5">—</p>
                ) : totalStudents > 0 ? (
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{totalStudents}</p>
                ) : (
                  <p className="text-sm font-semibold text-slate-500 mt-1">Not Assigned</p>
                )}
              </div>
              <div className={`p-2.5 rounded-md ${totalStudents > 0 ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-400'}`}>
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              {totalStudents > 0 ? `Across ${totalClasses} section${totalClasses !== 1 ? 's' : ''}` : 'In assigned cohorts'}
            </p>
          </CardContent>
        </Card>

        {/* Pending Attendance */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Pending Attendance</p>
                <p className="text-xl font-bold text-amber-600 mt-0.5">0</p>
              </div>
              <div className="p-2.5 rounded-md bg-amber-50 text-amber-600">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">All sessions updated</p>
          </CardContent>
        </Card>

        {/* Pending Evaluations */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Pending Evaluations</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">0</p>
              </div>
              <div className="p-2.5 rounded-md bg-slate-50 text-slate-500">
                <ClipboardCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Assignments and submissions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Teaching Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Teaching Subjects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingClasses ? (
              <p className="text-sm text-slate-500 py-4 text-center">Loading assignments…</p>
            ) : classes.length === 0 ? (
              <EmptyState
                title="No Assignments Found"
                description="Your teaching assignments will appear here once configured by the admin."
              />
            ) : (
              classes.map((cls) => (
                <div
                  key={cls.teachingAssignmentId}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{cls.subjectCode}</span>
                      <span className="text-xs text-slate-700">{cls.subjectName}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {cls.departmentCode} • Section {cls.sectionName} • Sem {cls.semester} ({cls.academicYear}) • {cls.enrolledStudentCount} Students
                    </p>
                  </div>
                  <Link to="/staff/classes">
                    <Button variant="outline" size="sm">Manage</Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Classroom Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No Recent Submissions"
              description="Student submissions and classroom interactions will be logged here."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
