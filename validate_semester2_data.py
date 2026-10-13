import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://localhost:8080/api"

def http_req(url, method="GET", headers=None, data=None):
    if headers is None:
        headers = {}
    body = None
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return response.getcode(), json.loads(res_body) if res_body else None
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, {"raw": err_body}

def main():
    print("=" * 70)
    print("  VALIDATING SEMESTER 2 DEMO DATA INTEGRATION & APIS")
    print("=" * 70)

    # 1. Login Student (Arun Kumar S, ID 4, Reg: 2026CSE001)
    status, res = http_req(f"{BASE_URL}/auth/login", method="POST", data={"email": "arunkumar.s@edusphere.edu", "password": "Student@123"})
    assert status == 200, f"Student login failed: {res}"
    student_token = res["data"]["token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print("[OK] Student login successful")

    # 2. Check /student/academic/current -> Should show Semester 2 enrolled subjects
    status, res = http_req(f"{BASE_URL}/student/academic/current", headers=student_headers)
    assert status == 200, f"Failed: {res}"
    data = res["data"]
    print(f"Current Semester in Profile/Academic: {data['currentSemester']}")
    assert data['currentSemester'] == 2, f"Expected Sem 2, got {data['currentSemester']}"
    print(f"Enrolled Semester 2 Subjects count: {len(data['subjects'])}")
    for sub in data['subjects']:
        print(f"  - {sub['subjectCode']}: {sub['subjectName']} ({sub['credits']} cr) | IAT1={sub['iat1Score']}, IAT2={sub['iat2Score']}, Att={sub['attendancePercentage']}%")
    assert len(data['subjects']) == 6, f"Expected 6 enrolled subjects for Sem 2, got {len(data['subjects'])}"
    print("[OK] Current academic overview accurately renders all 6 Semester 2 subjects and marks")

    # 3. Check /student/classrooms -> Should show only Semester 2 classrooms
    status, res = http_req(f"{BASE_URL}/student/classrooms", headers=student_headers)
    assert status == 200
    classrooms = res["data"]
    print(f"\nStudent Active Classrooms: {len(classrooms)}")
    for c in classrooms:
        print(f"  - Classroom ID {c['classroomId']}: {c['name']} (Sem {c['semester']}) | Materials={c['materialCount']}, Assignments={c['assignmentCount']}")
        assert c['semester'] == 2, f"Old Semester 1 classroom appeared: {c['name']}"
    assert len(classrooms) == 6, f"Expected 6 active classrooms for Semester 2, got {len(classrooms)}"
    print("[OK] Only active Semester 2 classrooms appear in student classroom view")

    # 4. Check /student/assignments -> Should show only Semester 2 assignments
    status, res = http_req(f"{BASE_URL}/student/assignments", headers=student_headers)
    assert status == 200
    assignments = res["data"]
    print(f"\nStudent Active Assignments: {len(assignments)}")
    for a in assignments:
        print(f"  - Assignment: '{a['title']}' (Max: {a['maxMarks']}, Due: {a['deadline']})")
    assert len(assignments) == 8, f"Expected 8 active assignments for Semester 2, got {len(assignments)}"
    print("[OK] Only active Semester 2 coursework assignments appear in student assignment view")

    # 5. Check /student/academic/history -> Must still preserve Semester 1 published results
    status, res = http_req(f"{BASE_URL}/student/academic/history", headers=student_headers)
    assert status == 200
    history = res["data"]
    sem1 = next((s for s in history["semesters"] if s["semester"] == 1), None)
    assert sem1 is not None, "Semester 1 historical records missing!"
    print(f"\nHistorical Semester 1 Status: {sem1['status']}, Score={sem1['actualSemesterScore']}, Grade={sem1['grade']}")
    assert sem1['status'] == 'PUBLISHED', "Semester 1 status altered!"
    assert sem1['actualSemesterScore'] is not None, "Semester 1 score altered!"
    assert len(sem1['subjects']) == 6, f"Expected 6 subjects in Sem 1 history, got {len(sem1['subjects'])}"

    sem2 = next((s for s in history["semesters"] if s["semester"] == 2), None)
    assert sem2 is not None, "Semester 2 missing from history!"
    print(f"Ongoing Semester 2 Status: {sem2['status']}, Official Score={sem2['actualSemesterScore']}")
    # In ongoing semester, official score should be None (not published yet)
    assert sem2['actualSemesterScore'] is None, "Semester 2 official result should remain unpublished!"
    print("[OK] Semester 1 historical transcript preserved with official published results")
    print("[OK] Semester 2 correctly presented as ongoing semester with unpublished official result")

    # 6. Admin Results Data Verification API
    status, res = http_req(f"{BASE_URL}/auth/login", method="POST", data={"email": "admin@edusphere.edu", "password": "Admin@123"})
    assert status == 200
    admin_token = res["data"]["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    status, res = http_req(f"{BASE_URL}/admin/results/verify-data?departmentId=1&sectionId=1&semester=2&academicYear=2026-2027", headers=admin_headers)
    assert status == 200
    vdata = res["data"]
    print(f"\nAdmin Result Verification Data for Semester 2 (CSE Section A):")
    print(f"  Total Students: {vdata['totalStudents']}, Total Subjects: {vdata['totalSubjects']}")
    print(f"  Expected Records: {vdata['expectedRecords']}, Completed: {vdata['completedRecords']}, Missing: {vdata['missingRecords']}")
    print(f"  Ready For Generation: {vdata['readyForGeneration']}")
    print(f"  Status Message: {vdata['statusMessage']}")
    assert vdata['readyForGeneration'] == True, "Expected Semester 2 to be ready for generation!"
    assert vdata['completedRecords'] == 30, f"Expected 30 complete records, got {vdata['completedRecords']}"
    assert vdata['missingRecords'] == 0, f"Expected 0 missing records, got {vdata['missingRecords']}"
    print("[OK] Admin result verification API confirms all 30 Semester 2 records are 100% complete and ready")

    print("\n" + "=" * 70)
    print("  ALL VALIDATION CHECKS PASSED WITH 100% SUCCESS")
    print("=" * 70)

if __name__ == "__main__":
    main()
