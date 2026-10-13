package com.edusphere.service;

import com.edusphere.dto.excel.ExcelConfirmRequest;
import com.edusphere.dto.excel.ExcelPreviewResponse;
import com.edusphere.dto.excel.ExcelRowPreview;
import com.edusphere.entity.*;
import com.edusphere.exception.BadRequestException;
import com.edusphere.exception.ResourceNotFoundException;
import com.edusphere.exception.UnauthorizedAccessException;
import com.edusphere.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Phase 8: Excel Import Service
 *
 * Two-phase workflow:
 *   Phase A – preview():  Parse + Validate Excel. Store validated data in memory cache.
 *                          Return token + preview. ZERO DB writes.
 *   Phase B – confirm():  Look up cache by token. Write only valid rows to MySQL
 *                          inside a single @Transactional. Log to excel_import_logs.
 */
@Service
public class ExcelImportService {

    private static final Logger log = LoggerFactory.getLogger(ExcelImportService.class);

    // In-memory preview cache: importToken → ExcelPreviewResponse
    // Token expires after 15 minutes; staffId is embedded for security re-check on confirm
    private static final Map<String, CachedPreview> previewCache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 15 * 60 * 1000L; // 15 minutes

    // Valid import types accepted from frontend
    public static final String TYPE_ATTENDANCE = "ATTENDANCE";
    public static final String TYPE_IAT1       = "IAT1";
    public static final String TYPE_IAT2       = "IAT2";

    // Range constraints
    private static final double ATTENDANCE_MAX = 100.0;
    private static final double ATTENDANCE_MIN = 0.0;
    private static final double IAT_MAX        = 50.0;
    private static final double IAT_MIN        = 0.0;

    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final StaffProfileRepository       staffProfileRepository;
    private final StudentProfileRepository     studentProfileRepository;
    private final SubjectAcademicRecordRepository subjectAcademicRecordRepository;
    private final ExcelImportLogRepository     excelImportLogRepository;
    private final UserRepository               userRepository;

    public ExcelImportService(TeachingAssignmentRepository teachingAssignmentRepository,
                               StaffProfileRepository staffProfileRepository,
                               StudentProfileRepository studentProfileRepository,
                               SubjectAcademicRecordRepository subjectAcademicRecordRepository,
                               ExcelImportLogRepository excelImportLogRepository,
                               UserRepository userRepository) {
        this.teachingAssignmentRepository = teachingAssignmentRepository;
        this.staffProfileRepository       = staffProfileRepository;
        this.studentProfileRepository     = studentProfileRepository;
        this.subjectAcademicRecordRepository = subjectAcademicRecordRepository;
        this.excelImportLogRepository     = excelImportLogRepository;
        this.userRepository               = userRepository;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE A — PREVIEW  (no DB write)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Parse and validate the uploaded Excel file.
     * Returns a full preview with per-row validation status.
     * Nothing is written to the database.
     */
    public ExcelPreviewResponse preview(Long userId,
                                        Role userRole,
                                        Long teachingAssignmentId,
                                        String importType,
                                        MultipartFile file) {

        // ── 1. Validate import type ──────────────────────────────────────────
        if (!List.of(TYPE_ATTENDANCE, TYPE_IAT1, TYPE_IAT2).contains(importType)) {
            throw new BadRequestException("Invalid import type '" + importType
                    + "'. Allowed: ATTENDANCE, IAT1, IAT2");
        }

        // ── 2. Resolve and authorize the teaching assignment ─────────────────
        TeachingAssignment ta = teachingAssignmentRepository.findById(teachingAssignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("TeachingAssignment", "id", teachingAssignmentId));

        enforceOwnership(userId, userRole, ta);

        // ── 3. Validate file type ────────────────────────────────────────────
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload.xlsx";
        if (!originalName.toLowerCase().endsWith(".xlsx")) {
            throw new BadRequestException("Only .xlsx files are supported. Please use a modern Excel workbook.");
        }

        // ── 4. Load eligible students for this class (indexed by register number) ──
        List<StudentProfile> cohort = studentProfileRepository.findByDepartmentIdAndSectionId(
                ta.getSubject().getDepartment().getId(), ta.getSection().getId());

        Map<String, StudentProfile> cohortIndex = new HashMap<>();
        for (StudentProfile sp : cohort) {
            cohortIndex.put(sp.getRegisterNumber().trim().toUpperCase(), sp);
        }

        // ── 5. Parse Excel with Apache POI ───────────────────────────────────
        List<ExcelRowPreview> rows = new ArrayList<>();
        Set<String> seenRegNumbers = new HashSet<>();

        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {

            if (wb.getNumberOfSheets() == 0) {
                throw new BadRequestException("The uploaded Excel file contains no sheets.");
            }

            Sheet sheet = wb.getSheetAt(0);
            int lastRow = sheet.getLastRowNum();

            if (lastRow < 1) {
                throw new BadRequestException("The Excel sheet is empty. Expected a header row followed by data rows.");
            }

            // Validate header row (row 0)
            Row header = sheet.getRow(0);
            validateHeader(header, importType);

            // Parse data rows (start from row 1)
            for (int i = 1; i <= lastRow; i++) {
                Row row = sheet.getRow(i);
                ExcelRowPreview preview = parseAndValidateRow(row, i + 1, importType,
                        cohortIndex, seenRegNumbers);
                rows.add(preview);
            }

        } catch (IOException e) {
            log.error("Failed to parse Excel file: {}", originalName, e);
            throw new BadRequestException("Could not read the Excel file. Ensure it is a valid .xlsx workbook.");
        }

        // ── 6. Build summary ─────────────────────────────────────────────────
        long validCount   = rows.stream().filter(ExcelRowPreview::isValid).count();
        long invalidCount = rows.stream().filter(r -> !r.isValid()).count();

        ExcelPreviewResponse response = new ExcelPreviewResponse();
        response.setImportType(importType);
        response.setTeachingAssignmentId(ta.getId());
        response.setSubjectCode(ta.getSubject().getCode());
        response.setSubjectName(ta.getSubject().getName());
        response.setSectionName(ta.getSection().getName());
        response.setSemester(ta.getSemester());
        response.setAcademicYear(ta.getAcademicYear());
        response.setFileName(originalName);
        response.setTotalRows(rows.size());
        response.setValidRows((int) validCount);
        response.setInvalidRows((int) invalidCount);
        response.setHasErrors(invalidCount > 0);
        response.setRows(rows);

        // ── 7. Cache only if there are valid rows (no token if everything is invalid) ──
        String token = null;
        if (validCount > 0) {
            token = UUID.randomUUID().toString();
            // Resolve staffId for cache security
            Long staffId = resolveStaffId(userId, userRole);
            previewCache.put(token, new CachedPreview(token, staffId, ta, importType, rows, originalName));
            evictExpiredTokens();
        }
        response.setImportToken(token);

        return response;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE B — CONFIRM  (@Transactional DB write)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Commit the validated rows to subject_academic_records.
     * Only called after the frontend user explicitly clicks "Confirm Import".
     * The entire operation is one transaction — partial saves cannot occur.
     */
    @Transactional
    public Map<String, Object> confirm(Long userId, Role userRole, ExcelConfirmRequest request) {

        // ── 1. Look up cache ─────────────────────────────────────────────────
        CachedPreview cached = previewCache.get(request.getImportToken());
        if (cached == null) {
            throw new BadRequestException(
                    "Import session has expired or is invalid. Please re-upload your Excel file and preview again.");
        }

        // ── 2. Re-validate ownership against cached staffId ──────────────────
        Long staffId = resolveStaffId(userId, userRole);
        if (userRole != Role.ADMIN && !cached.staffId.equals(staffId)) {
            throw new UnauthorizedAccessException("This import token does not belong to your account.");
        }

        // ── 3. Verify teachingAssignmentId matches token ─────────────────────
        if (!cached.ta.getId().equals(request.getTeachingAssignmentId())) {
            throw new BadRequestException("Teaching assignment mismatch. Re-upload and preview again.");
        }

        // ── 4. TTL check ─────────────────────────────────────────────────────
        if (System.currentTimeMillis() - cached.createdAt > CACHE_TTL_MS) {
            previewCache.remove(request.getImportToken());
            throw new BadRequestException(
                    "Import session expired (15-minute limit). Please re-upload and preview again.");
        }

        TeachingAssignment ta       = cached.ta;
        String             importType = cached.importType;
        List<ExcelRowPreview> rows  = cached.rows;

        // ── 5. Filter only valid rows ─────────────────────────────────────────
        List<ExcelRowPreview> validRows = rows.stream().filter(ExcelRowPreview::isValid).toList();

        if (validRows.isEmpty()) {
            throw new BadRequestException("No valid rows to import. Fix the Excel errors and re-upload.");
        }

        // ── 6. Upsert subject_academic_records ───────────────────────────────
        int saved = 0;
        for (ExcelRowPreview row : validRows) {
            StudentProfile sp = studentProfileRepository.findById(row.getStudentProfileId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "StudentProfile", "id", row.getStudentProfileId()));

            SubjectAcademicRecord record = subjectAcademicRecordRepository
                    .findByStudentIdAndSubjectIdAndSemesterAndAcademicYear(
                            sp.getId(), ta.getSubject().getId(),
                            ta.getSemester(), ta.getAcademicYear())
                    .orElseGet(() -> {
                        SubjectAcademicRecord r = new SubjectAcademicRecord();
                        r.setStudent(sp);
                        r.setSubject(ta.getSubject());
                        r.setSemester(ta.getSemester());
                        r.setAcademicYear(ta.getAcademicYear());
                        return r;
                    });

            BigDecimal val = BigDecimal.valueOf(row.getValue());
            switch (importType) {
                case TYPE_ATTENDANCE -> record.setAttendancePercentage(val);
                case TYPE_IAT1       -> record.setIat1Score(val);
                case TYPE_IAT2       -> record.setIat2Score(val);
            }

            subjectAcademicRecordRepository.save(record);
            saved++;
        }

        // ── 7. Write import log ───────────────────────────────────────────────
        StaffProfile uploader = staffProfileRepository.findByUserId(userId)
                .orElse(null); // Admin import: uploader may be null — log anyway

        ExcelImportLog importLog = new ExcelImportLog();
        importLog.setFileName(cached.fileName);
        importLog.setImportType(toImportType(importType));
        importLog.setSubject(ta.getSubject());
        importLog.setSection(ta.getSection());
        importLog.setSemester(ta.getSemester());
        importLog.setAcademicYear(ta.getAcademicYear());
        importLog.setUploadedBy(uploader != null ? uploader :
                staffProfileRepository.findAll().stream().findFirst().orElseThrow());
        importLog.setTotalRows(rows.size());
        importLog.setSuccessfulRows(saved);
        importLog.setFailedRows(rows.size() - (int) rows.stream().filter(ExcelRowPreview::isValid).count());
        importLog.setErrorSummary(buildErrorSummary(rows));
        excelImportLogRepository.save(importLog);

        // ── 8. Evict token (one-time use) ────────────────────────────────────
        previewCache.remove(request.getImportToken());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("savedRows", saved);
        result.put("skippedRows", rows.size() - saved);
        result.put("importType", importType);
        result.put("subjectCode", ta.getSubject().getCode());
        result.put("sectionName", ta.getSection().getName());
        result.put("academicYear", ta.getAcademicYear());
        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private void validateHeader(Row header, String importType) {
        if (header == null) {
            throw new BadRequestException("Row 1 (header row) is missing.");
        }
        // Expected columns: A=Register Number, B=Student Name, C=Value
        String colA = getCellString(header, 0).toLowerCase();
        String colC = getCellString(header, 2).toLowerCase();

        if (!colA.contains("register") && !colA.contains("reg")) {
            throw new BadRequestException(
                    "Column A (header) must be 'Register Number'. Found: '" + getCellString(header, 0) + "'.");
        }

        boolean colCOk = switch (importType) {
            case TYPE_ATTENDANCE -> colC.contains("attendance") || colC.contains("percent");
            case TYPE_IAT1       -> colC.contains("iat1") || colC.contains("iat 1") || colC.contains("internal 1");
            case TYPE_IAT2       -> colC.contains("iat2") || colC.contains("iat 2") || colC.contains("internal 2");
            default              -> false;
        };

        if (!colCOk) {
            String expected = switch (importType) {
                case TYPE_ATTENDANCE -> "'Attendance %' or 'Attendance Percentage'";
                case TYPE_IAT1       -> "'IAT1' or 'IAT 1'";
                case TYPE_IAT2       -> "'IAT2' or 'IAT 2'";
                default              -> "value column";
            };
            throw new BadRequestException(
                    "Column C (header) must be " + expected + ". Found: '" + getCellString(header, 2) + "'. "
                    + "Download the template for the correct format.");
        }
    }

    private ExcelRowPreview parseAndValidateRow(Row row, int rowNumber, String importType,
                                                 Map<String, StudentProfile> cohortIndex,
                                                 Set<String> seenRegNumbers) {
        ExcelRowPreview preview = new ExcelRowPreview();
        preview.setRowNumber(rowNumber);

        // Skip completely blank rows silently
        if (row == null || isRowBlank(row)) {
            preview.setValid(false);
            preview.setErrorReason("Row is empty.");
            return preview;
        }

        // Column A — Register Number
        String regRaw = getCellString(row, 0).trim();
        preview.setRegisterNumber(regRaw);

        // Column B — Student Name (informational, not validated against DB)
        preview.setStudentName(getCellString(row, 1).trim());

        // Column C — Value
        Double value = getCellNumeric(row, 2);
        preview.setValue(value);

        // ── Validation checks ─────────────────────────────────────────────────

        if (regRaw.isEmpty()) {
            return invalid(preview, "Register number is blank.");
        }

        String regKey = regRaw.toUpperCase();

        // Duplicate register number in same file
        if (seenRegNumbers.contains(regKey)) {
            return invalid(preview, "Duplicate register number in this file (row " + rowNumber + ").");
        }
        seenRegNumbers.add(regKey);

        // Student not in this cohort
        StudentProfile sp = cohortIndex.get(regKey);
        if (sp == null) {
            return invalid(preview, "Register number '" + regRaw + "' is not enrolled in this class/section.");
        }

        // Value missing
        if (value == null) {
            return invalid(preview, "Value column (C) is empty or non-numeric.");
        }

        // Range validation
        switch (importType) {
            case TYPE_ATTENDANCE -> {
                if (value < ATTENDANCE_MIN || value > ATTENDANCE_MAX) {
                    return invalid(preview, "Attendance '" + value + "' is out of range (0–100).");
                }
            }
            case TYPE_IAT1, TYPE_IAT2 -> {
                if (value < IAT_MIN || value > IAT_MAX) {
                    return invalid(preview, "IAT score '" + value + "' is out of range (0–50).");
                }
            }
        }

        // All validations passed
        preview.setStudentProfileId(sp.getId());
        preview.setStudentName(sp.getFullName()); // Override with canonical DB name
        preview.setValid(true);
        return preview;
    }

    private ExcelRowPreview invalid(ExcelRowPreview preview, String reason) {
        preview.setValid(false);
        preview.setErrorReason(reason);
        return preview;
    }

    private void enforceOwnership(Long userId, Role userRole, TeachingAssignment ta) {
        if (userRole == Role.ADMIN) return;
        StaffProfile staff = staffProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StaffProfile", "userId", userId));
        if (!ta.getStaff().getId().equals(staff.getId())) {
            throw new UnauthorizedAccessException(
                    "You are not authorized to import data for this teaching assignment.");
        }
    }

    private Long resolveStaffId(Long userId, Role userRole) {
        if (userRole == Role.ADMIN) return -1L; // Admin bypass
        return staffProfileRepository.findByUserId(userId)
                .map(StaffProfile::getId)
                .orElseThrow(() -> new ResourceNotFoundException("StaffProfile", "userId", userId));
    }

    private ExcelImportType toImportType(String importType) {
        return switch (importType) {
            case TYPE_IAT1, TYPE_IAT2 -> ExcelImportType.IAT;
            default                   -> ExcelImportType.ATTENDANCE;
        };
    }

    private String buildErrorSummary(List<ExcelRowPreview> rows) {
        StringBuilder sb = new StringBuilder();
        for (ExcelRowPreview r : rows) {
            if (!r.isValid()) {
                sb.append("Row ").append(r.getRowNumber()).append(": ")
                  .append(r.getErrorReason()).append("; ");
            }
        }
        return sb.isEmpty() ? null : sb.toString();
    }

    private void evictExpiredTokens() {
        long now = System.currentTimeMillis();
        previewCache.entrySet().removeIf(e -> (now - e.getValue().createdAt) > CACHE_TTL_MS);
    }

    // ── Excel cell helpers ────────────────────────────────────────────────────

    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                double d = cell.getNumericCellValue();
                yield (d == Math.floor(d)) ? String.valueOf((long) d) : String.valueOf(d);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                try { yield String.valueOf(cell.getNumericCellValue()); }
                catch (Exception ex) { yield cell.getStringCellValue().trim(); }
            }
            default -> "";
        };
    }

    private Double getCellNumeric(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case NUMERIC -> cell.getNumericCellValue();
            case STRING  -> {
                try { yield Double.parseDouble(cell.getStringCellValue().trim()); }
                catch (NumberFormatException e) { yield null; }
            }
            case FORMULA -> {
                try { yield cell.getNumericCellValue(); }
                catch (Exception e) { yield null; }
            }
            default -> null;
        };
    }

    private boolean isRowBlank(Row row) {
        for (int c = 0; c <= 2; c++) {
            Cell cell = row.getCell(c, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
            if (cell != null && cell.getCellType() != CellType.BLANK) return false;
        }
        return true;
    }

    // ── Cached preview wrapper ────────────────────────────────────────────────

    private static class CachedPreview {
        final String token;
        final Long staffId;
        final TeachingAssignment ta;
        final String importType;
        final List<ExcelRowPreview> rows;
        final String fileName;
        final long createdAt = System.currentTimeMillis();

        CachedPreview(String token, Long staffId, TeachingAssignment ta,
                      String importType, List<ExcelRowPreview> rows, String fileName) {
            this.token      = token;
            this.staffId    = staffId;
            this.ta         = ta;
            this.importType = importType;
            this.rows       = rows;
            this.fileName   = fileName;
        }
    }
}
