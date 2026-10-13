import React, { useState, useEffect } from 'react';
import { hodService } from '../../services/hod.service';
import { HodFaculty } from '../../types/hod.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { UserCheck, Phone } from 'lucide-react';

export const HodFacultyPage: React.FC = () => {
  const [faculty, setFaculty] = useState<HodFaculty[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    setLoading(true);
    try {
      const data = await hodService.getDepartmentFaculty();
      setFaculty(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load department faculty', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Department Faculty & Workload"
        description="Active teaching faculty directory and course allocations across sections"
        badge={
          <Badge variant="indigo">
            {faculty.length} {faculty.length === 1 ? 'Faculty Member' : 'Faculty Members'}
          </Badge>
        }
      />

      {loading ? (
        <LoadingState message="Loading department faculty and teaching workload..." />
      ) : faculty.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={<UserCheck className="w-6 h-6 text-slate-400" />}
              title="No Faculty Found"
              description="No active teaching faculty members are currently provisioned for this department."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {faculty.map((f) => (
            <Card key={f.staffProfileId}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm">
                      {f.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <CardTitle className="text-base">{f.fullName}</CardTitle>
                      <CardDescription>
                        {f.designation} • {f.qualification} • Emp ID: <span className="font-mono font-bold text-slate-700">{f.employeeId}</span>
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={f.assignedClassesCount > 0 ? 'emerald' : 'slate'}>
                      {f.assignedClassesCount} Allocated {f.assignedClassesCount === 1 ? 'Course' : 'Courses'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="font-mono">Email: {f.email}</span>
                  {f.mobileNumber && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {f.mobileNumber}
                    </span>
                  )}
                  <span>Joined: {f.joiningYear}</span>
                </div>

                {f.teachingAssignments.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 italic">
                    No active teaching assignments allocated to this faculty member.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Course Name</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead className="text-right">Credits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {f.teachingAssignments.map((ta) => (
                        <TableRow key={ta.teachingAssignmentId}>
                          <TableCell className="font-mono font-bold text-slate-900 text-xs">
                            {ta.subjectCode}
                          </TableCell>
                          <TableCell className="font-medium text-slate-900 text-sm">
                            {ta.subjectName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="slate">Section {ta.sectionName}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 font-mono">
                            Semester {ta.semester}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 font-mono">
                            {ta.academicYear}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold text-slate-800 text-xs">
                            {ta.credits} Cr
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
