import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { RegistrationPendingPage } from '../pages/auth/RegistrationPendingPage';
import { UnauthorizedPage } from '../pages/common/UnauthorizedPage';
import { NotFoundPage } from '../pages/common/NotFoundPage';
import { StudentDashboardShell } from '../pages/student/StudentDashboardShell';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';
import { StudentAcademicPage } from '../pages/student/StudentAcademicPage';
import { StudentClassroomsPage } from '../pages/student/StudentClassroomsPage';
import { StudentAssignmentsPage } from '../pages/student/StudentAssignmentsPage';
import { StudentGroupsPage } from '../pages/student/StudentGroupsPage';
import { StaffGroupsPage } from '../pages/staff/StaffGroupsPage';
import { StaffDashboardShell } from '../pages/staff/StaffDashboardShell';
import { StaffClassesPage } from '../pages/staff/StaffClassesPage';
import { StaffClassroomsPage } from '../pages/staff/StaffClassroomsPage';
import { StaffAssignmentsPage } from '../pages/staff/StaffAssignmentsPage';
import { StaffIatPage } from '../pages/staff/StaffIatPage';
import { StaffPerformancePage } from '../pages/staff/StaffPerformancePage';
import { StaffExcelPage } from '../pages/staff/StaffExcelPage';

import { HodDashboardShell } from '../pages/hod/HodDashboardShell';
import { HodDepartmentPage } from '../pages/hod/HodDepartmentPage';
import { HodStudentsPage } from '../pages/hod/HodStudentsPage';
import { HodFacultyPage } from '../pages/hod/HodFacultyPage';
import { HodAttendancePage } from '../pages/hod/HodAttendancePage';
import { HodLeavePage } from '../pages/hod/HodLeavePage';
import { AdminDashboardShell } from '../pages/admin/AdminDashboardShell';
import { RegistrationApprovalsPage } from '../pages/admin/RegistrationApprovalsPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { DepartmentsPage } from '../pages/admin/DepartmentsPage';
import { SectionsPage } from '../pages/admin/SectionsPage';
import { SubjectsPage } from '../pages/admin/SubjectsPage';
import { TeachingAssignmentsPage } from '../pages/admin/TeachingAssignmentsPage';
import { AdminSemesterResultsPage } from '../pages/admin/AdminSemesterResultsPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';
import { AdminMonitoringPage } from '../pages/admin/AdminMonitoringPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { StudentLeavePage } from '../pages/student/StudentLeavePage';
import { StaffLeavePage } from '../pages/staff/StaffLeavePage';
import { StudentAchievementsPage } from '../pages/student/StudentAchievementsPage';
import { StaffAchievementsPage } from '../pages/staff/StaffAchievementsPage';
import { AnnouncementsPage } from '../pages/common/AnnouncementsPage';
import { PersonalWorkspacePage } from '../pages/common/PersonalWorkspacePage';
import { StudentPerformancePage } from '../pages/student/StudentPerformancePage';
import { StudentAttendancePage } from '../pages/student/StudentAttendancePage';
import { StudentPortfolioPage } from '../pages/student/StudentPortfolioPage';
import { StaffProfilePage } from '../pages/staff/StaffProfilePage';
import { HodProfilePage } from '../pages/hod/HodProfilePage';
import { HodPerformancePage } from '../pages/hod/HodPerformancePage';
import { HodReportsPage } from '../pages/hod/HodReportsPage';
import { AdminProfilePage } from '../pages/admin/AdminProfilePage';
import { StudentSemesterResultsPage } from '../pages/student/StudentSemesterResultsPage';
import { useAuth } from '../hooks/useAuth';

const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'STUDENT': return <Navigate to="/student/dashboard" replace />;
    case 'STAFF': return <Navigate to="/staff/dashboard" replace />;
    case 'HOD': return <Navigate to="/hod/dashboard" replace />;
    case 'ADMIN': return <Navigate to="/admin/dashboard" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/registration-pending" element={<RegistrationPendingPage />} />
      </Route>

      {/* Common Fallback Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          
          {/* STUDENT ROUTES */}
          <Route element={<RoleRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student/dashboard" element={<StudentDashboardShell />} />
            <Route path="/student/academic" element={<StudentAcademicPage />} />
            <Route path="/student/results" element={<StudentSemesterResultsPage />} />
            <Route path="/student/classrooms" element={<StudentClassroomsPage />} />
            <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
            <Route path="/student/attendance" element={<StudentAttendancePage />} />
            <Route path="/student/performance" element={<StudentPerformancePage />} />
            <Route path="/student/portfolio" element={<StudentPortfolioPage />} />
            <Route path="/student/achievements" element={<StudentAchievementsPage />} />
            <Route path="/student/workspace" element={<PersonalWorkspacePage />} />
            <Route path="/student/groups" element={<StudentGroupsPage />} />
            <Route path="/student/leave" element={<StudentLeavePage />} />
            <Route path="/student/announcements" element={<AnnouncementsPage pageTitle="Student Bulletins & Notices" pageDescription="Official circulars, department notices, and classroom updates" />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
          </Route>

          {/* STAFF ROUTES */}
          <Route element={<RoleRoute allowedRoles={['STAFF', 'HOD', 'ADMIN']} />}>
            <Route path="/staff/dashboard" element={<StaffDashboardShell />} />
            <Route path="/staff/classes" element={<StaffClassesPage />} />
            <Route path="/staff/classrooms" element={<StaffClassroomsPage />} />
            <Route path="/staff/attendance" element={<StaffIatPage />} />
            <Route path="/staff/iat" element={<StaffIatPage />} />
            <Route path="/staff/assignments" element={<StaffAssignmentsPage />} />
            <Route path="/staff/performance" element={<StaffPerformancePage />} />
            <Route path="/staff/leave" element={<StaffLeavePage />} />
            <Route path="/staff/announcements" element={<AnnouncementsPage pageTitle="Faculty Bulletins & Notices" pageDescription="Official notices and class announcements for your teaching cohorts" />} />
            <Route path="/staff/groups" element={<StaffGroupsPage />} />
            <Route path="/staff/achievements" element={<StaffAchievementsPage />} />
            <Route path="/staff/excel" element={<StaffExcelPage />} />
            <Route path="/staff/workspace" element={<PersonalWorkspacePage />} />
            <Route path="/staff/profile" element={<StaffProfilePage />} />
          </Route>

          {/* HOD ROUTES */}
          <Route element={<RoleRoute allowedRoles={['HOD', 'ADMIN']} />}>
            <Route path="/hod/dashboard" element={<HodDashboardShell />} />
            <Route path="/hod/department" element={<HodDepartmentPage />} />
            <Route path="/hod/students" element={<HodStudentsPage />} />
            <Route path="/hod/attendance" element={<HodAttendancePage />} />
            <Route path="/hod/performance" element={<HodPerformancePage />} />
            <Route path="/hod/staff" element={<HodFacultyPage />} />
            <Route path="/hod/leave" element={<HodLeavePage />} />
            <Route path="/hod/announcements" element={<AnnouncementsPage pageTitle="Department Notices & Bulletins" pageDescription="Official notices and department announcements" />} />
            <Route path="/hod/reports" element={<HodReportsPage />} />
            <Route path="/hod/workspace" element={<PersonalWorkspacePage />} />
            <Route path="/hod/profile" element={<HodProfilePage />} />
          </Route>

          {/* ADMIN ROUTES */}
          <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardShell />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/registrations" element={<RegistrationApprovalsPage />} />
            <Route path="/admin/departments" element={<DepartmentsPage />} />
            <Route path="/admin/subjects" element={<SubjectsPage />} />
            <Route path="/admin/sections" element={<SectionsPage />} />
            <Route path="/admin/teaching-assignments" element={<TeachingAssignmentsPage />} />
            <Route path="/admin/results" element={<AdminSemesterResultsPage />} />
            <Route path="/admin/monitoring" element={<AdminMonitoringPage />} />
            <Route path="/admin/announcements" element={<AnnouncementsPage pageTitle="Campus Bulletins & Circulars" pageDescription="Broadcast institution-level notices" />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
          </Route>

        </Route>
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
