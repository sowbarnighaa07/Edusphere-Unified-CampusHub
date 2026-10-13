import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { hodService } from '../../services/hod.service';
import { HodStudent, HodDepartmentOverview } from '../../types/hod.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { Users, Search, GraduationCap } from 'lucide-react';

export const HodStudentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionParam = searchParams.get('sectionId');

  const [students, setStudents] = useState<HodStudent[]>([]);
  const [department, setDepartment] = useState<HodDepartmentOverview | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSection, setSelectedSection] = useState<string>(sectionParam || '');
  const [searchQuery, setSearchQuery] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    loadDepartmentAndStudents();
  }, [selectedSection]);

  const loadDepartmentAndStudents = async () => {
    setLoading(true);
    try {
      const [deptData, studentData] = await Promise.all([
        hodService.getDepartmentOverview(),
        hodService.getDepartmentStudents(
          selectedSection ? { sectionId: Number(selectedSection) } : undefined
        ),
      ]);
      setDepartment(deptData);
      setStudents(studentData);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load department students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionFilterChange = (secId: string) => {
    setSelectedSection(secId);
    if (secId) {
      setSearchParams({ sectionId: secId });
    } else {
      setSearchParams({});
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.registerNumber.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Department Students Directory"
        description={`Active enrolled students in ${department?.departmentName || 'Department'} • Academic standing and attendance tracking`}
        badge={
          <Badge variant="indigo">
            {students.length} {students.length === 1 ? 'Student' : 'Students'}
          </Badge>
        }
      />

      {/* Filter Card */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search by student name, register number, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />

            <Select
              value={selectedSection}
              onChange={(e) => handleSectionFilterChange(e.target.value)}
              options={[
                { value: '', label: 'All Sections' },
                ...(department?.sections.map((s) => ({
                  value: String(s.sectionId),
                  label: `Section ${s.sectionName} (${s.studentCount} Students)`,
                })) || []),
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Student Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Cohort Directory</CardTitle>
              <CardDescription>
                Official academic records and cumulative attendance
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <LoadingState message="Loading department students..." />
          ) : filteredStudents.length === 0 ? (
            <EmptyState
              icon={<Users className="w-6 h-6 text-slate-400" />}
              title="No Students Found"
              description="No enrolled students match your filter criteria."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Register Number</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Year / Batch</TableHead>
                  <TableHead>Enrolled Subjects</TableHead>
                  <TableHead>Overall Attendance</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((st) => (
                  <TableRow key={st.studentProfileId}>
                    <TableCell className="font-mono font-bold text-slate-900 text-xs">
                      {st.registerNumber}
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-slate-900 text-sm">{st.fullName}</p>
                      <p className="text-xs text-slate-500 font-mono">{st.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="slate">Section {st.sectionName}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <div className="flex items-center gap-1 font-medium">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        Year {st.currentYear} ({st.enrollmentYear}–{st.expectedGraduationYear})
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-700">
                      {st.totalSubjectsCount} {st.totalSubjectsCount === 1 ? 'Course' : 'Courses'}
                    </TableCell>
                    <TableCell>
                      {st.overallAttendancePercentage !== null && st.overallAttendancePercentage !== undefined ? (
                        <Badge variant={st.overallAttendancePercentage >= 75 ? 'emerald' : 'rose'}>
                          {st.overallAttendancePercentage}%
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No records yet</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={st.status === 'ACTIVE' ? 'emerald' : 'amber'}>
                        {st.status}
                      </Badge>
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
