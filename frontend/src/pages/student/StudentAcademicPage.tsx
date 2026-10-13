import { useState, useEffect } from 'react';
import { studentService } from '../../services/student.service';
import { StudentAcademicOverview } from '../../types/student.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { GraduationCap, BookOpen, Video, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentAcademicPage = () => {
  const [academic, setAcademic] = useState<StudentAcademicOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    const fetchAcademic = async () => {
      setLoading(true);
      try {
        const data = await studentService.getCurrentAcademicOverview();
        setAcademic(data);
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Failed to load academic records', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAcademic();
  }, []);

  if (loading || !academic) {
    return <LoadingState message="Loading current academic syllabus and subjects..." />;
  }

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={`Semester ${academic.currentSemester} Academic Registration`}
        description={`${academic.departmentCode} • Section ${academic.sectionName} • Academic Year ${academic.academicYear}`}
        badge={
          <Badge variant="indigo">
            {academic.totalCredits} Total Credits
          </Badge>
        }
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Enrolled Subjects</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{academic.subjects.length} Courses</p>
              </div>
              <div className="p-2.5 rounded-md bg-brand-50 text-brand-600">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Current semester curriculum</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Academic Attendance</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  {academic.averageAttendancePercentage !== null && academic.averageAttendancePercentage !== undefined
                    ? `${academic.averageAttendancePercentage}%`
                    : '—'}
                </p>
              </div>
              <div className="p-2.5 rounded-md bg-slate-50 text-slate-500">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              {academic.averageAttendancePercentage !== null && academic.averageAttendancePercentage !== undefined
                ? 'Across all enrolled subjects'
                : 'Awaiting faculty attendance upload'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Current Standing</p>
                <p className="text-xl font-bold text-emerald-700 mt-0.5">Year {academic.currentYear}</p>
              </div>
              <div className="p-2.5 rounded-md bg-emerald-50 text-emerald-600">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Semester {academic.currentSemester} Progression</p>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Subjects Table */}
      <Card>
        <CardContent className="p-0">
          {academic.subjects.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<BookOpen className="w-6 h-6 text-slate-400" />}
                title="No Subjects Allocated for Current Semester"
                description="The institution curriculum has not yet assigned subjects for this semester."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Subject Title</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Assigned Faculty</TableHead>
                  <TableHead>Classroom</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead className="text-right">IAT 1 / IAT 2</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {academic.subjects.map((sub) => (
                  <TableRow key={sub.subjectId}>
                    <TableCell className="font-mono font-bold text-slate-900">
                      {sub.subjectCode}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800">
                      {sub.subjectName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">
                      {sub.credits} Credits
                    </TableCell>
                    <TableCell>
                      {sub.facultyName ? (
                        <div>
                          <p className="text-xs font-medium text-slate-800">{sub.facultyName}</p>
                          <p className="text-[10px] text-slate-500">{sub.facultyEmail}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {sub.classroomId ? (
                        <Link
                          to="/student/classrooms"
                          className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium"
                        >
                          <Video className="w-3.5 h-3.5" />
                          View Materials
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {sub.attendancePercentage !== null && sub.attendancePercentage !== undefined ? (
                        <Badge variant={sub.attendancePercentage >= 75 ? 'emerald' : 'amber'}>
                          {sub.attendancePercentage}%
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono">
                      {sub.iat1Score !== null && sub.iat1Score !== undefined ? (
                        <span className="font-semibold text-slate-800">{sub.iat1Score}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                      <span className="text-slate-300 mx-1">/</span>
                      {sub.iat2Score !== null && sub.iat2Score !== undefined ? (
                        <span className="font-semibold text-slate-800">{sub.iat2Score}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
