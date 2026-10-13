"""
Semester 2 Demo Data Generator for EduSphere Unified CampusHub.
Uses mysql.exe CLI so no external python dependencies are needed.
Idempotent, repeatable, non-destructive.
Preserves Semester 1 historical records intact.
"""

import subprocess
import os

MYSQL_BIN = r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
DB_USER = "root"
DB_PASS = "sowbar_07"
DB_NAME = "edusphere_db"

def run_query(sql):
    cmd = [MYSQL_BIN, "-u", DB_USER, f"-p{DB_PASS}", DB_NAME, "-e", sql]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        err_lines = [l for l in res.stderr.splitlines() if "Using a password on the command line interface" not in l]
        if err_lines:
            raise RuntimeError(f"MySQL Error: {' '.join(err_lines)}")
    return res.stdout.strip()

def main():
    print("=" * 70)
    print("  EDUSPHERE SEMESTER 2 DEMO DATA GENERATOR")
    print("=" * 70)

    # 1. SEMESTER 2 SUBJECTS FOR CSE (Dept ID: 1)
    s2_subjects = [
        ("CS8201", "Operating Systems", 1, 4),
        ("CS8202", "Computer Networks", 1, 3),
        ("CS8203", "Design & Analysis of Algorithms", 1, 4),
        ("CS8204", "Object Oriented Software Engineering", 1, 3),
        ("MA8251", "Engineering Mathematics II", 1, 4),
    ]

    print("\n[Step 1] Ensuring Semester 2 Subjects for CSE...")
    for code, name, dept_id, credits in s2_subjects:
        out = run_query(f"SELECT id FROM subjects WHERE code = '{code}' AND semester = 2;")
        if out:
            sub_id = out.splitlines()[-1].strip()
            print(f"  - Subject {code} already exists (ID: {sub_id}), skipping.")
        else:
            run_query(f"""
                INSERT INTO subjects (code, name, department_id, semester, credits, created_at)
                VALUES ('{code}', '{name}', {dept_id}, 2, {credits}, NOW(6));
            """)
            sub_id = run_query(f"SELECT id FROM subjects WHERE code = '{code}' AND semester = 2;").splitlines()[-1].strip()
            print(f"  + Created subject {code} - {name} ({credits} cr, ID: {sub_id})")

    # Fetch all Semester 2 subjects
    out = run_query("SELECT id, code, name, credits FROM subjects WHERE department_id = 1 AND semester = 2 ORDER BY code;")
    print("  CSE Semester 2 Curriculum:")
    for line in out.splitlines()[1:]:
        print(f"    * {line}")

    # Subject ID map
    lines = out.splitlines()[1:]
    sub_map = {}
    for line in lines:
        parts = line.split("\t")
        sub_map[parts[1]] = int(parts[0])

    # 2. TEACHING ASSIGNMENTS (section_id = 1, semester = 2, academic_year = '2026-2027')
    staff_mapping = {
        "CS8201": 1, # Prof. S. Karthikeyan
        "CS8202": 2, # Dr. V. Saravanan
        "CS8203": 4, # Dr. M. Balasubramanian
        "CS8204": 5, # Prof. S. Priyadharshini
        "MA8251": 6, # Dr. G. Senthil Kumar
        "CS2026": 3  # Prof. P. Kavitha (already exists)
    }

    print("\n[Step 2] Ensuring Teaching Assignments for CSE Section A (Semester 2, 2026-2027)...")
    ta_map = {}
    for code, sub_id in sub_map.items():
        staff_id = staff_mapping.get(code, 1)
        out = run_query(f"""
            SELECT id FROM teaching_assignments 
            WHERE subject_id = {sub_id} AND section_id = 1 AND semester = 2 AND academic_year = '2026-2027';
        """)
        if out:
            ta_id = int(out.splitlines()[-1].strip())
            ta_map[code] = ta_id
            print(f"  - Teaching Assignment for {code} already exists (ID: {ta_id}), skipping.")
        else:
            run_query(f"""
                INSERT INTO teaching_assignments (staff_id, subject_id, section_id, semester, academic_year, created_at)
                VALUES ({staff_id}, {sub_id}, 1, 2, '2026-2027', NOW(6));
            """)
            ta_id = int(run_query(f"""
                SELECT id FROM teaching_assignments 
                WHERE subject_id = {sub_id} AND section_id = 1 AND semester = 2 AND academic_year = '2026-2027';
            """).splitlines()[-1].strip())
            ta_map[code] = ta_id
            print(f"  + Created Teaching Assignment for {code} -> Staff {staff_id} (TA ID: {ta_id})")

    # 3. VIRTUAL CLASSROOMS
    print("\n[Step 3] Ensuring Virtual Classrooms for Semester 2...")
    c_map = {}
    for code, ta_id in ta_map.items():
        out = run_query(f"SELECT id FROM classrooms WHERE teaching_assignment_id = {ta_id};")
        if out:
            c_id = int(out.splitlines()[-1].strip())
            c_map[code] = c_id
            print(f"  - Classroom for {code} already exists (ID: {c_id}), skipping.")
        else:
            c_name = f"{code} (CSE 2-A)"
            c_desc = f"Official Virtual Classroom for Semester 2 {code} course."
            run_query(f"""
                INSERT INTO classrooms (name, description, is_active, teaching_assignment_id, created_at)
                VALUES ('{c_name}', '{c_desc}', 1, {ta_id}, NOW(6));
            """)
            c_id = int(run_query(f"SELECT id FROM classrooms WHERE teaching_assignment_id = {ta_id};").splitlines()[-1].strip())
            c_map[code] = c_id
            print(f"  + Created Classroom '{c_name}' (ID: {c_id})")

    # 4. CLASSROOM MATERIALS
    print("\n[Step 4] Ensuring Classroom Materials for Semester 2...")
    materials_catalog = {
        "CS8201": [
            ("Unit 1: Process Management & Scheduling", "Lecture notes covering process lifecycle, PCB, and CPU scheduling algorithms.", "CS8201_Unit1_Process_Management.pdf"),
            ("Unit 2: Synchronization & Concurrency", "Semaphores, Mutex, and classical synchronization problems.", "CS8201_Unit2_Synchronization.pdf"),
            ("Operating Systems Lab Manual", "POSIX thread programming, system calls, and shell scripting lab guide.", "CS8201_OS_Lab_Manual.pdf")
        ],
        "CS8202": [
            ("Unit 1: Network Architecture & OSI Model", "Foundations of computer networking, physical and data link layers.", "CS8202_Unit1_OSI_Model.pdf"),
            ("Unit 2: IP Addressing & Subnetting Guide", "IPv4, IPv6, CIDR, and routing protocols overview.", "CS8202_Unit2_IP_Addressing.pdf"),
            ("Wireshark Packet Analysis Handbook", "Practical network traffic inspection and protocol analysis manual.", "CS8202_Wireshark_Handbook.pdf")
        ],
        "CS8203": [
            ("Unit 1: Divide and Conquer Algorithms", "Master theorem, merge sort, quicksort, and recurrence relations.", "CS8203_Unit1_Divide_Conquer.pdf"),
            ("Unit 2: Dynamic Programming Paradigms", "Optimal substructure, memoization, 0/1 knapsack, and matrix chain multiplication.", "CS8203_Unit2_Dynamic_Programming.pdf"),
            ("Algorithm Analysis Problem Set", "Selected asymptotic notation exercises and greedy algorithm problem solutions.", "CS8203_Algorithm_Problem_Set.pdf")
        ],
        "CS8204": [
            ("Unit 1: Object-Oriented Analysis & UML", "Use-case modeling, class diagrams, sequence diagrams, and state machines.", "CS8204_Unit1_UML_Modeling.pdf"),
            ("Unit 2: Software Design Patterns", "Creational, structural, and behavioral patterns with Java implementation examples.", "CS8204_Unit2_Design_Patterns.pdf")
        ],
        "MA8251": [
            ("Unit 1: Vector Calculus & Green's Theorem", "Gradient, divergence, curl, line integrals, and surface integrals.", "MA8251_Unit1_Vector_Calculus.pdf"),
            ("Unit 2: Complex Integration & Residue Theorem", "Analytic functions, Cauchy-Riemann equations, and contour integration.", "MA8251_Unit2_Complex_Integration.pdf"),
            ("Engineering Mathematics II Tutorial Sheet", "Formula reference sheet and practice problem solutions for Mid-term review.", "MA8251_Tutorial_Problems.pdf")
        ],
        "CS2026": [
            ("Unit 1: CI/CD Pipelines & GitHub Actions", "Automated build, test, and release workflows with container integration.", "CS2026_Unit1_CICD_Pipelines.pdf"),
            ("Unit 2: Docker & Kubernetes Architecture", "Containerization fundamentals, pod management, and service orchestration.", "CS2026_Unit2_Docker_Kubernetes.pdf")
        ]
    }

    staff_user_ids = {1: 3, 2: 9, 3: 10, 4: 11, 5: 12, 6: 13}

    for code, mats in materials_catalog.items():
        c_id = c_map[code]
        staff_id = staff_mapping.get(code, 1)
        user_id = staff_user_ids.get(staff_id, 3)

        for title, desc, fname in mats:
            safe_title = title.replace("'", "\\'")
            safe_desc = desc.replace("'", "\\'")
            out = run_query(f"SELECT id FROM classroom_materials WHERE classroom_id = {c_id} AND title = '{safe_title}';")
            if out:
                continue
            fpath = f"/uploads/materials/{fname}"
            run_query(f"""
                INSERT INTO classroom_materials (classroom_id, title, description, file_name, file_path, uploaded_by, created_at)
                VALUES ({c_id}, '{safe_title}', '{safe_desc}', '{fname}', '{fpath}', {user_id}, NOW(6));
            """)
            print(f"  + Added Material '{title}' to {code} Classroom")

    # 5. COURSEWORK ASSIGNMENTS
    print("\n[Step 5] Ensuring Coursework Assignments for Semester 2...")
    assignments_catalog = {
        "CS8201": [
            ("CPU Scheduling & Process Synchronization Lab Assignment", "Implement Shortest Job First (SJF) and Round Robin algorithms in C/Java.", 100.0, "2027-03-20 23:59:00"),
            ("Virtual Memory & Paging Replacement Problem Set", "Calculate page fault rates for FIFO, LRU, and Optimal page replacement.", 50.0, "2027-04-10 23:59:00")
        ],
        "CS8202": [
            ("Subnetting & Network Topology Design Report", "Design a multi-department LAN architecture with VLAN segmentation.", 100.0, "2027-03-25 23:59:00"),
            ("Socket Programming & Client-Server Communication", "Develop a multi-threaded TCP chat application with message logging.", 50.0, "2027-04-15 23:59:00")
        ],
        "CS8203": [
            ("Dynamic Programming & Graph Algorithms Problem Set", "Solve 0/1 Knapsack, Floyd-Warshall, and Dijkstra algorithm problem sets.", 100.0, "2027-03-28 23:59:00")
        ],
        "CS8204": [
            ("Software Architecture Case Study & UML Design Document", "Construct complete Class and Sequence diagrams for an online reservation portal.", 100.0, "2027-04-05 23:59:00")
        ],
        "MA8251": [
            ("Vector Calculus & Surface Integrals Problem Assignment", "Complete solutions for Stokes' and Gauss Divergence Theorem problem sheet.", 100.0, "2027-03-15 23:59:00")
        ],
        "CS2026": [
            ("Docker Containerization & Multi-Stage Build Practical", "Containerize a full-stack Spring Boot and React application with Docker Compose.", 100.0, "2027-04-08 23:59:00")
        ]
    }

    for code, assigns in assignments_catalog.items():
        ta_id = ta_map[code]
        for title, desc, marks, deadline in assigns:
            safe_title = title.replace("'", "\\'")
            safe_desc = desc.replace("'", "\\'")
            out = run_query(f"SELECT id FROM assignments WHERE teaching_assignment_id = {ta_id} AND title = '{safe_title}';")
            if out:
                continue
            run_query(f"""
                INSERT INTO assignments (teaching_assignment_id, title, description, max_marks, deadline, created_at)
                VALUES ({ta_id}, '{safe_title}', '{safe_desc}', {marks}, '{deadline}', NOW(6));
            """)
            print(f"  + Added Assignment '{title}' to {code} TA")

    # 6. SEMESTER 2 CONTINUOUS ACADEMIC RECORDS
    print("\n[Step 6] Generating Realistic Semester 2 Continuous Academic Records...")
    student_scores = {
        1: { # Arun Kumar S (High performer: 95-98% range)
            "CS8201": (46.5, 47.5, 24.5, 96.5),
            "CS8202": (47.0, 48.0, 24.0, 97.0),
            "CS8203": (45.5, 46.5, 24.5, 95.0),
            "CS8204": (46.0, 47.0, 24.0, 96.0),
            "MA8251": (47.5, 48.5, 25.0, 98.0),
            "CS2026": (48.0, 47.5, 24.5, 97.5),
        },
        2: { # Kavin Raj M (Above average: 88-93% range)
            "CS8201": (41.0, 43.5, 22.0, 91.0),
            "CS8202": (40.5, 42.0, 21.5, 89.5),
            "CS8203": (42.0, 44.0, 22.5, 92.0),
            "CS8204": (41.5, 43.0, 22.0, 90.0),
            "MA8251": (39.5, 41.5, 21.0, 88.5),
            "CS2026": (43.0, 44.5, 23.0, 93.0),
        },
        4: { # Nithya Devi R (Consistent average: 82-87% range)
            "CS8201": (37.0, 39.5, 20.0, 85.0),
            "CS8202": (36.5, 38.0, 19.5, 84.0),
            "CS8203": (38.0, 40.0, 20.5, 86.5),
            "CS8204": (37.5, 39.0, 20.0, 85.5),
            "MA8251": (35.0, 37.5, 19.0, 82.0),
            "CS2026": (39.0, 40.5, 21.0, 87.0),
        },
        5: { # Keerthana K (Average/steady: 83-87% range)
            "CS8201": (36.0, 38.5, 19.5, 84.0),
            "CS8202": (37.0, 39.0, 20.0, 85.5),
            "CS8203": (35.5, 37.5, 19.0, 83.0),
            "CS8204": (36.5, 38.0, 19.5, 84.5),
            "MA8251": (38.0, 40.0, 20.5, 87.0),
            "CS2026": (37.5, 39.5, 20.0, 86.0),
        },
        6: { # Vignesh P (Moderate/developing: 73-80% range)
            "CS8201": (28.5, 31.0, 16.5, 76.0),
            "CS8202": (29.0, 32.5, 17.0, 77.5),
            "CS8203": (27.5, 30.0, 16.0, 75.0),
            "CS8204": (30.0, 33.0, 17.5, 78.5),
            "MA8251": (26.0, 29.5, 15.5, 73.0),
            "CS2026": (31.5, 34.0, 18.0, 80.0),
        }
    }

    created_recs = 0
    skipped_recs = 0
    for st_id, scores_by_sub in student_scores.items():
        for code, (iat1, iat2, assign, att) in scores_by_sub.items():
            sub_id = sub_map[code]
            out = run_query(f"""
                SELECT id FROM subject_academic_records 
                WHERE student_id = {st_id} AND subject_id = {sub_id} AND semester = 2 AND academic_year = '2026-2027';
            """)
            if out:
                skipped_recs += 1
            else:
                run_query(f"""
                    INSERT INTO subject_academic_records 
                    (student_id, subject_id, semester, academic_year, iat1_score, iat2_score, assignment_score, attendance_percentage, created_at, updated_at)
                    VALUES ({st_id}, {sub_id}, 2, '2026-2027', {iat1}, {iat2}, {assign}, {att}, NOW(6), NOW(6));
                """)
                created_recs += 1
                print(f"  + Created record: Student {st_id} | {code} -> IAT1={iat1}, IAT2={iat2}, Assign={assign}, Att={att}%")

    # 7. AUDIT & PRESERVATION CHECKS
    print("\n[Step 7] Checking Historical Semester 1 Preservation...")
    s1_subs = run_query("SELECT COUNT(*) FROM subjects WHERE semester = 1;").splitlines()[-1]
    s1_tas = run_query("SELECT COUNT(*) FROM teaching_assignments WHERE semester = 1;").splitlines()[-1]
    s1_recs = run_query("SELECT COUNT(*) FROM subject_academic_records WHERE semester = 1;").splitlines()[-1]
    s1_res = run_query("SELECT COUNT(*) FROM semester_results WHERE semester = 1;").splitlines()[-1]

    print(f"  Historical Semester 1 Data Counts:")
    print(f"    - Subjects: {s1_subs} (expected: 18)")
    print(f"    - Teaching Assignments: {s1_tas} (expected: 37)")
    print(f"    - Academic Records: {s1_recs} (expected: 186)")
    print(f"    - Semester Results: {s1_res} (expected: 31)")
    assert int(s1_subs) == 18, f"ALERT: Semester 1 subjects altered: {s1_subs}"
    assert int(s1_tas) == 37, f"ALERT: Semester 1 teaching assignments altered: {s1_tas}"
    assert int(s1_recs) == 186, f"ALERT: Semester 1 academic records altered: {s1_recs}"
    assert int(s1_res) == 31, f"ALERT: Semester 1 results altered: {s1_res}"
    print("  [CONFIRMED] Semester 1 historical records are 100% intact and untouched!")

    # 8. SEMESTER 2 ONGOING STATE
    s2_pub_res = run_query("SELECT COUNT(*) FROM semester_results WHERE semester = 2 AND status = 'PUBLISHED';").splitlines()[-1]
    print(f"\n  Semester 2 Published Official Results: {s2_pub_res} (expected: 0 - ongoing semester)")

    s2_total_recs = run_query("SELECT COUNT(*) FROM subject_academic_records WHERE semester = 2;").splitlines()[-1]
    print(f"  Total Semester 2 Academic Records Now in DB: {s2_total_recs} (expected: 30)")

    print("\n" + "=" * 70)
    print("  SEMESTER 2 DEMO DATA GENERATION COMPLETED SUCCESSFULLY")
    print("=" * 70)

if __name__ == "__main__":
    main()
