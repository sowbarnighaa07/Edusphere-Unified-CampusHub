import React, { useState, useEffect } from 'react';
import { workspaceService } from '../../services/workspace.service';
import { WorkspaceItem, CreateWorkspaceForm, WorkspaceType } from '../../types/workspace.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useToast } from '../../components/feedback/Toast';
import { FileText, CheckSquare, Trash2, CheckCircle2, Circle } from 'lucide-react';

export const PersonalWorkspacePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'NOTE' | 'TASK'>('ALL');
  const [documents, setDocuments] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalType, setModalType] = useState<WorkspaceType>('NOTE');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, [activeTab]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await workspaceService.getMyDocuments(
        activeTab !== 'ALL' ? activeTab : undefined
      );
      setDocuments(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load personal workspace', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = (type: WorkspaceType) => {
    setModalType(type);
    setTitle('');
    setContent('');
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Title is required.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const form: CreateWorkspaceForm = {
        title: title.trim(),
        content: content.trim() || undefined,
        type: modalType,
      };
      await workspaceService.createDocument(form);
      showToast(`${modalType === 'NOTE' ? 'Note' : 'Task'} saved to workspace.`, 'success');
      setIsCreateModalOpen(false);
      fetchDocuments();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save document', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTask = async (id: number) => {
    try {
      await workspaceService.toggleTask(id);
      fetchDocuments();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update task status', 'error');
    }
  };

  const handleDeleteDocument = async (id: number) => {
    try {
      await workspaceService.deleteDocument(id);
      showToast('Document deleted.', 'success');
      fetchDocuments();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete document', 'error');
    }
  };

  const notesCount = documents.filter((d) => d.type === 'NOTE').length;
  const tasksCount = documents.filter((d) => d.type === 'TASK').length;

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Personal Workspace & Tasks"
        description="Private notes, reminders, and personal task checklists"
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => handleOpenCreateModal('NOTE')}>
              <FileText className="w-4 h-4 mr-1.5" />
              New Note
            </Button>
            <Button size="sm" onClick={() => handleOpenCreateModal('TASK')}>
              <CheckSquare className="w-4 h-4 mr-1.5" />
              New Task
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {(['ALL', 'NOTE', 'TASK'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === t
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t === 'ALL' ? `All Items (${documents.length})` : t === 'NOTE' ? `Notes (${notesCount})` : `Tasks (${tasksCount})`}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading your workspace documents..." />
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={<FileText className="w-6 h-6 text-slate-400" />}
              title="Workspace is Empty"
              description="Keep personal notes, lecture reminders, study schedules, and project checklists here."
              action={
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleOpenCreateModal('NOTE')}>
                    Create Note
                  </Button>
                  <Button size="sm" onClick={() => handleOpenCreateModal('TASK')}>
                    Create Task
                  </Button>
                </div>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              className={`transition-colors ${
                doc.isCompleted ? 'bg-slate-50 border-slate-200 opacity-75' : 'hover:border-slate-300'
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={doc.type === 'NOTE' ? 'indigo' : 'emerald'}>
                      {doc.type}
                    </Badge>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-start gap-2 mt-2">
                  {doc.type === 'TASK' && (
                    <button
                      onClick={() => handleToggleTask(doc.id)}
                      className="mt-0.5 text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      {doc.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  )}
                  <CardTitle
                    className={`text-sm font-bold ${
                      doc.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {doc.title}
                  </CardTitle>
                </div>
              </CardHeader>

              {doc.content && (
                <CardContent className="pt-0">
                  <p
                    className={`text-xs whitespace-pre-wrap leading-relaxed ${
                      doc.isCompleted ? 'line-through text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {doc.content}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-3 font-mono">
                    Updated {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateModalOpen(false)}
          title={`Create New ${modalType === 'NOTE' ? 'Personal Note' : 'Task Checklist Item'}`}
          description="Private to your account — only you can view and edit this entry"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateSubmit} isLoading={submitting}>
                Save to Workspace
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 text-left">
            <Input
              label="Title"
              placeholder={modalType === 'NOTE' ? 'e.g. Unit 3 Operating Systems summary' : 'e.g. Prepare presentation slides for Friday'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Textarea
              label="Details / Notes / Checklist (Optional)"
              placeholder="Enter note contents, bullet points, or task details..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </form>
        </Modal>
      )}
    </div>
  );
};
