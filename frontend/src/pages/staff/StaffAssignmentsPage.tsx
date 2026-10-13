import { useState, useEffect } from 'react';
import { staffService } from '../../services/staff.service';
import { StaffClassSummary, StaffAssignment } from '../../types/staff.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { ClipboardList, Plus, Trash2, BookOpen, AlertTriangle, Calendar } from 'lucide-react';

export const StaffAssignmentsPage = () => {
  const [classes, setClasses] = useState<StaffClassSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaId, setSelectedTaId] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<StaffAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formMaxMarks, setFormMaxMarks] = useState('100');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  // Delete
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    staffService.getAssignedClasses()
      .then(setClasses)
      .catch(() => showToast('Failed to load classes', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectClass = async (taId: number) => {
    setSelectedTaId(taId);
    setAssignments([]);
    setLoadingAssignments(true);
    try {
      const data = await staffService.getAssignments(taId);
      setAssignments(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load assignments', 'error');
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleCreate = async () => {
    if (!formTitle.trim() || !formDeadline || !formMaxMarks || selectedTaId === null) {
      showToast('Title, deadline, and max marks are required.', 'error');
      return;
    }
    const marks = parseFloat(formMaxMarks);
    if (isNaN(marks) || marks <= 0) {
      showToast('Max marks must be a positive number.', 'error');
      return;
    }
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('teachingAssignmentId', String(selectedTaId));
      formData.append('title', formTitle.trim());
      if (formDescription.trim()) formData.append('description', formDescription.trim());
      // Convert local datetime to ISO (no Z — backend expects LocalDateTime)
      formData.append('deadline', formDeadline.replace('T', 'T').padEnd(19, ':00').substring(0, 19));
      formData.append('maxMarks', formMaxMarks);
      if (formFile) formData.append('file', formFile);

      const created = await staffService.createAssignment(formData);
      setAssignments(prev => [...prev, created].sort(
        (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      ));
      setCreateOpen(false);
      resetForm();
      showToast('Assignment created successfully.', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create assignment.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await staffService.deleteAssignment(id);
      setAssignments(prev => prev.filter(a => a.id !== id));
      showToast('Assignment deleted.', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Delete failed.', 'error');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormDeadline('');
    setFormMaxMarks('100');
    setFormFile(null);
  };

  const isPastDeadline = (deadline: string) => new Date(deadline) < new Date();

  if (loading) return <LoadingState message="Loading assigned classes..." />;

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Assignment Management"
        description="Create coursework assignments with deadlines and evaluate student submissions."
        badge={
          selectedTaId && assignments.length > 0
            ? <Badge variant="indigo">{assignments.length} Assignments</Badge>
            : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class selector */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">Select a Class</p>
          {classes.length === 0 ? (
            <Card><CardContent className="p-6">
              <EmptyState icon={<BookOpen className="w-5 h-5 text-slate-400" />} title="No Classes Assigned" description="No teaching assignments found." />
            </CardContent></Card>
          ) : (
            classes.map(cls => (
              <button
                key={cls.teachingAssignmentId}
                onClick={() => handleSelectClass(cls.teachingAssignmentId)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-150 ${
                  selectedTaId === cls.teachingAssignmentId
                    ? 'border-brand-500 bg-brand-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-slate-900 text-sm">{cls.subjectCode}</span>
                  <Badge variant="slate">{cls.credits} Cr</Badge>
                </div>
                <p className="text-xs text-slate-600 font-medium truncate">{cls.subjectName}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {cls.departmentCode} • Sec {cls.sectionName} • Sem {cls.semester}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Assignments panel */}
        <div className="lg:col-span-2 space-y-4">
          {selectedTaId === null ? (
            <Card><CardContent className="p-12">
              <EmptyState
                icon={<ClipboardList className="w-6 h-6 text-slate-400" />}
                title="Select a Class"
                description="Choose a class from the left to manage its assignments."
              />
            </CardContent></Card>
          ) : loadingAssignments ? (
            <LoadingState message="Loading assignments..." />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Coursework Assignments</CardTitle>
                    <CardDescription>
                      {assignments.length === 0 ? 'No assignments created yet.' : `${assignments.length} assignment${assignments.length > 1 ? 's' : ''} created`}
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    New Assignment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <EmptyState
                    icon={<ClipboardList className="w-5 h-5 text-slate-400" />}
                    title="No Assignments Yet"
                    description="Create your first assignment for this class."
                    action={
                      <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Create Assignment
                      </Button>
                    }
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Max Marks</TableHead>
                        <TableHead>Submissions</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map(a => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <p className="font-medium text-slate-900 text-sm">{a.title}</p>
                            {a.description && (
                              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{a.description}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className={`text-xs font-medium ${isPastDeadline(a.deadline) ? 'text-rose-600' : 'text-slate-700'}`}>
                                {new Date(a.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            {isPastDeadline(a.deadline) && (
                              <Badge variant="rose" className="mt-1 text-[10px]">Closed</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono font-bold text-slate-900 text-sm">{a.maxMarks}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="slate">{a.submissionCount} submitted</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDeleteId(a.id)}
                              disabled={deletingId === a.id}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Assignment Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => { setCreateOpen(false); resetForm(); }}
        title="Create New Assignment"
        description="Define a coursework assignment with a deadline and maximum marks."
        maxWidth="lg"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => { setCreateOpen(false); resetForm(); }} disabled={creating}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} isLoading={creating}>Create Assignment</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Assignment Title"
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
            placeholder="e.g. Mini Project – ER Diagram Submission"
          />
          <Textarea
            label="Instructions / Description (Optional)"
            value={formDescription}
            onChange={e => setFormDescription(e.target.value)}
            placeholder="Provide instructions, submission format, or evaluation criteria..."
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Deadline</label>
              <input
                type="datetime-local"
                value={formDeadline}
                onChange={e => setFormDeadline(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>
            <Input
              label="Max Marks"
              type="number"
              value={formMaxMarks}
              onChange={e => setFormMaxMarks(e.target.value)}
              placeholder="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Attachment (Optional)</label>
            <input
              type="file"
              onChange={e => setFormFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer border border-slate-200 rounded-lg p-2"
            />
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title="Delete Assignment"
        description="This will permanently remove the assignment and all associated data."
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)} isLoading={deletingId !== null}>
              Delete Assignment
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-lg border border-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700">
            Deleting this assignment is irreversible. All submission records linked to it will also be removed.
          </p>
        </div>
      </Modal>
    </div>
  );
};
