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
    print("Testing Safety & Validation Edge Cases...")
    
    # Login Admin
    status, res = http_req(f"{BASE_URL}/auth/login", method="POST", data={"email": "admin@edusphere.edu", "password": "Admin@123"})
    admin_token = res["data"]["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Safety Test 1: Non-sequential semester transition (Sem 1 -> Sem 3)
    bad_trans = {
        "sectionId": 1,
        "fromSemester": 1,
        "toSemester": 3,
        "fromAcademicYear": "2026-2027",
        "toAcademicYear": "2026-2027"
    }
    status, res = http_req(f"{BASE_URL}/admin/results/transition", method="POST", headers=admin_headers, data=bad_trans)
    print(f"Non-sequential transition (Sem 1 -> Sem 3) -> HTTP {status}: {res.get('message')}")
    assert status == 400, f"Expected 400 Bad Request, got {status}"
    print("[OK] Non-sequential transition properly rejected")

    # Safety Test 2: Beyond max degree semester (Sem 8 -> Sem 9)
    bad_max = {
        "sectionId": 1,
        "fromSemester": 8,
        "toSemester": 9,
        "fromAcademicYear": "2026-2027",
        "toAcademicYear": "2026-2027"
    }
    status, res = http_req(f"{BASE_URL}/admin/results/transition", method="POST", headers=admin_headers, data=bad_max)
    print(f"Transition beyond max semester (Sem 8 -> Sem 9) -> HTTP {status}: {res.get('message')}")
    assert status == 400, f"Expected 400 Bad Request, got {status}"
    print("[OK] Max degree semester limit properly enforced")

    # Safety Test 3: Verify data for section without curriculum/students
    status, res = http_req(f"{BASE_URL}/admin/results/verify-data?departmentId=1&sectionId=1&semester=8&academicYear=2026-2027", headers=admin_headers)
    assert status == 200
    print(f"Verify data on empty semester 8 -> readyForGeneration: {res['data']['readyForGeneration']}, message: {res['data']['statusMessage']}")
    assert res['data']['readyForGeneration'] == False
    print("[OK] Incomplete data properly blocks result generation")

    # Safety Test 4: Generation on incomplete data blocked
    gen_incomplete = {
        "departmentId": 1,
        "sectionId": 1,
        "semester": 8,
        "academicYear": "2026-2027"
    }
    status, res = http_req(f"{BASE_URL}/admin/results/generate", method="POST", headers=admin_headers, data=gen_incomplete)
    print(f"Generate results on incomplete data -> HTTP {status}: {res.get('message')}")
    assert status == 400, f"Expected 400 Bad Request, got {status}"
    print("[OK] Incomplete data generation strictly blocked by backend")

    print("\n[ALL SAFETY & VALIDATION TESTS PASSED]")

if __name__ == "__main__":
    main()
