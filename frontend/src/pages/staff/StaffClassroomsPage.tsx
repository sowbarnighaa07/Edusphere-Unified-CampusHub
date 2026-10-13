import { useState, useEffect } from 'react';
import { staffService } from '../../services/staff.service';
import { StaffClassSummary, ClassroomDetail, ClassroomMaterial } from '../../types/staff.types';
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
import { Video, Upload, Trash2, FileText, BookOpen, Users, ClipboardList, AlertTriangle } from 'lucide-react';

export const StaffClassroomsPage = () => {
  const [classes, setClasses] = useState<StaffClassSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaId, setSelectedTaId] = useState<number | null>(null);
  const [classroom, setClassroom] = useState<ClassroomDetail | null>(null);
  const [materials, setMaterials] = useState<ClassroomMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  // Upload modal state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    staffService.getAssignedClasses()
      .then(setClasses)
      .catch(() => showToast('Failed to load assigned classes', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectClass = async (taId: number) => {
    setSelectedTaId(taId);
    setClassroom(null);
    setMaterials([]);
    setLoadingMaterials(true);
    try {
      const [detail, mats] = await Promise.all([
        staffService.getClassroomDetails(taId),
        staffService.getMaterials(taId),
      ]);
      setClassroom(detail);
      setMaterials(mats);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load classroom', 'error');
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle.trim() || selectedTaId === null) {
      showToast('Title and file are required.', 'error');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadTitle.trim());
      if (uploadDescription.trim()) formData.append('description', uploadDescription.trim());
      formData.append('file', uploadFile);
      const newMaterial = await staffService.uploadMaterial(selectedTaId, formData);
      setMaterials(prev => [newMaterial, ...prev]);
      setClassroom(prev => prev ? { ...prev, materialCount: prev.materialCount + 1 } : prev);
      setUploadOpen(false);
      setUploadTitle('');
      setUploadDescription('');
      setUploadFile(null);
      showToast('Material uploaded successfully.', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await staffService.deleteMaterial(id);
      setMaterials(prev => prev.filter(m => m.id !== id));
      setClassroom(prev => prev ? { ...prev, materialCount: Math.max(0, prev.materialCount - 1) } : prev);
      showToast('Material deleted.', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Delete failed.', 'error');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  if (loading) return <LoadingState message="Loading assigned teaching classes..." />;

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Virtual Classrooms"
        description="Manage course materials, lecture notes, and study resources for your assigned sections."
        badge={
          <Badge variant="indigo">{classes.length} {classes.length === 1 ? 'Classroom' : 'Classrooms'}</Badge>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class selector sidebar */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">Select a Class</p>
          {classes.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <EmptyState
                  icon={<BookOpen className="w-5 h-5 text-slate-400" />}
                  title="No Classes Assigned"
                  description="No teaching assignments found for your account."
                />
              </CardContent>
            </Card>
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

        {/* Classroom content panel */}
        <div className="lg:col-span-2 space-y-4">
          {selectedTaId === null ? (
            <Card>
              <CardContent className="p-12">
                <EmptyState
                  icon={<Video className="w-6 h-6 text-slate-400" />}
                  title="Select a Classroom"
                  description="Choose a class from the left panel to manage its materials and resources."
                />
              </CardContent>
            </Card>
          ) : loadingMaterials ? (
            <LoadingState message="Loading classroom materials..." />
          ) : classroom && (
            <>
              {/* Classroom stats */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle>{classroom.name}</CardTitle>
                      <CardDescription>
                        {classroom.subjectCode} • {classroom.departmentCode} Section {classroom.sectionName} • Semester {classroom.semester} ({classroom.academicYear})
                      </CardDescription>
                    </div>
                    <Badge variant={classroom.isActive ? 'emerald' : 'slate'}>
                      {classroom.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <Users className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <p className="font-bold text-slate-900">{classroom.enrolledStudentCount}</p>
                      <p className="text-slate-500">Students</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <FileText className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <p className="font-bold text-slate-900">{classroom.materialCount}</p>
                      <p className="text-slate-500">Materials</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <ClipboardList className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <p className="font-bold text-slate-900">{classroom.assignmentCount}</p>
                      <p className="text-slate-500">Assignments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Materials list */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Course Materials</CardTitle>
                      <CardDescription>Syllabus, lecture notes, and study resources</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => setUploadOpen(true)}>
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      Upload Material
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {materials.length === 0 ? (
                    <EmptyState
                      icon={<FileText className="w-5 h-5 text-slate-400" />}
                      title="No Materials Uploaded"
                      description="Upload lecture notes, syllabus, or study resources for your students."
                      action={
                        <Button size="sm" variant="outline" onClick={() => setUploadOpen(true)}>
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                          Upload First Material
                        </Button>
                      }
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>File Name</TableHead>
                          <TableHead>Uploaded</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {materials.map(mat => (
                          <TableRow key={mat.id}>
                            <TableCell>
                              <p className="font-medium text-slate-900 text-sm">{mat.title}</p>
                              {mat.description && (
                                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{mat.description}</p>
                              )}
                            </TableCell>
                            <TableCell className="text-xs font-mono text-slate-600 truncate max-w-[160px]">
                              {mat.fileName}
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">
                              {new Date(mat.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirmDeleteId(mat.id)}
                                disabled={deletingId === mat.id}
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
            </>
          )}
        </div>
      </div>

      {/* Upload Material Modal */}
      <Modal
        isOpen={uploadOpen}
        onClose={() => { setUploadOpen(false); setUploadTitle(''); setUploadDescription(''); setUploadFile(null); }}
        title="Upload Course Material"
        description="Add a lecture note, syllabus, or study resource to this classroom."
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setUploadOpen(false)} disabled={uploading}>Cancel</Button>
            <Button size="sm" onClick={handleUpload} isLoading={uploading}>Upload Material</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Material Title"
            value={uploadTitle}
            onChange={e => setUploadTitle(e.target.value)}
            placeholder="e.g. Unit 2 – Database Normalization Notes"
          />
          <Textarea
            label="Description (Optional)"
            value={uploadDescription}
            onChange={e => setUploadDescription(e.target.value)}
            placeholder="Brief description of this material..."
            rows={2}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">File</label>
            <input
              type="file"
              onChange={e => setUploadFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer border border-slate-200 rounded-lg p-2"
            />
            {uploadFile && (
              <p className="text-xs text-slate-500 mt-1">Selected: {uploadFile.name}</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title="Delete Material"
        description="This action is permanent. The file will be removed from the classroom and students will lose access."
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)} isLoading={deletingId !== null}>
              Delete Material
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-lg border border-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700">
            Are you sure you want to permanently delete this material? Students will no longer be able to access it.
          </p>
        </div>
      </Modal>
    </div>
  );
};
