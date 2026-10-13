import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/student.service';
import { StudentProfileData, UpdateStudentProfileForm } from '../../types/student.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { GraduationCap, ShieldCheck, Save, Mail, Phone, MapPin, Users } from 'lucide-react';

export const StudentProfilePage = () => {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateStudentProfileForm>({});

  const { showToast } = useToast();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await studentService.getProfile();
      setProfile(data);
      setFormData({
        gender: data.gender,
        dob: data.dob || '',
        mobileNumber: data.mobileNumber || '',
        alternateMobileNumber: data.alternateMobileNumber || '',
        address: data.address || '',
        city: data.city || '',
        district: data.district || '',
        state: data.state || '',
        pincode: data.pincode || '',
        fatherName: data.fatherName || '',
        motherName: data.motherName || '',
        guardianName: data.guardianName || '',
        emergencyContactName: data.emergencyContactName || '',
        emergencyContactMobile: data.emergencyContactMobile || '',
        emergencyRelationship: data.emergencyRelationship || '',
      });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await studentService.updateProfile(formData);
      setProfile(updated);
      showToast('Profile information updated successfully', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !profile) {
    return <LoadingState message="Loading student profile records..." />;
  }

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Student Official Profile"
        description="Official institutional student registration and contact records."
        badge={<Badge status={profile.status} />}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Academic Trajectory & Institutional Identity (Read-Only Source of Truth) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brand-600" />
              <div>
                <CardTitle>Academic Cohort & Institutional Registration</CardTitle>
                <CardDescription>Immutable academic records managed by the institutional administrator</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500">Register Number</span>
                <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{profile.registerNumber}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500">Department</span>
                <p className="font-semibold text-slate-800 mt-0.5">{profile.departmentCode} – {profile.departmentName}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500">Section Cohort</span>
                <p className="font-semibold text-slate-800 mt-0.5">Section {profile.sectionName}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500">Academic Standing</span>
                <p className="font-semibold text-brand-700 mt-0.5">Year {profile.currentYear} • Semester {profile.currentSemester}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500">Official College Email</span>
                <div className="flex items-center gap-1.5 mt-0.5 font-medium text-slate-800">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.email}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500">Intake / Graduation Target</span>
                <p className="font-medium text-slate-800 mt-0.5">{profile.enrollmentYear} – {profile.expectedGraduationYear}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 col-span-1 sm:col-span-2">
                <span className="text-slate-500">Enrolment Date</span>
                <p className="font-medium text-slate-800 mt-0.5">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Baseline'} (Verified by System Admin)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Details (Editable) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
              <div>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Contact information and demographic identity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Full Legal Name"
                disabled
                value={profile.fullName}
                helperText="Official name registered on college admission"
              />

              <Select
                label="Gender"
                value={formData.gender || ''}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>

              <Input
                label="Date of Birth"
                type="date"
                value={formData.dob || ''}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Mobile Number"
                placeholder="e.g. +91 9876543210"
                value={formData.mobileNumber || ''}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <Input
                label="Alternate Contact Number"
                placeholder="e.g. +91 9876543211"
                value={formData.alternateMobileNumber || ''}
                onChange={(e) => setFormData({ ...formData, alternateMobileNumber: e.target.value })}
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Residential Address */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-600" />
              <div>
                <CardTitle>Permanent Residential Address</CardTitle>
                <CardDescription>Home communication details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Street Address / Residence"
              placeholder="e.g. No. 45, Gandhi Street, Anna Nagar"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Input
                label="City / Town"
                placeholder="e.g. Chennai"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />

              <Input
                label="District"
                placeholder="e.g. Chennai"
                value={formData.district || ''}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              />

              <Input
                label="State"
                placeholder="e.g. Tamil Nadu"
                value={formData.state || ''}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />

              <Input
                label="Postal Pincode"
                placeholder="e.g. 600025"
                value={formData.pincode || ''}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Parent & Emergency Contacts */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-600" />
              <div>
                <CardTitle>Family & Emergency Contacts</CardTitle>
                <CardDescription>Emergency point of contact during campus hours</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Father's Name"
                placeholder="e.g. Robert Mercer"
                value={formData.fatherName || ''}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
              />

              <Input
                label="Mother's Name"
                placeholder="e.g. Sarah Mercer"
                value={formData.motherName || ''}
                onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
              />

              <Input
                label="Guardian Name (Optional)"
                placeholder="If applicable"
                value={formData.guardianName || ''}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <Input
                label="Emergency Contact Name"
                placeholder="e.g. Robert Mercer"
                value={formData.emergencyContactName || ''}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
              />

              <Input
                label="Emergency Mobile Number"
                placeholder="e.g. +91 9876543200"
                value={formData.emergencyContactMobile || ''}
                onChange={(e) => setFormData({ ...formData, emergencyContactMobile: e.target.value })}
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <Input
                label="Relationship to Student"
                placeholder="e.g. Father, Mother, Guardian"
                value={formData.emergencyRelationship || ''}
                onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" isLoading={isSaving}>
            <Save className="w-4 h-4 mr-1.5" />
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
