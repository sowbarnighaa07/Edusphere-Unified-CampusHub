import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { DepartmentDetail, CreateDepartmentForm } from '../../types/admin.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { Building2, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DepartmentsPage = () => {
  const [departments, setDepartments] = useState<DepartmentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateDepartmentForm>({ name: '', code: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { showToast } = useToast();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDepartments();
      setDepartments(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await adminService.createDepartment(createForm);
      showToast(`Department ${created.code} (${created.name}) created successfully`, 'success');
      setIsCreateModalOpen(false);
      setCreateForm({ name: '', code: '' });
      fetchDepartments();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create department', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (dept: DepartmentDetail) => {
    if (!window.confirm(`Are you sure you want to delete department ${dept.code} - ${dept.name}?`)) {
      return;
    }
    setDeletingId(dept.id);
    try {
      await adminService.deleteDepartment(dept.id);
      showToast(`Department ${dept.code} deleted successfully`, 'info');
      setDepartments((prev) => prev.filter((d) => d.id !== dept.id));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete department', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Engineering Departments"
        description="Configure academic departments, curriculum faculties, and leadership."
        action={
          <div className="flex items-center gap-2">
            <Link to="/admin/sections">
              <Button variant="outline" size="sm">Manage Sections</Button>
            </Link>
            <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Department
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingState message="Loading departments..." />
          ) : departments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Building2 className="w-6 h-6 text-slate-400" />}
                title="No Departments Configured"
                description="Create engineering departments to begin configuring curriculum subjects and section cohorts."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Department Name</TableHead>
                  <TableHead>Head of Dept (HOD)</TableHead>
                  <TableHead>Sections</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-bold text-slate-900">
                      <Badge variant="indigo">{d.code}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800">
                      {d.name}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {d.hodName !== 'Unassigned' ? (
                        <span className="font-medium text-slate-800">{d.hodName}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {d.sectionCount} Sections
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {d.subjectCount} Subjects
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {d.facultyCount} Faculty
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={deletingId === d.id}
                        onClick={() => handleDelete(d)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete department"
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

      {/* Create Department Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Engineering Department"
        description="Define a new academic department code and institutional title."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Department Code"
            required
            placeholder="e.g. CSE, ECE, MECH, CIVIL"
            value={createForm.code}
            onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })}
            helperText="Short uppercase code used across course codes and identifiers"
          />

          <Input
            label="Department Full Name"
            required
            placeholder="e.g. Computer Science and Engineering"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Create Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
