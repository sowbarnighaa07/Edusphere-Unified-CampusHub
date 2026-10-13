import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/student.service';
import { StudentPortfolio, UpdateStudentPortfolioRequest } from '../../types/student.types';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useToast } from '../../components/feedback/Toast';
import {
  Briefcase,
  GraduationCap,
  Award,
  Code2,
  FolderGit2,
  Globe,
  Mail,
  Edit3,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const StudentPortfolioPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<StudentPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<UpdateStudentPortfolioRequest>({
    about: '',
    skills: '',
    projects: '',
    careerObjective: '',
    githubUrl: '',
    linkedinUrl: '',
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const data = await studentService.getPortfolio();
      setPortfolio(data);
      setEditForm({
        about: data.about || '',
        skills: data.skills || '',
        projects: data.projects || '',
        careerObjective: data.careerObjective || '',
        githubUrl: data.githubUrl || '',
        linkedinUrl: data.linkedinUrl || '',
      });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load portfolio', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await studentService.updatePortfolio(editForm);
      setPortfolio(updated);
      setShowEditModal(false);
      showToast('Digital Portfolio updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update portfolio', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your digital portfolio..." />;
  }

  if (!portfolio) {
    return (
      <EmptyState
        icon={<Briefcase className="w-6 h-6" />}
        title="Portfolio Unavailable"
        description="Could not load your academic profile. Please try again later."
      />
    );
  }

  const skillList = portfolio.skills
    ? portfolio.skills.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digital Portfolio"
        description="Your comprehensive academic showcase, verified certifications, and career profile"
        action={
          <Button onClick={() => setShowEditModal(true)} size="sm">
            <Edit3 className="w-4 h-4 mr-1.5" />
            Edit Profile
          </Button>
        }
      />

      {/* Hero Profile Banner */}
      <Card className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white border-0 overflow-hidden shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {portfolio.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{portfolio.fullName}</h2>
                  <Badge variant="emerald" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    Verified Student
                  </Badge>
                </div>
                <p className="text-sm font-mono text-indigo-200">{portfolio.registerNumber}</p>
                <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-1">
                  <GraduationCap className="w-4 h-4 text-indigo-300" />
                  {portfolio.departmentName} ({portfolio.departmentCode}) · Section {portfolio.sectionName}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs text-indigo-200 border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-300" />
                <span>{portfolio.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                <span>Class of {portfolio.expectedGraduationYear} (Batch {portfolio.enrollmentYear})</span>
              </div>
              {(portfolio.githubUrl || portfolio.linkedinUrl) && (
                <div className="flex items-center gap-2 pt-1">
                  {portfolio.githubUrl && (
                    <a
                      href={portfolio.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      <FolderGit2 className="w-3 h-3" />
                      GitHub
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {portfolio.linkedinUrl && (
                    <a
                      href={portfolio.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      <Globe className="w-3 h-3" />
                      LinkedIn
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Career Objective & Skills */}
        <div className="space-y-6 lg:col-span-1">
          {/* Career Objective */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Career Objective
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {portfolio.careerObjective || (
                  <span className="text-slate-400 italic">
                    No career objective added yet. Click &quot;Edit Profile&quot; to state your professional focus.
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Technical Skills */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-600" />
                Skills & Competencies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {skillList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {skillList.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No skills listed yet. Add skills separated by commas (e.g. Java, React, Spring Boot, Python).
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: About, Projects, and Verified Achievements */}
        <div className="space-y-6 lg:col-span-2">
          {/* About Me */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-700" />
                About Me
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {portfolio.about || (
                  <span className="text-slate-400 italic">
                    Introduce yourself, your academic background, and your key interests.
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Academic & Engineering Projects */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-600" />
                Academic & Engineering Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {portfolio.projects ? (
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {portfolio.projects}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Highlight major course mini-projects, capstones, hackathon repositories, or open-source contributions.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Verified Institutional Achievements */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Verified Institutional Achievements
                </CardTitle>
                <Badge variant="emerald">
                  {portfolio.verifiedAchievements?.length || 0} Verified
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {!portfolio.verifiedAchievements || portfolio.verifiedAchievements.length === 0 ? (
                <div className="text-center py-6">
                  <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">
                    No verified achievements found yet. Submit your paper presentations, hackathon awards, and certifications on the Achievements page for faculty verification.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {portfolio.verifiedAchievements.map(ach => (
                    <div
                      key={ach.id}
                      className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900">{ach.title}</span>
                            <Badge variant="blue" className="text-[10px]">
                              {ach.category}
                            </Badge>
                          </div>
                          {ach.description && (
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ach.description}</p>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                          {new Date(ach.achievementDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Faculty Verified{ach.verifiedByName ? ` by ${ach.verifiedByName}` : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Portfolio Modal */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Digital Portfolio"
        >
          <div className="space-y-4 p-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Career Objective</label>
              <Input
                placeholder="e.g. Aspiring Full-Stack Engineer with interest in Distributed Systems"
                value={editForm.careerObjective || ''}
                onChange={e => setEditForm(f => ({ ...f, careerObjective: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Technical Skills (comma-separated)
              </label>
              <Input
                placeholder="Java, React, TypeScript, Spring Boot, MySQL, Docker"
                value={editForm.skills || ''}
                onChange={e => setEditForm(f => ({ ...f, skills: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">About Me</label>
              <Textarea
                placeholder="Describe your background, passions, and core academic areas of interest..."
                value={editForm.about || ''}
                onChange={e => setEditForm(f => ({ ...f, about: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Key Projects (Titles, stack, and descriptions)
              </label>
              <Textarea
                placeholder="e.g. EduSphere Platform: Spring Boot & React unified campus management system..."
                value={editForm.projects || ''}
                onChange={e => setEditForm(f => ({ ...f, projects: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub Profile URL</label>
                <Input
                  placeholder="https://github.com/username"
                  value={editForm.githubUrl || ''}
                  onChange={e => setEditForm(f => ({ ...f, githubUrl: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn Profile URL</label>
                <Input
                  placeholder="https://linkedin.com/in/username"
                  value={editForm.linkedinUrl || ''}
                  onChange={e => setEditForm(f => ({ ...f, linkedinUrl: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowEditModal(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
