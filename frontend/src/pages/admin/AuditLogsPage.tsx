import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { AuditLogItem } from '../../types/admin.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { ShieldCheck, Activity, Search, Filter, RotateCcw, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filter state
  const [selectedRole, setSelectedRole] = useState('');
  const [actionQuery, setActionQuery] = useState('');
  const [ipQuery, setIpQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Detail Modal state
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const { showToast } = useToast();

  const fetchLogs = async (currentPage = page) => {
    setLoading(true);
    try {
      const pagedResult = await adminService.getAuditLogs({
        role: selectedRole || undefined,
        action: actionQuery.trim() || undefined,
        ipAddress: ipQuery.trim() || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        page: currentPage,
        size,
      });
      setLogs(pagedResult.content);
      setPage(pagedResult.page);
      setTotalPages(pagedResult.totalPages);
      setTotalElements(pagedResult.totalElements);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(0);
  }, [selectedRole, size]);

  const handleApplyFilter = () => {
    setPage(0);
    fetchLogs(0);
  };

  const handleClearFilters = () => {
    setSelectedRole('');
    setActionQuery('');
    setIpQuery('');
    setFromDate('');
    setToDate('');
    setPage(0);
    fetchLogs(0);
  };

  const formatDetailsJson = (details: string) => {
    if (!details) return null;
    try {
      const parsed = JSON.parse(details);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return details;
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Institutional Security & Audit Trail"
        description="Immutable chronological activity log of administrative decisions, account provisioning, and system mutations"
        badge={
          <Badge variant="indigo">
            <Activity className="w-3 h-3 mr-1" />
            {totalElements} Recorded Events
          </Badge>
        }
      />

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-brand-600" />
            Audit Filter Parameters
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Select
              label="Actor Role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              options={[
                { value: '', label: 'All Roles' },
                { value: 'ADMIN', label: 'Administrator' },
                { value: 'HOD', label: 'Head of Department' },
                { value: 'STAFF', label: 'Faculty / Staff' },
                { value: 'STUDENT', label: 'Student' },
              ]}
            />

            <Input
              label="Action Type"
              placeholder="e.g. APPROVE_REGISTRATION"
              value={actionQuery}
              onChange={(e) => setActionQuery(e.target.value)}
            />

            <Input
              label="IP Address"
              placeholder="e.g. 127.0.0.1"
              value={ipQuery}
              onChange={(e) => setIpQuery(e.target.value)}
            />

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-500 font-medium">
              Showing page {page + 1} of {Math.max(1, totalPages)} ({totalElements} total logs)
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
              <Button size="sm" onClick={handleApplyFilter}>
                <Search className="w-3.5 h-3.5 mr-1" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingState message="Loading security audit records..." />
          ) : logs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<ShieldCheck className="w-6 h-6 text-slate-400" />}
                title="No Audit Records Found"
                description="No log events match your selected search criteria."
                action={
                  <Button variant="outline" size="sm" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actor / User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target Resource</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead className="text-right">Inspection</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/80 cursor-pointer" onClick={() => setSelectedLog(log)}>
                      <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN') : 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900 text-xs">
                        {log.userEmail}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.userRole === 'ADMIN'
                              ? 'indigo'
                              : log.userRole === 'HOD'
                              ? 'emerald'
                              : log.userRole === 'STAFF'
                              ? 'amber'
                              : 'slate'
                          }
                          className="text-[10px]"
                        >
                          {log.userRole || 'SYSTEM'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 font-mono">
                        {log.targetResource}:{log.targetId || 'N/A'}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {log.ipAddress || '127.0.0.1'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 text-brand-600 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Page size:</span>
                  <select
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="text-xs rounded border border-slate-300 px-2 py-1 bg-white text-slate-700"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => {
                      const prev = page - 1;
                      setPage(prev);
                      fetchLogs(prev);
                    }}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  <span className="text-xs font-medium text-slate-700">
                    {page + 1} / {Math.max(1, totalPages)}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => {
                      const next = page + 1;
                      setPage(next);
                      fetchLogs(next);
                    }}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Inspection Modal */}
      {selectedLog && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title={`Audit Event #${selectedLog.id} – ${selectedLog.action}`}
          description={`Logged on ${selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString('en-IN') : 'N/A'}`}
          maxWidth="lg"
          footer={
            <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-500">Actor Email</p>
                <p className="font-semibold text-slate-900 mt-0.5">{selectedLog.userEmail}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-500">Role & User ID</p>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {selectedLog.userRole || 'SYSTEM'} {selectedLog.userId ? `(ID: ${selectedLog.userId})` : ''}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-500">Target Resource</p>
                <p className="font-mono font-semibold text-slate-900 mt-0.5">
                  {selectedLog.targetResource}:{selectedLog.targetId || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-500">IP Address</p>
                <p className="font-mono font-semibold text-slate-900 mt-0.5">{selectedLog.ipAddress || '127.0.0.1'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-700 mb-1.5">Action Details / Metadata Payload:</p>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-auto max-h-60 leading-relaxed whitespace-pre-wrap">
                {formatDetailsJson(selectedLog.details) || 'No additional details logged.'}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
