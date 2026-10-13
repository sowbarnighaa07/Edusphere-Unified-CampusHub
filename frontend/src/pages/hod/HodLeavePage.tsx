import React, { useState, useEffect } from 'react';
import { hodService } from '../../services/hod.service';
import { HodLeaveReview, LeaveStatus } from '../../types/hod.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { FileClock, CheckCircle, XCircle, Calendar } from 'lucide-react';

export const HodLeavePage: React.FC = () => {
  const [leaves, setLeaves] = useState<HodLeaveReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'ALL'>('ALL');

  // Decision modal state
  const [selectedLeave, setSelectedLeave] = useState<HodLeaveReview | null>(null);
  const [decisionType, setDecisionType] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    loadLeaveRequests();
  }, [statusFilter]);

  const loadLeaveRequests = async () => {
    setLoading(true);
    try {
      const data = await hodService.getDepartmentLeaveRequests(
        statusFilter !== 'ALL' ? { status: statusFilter } : undefined
      );
      setLeaves(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load leave requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDecisionModal = (leave: HodLeaveReview, type: 'APPROVED' | 'REJECTED') => {
    setSelectedLeave(leave);
    setDecisionType(type);
    setRemarks('');
  };

  const handleConfirmDecision = async () => {
    if (!selectedLeave) return;
    setSubmitting(true);
    try {
      await hodService.decideLeaveRequest(selectedLeave.id, {
        status: decisionType,
        remarks: remarks.trim() || undefined,
      });
      showToast(`Leave request ${decisionType.toLowerCase()} successfully.`, 'success');
      setSelectedLeave(null);
      loadLeaveRequests();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to record leave decision', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = leaves.filter((l) => l.status === 'PENDING_HOD').length;

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Student Leave Approvals"
        description="Review and execute final decisions on department student leave applications"
        badge={
          <Badge variant={pendingCount > 0 ? 'amber' : 'emerald'}>
            {pendingCount} Pending Final Decision
          </Badge>
        }
      />

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {(['ALL', 'PENDING_HOD', 'PENDING_STAFF', 'APPROVED', 'REJECTED'] as const).map((st) => (
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
              : st === 'PENDING_HOD'
              ? 'Pending HOD Approval'
              : st === 'PENDING_STAFF'
              ? 'Pending Faculty Review'
              : st}
          </button>
        ))}
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leave Applications</CardTitle>
          <CardDescription>
            Two-tier verified leave workflow: Staff recommendation followed by HOD approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState message="Loading leave applications..." />
          ) : leaves.length === 0 ? (
            <EmptyState
              icon={<FileClock className="w-6 h-6 text-slate-400" />}
              title="No Leave Requests"
              description="No student leave requests found matching the selected filter."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Dates / Duration</TableHead>
                  <TableHead>Reason & Faculty Review</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell className="max-w-xs">
                      <p className="text-xs text-slate-800 line-clamp-2">{l.reason}</p>
                      {l.staffReviewerName && (
                        <p className="text-[11px] text-slate-500 mt-1 italic">
                          Reviewed by {l.staffReviewerName}: "{l.staffRemarks || 'Recommended'}"
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          l.status === 'APPROVED'
                            ? 'emerald'
                            : l.status === 'REJECTED'
                            ? 'rose'
                            : 'amber'
                        }
                      >
                        {l.status === 'PENDING_HOD' ? 'Awaiting Decision' : l.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {l.status === 'PENDING_HOD' || l.status === 'PENDING_STAFF' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleOpenDecisionModal(l, 'APPROVED')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleOpenDecisionModal(l, 'REJECTED')}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 font-medium">
                          {l.hodReviewedAt ? `Decided ${l.hodReviewedAt.substring(0, 10)}` : 'Completed'}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Decision Modal */}
      {selectedLeave && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLeave(null)}
          title={`${decisionType === 'APPROVED' ? 'Approve' : 'Reject'} Leave Request`}
          description={`Student: ${selectedLeave.studentName} (${selectedLeave.registerNumber}) • ${selectedLeave.fromDate} to ${selectedLeave.toDate}`}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedLeave(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant={decisionType === 'APPROVED' ? 'primary' : 'danger'}
                onClick={handleConfirmDecision}
                isLoading={submitting}
              >
                Confirm {decisionType === 'APPROVED' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-left">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <p><span className="font-semibold text-slate-700">Leave Reason:</span> {selectedLeave.reason}</p>
              {selectedLeave.staffReviewerName && (
                <p><span className="font-semibold text-slate-700">Faculty Review:</span> {selectedLeave.staffRemarks || 'Approved for HOD review'}</p>
              )}
            </div>

            <Textarea
              label="HOD Decision Remarks (Optional)"
              placeholder={
                decisionType === 'APPROVED'
                  ? 'e.g. Approved. Ensure missed coursework is submitted.'
                  : 'e.g. Rejected due to insufficient attendance or critical exams.'
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
