import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/student.service';
import { StudentAcademicHistory, SemesterHistory } from '../../types/student.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useToast } from '../../components/feedback/Toast';
import {
  Award,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  FileText,
} from 'lucide-react';

const gradeBadge = (grade?: string) => {
  if (!grade) return <span className="text-slate-400 font-medium">—</span>;
  const g = grade.toUpperCase();
  if (g === 'O' || g === 'A+') {
    return <Badge variant="emerald" className="font-bold px-2 py-0.5">{grade}</Badge>;
  }
  if (g === 'A' || g === 'B+') {
    return <Badge variant="indigo" className="font-bold px-2 py-0.5">{grade}</Badge>;
  }
  if (g === 'B') {
    return <Badge variant="amber" className="font-bold px-2 py-0.5">{grade}</Badge>;
  }
  return <Badge variant="rose" className="font-bold px-2 py-0.5">{grade}</Badge>;
};

const resultBadge = (result?: string, score?: number) => {
  const isPass = result === 'PASS' || (result == null && score != null && score >= 50);
  if (isPass) {
    return (
      <Badge variant="emerald" className="font-bold px-2.5 py-0.5 inline-flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" /> PASS
      </Badge>
    );
  }
  return (
    <Badge variant="rose" className="font-bold px-2.5 py-0.5 inline-flex items-center gap-1">
      <AlertCircle className="w-3 h-3" /> RA
    </Badge>
  );
};

export const StudentSemesterResultsPage: React.FC = () => {
  const [history, setHistory] = useState<StudentAcademicHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSem, setSelectedSem] = useState<number | null>(null);
  const { showToast } = useToast();

  const loadAcademicHistory = async () => {
    try {
      const data = await studentService.getAcademicHistory();
      setHistory(data);
      if (data.semesters.length > 0 && selectedSem === null) {
        // Default to latest published semester or current semester
        const publishedSemesters = data.semesters.filter(s => s.status === 'PUBLISHED' || s.actualSemesterScore != null);
        if (publishedSemesters.length > 0) {
          setSelectedSem(publishedSemesters[publishedSemesters.length - 1].semester);
        } else {
          setSelectedSem(data.semesters[0].semester);
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load semester results', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAcademicHistory();
  }, []);

  if (loading) return <LoadingState message="Loading official semester results..." />;

  if (!history || history.semesters.length === 0) {
    return (
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-12">
        <PageHeader
          title="Semester Results"
          description="Official published subject-wise grades, marks, and semester transcripts"
          badge={<Badge variant="indigo">Official Grade Sheet</Badge>}
        />
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-8">
            <EmptyState
              icon={<Award className="w-8 h-8 text-slate-400" />}
              title="No Results Available"
              description="Semester results have not been generated or published by the institution yet."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSemData: SemesterHistory | undefined = history.semesters.find(s => s.semester === selectedSem);
  const isPublished = currentSemData && (currentSemData.status === 'PUBLISHED' || currentSemData.actualSemesterScore != null);

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Semester Results"
        description={`${history.fullName} (${history.registerNumber}) • ${history.departmentCode} — Section ${history.sectionName}`}
        badge={<Badge variant="indigo">Official Academic Records</Badge>}
      />

      {/* Overview Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4 text-center">
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">Current Degree Year</p>
            <p className="text-2xl font-black text-slate-900">Year {history.currentYear}</p>
            <p className="text-xs font-semibold text-slate-700">Enrolled {history.enrollmentYear}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4 text-center">
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">Current Active Semester</p>
            <p className="text-2xl font-black text-indigo-700">Semester {history.currentSemester}</p>
            <p className="text-xs font-semibold text-slate-700">Active Cohort</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4 text-center">
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">Total Credits Earned</p>
            <p className="text-2xl font-black text-emerald-700">{history.totalCreditsEarned}</p>
            <p className="text-xs font-semibold text-slate-700">Accumulated</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4 text-center">
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">Published Semesters</p>
            <p className="text-2xl font-black text-slate-900">{history.completedSemestersCount}</p>
            <p className="text-xs font-semibold text-slate-700">Completed & Verified</p>
          </CardContent>
        </Card>
      </div>

      {/* Semester Selector Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs font-bold text-slate-700 mr-2 flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-indigo-600" /> Select Semester:
        </span>
        {history.semesters.map(s => {
          const semPublished = s.status === 'PUBLISHED' || s.actualSemesterScore != null;
          const isSelected = selectedSem === s.semester;
          return (
            <button
              key={s.semester}
              onClick={() => setSelectedSem(s.semester)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                  : 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              <span>Semester {s.semester}</span>
              {semPublished ? (
                <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${isSelected ? 'bg-indigo-800 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                  {s.grade || 'PASS'}
                </span>
              ) : (
                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${isSelected ? 'bg-indigo-800 text-indigo-200' : 'bg-amber-100 text-amber-800'}`}>
                  Pending
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Semester Content */}
      {currentSemData && (
        <div className="space-y-6">
          {isPublished ? (
            <>
              {/* Semester Summary Header Card */}
              <Card className="border-indigo-200 bg-indigo-50/40 shadow-xs">
                <CardHeader className="pb-3 border-b border-indigo-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-600" />
                        Semester {currentSemData.semester} Official Result Transcript
                      </CardTitle>
                      <CardDescription className="text-slate-700 font-semibold text-xs mt-0.5">
                        Academic Session: {currentSemData.academicYear} • Verified &amp; Published by Institution Administration
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="emerald" className="px-3 py-1 font-bold text-xs inline-flex items-center gap-1.5 shadow-xs">
                        <ShieldCheck className="w-3.5 h-3.5" /> Officially Published
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-2xs">
                      <p className="text-[11px] font-bold text-slate-700 uppercase">Overall Semester Mark</p>
                      <p className="text-2xl font-black text-indigo-700 mt-0.5">
                        {currentSemData.actualSemesterScore != null ? currentSemData.actualSemesterScore.toFixed(2) : '—'}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-600">out of 100</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-2xs">
                      <p className="text-[11px] font-bold text-slate-700 uppercase">Overall Grade</p>
                      <div className="mt-1">
                        {gradeBadge(currentSemData.grade)}
                      </div>
                      <p className="text-[11px] font-semibold text-slate-600 mt-1">Letter Scale</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-2xs">
                      <p className="text-[11px] font-bold text-slate-700 uppercase">Total Credits</p>
                      <p className="text-2xl font-black text-slate-900 mt-0.5">{currentSemData.totalCredits}</p>
                      <p className="text-[11px] font-semibold text-slate-600">Registered</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-2xs">
                      <p className="text-[11px] font-bold text-slate-700 uppercase">Credits Earned</p>
                      <p className="text-2xl font-black text-emerald-700 mt-0.5">{currentSemData.creditsEarned ?? currentSemData.totalCredits}</p>
                      <p className="text-[11px] font-semibold text-slate-600">Completed</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-2xs">
                      <p className="text-[11px] font-bold text-slate-700 uppercase">Semester Outcome</p>
                      <div className="mt-1">
                        {resultBadge('PASS', currentSemData.actualSemesterScore)}
                      </div>
                      <p className="text-[11px] font-semibold text-slate-600 mt-1">Status</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subject-Wise Final Result Table */}
              <Card className="border-slate-200 bg-white shadow-xs">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Subject-Wise Final Results
                  </CardTitle>
                  <CardDescription className="text-slate-700 font-semibold text-xs">
                    Continuous assessment breakdown converted into official subject marks, grade letters, and credit allocations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-100/80">
                        <TableRow>
                          <TableHead className="text-xs font-bold text-slate-900">Subject Code</TableHead>
                          <TableHead className="text-xs font-bold text-slate-900">Subject Title</TableHead>
                          <TableHead className="text-xs font-bold text-slate-900 text-center">Credits</TableHead>
                          <TableHead className="text-xs font-bold text-slate-900 text-center">Final Mark</TableHead>
                          <TableHead className="text-xs font-bold text-slate-900 text-center">Grade</TableHead>
                          <TableHead className="text-xs font-bold text-slate-900 text-center">Result</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentSemData.subjects.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6 text-slate-600 font-semibold">
                              No subject details recorded for this semester.
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentSemData.subjects.map(sub => {
                            const mark = sub.finalScore != null ? sub.finalScore : sub.iat1Score;
                            return (
                              <TableRow key={sub.subjectId} className="hover:bg-slate-50 transition-colors">
                                <TableCell className="font-mono font-bold text-indigo-700 text-xs">
                                  {sub.subjectCode}
                                </TableCell>
                                <TableCell>
                                  <p className="font-bold text-slate-900 text-sm">{sub.subjectName}</p>
                                  {sub.facultyName && (
                                    <p className="text-xs font-medium text-slate-600">Faculty: {sub.facultyName}</p>
                                  )}
                                </TableCell>
                                <TableCell className="text-center font-bold text-slate-800">
                                  {sub.credits}
                                </TableCell>
                                <TableCell className="text-center font-bold text-slate-900 text-sm">
                                  {sub.finalScore != null ? (
                                    <span>{sub.finalScore.toFixed(2)}</span>
                                  ) : mark != null ? (
                                    <span>{mark.toFixed(2)}</span>
                                  ) : (
                                    <span className="text-slate-400 font-normal">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {gradeBadge(sub.grade || (sub.finalScore != null && sub.finalScore >= 90 ? 'O' : sub.finalScore != null && sub.finalScore >= 80 ? 'A+' : sub.finalScore != null && sub.finalScore >= 70 ? 'A' : sub.finalScore != null && sub.finalScore >= 60 ? 'B+' : sub.finalScore != null && sub.finalScore >= 50 ? 'B' : sub.finalScore != null ? 'RA' : undefined))}
                                </TableCell>
                                <TableCell className="text-center">
                                  {resultBadge(sub.result, sub.finalScore)}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Unpublished State */
            <Card className="border-amber-200 bg-amber-50/40 shadow-xs">
              <CardContent className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Semester {currentSemData.semester} Results Not Yet Published
                </h3>
                <p className="text-sm font-semibold text-slate-700 max-w-lg mx-auto">
                  The official subject-wise semester results for Semester {currentSemData.semester} ({currentSemData.academicYear}) are currently being verified by the institution administration. Official grades and transcripts will be visible here once published.
                </p>
                <div className="pt-2">
                  <Badge variant="amber" className="px-3 py-1 font-bold text-xs">
                    Pending Admin Publication
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
