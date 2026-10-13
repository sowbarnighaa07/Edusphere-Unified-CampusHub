import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { AdminReportsData } from '../../types/admin.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { FileBarChart, Users, CalendarCheck, ShieldCheck, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<AdminReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await adminService.getCampusReports();
      setReports(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Unable to generate institutional reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Generating campus governance & academic report..." />;
  }

  if (!reports) {
    return (
      <EmptyState
        icon={<FileBarChart className="w-6 h-6 text-slate-400" />}
        title="Report Generation Error"
        description="Unable to compile database statistics for institutional reporting."
        action={<Button onClick={fetchReports}>Retry</Button>}
      />
    );
  }

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Institutional Academic & Governance Reports"
        description="Formal data compilation of student distribution, faculty allocation, attendance benchmarks, and account states"
        badge={<Badge variant="indigo">Official Institutional Records</Badge>}
        action={
          <Link to="/admin/monitoring">
            <Button variant="outline" size="sm">
              Live Monitoring Dashboard →
            </Button>
          </Link>
        }
      />

      {/* Account & Workflow Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">User Account Status Distribution</CardTitle>
                <CardDescription>Authentication lifecycle states across all user roles</CardDescription>
              </div>
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(reports.userStatusBreakdown).map(([status, count]) => (
                <div key={status} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">{status}</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{count}</p>
                  <Badge
                    variant={
                      status === 'ACTIVE'
                        ? 'emerald'
                        : status === 'PENDING'
                        ? 'amber'
                        : status === 'REJECTED'
                        ? 'rose'
                        : 'slate'
                    }
                    className="mt-1 text-[10px]"
                  >
                    {status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Leave Workflow Pipeline Distribution</CardTitle>
                <CardDescription>Student applications across authorization stages</CardDescription>
              </div>
              <Activity className="w-5 h-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(reports.leaveStatusBreakdown).map(([status, count]) => (
                <div key={status} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase truncate" title={status}>
                    {status.replace('PENDING_', 'PENDING ')}
                  </p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{count}</p>
                  <Badge
                    variant={
                      status === 'APPROVED'
                        ? 'emerald'
                        : status === 'REJECTED'
                        ? 'rose'
                        : 'amber'
                    }
                    className="mt-1 text-[10px]"
                  >
                    {status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Enrollment Distribution Report */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Student Distribution by Department</CardTitle>
              <CardDescription>Official headcount and proportional percentage share per academic department</CardDescription>
            </div>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Code</TableHead>
                <TableHead>Department Name</TableHead>
                <TableHead>Enrolled Students</TableHead>
                <TableHead className="text-right">Share (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.studentDistributionByDepartment.map((item) => (
                <TableRow key={item.departmentCode}>
                  <TableCell className="font-mono font-bold text-slate-900 text-xs">
                    {item.departmentCode}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 text-sm">
                    {item.departmentName}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-800 text-sm">
                    {item.count} Students
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-slate-900 text-sm">
                    <Badge variant="indigo">{item.percentage}%</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Section Cohort Breakdown Report */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Section Cohort Enrollment Breakdown</CardTitle>
              <CardDescription>Student counts distributed across physical department cohorts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Cohort Section</TableHead>
                <TableHead className="text-right">Enrolled Students</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.sectionEnrollmentBreakdown.map((sec, idx) => (
                <TableRow key={`${sec.departmentCode}-${sec.sectionName}-${idx}`}>
                  <TableCell className="font-mono font-bold text-slate-900 text-xs">
                    {sec.departmentCode}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 text-sm">
                    Section {sec.sectionName}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={sec.studentCount > 0 ? 'emerald' : 'slate'}>
                      {sec.studentCount} Students
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Department Attendance Comparison Report */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Department Attendance Comparison</CardTitle>
              <CardDescription>Comparative institutional metrics and student attendance compliance</CardDescription>
            </div>
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Code</TableHead>
                <TableHead>Department Name</TableHead>
                <TableHead>Evaluation Records Logged</TableHead>
                <TableHead>Average Attendance</TableHead>
                <TableHead className="text-right">Attendance Defaulters (&lt;75%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.departmentAttendanceComparison.map((att) => (
                <TableRow key={att.departmentCode}>
                  <TableCell className="font-mono font-bold text-slate-900 text-xs">
                    {att.departmentCode}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 text-sm">
                    {att.departmentName}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-slate-700">
                    {att.totalRecords} Records
                  </TableCell>
                  <TableCell>
                    {att.averageAttendance !== null && att.averageAttendance !== undefined ? (
                      <Badge variant={att.averageAttendance >= 75 ? 'emerald' : 'amber'}>
                        {att.averageAttendance}%
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No attendance data</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {att.defaultersCount > 0 ? (
                      <Badge variant="rose">
                        {att.defaultersCount} Defaulters
                      </Badge>
                    ) : (
                      <Badge variant="emerald">0 Defaulters</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
