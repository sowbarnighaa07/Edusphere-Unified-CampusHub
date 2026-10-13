import React, { useState, useEffect } from 'react';
import { leaveService } from '../../services/leave.service';
import { LeaveRequestItem, StaffLeaveReviewForm, LeaveStatus } from '../../types/leave.types';
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
import { FileClock, CheckCircle, XCircle, Calendar } from 'lucide-react';

export const StaffLeavePage: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'ALL'>('ALL');

  // Review Modal state
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequestItem | null>(null);
  const [decisionType, setDecisionType] = useState<'PENDING_HOD' | 'REJECTED'>('PENDING_HOD');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await leaveService.getStaffAssignedLeaves(
        statusFilter !== 'ALL' ? statusFilter : undefined
      );
      setLeaves(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load assigned leave requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewModal = (leave: LeaveRequestItem, type: 'PENDING_HOD' | 'REJECTED') => {
    setSelectedLeave(leave);
    setDecisionType(type);
    setRemarks('');
  };

  const handleConfirmReview = async () => {
    if (!selectedLeave) return;
    setSubmitting(true);
    try {
      const reviewForm: StaffLeaveReviewForm = {
        status: decisionType,
        remarks: remarks.trim() || undefined,
      };
      await leaveService.reviewLeaveStage1(selectedLeave.id, reviewForm);
      showToast(
        decisionType === 'PENDING_HOD'
          ? 'Leave application recommended and forwarded to HOD.'
          : 'Leave application rejected.',
        'success'
      );
      setSelectedLeave(null);
      fetchLeaves();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to record stage-1 review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = leaves.filter((l) => l.status === 'PENDING_STAFF').length;

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Student Leave Stage-1 Verification"
        description="Review leave requests submitted by students in your assigned teaching cohorts and forward recommendations to HOD"
        badge={
          <Badge variant={pendingCount > 0 ? 'amber' : 'emerald'}>
            {pendingCount} Pending Verification
          </Badge>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {(['ALL', 'PENDING_STAFF', 'PENDING_HOD', 'APPROVED', 'REJECTED'] as const).map((st) => (
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
              ? 'All Requests'
              : st === 'PENDING_STAFF'
              ? 'Awaiting Faculty Verification'
              : st === 'PENDING_HOD'
              ? 'Forwarded to HOD'
              : st}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assigned Cohort Leave Applications</CardTitle>
          <CardDescription>
            Stage-1 verification: Ensure attendance criteria and coursework requirements are met
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState message="Loading cohort leave requests..." />
          ) : leaves.length === 0 ? (
            <EmptyState
              icon={<FileClock className="w-6 h-6 text-slate-400" />}
              title="No Leave Requests"
              description="No student leave applications match the selected filter."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <p className="font-semibold text-slate-900 text-sm">{l.studentName}</p>
                      <p className="text-xs font-mono text-slate-500">
                        {l.registerNumber} • Sec {l.sectionName}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="slate">{l.leaveType}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">
                      <div className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {l.fromDate} to {l.toDate}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-800 max-w-xs truncate" title={l.reason}>
                      {l.reason}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          l.status === 'APPROVED'
                            ? 'emerald'
                            : l.status === 'REJECTED'
                            ? 'rose'
                            : l.status === 'PENDING_HOD'
                            ? 'indigo'
                            : 'amber'
                        }
                      >
                        {l.status === 'PENDING_STAFF' ? 'Needs Your Review' : l.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {l.status === 'PENDING_STAFF' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleOpenReviewModal(l, 'PENDING_HOD')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Recommend
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleOpenReviewModal(l, 'REJECTED')}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          {l.staffReviewedAt ? `Reviewed ${l.staffReviewedAt.substring(0, 10)}` : 'Processed'}
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

      {/* Review Modal */}
      {selectedLeave && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLeave(null)}
          title={`${decisionType === 'PENDING_HOD' ? 'Recommend' : 'Reject'} Leave Application`}
          description={`Student: ${selectedLeave.studentName} (${selectedLeave.registerNumber}) • ${selectedLeave.fromDate} to ${selectedLeave.toDate}`}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedLeave(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant={decisionType === 'PENDING_HOD' ? 'primary' : 'danger'}
                onClick={handleConfirmReview}
                isLoading={submitting}
              >
                Confirm {decisionType === 'PENDING_HOD' ? 'Recommendation' : 'Rejection'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-left">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <p><span className="font-semibold text-slate-700">Reason:</span> {selectedLeave.reason}</p>
            </div>

            <Textarea
              label="Faculty Verification Remarks (Optional)"
              placeholder={
                decisionType === 'PENDING_HOD'
                  ? 'e.g. Recommended for approval. Internal attendance is satisfactory.'
                  : 'e.g. Rejected due to critical laboratory session or exam.'
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
