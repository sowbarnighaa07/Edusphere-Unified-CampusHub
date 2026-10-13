# PROJECT CONTEXT: EDUSPHERE – UNIFIED CAMPUSHUB

> **IMPORTANT NOTICE FOR ASSISTANTS & DEVELOPERS**:
> This file serves as persistent, authoritative project context. Any AI agent (Antigravity, Claude, Gemini, etc.) or developer resuming this codebase must read and adhere to this file before writing code.
> **DO NOT CREATE MOCK DATA ARRAYS. MYSQL IS THE SINGLE SOURCE OF TRUTH. DO NOT RECREATE EXISTING REPOSITORIES, ENTITIES, AUTHENTICATION OR THE DESIGN SYSTEM.**

---

## 1. Project Name and Overall Purpose

- **Project Name**: `EduSphere – Unified CampusHub` (V2 Architecture)
- **Context**: B.E. Computer Science Final Year Project.
- **Core Vision**: A single unified academic and campus management platform designed to eliminate app/platform fatigue (replacing disconnected tools like Google Classroom, WhatsApp group notices, manual spreadsheets, leave forms, paper achievement submissions).
- **Intelligent Features Role**: Machine Learning (Semester Score Prediction) and Gemini AI (Academic Guidance) are **supporting features only**. The platform is an academic institution platform, NOT an AI demo, NOT a crypto/gaming SaaS, and NOT a social network.

---

## 2. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite 5, Tailwind CSS 3, React Router 6, Axios, Lucide React icons, React Context |
| **Backend** | Java 21+ (Compatible with JDK 26), Spring Boot 3.3.4, Spring Data JPA, Spring Security 6, JJWT 0.12.6, Apache POI 5.3.0, Jakarta Validation |
| **Database** | MySQL 8.0+ (Single Source of Truth) |
| **ML Microservice** | Python, FastAPI, scikit-learn (Random Forest Regressor), pandas, joblib, pydantic |
| **AI Integration** | Gemini API (Backend-proxied for contextual academic guidance based on real MySQL records) |
| **File Storage** | Local filesystem abstraction (`FileStorageService` storing in `./uploads/`) |

---

## 3. Current Frontend Architecture

```
frontend/
├── index.html
├── package.json               # React 18, Vite, Tailwind, Lucide, Axios, React Router
├── tsconfig.json              # Strict TypeScript configuration
├── vite.config.ts             # Proxy configured: '/api' -> 'http://localhost:8080'
├── tailwind.config.js         # Design tokens: Brand Indigo (#4F46E5), Slate-50 background, Navy text
└── src/
    ├── main.tsx               # Application bootstrap
    ├── App.tsx                # App wrapper with BrowserRouter, AuthProvider, ToastProvider
    ├── index.css              # Tailwind base layers and Inter typography
    ├── types/
    │   └── auth.types.ts      # Role, UserStatus, UserSummary, AuthResponse, ApiResponse
    ├── services/
    │   ├── api.ts             # Axios instance with auto Bearer JWT injection & 401 interceptor
    │   └── auth.service.ts    # login, registerStudent, getCurrentUser, logout, localStorage cache
    ├── hooks/
    │   └── useAuth.tsx        # React Context hook providing user, loading, login, logout, refreshUser
    ├── components/
    │   ├── ui/                # ATOMIC DESIGN SYSTEM
    │   │   ├── Button.tsx     # primary, secondary, outline, danger, ghost; sm/md/lg; loading state
    │   │   ├── Input.tsx      # label, error, helperText, left/right icons
    │   │   ├── Select.tsx     # label, error, helperText, options
    │   │   ├── Textarea.tsx   # label, error, rows
    │   │   ├── Badge.tsx      # emerald (ACTIVE/APPROVED), amber (PENDING), rose (REJECTED), blue (SUBMITTED)
    │   │   ├── Card.tsx       # Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
    │   │   ├── Table.tsx      # Table, TableHeader, TableBody, TableRow, TableHead, TableCell
    │   │   ├── Modal.tsx      # Accessible dialog with ESC close, backdrop, title, content, footer
    │   │   └── Alert.tsx      # info, success, warning, error
    │   ├── feedback/
    │   │   ├── EmptyState.tsx # Standardized empty state card (icon, title, description, action)
    │   │   ├── LoadingState.tsx # Spinner and Skeleton loaders
    │   │   ├── ErrorState.tsx # Error banner with retry button
    │   │   └── Toast.tsx      # ToastProvider and useToast hook (success, error, warning, info)
    │   └── navigation/
    │       ├── NavItem.tsx    # Active state NavLink with icon and count badge
    │       ├── Sidebar.tsx    # Role-aware sidebar with exact specification navigation items
    │       ├── Header.tsx     # Academic year context, dept badge, notification bell, profile & logout
    │       └── PageHeader.tsx # Title, description, action buttons, and badge
    ├── layouts/
    │   ├── AppLayout.tsx      # Persistent responsive shell (Sidebar + Header + Content Container)
    │   └── AuthLayout.tsx     # Clean split-screen authentication layout (Branding panel + Form)
    ├── routes/
    │   ├── ProtectedRoute.tsx # Route guard: Redirects to /login or /registration-pending
    │   ├── RoleRoute.tsx      # Route guard: Checks role against allowedRoles (STUDENT/STAFF/HOD/ADMIN)
    │   └── AppRoutes.tsx      # All mapped route definitions for public and role workspaces
    └── pages/
        ├── auth/
        │   ├── LoginPage.tsx              # Official login screen with email/password
        │   ├── RegisterPage.tsx           # 1st-year self-registration (fetches depts & sections)
        │   └── RegistrationPendingPage.tsx# Status screen for pending account approval
        ├── common/
        │   ├── UnauthorizedPage.tsx       # 403 Forbidden screen
        │   ├── NotFoundPage.tsx           # 404 Not Found screen
        │   └── ModulePlaceholder.tsx      # Standard empty module shell for pending phases
        ├── student/
        │   └── StudentDashboardShell.tsx  # Initial student dashboard with real context & empty stats
        ├── staff/
        │   └── StaffDashboardShell.tsx    # Faculty dashboard with assigned class context
        ├── hod/
        │   └── HodDashboardShell.tsx      # Department leadership dashboard
        └── admin/
            └── AdminDashboardShell.tsx    # Institutional admin dashboard with audit summary
```

---

## 4. Current Backend Architecture

```
backend/
├── pom.xml                               # Java 21+, Spring Boot 3.3.4, JPA, Security, JJWT, POI, MySQL
└── src/main/
    ├── resources/
    │   ├── application.yml               # Server port 8080 (/api context), JWT config, Upload dir
    │   └── application-dev.yml           # MySQL database configuration
    └── java/com/edusphere/
        ├── EduSphereApplication.java     # Main class with @EnableJpaAuditing
        ├── config/
        │   ├── SecurityConfig.java       # Stateless SecurityFilterChain, BCrypt, role URL rules
        │   ├── CorsConfig.java           # Cross-Origin resource sharing for Vite (localhost:5173)
        │   ├── StorageConfig.java        # Configuration properties for local uploads
        │   └── DataInitializer.java      # Seeds baseline Admin, Depts, Sections, Subjects, Staff, HOD, Student
        ├── security/
        │   ├── JwtTokenProvider.java     # Generates & validates HMAC-SHA256 JWT tokens
        │   ├── JwtAuthenticationFilter.java # OncePerRequestFilter extracting Bearer token
        │   ├── CustomUserDetailsService.java # Loads UserPrincipal by email / ID
        │   ├── UserPrincipal.java        # UserDetails implementation with authorities
        │   └── ResourceSecurityService.java # Checks teaching assignments, dept match, student self
        ├── entity/                       # 18 JPA ENTITIES (Standard POJOs, NO LOMBOK for JDK compatibility)
        ├── repository/                   # 20 Spring Data JPA Repositories
        ├── controller/
        │   ├── AuthController.java       # /api/auth/login, /api/auth/register, /api/auth/me
        │   └── PublicController.java     # /api/public/departments, /api/public/sections
        ├── service/
        │   ├── AuthService.java          # Login auth, 1st-year student registration, profile resolution
        │   └── FileStorageService.java   # Local storage abstraction for materials, assignments, leaves
        ├── dto/
        │   ├── common/
        │   │   ├── ApiResponse.java      # Standard JSON response envelope { success, message, data, timestamp }
        │   │   └── PagedResponse.java    # Standard pagination response
        │   └── auth/
        │       ├── LoginRequest.java
        │       ├── StudentRegistrationRequest.java
        │       ├── AuthResponse.java
        │       └── UserSummaryDto.java
        └── exception/
            ├── GlobalExceptionHandler.java # Converts exceptions into clean JSON responses
            ├── BadRequestException.java
            ├── ResourceNotFoundException.java
            ├── UnauthorizedAccessException.java
            └── ExcelValidationException.java
```

---

## 5. Database Structure & Entities (MySQL)

All 18 entities and 20 JPA repositories are implemented in standard Java without Lombok for zero compiler friction across Java 21–26:

1. **`users`** (`UserRepository`): `id`, `email` (canonical unique), `password_hash`, `role` (`STUDENT`, `STAFF`, `HOD`, `ADMIN`), `status` (`PENDING`, `ACTIVE`, `REJECTED`, `INACTIVE`), `created_at`, `updated_at`.
2. **`departments`** (`DepartmentRepository`): `id`, `name`, `code` (unique, e.g. CSE, ECE, MECH).
3. **`sections`** (`SectionRepository`): `id`, `department_id`, `name` (unique per department). *No hardcoded year or semester*.
4. **`student_profiles`** (`StudentProfileRepository`): `id`, `user_id`, `register_number`, `full_name`, `department_id`, `section_id`, `enrollment_year` (e.g. 2026), `expected_graduation_year` (e.g. 2030), contact/emergency details.
5. **`staff_profiles`** (`StaffProfileRepository`): `id`, `user_id`, `employee_id`, `full_name`, `department_id`, `designation`, `qualification`, `joining_year`, mobile, address.
6. **`hod_profiles`** (`HodProfileRepository`): `id`, `user_id`, `employee_id`, `full_name`, `department_id`, `designation`, `qualification`, `joining_year`, `start_date`, `end_date`, `is_active` (enforces 1 active HOD per department).
7. **`subjects`** (`SubjectRepository`): `id`, `department_id`, `code` (unique, e.g. CS8101), `name`, `semester` (1 to 8), `credits`.
8. **`teaching_assignments`** (`TeachingAssignmentRepository`): `id`, `staff_id`, `subject_id`, `section_id`, `semester`, `academic_year` (unique constraint on combination).
9. **`classrooms`** (`ClassroomRepository`): `id`, `teaching_assignment_id` (unique), `name`, `description`, `is_active`.
10. **`classroom_materials`** (`ClassroomMaterialRepository`): `id`, `classroom_id`, `title`, `description`, `file_path`, `file_name`, `uploaded_by`.
11. **`assignments`** (`AssignmentRepository`): `id`, `teaching_assignment_id`, `title`, `description`, `deadline`, `max_marks`, `attachment_path`.
12. **`assignment_submissions`** (`AssignmentSubmissionRepository`): `id`, `assignment_id`, `student_id`, `submission_date`, `file_path`, `marks_obtained`, `status` (`SUBMITTED`, `EVALUATED`, `LATE`), `evaluated_by`, `feedback`.
13. **`subject_academic_records`** (`SubjectAcademicRecordRepository`): `id`, `student_id`, `subject_id`, `semester`, `academic_year`, `iat1_score`, `iat2_score`, `assignment_score`, `attendance_percentage` (single source of truth for academic attendance).
14. **`semester_results`** (`SemesterResultRepository`): `id`, `student_id`, `semester`, `academic_year`, `predicted_semester_score` (from ML service), `actual_semester_score`.
15. **`leave_requests`** (`LeaveRequestRepository`): `id`, `student_id`, `leave_type`, `from_date`, `to_date`, `reason`, `status` (`PENDING_STAFF`, `PENDING_HOD`, `APPROVED`, `REJECTED`), `staff_reviewer_id`, `hod_reviewer_id`.
16. **`announcements`** (`AnnouncementRepository`): `id`, `title`, `content`, `scope` (`INSTITUTION`, `DEPARTMENT`, `CLASS`), `department_id`, `section_id`, `subject_id`, `created_by`.
17. **`achievements`** (`AchievementRepository`): `id`, `student_id`, `category`, `title`, `description`, `achievement_date`, `status` (`PENDING`, `VERIFIED`, `REJECTED`), `verified_by`.
18. **`workspace_documents`** (`WorkspaceDocumentRepository`): `id`, `user_id`, `title`, `content`, `type` (`NOTE`, `TASK`), `is_completed`.
19. **`audit_logs`** (`AuditLogRepository`): `id`, `user_id`, `user_email`, `action`, `target_resource`, `target_id`, `details`, `ip_address`.
20. **`excel_import_logs`** (`ExcelImportLogRepository`): `id`, `file_name`, `import_type` (`ATTENDANCE`, `IAT`, `ASSIGNMENT`), `subject_id`, `section_id`, `semester`, `academic_year`, `uploaded_by`, `total_rows`, `successful_rows`, `failed_rows`, `error_summary`.

---

## 6. Authentication and Authorization Flow

1. **Student Self-Registration**:
   - First-year student registers via `/register` $\rightarrow$ `POST /api/auth/register`.
   - Backend creates `User` with `role = STUDENT`, `status = PENDING`, and creates `StudentProfile`.
   - Student cannot log in until Admin approves registration.
2. **Staff & HOD Provisioning**:
   - Staff/HOD accounts are created by Admin $\rightarrow$ `POST /api/admin/staff` and `POST /api/admin/hod`.
   - `status = ACTIVE`.
3. **Login & Session Management**:
   - Client sends credentials to `POST /api/auth/login`.
   - Spring Security authenticates using BCrypt $\rightarrow$ `JwtTokenProvider` generates HMAC-SHA256 JWT.
   - Response contains JWT token and `UserSummaryDto`.
   - Frontend stores token in `localStorage('edusphere_token')` and attaches it to every Axios request.
4. **Endpoint Authorization**:
   - `/api/auth/**`, `/api/public/**` $\rightarrow$ Public.
   - `/api/admin/**` $\rightarrow$ `ROLE_ADMIN`.
   - `/api/hod/**` $\rightarrow$ `ROLE_HOD`, `ROLE_ADMIN`.
   - `/api/staff/**` $\rightarrow$ `ROLE_STAFF`, `ROLE_HOD`, `ROLE_ADMIN`.
   - `/api/student/**` $\rightarrow$ `ROLE_STUDENT`, `ROLE_STAFF`, `ROLE_HOD`, `ROLE_ADMIN`.
5. **Resource-Level Security**:
   - `ResourceSecurityService` verifies teaching assignment ownership before staff can modify marks/attendance for a class.
   - Verifies department association before HOD can approve department leave or view records.

---

## 7. User Roles and Permission Matrix

| Capability | STUDENT | STAFF | HOD | ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| **Self-Registration** | Yes (1st Year) | ❌ | ❌ | Seed Setup |
| **Registration Approval** | ❌ | ❌ | ❌ | **Full** |
| **User & Staff/HOD Provisioning** | ❌ | ❌ | ❌ | **Full** |
| **Academic Entity CRUD (Depts, Sections, Subjects)** | ❌ | ❌ | ❌ | **Full** |
| **Teaching Assignment Allocation** | ❌ | ❌ | ❌ | **Full** |
| **Academic Records & Marks** | Own view | **Assigned Classes Only** | Dept view | Institution view |
| **Excel Import / Export** | ❌ | **Assigned Classes Only** | Export only | Audit view |
| **Leave Workflow** | Apply | Review Stage 1 | **Final Decision** | Audit view |
| **Announcement Creation** | ❌ | Assigned Classes | Own Department | **Institution-Wide** |
| **Semester ML Prediction** | View Own Score | View Assigned | Dept Analytics | Institution view |
| **Audit Logs** | ❌ | ❌ | ❌ | **Full** |

---

## 8. Current Implementation Status

### COMPLETED:
- [x] Spring Boot 3.3.4 + Java 21+ backend configuration (`pom.xml`, `application.yml`, `application-dev.yml`).
- [x] Complete MySQL relational entity model (18 entities, 20 JPA repositories).
- [x] Stateless JWT authentication (`JwtTokenProvider`, `JwtAuthenticationFilter`, `CustomUserDetailsService`, `UserPrincipal`).
- [x] BCrypt password hashing & Spring Security configuration (`SecurityConfig`, `CorsConfig`).
- [x] Fine-grained `ResourceSecurityService` for teaching assignment and department access checks.
- [x] Local `FileStorageService` abstraction for uploads.
- [x] Standardized API envelope (`ApiResponse<T>`, `PagedResponse<T>`) & `GlobalExceptionHandler`.
- [x] Baseline database seeder (`DataInitializer`) with Admin, HOD, Faculty, 1st-Year Student, CSE/ECE/MECH departments, sections, subjects, and teaching assignment.
- [x] React 18 + Vite + TypeScript + Tailwind CSS project setup with design tokens.
- [x] Complete atomic UI design system (`Button`, `Input`, `Select`, `Textarea`, `Badge`, `Card`, `Table`, `Modal`, `Alert`).
- [x] Feedback component set (`EmptyState`, `LoadingState`, `ErrorState`, `ToastProvider` / `useToast`).
- [x] Navigation kit (`Sidebar`, `Header`, `PageHeader`, `NavItem`).
- [x] Shared layouts (`AppLayout`, `AuthLayout`).
- [x] Role-based routing and route guards (`ProtectedRoute`, `RoleRoute`, `AppRoutes`).
- [x] Public auth pages (`LoginPage`, `RegisterPage`, `RegistrationPendingPage`, `UnauthorizedPage`, `NotFoundPage`).
- [x] Baseline dashboard shells for Student, Staff, HOD, and Admin.
- [x] Python FastAPI ML Service structure (`main.py`, `prediction_schema.py`, `model_service.py` with Random Forest regressor).
- [x] **Phase 4: Administrative User Lifecycle & Governance**:
  - `AdminService.java` & `AuditLogService.java` with immutable audit trail.
  - `AdminController.java` (`/api/admin/registrations/*`, `/api/admin/users/*`, `/api/admin/staff`, `/api/admin/hod`, `/api/admin/audit-logs`).
  - `admin.service.ts` & `admin.types.ts`.
  - `RegistrationApprovalsPage.tsx` with student review, approve (Active), and reject with remarks modal.
  - `UserManagementPage.tsx` with role/status filters, user search, status toggles, and modals for provisioning Faculty and HODs (enforcing 1 active HOD per department).
  - `AuditLogsPage.tsx` with real-time audit event timeline.
- [x] **Phase 5: Academic Hierarchy & Teaching Assignments**:
  - `DepartmentService.java`, `SubjectService.java`, `TeachingAssignmentService.java`.
  - Auto-provisioning of virtual `Classroom` on teaching assignment allocation.
  - CRUD REST endpoints on `AdminController` (`/api/admin/departments`, `/api/admin/sections`, `/api/admin/subjects`, `/api/admin/teaching-assignments`).
  - `DepartmentsPage.tsx` with department configuration and HOD indicators.
  - `SectionsPage.tsx` with department filter and cohort section management.
  - `SubjectsPage.tsx` with department/semester filters and course catalog CRUD.
  - `TeachingAssignmentsPage.tsx` with dynamic faculty allocation and virtual classroom indicators.
- [x] **Phase 6: Student Academic Module & Profile Completion**:
  - `StudentService.java` & `StudentController.java` (`/api/student/profile`, `/api/student/profile`, `/api/student/academic/current`).
  - Derived current year and semester calculation from enrollment year and academic calendar.
  - Current semester enrolled subject resolution with assigned faculty, credits, virtual classroom links, subject attendance %, and IAT scores.
  - `student.service.ts` & `student.types.ts`.
  - `StudentProfilePage.tsx` with immutable academic registration card, editable personal information, address, and emergency family contact details.
  - `StudentAcademicPage.tsx` with enrolled course catalog, credit breakdown, faculty contacts, classroom access, and assessment marks.
- [x] Build verification: Backend compiles with `BUILD SUCCESS` (102 source files); Frontend compiles with `npm run build` in 2.37s with 0 errors.

- [x] **Phase 7: Staff Teaching Management (Steps 1–4)**:
  - `StaffTeachingService.java` — Full service covering all 4 steps: class roster, classroom materials, assignments, batch IAT/attendance.
  - `StaffController.java` — REST endpoints:
    - `GET /api/staff/classes` — Assigned classes list.
    - `GET /api/staff/classes/{teachingAssignmentId}/students` — Enrolled student roster.
    - `GET /api/staff/classrooms/{teachingAssignmentId}` — Classroom detail with material/assignment counts.
    - `GET /api/staff/classrooms/{teachingAssignmentId}/materials` — List materials.
    - `POST /api/staff/classrooms/{teachingAssignmentId}/materials` (multipart) — Upload material.
    - `DELETE /api/staff/classrooms/materials/{materialId}` — Delete material.
    - `GET /api/staff/assignments/{teachingAssignmentId}` — List assignments.
    - `POST /api/staff/assignments` (multipart) — Create assignment with optional attachment.
    - `DELETE /api/staff/assignments/{assignmentId}` — Delete assignment.
    - `GET /api/staff/marks/{teachingAssignmentId}` — Get academic records for all enrolled students.
    - `POST /api/staff/marks/batch` — Batch update single field (iat1Score/iat2Score/assignmentScore/attendancePercentage).
  - New DTOs: `ClassroomDto`, `ClassroomMaterialDto`, `AssignmentDto`, `CreateAssignmentRequest`, `BatchMarkUpdateRequest`, `StudentAcademicRecordDto`.
  - `staff.types.ts` — Full types: `ClassroomDetail`, `ClassroomMaterial`, `StaffAssignment`, `StudentAcademicRecord`, `BatchMarkUpdateRequest`, `MarkField`.
  - `staff.service.ts` — Full API client for all 11 staff endpoints.
  - `StaffClassroomsPage.tsx` — 3-column class picker + material list with upload/delete modals.
  - `StaffAssignmentsPage.tsx` — 3-column class picker + assignment table with create/delete modals.
  - `StaffIatPage.tsx` — 3-column class picker + batch mark entry table with field switcher (IAT 1, IAT 2, Assignment, Attendance).
  - Routes wired: `/staff/classrooms`, `/staff/assignments`, `/staff/iat`, `/staff/attendance`.
- [x] Build verification: Backend `mvn compile` → **BUILD SUCCESS** (0 errors); Frontend `npm run build` → **✓ 1675 modules, built in 2.18s**.

- [x] **Phase 8: Excel Processing Module (Apache POI — Preview → Validate → Confirm)**:
  - **Architecture**: Two-phase workflow. Phase A (preview) parses and validates with zero DB writes. Phase B (confirm) commits in a single `@Transactional` operation.
  - **In-memory token cache**: `ConcurrentHashMap<String, CachedPreview>` keyed by UUID token (15-min TTL). Token is one-time-use — evicted after confirm.
  - **`ExcelImportService.java`** — Full service:
    - `preview()`: Parses `.xlsx` with Apache POI, validates header structure, checks register numbers against the enrolled cohort, detects duplicates, validates value ranges, returns `ExcelPreviewResponse` with per-row status.
    - `confirm()`: Resolves token, re-validates ownership, upserts `SubjectAcademicRecord` rows `@Transactional`, writes `ExcelImportLog`.
  - **Import types supported**: `ATTENDANCE` (0–100%), `IAT1` (0–50), `IAT2` (0–50).
  - **Validations**: File type (.xlsx only), header row format, register number in cohort, duplicate rows, value range, blank rows.
  - **`ExcelImportController.java`** — 2 endpoints:
    - `POST /api/staff/excel/preview` (multipart: file + teachingAssignmentId + importType) — Parse + validate, no DB write.
    - `POST /api/staff/excel/confirm` (JSON: importToken + teachingAssignmentId) — Commit valid rows.
  - **DTOs**: `ExcelPreviewResponse`, `ExcelRowPreview`, `ExcelConfirmRequest`.
  - **Frontend**:
    - `excel.types.ts` — TypeScript types for all Excel import interfaces.
    - `excel.service.ts` — `preview()` and `confirm()` API calls.
    - `StaffExcelPage.tsx` — Full 3-step workflow UI:
      - Step 1 (Setup): Class selector, import type dropdown, .xlsx file picker, instructions + template download.
      - Step 2 (Preview): Per-row validation table with Valid/Invalid badges, error reasons, summary counts, Re-upload and Confirm buttons.
      - Step 3 (Success): Import result summary (saved rows, skipped rows, subject/section info).
    - Route wired: `/staff/excel` → `StaffExcelPage`.
  - **Security**: STAFF role enforced. Staff cannot preview/confirm imports for teaching assignments they do not own.
  - **No partial saves**: Invalid rows are explicitly skipped. If token is invalid or expired, confirm is rejected.
- [x] Build verification: Backend `mvn compile` → **BUILD SUCCESS** (0 errors); Frontend `npm run build` → **✓ 1679 modules, built in 4.43s**.

- [x] **Phase 9: HOD Department Monitoring & Leave Approval**:
  - **`HodService.java`** & **`HodController.java`** (`/api/hod/*` secured by `@PreAuthorize("hasAnyRole('HOD', 'ADMIN')")`):
    - `GET /api/hod/department` — Real department metrics (students, faculty, subjects, sections, pending leave count, section breakdown).
    - `GET /api/hod/students` — Department cohort student directory with section/batch filters, email, attendance % and active course count.
    - `GET /api/hod/faculty` — Department faculty directory and teaching assignments workload breakdown.
    - `GET /api/hod/attendance` — Subject-wise attendance benchmark averages and `<75%` defaulter identification roster.
    - `GET /api/hod/leave` — Department student leave applications with status filter (`PENDING_HOD`, `PENDING_STAFF`, `APPROVED`, `REJECTED`).
    - `PUT /api/hod/leave/{id}/decision` — Final decision (`APPROVED` / `REJECTED`) recording HOD reviewer, timestamp, and decision remarks.
  - **DTOs**: `HodDepartmentOverviewDto`, `HodStudentDto`, `HodFacultyDto`, `HodAttendanceAnalyticsDto`, `HodLeaveReviewDto`, `HodLeaveDecisionRequest`.
  - **Frontend**:
    - `hod.types.ts` & `hod.service.ts`.
    - `HodDashboardShell.tsx` — Live department leadership overview with aggregate cards and navigation modules.
    - `HodDepartmentPage.tsx` — Department structure, active semesters, and section breakdown.
    - `HodStudentsPage.tsx` — Student directory with name/reg-no search, section filter, and attendance indicators.
    - `HodFacultyPage.tsx` — Faculty member cards with allocated teaching assignment lists.
    - `HodAttendancePage.tsx` — Department average, semester filter, subject attendance stats, and attendance defaulters action list.
    - `HodLeavePage.tsx` — Two-tier leave review, status tabs, staff remarks display, and HOD approve/reject decision modal.
    - Routes wired: `/hod/department`, `/hod/students`, `/hod/staff`, `/hod/attendance`, `/hod/leave`.
- [x] Build verification: Backend `mvn compile` → **BUILD SUCCESS** (0 errors); Frontend `npm run build` → **✓ 1685 modules, built in 3.64s**.

- [x] **Phase 10: Admin Institution Monitoring & Audit Log Viewer**:
  - **`AdminMonitoringService.java`** & **`AdminMonitoringController.java`** (`/api/admin/*` secured by `@PreAuthorize("hasRole('ADMIN')")`):
    - `GET /api/admin/monitoring` — Campus-wide aggregate metrics (total students, active faculty, HODs, departments, sections, subjects, classrooms, pending registrations, pending leaves, department summaries, attendance and continuous assessment averages).
    - `GET /api/admin/reports` — Report-ready data (student & faculty distribution by department with %, section breakdown, department attendance comparison, user account lifecycle breakdown, leave workflow pipeline breakdown).
    - `GET /api/admin/audit-logs` — Filtered, paginated security audit log stream supporting `role`, `action`, `ipAddress`, `from` date, `to` date, `page`, `size`.
  - **DTOs**: `AdminMonitoringDto`, `AdminReportsDto`, `AuditLogDto`.
  - **Frontend**:
    - `admin.types.ts` & `admin.service.ts` updated with Phase 10 types and API clients.
    - `AdminDashboardShell.tsx` — Dynamic institutional metrics cards and quick management links.
    - `AdminMonitoringPage.tsx` — Campus-wide monitoring dashboard with department comparison table, attendance health check, and system queue alerts.
    - `AdminReportsPage.tsx` — Formal institutional reporting tables, account status distributions, and leave workflow breakdown.
    - `AuditLogsPage.tsx` — Server-side filter bar (role, action, IP, date range), paginated audit table, and formatted JSON inspection modal.
    - Routes wired: `/admin/monitoring`, `/admin/reports`, `/admin/audit-logs`.
- [x] **Phase 11: Multi-Stage Leave Workflow, Scoped Announcements, Verified Achievements & Personal Workspace**:
  - **Multi-Stage Leave Workflow**:
    - Student applies for leave (`POST /api/student/leave`) $\rightarrow$ initial status `PENDING_STAFF`. Student can view history and cancel pending applications (`DELETE /api/student/leave/{id}`).
    - Staff stage-1 review (`GET /api/staff/leave`, `PUT /api/staff/leave/{id}/review` with `status = PENDING_HOD` recommendation or `REJECTED`). Staff only accesses leave requests for students in their assigned teaching cohorts.
    - HOD final stage-2 approval (`PUT /api/hod/leave/{id}/decision` $\rightarrow$ `APPROVED` or `REJECTED`), reusing existing Phase 9 workflow.
  - **Scoped Announcements with Backend Target Authorization**:
    - `AnnouncementService.java` & `AnnouncementController.java` (`GET /api/announcements`, `POST /api/announcements`, `DELETE /api/announcements/{id}`).
    - Rigorous backend authorization of target scope:
      - `ADMIN`: Can broadcast `INSTITUTION`, `DEPARTMENT`, `CLASS`.
      - `HOD`: Can broadcast `DEPARTMENT` (own department only) and `CLASS` (sections within own department).
      - `STAFF`: Can only broadcast `CLASS` announcements for sections/subjects actively assigned to them in `TeachingAssignment`.
    - Audience filtering: Students and staff only see announcements applicable to their institution, department, or enrolled/assigned classroom sections.
  - **Student Achievements & Authenticated Campus Showcase**:
    - `AchievementService.java` & `AchievementController.java` (`POST /api/student/achievements`, `GET /api/student/achievements`, `GET /api/staff/achievements`, `PUT /api/staff/achievements/{id}/verify`, `GET /api/achievements/verified`).
    - Authenticated endpoint: `GET /api/achievements/verified` secured by `@PreAuthorize("isAuthenticated()")` so campus-wide students and faculty can view verified honors without public internet exposure.
  - **Personal Workspace & Interactive Task Checklists**:
    - `WorkspaceService.java` & `WorkspaceController.java` (`GET /api/workspace`, `POST /api/workspace`, `PUT /api/workspace/{id}`, `DELETE /api/workspace/{id}`, `PUT /api/workspace/{id}/toggle`).
    - Private notes and task checklist management with dynamic item completion toggling for all authenticated roles.
  - **DTOs & Frontend Integration**:
    - Backend: `ApplyLeaveRequest`, `StaffLeaveReviewRequest`, `LeaveResponseDto`, `CreateAnnouncementRequest`, `AnnouncementDto`, `SubmitAchievementRequest`, `VerifyAchievementRequest`, `AchievementDto`, `CreateWorkspaceDocumentRequest`, `UpdateWorkspaceDocumentRequest`, `WorkspaceDocumentDto`.
    - Frontend Types & Services: `leave.types.ts`, `announcement.types.ts`, `achievement.types.ts`, `workspace.types.ts`, and corresponding services.
    - Frontend UI Pages: `StudentLeavePage.tsx`, `StaffLeavePage.tsx`, `AnnouncementsPage.tsx`, `StudentAchievementsPage.tsx`, `StaffAchievementsPage.tsx`, `PersonalWorkspacePage.tsx`.
    - Routes wired for Student, Staff, HOD, and Admin.
- [x] Build verification: Backend `mvn compile` → **BUILD SUCCESS** (0 errors); Frontend `npm run build` → **✓ 1697 modules, built in 4.45s**.

- [x] **Phase 12: Academic History & Semester Results**:
  - **Academic History Architecture**:
    - Aggregates multi-semester `SubjectAcademicRecord` entries and `SemesterResult` records from MySQL as the single source of truth.
    - Sourced attendance directly from `SubjectAcademicRecord.attendancePercentage`.
    - Sourced continuous assessment directly from `iat1Score`, `iat2Score`, `assignmentScore`.
    - Preserved existing `predictedSemesterScore` from `SemesterResult` without triggering new ML inference in Phase 12.
  - **Backend Endpoints & Security**:
    - `GET /api/student/academic/history`: Authenticated student's own full multi-semester history (`@PreAuthorize("hasRole('STUDENT')")`).
    - `GET /api/student/{studentProfileId}/academic/history`: Multi-role view with strict authorization in `StudentService.java` (`ADMIN`: all students, `HOD`: own department students, `STAFF`: assigned section/subject students, `STUDENT`: own profile only).
  - **DTOs & Service**:
    - `SemesterHistoryDto.java`, `StudentAcademicHistoryDto.java`.
    - `StudentService.java` with `getMyAcademicHistory()`, `getStudentAcademicHistory()`, and `compileAcademicHistory()`.
  - **Frontend UI & Routes**:
    - `student.types.ts` & `student.service.ts` updated with `SemesterHistory`, `StudentAcademicHistory`, `getAcademicHistory()`, `getStudentAcademicHistory()`.
    - `StudentPerformancePage.tsx` at `/student/performance`: Multi-semester tabbed view, KPI summary cards (Credits, Attendance, Semester Result), and subject-wise assessment breakdown table.
    - `StudentAttendancePage.tsx` at `/student/attendance`: Subject-wise attendance status table with color-coded badges (`<75%` Defaulter Alert, `75–85%` Warning, `>85%` Good Standing), overall averages, and quick link to apply for leave.
    - Routes wired in `AppRoutes.tsx`, replacing `ModulePlaceholder`.
- [x] Build verification: Backend `mvn compile` → **BUILD SUCCESS** (0 errors); Frontend `npm run build` → **✓ 1699 modules, built in 4.32s**.

- [x] **Phase 13: ML-Based Semester Performance Prediction**:
  - **ML Microservice (`ml-service/`, FastAPI + Scikit-Learn)**:
    - Dedicated standalone Python service running on `http://localhost:8000`.
    - Algorithm: `RandomForestRegressor(n_estimators=100, random_state=42, max_depth=8)` trained to predict numerical `predictedSemesterScore` (0.00 – 100.00).
    - Dual Model Architecture:
      - Semester 1 Model (`semester1_rf_model.joblib`): Features `iat1` (0–50), `iat2` (0–50), `assignment` (0–25), `attendance` (0–100).
      - Semester 2+ Model (`semester_performance_model.joblib`): Features `previous_semester_score` (0–100), `iat1`, `iat2`, `assignment`, `attendance`.
    - Endpoints: `POST /predict`, `POST /api/predict`, `GET /health`, `GET /docs`.
    - Strict Pydantic validation: Rejects out-of-range marks and missing previous semester score for Sem 2+ with HTTP 422. Clamps raw predictions strictly to `[0.0, 100.0]`.
    - Training script: `training/train_model.py` generating models with sample dataset template `sample_academic_data.csv`. (Documented that genuine institutional historical records are required for production scientific validation).
  - **Spring Boot ML Integration**:
    - Configuration: `app.ml-service.url=http://localhost:8000` in `application.yml`.
    - `MlPredictionService.java`:
      - Resolves student continuous assessment marks directly from MySQL `SubjectAcademicRecord` (calculating averages across enrolled subjects).
      - Verifies completeness: Returns `{ available: false, message: "..." }` if marks are pending or if previous semester actual score is missing for Sem 2+.
      - Calls FastAPI endpoint via Spring `RestClient`.
      - Persists `predictedSemesterScore` into `SemesterResult` entity without modifying `actualSemesterScore`.
      - Enforces strict role authorization (Student own profile, Staff assigned class section, HOD department, Admin institution-wide).
      - Records audit log entry with `AuditLogService`.
    - `MlPredictionController.java`: `POST /api/ml/predict` and `POST /api/ml/predict/{studentProfileId}`.
  - **Frontend UI Integration**:
    - `ml.types.ts` & `ml.service.ts`: `predictMySemesterPerformance()`, `predictStudentSemesterPerformance()`.
    - `StudentPerformancePage.tsx`: Integrated clean "Semester Performance Prediction" section for active semester displaying predicted score `XX.X / 100`, input factor breakdown, and one-click "Predict / Recalculate Semester Performance" button with loading/error handling.
- [x] Build verification: Backend `mvn compile` → **BUILD SUCCESS** (0 errors); Frontend `npm run build` → **✓ 1700 modules, built in 2.94s**; FastAPI test suite → **100% PASS**.

- [x] **Phase 14: Gemini AI Academic Guidance Integration**:
  - **Core Purpose & Guardrails**:
    - Qualitative academic guidance assistant grounded strictly in verified MySQL academic records (IAT 1, IAT 2, Assignment, Attendance %, and Phase 13 ML Predicted Score).
    - Strict non-negotiable boundaries: Gemini does NOT calculate grades, does NOT replace or recalculate the RandomForestRegressor ML prediction, does NOT generate placement predictions, and does NOT generate risk scores, ranking, or probability values.
  - **Backend Architecture & Security**:
    - Backend Proxy: `POST /api/ai/academic-guidance` (`@PreAuthorize("hasRole('STUDENT')")`) and `POST /api/ai/academic-guidance/{studentProfileId}` (`@PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'HOD', 'ADMIN')")`).
    - API Key Security: `GEMINI_API_KEY` is backend-only and never exposed to the frontend/browser.
    - Grounding: `AiAcademicGuidanceService.java` pulls live continuous assessment records from MySQL `SubjectAcademicRecord` and `SemesterResult`. If records are missing, returns informative unavailable responses without inventing fallback marks.
    - Robustness: Seamlessly handles missing API key or network outages with grounded deterministic fallback templates without throwing raw stack traces.
    - Auditing: Generates `GENERATE_GEMINI_GUIDANCE` audit logs via `AuditLogService`.
  - **DTOs & Frontend UI Integration**:
    - `AcademicGuidanceResponse.java`, `ai.types.ts`, `ai.service.ts`.
    - `StudentPerformancePage.tsx`: Dedicated "AI Academic Guidance" card with Summary insights, Key Strengths, Focus Areas, and Actionable Study Strategies checklist.
- [x] Build verification: Backend `mvn compile` → **BUILD SUCCESS** (0 errors); Frontend `npm run build` → **✓ 1701 modules, built in 4.02s**.

- [x] **Phase 15: Final System Polish, Integration Verification & Production Hardening**:
  - Phase 14 Pre-Check PASSED (READ-ONLY audit): Gemini fallback verified to use only real MySQL records. No fabricated marks or predictions. Service-level authorization verified for all 4 roles.
  - Build verification: Backend `mvn compile` → **BUILD SUCCESS** (0 errors); Frontend `npm run build` → **✓ 1701 modules, built in 4.02s**.
  - ModulePlaceholder routes audited — 10 routes remain as `ModulePlaceholder` (Virtual Classrooms, Coursework Assignments, Digital Portfolio, Campus Groups ×2, Staff Performance, Faculty Profile, HOD Performance, Department Reports, HOD Profile, Admin Profile). These are architecturally correct shells for future iterations.
  - Security architecture verified: SecurityConfig enforces URL-level RBAC; Service layer enforces ownership/department/section scoped authorization for all multi-role endpoints.
  - Data integrity confirmed: MySQL is the single source of truth. No in-memory mock arrays exist. All dashboards render empty states when MySQL has no data.
  - Phase 13 ML prototype disclaimer preserved: Synthetic `sample_academic_data.csv` (2000 rows) clearly documented. Models are for pipeline demonstration only, not institutional validation.
  - Phase 14 Gemini separation confirmed: ML prediction (RandomForestRegressor) and AI guidance (Gemini) are architecturally separate, clearly labeled in UI, and serve different purposes.
  - Leave workflow verified: PENDING_STAFF → PENDING_HOD → APPROVED/REJECTED multi-stage pipeline intact.
  - Excel import workflow verified: Preview → Validate → Confirm → MySQL write pipeline intact with in-memory token cache (15-min TTL, one-time-use).
  - Announcement security verified: STAFF=CLASS scope only, HOD=DEPARTMENT+CLASS (own dept), ADMIN=INSTITUTION/DEPARTMENT/CLASS.
  - FastAPI ML service: Offline when not explicitly started. Must be started manually before ML prediction is invoked. This is expected for a development/prototype setup.

### COMPLETE:
- All 15 Phases fully implemented and verified.

### BLOCKED:
- None. Toolchains (Java 21/26, Maven 3.9, Node 24, Python 3.11, FastAPI, uv) are verified and working.

---

## 9. Important API Endpoints

### Public & Auth:
- `POST /api/auth/login` (Body: `{ email, password }` $\rightarrow$ returns token & UserSummary)
- `POST /api/auth/register` (Body: `StudentRegistrationRequest` $\rightarrow$ creates PENDING student)
- `GET /api/auth/me` (Header: `Bearer <token>` $\rightarrow$ returns current user summary)
- `GET /api/public/departments` (Returns list of active departments)
- `GET /api/public/sections?departmentId={id}` (Returns list of sections for department)

### Admin (To be wired in Phase 4/5):
- `GET /api/admin/registrations/pending`
- `PUT /api/admin/registrations/{id}/approve`
- `PUT /api/admin/registrations/{id}/reject`
- `GET /api/admin/users`
- `PUT /api/admin/users/{id}/status`
- `POST /api/admin/staff`
- `POST /api/admin/hod`
- `GET /api/admin/departments`, `POST /api/admin/departments`
- `GET /api/admin/sections`, `POST /api/admin/sections`
- `GET /api/admin/subjects`, `POST /api/admin/subjects`
- `GET /api/admin/teaching-assignments`, `POST /api/admin/teaching-assignments`
- `GET /api/admin/audit-logs`

---

## 10. Important Frontend Routes

- `/login` — Public login
- `/register` — 1st-year student registration
- `/registration-pending` — Pending approval status notice
- `/unauthorized` — 403 error page
- `/student/*` — Protected Student workspace (`dashboard`, `academic`, `classrooms`, `assignments`, `attendance`, `performance`, `portfolio`, `achievements`, `workspace`, `groups`, `leave`, `announcements`, `profile`)
- `/staff/*` — Protected Staff workspace (`dashboard`, `classes`, `classrooms`, `attendance`, `iat`, `assignments`, `performance`, `leave`, `announcements`, `groups`, `achievements`, `excel`, `workspace`, `profile`)
- `/hod/*` — Protected HOD workspace (`dashboard`, `department`, `students`, `attendance`, `performance`, `staff`, `leave`, `announcements`, `reports`, `workspace`, `profile`)
- `/admin/*` — Protected Admin workspace (`dashboard`, `users`, `registrations`, `departments`, `subjects`, `sections`, `teaching-assignments`, `monitoring`, `announcements`, `reports`, `audit-logs`, `profile`)

---

## 11. Important Design & Implementation Rules

1. **NO FAKE DATA OR MOCK ARRAYS**: All dashboard numbers, lists, and metrics must originate from MySQL or clearly render empty states (`EmptyState.tsx`).
2. **NO PLACEMENT / ACADEMIC RISK ML**: Do NOT implement placement prediction, placement probability, risk scores, or risk classifications. ML is strictly for **Semester Performance Score Prediction (0–100)**.
3. **UNIFIED DESIGN LANGUAGE**: All 4 roles must share the exact same styling (`bg-slate-50`, `text-slate-900`, `bg-brand-600`, subtle 1px borders). Do not create colorful or SaaS-gimmick dashboards.
4. **NO EMOJIS AS UI ICONS**: Use Lucide React icons exclusively.
5. **NO LOMBOK IN BACKEND**: Standard Java POJOs (explicit getters/setters/constructors) must be used for complete compatibility across JDK 21–26.
6. **ATTENDANCE SOURCE OF TRUTH**: `attendance_percentage` in `subject_academic_records` is the canonical attendance value.
7. **EXCEL WORKFLOW**: Always follow `Preview` $\rightarrow$ `Validate` $\rightarrow$ `Confirm` $\rightarrow$ `MySQL Save`.

---

## 12. Final System State (Phase 15 Complete)

**All 15 Phases are implemented.** This section documents the remaining `ModulePlaceholder` routes and the startup procedure for the multi-service architecture.

### 12.1 Remaining ModulePlaceholder Routes (Future Iterations)

| Route | Title | Status |
|-------|-------|--------|
| `/student/classrooms` | Virtual Classrooms | Placeholder |
| `/student/assignments` | Coursework Assignments | Placeholder |
| `/student/portfolio` | Digital Portfolio | Placeholder |
| `/student/groups` | Campus Groups (Student) | Placeholder |
| `/staff/performance` | Student Performance (Staff view) | Placeholder |
| `/staff/groups` | Campus Groups (Staff) | Placeholder |
| `/staff/profile` | Faculty Profile | Placeholder |
| `/hod/performance` | Academic Performance Benchmarks | Placeholder |
| `/hod/reports` | Department Reports | Placeholder |
| `/hod/profile` | HOD Profile | Placeholder |
| `/admin/profile` | Admin Profile | Placeholder |

### 12.2 Multi-Service Startup Procedure

```powershell
# 1. Start MySQL (must be running)

# 2. Start Spring Boot backend (port 8080)
cd backend
mvn spring-boot:run

# 3. Start FastAPI ML service (port 8000) — required for ML prediction
cd ml-service
$env:PATH = "C:\Users\sowba\.local\bin;" + $env:PATH
.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 4. Start React frontend (port 5173)
cd frontend
npm run dev
```

### 12.3 Environment Variables Required

| Variable | Service | Required For |
|----------|---------|--------------|
| `GEMINI_API_KEY` | Spring Boot | Phase 14 live Gemini AI guidance (without it, deterministic fallback is used) |
| `app.ml-service.url` | Spring Boot `application.yml` | Phase 13 ML prediction (default: `http://localhost:8000`) |

### 12.4 Key Architecture Invariants

- **MySQL = Single Source of Truth**: No in-memory data. All academic records, users, entities live in MySQL.
- **Spring Boot = Authorization Layer**: Never bypass backend for ML or Gemini. React → Spring Boot → FastAPI/Gemini.
- **FastAPI = Inference Only**: The Python service has no database access. It receives marks from Spring Boot and returns predictions.
- **Gemini = Backend-Proxied**: `GEMINI_API_KEY` must never appear in frontend code or browser environment.
- **ML Disclaimer**: The Random Forest models are trained on synthetic demonstration data. Institutional validation requires real historical records.
