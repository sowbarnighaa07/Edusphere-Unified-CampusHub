import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staff.service';
import { StaffProfileData, UpdateStaffProfileForm } from '../../types/staff.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Edit3,
  ShieldCheck,
} from 'lucide-react';

export const StaffProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<StaffProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<UpdateStaffProfileForm>({
    mobileNumber: '',
    address: '',
    qualification: '',
    dob: '',
    gender: 'MALE',
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await staffService.getProfile();
      setProfile(data);
      setEditForm({
        mobileNumber: data.mobileNumber || '',
        address: data.address || '',
        qualification: data.qualification || '',
        dob: data.dob || '',
        gender: data.gender || 'MALE',
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load profile';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await staffService.updateProfile(editForm);
      setProfile(updated);
      setShowEditModal(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update profile';
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading staff profile..." />;
  }

  if (!profile) {
    return (
      <div className="p-6 text-center text-slate-700">
        Profile information could not be loaded.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 text-left">
      <PageHeader
        title="Staff Profile"
        description="Manage and view your faculty credentials, academic profile, and contact information."
        action={
          <Button
            onClick={() => {
              setEditForm({
                mobileNumber: profile.mobileNumber || '',
                address: profile.address || '',
                qualification: profile.qualification || '',
                dob: profile.dob || '',
                gender: profile.gender || 'MALE',
              });
              setShowEditModal(true);
            }}
            className="flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </Button>
        }
      />

      {/* Main Identity Banner Card */}
      <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
        <div className="h-28 bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-800" />
        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between -mt-12 mb-4 gap-4">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-indigo-700 font-bold text-3xl">
                {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {profile.fullName}
                  </h2>
                  <Badge variant="blue">{profile.designation}</Badge>
                  <Badge variant="indigo">{profile.departmentCode}</Badge>
                </div>
                <p className="text-sm font-medium text-slate-600 flex items-center gap-2 mt-1">
                  <span className="font-semibold text-slate-800">ID: {profile.employeeId}</span>
                  <span>•</span>
                  <span className="text-slate-700">{profile.departmentName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Faculty Account</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Institutional Email</p>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {profile.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Phone</p>
                <p className="text-sm font-bold text-slate-900">
                  {profile.mobileNumber || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Joining Year</p>
                <p className="text-sm font-bold text-slate-900">
                  {profile.joiningYear}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Qualification</p>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {profile.qualification || 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic & Faculty Info */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              Academic &amp; Departmental Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-600 uppercase">Employee ID</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {profile.employeeId}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 uppercase">Designation</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {profile.designation}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 uppercase">Department</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {profile.departmentName} ({profile.departmentCode})
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 uppercase">Highest Qualification</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {profile.qualification}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 uppercase">Service Since</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {profile.joiningYear}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 uppercase">Department Status</span>
                <div className="mt-1">
                  <Badge variant="emerald">Active Faculty</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal & Contact Details */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <User className="w-5 h-5 text-indigo-600" />
              Personal &amp; Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-600 uppercase">Gender</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {profile.gender || 'Not specified'}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 uppercase">Date of Birth</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {profile.dob || 'Not specified'}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 uppercase">Mobile Number</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {profile.mobileNumber || 'Not specified'}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 uppercase">Account Status</span>
                <div className="mt-1">
                  <Badge variant="emerald">Active</Badge>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-600 uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Residential / Campus Address
              </span>
              <p className="text-sm font-medium text-slate-800 mt-1">
                {profile.address || 'Address not registered'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Faculty Profile"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Mobile Number
                </label>
                <Input
                  type="text"
                  value={editForm.mobileNumber || ''}
                  onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Highest Qualification
                </label>
                <Input
                  type="text"
                  value={editForm.qualification || ''}
                  onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                  placeholder="M.Tech, Ph.D."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Date of Birth
                </label>
                <Input
                  type="date"
                  value={editForm.dob || ''}
                  onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Gender
                </label>
                <Select
                  value={editForm.gender || 'MALE'}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' })}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Residential Address
              </label>
              <Textarea
                rows={3}
                value={editForm.address || ''}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                placeholder="Enter complete residential address"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StaffProfilePage;
