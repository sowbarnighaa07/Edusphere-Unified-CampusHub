import React, { useState, useEffect } from 'react';
import { hodService } from '../../services/hod.service';
import { HodAttendanceAnalytics } from '../../types/hod.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { CalendarCheck, AlertTriangle, Users, BookOpen } from 'lucide-react';

export const HodAttendancePage: React.FC = () => {
  const [analytics, setAnalytics] = useState<HodAttendanceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [selectedSemester]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await hodService.getAttendanceAnalytics(
        selectedSemester ? { semester: Number(selectedSemester) } : undefined
      );
      setAnalytics(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load attendance analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading department attendance analytics..." />;
  }

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Department Attendance Analytics"
        description={`Subject-wise attendance benchmark and student attendance monitoring • ${analytics?.departmentCode || 'Department'}`}
        badge={
          analytics && (
            <Badge variant={analytics.departmentAverageAttendance >= 75 ? 'emerald' : 'amber'}>
              Dept Average: {analytics.departmentAverageAttendance}%
            </Badge>
          )
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Average</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {analytics?.departmentAverageAttendance}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Across all department subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Students Monitored</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {analytics?.totalEnrolledStudents}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">With active attendance records</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Alerts (&lt;75%)</p>
                <p className="text-2xl font-bold text-rose-700 mt-1">
                  {analytics?.totalDefaultersCount}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-rose-600 mt-2 font-medium">Subject records below threshold</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-64">
              <Select
                label="Filter by Semester"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                options={[
                  { value: '', label: 'All Semesters' },
                  { value: '1', label: 'Semester 1' },
                  { value: '2', label: 'Semester 2' },
                  { value: '3', label: 'Semester 3' },
                  { value: '4', label: 'Semester 4' },
                  { value: '5', label: 'Semester 5' },
                  { value: '6', label: 'Semester 6' },
                  { value: '7', label: 'Semester 7' },
                  { value: '8', label: 'Semester 8' },
                ]}
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Institutional Attendance Policy: Minimum 75% required for exam eligibility
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject-Wise Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subject-Wise Attendance Breakdown</CardTitle>
          <CardDescription>Aggregate attendance and defaulter count per curriculum subject</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.subjectStats.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-6 h-6 text-slate-400" />}
              title="No Subject Records"
              description="No attendance records found for the selected semester."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Records Entered</TableHead>
                  <TableHead>Average Attendance</TableHead>
                  <TableHead className="text-right">Defaulters (&lt;75%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics?.subjectStats.map((sub) => (
                  <TableRow key={sub.subjectId}>
                    <TableCell className="font-mono font-bold text-slate-900 text-xs">
                      {sub.subjectCode}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 text-sm">
                      {sub.subjectName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-mono">
                      Semester {sub.semester}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-700">
                      {sub.totalRecords} {sub.totalRecords === 1 ? 'Student' : 'Students'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sub.averageAttendance >= 75 ? 'emerald' : 'amber'}>
                        {sub.averageAttendance}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {sub.defaulterCount > 0 ? (
                        <Badge variant="rose">
                          {sub.defaulterCount} {sub.defaulterCount === 1 ? 'Student' : 'Students'}
                        </Badge>
                      ) : (
                        <Badge variant="emerald">0 Defaulters</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Attendance Defaulters Roster */}
      {analytics && analytics.defaulters.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-rose-900">Attendance Action List (&lt;75%)</CardTitle>
                <CardDescription>Students requiring attendance counseling or parental intimation</CardDescription>
              </div>
              <Badge variant="rose">{analytics.defaulters.length} Instances</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Register Number</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Subject Code</TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead className="text-right">Attendance %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.defaulters.map((def, idx) => (
                  <TableRow key={`${def.studentProfileId}-${def.subjectCode}-${idx}`}>
                    <TableCell className="font-mono font-bold text-slate-900 text-xs">
                      {def.registerNumber}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800 text-xs">
                      {def.studentName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      Section {def.sectionName}
                    </TableCell>
                    <TableCell className="font-mono font-medium text-slate-700 text-xs">
                      {def.subjectCode}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {def.subjectName}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="rose">{def.attendancePercentage}%</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
