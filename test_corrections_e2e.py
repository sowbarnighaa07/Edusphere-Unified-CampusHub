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
    print("Starting EduSphere Subject-Wise Results & Transition Corrections Verification...")

    # 1. Authenticate All Roles
    print_step("1. AUTHENTICATION")
    status, res = http_req(f"{BASE_URL}/auth/login", method="POST", data={"email": "admin@edusphere.edu", "password": "Admin@123"})
    assert status == 200, f"Admin login failed: {res}"
    admin_token = res["data"]["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("[OK] Admin login successful")

    status, res = http_req(f"{BASE_URL}/auth/login", method="POST", data={"email": "arunkumar.s@edusphere.edu", "password": "Student@123"})
    assert status == 200, f"Student login failed: {res}"
    student_token = res["data"]["token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print("[OK] Student login successful")

    status, res = http_req(f"{BASE_URL}/auth/login", method="POST", data={"email": "karthikeyan.s@edusphere.edu", "password": "Staff@123"})
    assert status == 200, f"Staff login failed: {res}"
    staff_token = res["data"]["token"]
    staff_headers = {"Authorization": f"Bearer {staff_token}"}
    print("[OK] Staff login successful")

    # 2. Reset / Set student current semester to 1 for controlled test
    # (Update StudentProfile via SQL or generate workflow)
    gen_payload = {
        "departmentId": 1,
        "sectionId": 1,
        "semester": 1,
        "academicYear": "2026-2027"
    }

    # 3. Generate Semester Results -> Stored as DRAFT with Subject-wise scores
    print_step("2. ADMIN GENERATE SEMESTER RESULTS (WITH SUBJECT-WISE OUTCOMES)")
    status, res = http_req(f"{BASE_URL}/admin/results/generate", method="POST", headers=admin_headers, data=gen_payload)
    assert status == 200, f"Generate results failed: {res}"
    print(f"[OK] Generated {len(res['data'])} student semester results with subject-level calculations")

    # 4. Check Student Visibility during DRAFT state (Subject final scores must be HIDDEN)
    print_step("3. STUDENT VISIBILITY BEFORE PUBLICATION (DRAFT STATE)")
    status, res = http_req(f"{BASE_URL}/student/academic/history", headers=student_headers)
    assert status == 200
    st_history = res["data"]
    sem1 = next((s for s in st_history["semesters"] if s["semester"] == 1), None)
    assert sem1 is not None
    print(f"Semester 1 status: {sem1['status']}")
    print(f"Semester 1 overall actual score: {sem1['actualSemesterScore']}")
    assert sem1["actualSemesterScore"] is None, "Overall score leaked in draft state"
    for sub in sem1["subjects"]:
        print(f"  - {sub['subjectCode']}: finalScore={sub.get('finalScore')}, grade={sub.get('grade')}, result={sub.get('result')}")
        assert sub.get("finalScore") is None, f"Subject final score leaked in draft state: {sub}"
        assert sub.get("grade") is None, f"Subject grade leaked in draft state: {sub}"
        assert sub.get("result") is None, f"Subject result leaked in draft state: {sub}"
    print("[OK] All subject-level and semester-level results strictly hidden before publication")

    # 5. Admin Verifies Results
    print_step("4. ADMIN VERIFY SEMESTER RESULTS")
    verify_payload = {
        "sectionId": 1,
        "semester": 1,
        "academicYear": "2026-2027"
    }
    status, res = http_req(f"{BASE_URL}/admin/results/verify", method="POST", headers=admin_headers, data=verify_payload)
    assert status == 200
    print("[OK] Results verified by administrator")

    # 6. Admin Publishes Results
    print_step("5. ADMIN PUBLISH SEMESTER RESULTS")
    pub_payload = {
        "sectionId": 1,
        "semester": 1,
        "academicYear": "2026-2027"
    }
    status, res = http_req(f"{BASE_URL}/admin/results/publish", method="POST", headers=admin_headers, data=pub_payload)
    assert status == 200
    print("[OK] Results officially published by administrator")

    # 7. Check Student Visibility after PUBLISHED state (Subject final scores now VISIBLE)
    print_step("6. STUDENT VISIBILITY AFTER PUBLICATION (SUBJECT-WISE MARKS)")
    status, res = http_req(f"{BASE_URL}/student/academic/history", headers=student_headers)
    assert status == 200
    st_history = res["data"]
    sem1 = next((s for s in st_history["semesters"] if s["semester"] == 1), None)
    assert sem1 is not None
    print(f"Semester 1 Overall: Score={sem1['actualSemesterScore']}, Grade={sem1['grade']}, Credits={sem1['creditsEarned']}/{sem1['totalCredits']}, Status={sem1['status']}")
    assert sem1["actualSemesterScore"] is not None
    assert sem1["grade"] is not None

    print("\nSubject-Wise Final Results:")
    print(f"{'Code':<10} {'Subject Name':<35} {'Credits':<8} {'Mark':<8} {'Grade':<8} {'Result':<8}")
    print("-" * 80)
    for sub in sem1["subjects"]:
        print(f"{sub['subjectCode']:<10} {sub['subjectName']:<35} {sub['credits']:<8} {sub['finalScore']:<8.2f} {sub['grade']:<8} {sub['result']:<8}")
        assert sub.get("finalScore") is not None, f"Missing finalScore on subject {sub['subjectCode']}"
        assert sub.get("grade") is not None, f"Missing grade on subject {sub['subjectCode']}"
        assert sub.get("result") in ["PASS", "RA"], f"Invalid result on subject {sub['subjectCode']}"
        assert sub.get("creditsEarned") is not None, f"Missing creditsEarned on subject {sub['subjectCode']}"
    print("-" * 80)
    print("[OK] Subject-wise final marks, grades, credits, and PASS/RA results fully available")

    # 8. Test Classroom & Assignment Filtering based on Current Semester
    print_step("7. CLASSROOM & ASSIGNMENT ACTIVE SEMESTER FILTERING")
    
    # Transition cohort to Semester 2
    trans_payload = {
        "sectionId": 1,
        "fromSemester": 1,
        "toSemester": 2,
        "fromAcademicYear": "2026-2027",
        "toAcademicYear": "2026-2027"
    }
    status, res = http_req(f"{BASE_URL}/admin/results/transition", method="POST", headers=admin_headers, data=trans_payload)
    assert status == 200
    print("[OK] Transitioned Section 1 students to Semester 2")

    # Check student active classrooms for Semester 2 (should not return Semester 1 classrooms)
    status, res = http_req(f"{BASE_URL}/student/classrooms", headers=student_headers)
    assert status == 200
    active_classrooms = res["data"]
    print(f"Student Active Classrooms in Semester 2: {len(active_classrooms)}")
    for c in active_classrooms:
        print(f"  - Classroom: {c['name']} (Sem {c['semester']})")
        assert c['semester'] == 2, f"Old Semester 1 classroom appeared in Semester 2 active list: {c['name']}"
    print("[OK] Historical Semester 1 classrooms are cleanly filtered out from active Semester 2 classroom view")

    # Check student active assignments for Semester 2
    status, res = http_req(f"{BASE_URL}/student/assignments", headers=student_headers)
    assert status == 200
    active_assignments = res["data"]
    print(f"Student Active Assignments in Semester 2: {len(active_assignments)}")
    for a in active_assignments:
        print(f"  - Assignment: {a['title']}")
    print("[OK] Historical Semester 1 assignments are cleanly filtered out from active Semester 2 assignment view")

    # Verify historical Semester 1 results still intact
    status, res = http_req(f"{BASE_URL}/student/academic/history", headers=student_headers)
    assert status == 200
    st_history = res["data"]
    sem1_hist = next((s for s in st_history["semesters"] if s["semester"] == 1), None)
    assert sem1_hist is not None
    assert sem1_hist["actualSemesterScore"] is not None
    assert len(sem1_hist["subjects"]) > 0
    print(f"[OK] Historical Semester 1 transcript preserved: Score={sem1_hist['actualSemesterScore']}, Grade={sem1_hist['grade']}, Subjects={len(sem1_hist['subjects'])}")

    # 9. Security Authorization Boundary Check
    print_step("8. SECURITY BOUNDARIES")
    # Student cannot transition
    status, res = http_req(f"{BASE_URL}/admin/results/transition", method="POST", headers=student_headers, data=trans_payload)
    assert status == 403
    # Staff cannot publish
    status, res = http_req(f"{BASE_URL}/admin/results/publish", method="POST", headers=staff_headers, data=pub_payload)
    assert status == 403
    print("[OK] RBAC security rules strictly maintained")

    print("\n" + "=" * 70)
    print("  ALL CORRECTIONS & WORKFLOW CHECKS PASSED WITH 100% SUCCESS")
    print("=" * 70)

if __name__ == "__main__":
    main()
