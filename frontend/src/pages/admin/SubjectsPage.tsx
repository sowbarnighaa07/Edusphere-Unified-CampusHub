import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { SubjectDetail, DepartmentDetail, CreateSubjectForm } from '../../types/admin.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

export const SubjectsPage = () => {
  const [subjects, setSubjects] = useState<SubjectDetail[]>([]);
  const [departments, setDepartments] = useState<DepartmentDetail[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');
  const [selectedSemester, setSelectedSemester] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateSubjectForm>({
    departmentId: 0,
    code: '',
    name: '',
    semester: 1,
    credits: 3,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { showToast } = useToast();

  const fetchDepts = async () => {
    try {
      const data = await adminService.getDepartments();
      setDepartments(data);
      if (data.length > 0 && !createForm.departmentId) {
        setCreateForm((prev) => ({ ...prev, departmentId: data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSubjects(
        selectedDeptId ? Number(selectedDeptId) : undefined,
        selectedSemester ? Number(selectedSemester) : undefined
      );
      setSubjects(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch subjects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [selectedDeptId, selectedSemester]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await adminService.createSubject(createForm);
      showToast(`Subject ${created.code} (${created.name}) added successfully`, 'success');
      setIsCreateModalOpen(false);
      setCreateForm({
        departmentId: departments[0]?.id || 0,
        code: '',
        name: '',
        semester: 1,
        credits: 3,
      });
      fetchSubjects();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create subject', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (sub: SubjectDetail) => {
    if (!window.confirm(`Delete subject ${sub.code} - ${sub.name}?`)) {
      return;
    }
    setDeletingId(sub.id);
    try {
      await adminService.deleteSubject(sub.id);
      showToast(`Subject ${sub.code} deleted`, 'info');
      setSubjects((prev) => prev.filter((s) => s.id !== sub.id));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete subject', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Curriculum Subjects Catalog"
        description="Official course catalog with department allocation, credits, and syllabus semesters."
        action={
          <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Subject
          </Button>
        }
      />

      <Card>
        <CardHeader className="py-3 px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-700">Filter Subjects:</p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value ? Number(e.target.value) : '')}
                className="text-xs"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                ))}
              </Select>

              <Select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value ? Number(e.target.value) : '')}
                className="text-xs"
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <LoadingState message="Loading subjects catalog..." />
          ) : subjects.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<BookOpen className="w-6 h-6 text-slate-400" />}
                title="No Subjects Found"
                description="No subjects cataloged matching the selected department or semester."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Subject Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono font-bold text-slate-900">
                      {s.code}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800">
                      {s.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="indigo">{s.departmentCode}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">
                      Semester {s.semester}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">
                      {s.credits} Credits
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={deletingId === s.id}
                        onClick={() => handleDelete(s)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete subject"
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

      {/* Create Subject Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Curriculum Subject"
        description="Register a new academic course code into the institutional catalog."
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Department"
              required
              value={createForm.departmentId}
              onChange={(e) => setCreateForm({ ...createForm, departmentId: Number(e.target.value) })}
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
              ))}
            </Select>

            <Input
              label="Subject Code"
              required
              placeholder="e.g. CS8103"
              value={createForm.code}
              onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })}
            />
          </div>

          <Input
            label="Subject Full Title"
            required
            placeholder="e.g. Data Structures & Algorithms"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Curriculum Semester"
              required
              value={createForm.semester}
              onChange={(e) => setCreateForm({ ...createForm, semester: Number(e.target.value) })}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </Select>

            <Input
              label="Credits (1 to 10)"
              type="number"
              required
              min={1}
              max={10}
              value={createForm.credits}
              onChange={(e) => setCreateForm({ ...createForm, credits: Number(e.target.value) })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Add Subject
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
