# EDUSPHERE – UNIFIED CAMPUSHUB (V2)

Official B.E. Final Year Computer Science Academic Platform.

## Architecture

```
React Frontend (Vite + TS + Tailwind)
      │
      │ REST API + JWT
      ▼
Spring Boot Backend (Java 21+, Spring Security, JPA, Apache POI)
      │
      ├───────► MySQL (Single Source of Truth)
      │
      ├───────► FastAPI ML Service (Random Forest Semester Prediction)
      │
      └───────► Gemini API (Academic Guidance & Explanation)
```

## System Credentials (Seed Data)

- **Admin Account**: `admin@edusphere.edu` / `Admin@123`
- **HOD Account (CSE)**: `hod.cse@edusphere.edu` / `Hod@123`
- **Staff Account (CSE)**: `staff.cse@edusphere.edu` / `Staff@123`
- **Active Student (1st Year CSE-A)**: `student1@edusphere.edu` / `Student@123`
- **Pending Student (Under Review)**: `student.pending@edusphere.edu` / `Student@123`

## Running the Services

### 1. Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs on `http://localhost:8080/api`

### 2. React Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

### 3. FastAPI ML Service
```bash
cd ml-service
pip install -r requirements.txt
python main.py
```
ML service runs on `http://localhost:8000`
