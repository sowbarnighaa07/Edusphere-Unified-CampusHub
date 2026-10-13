import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import {
  TeachingAssignmentDetail,
  UserManagementItem,
  SubjectDetail,
  SectionDetail,
  DepartmentDetail,
  CreateTeachingAssignmentForm
} from '../../types/admin.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { UserPlus, Trash2, Video, CheckCircle2 } from 'lucide-react';

export const TeachingAssignmentsPage = () => {
  const [assignments, setAssignments] = useState<TeachingAssignmentDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // Auxiliary data for modal
  const [staffList, setStaffList] = useState<UserManagementItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentDetail[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');
  const [deptSubjects, setDeptSubjects] = useState<SubjectDetail[]>([]);
  const [deptSections, setDeptSections] = useState<SectionDetail[]>([]);

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateTeachingAssignmentForm>({
    staffId: 0,
    subjectId: 0,
    sectionId: 0,
    semester: 1,
    academicYear: '2026-2027',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { showToast } = useToast();

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await adminService.getTeachingAssignments();
      setAssignments(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxiliary = async () => {
    try {
      const [users, depts] = await Promise.all([
        adminService.getAllUsers('STAFF', 'ACTIVE'),
        adminService.getDepartments(),
      ]);
      setStaffList(users);
      setDepartments(depts);
      if (users.length > 0) {
        setCreateForm((prev) => ({ ...prev, staffId: users[0].id }));
      }
      if (depts.length > 0) {
        setSelectedDeptId(depts[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchAuxiliary();
  }, []);

  // When department changes in modal, load corresponding subjects and sections
  useEffect(() => {
    if (!selectedDeptId) return;
    const loadDeptResources = async () => {
      try {
        const [subs, secs] = await Promise.all([
          adminService.getSubjects(Number(selectedDeptId)),
          adminService.getSections(Number(selectedDeptId)),
        ]);
        setDeptSubjects(subs);
        setDeptSections(secs);
        if (subs.length > 0) {
          setCreateForm((prev) => ({ ...prev, subjectId: subs[0].id, semester: subs[0].semester }));
        }
        if (secs.length > 0) {
          setCreateForm((prev) => ({ ...prev, sectionId: secs[0].id }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadDeptResources();
  }, [selectedDeptId]);

  const handleSubjectChange = (subjectId: number) => {
    const sub = deptSubjects.find((s) => s.id === subjectId);
    setCreateForm((prev) => ({
      ...prev,
      subjectId,
      semester: sub ? sub.semester : prev.semester,
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.staffId || !createForm.subjectId || !createForm.sectionId) {
      showToast('Please fill all required allocation fields', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await adminService.createTeachingAssignment(createForm);
      showToast(`Teaching assignment created for ${created.staffName} (${created.subjectCode})`, 'success');
      setIsCreateModalOpen(false);
      fetchAssignments();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create teaching assignment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (ta: TeachingAssignmentDetail) => {
    if (!window.confirm(`Delete teaching assignment for ${ta.staffName} (${ta.subjectCode} - Sec ${ta.sectionName})?`)) {
      return;
    }
    setDeletingId(ta.id);
    try {
      await adminService.deleteTeachingAssignment(ta.id);
      showToast('Teaching assignment and classroom unlinked', 'info');
      setAssignments((prev) => prev.filter((a) => a.id !== ta.id));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete assignment', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Faculty Teaching Assignments"
        description="Allocate faculty to curriculum subjects and section cohorts. Automatically provisions virtual classrooms."
        action={
          <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-1.5" />
            Assign Faculty
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingState message="Loading teaching assignments..." />
          ) : assignments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<UserPlus className="w-6 h-6 text-slate-400" />}
                title="No Teaching Assignments"
                description="Assign faculty members to subject courses and cohort sections."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Cohort Section</TableHead>
                  <TableHead>Semester & Year</TableHead>
                  <TableHead>Virtual Classroom</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((ta) => (
                  <TableRow key={ta.id}>
                    <TableCell>
                      <p className="font-semibold text-slate-800">{ta.staffName}</p>
                      <p className="text-xs text-slate-500 font-mono">{ta.employeeId}</p>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-slate-900">{ta.subjectCode}</span>
                      <p className="text-xs text-slate-600">{ta.subjectName}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="indigo">{ta.departmentCode}</Badge>
                      <span className="text-xs font-semibold text-slate-700 ml-1.5">Section {ta.sectionName}</span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      Semester {ta.semester} • {ta.academicYear}
                    </TableCell>
                    <TableCell>
                      {ta.classroomId ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate max-w-[140px]" title={ta.classroomName}>Provisioned</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={deletingId === ta.id}
                        onClick={() => handleDelete(ta)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Revoke assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assign Faculty Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Assign Faculty to Course Cohort"
        description="Link a faculty member to a subject, section, and semester."
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <Select
            label="Faculty Member"
            required
            value={createForm.staffId}
            onChange={(e) => setCreateForm({ ...createForm, staffId: Number(e.target.value) })}
          >
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>{s.fullName} ({s.identifier || s.email})</option>
            ))}
          </Select>

          <Select
            label="Target Department"
            required
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(Number(e.target.value))}
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
            ))}
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Subject Course"
              required
              value={createForm.subjectId}
              onChange={(e) => handleSubjectChange(Number(e.target.value))}
            >
              {deptSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.code} - {sub.name} (Sem {sub.semester})</option>
              ))}
            </Select>

            <Select
              label="Cohort Section"
              required
              value={createForm.sectionId}
              onChange={(e) => setCreateForm({ ...createForm, sectionId: Number(e.target.value) })}
            >
              {deptSections.map((sec) => (
                <option key={sec.id} value={sec.id}>Section {sec.name}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Semester"
              type="number"
              required
              min={1}
              max={8}
              value={createForm.semester}
              onChange={(e) => setCreateForm({ ...createForm, semester: Number(e.target.value) })}
            />
            <Input
              label="Academic Year"
              required
              placeholder="e.g. 2026-2027"
              value={createForm.academicYear}
              onChange={(e) => setCreateForm({ ...createForm, academicYear: e.target.value })}
            />
          </div>

          <div className="p-3 bg-brand-50 rounded-md border border-brand-200 flex items-start gap-2.5 text-xs text-brand-800">
            <Video className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <span>
              Saving this assignment will automatically provision a dedicated <strong>Virtual Classroom</strong> for faculty course materials and assignments.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Create Assignment & Classroom
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
