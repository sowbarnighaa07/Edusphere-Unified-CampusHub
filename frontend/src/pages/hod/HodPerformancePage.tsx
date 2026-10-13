import React, { useState, useEffect } from 'react';
import { hodService } from '../../services/hod.service';
import { HodPerformanceOverview } from '../../types/hod.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useToast } from '../../components/feedback/Toast';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
  BookOpen,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';

export const HodPerformancePage: React.FC = () => {
  const [performance, setPerformance] = useState<HodPerformanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subjects' | 'sections' | 'defaulters'>('subjects');

  const { showToast } = useToast();

  useEffect(() => {
    fetchPerformance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const data = await hodService.getPerformanceAnalytics();
      setPerformance(data);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load department performance analytics';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportDefaultersToCsv = () => {
    if (!performance || !performance.defaulters || performance.defaulters.length === 0) {
      showToast('No defaulter data available to export', 'info');
      return;
    }

    const headers = ['Register Number', 'Student Name', 'Section', 'Subject Code', 'Subject Name', 'IAT 1 Score', 'IAT 2 Score', 'Attendance %'];
    const rows = performance.defaulters.map((d) => [
      `"${d.registerNumber}"`,
      `"${d.studentName}"`,
      `"${d.sectionName}"`,
      `"${d.subjectCode}"`,
      `"${d.subjectName}"`,
      d.iat1Score ?? 'N/A',
      d.iat2Score ?? 'N/A',
      d.attendancePercentage != null ? `${d.attendancePercentage}%` : 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${performance.departmentCode}_academic_defaulters.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Defaulters list exported to CSV', 'success');
  };

  if (loading) {
    return <LoadingState message="Aggregating department academic performance..." />;
  }

  if (!performance) {
    return (
      <EmptyState
        icon={<BarChart3 className="w-10 h-10 text-slate-400" />}
        title="No Performance Data Found"
        description="Department academic records are currently not available."
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
      <PageHeader
        title="Department Performance Analytics"
        description={`Academic indicators, marks distribution, and attendance records for ${performance.departmentName} (${performance.departmentCode}).`}
        action={
          <Button
            variant="outline"
            onClick={exportDefaultersToCsv}
            className="flex items-center gap-2 font-medium"
          >
            <Download className="w-4 h-4 text-slate-700" />
            Export Defaulters CSV
          </Button>
        }
      />

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Total Enrolled</p>
              <p className="text-2xl font-bold text-slate-900">{performance.totalStudents}</p>
              <span className="text-xs font-medium text-slate-500">{performance.totalSubjects} Subjects</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Average IAT 1 / 2</p>
              <p className="text-2xl font-bold text-slate-900">
                {performance.overallAverageIat1 != null ? `${performance.overallAverageIat1}` : 'N/A'}{' '}
                <span className="text-sm font-normal text-slate-500">/ {performance.overallAverageIat2 != null ? `${performance.overallAverageIat2}` : 'N/A'}</span>
              </p>
              <span className="text-xs font-medium text-slate-500">Max 50 marks</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Avg Attendance</p>
              <p className="text-2xl font-bold text-emerald-700">
                {performance.overallAverageAttendance != null ? `${performance.overallAverageAttendance}%` : 'N/A'}
              </p>
              <span className="text-xs font-medium text-slate-500">Dept Overall</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Defaulters / At-Risk</p>
              <p className="text-2xl font-bold text-rose-700">
                {performance.totalDefaultersCount}
              </p>
              <span className="text-xs font-medium text-slate-500">&lt; 75% att. or &lt; 20 marks</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('subjects')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'subjects'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Subject-wise Performance ({performance.subjectPerformances.length})
        </button>
        <button
          onClick={() => setActiveTab('sections')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'sections'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Section Averages ({performance.sectionPerformances.length})
        </button>
        <button
          onClick={() => setActiveTab('defaulters')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'defaulters'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Defaulters &amp; Low Scorers ({performance.defaulters.length})
        </button>
      </div>

      {/* Tab 1: Subject Performance */}
      {activeTab === 'subjects' && (
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Curriculum Subjects Academic Breakdown
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
                    <th className="px-6 py-3.5 font-bold">Avg Assignment</th>
                    <th className="px-6 py-3.5 font-bold">Avg Attendance</th>
                    <th className="px-6 py-3.5 font-bold">Pass Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {performance.subjectPerformances.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-600 font-medium">
                        No subject performance records found.
                      </td>
                    </tr>
                  ) : (
                    performance.subjectPerformances.map((sub) => (
                      <tr key={sub.subjectId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{sub.subjectName}</p>
                          <span className="text-xs text-slate-500 font-mono font-medium">{sub.subjectCode}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          Sem {sub.semester}
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          {sub.totalStudents}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {sub.averageIat1 != null ? `${sub.averageIat1}` : '-'}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {sub.averageIat2 != null ? `${sub.averageIat2}` : '-'}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {sub.averageAssignment != null ? `${sub.averageAssignment}` : '-'}
                        </td>
                        <td className="px-6 py-4 font-bold">
                          {sub.averageAttendance != null ? (
                            <span className={sub.averageAttendance >= 75 ? 'text-emerald-700' : 'text-rose-700'}>
                              {sub.averageAttendance}%
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {sub.passPercentage != null ? (
                            <Badge variant={sub.passPercentage >= 75 ? 'emerald' : sub.passPercentage >= 50 ? 'amber' : 'rose'}>
                              {sub.passPercentage}%
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
      )}

      {/* Tab 2: Section Averages */}
      {activeTab === 'sections' && (
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Section-wise Comparative Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5 font-bold">Section</th>
                    <th className="px-6 py-3.5 font-bold">Student Strength</th>
                    <th className="px-6 py-3.5 font-bold">Avg IAT 1 Score</th>
                    <th className="px-6 py-3.5 font-bold">Avg IAT 2 Score</th>
                    <th className="px-6 py-3.5 font-bold">Avg Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {performance.sectionPerformances.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-600 font-medium">
                        No section metrics available.
                      </td>
                    </tr>
                  ) : (
                    performance.sectionPerformances.map((sec) => (
                      <tr key={sec.sectionId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {sec.sectionName}
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          {sec.studentCount} Students
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {sec.averageIat1 != null ? `${sec.averageIat1}` : '-'}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {sec.averageIat2 != null ? `${sec.averageIat2}` : '-'}
                        </td>
                        <td className="px-6 py-4 font-bold">
                          {sec.averageAttendance != null ? (
                            <span className={sec.averageAttendance >= 75 ? 'text-emerald-700' : 'text-rose-700'}>
                              {sec.averageAttendance}%
                            </span>
                          ) : (
                            '-'
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
      )}

      {/* Tab 3: Defaulters */}
      {activeTab === 'defaulters' && (
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
              Academic Defaulters &amp; Low Attendance List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5 font-bold">Register No</th>
                    <th className="px-6 py-3.5 font-bold">Student Name</th>
                    <th className="px-6 py-3.5 font-bold">Section</th>
                    <th className="px-6 py-3.5 font-bold">Subject</th>
                    <th className="px-6 py-3.5 font-bold">IAT 1</th>
                    <th className="px-6 py-3.5 font-bold">IAT 2</th>
                    <th className="px-6 py-3.5 font-bold">Attendance</th>
                    <th className="px-6 py-3.5 font-bold">Deficiency Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {performance.defaulters.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-emerald-700 font-semibold">
                        No academic or attendance defaulters found in this department!
                      </td>
                    </tr>
                  ) : (
                    performance.defaulters.map((d, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">
                          {d.registerNumber}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {d.studentName}
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          {d.sectionName}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-slate-900">{d.subjectCode}</p>
                          <p className="text-xs text-slate-600 truncate max-w-xs">{d.subjectName}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {d.iat1Score != null ? (
                            <span className={Number(d.iat1Score) < 20 ? 'text-rose-700 font-bold' : ''}>
                              {d.iat1Score}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {d.iat2Score != null ? (
                            <span className={Number(d.iat2Score) < 20 ? 'text-rose-700 font-bold' : ''}>
                              {d.iat2Score}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {d.attendancePercentage != null ? (
                            <span className={Number(d.attendancePercentage) < 75 ? 'text-rose-700 font-bold' : ''}>
                              {d.attendancePercentage}%
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {d.attendancePercentage != null && Number(d.attendancePercentage) < 75 && (
                            <Badge variant="rose" className="mr-1">Low Att.</Badge>
                          )}
                          {((d.iat1Score != null && Number(d.iat1Score) < 20) ||
                            (d.iat2Score != null && Number(d.iat2Score) < 20)) && (
                            <Badge variant="amber">Low IAT</Badge>
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
      )}
    </div>
  );
};

export default HodPerformancePage;
