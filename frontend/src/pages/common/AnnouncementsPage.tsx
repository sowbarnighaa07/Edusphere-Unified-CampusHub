import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { announcementService } from '../../services/announcement.service';
import { adminService } from '../../services/admin.service';
import { staffService } from '../../services/staff.service';
import { AnnouncementItem, CreateAnnouncementForm, AnnouncementScope } from '../../types/announcement.types';
import { DepartmentDetail, SectionDetail } from '../../types/admin.types';
import { StaffClassSummary } from '../../types/staff.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { Megaphone, Plus, Trash2, Calendar } from 'lucide-react';

interface AnnouncementsPageProps {
  pageTitle?: string;
  pageDescription?: string;
}

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({
  pageTitle = 'Campus Announcements & Bulletins',
  pageDescription = 'Official institutional circulars, department notices, and classroom updates',
}) => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Creation modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Departments and sections for selector (if Admin/HOD)
  const [departments, setDepartments] = useState<DepartmentDetail[]>([]);
  const [sections, setSections] = useState<SectionDetail[]>([]);
  const [staffClasses, setStaffClasses] = useState<StaffClassSummary[]>([]);

  const defaultScope: AnnouncementScope =
    user?.role === 'ADMIN'
      ? 'INSTITUTION'
      : user?.role === 'HOD'
      ? 'DEPARTMENT'
      : 'CLASS';

  const [formData, setFormData] = useState<CreateAnnouncementForm>({
    title: '',
    content: '',
    scope: defaultScope,
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchAnnouncements();
    if (user?.role === 'ADMIN') {
      adminService.getDepartments().then(setDepartments).catch(() => {});
      adminService.getSections().then(setSections).catch(() => {});
    } else if (user?.role === 'STAFF') {
      staffService.getAssignedClasses().then(setStaffClasses).catch(() => {});
    }
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await announcementService.getAnnouncements();
      setAnnouncements(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('Title and content are required.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await announcementService.createAnnouncement(formData);
      showToast('Announcement published successfully.', 'success');
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        content: '',
        scope: defaultScope,
      });
      fetchAnnouncements();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to publish announcement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    try {
      await announcementService.deleteAnnouncement(id);
      showToast('Announcement deleted successfully.', 'success');
      fetchAnnouncements();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete announcement', 'error');
    }
  };

  const canPublish = user?.role === 'ADMIN' || user?.role === 'HOD' || user?.role === 'STAFF';

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        action={
          canPublish ? (
            <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Publish Notice
            </Button>
          ) : undefined
        }
      />

      {loading ? (
        <LoadingState message="Loading official campus bulletins..." />
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={<Megaphone className="w-6 h-6 text-slate-400" />}
              title="No Active Bulletins"
              description="No official circulars or announcements have been posted for your cohort."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Card key={a.id} className="hover:border-slate-300 transition-colors">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        a.scope === 'INSTITUTION'
                          ? 'indigo'
                          : a.scope === 'DEPARTMENT'
                          ? 'emerald'
                          : 'amber'
                      }
                    >
                      {a.scope} NOTICE
                    </Badge>
                    {a.departmentCode && (
                      <Badge variant="slate">{a.departmentCode}</Badge>
                    )}
                    {a.sectionName && (
                      <Badge variant="slate">Section {a.sectionName}</Badge>
                    )}
                    {a.subjectCode && (
                      <Badge variant="slate">{a.subjectCode}</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }) : 'Recent'}
                    </div>

                    {(user?.role === 'ADMIN' || a.createdById === user?.id) && (
                      <button
                        onClick={() => handleDeleteAnnouncement(a.id)}
                        className="text-rose-600 hover:text-rose-700 p-1 rounded transition-colors"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <CardTitle className="text-base mt-2">{a.title}</CardTitle>
                <CardDescription>
                  Published by <span className="font-semibold text-slate-700">{a.authorName}</span> ({a.authorRole})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {a.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateModalOpen(false)}
          title="Publish Official Notice"
          description="Broadcast verified institutional, department, or classroom announcements"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateSubmit} isLoading={submitting}>
                Publish Notice
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 text-left">
            <Input
              label="Announcement Title"
              placeholder="e.g. Schedule for Internal Assessment Examination (IAT 2)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            {user?.role === 'ADMIN' && (
              <Select
                label="Target Broadcast Scope"
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value as AnnouncementScope })}
                options={[
                  { value: 'INSTITUTION', label: 'Institution-Wide (All Campus)' },
                  { value: 'DEPARTMENT', label: 'Department Specific' },
                  { value: 'CLASS', label: 'Class / Section Specific' },
                ]}
              />
            )}

            {user?.role === 'HOD' && (
              <Select
                label="Target Broadcast Scope"
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value as AnnouncementScope })}
                options={[
                  { value: 'DEPARTMENT', label: 'Department Broadcast' },
                  { value: 'CLASS', label: 'Specific Section Cohort' },
                ]}
              />
            )}

            {formData.scope === 'DEPARTMENT' && user?.role === 'ADMIN' && (
              <Select
                label="Target Department"
                value={formData.departmentId ? String(formData.departmentId) : ''}
                onChange={(e) => setFormData({ ...formData, departmentId: Number(e.target.value) || undefined })}
                options={[
                  { value: '', label: 'Select Department...' },
                  ...departments.map((d) => ({ value: String(d.id), label: `${d.code} - ${d.name}` })),
                ]}
              />
            )}

            {formData.scope === 'CLASS' && user?.role === 'STAFF' && (
              <Select
                label="Target Teaching Class"
                value={
                  formData.sectionId && formData.subjectId
                    ? `${formData.sectionId}-${formData.subjectId}`
                    : formData.sectionId
                    ? String(formData.sectionId)
                    : ''
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setFormData({ ...formData, sectionId: undefined, subjectId: undefined });
                    return;
                  }
                  const [secId, subId] = val.split('-').map(Number);
                  setFormData({
                    ...formData,
                    sectionId: secId,
                    subjectId: subId || undefined,
                  });
                }}
                options={[
                  { value: '', label: 'Select Assigned Class Cohort...' },
                  ...staffClasses.map((sc) => ({
                    value: `${sc.sectionId}-${sc.subjectId}`,
                    label: `${sc.departmentCode} - Section ${sc.sectionName} • ${sc.subjectCode} (${sc.subjectName})`,
                  })),
                ]}
              />
            )}

            {formData.scope === 'CLASS' && user?.role !== 'STAFF' && (
              <Select
                label="Target Cohort Section"
                value={formData.sectionId ? String(formData.sectionId) : ''}
                onChange={(e) => setFormData({ ...formData, sectionId: Number(e.target.value) || undefined })}
                options={[
                  { value: '', label: 'Select Section...' },
                  ...sections.map((s) => ({ value: String(s.id), label: `${s.departmentCode} - Section ${s.name}` })),
                ]}
              />
            )}

            <Textarea
              label="Announcement Content"
              placeholder="Enter full notice body with circular details, instructions, or deadlines..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              required
            />
          </form>
        </Modal>
      )}
    </div>
  );
};
