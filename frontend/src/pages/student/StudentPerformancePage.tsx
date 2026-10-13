import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '../../services/student.service';
import { mlService } from '../../services/ml.service';
import { aiService } from '../../services/ai.service';
import { StudentAcademicHistory, SemesterHistory, StudentEnrolledSubject } from '../../types/student.types';
import { StudentPredictionResponse } from '../../types/ml.types';
import { AcademicGuidanceResponse } from '../../types/ai.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import {
  BookOpen,
  GraduationCap,
  BarChart3,
  CalendarDays,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Compass,
  Lightbulb
} from 'lucide-react';

const attendanceBadge = (pct?: number) => {
  if (pct === undefined || pct === null) return <span className="text-slate-400 text-xs italic">N/A</span>;
  if (pct < 75) return <Badge variant="rose">{pct.toFixed(1)}%</Badge>;
  if (pct < 85) return <Badge variant="amber">{pct.toFixed(1)}%</Badge>;
  return <Badge variant="emerald">{pct.toFixed(1)}%</Badge>;
};

const scoreCell = (val?: number, suffix = '') => {
  if (val === undefined || val === null) return <span className="text-slate-400 text-xs italic">—</span>;
  return <span className="font-mono text-sm text-slate-900">{val.toFixed(1)}{suffix}</span>;
};

const SemesterPanel: React.FC<{
  sem: SemesterHistory;
  isCurrent: boolean;
  onPredict?: () => void;
  predicting?: boolean;
  guidance?: AcademicGuidanceResponse | null;
  onGenerateGuidance?: () => void;
  loadingGuidance?: boolean;
}> = ({
  sem,
  isCurrent,
  onPredict,
  predicting = false,
  guidance,
  onGenerateGuidance,
  loadingGuidance = false,
}) => (
  <div className="space-y-6">
    {/* Semester-level KPI row */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 text-center">
        <p className="text-[11px] font-semibold text-slate-600 uppercase mb-0.5">Academic Year</p>
        <p className="text-sm font-bold text-slate-900">{sem.academicYear}</p>
      </div>
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 text-center">
        <p className="text-[11px] font-semibold text-slate-600 uppercase mb-0.5">Credits (Earned/Total)</p>
        <p className="text-sm font-bold text-slate-900">
          {sem.creditsEarned != null ? `${sem.creditsEarned} / ` : ''}{sem.totalCredits}
        </p>
      </div>
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 text-center">
        <p className="text-[11px] font-semibold text-slate-600 uppercase mb-0.5">Avg Attendance</p>
        <p className="text-sm font-bold text-slate-900">
          {sem.averageAttendancePercentage != null ? `${sem.averageAttendancePercentage.toFixed(1)}%` : '—'}
        </p>
      </div>
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 text-center">
        <p className="text-[11px] font-semibold text-slate-600 uppercase mb-0.5">Official Result</p>
        <div className="mt-0.5">
          {sem.actualSemesterScore != null ? (
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <span className="font-mono text-sm font-bold text-emerald-700">
                  {Number(sem.actualSemesterScore).toFixed(1)}/100
                </span>
                {sem.grade && <Badge variant={sem.grade === 'RA' ? 'rose' : 'emerald'}>{sem.grade}</Badge>}
              </div>
              <Link to="/student/results" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline block">
                View Official Result &rarr;
              </Link>
            </div>
          ) : (
            <span className="text-slate-500 text-xs font-medium italic">
              {sem.status === 'DRAFT' || sem.status === 'VERIFIED' ? 'Pending Admin Publication' : isCurrent ? 'In Progress' : 'Pending'}
            </span>
          )}
        </div>
      </div>
    </div>

    {/* Phase 13: ML-Based Semester Performance Prediction Card (Current Semester) */}
    {isCurrent && (
      <div className="bg-gradient-to-r from-indigo-50/70 via-white to-slate-50 rounded-lg border border-indigo-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Semester Performance Prediction (Random Forest Model)
              </h4>
              <p className="text-xs text-slate-500">
                Predicts projected semester score based on verified continuous assessment records in MySQL.
              </p>
            </div>
          </div>
          {onPredict && (
            <Button
              variant={sem.predictedSemesterScore != null ? 'outline' : 'primary'}
              size="sm"
              onClick={onPredict}
              isLoading={predicting}
              className="shrink-0"
            >
              <TrendingUp className="w-4 h-4 mr-1.5" />
              {sem.predictedSemesterScore != null ? 'Recalculate Prediction' : 'Predict Semester Performance'}
            </Button>
          )}
        </div>

        {sem.predictedSemesterScore != null ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white rounded-lg border border-indigo-100 p-4">
            <div className="sm:col-span-1 border-b sm:border-b-0 sm:border-r border-slate-100 pb-3 sm:pb-0 sm:pr-4 flex flex-col justify-center">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Predicted Semester Score
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl font-extrabold text-indigo-700">
                  {Number(sem.predictedSemesterScore).toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-slate-400">/ 100</span>
              </div>
              <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Persisted to MySQL records
              </p>
            </div>
            <div className="sm:col-span-2 flex flex-col justify-center text-xs text-slate-600 space-y-1.5">
              <p className="font-semibold text-slate-700">Input Factors Evaluated:</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-500">
                <li>• Internal Assessment 1 (IAT 1)</li>
                <li>• Internal Assessment 2 (IAT 2)</li>
                <li>• Coursework Assignment Scores</li>
                <li>• Verified Subject Attendance %</li>
                {sem.semester > 1 && <li>• Previous Semester Actual Score</li>}
              </ul>
              <p className="text-[11px] text-slate-400 italic pt-1">
                Note: Machine Learning performance prediction is an academic guide and does not replace official university grading.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 p-4 text-xs text-slate-600 flex items-center justify-between">
            <span>
              Prediction has not been generated for Semester {sem.semester} yet. Click the button above to run inference using your posted assessment marks.
            </span>
          </div>
        )}
      </div>
    )}

    {/* Phase 14: Gemini AI Academic Guidance Integration */}
    {isCurrent && (
      <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                AI Academic Guidance (Gemini Model)
              </h4>
              <p className="text-xs text-slate-500">
                Personalized qualitative study strategies grounded in verified continuous assessment records.
              </p>
            </div>
          </div>
          {onGenerateGuidance && (
            <Button
              variant={guidance ? 'outline' : 'primary'}
              size="sm"
              onClick={onGenerateGuidance}
              isLoading={loadingGuidance}
              className="shrink-0"
            >
              <Lightbulb className="w-4 h-4 mr-1.5" />
              {guidance ? 'Refresh Guidance' : 'Generate Guidance'}
            </Button>
          )}
        </div>

        {guidance && guidance.available ? (
          <div className="space-y-4 text-xs">
            {/* Executive Summary */}
            {guidance.summary && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-slate-800 leading-relaxed">
                <span className="font-semibold text-slate-900 block mb-1">Academic Overview & Insights:</span>
                {guidance.summary}
              </div>
            )}

            {/* Strengths & Focus Areas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3.5 space-y-2">
                <h5 className="font-semibold text-emerald-900 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Strengths & Momentum
                </h5>
                <ul className="space-y-1.5 text-slate-700 text-[11px] list-disc list-inside">
                  {guidance.strengths.map((st, i) => (
                    <li key={i} className="leading-snug">{st}</li>
                  ))}
                </ul>
              </div>

              {/* Areas to Focus */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3.5 space-y-2">
                <h5 className="font-semibold text-amber-900 flex items-center gap-1.5 text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> Focus Areas & Subject Attention
                </h5>
                <ul className="space-y-1.5 text-slate-700 text-[11px] list-disc list-inside">
                  {guidance.areasToFocus.map((af, i) => (
                    <li key={i} className="leading-snug">{af}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Practical Study Suggestions */}
            {guidance.studySuggestions.length > 0 && (
              <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/30 space-y-2">
                <h5 className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Lightbulb className="w-4 h-4 text-indigo-600" /> Recommended Study Strategies & Action Plan
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                  {guidance.studySuggestions.map((sug, i) => (
                    <div key={i} className="flex items-start gap-2 bg-white border border-slate-100 p-2.5 rounded">
                      <span className="font-bold text-indigo-600 shrink-0">{i + 1}.</span>
                      <span className="leading-tight">{sug}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-400 italic pt-1 text-center">
              AI Academic Guidance is generated as a qualitative advising tool. It does not replace official faculty grading or calculate university marks.
            </p>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 flex items-center justify-between">
            <span>
              Personalized qualitative academic guidance is ready to be generated from your verified MySQL assessment records. Click "Generate Guidance" above to view targeted study strategies.
            </span>
          </div>
        )}
      </div>
    )}

    {/* For completed past semesters with existing stored prediction */}
    {!isCurrent && sem.predictedSemesterScore != null && (
      <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5">
        <BarChart3 className="w-4 h-4 text-indigo-600 shrink-0" />
        <span>
          Historical ML Predicted Score on record:{' '}
          <span className="font-bold text-indigo-700">{Number(sem.predictedSemesterScore).toFixed(1)} / 100</span>
          {sem.actualSemesterScore != null && (
            <span className="text-slate-500 ml-2">
              (Finalized Result: <span className="font-bold text-emerald-700">{Number(sem.actualSemesterScore).toFixed(1)} / 100</span>)
            </span>
          )}
        </span>
      </div>
    )}

    {/* Subject records table */}
    {sem.subjects.length === 0 ? (
      <EmptyState
        icon={<BookOpen className="w-5 h-5 text-slate-400" />}
        title="No Subject Records"
        description="No subject-level academic records have been posted for this semester yet."
      />
    ) : (
      <div>
        <div className="mb-2">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Enrolled Course Assessment Breakdown
          </h4>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead className="text-center">Credits</TableHead>
              <TableHead>Faculty</TableHead>
              <TableHead className="text-center">IAT 1 /50</TableHead>
              <TableHead className="text-center">IAT 2 /50</TableHead>
              <TableHead className="text-center">Assignment</TableHead>
              <TableHead className="text-center">Attendance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sem.subjects.map((sub: StudentEnrolledSubject, i: number) => (
              <TableRow key={sub.subjectId ?? i}>
                <TableCell>
                  <p className="font-semibold text-slate-900 text-sm">{sub.subjectName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{sub.subjectCode}</p>
                </TableCell>
                <TableCell className="text-center text-sm text-slate-700">{sub.credits ?? '—'}</TableCell>
                <TableCell>
                  {sub.facultyName ? (
                    <div>
                      <p className="text-sm text-slate-800">{sub.facultyName}</p>
                      <p className="text-[11px] text-slate-500">{sub.facultyEmail}</p>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs italic">Not assigned</span>
                  )}
                </TableCell>
                <TableCell className="text-center">{scoreCell(sub.iat1Score)}</TableCell>
                <TableCell className="text-center">{scoreCell(sub.iat2Score)}</TableCell>
                <TableCell className="text-center">{scoreCell(sub.assignmentScore)}</TableCell>
                <TableCell className="text-center">{attendanceBadge(sub.attendancePercentage)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </div>
);

export const StudentPerformancePage: React.FC = () => {
  const [history, setHistory] = useState<StudentAcademicHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSem, setActiveSem] = useState<number | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [guidance, setGuidance] = useState<AcademicGuidanceResponse | null>(null);
  const [loadingGuidance, setLoadingGuidance] = useState(false);
  const { showToast } = useToast();

  const loadAcademicHistory = async () => {
    try {
      const data = await studentService.getAcademicHistory();
      setHistory(data);
      if (data.semesters.length > 0 && activeSem === null) {
        const curr = data.semesters.find(s => s.semester === data.currentSemester);
        setActiveSem(curr?.semester ?? data.semesters[data.semesters.length - 1].semester);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load academic history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAcademicHistory();
  }, []);

  const handlePredict = async () => {
    setPredicting(true);
    try {
      const response: StudentPredictionResponse = await mlService.predictMySemesterPerformance();
      if (response.available && response.predictedSemesterScore != null) {
        showToast(response.message || 'Semester performance predicted successfully.', 'success');
        // Refresh history to reflect updated predictedSemesterScore in state
        const updated = await studentService.getAcademicHistory();
        setHistory(updated);
      } else {
        showToast(response.message || 'Prediction data is incomplete.', 'warning');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'ML Prediction service is currently unavailable. Please ensure the service is running.';
      showToast(msg, 'error');
    } finally {
      setPredicting(false);
    }
  };

  const handleGenerateGuidance = async () => {
    setLoadingGuidance(true);
    try {
      const res = await aiService.getAcademicGuidance();
      setGuidance(res);
      if (res.available) {
        showToast('Academic guidance generated successfully.', 'success');
      } else {
        showToast(res.message || 'Guidance is unavailable for current records.', 'warning');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'AI Guidance service is currently unavailable.';
      showToast(msg, 'error');
    } finally {
      setLoadingGuidance(false);
    }
  };

  if (loading) return <LoadingState message="Loading academic history..." />;

  if (!history || history.semesters.length === 0) {
    return (
      <div className="space-y-6 text-left">
        <PageHeader
          title="Academic Performance"
          description="Semester-wise internal assessment, attendance, and results"
        />
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={<GraduationCap className="w-6 h-6 text-slate-400" />}
              title="No Academic Records Available Yet"
              description="Your subject records and semester results will appear here once posted by your faculty."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeSemData = history.semesters.find(s => s.semester === activeSem);

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Academic Performance"
        description={`${history.fullName} • ${history.departmentCode} — Section ${history.sectionName}`}
      />

      {/* Student overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">Year</p>
            <p className="text-2xl font-bold text-slate-900">{history.currentYear}</p>
            <p className="text-xs text-slate-500">of 4</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">Semester</p>
            <p className="text-2xl font-bold text-slate-900">{history.currentSemester}</p>
            <p className="text-xs text-slate-500">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">Total Credits</p>
            <p className="text-2xl font-bold text-slate-900">{history.totalCreditsEarned}</p>
            <p className="text-xs text-slate-500">Registered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">Avg Attendance</p>
            <p className="text-2xl font-bold text-slate-900">
              {history.cumulativeAverageAttendance != null
                ? `${history.cumulativeAverageAttendance.toFixed(1)}%`
                : '—'
              }
            </p>
            <p className="text-xs text-slate-500">Cumulative</p>
          </CardContent>
        </Card>
      </div>

      {/* Semester tab selector */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {history.semesters.map(s => (
          <button
            key={s.semester}
            onClick={() => setActiveSem(s.semester)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeSem === s.semester
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Semester {s.semester}
            {s.semester === history.currentSemester && (
              <span className="ml-1.5 inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full align-middle" />
            )}
          </button>
        ))}
      </div>

      {/* Active semester detail */}
      {activeSemData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Semester {activeSemData.semester} Records</CardTitle>
                <CardDescription>
                  Academic Year: {activeSemData.academicYear}
                  {activeSemData.semester === history.currentSemester && (
                    <Badge variant="emerald" className="ml-2">Active Semester</Badge>
                  )}
                </CardDescription>
              </div>
              <CalendarDays className="w-5 h-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <SemesterPanel
              sem={activeSemData}
              isCurrent={activeSemData.semester === history.currentSemester}
              onPredict={activeSemData.semester === history.currentSemester ? handlePredict : undefined}
              predicting={predicting}
              guidance={activeSemData.semester === history.currentSemester ? guidance : null}
              onGenerateGuidance={activeSemData.semester === history.currentSemester ? handleGenerateGuidance : undefined}
              loadingGuidance={loadingGuidance}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
