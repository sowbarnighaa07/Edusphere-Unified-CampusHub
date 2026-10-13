import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { EmptyState } from '../../components/feedback/EmptyState';
import { GraduationCap, CalendarCheck, ClipboardList, Megaphone, TrendingUp } from 'lucide-react';
import { studentService } from '../../services/student.service';
import { StudentAcademicOverview } from '../../types/student.types';

export const StudentDashboardShell: React.FC = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<StudentAcademicOverview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  useEffect(() => {
    studentService.getCurrentAcademicOverview()
      .then(setOverview)
      .catch(() => { /* silently fail — show fallback UI */ })
      .finally(() => setLoadingOverview(false));
  }, []);

  // Compute aggregate stats from subject records
  const avgAttendance = overview?.averageAttendancePercentage ?? null;

  const iatAvg = (() => {
    if (!overview?.subjects?.length) return null;
    const scores: number[] = [];
    for (const s of overview.subjects) {
      if (s.iat1Score != null) scores.push(s.iat1Score);
      if (s.iat2Score != null) scores.push(s.iat2Score);
    }
    if (scores.length === 0) return null;
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  })();

  const subjectCount = overview?.subjects?.length ?? 0;

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={`Welcome, ${user?.fullName || 'Student'}`}
        description={`${user?.departmentName || user?.departmentCode || 'Engineering'} • Section ${user?.sectionName || 'A'} • Semester ${overview?.currentSemester ?? 1}`}
      />

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Attendance</p>
                {loadingOverview ? (
                  <p className="text-lg font-bold text-slate-400 mt-0.5">—</p>
                ) : avgAttendance != null ? (
                  <p className={`text-lg font-bold mt-0.5 ${avgAttendance >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {avgAttendance.toFixed(1)}%
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-slate-500 mt-1">Not Yet Available</p>
                )}
              </div>
              <div className={`p-2.5 rounded-md ${avgAttendance != null ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              {avgAttendance != null ? `Across ${subjectCount} enrolled subjects` : 'Awaiting staff attendance upload'}
            </p>
          </CardContent>
        </Card>

        {/* IAT Average */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">IAT Average</p>
                {loadingOverview ? (
                  <p className="text-lg font-bold text-slate-400 mt-0.5">—</p>
                ) : iatAvg != null ? (
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {iatAvg} <span className="text-sm font-normal text-slate-400">/ 50</span>
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-slate-500 mt-1">Not Yet Available</p>
                )}
              </div>
              <div className={`p-2.5 rounded-md ${iatAvg != null ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-400'}`}>
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              {iatAvg != null ? 'Combined IAT 1 & 2 average' : 'IAT assessments pending entry'}
            </p>
          </CardContent>
        </Card>

        {/* Enrolled Subjects */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Subjects</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {loadingOverview ? '—' : `${subjectCount} Enrolled`}
                </p>
              </div>
              <div className="p-2.5 rounded-md bg-brand-50 text-brand-600">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              {overview ? `${overview.totalCredits} total credits` : 'Current semester subjects'}
            </p>
          </CardContent>
        </Card>

        {/* Academic Year */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Academic Year</p>
                <p className="text-sm font-semibold text-slate-700 mt-1">
                  {loadingOverview ? '—' : (overview?.academicYear ?? 'Pending')}
                </p>
              </div>
              <div className="p-2.5 rounded-md bg-slate-50 text-slate-500">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              {overview ? `Year ${overview.currentYear} • Sem ${overview.currentSemester}` : 'Requires enrollment data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subject Quick View */}
      {!loadingOverview && overview && overview.subjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Semester Subjects</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Subject</th>
                    <th className="px-4 py-3 font-semibold">Faculty</th>
                    <th className="px-4 py-3 font-semibold">Attendance</th>
                    <th className="px-4 py-3 font-semibold">IAT 1</th>
                    <th className="px-4 py-3 font-semibold">IAT 2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overview.subjects.map((sub) => (
                    <tr key={sub.subjectId} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{sub.subjectName}</p>
                        <span className="text-xs text-slate-400 font-mono">{sub.subjectCode}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {sub.facultyName ?? <span className="text-slate-400 text-xs">Not Assigned</span>}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {sub.attendancePercentage != null ? (
                          <span className={sub.attendancePercentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}>
                            {sub.attendancePercentage}%
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Awaiting Data</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {sub.iat1Score != null ? `${sub.iat1Score} / 50` : <span className="text-slate-400 text-xs">Awaiting Data</span>}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {sub.iat2Score != null ? `${sub.iat2Score} / 50` : <span className="text-slate-400 text-xs">Awaiting Data</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<Megaphone className="w-5 h-5 text-slate-400" />}
              title="No Announcements Yet"
              description="Campus, department, and class announcements published by staff will appear here."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<ClipboardList className="w-5 h-5 text-slate-400" />}
              title="No Pending Assignments"
              description="Coursework assignments published for your enrolled subjects will be listed here with submission deadlines."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
