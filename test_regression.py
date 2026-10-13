import urllib.request
import urllib.error
import json

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
    print("  EDUSPHERE V2 SYSTEM-WIDE REGRESSION TEST SUITE")
    print("=" * 70)

    # 1. Admin Authentication & Endpoints
    status, res = http_req(f"{BASE_URL}/auth/login", method="POST", data={"email": "admin@edusphere.edu", "password": "Admin@123"})
    assert status == 200, "Admin login failed"
    admin_token = res["data"]["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin Dashboard / Departments
    status, res = http_req(f"{BASE_URL}/admin/departments", headers=admin_headers)
    assert status == 200 and len(res["data"]) > 0, "Admin departments failed"
    print(f"[OK] Admin Departments: {len(res['data'])} departments active")

    # Admin Sections
    status, res = http_req(f"{BASE_URL}/admin/sections?departmentId=1", headers=admin_headers)
    assert status == 200 and len(res["data"]) > 0, "Admin sections failed"
    print(f"[OK] Admin Sections for Dept 1: {len(res['data'])} sections active")

    # Admin Subjects
    status, res = http_req(f"{BASE_URL}/admin/subjects?departmentId=1", headers=admin_headers)
    assert status == 200 and len(res["data"]) > 0, "Admin subjects failed"
    print(f"[OK] Admin Subjects for Dept 1: {len(res['data'])} subjects active")

    # Admin Audit Logs
    status, res = http_req(f"{BASE_URL}/admin/audit-logs", headers=admin_headers)
    assert status == 200, "Admin audit logs failed"
    print(f"[OK] Admin Audit Logs: {len(res['data'])} logs recorded")

    # 2. Staff Authentication & Endpoints
    status, res = http_req(f"{BASE_URL}/auth/login", method="POST", data={"email": "karthikeyan.s@edusphere.edu", "password": "Staff@123"})
    assert status == 200, "Staff login failed"
    staff_token = res["data"]["token"]
    staff_headers = {"Authorization": f"Bearer {staff_token}"}

    # Staff Profile
    status, res = http_req(f"{BASE_URL}/staff/profile", headers=staff_headers)
    assert status == 200, "Staff profile failed"
    print(f"[OK] Staff Profile: {res['data']['fullName']} ({res['data']['designation']})")

    # Staff Classes
    status, res = http_req(f"{BASE_URL}/staff/classes", headers=staff_headers)
    assert status == 200, "Staff teaching classes failed"
    print(f"[OK] Staff Teaching Classes: {len(res['data'])} active classes assigned")

    # 3. Student Authentication & Endpoints
    status, res = http_req(f"{BASE_URL}/auth/login", method="POST", data={"email": "arunkumar.s@edusphere.edu", "password": "Student@123"})
    assert status == 200, "Student login failed"
    student_token = res["data"]["token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # Student Profile
    status, res = http_req(f"{BASE_URL}/student/profile", headers=student_headers)
    assert status == 200, "Student profile failed"
    print(f"[OK] Student Profile: {res['data']['fullName']} ({res['data']['registerNumber']})")

    # Student Current Academic Overview
    status, res = http_req(f"{BASE_URL}/student/academic/current", headers=student_headers)
    assert status == 200, "Student current academic overview failed"
    print(f"[OK] Student Current Academic Overview: Sem {res['data']['currentSemester']}, {len(res['data']['subjects'])} enrolled subjects")

    # Student Classrooms
    status, res = http_req(f"{BASE_URL}/student/classrooms", headers=student_headers)
    assert status == 200, "Student classrooms failed"
    print(f"[OK] Student Virtual Classrooms: {len(res['data'])} active classrooms")

    # Student Multi-Semester Academic History
    status, res = http_req(f"{BASE_URL}/student/academic/history", headers=student_headers)
    assert status == 200, "Student academic history failed"
    print(f"[OK] Student Academic History: {len(res['data']['semesters'])} semesters recorded, Total Credits={res['data']['totalCreditsEarned']}")

    print("\n" + "=" * 70)
    print("  ALL CORE SYSTEM MODULES WORKING WITH ZERO REGRESSION")
    print("=" * 70)

if __name__ == "__main__":
    main()
