import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { NavItem } from './NavItem';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  BarChart3,
  Briefcase,
  Award,
  FileText,
  Users,
  FileClock,
  Megaphone,
  User,
  UserCheck,
  FileSpreadsheet,
  Building2,
  FileBarChart,
  Layers,
  UserPlus,
  Activity,
  ShieldCheck,
  TrendingUp,
  Video,
  Trophy,
} from 'lucide-react';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';

  const getNavItems = () => {
    switch (role) {
      case 'STUDENT':
        return [
          { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/student/academic', icon: GraduationCap, label: 'Academic' },
          { to: '/student/results', icon: Award, label: 'Semester Results' },
          { to: '/student/classrooms', icon: Video, label: 'Virtual Classrooms' },
          { to: '/student/assignments', icon: ClipboardList, label: 'Assignments' },
          { to: '/student/attendance', icon: CalendarCheck, label: 'Attendance' },
          { to: '/student/performance', icon: BarChart3, label: 'Performance' },
          { to: '/student/portfolio', icon: Briefcase, label: 'Digital Portfolio' },
          { to: '/student/achievements', icon: Trophy, label: 'Achievements' },
          { to: '/student/workspace', icon: FileText, label: 'Personal Workspace' },
          { to: '/student/groups', icon: Users, label: 'Campus Groups' },
          { to: '/student/leave', icon: FileClock, label: 'Leave' },
          { to: '/student/announcements', icon: Megaphone, label: 'Announcements' },
          { to: '/student/profile', icon: User, label: 'Profile' },
        ];
      case 'STAFF':
        return [
          { to: '/staff/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/staff/classes', icon: BookOpen, label: 'My Classes' },
          { to: '/staff/classrooms', icon: Video, label: 'Virtual Classrooms' },
          { to: '/staff/attendance', icon: CalendarCheck, label: 'Attendance' },
          { to: '/staff/iat', icon: BarChart3, label: 'IAT / Assessments' },
          { to: '/staff/assignments', icon: ClipboardList, label: 'Assignments' },
          { to: '/staff/performance', icon: TrendingUp, label: 'Student Performance' },
          { to: '/staff/leave', icon: FileClock, label: 'Leave Applications' },
          { to: '/staff/announcements', icon: Megaphone, label: 'Announcements' },
          { to: '/staff/groups', icon: Users, label: 'Campus Groups' },
          { to: '/staff/achievements', icon: Award, label: 'Achievement Verification' },
          { to: '/staff/excel', icon: FileSpreadsheet, label: 'Excel Data' },
          { to: '/staff/workspace', icon: FileText, label: 'Personal Workspace' },
          { to: '/staff/profile', icon: User, label: 'Profile' },
        ];
      case 'HOD':
        return [
          { to: '/hod/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/hod/department', icon: Building2, label: 'Department Overview' },
          { to: '/hod/students', icon: Users, label: 'Student Monitoring' },
          { to: '/hod/attendance', icon: CalendarCheck, label: 'Attendance Analytics' },
          { to: '/hod/performance', icon: BarChart3, label: 'Academic Performance' },
          { to: '/hod/staff', icon: UserCheck, label: 'Staff Overview' },
          { to: '/hod/leave', icon: FileClock, label: 'Leave Approvals' },
          { to: '/hod/announcements', icon: Megaphone, label: 'Department Announcements' },
          { to: '/hod/reports', icon: FileBarChart, label: 'Department Reports' },
          { to: '/hod/workspace', icon: FileText, label: 'Personal Workspace' },
          { to: '/hod/profile', icon: User, label: 'Profile' },
        ];
      case 'ADMIN':
        return [
          { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/admin/users', icon: Users, label: 'User Management' },
          { to: '/admin/registrations', icon: UserCheck, label: 'Registration Approvals' },
          { to: '/admin/departments', icon: Building2, label: 'Departments' },
          { to: '/admin/subjects', icon: BookOpen, label: 'Subjects' },
          { to: '/admin/sections', icon: Layers, label: 'Sections' },
          { to: '/admin/teaching-assignments', icon: UserPlus, label: 'Teaching Assignments' },
          { to: '/admin/results', icon: Award, label: 'Semester Results' },
          { to: '/admin/monitoring', icon: Activity, label: 'Institution Monitoring' },
          { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
          { to: '/admin/reports', icon: FileBarChart, label: 'Reports' },
          { to: '/admin/audit-logs', icon: ShieldCheck, label: 'Audit Logs' },
          { to: '/admin/profile', icon: User, label: 'Profile' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out
          lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand Header */}
        <div className="h-14 px-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
              E
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">EDUSPHERE</h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase mt-0.5">CampusHub</p>
            </div>
          </div>
        </div>

        {/* Role Badge Indicator */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-500">Active Workspace</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
            {role}
          </span>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              onClick={onClose}
            />
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div className="px-2 py-1.5 rounded-md bg-white border border-slate-200 text-left">
            <p className="text-[11px] font-semibold text-slate-800 truncate">{user?.fullName || 'User'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email || ''}</p>
          </div>
        </div>
      </aside>
    </>
  );
};
