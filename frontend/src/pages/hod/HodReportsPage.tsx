import React, { useState, useEffect } from 'react';
import { hodService } from '../../services/hod.service';
import { HodReportsSummary } from '../../types/hod.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useToast } from '../../components/feedback/Toast';
import {
  FileSpreadsheet,
  Download,
  Users,
  Briefcase,
  BookOpen,
  Calendar,
  Award,
  FileCheck2,
} from 'lucide-react';

export const HodReportsPage: React.FC = () => {
  const [report, setReport] = useState<HodReportsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await hodService.getReportsSummary();
      setReport(data);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load department reports';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportFullReportToCsv = () => {
    if (!report) return;

    const lines: string[] = [];
    lines.push(`"EDUSPHERE DEPARTMENT ACADEMIC & OPERATIONAL REPORT"`);
    lines.push(`"Department","${report.departmentName} (${report.departmentCode})"`);
    lines.push(`"Generated At","${new Date(report.generatedAt).toLocaleString()}"`);
    lines.push('');
    lines.push('"METRIC","VALUE"');
    lines.push(`"Total Enrolled Students","${report.totalStudents}"`);
    lines.push(`"Total Department Faculty","${report.totalFaculty}"`);
    lines.push(`"Total Sections","${report.totalSections}"`);
    lines.push(`"Total Curriculum Subjects","${report.totalSubjects}"`);
    lines.push(`"Average Attendance","${report.averageAttendance}%"`);
    lines.push(`"Attendance Defaulters Count","${report.attendanceDefaultersCount}"`);
    lines.push(`"Average IAT 1 Score","${report.averageIat1}"`);
    lines.push(`"Average IAT 2 Score","${report.averageIat2}"`);
    lines.push(`"Total Assignments Posted","${report.totalAssignments}"`);
    lines.push(`"Total Student Submissions","${report.totalSubmissions}"`);
    lines.push(`"Verified Student Achievements","${report.verifiedAchievementsCount}"`);
    lines.push('');
    lines.push('"FACULTY WORKLOAD SUMMARY"');
    lines.push('"Employee ID","Faculty Name","Designation","Assigned Classes","Students Taught"');
    report.facultyWorkloads.forEach((f) => {
      lines.push(`"${f.employeeId}","${f.fullName}","${f.designation}",${f.assignedClassesCount},${f.totalStudents}`);
    });
    lines.push('');
    lines.push('"SUBJECT PERFORMANCE SUMMARY"');
    lines.push('"Subject Code","Subject Name","Semester","Students","Avg IAT 1","Avg IAT 2","Avg Attendance","Pass Rate"');
    report.subjectPerformances.forEach((s) => {
      lines.push(
        `"${s.subjectCode}","${s.subjectName}",${s.semester},${s.totalStudents},${s.averageIat1 ?? 'N/A'},${s.averageIat2 ?? 'N/A'},${s.averageAttendance ? s.averageAttendance + '%' : 'N/A'},${s.passPercentage ? s.passPercentage + '%' : 'N/A'}`
      );
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${report.departmentCode}_department_comprehensive_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Comprehensive department report exported to CSV', 'success');
  };

  if (loading) {
    return <LoadingState message="Compiling comprehensive department reports..." />;
  }

  if (!report) {
    return (
      <EmptyState
        icon={<FileSpreadsheet className="w-10 h-10 text-slate-400" />}
        title="Report Not Available"
        description="Unable to generate the department report at this time."
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
      <PageHeader
        title="Department Academic &amp; Operational Reports"
        description={`Official statistical reporting for ${report.departmentName} (${report.departmentCode}). Generated: ${new Date(report.generatedAt).toLocaleString()}`}
        action={
          <Button onClick={exportFullReportToCsv} className="flex items-center gap-2 font-medium">
            <Download className="w-4 h-4" />
            Download Complete CSV Report
          </Button>
        }
      />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Student Strength</p>
              <p className="text-2xl font-bold text-slate-900">{report.totalStudents}</p>
              <span className="text-xs font-medium text-slate-500">{report.totalSections} Sections</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-700">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Faculty Strength</p>
              <p className="text-2xl font-bold text-slate-900">{report.totalFaculty}</p>
              <span className="text-xs font-medium text-slate-500">{report.totalSubjects} Active Subjects</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Attendance Avg</p>
              <p className="text-2xl font-bold text-emerald-700">
                {report.averageAttendance}%
              </p>
              <span className="text-xs font-medium text-slate-500">{report.attendanceDefaultersCount} Defaulters</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Student Honors</p>
              <p className="text-2xl font-bold text-amber-700">
                {report.verifiedAchievementsCount}
              </p>
              <span className="text-xs font-medium text-slate-500">Verified Achievements</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Operational Summary Card */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-600" />
            Department Academic Operations Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600 uppercase">Average IAT 1</p>
              <p className="text-lg font-bold text-slate-900">{report.averageIat1} / 50</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600 uppercase">Average IAT 2</p>
              <p className="text-lg font-bold text-slate-900">{report.averageIat2} / 50</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600 uppercase">Coursework Assignments</p>
              <p className="text-lg font-bold text-slate-900">{report.totalAssignments} Created</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600 uppercase">Student Submissions</p>
              <p className="text-lg font-bold text-slate-900">{report.totalSubmissions} Submitted</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Workload Table */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            Faculty Workload &amp; Allocation Report
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Faculty Member</th>
                  <th className="px-6 py-3.5 font-bold">Employee ID</th>
                  <th className="px-6 py-3.5 font-bold">Designation</th>
                  <th className="px-6 py-3.5 font-bold">Assigned Classes</th>
                  <th className="px-6 py-3.5 font-bold">Total Student Load</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.facultyWorkloads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-600 font-medium">
                      No faculty records found for this department.
                    </td>
                  </tr>
                ) : (
                  report.facultyWorkloads.map((f) => (
                    <tr key={f.staffProfileId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {f.fullName}
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-700">
                        {f.employeeId}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        <Badge variant="blue">{f.designation}</Badge>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {f.assignedClassesCount} Classes
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {f.totalStudents} Students
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Subject Performance Breakdown Table */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Curriculum Subject Performance Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Subject</th>
                  <th className="px-6 py-3.5 font-bold">Semester</th>
                  <th className="px-6 py-3.5 font-bold">Students</th>
                  <th className="px-6 py-3.5 font-bold">Avg IAT 1</th>
                  <th className="px-6 py-3.5 font-bold">Avg IAT 2</th>
                  <th className="px-6 py-3.5 font-bold">Avg Attendance</th>
                  <th className="px-6 py-3.5 font-bold">Pass Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.subjectPerformances.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-slate-600 font-medium">
                      No subject performance statistics recorded.
                    </td>
                  </tr>
                ) : (
                  report.subjectPerformances.map((s) => (
                    <tr key={s.subjectId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{s.subjectName}</p>
                        <span className="text-xs text-slate-500 font-mono font-medium">{s.subjectCode}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        Sem {s.semester}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {s.totalStudents}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {s.averageIat1 != null ? `${s.averageIat1}` : '-'}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {s.averageIat2 != null ? `${s.averageIat2}` : '-'}
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {s.averageAttendance != null ? (
                          <span className={s.averageAttendance >= 75 ? 'text-emerald-700' : 'text-rose-700'}>
                            {s.averageAttendance}%
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {s.passPercentage != null ? (
                          <Badge variant={s.passPercentage >= 75 ? 'emerald' : s.passPercentage >= 50 ? 'amber' : 'rose'}>
                            {s.passPercentage}%
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HodReportsPage;
