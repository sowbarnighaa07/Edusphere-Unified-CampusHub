import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { AdminMonitoringData } from '../../types/admin.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import {
  Building2,
  Users,
  UserCheck,
  BookOpen,
  Layers,
  CalendarCheck,
  UserPlus,
  FileClock,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminMonitoringPage: React.FC = () => {
  const [data, setData] = useState<AdminMonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const fetchMonitoringData = async () => {
    setLoading(true);
    try {
      const result = await adminService.getCampusMonitoring();
      setData(result);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Unable to load institution monitoring data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading institution monitoring data from database..." />;
  }

  if (!data) {
    return (
      <EmptyState
        icon={<Activity className="w-6 h-6 text-slate-400" />}
        title="Monitoring Data Unavailable"
        description="Unable to connect to institution records. Please refresh or contact administrator."
        action={<Button onClick={fetchMonitoringData}>Retry</Button>}
      />
    );
  }

  const { campusOverview, departmentSummaries, attendanceOverview, performanceOverview, queueOverview } = data;

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Institution Monitoring & System Oversight"
        description="Comprehensive campus-wide health, department benchmarks, and operational queues"
        badge={<Badge variant="indigo">CampusHub Oversight</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Link to="/admin/reports">
              <Button variant="outline" size="sm">
                View Institution Reports
              </Button>
            </Link>
            <Link to="/admin/audit-logs">
              <Button variant="outline" size="sm">
                <Activity className="w-4 h-4 mr-1.5" />
                Security Audit Trail
              </Button>
            </Link>
          </div>
        }
      />

      {/* Campus Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled Students</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{campusOverview.totalStudents}</p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Across all departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Faculty</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{campusOverview.totalActiveFaculty}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">{campusOverview.totalHods} Appointed HODs</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Academic Infrastructure</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{campusOverview.totalDepartments} Depts</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {campusOverview.totalSections} Sections • {campusOverview.totalSubjects} Subjects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Virtual Classrooms</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{campusOverview.totalClassrooms}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Auto-provisioned spaces</p>
          </CardContent>
        </Card>
      </div>

      {/* Operational Queues Alert Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {queueOverview.pendingRegistrationsCount} Pending Student Registrations
                </p>
                <p className="text-xs text-slate-600">Self-registered first-year students requiring admin approval</p>
              </div>
            </div>
            <Link to="/admin/registrations">
              <Button size="sm" variant="primary">
                Review Queue →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-200 text-slate-700">
                <FileClock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {queueOverview.pendingLeavesCount} Total Pending Leave Requests
                </p>
                <p className="text-xs text-slate-600">Across faculty and HOD approval tiers</p>
              </div>
            </div>
            <Badge variant={queueOverview.pendingLeavesCount > 0 ? 'amber' : 'emerald'}>
              {queueOverview.pendingLeavesCount > 0 ? 'Active Queue' : 'Queue Clear'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Department-Wise Overview Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Department Academic Summary</CardTitle>
              <CardDescription>Cross-department comparison of enrollment, faculty workload, and attendance benchmarks</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {departmentSummaries.length === 0 ? (
            <EmptyState
              icon={<Building2 className="w-6 h-6 text-slate-400" />}
              title="No Departments Configured"
              description="Create academic departments in the academic structure module."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Department Name</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Sections</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Average Attendance</TableHead>
                  <TableHead className="text-right">Attendance Alerts (&lt;75%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentSummaries.map((dept) => (
                  <TableRow key={dept.departmentId}>
                    <TableCell className="font-mono font-bold text-slate-900 text-xs">
                      {dept.departmentCode}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 text-sm">
                      {dept.departmentName}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">
                      {dept.studentCount}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">
                      {dept.facultyCount}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-mono">
                      {dept.sectionCount}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-mono">
                      {dept.subjectCount}
                    </TableCell>
                    <TableCell>
                      {dept.averageAttendance !== null && dept.averageAttendance !== undefined ? (
                        <Badge variant={dept.averageAttendance >= 75 ? 'emerald' : 'amber'}>
                          {dept.averageAttendance}%
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No records</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {dept.defaultersCount > 0 ? (
                        <Badge variant="rose">
                          {dept.defaultersCount} Defaulters
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

      {/* Attendance & Academic Performance Health Check */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Institutional Attendance Standing</CardTitle>
                <CardDescription>Cumulative evaluation records from MySQL</CardDescription>
              </div>
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-sm text-slate-600 font-medium">Institution Overall Average</span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                {attendanceOverview.overallAverageAttendance !== null && attendanceOverview.overallAverageAttendance !== undefined
                  ? `${attendanceOverview.overallAverageAttendance}%`
                  : 'N/A'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-slate-500">Total Records Logged</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">{attendanceOverview.totalAttendanceRecords}</p>
              </div>
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                <p className="text-rose-600">Total Defaulters (&lt;75%)</p>
                <p className="text-base font-bold text-rose-700 mt-0.5">{attendanceOverview.totalDefaulters}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Academic Continuous Assessment</CardTitle>
                <CardDescription>Internal Assessment Test (IAT) institutional statistics</CardDescription>
              </div>
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceOverview.hasPerformanceData ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-slate-500">IAT 1 Institutional Average</p>
                    <p className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                      {performanceOverview.averageIat1Score !== null && performanceOverview.averageIat1Score !== undefined
                        ? `${performanceOverview.averageIat1Score} / 50`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-slate-500">IAT 2 Institutional Average</p>
                    <p className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                      {performanceOverview.averageIat2Score !== null && performanceOverview.averageIat2Score !== undefined
                        ? `${performanceOverview.averageIat2Score} / 50`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 italic">
                  {performanceOverview.totalEvaluatedRecords} total assessment mark entries recorded in MySQL.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <p className="text-xs text-slate-500">{performanceOverview.statusMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
