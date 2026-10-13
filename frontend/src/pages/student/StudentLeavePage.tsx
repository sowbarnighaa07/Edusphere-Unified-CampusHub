import React, { useState, useEffect } from 'react';
import { leaveService } from '../../services/leave.service';
import { LeaveRequestItem, ApplyLeaveForm, LeaveType } from '../../types/leave.types';
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
import { FileClock, Plus, Calendar, Trash2 } from 'lucide-react';

export const StudentLeavePage: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<ApplyLeaveForm>({
    leaveType: 'MEDICAL',
    fromDate: '',
    toDate: '',
    reason: '',
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await leaveService.getMyLeaves();
      setLeaves(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load leave applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fromDate || !formData.toDate || !formData.reason.trim()) {
      showToast('Please fill all required fields.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await leaveService.applyLeave(formData);
      showToast('Leave request submitted successfully. Awaiting faculty review.', 'success');
      setIsApplyModalOpen(false);
      setFormData({
        leaveType: 'MEDICAL',
        fromDate: '',
        toDate: '',
        reason: '',
      });
      fetchLeaves();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to submit leave request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLeave = async (id: number) => {
    try {
      await leaveService.cancelLeave(id);
      showToast('Leave request cancelled successfully.', 'success');
      fetchLeaves();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to cancel leave request', 'error');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="My Leave Applications"
        description="Submit official leave applications and track multi-stage verification status"
        action={
          <Button onClick={() => setIsApplyModalOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Apply for Leave
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leave Application History</CardTitle>
          <CardDescription>
            Two-tier approval pipeline: Verified by Class Advisor / Faculty $\rightarrow$ Approved by HOD
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState message="Loading your leave applications..." />
          ) : leaves.length === 0 ? (
            <EmptyState
              icon={<FileClock className="w-6 h-6 text-slate-400" />}
              title="No Leave Applications"
              description="You have not submitted any leave applications yet."
              action={
                <Button size="sm" onClick={() => setIsApplyModalOpen(true)}>
                  Apply for Leave
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates / Duration</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Faculty Review</TableHead>
                  <TableHead>HOD Approval</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <Badge variant="slate">{l.leaveType}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {l.fromDate} to {l.toDate}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-800 max-w-xs truncate" title={l.reason}>
                      {l.reason}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {l.staffReviewerName ? (
                        <div>
                          <p className="font-semibold text-slate-800">{l.staffReviewerName}</p>
                          <p className="text-[11px] text-slate-500 italic">{l.staffRemarks || 'Recommended'}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pending review</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {l.hodReviewerName ? (
                        <div>
                          <p className="font-semibold text-slate-800">{l.hodReviewerName}</p>
                          <p className="text-[11px] text-slate-500 italic">{l.hodRemarks || 'Approved'}</p>
                        </div>
                      ) : l.status === 'REJECTED' ? (
                        <span className="text-rose-600 italic">Not applicable</span>
                      ) : (
                        <span className="text-slate-400 italic">Awaiting HOD</span>
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
                        {l.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {l.status === 'PENDING_STAFF' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancelLeave(l.id)}
                          title="Cancel Application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsApplyModalOpen(false)}
          title="Apply for Student Leave"
          description="Submit an official leave request for verification by your department"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsApplyModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleApplySubmit} isLoading={submitting}>
                Submit Application
              </Button>
            </div>
          }
        >
          <form onSubmit={handleApplySubmit} className="space-y-4 text-left">
            <Select
              label="Leave Type"
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as LeaveType })}
              options={[
                { value: 'MEDICAL', label: 'Medical Leave' },
                { value: 'ON_DUTY', label: 'On Duty (OD) / Event' },
                { value: 'PERSONAL', label: 'Personal / Urgent Work' },
                { value: 'FAMILY', label: 'Family Function' },
              ]}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="From Date"
                type="date"
                value={formData.fromDate}
                onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                required
              />
              <Input
                label="To Date"
                type="date"
                value={formData.toDate}
                onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                required
              />
            </div>

            <Textarea
              label="Reason for Leave"
              placeholder="State the detailed reason for your absence..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              required
            />

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Supporting Document / Medical Certificate (Optional)
              </label>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFormData({ ...formData, attachment: e.target.files[0] });
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
