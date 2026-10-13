import { useState, useEffect } from 'react';
import { studentService } from '../../services/student.service';
import { StudentClassroom, StudentClassroomMaterial } from '../../types/student.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import {
  Download,
  FileText,
  BookOpen,
  User,
  Mail,
  Calendar,
  Layers,
} from 'lucide-react';

export const StudentClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState<StudentClassroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null);
  const [materials, setMaterials] = useState<StudentClassroomMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    const fetchClassrooms = async () => {
      setLoading(true);
      try {
        const data = await studentService.getClassrooms();
        setClassrooms(data);
        if (data.length > 0) {
          // Select the first classroom by default
          handleSelectClassroom(data[0].classroomId);
        }
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Failed to load classrooms', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchClassrooms();
  }, []);

  const handleSelectClassroom = async (classroomId: number) => {
    setSelectedClassroomId(classroomId);
    setMaterials([]);
    setLoadingMaterials(true);
    try {
      const mats = await studentService.getClassroomMaterials(classroomId);
      setMaterials(mats);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load classroom materials', 'error');
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleDownload = async (mat: StudentClassroomMaterial) => {
    if (!selectedClassroomId) return;
    setDownloadingId(mat.id);
    try {
      await studentService.downloadMaterial(selectedClassroomId, mat.id, mat.fileName);
      showToast(`Downloading ${mat.fileName}`, 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Download failed. Please try again.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const selectedClassroom = classrooms.find(c => c.classroomId === selectedClassroomId);

  if (loading) return <LoadingState message="Loading your virtual classrooms..." />;

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Virtual Classrooms"
        description="Access lecture notes, unit syllabus, and academic resources uploaded by your course faculty."
        badge={
          <Badge variant="indigo">
            {classrooms.length} {classrooms.length === 1 ? 'Classroom' : 'Classrooms'} Enrolled
          </Badge>
        }
      />

      {classrooms.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={<BookOpen className="w-8 h-8 text-slate-400" />}
              title="No Virtual Classrooms Assigned"
              description="No active virtual classrooms were found for your section and semester."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Classrooms sidebar list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Enrolled Courses ({classrooms.length})
              </p>
              <Badge variant="slate">Sem {classrooms[0]?.semester || 1}</Badge>
            </div>

            <div className="space-y-2.5">
              {classrooms.map((cls) => {
                const isSelected = selectedClassroomId === cls.classroomId;
                return (
                  <button
                    key={cls.classroomId}
                    onClick={() => handleSelectClassroom(cls.classroomId)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-150 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 shadow-sm ring-1 ring-brand-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {cls.subjectCode}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="slate">{cls.credits} Cr</Badge>
                        {cls.materialCount > 0 && (
                          <Badge variant="indigo">{cls.materialCount} notes</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1 mb-1">
                      {cls.subjectName}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{cls.facultyName}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Classroom detail & materials */}
          <div className="lg:col-span-2 space-y-4">
            {selectedClassroom && (
              <>
                {/* Classroom header card */}
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                            {selectedClassroom.subjectCode}
                          </span>
                          <Badge variant={selectedClassroom.isActive ? 'emerald' : 'slate'}>
                            {selectedClassroom.isActive ? 'Active Course' : 'Archived'}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg font-bold text-slate-900">
                          {selectedClassroom.subjectName}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500 mt-1">
                          {selectedClassroom.departmentCode} • Section {selectedClassroom.sectionName} • Semester {selectedClassroom.semester} ({selectedClassroom.academicYear})
                        </CardDescription>
                      </div>

                      {/* Faculty Info Badge Card */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 sm:max-w-[220px]">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <User className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          <span className="truncate">{selectedClassroom.facultyName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a
                            href={`mailto:${selectedClassroom.facultyEmail}`}
                            className="text-[11px] text-brand-600 hover:underline truncate"
                          >
                            {selectedClassroom.facultyEmail}
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {selectedClassroom.description && (
                      <p className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-lg border border-slate-100 leading-relaxed mb-3">
                        {selectedClassroom.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                        <Layers className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                        <p className="font-bold text-slate-900">{selectedClassroom.credits} Credits</p>
                        <p className="text-slate-500 text-[11px]">Curriculum Weight</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                        <FileText className="w-4 h-4 text-brand-500 mx-auto mb-1" />
                        <p className="font-bold text-slate-900">{selectedClassroom.materialCount}</p>
                        <p className="text-slate-500 text-[11px]">Uploaded Resources</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center col-span-2 sm:col-span-1">
                        <Calendar className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                        <p className="font-bold text-slate-900">Sem {selectedClassroom.semester}</p>
                        <p className="text-slate-500 text-[11px]">{selectedClassroom.academicYear}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Materials List Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900">
                          Course Notes & Study Materials
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Download officially shared lecture slides, syllabus sheets, and reference notes.
                        </CardDescription>
                      </div>
                      <Badge variant="indigo">
                        {materials.length} {materials.length === 1 ? 'Resource' : 'Resources'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {loadingMaterials ? (
                      <div className="p-8">
                        <LoadingState message="Fetching course notes and resources..." />
                      </div>
                    ) : materials.length === 0 ? (
                      <div className="p-8">
                        <EmptyState
                          icon={<FileText className="w-6 h-6 text-slate-400" />}
                          title="No Materials Uploaded Yet"
                          description="Your assigned faculty has not yet uploaded study materials for this classroom."
                        />
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Resource Title</TableHead>
                            <TableHead>File Name</TableHead>
                            <TableHead>Uploaded On</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {materials.map((mat) => (
                            <TableRow key={mat.id} className="hover:bg-slate-50/70">
                              <TableCell className="max-w-xs">
                                <div className="flex items-start gap-2.5">
                                  <div className="p-2 rounded bg-brand-50 text-brand-600 mt-0.5 shrink-0">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900 text-sm">{mat.title}</p>
                                    {mat.description && (
                                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-snug">
                                        {mat.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs font-mono text-slate-600 max-w-[150px] truncate">
                                {mat.fileName}
                              </TableCell>
                              <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                                {new Date(mat.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownload(mat)}
                                  isLoading={downloadingId === mat.id}
                                  className="text-xs"
                                >
                                  <Download className="w-3.5 h-3.5 mr-1" />
                                  Download
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
      )}
    </div>
  );
};
