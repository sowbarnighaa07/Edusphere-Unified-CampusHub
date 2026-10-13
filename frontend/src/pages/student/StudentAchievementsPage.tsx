import React, { useState, useEffect } from 'react';
import { achievementService } from '../../services/achievement.service';
import { AchievementItem, SubmitAchievementForm, AchievementCategory } from '../../types/achievement.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { Award, Plus, CheckCircle, ShieldCheck } from 'lucide-react';

export const StudentAchievementsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MY_ACHIEVEMENTS' | 'CAMPUS_SHOWCASE'>('MY_ACHIEVEMENTS');
  const [myAchievements, setMyAchievements] = useState<AchievementItem[]>([]);
  const [showcase, setShowcase] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Submit modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<SubmitAchievementForm>({
    category: 'COMPETITION',
    title: '',
    description: '',
    achievementDate: '',
  });

  const { showToast } = useToast();

  useEffect(() => {
    if (activeTab === 'MY_ACHIEVEMENTS') {
      loadMyAchievements();
    } else {
      loadCampusShowcase();
    }
  }, [activeTab]);

  const loadMyAchievements = async () => {
    setLoading(true);
    try {
      const data = await achievementService.getMyAchievements();
      setMyAchievements(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load achievements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCampusShowcase = async () => {
    setLoading(true);
    try {
      const data = await achievementService.getVerifiedAchievements();
      setShowcase(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load verified showcase', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.achievementDate) {
      showToast('Please fill all required fields.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await achievementService.submitAchievement(formData);
      showToast('Achievement submitted! Awaiting faculty verification.', 'success');
      setIsSubmitModalOpen(false);
      setFormData({
        category: 'COMPETITION',
        title: '',
        description: '',
        achievementDate: '',
      });
      loadMyAchievements();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to submit achievement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Student Achievements & Honors"
        description="Official student extracurricular, hackathon, sports, and technical achievement records"
        action={
          <Button onClick={() => setIsSubmitModalOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Achievement
          </Button>
        }
      />

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('MY_ACHIEVEMENTS')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'MY_ACHIEVEMENTS'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          My Portfolio ({myAchievements.length})
        </button>
        <button
          onClick={() => setActiveTab('CAMPUS_SHOWCASE')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'CAMPUS_SHOWCASE'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Campus Verified Showcase
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading student achievement records..." />
      ) : activeTab === 'MY_ACHIEVEMENTS' ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Submitted Accomplishments</CardTitle>
            <CardDescription>
              Achievements verified by department faculty are showcased across the institution
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myAchievements.length === 0 ? (
              <EmptyState
                icon={<Award className="w-6 h-6 text-slate-400" />}
                title="No Achievements Logged"
                description="Showcase your hackathon wins, certifications, sports medals, and academic distinctions."
                action={
                  <Button size="sm" onClick={() => setIsSubmitModalOpen(true)}>
                    Add Achievement
                  </Button>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Title & Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Verification Status</TableHead>
                    <TableHead className="text-right">Faculty Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myAchievements.map((ach) => (
                    <TableRow key={ach.id}>
                      <TableCell>
                        <Badge variant="indigo">{ach.category}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="font-semibold text-slate-900 text-sm">{ach.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{ach.description}</p>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 font-mono">
                        {ach.achievementDate}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ach.status === 'VERIFIED'
                              ? 'emerald'
                              : ach.status === 'REJECTED'
                              ? 'rose'
                              : 'amber'
                          }
                        >
                          {ach.status === 'VERIFIED' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {ach.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-600">
                        {ach.verifiedByName ? (
                          <div>
                            <p className="font-semibold text-slate-800">{ach.verifiedByName}</p>
                            <p className="text-[11px] text-slate-500 italic">{ach.remarks || 'Verified'}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Pending faculty review</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {showcase.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <EmptyState
                  icon={<Award className="w-6 h-6 text-slate-400" />}
                  title="No Verified Achievements Yet"
                  description="Campus-wide student distinctions will appear here once verified by department faculty."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showcase.map((ach) => (
                <Card key={ach.id} className="hover:border-slate-300 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="indigo">{ach.category}</Badge>
                      <span className="text-xs text-slate-500 font-mono">{ach.achievementDate}</span>
                    </div>
                    <CardTitle className="text-base mt-2">{ach.title}</CardTitle>
                    <CardDescription>
                      {ach.studentName} ({ach.studentRegisterNumber}) • {ach.departmentCode} Sec {ach.sectionName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-700 leading-relaxed mb-3">{ach.description}</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-emerald-700 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified by {ach.verifiedByName}
                      </span>
                      <span>{ach.verifiedAt ? new Date(ach.verifiedAt).toLocaleDateString() : ''}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Achievement Modal */}
      {isSubmitModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsSubmitModalOpen(false)}
          title="Log Student Achievement"
          description="Submit an extracurricular honor or certification for official department verification"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsSubmitModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmitAchievement} isLoading={submitting}>
                Submit Achievement
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSubmitAchievement} className="space-y-4 text-left">
            <Select
              label="Achievement Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as AchievementCategory })}
              options={[
                { value: 'COMPETITION', label: 'Hackathon / Coding Contest / Technical Presentation' },
                { value: 'ACADEMIC', label: 'Academic Distinction / Research Paper' },
                { value: 'CERTIFICATION', label: 'Professional Certification / MOOC' },
                { value: 'SPORTS', label: 'Sports & Athletics' },
                { value: 'NCC', label: 'NCC / NSS / Social Service' },
                { value: 'OTHER', label: 'Other Extra-Curricular' },
              ]}
            />

            <Input
              label="Title / Honor"
              placeholder="e.g. 1st Place - National Smart India Hackathon 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <Input
              label="Date of Achievement"
              type="date"
              value={formData.achievementDate}
              onChange={(e) => setFormData({ ...formData, achievementDate: e.target.value })}
              required
            />

            <Textarea
              label="Description & Highlights"
              placeholder="Detail the event, organizers, project title, and distinction..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Certificate / Proof Attachment (Optional)
              </label>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFormData({ ...formData, certificate: e.target.files[0] });
                  }
                }}
                className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
