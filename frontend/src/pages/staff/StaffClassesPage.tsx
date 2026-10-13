import { useState, useEffect } from 'react';
import { staffService } from '../../services/staff.service';
import { StaffClassSummary, StaffClassStudent } from '../../types/staff.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { BookOpen, Users, Video, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StaffClassesPage = () => {
  const [classes, setClasses] = useState<StaffClassSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Student Roster Modal
  const [selectedClass, setSelectedClass] = useState<StaffClassSummary | null>(null);
  const [students, setStudents] = useState<StaffClassStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const { showToast } = useToast();

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await staffService.getAssignedClasses();
      setClasses(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load assigned classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleOpenRoster = async (cls: StaffClassSummary) => {
    setSelectedClass(cls);
    setLoadingStudents(true);
    try {
      const roster = await staffService.getEnrolledStudents(cls.teachingAssignmentId);
      setStudents(roster);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load enrolled student roster', 'error');
    } finally {
      setLoadingStudents(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Assigned Teaching Classes"
        description="Active teaching assignments, cohort section rosters, and enrolled students."
        badge={
          <Badge variant="indigo">
            {classes.length} Assigned {classes.length === 1 ? 'Course' : 'Courses'}
          </Badge>
        }
      />

      {loading ? (
        <LoadingState message="Loading assigned teaching classes..." />
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={<BookOpen className="w-6 h-6 text-slate-400" />}
              title="No Classes Assigned"
              description="You have not been assigned to any course subjects for the current academic session. Contact the administrator."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((cls) => (
            <Card key={cls.teachingAssignmentId} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-base">{cls.subjectCode}</span>
                      <Badge variant="slate">{cls.credits} Credits</Badge>
                    </div>
                    <CardTitle className="text-base mt-1">{cls.subjectName}</CardTitle>
                    <CardDescription>
                      {cls.departmentCode} • Section {cls.sectionName} • Semester {cls.semester} ({cls.academicYear})
                    </CardDescription>
                  </div>
                  <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500">Enrolled Students</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{cls.enrolledStudentCount} Students</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500">Virtual Classroom</span>
                    <p className="font-semibold text-emerald-700 text-xs mt-0.5 truncate" title={cls.classroomName || 'Provisioned'}>
                      {cls.classroomName ? 'Classroom Active' : 'Provisioned'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  <Link to="/staff/classrooms" className="text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" />
                    Manage Materials
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenRoster(cls)}
                  >
                    <Users className="w-3.5 h-3.5 mr-1 text-slate-600" />
                    Student Roster ({cls.enrolledStudentCount})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Student Roster Modal */}
      {selectedClass && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedClass(null)}
          title={`Student Roster – ${selectedClass.subjectCode}`}
          description={`${selectedClass.subjectName} • ${selectedClass.departmentCode} Section ${selectedClass.sectionName} (Semester ${selectedClass.semester})`}
          maxWidth="xl"
          footer={
            <Button variant="outline" size="sm" onClick={() => setSelectedClass(null)}>
              Close Roster
            </Button>
          }
        >
          {loadingStudents ? (
            <LoadingState message="Loading enrolled student records..." />
          ) : students.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<Layers className="w-6 h-6 text-slate-400" />}
                title="No Enrolled Students"
                description={`No active first-year students found enrolled in ${selectedClass.departmentCode} Section ${selectedClass.sectionName}.`}
              />
            </div>
          ) : (
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-slate-700">Enrolled Cohort ({students.length} Total):</span>
                <span className="text-[11px] text-slate-500">Official Database Records</span>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Register No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead className="text-right">IAT 1 / IAT 2</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((st) => (
                    <TableRow key={st.studentProfileId}>
                      <TableCell className="font-mono font-bold text-slate-900 text-xs">
                        {st.registerNumber}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-800 text-xs">
                        {st.fullName}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {st.email}
                      </TableCell>
                      <TableCell>
                        {st.attendancePercentage !== null && st.attendancePercentage !== undefined ? (
                          <Badge variant={st.attendancePercentage >= 75 ? 'emerald' : 'amber'}>
                            {st.attendancePercentage}%
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono">
                        {st.iat1Score !== null && st.iat1Score !== undefined ? (
                          <span className="font-semibold text-slate-800">{st.iat1Score}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                        <span className="text-slate-300 mx-1">/</span>
                        {st.iat2Score !== null && st.iat2Score !== undefined ? (
                          <span className="font-semibold text-slate-800">{st.iat2Score}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
