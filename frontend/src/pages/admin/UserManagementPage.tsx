import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import api from '../../services/api';
import { UserManagementItem, CreateStaffForm, CreateHodForm } from '../../types/admin.types';
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
import { UserPlus, UserCheck, Search, Lock, Power } from 'lucide-react';

export const UserManagementPage = () => {
  const [users, setUsers] = useState<UserManagementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Department list for modals
  const [departments, setDepartments] = useState<Array<{ id: number; name: string; code: string }>>([]);

  // Create Staff Modal
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffForm, setStaffForm] = useState<CreateStaffForm>({
    employeeId: '',
    fullName: '',
    email: '',
    password: '',
    departmentId: 0,
    designation: 'Assistant Professor',
    qualification: 'M.Tech, Ph.D.',
    joiningYear: new Date().getFullYear(),
    mobileNumber: '',
    address: '',
  });
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);

  // Create HOD Modal
  const [isHodModalOpen, setIsHodModalOpen] = useState(false);
  const [hodForm, setHodForm] = useState<CreateHodForm>({
    employeeId: '',
    fullName: '',
    email: '',
    password: '',
    departmentId: 0,
    designation: 'Professor & Head of Department',
    qualification: 'Ph.D. in Computer Science',
    joiningYear: new Date().getFullYear(),
    startDate: new Date().toISOString().split('T')[0],
    mobileNumber: '',
    address: '',
  });
  const [isSubmittingHod, setIsSubmittingHod] = useState(false);

  const { showToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllUsers(roleFilter, statusFilter);
      setUsers(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/public/departments');
      if (res.data.success && res.data.data.length > 0) {
        setDepartments(res.data.data);
        setStaffForm((prev) => ({ ...prev, departmentId: res.data.data[0].id }));
        setHodForm((prev) => ({ ...prev, departmentId: res.data.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleToggleStatus = async (user: UserManagementItem) => {
    if (user.role === 'ADMIN') {
      showToast('System Administrator status cannot be modified.', 'warning');
      return;
    }
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminService.updateUserStatus(user.id, newStatus);
      showToast(`User ${user.email} is now ${newStatus}`, 'success');
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: newStatus as any } : u));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update user status', 'error');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingStaff(true);
    try {
      const created = await adminService.createStaff(staffForm);
      showToast(`Faculty account created for ${created.fullName}`, 'success');
      setIsStaffModalOpen(false);
      setStaffForm({
        employeeId: '',
        fullName: '',
        email: '',
        password: '',
        departmentId: departments[0]?.id || 0,
        designation: 'Assistant Professor',
        qualification: 'M.Tech, Ph.D.',
        joiningYear: new Date().getFullYear(),
        mobileNumber: '',
        address: '',
      });
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create faculty account', 'error');
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  const handleCreateHod = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingHod(true);
    try {
      const created = await adminService.createHod(hodForm);
      showToast(`HOD account created for ${created.fullName}`, 'success');
      setIsHodModalOpen(false);
      setHodForm({
        employeeId: '',
        fullName: '',
        email: '',
        password: '',
        departmentId: departments[0]?.id || 0,
        designation: 'Professor & Head of Department',
        qualification: 'Ph.D. in Computer Science',
        joiningYear: new Date().getFullYear(),
        startDate: new Date().toISOString().split('T')[0],
        mobileNumber: '',
        address: '',
      });
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create HOD account', 'error');
    } finally {
      setIsSubmittingHod(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.identifier && u.identifier.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Institution User Management"
        description="Directory and role governance of campus students, faculty, and leadership."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsHodModalOpen(true)}>
              <UserCheck className="w-4 h-4 mr-1.5 text-brand-600" />
              Appoint HOD
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsStaffModalOpen(true)}>
              <UserPlus className="w-4 h-4 mr-1.5" />
              Provision Faculty
            </Button>
          </div>
        }
      />

      {/* Filters Card */}
      <Card>
        <CardHeader className="py-3 px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search by name, email, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="STAFF">Faculty</option>
                <option value="HOD">HODs</option>
                <option value="ADMIN">Administrators</option>
              </Select>

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending Review</option>
                <option value="INACTIVE">Inactive</option>
                <option value="REJECTED">Rejected</option>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <LoadingState message="Fetching user directory..." />
          ) : filteredUsers.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No Users Found"
                description="No institutional accounts match the current filter or search criteria."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Identifier</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <p className="font-semibold text-slate-800">{u.fullName || 'System Account'}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-700">
                      {u.identifier || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="indigo">{u.role}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {u.departmentCode ? (
                        <span>{u.departmentCode} <span className="text-slate-400">({u.departmentName})</span></span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge status={u.status} />
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Baseline'}
                    </TableCell>
                    <TableCell className="text-right">
                      {u.role !== 'ADMIN' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(u)}
                          title={u.status === 'ACTIVE' ? 'Deactivate user' : 'Activate user'}
                          className={u.status === 'ACTIVE' ? 'text-slate-500 hover:text-rose-600' : 'text-emerald-600 hover:text-emerald-700'}
                        >
                          <Power className="w-3.5 h-3.5 mr-1" />
                          {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Provision Faculty Modal */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title="Provision Faculty Account"
        description="Create an official academic faculty account with employee credentials."
      >
        <form onSubmit={handleCreateStaff} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Prof. David Miller"
              value={staffForm.fullName}
              onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
            />
            <Input
              label="Employee / Faculty ID"
              required
              placeholder="e.g. FAC-CSE-102"
              value={staffForm.employeeId}
              onChange={(e) => setStaffForm({ ...staffForm, employeeId: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="College Email"
              type="email"
              required
              placeholder="e.g. david.miller@edusphere.edu"
              value={staffForm.email}
              onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
            />
            <Input
              label="Initial Password"
              type="password"
              required
              placeholder="Min 6 characters"
              value={staffForm.password}
              onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
              leftIcon={<Lock className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Department"
              required
              value={staffForm.departmentId}
              onChange={(e) => setStaffForm({ ...staffForm, departmentId: Number(e.target.value) })}
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
              ))}
            </Select>

            <Input
              label="Designation"
              required
              placeholder="e.g. Assistant Professor"
              value={staffForm.designation}
              onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Qualification"
              required
              placeholder="e.g. M.Tech, Ph.D."
              value={staffForm.qualification}
              onChange={(e) => setStaffForm({ ...staffForm, qualification: e.target.value })}
            />
            <Input
              label="Joining Year"
              type="number"
              required
              value={staffForm.joiningYear}
              onChange={(e) => setStaffForm({ ...staffForm, joiningYear: Number(e.target.value) })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsStaffModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingStaff}>
              Create Faculty Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Appoint HOD Modal */}
      <Modal
        isOpen={isHodModalOpen}
        onClose={() => setIsHodModalOpen(false)}
        title="Appoint Head of Department"
        description="Create or assign an official department leadership account."
      >
        <form onSubmit={handleCreateHod} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Dr. Arthur Pendelton"
              value={hodForm.fullName}
              onChange={(e) => setHodForm({ ...hodForm, fullName: e.target.value })}
            />
            <Input
              label="Employee ID"
              required
              placeholder="e.g. HOD-ECE-01"
              value={hodForm.employeeId}
              onChange={(e) => setHodForm({ ...hodForm, employeeId: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="College Email"
              type="email"
              required
              placeholder="e.g. hod.ece@edusphere.edu"
              value={hodForm.email}
              onChange={(e) => setHodForm({ ...hodForm, email: e.target.value })}
            />
            <Input
              label="Initial Password"
              type="password"
              required
              placeholder="Min 6 characters"
              value={hodForm.password}
              onChange={(e) => setHodForm({ ...hodForm, password: e.target.value })}
              leftIcon={<Lock className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Department"
              required
              value={hodForm.departmentId}
              onChange={(e) => setHodForm({ ...hodForm, departmentId: Number(e.target.value) })}
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
              ))}
            </Select>

            <Input
              label="Designation"
              required
              placeholder="e.g. Professor & Head of Department"
              value={hodForm.designation}
              onChange={(e) => setHodForm({ ...hodForm, designation: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Tenure Start Date"
              type="date"
              required
              value={hodForm.startDate}
              onChange={(e) => setHodForm({ ...hodForm, startDate: e.target.value })}
            />
            <Input
              label="Joining Year"
              type="number"
              required
              value={hodForm.joiningYear}
              onChange={(e) => setHodForm({ ...hodForm, joiningYear: Number(e.target.value) })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsHodModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingHod}>
              Appoint Department Head
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
