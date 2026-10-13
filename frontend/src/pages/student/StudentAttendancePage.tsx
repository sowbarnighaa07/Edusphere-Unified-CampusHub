import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/student.service';
import { SemesterHistory, StudentEnrolledSubject } from '../../types/student.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { CalendarCheck, AlertTriangle, Info } from 'lucide-react';

type AttendanceStatus = 'good' | 'warning' | 'defaulter';

const getStatus = (pct?: number): AttendanceStatus | null => {
  if (pct === undefined || pct === null) return null;
  if (pct < 75) return 'defaulter';
  if (pct < 85) return 'warning';
  return 'good';
};

const StatusBadge: React.FC<{ pct?: number }> = ({ pct }) => {
  const status = getStatus(pct);
  if (status === null) return <span className="text-slate-400 text-xs italic">Not recorded</span>;

  const pctStr = `${Number(pct).toFixed(1)}%`;

  if (status === 'defaulter') {
    return (
      <div className="flex items-center gap-1.5">
        <Badge variant="rose">{pctStr}</Badge>
        <span className="text-[11px] text-rose-600 font-medium">Defaulter Alert</span>
      </div>
    );
  }
  if (status === 'warning') {
    return (
      <div className="flex items-center gap-1.5">
        <Badge variant="amber">{pctStr}</Badge>
        <span className="text-[11px] text-amber-600 font-medium">Warning</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <Badge variant="emerald">{pctStr}</Badge>
      <span className="text-[11px] text-emerald-600 font-medium">Good Standing</span>
    </div>
  );
};

export const StudentAttendancePage: React.FC = () => {
  const [currentSem, setCurrentSem] = useState<SemesterHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSemesterNumber, setCurrentSemesterNumber] = useState<number>(0);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const history = await studentService.getAcademicHistory();
        setCurrentSemesterNumber(history.currentSemester);
        const active = history.semesters.find(s => s.semester === history.currentSemester);
        setCurrentSem(active ?? null);
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Failed to load attendance records', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState message="Loading attendance records..." />;

  // Subjects that actually have attendance data
  const subjects: StudentEnrolledSubject[] = currentSem?.subjects ?? [];
  const withAttendance = subjects.filter(s => s.attendancePercentage !== undefined && s.attendancePercentage !== null);
  const defaulterCount = withAttendance.filter(s => getStatus(s.attendancePercentage) === 'defaulter').length;
  const warningCount = withAttendance.filter(s => getStatus(s.attendancePercentage) === 'warning').length;
  const goodCount = withAttendance.filter(s => getStatus(s.attendancePercentage) === 'good').length;
  const avgPct = withAttendance.length > 0
    ? withAttendance.reduce((acc, s) => acc + (s.attendancePercentage ?? 0), 0) / withAttendance.length
    : null;

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Attendance Records"
        description={`Semester ${currentSemesterNumber} — Verified subject-wise attendance from academic records`}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/student/leave')}
          >
            Apply for Leave
          </Button>
        }
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
          <span>Below 75% — Defaulter Alert</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
          <span>75–85% — Warning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          <span>Above 85% — Good Standing</span>
        </div>
        <span className="text-slate-400">| Display categories only — not institutional policy</span>
      </div>

      {/* Summary KPI row */}
      {withAttendance.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">Overall Avg</p>
              <p className={`text-2xl font-bold ${
                avgPct !== null && avgPct < 75 ? 'text-rose-600' :
                avgPct !== null && avgPct < 85 ? 'text-amber-600' :
                'text-emerald-600'
              }`}>
                {avgPct !== null ? `${avgPct.toFixed(1)}%` : '—'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">Good Standing</p>
              <p className="text-2xl font-bold text-emerald-600">{goodCount}</p>
              <p className="text-xs text-slate-500">subjects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">Warning</p>
              <p className="text-2xl font-bold text-amber-600">{warningCount}</p>
              <p className="text-xs text-slate-500">subjects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">Defaulter</p>
              <p className="text-2xl font-bold text-rose-600">{defaulterCount}</p>
              <p className="text-xs text-slate-500">subjects</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Defaulter alert banner */}
      {defaulterCount > 0 && (
        <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Attendance below 75% in {defaulterCount} subject{defaulterCount > 1 ? 's' : ''}.</span>{' '}
            You may be ineligible to appear for semester examinations in those subjects.
            Consider applying for leave regularisation if applicable.
          </div>
        </div>
      )}

      {/* Subject-wise attendance table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Subject-wise Attendance</CardTitle>
              <CardDescription>
                Semester {currentSemesterNumber} — Source: Academic Records (subject_academic_records)
              </CardDescription>
            </div>
            <CalendarCheck className="w-5 h-5 text-slate-400" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {subjects.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<CalendarCheck className="w-5 h-5 text-slate-400" />}
                title="No Subjects Enrolled"
                description="No subjects are found for your current semester. Please contact your department administrator."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead className="text-center">Attendance %</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((sub, i) => (
                  <TableRow key={sub.subjectId ?? i}>
                    <TableCell>
                      <p className="font-semibold text-slate-900 text-sm">{sub.subjectName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{sub.subjectCode}</p>
                    </TableCell>
                    <TableCell>
                      {sub.facultyName ? (
                        <p className="text-sm text-slate-800">{sub.facultyName}</p>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {sub.attendancePercentage !== undefined && sub.attendancePercentage !== null ? (
                        <span className={`font-mono text-sm font-semibold ${
                          getStatus(sub.attendancePercentage) === 'defaulter' ? 'text-rose-700' :
                          getStatus(sub.attendancePercentage) === 'warning' ? 'text-amber-700' :
                          'text-emerald-700'
                        }`}>
                          {Number(sub.attendancePercentage).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Not recorded</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge pct={sub.attendancePercentage} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info note */}
      <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
        <span>
          Attendance figures shown here are sourced directly from your academic records posted by faculty.
          If you notice a discrepancy, contact your subject faculty or department administrator.
        </span>
      </div>
    </div>
  );
};
