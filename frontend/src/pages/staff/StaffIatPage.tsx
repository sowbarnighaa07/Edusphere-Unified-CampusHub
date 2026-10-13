import { useState, useEffect } from 'react';
import { staffService } from '../../services/staff.service';
import {
  StaffClassSummary,
  StudentAcademicRecord,
  MarkField,
  BatchMarkUpdateRequest,
} from '../../types/staff.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { BarChart3, BookOpen, Save, CheckCircle2 } from 'lucide-react';

const FIELD_OPTIONS: { value: MarkField; label: string; max: number; placeholder: string }[] = [
  { value: 'iat1Score', label: 'IAT 1 Score (out of 50)', max: 50, placeholder: '0 – 50' },
  { value: 'iat2Score', label: 'IAT 2 Score (out of 50)', max: 50, placeholder: '0 – 50' },
  { value: 'assignmentScore', label: 'Assignment Score (out of 25)', max: 25, placeholder: '0 – 25' },
  { value: 'attendancePercentage', label: 'Attendance Percentage (0 – 100)', max: 100, placeholder: '0 – 100' },
];

export const StaffIatPage = () => {
  const [classes, setClasses] = useState<StaffClassSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaId, setSelectedTaId] = useState<number | null>(null);
  const [records, setRecords] = useState<StudentAcademicRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [selectedField, setSelectedField] = useState<MarkField>('iat1Score');
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    staffService.getAssignedClasses()
      .then(setClasses)
      .catch(() => showToast('Failed to load classes', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectClass = async (taId: number) => {
    setSelectedTaId(taId);
    setRecords([]);
    setDrafts({});
    setSavedCount(null);
    setLoadingRecords(true);
    try {
      const data = await staffService.getAcademicRecords(taId);
      setRecords(data);
      // Pre-populate drafts with existing values
      const initial: Record<number, string> = {};
      for (const r of data) {
        const val = r[selectedField];
        initial[r.studentProfileId] = val !== undefined && val !== null ? String(val) : '';
      }
      setDrafts(initial);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load student records', 'error');
    } finally {
      setLoadingRecords(false);
    }
  };

  // When field changes, re-populate drafts from existing records
  const handleFieldChange = (newField: MarkField) => {
    setSelectedField(newField);
    setSavedCount(null);
    const updated: Record<number, string> = {};
    for (const r of records) {
      const val = r[newField];
      updated[r.studentProfileId] = val !== undefined && val !== null ? String(val) : '';
    }
    setDrafts(updated);
  };

  const handleDraftChange = (studentProfileId: number, value: string) => {
    setDrafts(prev => ({ ...prev, [studentProfileId]: value }));
  };

  const fieldOption = FIELD_OPTIONS.find(f => f.value === selectedField)!;

  const handleSave = async () => {
    if (selectedTaId === null) return;
    const entries: BatchMarkUpdateRequest['entries'] = [];
    let hasError = false;

    for (const r of records) {
      const raw = drafts[r.studentProfileId];
      if (raw === '' || raw === undefined) {
        entries.push({ studentProfileId: r.studentProfileId, value: null });
      } else {
        const num = parseFloat(raw);
        if (isNaN(num) || num < 0 || num > fieldOption.max) {
          showToast(`Invalid value for ${r.fullName}: must be 0–${fieldOption.max}.`, 'error');
          hasError = true;
          break;
        }
        entries.push({ studentProfileId: r.studentProfileId, value: num });
      }
    }

    if (hasError) return;

    setSaving(true);
    try {
      await staffService.batchUpdateMarks({ teachingAssignmentId: selectedTaId, field: selectedField, entries });
      // Refresh records from server
      const updated = await staffService.getAcademicRecords(selectedTaId);
      setRecords(updated);
      const newDrafts: Record<number, string> = {};
      for (const r of updated) {
        const val = r[selectedField];
        newDrafts[r.studentProfileId] = val !== undefined && val !== null ? String(val) : '';
      }
      setDrafts(newDrafts);
      setSavedCount(entries.filter(e => e.value !== null).length);
      showToast(`${fieldOption.label} saved for ${entries.length} students.`, 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save marks.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading assigned classes..." />;

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="IAT & Assessment Records"
        description="Enter and update IAT 1, IAT 2, assignment scores, and attendance percentages for each class."
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

        {/* Marks entry panel */}
        <div className="lg:col-span-2 space-y-4">
          {selectedTaId === null ? (
            <Card><CardContent className="p-12">
              <EmptyState
                icon={<BarChart3 className="w-6 h-6 text-slate-400" />}
                title="Select a Class"
                description="Choose a class from the left to enter IAT and attendance marks."
              />
            </CardContent></Card>
          ) : loadingRecords ? (
            <LoadingState message="Loading student academic records..." />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">Batch Mark Entry</CardTitle>
                    <CardDescription>
                      Enter marks for all {records.length} enrolled students. Leave blank to clear a value.
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    isLoading={saving}
                    disabled={records.length === 0}
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save All Marks
                  </Button>
                </div>

                {/* Field selector */}
                <div className="mt-4">
                  <Select
                    label="Field to Update"
                    value={selectedField}
                    onChange={e => handleFieldChange(e.target.value as MarkField)}
                    options={FIELD_OPTIONS.map(f => ({ value: f.value, label: f.label }))}
                  />
                </div>

                {savedCount !== null && (
                  <div className="flex items-center gap-2 mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Saved marks for {savedCount} students successfully.
                  </div>
                )}
              </CardHeader>

              <CardContent>
                {records.length === 0 ? (
                  <EmptyState
                    icon={<BarChart3 className="w-5 h-5 text-slate-400" />}
                    title="No Students Enrolled"
                    description="No active students found in this section."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Register No</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Current Value</TableHead>
                        <TableHead>New Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map(r => {
                        const current = r[selectedField];
                        return (
                          <TableRow key={r.studentProfileId}>
                            <TableCell className="font-mono font-bold text-slate-900 text-xs">
                              {r.registerNumber}
                            </TableCell>
                            <TableCell className="font-medium text-slate-800 text-sm">
                              {r.fullName}
                            </TableCell>
                            <TableCell>
                              {current !== undefined && current !== null ? (
                                <Badge variant={
                                  selectedField === 'attendancePercentage'
                                    ? (current >= 75 ? 'emerald' : 'amber')
                                    : 'slate'
                                }>
                                  {current}{selectedField === 'attendancePercentage' ? '%' : ''}
                                </Badge>
                              ) : (
                                <span className="text-xs text-slate-400">Not entered</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <input
                                type="number"
                                step="0.01"
                                min={0}
                                max={fieldOption.max}
                                value={drafts[r.studentProfileId] ?? ''}
                                onChange={e => handleDraftChange(r.studentProfileId, e.target.value)}
                                placeholder={fieldOption.placeholder}
                                className="w-28 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 font-mono focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
