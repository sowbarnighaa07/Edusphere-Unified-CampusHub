import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { resultService } from '../../services/result.service';
import { DepartmentDetail, SectionDetail } from '../../types/admin.types';
import {
  SemesterAcademicVerification,
  SemesterResultSummary,
  SemesterTransitionForm,
} from '../../types/result.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useToast } from '../../components/feedback/Toast';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Send,
  Check,
  RefreshCw,
} from 'lucide-react';

export const AdminSemesterResultsPage: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentDetail[]>([]);
  const [sections, setSections] = useState<SectionDetail[]>([]);

  // Filter selection
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');
  const [selectedSectionId, setSelectedSectionId] = useState<number | ''>('');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [academicYear, setAcademicYear] = useState<string>('2026-2027');

  // State for verification and results
  const [verification, setVerification] = useState<SemesterAcademicVerification | null>(null);
  const [results, setResults] = useState<SemesterResultSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [markingVerified, setMarkingVerified] = useState(false);

  // Transition Modal State
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionForm, setTransitionForm] = useState<SemesterTransitionForm>({
    sectionId: 0,
    fromSemester: 1,
    toSemester: 2,
    fromAcademicYear: '2026-2027',
    toAcademicYear: '2026-2027',
  });

  const { showToast } = useToast();

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDeptId) {
      loadSections(Number(selectedDeptId));
    } else {
      setSections([]);
      setSelectedSectionId('');
    }
  }, [selectedDeptId]);

  useEffect(() => {
    if (selectedDeptId && selectedSectionId && selectedSemester && academicYear) {
      runVerificationAndFetchResults();
    }
  }, [selectedDeptId, selectedSectionId, selectedSemester, academicYear]);

  const loadDepartments = async () => {
    try {
      const data = await adminService.getDepartments();
      setDepartments(data);
      if (data.length > 0) {
        setSelectedDeptId(data[0].id);
      }
    } catch {
      showToast('Failed to load departments', 'error');
    }
  };

  const loadSections = async (deptId: number) => {
    try {
      const data = await adminService.getSections(deptId);
      setSections(data);
      if (data.length > 0) {
        setSelectedSectionId(data[0].id);
      } else {
        setSelectedSectionId('');
        setVerification(null);
        setResults([]);
      }
    } catch {
      showToast('Failed to load sections', 'error');
    }
  };

  const runVerificationAndFetchResults = async () => {
    if (!selectedDeptId || !selectedSectionId) return;
    setLoading(true);
    try {
      const [verData, resData] = await Promise.all([
        resultService.verifyAcademicData(
          Number(selectedDeptId),
          Number(selectedSectionId),
          selectedSemester,
          academicYear
        ),
        resultService.getSectionResults(
          Number(selectedSectionId),
          selectedSemester,
          academicYear
        ),
      ]);
      setVerification(verData);
      setResults(resData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching verification data';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResults = async () => {
    if (!selectedDeptId || !selectedSectionId) return;
    setGenerating(true);
    try {
      const generated = await resultService.generateResults({
        departmentId: Number(selectedDeptId),
        sectionId: Number(selectedSectionId),
        semester: selectedSemester,
        academicYear,
      });
      setResults(generated);
      showToast(`Successfully generated ${generated.length} semester results in DRAFT status.`, 'success');
      // Re-verify
      runVerificationAndFetchResults();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate semester results';
      showToast(msg, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleVerifyResults = async () => {
    if (!selectedSectionId) return;
    setMarkingVerified(true);
    try {
      const verified = await resultService.verifyResults({
        sectionId: Number(selectedSectionId),
        semester: selectedSemester,
        academicYear,
      });
      setResults(verified);
      showToast(`Semester results marked as VERIFIED and ready for official publication.`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to verify semester results';
      showToast(msg, 'error');
    } finally {
      setMarkingVerified(false);
    }
  };

  const handlePublishResults = async () => {
    if (!selectedSectionId) return;
    setPublishing(true);
    try {
      const published = await resultService.publishResults({
        sectionId: Number(selectedSectionId),
        semester: selectedSemester,
        academicYear,
      });
      setResults(published);
      showToast(`Results officially PUBLISHED! Students can now view their official semester grades.`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish semester results';
      showToast(msg, 'error');
    } finally {
      setPublishing(false);
    }
  };

  const openTransitionModal = () => {
    const nextSem = selectedSemester + 1;
    let nextYear = academicYear;
    if (selectedSemester % 2 === 0) {
      // Transitioning from even to odd semester advances academic year (e.g., 2026-2027 -> 2027-2028)
      const parts = academicYear.split('-');
      if (parts.length === 2) {
        const start = parseInt(parts[0], 10) + 1;
        const end = parseInt(parts[1], 10) + 1;
        nextYear = `${start}-${end}`;
      }
    }
    setTransitionForm({
      sectionId: Number(selectedSectionId),
      fromSemester: selectedSemester,
      toSemester: nextSem,
      fromAcademicYear: academicYear,
      toAcademicYear: nextYear,
    });
    setShowTransitionModal(true);
  };

  const handleExecuteTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransitioning(true);
    try {
      const res = await resultService.executeTransition(transitionForm);
      showToast(res.statusMessage || 'Semester transition completed successfully!', 'success');
      setShowTransitionModal(false);
      // Advance the selector to next semester to reflect new state
      setSelectedSemester(transitionForm.toSemester);
      setAcademicYear(transitionForm.toAcademicYear);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to execute semester transition';
      showToast(msg, 'error');
    } finally {
      setTransitioning(false);
    }
  };

  // Determine stage flags
  const hasResults = results.length > 0;
  const allPublished = hasResults && results.every((r) => r.status === 'PUBLISHED');
  const hasVerified = hasResults && results.some((r) => r.status === 'VERIFIED');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
      <PageHeader
        title="Semester Result Verification &amp; Student Transition"
        description="Verify continuous assessments, generate official semester results, publish grades to students, and manage cohort semester progression."
        badge={<Badge variant="indigo">Official Academic Governance</Badge>}
      />

      {/* Filter / Academic Period Selector Card */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            Select Academic Cohort &amp; Period
          </CardTitle>
          <CardDescription>
            Choose the target department, section, semester, and academic year for continuous assessment verification and result publication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Department
              </label>
              <Select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value ? Number(e.target.value) : '')}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Section / Cohort
              </label>
              <Select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value ? Number(e.target.value) : '')}
                disabled={sections.length === 0}
              >
                {sections.length === 0 ? (
                  <option value="">No sections available</option>
                ) : (
                  sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      Section {s.name} ({s.studentCount} Students)
                    </option>
                  ))
                )}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Semester
              </label>
              <Select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem} {sem % 2 === 1 ? '(Odd)' : '(Even)'}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Academic Year
              </label>
              <Input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2026-2027"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading Indicator */}
      {loading && <LoadingState message="Verifying continuous assessment records..." />}

      {/* Academic Assessment Data Verification Section */}
      {!loading && verification && (
        <div className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  Academic Assessment Data Verification
                </CardTitle>
                <CardDescription>
                  Validation status across IAT 1, IAT 2, assignments, and attendance records for Section {verification.sectionName} (Semester {verification.semester}).
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runVerificationAndFetchResults}
                  disabled={loading}
                  className="flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Re-Verify Data
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Verification Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                  <p className="text-[11px] font-semibold text-slate-600 uppercase">Enrolled Students</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{verification.totalStudents}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                  <p className="text-[11px] font-semibold text-slate-600 uppercase">Curriculum Subjects</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{verification.totalSubjects}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                  <p className="text-[11px] font-semibold text-slate-600 uppercase">Expected Records</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{verification.expectedRecords}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                  <p className="text-[11px] font-semibold text-slate-600 uppercase">Completed Entries</p>
                  <p className="text-xl font-bold text-emerald-700 mt-0.5">{verification.completedRecords}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                  <p className="text-[11px] font-semibold text-slate-600 uppercase">Missing Records</p>
                  <p className={`text-xl font-bold mt-0.5 ${verification.missingRecords === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {verification.missingRecords}
                  </p>
                </div>
              </div>

              {/* Status Alert Banner */}
              <div
                className={`p-4 rounded-lg border flex items-center justify-between gap-3 ${
                  verification.isReadyForGeneration
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {verification.isReadyForGeneration ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-bold">
                      {verification.isReadyForGeneration
                        ? 'Continuous Assessment Data Complete & Verified'
                        : 'Action Required: Assessment Records Incomplete'}
                    </p>
                    <p className="text-xs text-slate-700 mt-0.5">{verification.statusMessage}</p>
                  </div>
                </div>

                <Badge variant={verification.isReadyForGeneration ? 'emerald' : 'amber'}>
                  {verification.isReadyForGeneration ? 'READY FOR GENERATION' : 'DATA PENDING'}
                </Badge>
              </div>

              {/* Subject Data Verification Summary */}
              {verification.subjectSummaries.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                    Subject Assessment Entry Status
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {verification.subjectSummaries.map((s) => (
                      <div
                        key={s.subjectId}
                        className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-xs text-slate-900 truncate">{s.subjectName}</p>
                          <p className="text-[11px] text-slate-600 font-mono">{s.subjectCode} • {s.credits} Credits</p>
                          <p className="text-[10px] text-slate-500 truncate">Faculty: {s.facultyName}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge variant={s.isComplete ? 'emerald' : 'amber'}>
                            {s.recordedStudentsCount}/{s.totalStudentsCount}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Record Drilldown Table (if any) */}
              {!verification.isReadyForGeneration && verification.missingRecordDetails.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Missing Assessment Records Breakdown ({verification.missingRecordDetails.length})
                  </h4>
                  <div className="border border-slate-200 rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Register No</TableHead>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Missing Components</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {verification.missingRecordDetails.map((m, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono font-bold text-xs text-slate-900">
                              {m.registerNumber}
                            </TableCell>
                            <TableCell className="font-semibold text-xs text-slate-900">
                              {m.studentName}
                            </TableCell>
                            <TableCell className="text-xs text-slate-700">
                              <span className="font-mono font-semibold text-slate-900">{m.subjectCode}</span> - {m.subjectName}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {m.missingFields.map((f, fIdx) => (
                                  <Badge key={fIdx} variant="rose">
                                    {f}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Toolbar */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase">Workflow Actions:</span>
              <Badge variant={allPublished ? 'emerald' : hasVerified ? 'blue' : hasResults ? 'amber' : 'slate'}>
                {allPublished
                  ? 'RESULTS PUBLISHED'
                  : hasVerified
                  ? 'RESULTS VERIFIED'
                  : hasResults
                  ? 'RESULTS DRAFT'
                  : 'AWAITING GENERATION'}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Step 1: Generate */}
              <Button
                variant="primary"
                onClick={handleGenerateResults}
                disabled={!verification.isReadyForGeneration || generating}
                className="flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                {generating ? 'Generating Results...' : hasResults ? 'Re-Generate Results' : 'Generate Semester Results'}
              </Button>

              {/* Step 2: Verify (Review) */}
              {hasResults && !allPublished && (
                <Button
                  variant="outline"
                  onClick={handleVerifyResults}
                  disabled={markingVerified}
                  className="flex items-center gap-1.5 text-blue-700 border-blue-200 hover:bg-blue-50"
                >
                  <Check className="w-4 h-4" />
                  {markingVerified ? 'Verifying...' : 'Mark as Verified'}
                </Button>
              )}

              {/* Step 3: Publish */}
              {hasResults && !allPublished && (
                <Button
                  variant="secondary"
                  onClick={handlePublishResults}
                  disabled={publishing}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  <Send className="w-4 h-4" />
                  {publishing ? 'Publishing...' : 'Publish Official Results'}
                </Button>
              )}

              {/* Step 4: Semester Transition */}
              {allPublished && (
                <Button
                  variant="primary"
                  onClick={openTransitionModal}
                  className="flex items-center gap-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold"
                >
                  <ArrowRight className="w-4 h-4" />
                  Start Semester Transition
                </Button>
              )}
            </div>
          </div>

          {/* Results Preview Table */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                  Official Semester Results Roster ({results.length} Students)
                </CardTitle>
                <CardDescription>
                  Continuous assessment totals, final scores, letter grades, and publication audit lifecycle.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {results.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={<FileSpreadsheet className="w-8 h-8 text-slate-400" />}
                    title="No Results Generated Yet"
                    description="Verify that continuous assessment records are complete, then click 'Generate Semester Results' above."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Register No</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead>Credits (Earned / Total)</TableHead>
                        <TableHead>Final Score (/100)</TableHead>
                        <TableHead>Letter Grade</TableHead>
                        <TableHead>Publication Status</TableHead>
                        <TableHead>Audit Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((res) => (
                        <TableRow key={res.id}>
                          <TableCell className="font-mono font-bold text-xs text-slate-900">
                            {res.registerNumber}
                          </TableCell>
                          <TableCell className="font-bold text-xs text-slate-900">
                            {res.studentName}
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-slate-700">
                            Sem {res.semester}
                          </TableCell>
                          <TableCell className="text-xs font-medium text-slate-700">
                            {res.creditsEarned ?? '-'} / {res.totalCredits ?? '-'} Credits
                          </TableCell>
                          <TableCell className="font-mono font-bold text-sm text-slate-900">
                            {res.actualSemesterScore != null ? (
                              <span className={Number(res.actualSemesterScore) >= 50 ? 'text-emerald-700' : 'text-rose-700'}>
                                {Number(res.actualSemesterScore).toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Pending</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={res.grade === 'RA' ? 'rose' : res.grade === 'O' || res.grade === 'A+' ? 'emerald' : 'blue'}>
                              {res.grade || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={res.status === 'PUBLISHED' ? 'emerald' : res.status === 'VERIFIED' ? 'blue' : 'amber'}>
                              {res.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[11px] text-slate-500">
                            {res.status === 'PUBLISHED' ? (
                              <span>Published: {res.publishedAt ? new Date(res.publishedAt).toLocaleDateString() : 'Yes'}</span>
                            ) : res.status === 'VERIFIED' ? (
                              <span>Verified: {res.verifiedAt ? new Date(res.verifiedAt).toLocaleDateString() : 'Yes'}</span>
                            ) : (
                              <span>Draft generated</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Semester Transition Confirmation Modal */}
      {showTransitionModal && (
        <Modal
          isOpen={showTransitionModal}
          onClose={() => setShowTransitionModal(false)}
          title="Execute Student Cohort Semester Transition"
        >
          <form onSubmit={handleExecuteTransition} className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <Sparkles className="w-5 h-5 text-indigo-700" />
                <span>Cohort Progression Confirmation</span>
              </div>
              <p className="text-xs text-indigo-800 leading-relaxed">
                All results for this cohort are verified and officially published. Proceeding will promote all students in Section {verification?.sectionName} to the next semester. Historical results and credit history will remain permanently preserved.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Current Semester
                </label>
                <Input
                  type="text"
                  value={`Semester ${transitionForm.fromSemester} (${transitionForm.fromAcademicYear})`}
                  disabled
                  className="bg-slate-100 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Target Next Semester
                </label>
                <Input
                  type="text"
                  value={`Semester ${transitionForm.toSemester} (${transitionForm.toAcademicYear})`}
                  disabled
                  className="bg-emerald-50 border-emerald-300 font-bold text-emerald-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Target Semester No.
                </label>
                <Input
                  type="number"
                  min={1}
                  max={8}
                  value={transitionForm.toSemester}
                  onChange={(e) => setTransitionForm({ ...transitionForm, toSemester: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Target Academic Year
                </label>
                <Input
                  type="text"
                  value={transitionForm.toAcademicYear}
                  onChange={(e) => setTransitionForm({ ...transitionForm, toAcademicYear: e.target.value })}
                  placeholder="2026-2027"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTransitionModal(false)}
                disabled={transitioning}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={transitioning}
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold"
              >
                {transitioning ? 'Executing Transition...' : 'Confirm & Transition Cohort'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminSemesterResultsPage;
