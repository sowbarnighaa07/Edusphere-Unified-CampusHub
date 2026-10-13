import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { SectionDetail, DepartmentDetail, CreateSectionForm } from '../../types/admin.types';
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
import { Layers, Plus, Trash2 } from 'lucide-react';

export const SectionsPage = () => {
  const [sections, setSections] = useState<SectionDetail[]>([]);
  const [departments, setDepartments] = useState<DepartmentDetail[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateSectionForm>({ departmentId: 0, name: '' });
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

  const fetchSections = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSections(selectedDeptId ? Number(selectedDeptId) : undefined);
      setSections(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch sections', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  useEffect(() => {
    fetchSections();
  }, [selectedDeptId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await adminService.createSection(createForm);
      showToast(`Section ${created.name} created for department ${created.departmentCode}`, 'success');
      setIsCreateModalOpen(false);
      setCreateForm({ departmentId: departments[0]?.id || 0, name: '' });
      fetchSections();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create section', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (sec: SectionDetail) => {
    if (!window.confirm(`Delete section ${sec.name} (${sec.departmentCode})?`)) {
      return;
    }
    setDeletingId(sec.id);
    try {
      await adminService.deleteSection(sec.id);
      showToast(`Section ${sec.name} deleted`, 'info');
      setSections((prev) => prev.filter((s) => s.id !== sec.id));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete section', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Academic Cohort Sections"
        description="Reusable cohort sections per department without hardcoded semester attributes."
        action={
          <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Section
          </Button>
        }
      />

      <Card>
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">Filter by Department:</p>
            <div className="w-64">
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
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <LoadingState message="Loading academic sections..." />
          ) : sections.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Layers className="w-6 h-6 text-slate-400" />}
                title="No Sections Found"
                description="Define cohort sections (e.g. A, B, C) for your departments."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Section Name</TableHead>
                  <TableHead>Enrolled Students</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Badge variant="indigo">{s.departmentCode}</Badge>
                      <span className="text-xs text-slate-600 ml-2">{s.departmentName}</span>
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">
                      Section {s.name}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {s.studentCount} Students
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={deletingId === s.id}
                        onClick={() => handleDelete(s)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete section"
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

      {/* Create Section Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Academic Section"
        description="Add a reusable cohort section to a department."
      >
        <form onSubmit={handleCreate} className="space-y-4">
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
            label="Section Identifier"
            required
            placeholder="e.g. A, B, C"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value.toUpperCase() })}
            helperText="Single letter or code for the cohort"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Create Section
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
