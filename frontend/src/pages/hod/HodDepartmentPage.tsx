import React, { useState, useEffect } from 'react';
import { hodService } from '../../services/hod.service';
import { HodDepartmentOverview } from '../../types/hod.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { Users, UserCheck, BookOpen, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HodDepartmentPage: React.FC = () => {
  const [overview, setOverview] = useState<HodDepartmentOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchDepartmentOverview();
  }, []);

  const fetchDepartmentOverview = async () => {
    setLoading(true);
    try {
      const data = await hodService.getDepartmentOverview();
      setOverview(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load department overview', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading department overview and cohort statistics..." />;
  }

  if (!overview) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Unable to retrieve department information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={`Department of ${overview.departmentName}`}
        description={`Department Code: ${overview.departmentCode} • Leadership & Academic Directory`}
        badge={<Badge variant="indigo">Active Department</Badge>}
      />

      {/* Leadership Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 font-bold text-xl">
                {overview.departmentCode}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{overview.hodName}</h3>
                <p className="text-xs text-slate-500">{overview.hodDesignation} • Employee ID: {overview.hodEmployeeId}</p>
                <p className="text-xs font-medium text-brand-600 mt-0.5">Department Head & Academic Authority</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/hod/leave">
                <Badge variant={overview.pendingLeaveRequests > 0 ? 'amber' : 'slate'} className="px-3 py-1 cursor-pointer">
                  {overview.pendingLeaveRequests} Pending Leave {overview.pendingLeaveRequests === 1 ? 'Request' : 'Requests'}
                </Badge>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{overview.totalStudents}</p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Enrolled across all cohorts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faculty Members</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{overview.totalFaculty}</p>
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
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Course Subjects</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{overview.totalSubjects}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Across {overview.activeSemesters} active semesters</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cohort Sections</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{overview.totalSections}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Physical cohorts managed</p>
          </CardContent>
        </Card>
      </div>

      {/* Section Cohort Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cohort Section Distribution</CardTitle>
          <CardDescription>Active sections configured under {overview.departmentName} and student enrollment breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Section Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Student Count</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.sections.map((sec) => (
                <TableRow key={sec.sectionId}>
                  <TableCell className="font-bold text-slate-900 text-sm">
                    Section {sec.sectionName}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-mono">
                    {overview.departmentCode}
                  </TableCell>
                  <TableCell>
                    <Badge variant={sec.studentCount > 0 ? 'emerald' : 'slate'}>
                      {sec.studentCount} {sec.studentCount === 1 ? 'Student' : 'Students'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to={`/hod/students?sectionId=${sec.sectionId}`}
                      className="text-xs font-medium text-brand-600 hover:text-brand-700"
                    >
                      View Student List →
                    </Link>
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
