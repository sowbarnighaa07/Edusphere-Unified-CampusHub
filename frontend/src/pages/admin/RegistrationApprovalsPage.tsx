import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { RegistrationDetail } from '../../types/admin.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { UserCheck, Check, X, ShieldAlert } from 'lucide-react';

export const RegistrationApprovalsPage = () => {
  const [registrations, setRegistrations] = useState<RegistrationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState<RegistrationDetail | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const { showToast } = useToast();

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPendingRegistrations();
      setRegistrations(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch pending registrations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (reg: RegistrationDetail) => {
    setActionLoadingId(reg.id);
    try {
      await adminService.approveRegistration(reg.id);
      showToast(`Approved registration for ${reg.fullName} (${reg.registerNumber})`, 'success');
      setRegistrations((prev) => prev.filter((r) => r.id !== reg.id));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to approve registration', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    setIsRejecting(true);
    try {
      await adminService.rejectRegistration(rejectTarget.id, rejectRemarks);
      showToast(`Rejected registration for ${rejectTarget.fullName}`, 'info');
      setRegistrations((prev) => prev.filter((r) => r.id !== rejectTarget.id));
      setRejectTarget(null);
      setRejectRemarks('');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to reject registration', 'error');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Student Registration Approvals"
        description="Review and verify pending first-year student enrolment requests."
        badge={
          <Badge variant="amber">
            {registrations.length} Pending
          </Badge>
        }
      />

      {loading ? (
        <LoadingState message="Loading pending registrations..." />
      ) : registrations.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={<UserCheck className="w-6 h-6 text-emerald-500" />}
              title="All Registrations Cleared"
              description="There are currently no student registrations waiting for administrative review."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Register No</TableHead>
                  <TableHead>Student Details</TableHead>
                  <TableHead>Department & Section</TableHead>
                  <TableHead>Academic Intake</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Decision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-semibold text-slate-900">
                      {reg.registerNumber}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-slate-800">{reg.fullName}</p>
                      <p className="text-xs text-slate-500">{reg.email}</p>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-700">{reg.departmentCode}</span>
                      <span className="text-slate-500 ml-1.5 text-xs">Section {reg.sectionName}</span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      Intake {reg.enrollmentYear} (Grad {reg.expectedGraduationYear})
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {reg.submittedAt ? new Date(reg.submittedAt).toLocaleDateString() : 'Recent'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={actionLoadingId === reg.id}
                          onClick={() => handleApprove(reg)}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoadingId === reg.id}
                          onClick={() => setRejectTarget(reg)}
                          className="hover:border-rose-300 hover:text-rose-600"
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Rejection Modal with Remarks */}
      {rejectTarget && (
        <Modal
          isOpen={true}
          onClose={() => setRejectTarget(null)}
          title="Reject Student Registration"
          description={`Provide a reason for rejecting the registration of ${rejectTarget.fullName} (${rejectTarget.registerNumber}).`}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setRejectTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isRejecting}
                onClick={handleRejectConfirm}
              >
                Confirm Rejection
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-left">
            <div className="p-3 bg-amber-50 rounded-md border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Rejecting this application will flag the student account as <strong>REJECTED</strong>. The applicant will not be able to log in.
              </span>
            </div>

            <Textarea
              label="Rejection Reason / Remarks"
              placeholder="e.g. Invalid register number or duplicate enrolment record"
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              rows={3}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
