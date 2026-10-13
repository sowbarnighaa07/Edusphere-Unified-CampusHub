import { useState, useEffect, useRef } from 'react';
import { staffService } from '../../services/staff.service';
import { excelService } from '../../services/excel.service';
import { StaffClassSummary } from '../../types/staff.types';
import {
  ExcelImportType,
  ExcelPreviewResponse,
  ExcelRowPreview,
  ExcelConfirmResult,
  IMPORT_TYPE_LABELS,
  IMPORT_TYPE_RANGE,
} from '../../types/excel.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  RotateCcw,
  Download,
} from 'lucide-react';

// ─── Workflow steps ────────────────────────────────────────────────────────────
type Step = 'setup' | 'preview' | 'success';

const IMPORT_OPTIONS = [
  { value: 'ATTENDANCE', label: 'Attendance Percentage (0–100%)' },
  { value: 'IAT1',       label: 'IAT 1 Marks (0–50)' },
  { value: 'IAT2',       label: 'IAT 2 Marks (0–50)' },
];

export const StaffExcelPage = () => {
  // ── Step state ─────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('setup');

  // ── Setup state ────────────────────────────────────────────────────────────
  const [classes, setClasses]             = useState<StaffClassSummary[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedTaId, setSelectedTaId]   = useState<number | ''>('');
  const [importType, setImportType]       = useState<ExcelImportType>('ATTENDANCE');
  const [file, setFile]                   = useState<File | null>(null);
  const [uploading, setUploading]         = useState(false);
  const fileInputRef                      = useRef<HTMLInputElement>(null);

  // ── Preview state ──────────────────────────────────────────────────────────
  const [preview, setPreview]             = useState<ExcelPreviewResponse | null>(null);
  const [confirming, setConfirming]       = useState(false);

  // ── Success state ──────────────────────────────────────────────────────────
  const [result, setResult]               = useState<ExcelConfirmResult | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    staffService.getAssignedClasses()
      .then(setClasses)
      .catch(() => showToast('Failed to load assigned classes', 'error'))
      .finally(() => setLoadingClasses(false));
  }, []);

  // ─── Step A: Upload & Preview ────────────────────────────────────────────────
  const handleUploadPreview = async () => {
    if (!selectedTaId || !file) {
      showToast('Please select a class and choose an Excel file.', 'error');
      return;
    }
    setUploading(true);
    try {
      const data = await excelService.preview(Number(selectedTaId), importType, file);
      setPreview(data);
      setStep('preview');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to parse the Excel file.';
      showToast(msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  // ─── Step B: Confirm ─────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!preview?.importToken) {
      showToast('No valid rows to import.', 'error');
      return;
    }
    setConfirming(true);
    try {
      const res = await excelService.confirm({
        importToken: preview.importToken,
        teachingAssignmentId: preview.teachingAssignmentId,
      });
      setResult(res);
      setStep('success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Import failed. Please try again.';
      showToast(msg, 'error');
    } finally {
      setConfirming(false);
    }
  };

  // ─── Reset ────────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setStep('setup');
    setPreview(null);
    setResult(null);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };


  // ─── Template download helper ─────────────────────────────────────────────────
  const downloadTemplate = () => {
    const headerCol3 = importType === 'ATTENDANCE' ? 'Attendance %'
                     : importType === 'IAT1' ? 'IAT1 Score' : 'IAT2 Score';
    const csvContent = `Register Number,Student Name,${headerCol3}\n21CS001,Sample Student,85\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `template_${importType.toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Template downloaded. Save as .xlsx before uploading.', 'info');
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Excel Data Import"
        description="Bulk upload attendance, IAT 1, or IAT 2 data via Apache POI validated import."
        badge={
          step === 'preview' && preview
            ? <Badge variant={preview.hasErrors ? 'amber' : 'emerald'}>
                {preview.hasErrors ? `${preview.invalidRows} Error(s)` : 'All Rows Valid'}
              </Badge>
            : undefined
        }
      />

      {/* ── Workflow breadcrumb ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm">
        {(['setup', 'preview', 'success'] as Step[]).map((s, i) => {
          const labels: Record<Step, string> = { setup: '1. Setup & Upload', preview: '2. Preview & Validate', success: '3. Import Complete' };
          const active = step === s;
          const done = (step === 'preview' && i < 1) || (step === 'success' && i < 2);
          return (
            <span key={s} className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                active ? 'bg-brand-600 text-white border-brand-600'
                : done ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}>
                {labels[s]}
              </span>
              {i < 2 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </span>
          );
        })}
      </div>

      {/* ══ STEP 1: SETUP ══════════════════════════════════════════════════════ */}
      {step === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration card */}
          <Card>
            <CardHeader>
              <CardTitle>Import Configuration</CardTitle>
              <CardDescription>Select the class, import type, and upload your Excel file.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {loadingClasses ? (
                <LoadingState message="Loading your assigned classes..." />
              ) : classes.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="w-5 h-5 text-slate-400" />}
                  title="No Classes Assigned"
                  description="You must be assigned to at least one teaching class to import data."
                />
              ) : (
                <>
                  <Select
                    label="Teaching Class"
                    value={selectedTaId === '' ? '' : String(selectedTaId)}
                    onChange={e => setSelectedTaId(e.target.value === '' ? '' : Number(e.target.value))}
                    options={[
                      { value: '', label: '— Select a class —' },
                      ...classes.map(c => ({
                        value: String(c.teachingAssignmentId),
                        label: `${c.subjectCode} – ${c.subjectName} (Sec ${c.sectionName}, Sem ${c.semester})`,
                      })),
                    ]}
                  />

                  <Select
                    label="Import Type"
                    value={importType}
                    onChange={e => setImportType(e.target.value as ExcelImportType)}
                    options={IMPORT_OPTIONS}
                    helperText={`Valid range: ${IMPORT_TYPE_RANGE[importType]}`}
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Excel File (.xlsx)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx"
                      onChange={e => setFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer border border-slate-200 rounded-lg p-2"
                    />
                    {file && (
                      <p className="mt-1 text-xs text-slate-500">
                        Selected: <span className="font-mono">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleUploadPreview}
                    isLoading={uploading}
                    disabled={!selectedTaId || !file}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload & Preview
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Instructions card */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions & Template</CardTitle>
              <CardDescription>Follow the required Excel format exactly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert type="info">
                <p className="text-sm font-medium mb-2">Required Excel Column Format</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Column</TableHead>
                      <TableHead>Header</TableHead>
                      <TableHead>Example</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono font-bold">A</TableCell>
                      <TableCell>Register Number</TableCell>
                      <TableCell className="font-mono">21CS001</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono font-bold">B</TableCell>
                      <TableCell>Student Name</TableCell>
                      <TableCell className="font-mono">Arjun Kumar</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono font-bold">C</TableCell>
                      <TableCell>
                        {importType === 'ATTENDANCE' ? 'Attendance %' : importType === 'IAT1' ? 'IAT1 Score' : 'IAT2 Score'}
                      </TableCell>
                      <TableCell className="font-mono">
                        {importType === 'ATTENDANCE' ? '85.5' : '42'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Alert>

              <div className="space-y-2 text-sm text-slate-600">
                <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Only students enrolled in the selected section will be accepted.</p>
                <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Duplicate register numbers in the same file will be flagged as errors.</p>
                <p className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Existing records are updated (upsert). No data is lost for untouched fields.</p>
                <p className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> Range: {IMPORT_TYPE_RANGE[importType]}. Out-of-range values will be rejected.</p>
                <p className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> Data is only written to MySQL after you click <strong>Confirm Import</strong>.</p>
              </div>

              <Button variant="outline" size="sm" onClick={downloadTemplate} className="w-full">
                <Download className="w-3.5 h-3.5 mr-2" />
                Download CSV Template
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══ STEP 2: PREVIEW & VALIDATE ═════════════════════════════════════════ */}
      {step === 'preview' && preview && (
        <div className="space-y-4">
          {/* Summary banner */}
          <Card>
            <CardContent className="py-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Info */}
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {IMPORT_TYPE_LABELS[preview.importType]} — {preview.subjectCode} / Section {preview.sectionName}
                  </p>
                  <p className="text-xs text-slate-500">
                    File: <span className="font-mono">{preview.fileName}</span> &nbsp;•&nbsp; Semester {preview.semester} ({preview.academicYear})
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs">
                      <span className="font-bold text-slate-900">{preview.totalRows}</span>
                      <span className="text-slate-500"> total rows</span>
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold">
                      ✓ {preview.validRows} valid
                    </span>
                    {preview.invalidRows > 0 && (
                      <span className="text-xs text-rose-700 font-semibold">
                        ✗ {preview.invalidRows} invalid
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Re-upload
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirm}
                    isLoading={confirming}
                    disabled={preview.validRows === 0 || preview.importToken === null}
                    variant={preview.hasErrors ? 'secondary' : 'primary'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    {preview.hasErrors
                      ? `Confirm ${preview.validRows} Valid Rows`
                      : `Confirm Import (${preview.validRows} rows)`}
                  </Button>
                </div>
              </div>

              {/* Error banner */}
              {preview.hasErrors && (
                <Alert type="warning" className="mt-4">
                  <p className="font-medium text-sm">
                    {preview.invalidRows} row{preview.invalidRows > 1 ? 's' : ''} failed validation
                    and will be skipped.
                  </p>
                  <p className="text-xs mt-1">
                    Only the {preview.validRows} valid row{preview.validRows !== 1 ? 's' : ''} will be
                    saved. Fix the Excel file and re-upload to include the skipped rows.
                  </p>
                </Alert>
              )}

              {preview.importToken === null && (
                <Alert type="error" className="mt-4">
                  <p className="font-medium text-sm">All rows failed validation — nothing to import.</p>
                  <p className="text-xs mt-1">Fix the Excel file errors shown below and re-upload.</p>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Per-row table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Row-by-Row Validation</CardTitle>
              <CardDescription>
                Review every row. Rows marked <span className="text-rose-600 font-medium">Invalid</span> will be skipped; only <span className="text-emerald-600 font-medium">Valid</span> rows are saved on confirm.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Register No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows.map((row: ExcelRowPreview) => (
                    <TableRow
                      key={row.rowNumber}
                      className={!row.valid ? 'bg-rose-50/40' : ''}
                    >
                      <TableCell className="font-mono text-slate-500 text-xs w-12">
                        {row.rowNumber}
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-slate-900 text-xs">
                        {row.registerNumber || <span className="text-slate-400 italic">blank</span>}
                      </TableCell>
                      <TableCell className="text-slate-700 text-sm">
                        {row.studentName || <span className="text-slate-400 italic">—</span>}
                      </TableCell>
                      <TableCell>
                        {row.value !== null && row.value !== undefined ? (
                          <span className="font-mono font-bold text-slate-900">
                            {row.value}
                            {preview.importType === 'ATTENDANCE' ? '%' : ''}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">missing</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.valid ? (
                          <Badge variant="emerald">
                            <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="rose">
                            <XCircle className="w-3 h-3 mr-1 inline" />
                            Invalid
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-rose-700 max-w-xs">
                        {row.errorReason || (row.valid ? <span className="text-slate-400">—</span> : null)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══ STEP 3: SUCCESS ════════════════════════════════════════════════════ */}
      {step === 'success' && result && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center gap-6 max-w-md mx-auto">
              <div className="p-4 rounded-full bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">Import Successful</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {IMPORT_TYPE_LABELS[result.importType]} data has been saved to the database.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 w-full">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{result.savedRows}</p>
                  <p className="text-xs text-emerald-600 mt-1">Rows Saved</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-2xl font-bold text-slate-700">{result.skippedRows}</p>
                  <p className="text-xs text-slate-500 mt-1">Rows Skipped</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 text-center">
                  <p className="text-sm font-bold text-indigo-700 font-mono">{result.subjectCode}</p>
                  <p className="text-xs text-indigo-500 mt-1">Section {result.sectionName}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleReset}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Import Another File
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
