import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staff.service';
import {
  StaffClassSummary,
  StaffPerformanceOverview,
  StudentAcademicRecord,
} from '../../types/staff.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import {
  BarChart3,
  Users,
  GraduationCap,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Search,
  BookOpen,
  Award,
  Eye,
  Activity,
} from 'lucide-react';

const scoreDisplay = (score?: number, max = 50) => {
  if (score === undefined || score === null) {
    return <span className="text-slate-400 text-xs italic">N/A</span>;
  }
  const pct = (score / max) * 100;
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-xs font-medium text-slate-800">
        {score.toFixed(1)}
        <span className="text-slate-400 font-normal">/{max}</span>
      </span>
      <span className="text-[10px] text-slate-500">({pct.toFixed(0)}%)</span>
    </div>
  );
};

const attendanceBadge = (percentage?: number) => {
  if (percentage === undefined || percentage === null) {
    return <span className="text-slate-400 text-xs italic">N/A</span>;
  }
  if (percentage < 75) {
    return (
      <Badge variant="rose">
        {percentage.toFixed(1)}% (Low)
      </Badge>
    );
  }
  if (percentage < 85) {
    return (
      <Badge variant="amber">
        {percentage.toFixed(1)}%
      </Badge>
    );
  }
  return (
    <Badge variant="emerald">
      {percentage.toFixed(1)}%
    </Badge>
  );
};

const getAcademicStatus = (record: StudentAcademicRecord) => {
  const isAttDefaulter = record.attendancePercentage !== undefined && record.attendancePercentage !== null && record.attendancePercentage < 75;
  const isIat1Low = record.iat1Score !== undefined && record.iat1Score !== null && record.iat1Score < 25;
  const isIat2Low = record.iat2Score !== undefined && record.iat2Score !== null && record.iat2Score < 25;

  if (isAttDefaulter && (isIat1Low || isIat2Low)) {
    return <Badge variant="rose">Critical Attention</Badge>;
  }
  if (isAttDefaulter) {
    return <Badge variant="rose">Attendance Alert</Badge>;
  }
  if (isIat1Low || isIat2Low) {
    return <Badge variant="amber">Academic Support</Badge>;
  }
  if (record.iat1Score !== undefined || record.iat2Score !== undefined || record.attendancePercentage !== undefined) {
    return <Badge variant="emerald">On Track</Badge>;
  }
  return <Badge variant="slate">Pending Data</Badge>;
};

export const StaffPerformancePage: React.FC = () => {
  const [classes, setClasses] = useState<StaffClassSummary[]>([]);
  const [selectedTaId, setSelectedTaId] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<StaffPerformanceOverview | null>(null);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentAcademicRecord | null>(null);
  const [showDrilldown, setShowDrilldown] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchAssignedClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAssignedClasses = async () => {
    setLoadingClasses(true);
    try {
      const data = await staffService.getAssignedClasses();
      setClasses(data);
      if (data.length > 0) {
        setSelectedTaId(data[0].teachingAssignmentId);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load assigned classes', 'error');
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    if (selectedTaId !== null) {
      loadPerformanceAnalytics(selectedTaId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTaId]);

  const loadPerformanceAnalytics = async (taId: number) => {
    setLoadingAnalytics(true);
    try {
      const data = await staffService.getPerformanceAnalytics(taId);
      setAnalytics(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load performance analytics', 'error');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const selectedClass = classes.find(c => c.teachingAssignmentId === selectedTaId);

  const filteredStudents = analytics?.studentRecords.filter(s => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(query) ||
      s.registerNumber.toLowerCase().includes(query)
    );
  }) || [];

  const handleOpenStudentDrilldown = (student: StudentAcademicRecord) => {
    setSelectedStudent(student);
    setShowDrilldown(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Performance Analytics"
        description="Continuous assessment analytics and attendance benchmarks for your assigned cohorts"
      />

      {/* Cohort Selector / Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              <div className="w-full sm:w-80">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Select Assigned Subject & Section
                </label>
                {loadingClasses ? (
                  <div className="h-10 bg-slate-100 rounded animate-pulse" />
                ) : (
                  <Select
                    value={selectedTaId ? String(selectedTaId) : ''}
                    onChange={e => setSelectedTaId(Number(e.target.value))}
                    options={classes.map(c => ({
                      value: String(c.teachingAssignmentId),
                      label: `${c.subjectCode} - ${c.subjectName} (${c.sectionName})`,
                    }))}
                  />
                )}
              </div>

              {selectedClass && (
                <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-4">
                  <Badge variant="blue">
                    Semester {selectedClass.semester}
                  </Badge>
                  <Badge variant="indigo">
                    Academic Year {selectedClass.academicYear}
                  </Badge>
                  <Badge variant="slate">
                    {selectedClass.departmentCode}
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedTaId && loadPerformanceAnalytics(selectedTaId)}
                disabled={loadingAnalytics || !selectedTaId}
              >
                <Activity className={`w-4 h-4 mr-1.5 ${loadingAnalytics ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loadingClasses || loadingAnalytics ? (
        <LoadingState message="Calculating real cohort performance analytics from MySQL records..." />
      ) : classes.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-6 h-6" />}
          title="No Teaching Assignments Found"
          description="You are currently not assigned to teach any subjects. Contact your Department HOD or Administrator."
        />
      ) : !analytics ? (
        <EmptyState
          icon={<BarChart3 className="w-6 h-6" />}
          title="No Performance Data"
          description="Select an assigned class above to view continuous assessment analytics."
        />
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Total Students */}
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Students</span>
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{analytics.totalStudents}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Enrolled Cohort</p>
              </CardContent>
            </Card>

            {/* Average IAT 1 */}
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Avg IAT 1</span>
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {analytics.averageIat1 !== null && analytics.averageIat1 !== undefined
                    ? `${analytics.averageIat1.toFixed(1)}`
                    : '—'}
                  {analytics.averageIat1 !== null && analytics.averageIat1 !== undefined && (
                    <span className="text-xs font-normal text-slate-400">/50</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {analytics.evaluatedIat1Count}/{analytics.totalStudents} Evaluated
                </p>
              </CardContent>
            </Card>

            {/* Average IAT 2 */}
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Avg IAT 2</span>
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {analytics.averageIat2 !== null && analytics.averageIat2 !== undefined
                    ? `${analytics.averageIat2.toFixed(1)}`
                    : '—'}
                  {analytics.averageIat2 !== null && analytics.averageIat2 !== undefined && (
                    <span className="text-xs font-normal text-slate-400">/50</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {analytics.evaluatedIat2Count}/{analytics.totalStudents} Evaluated
                </p>
              </CardContent>
            </Card>

            {/* Average Assignment */}
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Avg Assignment</span>
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {analytics.averageAssignment !== null && analytics.averageAssignment !== undefined
                    ? `${analytics.averageAssignment.toFixed(1)}`
                    : '—'}
                  {analytics.averageAssignment !== null && analytics.averageAssignment !== undefined && (
                    <span className="text-xs font-normal text-slate-400">/25</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {analytics.evaluatedAssignmentCount}/{analytics.totalStudents} Evaluated
                </p>
              </CardContent>
            </Card>

            {/* Average Attendance */}
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Avg Attendance</span>
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {analytics.averageAttendance !== null && analytics.averageAttendance !== undefined
                    ? `${analytics.averageAttendance.toFixed(1)}%`
                    : '—'}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Policy Req: 75%</p>
              </CardContent>
            </Card>

            {/* Attendance Defaulters */}
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Attendance Alerts</span>
                  <div className="p-1.5 bg-rose-50 text-rose-600 rounded-md">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-rose-600">
                  {analytics.attendanceDefaultersCount}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">&lt; 75% Threshold</p>
              </CardContent>
            </Card>
          </div>

          {/* Visual Performance & Health Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Continuous Assessment Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Continuous Assessment Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* IAT 1 Meter */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Internal Assessment Test 1 (Max 50)</span>
                    <span className="font-mono text-slate-900 font-semibold">
                      {analytics.averageIat1 !== null && analytics.averageIat1 !== undefined
                        ? `${analytics.averageIat1.toFixed(1)} / 50 (${((analytics.averageIat1 / 50) * 100).toFixed(0)}%)`
                        : 'No records'}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${analytics.averageIat1 ? Math.min(100, (analytics.averageIat1 / 50) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* IAT 2 Meter */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Internal Assessment Test 2 (Max 50)</span>
                    <span className="font-mono text-slate-900 font-semibold">
                      {analytics.averageIat2 !== null && analytics.averageIat2 !== undefined
                        ? `${analytics.averageIat2.toFixed(1)} / 50 (${((analytics.averageIat2 / 50) * 100).toFixed(0)}%)`
                        : 'No records'}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${analytics.averageIat2 ? Math.min(100, (analytics.averageIat2 / 50) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Assignment Meter */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Assignment Continuous Score (Max 25)</span>
                    <span className="font-mono text-slate-900 font-semibold">
                      {analytics.averageAssignment !== null && analytics.averageAssignment !== undefined
                        ? `${analytics.averageAssignment.toFixed(1)} / 25 (${((analytics.averageAssignment / 25) * 100).toFixed(0)}%)`
                        : 'No records'}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${analytics.averageAssignment ? Math.min(100, (analytics.averageAssignment / 25) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-500 flex items-center gap-1.5 border-t border-slate-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Calculated from official MySQL continuous assessment marks.
                </div>
              </CardContent>
            </Card>

            {/* Attendance Standing & Alerts */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Cohort Attendance Standing (75% Minimum Policy)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                    <p className="text-xs text-emerald-800 font-medium">Good (&ge; 85%)</p>
                    <p className="text-lg font-bold text-emerald-900 mt-1">{analytics.highAttendanceCount}</p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">Eligible</p>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <p className="text-xs text-amber-800 font-medium">Moderate (75-84%)</p>
                    <p className="text-lg font-bold text-amber-900 mt-1">{analytics.moderateAttendanceCount}</p>
                    <p className="text-[10px] text-amber-600 mt-0.5">Eligible</p>
                  </div>

                  <div className="bg-rose-50 border border-rose-100 rounded-lg p-3">
                    <p className="text-xs text-rose-800 font-medium">Critical (&lt; 75%)</p>
                    <p className="text-lg font-bold text-rose-900 mt-1">{analytics.attendanceDefaultersCount}</p>
                    <p className="text-[10px] text-rose-600 mt-0.5">Defaulter Alert</p>
                  </div>
                </div>

                {/* Overall Attendance Meter */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Cohort Average Attendance</span>
                    <span className="font-mono text-slate-900 font-semibold">
                      {analytics.averageAttendance !== null && analytics.averageAttendance !== undefined
                        ? `${analytics.averageAttendance.toFixed(1)}%`
                        : 'No records'}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        analytics.averageAttendance && analytics.averageAttendance >= 75
                          ? 'bg-emerald-600'
                          : 'bg-rose-500'
                      }`}
                      style={{
                        width: `${analytics.averageAttendance ? Math.min(100, analytics.averageAttendance) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-500 flex items-center gap-1.5 border-t border-slate-100">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Students with attendance below 75% require formal notification.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Performance Table */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Student Performance Records
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing {filteredStudents.length} of {analytics.totalStudents} enrolled students
                  </p>
                </div>

                <div className="w-full sm:w-64">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Search register no or name..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-500">No student records match your search query.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-32">Register No</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead className="text-center">IAT 1 (50)</TableHead>
                        <TableHead className="text-center">IAT 2 (50)</TableHead>
                        <TableHead className="text-center">Assignment (25)</TableHead>
                        <TableHead className="text-center">Attendance %</TableHead>
                        <TableHead className="text-center">Academic Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map(student => (
                        <TableRow key={student.studentProfileId} className="hover:bg-slate-50/75">
                          <TableCell className="font-mono text-xs font-semibold text-slate-900">
                            {student.registerNumber}
                          </TableCell>
                          <TableCell className="font-medium text-slate-800 text-sm">
                            {student.fullName}
                          </TableCell>
                          <TableCell className="text-center">
                            {scoreDisplay(student.iat1Score, 50)}
                          </TableCell>
                          <TableCell className="text-center">
                            {scoreDisplay(student.iat2Score, 50)}
                          </TableCell>
                          <TableCell className="text-center">
                            {scoreDisplay(student.assignmentScore, 25)}
                          </TableCell>
                          <TableCell className="text-center">
                            {attendanceBadge(student.attendancePercentage)}
                          </TableCell>
                          <TableCell className="text-center">
                            {getAcademicStatus(student)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenStudentDrilldown(student)}
                              className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Student Drill-Down Modal */}
      {selectedStudent && (
        <Modal
          isOpen={showDrilldown}
          onClose={() => setShowDrilldown(false)}
          title="Student Assessment Breakdown"
        >
          <div className="space-y-4 p-1">
            {/* Student Header */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{selectedStudent.fullName}</h4>
                  <p className="text-xs font-mono text-slate-600">{selectedStudent.registerNumber}</p>
                </div>
                {getAcademicStatus(selectedStudent)}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
                <span>Subject: <strong>{analytics?.subjectCode} - {analytics?.subjectName}</strong></span>
                <span>·</span>
                <span>Section: <strong>{analytics?.sectionName}</strong></span>
                <span>·</span>
                <span>Semester: <strong>{analytics?.semester}</strong></span>
              </div>
            </div>

            {/* Assessment Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* IAT 1 */}
              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <p className="text-xs text-slate-500 font-medium">IAT 1 Score</p>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {selectedStudent.iat1Score !== undefined && selectedStudent.iat1Score !== null
                    ? `${selectedStudent.iat1Score.toFixed(1)} / 50`
                    : 'N/A'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {selectedStudent.iat1Score !== undefined && selectedStudent.iat1Score !== null
                    ? `${((selectedStudent.iat1Score / 50) * 100).toFixed(1)}%`
                    : 'Not entered'}
                </div>
              </div>

              {/* IAT 2 */}
              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <p className="text-xs text-slate-500 font-medium">IAT 2 Score</p>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {selectedStudent.iat2Score !== undefined && selectedStudent.iat2Score !== null
                    ? `${selectedStudent.iat2Score.toFixed(1)} / 50`
                    : 'N/A'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {selectedStudent.iat2Score !== undefined && selectedStudent.iat2Score !== null
                    ? `${((selectedStudent.iat2Score / 50) * 100).toFixed(1)}%`
                    : 'Not entered'}
                </div>
              </div>

              {/* Assignment */}
              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <p className="text-xs text-slate-500 font-medium">Assignment Score</p>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {selectedStudent.assignmentScore !== undefined && selectedStudent.assignmentScore !== null
                    ? `${selectedStudent.assignmentScore.toFixed(1)} / 25`
                    : 'N/A'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {selectedStudent.assignmentScore !== undefined && selectedStudent.assignmentScore !== null
                    ? `${((selectedStudent.assignmentScore / 25) * 100).toFixed(1)}%`
                    : 'Not entered'}
                </div>
              </div>

              {/* Attendance */}
              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <p className="text-xs text-slate-500 font-medium">Attendance</p>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {selectedStudent.attendancePercentage !== undefined && selectedStudent.attendancePercentage !== null
                    ? `${selectedStudent.attendancePercentage.toFixed(1)}%`
                    : 'N/A'}
                </div>
                <div className="text-[11px] mt-0.5">
                  {selectedStudent.attendancePercentage !== undefined && selectedStudent.attendancePercentage !== null ? (
                    selectedStudent.attendancePercentage >= 75 ? (
                      <span className="text-emerald-600 font-medium">Eligible (&ge; 75%)</span>
                    ) : (
                      <span className="text-rose-600 font-medium">Defaulter (&lt; 75%)</span>
                    )
                  ) : (
                    <span className="text-slate-400">Not recorded</span>
                  )}
                </div>
              </div>
            </div>

            {/* Advisory Note */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <p className="font-semibold mb-0.5">Continuous Assessment Policy</p>
              <p>
                All continuous marks and attendance records are securely stored in MySQL and reflect official institutional evaluations for this semester.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setShowDrilldown(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
