import { useState, useEffect } from 'react';
import { studentService } from '../../services/student.service';
import { StudentAssignment } from '../../types/student.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import {
  ClipboardList,
  Calendar,
  Download,
  Upload,
  User,
  Mail,
  CheckCircle2,
  Clock,
  Award,
  FileText,
  AlertTriangle,
  Send,
  MessageSquare,
} from 'lucide-react';

export const StudentAssignmentsPage = () => {
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'EVALUATED'>('ALL');

  // Submission Form State
  const [submitRemarks, setSubmitRemarks] = useState('');
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [downloadingAttachment, setDownloadingAttachment] = useState(false);
  const [downloadingSubmission, setDownloadingSubmission] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await studentService.getAssignments();
      setAssignments(data);
      if (data.length > 0 && selectedId === null) {
        setSelectedId(data[0].id);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load coursework assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAssignment = (assignmentId: number) => {
    setSelectedId(assignmentId);
    setSubmitRemarks('');
    setSubmitFile(null);
  };

  const handleSubmit = async () => {
    if (!selectedId) return;
    if (!submitFile && !submitRemarks.trim()) {
      showToast('Please provide a submission file or enter remarks.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (submitRemarks.trim()) {
        formData.append('remarks', submitRemarks.trim());
      }
      if (submitFile) {
        formData.append('file', submitFile);
      }

      await studentService.submitAssignment(selectedId, formData);
      showToast('Assignment submitted successfully!', 'success');
      
      // Refresh assignment list to obtain updated backend state
      const updatedList = await studentService.getAssignments();
      setAssignments(updatedList);
      setSubmitRemarks('');
      setSubmitFile(null);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Submission failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadAttachment = async (assignment: StudentAssignment) => {
    if (!assignment.attachmentPath) return;
    setDownloadingAttachment(true);
    try {
      const fileName = assignment.attachmentName || `assignment_${assignment.id}_brief.pdf`;
      await studentService.downloadAssignmentAttachment(assignment.id, fileName);
      showToast(`Downloading ${fileName}`, 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Attachment download failed.', 'error');
    } finally {
      setDownloadingAttachment(false);
    }
  };

  const handleDownloadSubmission = async (assignment: StudentAssignment) => {
    if (!assignment.submissionId) return;
    setDownloadingSubmission(true);
    try {
      const fileName = assignment.submissionFileName || `my_submission_${assignment.id}.pdf`;
      await studentService.downloadStudentSubmission(assignment.id, fileName);
      showToast(`Downloading ${fileName}`, 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Submission download failed.', 'error');
    } finally {
      setDownloadingSubmission(false);
    }
  };

  const isPastDeadline = (deadline: string) => new Date(deadline) < new Date();

  const filteredAssignments = assignments.filter((a) => {
    if (activeFilter === 'PENDING') return !a.isSubmitted;
    if (activeFilter === 'SUBMITTED') return a.isSubmitted && !a.isEvaluated;
    if (activeFilter === 'EVALUATED') return a.isEvaluated;
    return true;
  });

  const selectedAssignment = assignments.find((a) => a.id === selectedId);

  // Statistics
  const totalCount = assignments.length;
  const pendingCount = assignments.filter((a) => !a.isSubmitted).length;
  const submittedCount = assignments.filter((a) => a.isSubmitted && !a.isEvaluated).length;
  const evaluatedCount = assignments.filter((a) => a.isEvaluated).length;

  if (loading) return <LoadingState message="Loading your coursework assignments..." />;

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Coursework Assignments"
        description="Review assigned problem sets, download briefs, submit your coursework, and view faculty grades & feedback."
        badge={
          <Badge variant="indigo">
            {totalCount} Total {totalCount === 1 ? 'Assignment' : 'Assignments'}
          </Badge>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{totalCount}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Pending</p>
                <p className="text-xl font-bold text-amber-600 mt-0.5">{pendingCount}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Submitted</p>
                <p className="text-xl font-bold text-brand-600 mt-0.5">{submittedCount}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Evaluated</p>
                <p className="text-xl font-bold text-emerald-600 mt-0.5">{evaluatedCount}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Award className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={<ClipboardList className="w-8 h-8 text-slate-400" />}
              title="No Coursework Assignments"
              description="No coursework assignments are currently scheduled for your enrolled subjects."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment Selector Sidebar */}
          <div className="space-y-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`flex-1 py-1.5 rounded-md transition-all ${
                  activeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'hover:text-slate-900'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setActiveFilter('PENDING')}
                className={`flex-1 py-1.5 rounded-md transition-all ${
                  activeFilter === 'PENDING' ? 'bg-white text-amber-700 shadow-sm font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setActiveFilter('EVALUATED')}
                className={`flex-1 py-1.5 rounded-md transition-all ${
                  activeFilter === 'EVALUATED' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Graded ({evaluatedCount})
              </button>
            </div>

            {/* List */}
            <div className="space-y-2.5">
              {filteredAssignments.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                  No assignments match the selected filter.
                </div>
              ) : (
                filteredAssignments.map((a) => {
                  const isSelected = selectedId === a.id;
                  const pastDue = isPastDeadline(a.deadline);

                  return (
                    <button
                      key={a.id}
                      onClick={() => handleSelectAssignment(a.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-150 ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50 shadow-sm ring-1 ring-brand-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {a.subjectCode}
                        </span>
                        <div>
                          {a.isEvaluated ? (
                            <Badge variant="emerald">Graded: {a.marksObtained}/{a.maxMarks}</Badge>
                          ) : a.isSubmitted ? (
                            <Badge variant="indigo">Submitted</Badge>
                          ) : pastDue ? (
                            <Badge variant="rose">Overdue</Badge>
                          ) : (
                            <Badge variant="amber">Due Soon</Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-xs font-semibold text-slate-800 line-clamp-1 mb-1">
                        {a.title}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                        <div className="flex items-center gap-1 truncate max-w-[150px]">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{a.facultyName}</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-[10px]">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{new Date(a.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Assignment Details & Submission Panel */}
          <div className="lg:col-span-2 space-y-4">
            {selectedAssignment ? (
              <>
                {/* Header & Overview Card */}
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                            {selectedAssignment.subjectCode}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {selectedAssignment.subjectName}
                          </span>
                        </div>
                        <CardTitle className="text-lg font-bold text-slate-900">
                          {selectedAssignment.title}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500 mt-1">
                          {selectedAssignment.departmentCode} • Section {selectedAssignment.sectionName} • Semester {selectedAssignment.semester}
                        </CardDescription>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5">
                        <Badge variant="slate" className="font-mono">
                          Max Marks: {selectedAssignment.maxMarks}
                        </Badge>
                        {selectedAssignment.isEvaluated ? (
                          <Badge variant="emerald">
                            Score: {selectedAssignment.marksObtained} / {selectedAssignment.maxMarks}
                          </Badge>
                        ) : selectedAssignment.isSubmitted ? (
                          <Badge variant="indigo">Submitted</Badge>
                        ) : isPastDeadline(selectedAssignment.deadline) ? (
                          <Badge variant="rose">Past Deadline</Badge>
                        ) : (
                          <Badge variant="amber">Pending Submission</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    {/* Instructions / Description */}
                    {selectedAssignment.description && (
                      <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200/80">
                        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                          Instructions & Evaluation Criteria
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                          {selectedAssignment.description}
                        </p>
                      </div>
                    )}

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {/* Deadline Box */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium">Due Date</span>
                        </div>
                        <p className={`font-semibold ${isPastDeadline(selectedAssignment.deadline) ? 'text-rose-600' : 'text-slate-900'}`}>
                          {new Date(selectedAssignment.deadline).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {/* Faculty Info Box */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 sm:col-span-2">
                        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium">Assigned Faculty</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-900 truncate">
                            {selectedAssignment.facultyName}
                          </span>
                          <a
                            href={`mailto:${selectedAssignment.facultyEmail}`}
                            className="inline-flex items-center gap-1 text-[11px] text-brand-600 hover:underline shrink-0"
                          >
                            <Mail className="w-3 h-3" />
                            {selectedAssignment.facultyEmail}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Assignment Attachment Download (if faculty provided a brief) */}
                    {selectedAssignment.attachmentPath && (
                      <div className="flex items-center justify-between p-3 bg-indigo-50/60 rounded-lg border border-indigo-100">
                        <div className="flex items-center gap-2.5 truncate mr-2">
                          <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-semibold text-slate-800 truncate">Assignment Brief Document</p>
                            <p className="text-[11px] font-mono text-slate-500 truncate">{selectedAssignment.attachmentName}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadAttachment(selectedAssignment)}
                          isLoading={downloadingAttachment}
                          className="shrink-0 text-xs"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" />
                          Download Brief
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Submission / Evaluation Status Card */}
                {selectedAssignment.isEvaluated ? (
                  /* Evaluated State */
                  <Card className="border-emerald-200 bg-emerald-50/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-emerald-600" />
                          <CardTitle className="text-base text-emerald-950">
                            Faculty Evaluation Completed
                          </CardTitle>
                        </div>
                        <Badge variant="emerald" className="font-mono text-sm px-2.5 py-0.5">
                          {selectedAssignment.marksObtained} / {selectedAssignment.maxMarks} Marks
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-slate-500">
                        Evaluated by {selectedAssignment.evaluatedByName || selectedAssignment.facultyName}
                        {selectedAssignment.evaluatedAt && ` on ${new Date(selectedAssignment.evaluatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3.5">
                      {/* Feedback Box */}
                      {selectedAssignment.feedback ? (
                        <div className="p-3.5 bg-white rounded-lg border border-emerald-200 shadow-sm">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-1">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Faculty Remarks & Feedback</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed italic">
                            "{selectedAssignment.feedback}"
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No written feedback remarks provided.</p>
                      )}

                      {/* Submitted File Info */}
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center gap-2 truncate mr-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <p className="font-semibold text-slate-800 truncate">
                              {selectedAssignment.submissionFileName || 'Submitted Assignment File'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Submitted on {selectedAssignment.submissionDate && new Date(selectedAssignment.submissionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        {selectedAssignment.submissionFilePath && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadSubmission(selectedAssignment)}
                            isLoading={downloadingSubmission}
                            className="shrink-0 text-xs"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            View File
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : selectedAssignment.isSubmitted ? (
                  /* Submitted but Awaiting Evaluation State */
                  <Card className="border-indigo-200 bg-indigo-50/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-brand-600" />
                          <CardTitle className="text-base text-slate-900">
                            Coursework Submitted
                          </CardTitle>
                        </div>
                        <Badge variant="indigo">
                          {selectedAssignment.isLate ? 'Submitted (Late)' : 'Awaiting Grading'}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-slate-500">
                        Your submission was recorded on{' '}
                        {selectedAssignment.submissionDate &&
                          new Date(selectedAssignment.submissionDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedAssignment.submissionRemarks && (
                        <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700">
                          <p className="font-semibold text-slate-500 text-[11px] mb-0.5">Your Submission Note:</p>
                          <p className="italic">{selectedAssignment.submissionRemarks}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center gap-2 truncate mr-2">
                          <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                          <span className="font-mono text-slate-700 truncate">
                            {selectedAssignment.submissionFileName || 'Submitted File'}
                          </span>
                        </div>
                        {selectedAssignment.submissionFilePath && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadSubmission(selectedAssignment)}
                            isLoading={downloadingSubmission}
                            className="shrink-0 text-xs"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download My Submission
                          </Button>
                        )}
                      </div>

                      {/* Resubmit form (if allowed before evaluation) */}
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-xs font-semibold text-slate-700 mb-2">Update / Resubmit Work</p>
                        <div className="space-y-3">
                          <input
                            type="file"
                            onChange={(e) => setSubmitFile(e.target.files?.[0] || null)}
                            className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer border border-slate-200 rounded p-1.5"
                          />
                          <Textarea
                            placeholder="Add or update submission remarks..."
                            value={submitRemarks}
                            onChange={(e) => setSubmitRemarks(e.target.value)}
                            rows={2}
                          />
                          <Button
                            size="sm"
                            onClick={handleSubmit}
                            isLoading={submitting}
                            className="w-full text-xs"
                          >
                            <Upload className="w-3.5 h-3.5 mr-1" />
                            Update Submission
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  /* Not Submitted State — Submission Form */
                  <Card className="border-slate-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-brand-600" />
                        <CardTitle className="text-base font-bold text-slate-900">
                          Submit Your Assignment
                        </CardTitle>
                      </div>
                      <CardDescription className="text-xs text-slate-500">
                        Upload your completed coursework solution, report, or source files.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isPastDeadline(selectedAssignment.deadline) && (
                        <div className="flex items-start gap-2.5 p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>The deadline for this assignment has passed. Your submission will be marked as late.</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                          Attachment File (PDF, DOCX, ZIP, etc.)
                        </label>
                        <input
                          type="file"
                          onChange={(e) => setSubmitFile(e.target.files?.[0] || null)}
                          className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer border border-slate-200 rounded-lg p-2"
                        />
                        {submitFile && (
                          <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                            Selected: {submitFile.name} ({(submitFile.size / 1024).toFixed(1)} KB)
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                          Submission Remarks / Notes (Optional)
                        </label>
                        <Textarea
                          placeholder="Provide details about your submission, team members (if group), or references..."
                          value={submitRemarks}
                          onChange={(e) => setSubmitRemarks(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <Button
                        onClick={handleSubmit}
                        isLoading={submitting}
                        className="w-full text-xs font-semibold py-2.5"
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        Confirm & Submit Coursework
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
