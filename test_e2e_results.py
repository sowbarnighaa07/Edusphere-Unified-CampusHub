import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://localhost:8080/api"

def print_step(title):
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)

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
            status_code = response.getcode()
            return status_code, json.loads(res_body) if res_body else None
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, {"raw": err_body}
    except Exception as e:
        print(f"Network error on {url}: {e}")
        raise

def main():
    print("Starting EduSphere Semester Result & Transition E2E Test Suite...")

    # 1. Authenticate Admin
    print_step("1. AUTHENTICATION")
    status, res = http_req(f"{BASE_URL}/auth/login", method="POST", data={"email": "admin@edusphere.edu", "password": "Admin@123"})
    assert status == 200, f"Admin login failed: {res}"
    admin_token = res["data"]["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("[OK] Admin login successful")

    # Authenticate Student (Arun Kumar S, ID 4, Reg: 2026CSE001)
    status, res = http_req(f"{BASE_URL}/auth/login", method="POST", data={"email": "arunkumar.s@edusphere.edu", "password": "Student@123"})
    assert status == 200, f"Student login failed: {res}"
    student_token = res["data"]["token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print("[OK] Student login successful")

    # Authenticate Staff (Prof. S. Karthikeyan)
    status, res = http_req(f"{BASE_URL}/auth/login", method="POST", data={"email": "karthikeyan.s@edusphere.edu", "password": "Staff@123"})
    assert status == 200, f"Staff login failed: {res}"
    staff_token = res["data"]["token"]
    staff_headers = {"Authorization": f"Bearer {staff_token}"}
    print("[OK] Staff login successful")

    # 2. Verify Academic Data for CSE Section A, Semester 1
    print_step("2. ADMIN VERIFY ACADEMIC DATA")
    url = f"{BASE_URL}/admin/results/verify-data?departmentId=1&sectionId=1&semester=1&academicYear=2026-2027"
    status, res = http_req(url, headers=admin_headers)
    assert status == 200, f"Verify academic data failed: {res}"
    vdata = res["data"]
    print(f"Total Students: {vdata['totalStudents']}, Total Subjects: {vdata['totalSubjects']}")
    print(f"Expected Records: {vdata['expectedRecords']}, Completed: {vdata['completedRecords']}, Missing: {vdata['missingRecords']}")
    print(f"Ready for Generation: {vdata['readyForGeneration']}")
    print(f"Status Message: {vdata['statusMessage']}")
    assert vdata["readyForGeneration"] == True, "Expected data to be ready for generation"
    print("[OK] Academic data completeness verified successfully")

    # 3. Generate Semester Results (Sets status to DRAFT)
    print_step("3. ADMIN GENERATE SEMESTER RESULTS (DRAFT)")
    gen_payload = {
        "departmentId": 1,
        "sectionId": 1,
        "semester": 1,
        "academicYear": "2026-2027"
    }
    status, res = http_req(f"{BASE_URL}/admin/results/generate", method="POST", headers=admin_headers, data=gen_payload)
    assert status == 200, f"Generate results failed: {res}"
    gen_results = res["data"]
    print(f"Generated {len(gen_results)} student semester results:")
    for r in gen_results:
        print(f"  - {r['registerNumber']} ({r['studentName']}): Score={r['actualSemesterScore']}, Grade={r['grade']}, Credits={r['creditsEarned']}/{r['totalCredits']}, Status={r['status']}")
        assert r["status"] == "DRAFT", f"Expected DRAFT status but got {r['status']}"
        assert r["verifiedAt"] is None, "Expected verifiedAt to be None for DRAFT"
        assert r["publishedAt"] is None, "Expected publishedAt to be None for DRAFT"
    print("[OK] Semester results successfully generated as DRAFT")

    # 4. Enforce Student Visibility (DRAFT state - Must be hidden)
    print_step("4. STUDENT RESULT VISIBILITY ENFORCEMENT (DRAFT STATE)")
    status, res = http_req(f"{BASE_URL}/student/academic/history", headers=student_headers)
    assert status == 200, f"Student academic history failed: {res}"
    st_history = res["data"]
    sem1_history = next((s for s in st_history["semesters"] if s["semester"] == 1), None)
    assert sem1_history is not None, "Semester 1 record not found in student history"
    print(f"Student Semester 1 Status: {sem1_history['status']}")
    print(f"Student Semester 1 Actual Score: {sem1_history['actualSemesterScore']}")
    print(f"Student Semester 1 Grade: {sem1_history['grade']}")
    print(f"Student Semester 1 Credits Earned: {sem1_history['creditsEarned']}")
    assert sem1_history["actualSemesterScore"] is None, f"FAIL: Unpublished actualSemesterScore is exposed to student: {sem1_history['actualSemesterScore']}"
    assert sem1_history["grade"] is None, f"FAIL: Unpublished grade is exposed to student: {sem1_history['grade']}"
    assert sem1_history["creditsEarned"] is None, f"FAIL: Unpublished creditsEarned is exposed to student: {sem1_history['creditsEarned']}"
    print("[OK] Backend successfully HIDDEN unpublished draft result from student")

    # 5. Admin Verify Results (Sets status to VERIFIED)
    print_step("5. ADMIN VERIFY SEMESTER RESULTS (VERIFIED)")
    verify_payload = {
        "sectionId": 1,
        "semester": 1,
        "academicYear": "2026-2027"
    }
    status, res = http_req(f"{BASE_URL}/admin/results/verify", method="POST", headers=admin_headers, data=verify_payload)
    assert status == 200, f"Verify results failed: {res}"
    verified_results = res["data"]
    for r in verified_results:
        print(f"  - {r['registerNumber']}: Status={r['status']}, VerifiedAt={r['verifiedAt']}, VerifiedBy={r['verifiedByName']}")
        assert r["status"] == "VERIFIED", f"Expected VERIFIED status but got {r['status']}"
        assert r["verifiedAt"] is not None, "Expected verifiedAt to be populated"
    print("[OK] Semester results successfully verified by Admin")

    # 6. Enforce Student Visibility (VERIFIED state - Must still be hidden)
    print_step("6. STUDENT RESULT VISIBILITY ENFORCEMENT (VERIFIED STATE)")
    status, res = http_req(f"{BASE_URL}/student/academic/history", headers=student_headers)
    assert status == 200
    st_history = res["data"]
    sem1_history = next((s for s in st_history["semesters"] if s["semester"] == 1), None)
    assert sem1_history["actualSemesterScore"] is None, "FAIL: Verified but unpublished score exposed to student"
    assert sem1_history["grade"] is None, "FAIL: Verified but unpublished grade exposed to student"
    print("[OK] Backend successfully HIDDEN verified-but-unpublished result from student")

    # 7. Admin Publish Results (Sets status to PUBLISHED)
    print_step("7. ADMIN PUBLISH SEMESTER RESULTS (PUBLISHED)")
    pub_payload = {
        "sectionId": 1,
        "semester": 1,
        "academicYear": "2026-2027"
    }
    status, res = http_req(f"{BASE_URL}/admin/results/publish", method="POST", headers=admin_headers, data=pub_payload)
    assert status == 200, f"Publish results failed: {res}"
    published_results = res["data"]
    for r in published_results:
        print(f"  - {r['registerNumber']}: Score={r['actualSemesterScore']}, Grade={r['grade']}, Status={r['status']}, PublishedAt={r['publishedAt']}, PublishedBy={r['publishedByName']}")
        assert r["status"] == "PUBLISHED", f"Expected PUBLISHED status but got {r['status']}"
        assert r["publishedAt"] is not None, "Expected publishedAt to be populated"
    print("[OK] Semester results officially published by Admin")

    # 8. Enforce Student Visibility (PUBLISHED state - Now visible!)
    print_step("8. STUDENT RESULT VISIBILITY ENFORCEMENT (PUBLISHED STATE)")
    status, res = http_req(f"{BASE_URL}/student/academic/history", headers=student_headers)
    assert status == 200
    st_history = res["data"]
    sem1_history = next((s for s in st_history["semesters"] if s["semester"] == 1), None)
    print(f"Student Semester 1 Status: {sem1_history['status']}")
    print(f"Student Semester 1 Score: {sem1_history['actualSemesterScore']}")
    print(f"Student Semester 1 Grade: {sem1_history['grade']}")
    print(f"Student Semester 1 Credits Earned: {sem1_history['creditsEarned']}")
    print(f"Student Semester 1 Published At: {sem1_history['publishedAt']}")
    assert sem1_history["actualSemesterScore"] is not None, "FAIL: Published score is not visible to student"
    assert sem1_history["grade"] is not None, "FAIL: Published grade is not visible to student"
    assert sem1_history["creditsEarned"] is not None, "FAIL: Published credits earned is not visible to student"
    print("[OK] Student can now view official published result and grade")

    # 9. Admin Semester Transition (Sem 1 -> Sem 2)
    print_step("9. ADMIN SEMESTER TRANSITION (SEM 1 -> SEM 2)")
    trans_payload = {
        "sectionId": 1,
        "fromSemester": 1,
        "toSemester": 2,
        "fromAcademicYear": "2026-2027",
        "toAcademicYear": "2026-2027"
    }
    status, res = http_req(f"{BASE_URL}/admin/results/transition", method="POST", headers=admin_headers, data=trans_payload)
    assert status == 200, f"Semester transition failed: {res}"
    trans_result = res["data"]
    print(f"Transition Result: {trans_result['statusMessage']}")
    print(f"Students Transitioned: {trans_result['transitionedStudentsCount']}")
    print(f"Previous Semester: {trans_result['previousSemester']}, New Semester: {trans_result['newSemester']}")
    assert trans_result["transitionedStudentsCount"] == 5, f"Expected 5 students transitioned, got {trans_result['transitionedStudentsCount']}"

    # Verify student profile shows Semester 2 active
    status, res = http_req(f"{BASE_URL}/student/profile", headers=student_headers)
    assert status == 200
    prof = res["data"]
    print(f"Student currentSemester in Profile: {prof['currentSemester']}")
    assert prof["currentSemester"] == 2, f"Expected currentSemester 2, got {prof['currentSemester']}"

    # Verify student academic history still preserves Semester 1 published result
    status, res = http_req(f"{BASE_URL}/student/academic/history", headers=student_headers)
    assert status == 200
    st_history = res["data"]
    print(f"Student Current Semester in History: {st_history['currentSemester']}")
    sem1 = next((s for s in st_history["semesters"] if s["semester"] == 1), None)
    sem2 = next((s for s in st_history["semesters"] if s["semester"] == 2), None)
    assert sem1 is not None, "Semester 1 historical records missing!"
    assert sem2 is not None, "Semester 2 active semester missing!"
    assert sem1["actualSemesterScore"] is not None, "Semester 1 result corrupted after transition"
    print(f"[OK] Historical Semester 1 result preserved with Score={sem1['actualSemesterScore']}, Grade={sem1['grade']}")
    print(f"[OK] Active Semester 2 successfully activated")

    # 10. Security & Authorization Checks
    print_step("10. SECURITY & ROLE AUTHORIZATION ENFORCEMENT")
    # Student cannot generate
    status, res = http_req(f"{BASE_URL}/admin/results/generate", method="POST", headers=student_headers, data=gen_payload)
    print(f"Student calling Admin Generate -> HTTP {status}")
    assert status == 403, f"Security Violation: Student was able to call generate API: {status}"

    # Student cannot publish
    status, res = http_req(f"{BASE_URL}/admin/results/publish", method="POST", headers=student_headers, data=pub_payload)
    print(f"Student calling Admin Publish -> HTTP {status}")
    assert status == 403, f"Security Violation: Student was able to call publish API: {status}"

    # Student cannot transition
    status, res = http_req(f"{BASE_URL}/admin/results/transition", method="POST", headers=student_headers, data=trans_payload)
    print(f"Student calling Admin Transition -> HTTP {status}")
    assert status == 403, f"Security Violation: Student was able to call transition API: {status}"

    # Staff cannot generate
    status, res = http_req(f"{BASE_URL}/admin/results/generate", method="POST", headers=staff_headers, data=gen_payload)
    print(f"Staff calling Admin Generate -> HTTP {status}")
    assert status == 403, f"Security Violation: Staff was able to call generate API: {status}"

    # Staff cannot publish
    status, res = http_req(f"{BASE_URL}/admin/results/publish", method="POST", headers=staff_headers, data=pub_payload)
    print(f"Staff calling Admin Publish -> HTTP {status}")
    assert status == 403, f"Security Violation: Staff was able to call publish API: {status}"

    # Staff cannot transition
    status, res = http_req(f"{BASE_URL}/admin/results/transition", method="POST", headers=staff_headers, data=trans_payload)
    print(f"Staff calling Admin Transition -> HTTP {status}")
    assert status == 403, f"Security Violation: Staff was able to call transition API: {status}"

    print("[OK] All RBAC security boundaries strictly enforced")

    print("\n" + "=" * 70)
    print("  ALL 10 TEST SUITES PASSED PERFECTLY (100% SUCCESS)")
    print("=" * 70)

if __name__ == "__main__":
    main()
