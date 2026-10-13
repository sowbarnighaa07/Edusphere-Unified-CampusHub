-- EduSphere DB Migration: Semester Result Lifecycle
-- Run this against edusphere_db

USE edusphere_db;

-- Add new columns to semester_results
ALTER TABLE semester_results
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
  ADD COLUMN grade VARCHAR(10) NULL,
  ADD COLUMN total_credits INT NULL,
  ADD COLUMN credits_earned INT NULL,
  ADD COLUMN verified_at DATETIME(6) NULL,
  ADD COLUMN verified_by_user_id BIGINT NULL,
  ADD COLUMN published_at DATETIME(6) NULL,
  ADD COLUMN published_by_user_id BIGINT NULL;

-- Add FK constraints for audit fields
ALTER TABLE semester_results
  ADD CONSTRAINT fk_sr_verified_by FOREIGN KEY (verified_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_sr_published_by FOREIGN KEY (published_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add new columns to student_profiles
ALTER TABLE student_profiles
  ADD COLUMN current_semester INT NULL,
  ADD COLUMN academic_year VARCHAR(20) NULL;
