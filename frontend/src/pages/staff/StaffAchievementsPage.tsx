import React, { useState, useEffect } from 'react';
import { achievementService } from '../../services/achievement.service';
import { AchievementItem, VerifyAchievementForm, AchievementStatus } from '../../types/achievement.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { Award, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';

export const StaffAchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AchievementStatus | 'ALL'>('ALL');

  // Verify Modal
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementItem | null>(null);
  const [verifyType, setVerifyType] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    loadAchievements();
  }, [statusFilter]);

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const data = await achievementService.getDepartmentAchievements(
        statusFilter !== 'ALL' ? statusFilter : undefined
      );
      setAchievements(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load student achievements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVerifyModal = (achievement: AchievementItem, type: 'VERIFIED' | 'REJECTED') => {
    setSelectedAchievement(achievement);
    setVerifyType(type);
    setRemarks('');
  };

  const handleConfirmVerify = async () => {
    if (!selectedAchievement) return;
    setSubmitting(true);
    try {
      const form: VerifyAchievementForm = {
        status: verifyType,
        remarks: remarks.trim() || undefined,
      };
      await achievementService.verifyAchievement(selectedAchievement.id, form);
      showToast(
        verifyType === 'VERIFIED'
          ? 'Achievement verified and published to Campus Showcase.'
          : 'Achievement rejected.',
        'success'
      );
      setSelectedAchievement(null);
      loadAchievements();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update achievement status', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = achievements.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Student Achievement Verification"
        description="Verify and endorse extracurricular accomplishments and certifications submitted by department students"
        badge={
          <Badge variant={pendingCount > 0 ? 'amber' : 'emerald'}>
            {pendingCount} Pending Verification
          </Badge>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === st
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {st === 'ALL'
              ? 'All Records'
              : st === 'PENDING'
              ? 'Pending Endorsement'
              : st === 'VERIFIED'
              ? 'Verified & Published'
              : st}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Department Student Honors</CardTitle>
          <CardDescription>
            Verified achievements appear on student portfolios and institutional distinction reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState message="Loading student achievements..." />
          ) : achievements.length === 0 ? (
            <EmptyState
              icon={<Award className="w-6 h-6 text-slate-400" />}
              title="No Achievements"
              description="No student achievement submissions match your selected filter."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Honor / Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {achievements.map((ach) => (
                  <TableRow key={ach.id}>
                    <TableCell>
                      <p className="font-semibold text-slate-900 text-sm">{ach.studentName}</p>
                      <p className="text-xs font-mono text-slate-500">
                        {ach.studentRegisterNumber} • Sec {ach.sectionName}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="indigo">{ach.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="font-semibold text-slate-800 text-xs">{ach.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{ach.description}</p>
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
                        {ach.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {ach.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleOpenVerifyModal(ach, 'VERIFIED')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleOpenVerifyModal(ach, 'REJECTED')}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 flex items-center justify-end gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          {ach.verifiedByName || 'Processed'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Verification Modal */}
      {selectedAchievement && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAchievement(null)}
          title={`${verifyType === 'VERIFIED' ? 'Verify & Endorse' : 'Reject'} Student Achievement`}
          description={`Student: ${selectedAchievement.studentName} (${selectedAchievement.studentRegisterNumber}) • ${selectedAchievement.title}`}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedAchievement(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant={verifyType === 'VERIFIED' ? 'primary' : 'danger'}
                onClick={handleConfirmVerify}
                isLoading={submitting}
              >
                Confirm {verifyType === 'VERIFIED' ? 'Verification' : 'Rejection'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-left">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <p><span className="font-semibold text-slate-700">Category:</span> {selectedAchievement.category}</p>
              <p><span className="font-semibold text-slate-700">Details:</span> {selectedAchievement.description}</p>
            </div>

            <Textarea
              label="Endorsement Remarks (Optional)"
              placeholder={
                verifyType === 'VERIFIED'
                  ? 'e.g. Verified with certificate proof. Excellent accomplishment!'
                  : 'e.g. Insufficient proof or invalid certificate attachment.'
              }
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
