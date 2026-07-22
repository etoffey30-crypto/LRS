-- LRS Supabase Database Schema & Seed Data

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT
);
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;

INSERT INTO departments (id, code, name, description) VALUES
  ('DEPT001', 'CSC', 'Computer Science', 'Computing, software engineering & AI'),
  ('DEPT002', 'EEE', 'Electrical Engineering', 'Power systems, electronics & control'),
  ('DEPT003', 'MTH', 'Mathematics', 'Pure & applied mathematics'),
  ('DEPT004', 'PHY', 'Physics', 'Classical, modern & applied physics'),
  ('DEPT005', 'CHM', 'Chemistry', 'Organic & inorganic chemistry'),
  ('DEPT006', 'CVE', 'Civil Engineering', 'Structural, geo & environmental engineering'),
  ('DEPT007', 'MCE', 'Mechanical Engineering', 'Thermodynamics, mechanics & manufacturing')
ON CONFLICT (id) DO NOTHING;

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 3,
  department_id TEXT REFERENCES departments(id) ON DELETE RESTRICT,
  level INTEGER NOT NULL,
  semester_offered TEXT NOT NULL
);
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;

INSERT INTO courses (id, code, title, credits, department_id, level, semester_offered) VALUES
  ('CRS001', 'CSC101', 'Introduction to Computing', 3, 'DEPT001', 100, 'First'),
  ('CRS002', 'CSC201', 'Data Structures & Algorithms', 3, 'DEPT001', 200, 'First'),
  ('CRS003', 'CSC301', 'Software Engineering', 3, 'DEPT001', 300, 'First'),
  ('CRS004', 'CSC401', 'Distributed Systems', 3, 'DEPT001', 400, 'Second'),
  ('CRS005', 'CSC302', 'Database Management Systems', 3, 'DEPT001', 300, 'Second'),
  ('CRS006', 'MTH201', 'Calculus II', 3, 'DEPT003', 200, 'First'),
  ('CRS007', 'EEE201', 'Circuit Analysis', 3, 'DEPT002', 200, 'First'),
  ('CRS008', 'PHY101', 'General Physics I', 3, 'DEPT004', 100, 'First'),
  ('CRS009', 'MTH101', 'Elementary Mathematics', 3, 'DEPT003', 100, 'Both'),
  ('CRS010', 'EEE301', 'Electromagnetic Fields', 3, 'DEPT002', 300, 'First'),
  ('CRS011', 'PHY201', 'General Physics II', 3, 'DEPT004', 200, 'Second')
ON CONFLICT (id) DO NOTHING;

-- 3. Academic Sessions Table
CREATE TABLE IF NOT EXISTS academic_sessions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  semester TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE academic_sessions DISABLE ROW LEVEL SECURITY;

INSERT INTO academic_sessions (id, name, semester, is_active) VALUES
  ('SES001', '2024/2025', 'Second', false),
  ('SES002', '2025/2026', 'First', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Course Offerings Table
CREATE TABLE IF NOT EXISTS course_offerings (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES academic_sessions(id) ON DELETE CASCADE,
  UNIQUE(course_id, session_id)
);
ALTER TABLE course_offerings DISABLE ROW LEVEL SECURITY;

INSERT INTO course_offerings (id, course_id, session_id) VALUES
  ('OFF001', 'CRS001', 'SES002'),
  ('OFF002', 'CRS002', 'SES002'),
  ('OFF003', 'CRS003', 'SES002'),
  ('OFF004', 'CRS004', 'SES002'),
  ('OFF005', 'CRS006', 'SES002'),
  ('OFF006', 'CRS007', 'SES002'),
  ('OFF007', 'CRS008', 'SES002'),
  ('OFF008', 'CRS009', 'SES002'),
  ('OFF009', 'CRS010', 'SES002')
ON CONFLICT (id) DO NOTHING;

-- 5. Students Table
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  department TEXT NOT NULL,
  level TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  enrolled TEXT NOT NULL
);
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

INSERT INTO students (id, name, email, password, department, level, status, enrolled) VALUES
  ('STU/2024/001', 'Aisha Mohammed', 'aisha.m@uni.edu.ng', 'Aisha@2026', 'Computer Science', '300', 'active', '2022-09-01'),
  ('STU/2024/002', 'Chidi Okonkwo', 'c.okonkwo@uni.edu.ng', 'Chidi@2026', 'Electrical Engineering', '200', 'active', '2023-09-01'),
  ('STU/2024/003', 'Fatima Bello', 'f.bello@uni.edu.ng', 'Fatima@2026', 'Computer Science', '400', 'inactive', '2021-09-01'),
  ('STU/2024/004', 'Emmanuel Adeyemi', 'e.adeyemi@uni.edu.ng', 'Emmanuel@2026', 'Mathematics', '100', 'active', '2024-09-01'),
  ('STU/2024/005', 'Ngozi Eze', 'n.eze@uni.edu.ng', 'Ngozi@2026', 'Physics', '300', 'active', '2022-09-01'),
  ('STU/2024/006', 'Ibrahim Suleiman', 'i.suleiman@uni.edu.ng', 'Ibrahim@2026', 'Computer Science', '200', 'active', '2023-09-01'),
  ('STU/2024/007', 'Adaeze Nwosu', 'a.nwosu@uni.edu.ng', 'Adaeze@2026', 'Chemistry', '400', 'inactive', '2021-09-01'),
  ('STU/2024/008', 'Yusuf Abdullahi', 'y.abdullahi@uni.edu.ng', 'Yusuf@2026', 'Electrical Engineering', '300', 'active', '2022-09-01')
ON CONFLICT (id) DO NOTHING;

-- 6. Lecturers Table
CREATE TABLE IF NOT EXISTS lecturers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  department TEXT NOT NULL,
  courses JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of course codes
  status TEXT NOT NULL DEFAULT 'active',
  joined TEXT NOT NULL
);
ALTER TABLE lecturers DISABLE ROW LEVEL SECURITY;

INSERT INTO lecturers (id, name, email, password, department, courses, status, joined) VALUES
  ('LEC/001', 'Dr. Emeka Okafor', 'e.okafor@uni.edu.ng', 'Emeka@2026', 'Computer Science', '["CSC301", "CSC401"]'::jsonb, 'active', '2019-01-15'),
  ('LEC/002', 'Prof. Amina Yusuf', 'a.yusuf@uni.edu.ng', 'Amina@2026', 'Mathematics', '["MTH101", "MTH201"]'::jsonb, 'active', '2015-08-01'),
  ('LEC/003', 'Dr. Rotimi Adeleke', 'r.adeleke@uni.edu.ng', 'Rotimi@2026', 'Electrical Engineering', '["EEE201", "EEE301"]'::jsonb, 'inactive', '2020-03-01'),
  ('LEC/004', 'Dr. Kemi Fashola', 'k.fashola@uni.edu.ng', 'Kemi@2026', 'Computer Science', '["CSC101", "CSC201"]'::jsonb, 'active', '2018-09-01'),
  ('LEC/005', 'Prof. Obinna Nwachukwu', 'o.nwachukwu@uni.edu.ng', 'Obinna@2026', 'Physics', '["PHY101", "PHY201"]'::jsonb, 'active', '2012-04-01')
ON CONFLICT (id) DO NOTHING;

-- 7. Lecturer Assignments Table
CREATE TABLE IF NOT EXISTS lecturer_assignments (
  id TEXT PRIMARY KEY,
  offering_id TEXT REFERENCES course_offerings(id) ON DELETE CASCADE,
  lecturer_id TEXT REFERENCES lecturers(id) ON DELETE CASCADE
);
ALTER TABLE lecturer_assignments DISABLE ROW LEVEL SECURITY;

INSERT INTO lecturer_assignments (id, offering_id, lecturer_id) VALUES
  ('LA001', 'OFF001', 'LEC/004'),
  ('LA002', 'OFF002', 'LEC/004'),
  ('LA003', 'OFF003', 'LEC/001'),
  ('LA004', 'OFF004', 'LEC/001'),
  ('LA005', 'OFF005', 'LEC/002'),
  ('LA006', 'OFF006', 'LEC/003'),
  ('LA007', 'OFF007', 'LEC/005'),
  ('LA008', 'OFF008', 'LEC/002'),
  ('LA009', 'OFF009', 'LEC/003')
ON CONFLICT (id) DO NOTHING;

-- 8. Timetable Slots Table
CREATE TABLE IF NOT EXISTS timetable_slots (
  id TEXT PRIMARY KEY,
  offering_id TEXT REFERENCES course_offerings(id) ON DELETE CASCADE,
  lecturer_id TEXT REFERENCES lecturers(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  venue TEXT NOT NULL
);
ALTER TABLE timetable_slots DISABLE ROW LEVEL SECURITY;

INSERT INTO timetable_slots (id, offering_id, lecturer_id, day, start_time, end_time, venue) VALUES
  ('TS001', 'OFF001', 'LEC/004', 'Friday', '09:00', '11:00', 'LT-A'),
  ('TS002', 'OFF002', 'LEC/004', 'Wednesday', '14:00', '16:00', 'LT-B'),
  ('TS003', 'OFF003', 'LEC/001', 'Monday', '14:00', '16:00', 'LT-B'),
  ('TS004', 'OFF004', 'LEC/001', 'Wednesday', '10:00', '12:00', 'LT-C'),
  ('TS005', 'OFF005', 'LEC/002', 'Tuesday', '08:00', '10:00', 'LT-A'),
  ('TS006', 'OFF006', 'LEC/003', 'Thursday', '12:00', '14:00', 'ENG-Lab-A'),
  ('TS007', 'OFF007', 'LEC/005', 'Monday', '10:00', '12:00', 'SCI-LT'),
  ('TS008', 'OFF008', 'LEC/002', 'Thursday', '09:00', '10:00', 'LT-A'),
  ('TS009', 'OFF009', 'LEC/003', 'Tuesday', '14:00', '16:00', 'ENG-Lab-B')
ON CONFLICT (id) DO NOTHING;

-- 9. Student Registrations Table (relational)
CREATE TABLE IF NOT EXISTS student_registrations (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  offering_id TEXT REFERENCES course_offerings(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered',
  UNIQUE(student_id, offering_id)
);
ALTER TABLE student_registrations DISABLE ROW LEVEL SECURITY;

INSERT INTO student_registrations (id, student_id, offering_id, status) VALUES
  ('SR001', 'STU/2024/001', 'OFF003', 'registered'),
  ('SR002', 'STU/2024/002', 'OFF006', 'registered'),
  ('SR003', 'STU/2024/004', 'OFF005', 'registered'),
  ('SR004', 'STU/2024/004', 'OFF008', 'registered'),
  ('SR005', 'STU/2024/005', 'OFF007', 'registered'),
  ('SR006', 'STU/2024/006', 'OFF001', 'registered'),
  ('SR007', 'STU/2024/006', 'OFF002', 'registered'),
  ('SR008', 'STU/2024/008', 'OFF009', 'registered')
ON CONFLICT (id) DO NOTHING;

-- 10. Enrollments Table (legacy/compatibility)
CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  course_code TEXT NOT NULL,
  session TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
);
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;

INSERT INTO enrollments (id, student_id, course_code, session, status) VALUES
  ('ENR001', 'STU/2024/001', 'CSC301', '2025/2026', 'active'),
  ('ENR002', 'STU/2024/001', 'CSC401', '2025/2026', 'active'),
  ('ENR003', 'STU/2024/002', 'EEE201', '2025/2026', 'active'),
  ('ENR004', 'STU/2024/004', 'MTH201', '2025/2026', 'active'),
  ('ENR005', 'STU/2024/005', 'PHY101', '2025/2026', 'active'),
  ('ENR006', 'STU/2024/006', 'CSC201', '2025/2026', 'active'),
  ('ENR007', 'STU/2024/006', 'CSC101', '2025/2026', 'active'),
  ('ENR008', 'STU/2024/008', 'EEE301', '2025/2026', 'active')
ON CONFLICT (id) DO NOTHING;

-- 11. Course Assignments Table (legacy/compatibility)
CREATE TABLE IF NOT EXISTS course_assignments (
  id TEXT PRIMARY KEY,
  lecturer_id TEXT REFERENCES lecturers(id) ON DELETE CASCADE,
  course_code TEXT NOT NULL,
  session TEXT NOT NULL
);
ALTER TABLE course_assignments DISABLE ROW LEVEL SECURITY;

INSERT INTO course_assignments (id, lecturer_id, course_code, session) VALUES
  ('CA001', 'LEC/001', 'CSC301', '2025/2026'),
  ('CA002', 'LEC/001', 'CSC401', '2025/2026'),
  ('CA003', 'LEC/002', 'MTH201', '2025/2026'),
  ('CA004', 'LEC/003', 'EEE201', '2025/2026'),
  ('CA005', 'LEC/004', 'CSC101', '2025/2026'),
  ('CA006', 'LEC/004', 'CSC201', '2025/2026'),
  ('CA007', 'LEC/005', 'PHY101', '2025/2026')
ON CONFLICT (id) DO NOTHING;

-- 12. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  "user" TEXT NOT NULL,
  target TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  type TEXT NOT NULL
);
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

INSERT INTO audit_logs (id, action, "user", target, timestamp, type) VALUES
  ('AL001', 'Created student account', 'Super Admin', 'STU/2024/008 - Yusuf Abdullahi', '2026-06-16 10:45', 'create'),
  ('AL002', 'Approved notification', 'Super Admin', 'N001 - Lecture Rescheduled', '2026-06-16 09:50', 'approve'),
  ('AL003', 'Deactivated account', 'Super Admin', 'STU/2024/003 - Fatima Bello', '2026-06-15 15:20', 'update'),
  ('AL004', 'Imported 12 student records', 'Super Admin', 'Bulk import - Computer Science', '2026-06-15 11:00', 'import'),
  ('AL005', 'Rejected notification', 'Super Admin', 'N004 - Lab Session Venue Update', '2026-06-14 16:30', 'reject'),
  ('AL006', 'Reset lecturer password', 'Super Admin', 'LEC/003 - Dr. Rotimi Adeleke', '2026-06-14 14:00', 'update')
ON CONFLICT (id) DO NOTHING;

-- 13. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  "from" TEXT NOT NULL,
  "to" TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  timestamp TEXT NOT NULL
);
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

INSERT INTO notifications (id, title, message, "from", "to", type, status, timestamp) VALUES
  ('N001', 'Lecture Rescheduled', 'CSC301 moved from 10:00 -> 14:00 on Monday 17 June', 'Dr. Emeka Okafor', 'CSC 300L Students', 'update', 'approved', '2026-06-16 08:30'),
  ('N002', 'Class Cancellation Request', 'MTH201 lecture on 18 June cancelled - conference', 'Prof. Amina Yusuf', 'MTH 200L Students', 'cancellation', 'pending', '2026-06-16 09:15'),
  ('N003', 'Mid-Semester Exam Reminder', 'CSC401 exam on 20 June at 09:00 in LT-A.', 'System', 'CSC 400L Students', 'reminder', 'sent', '2026-06-15 18:00'),
  ('N004', 'Lab Session Venue Update', 'EEE201 lab moved to Lab Block C for Friday session', 'Dr. Rotimi Adeleke', 'EEE 200L Students', 'update', 'pending', '2026-06-16 10:00'),
  ('N005', 'Course Registration Reminder', 'Second-semester registration closes 25 June.', 'System', 'All Students', 'reminder', 'sent', '2026-06-14 09:00')
ON CONFLICT (id) DO NOTHING;

-- 14. Rep Assignments Table
CREATE TABLE IF NOT EXISTS rep_assignments (
  course_code TEXT PRIMARY KEY,
  rep_id TEXT REFERENCES students(id) ON DELETE SET NULL,
  assistant_rep_id TEXT REFERENCES students(id) ON DELETE SET NULL
);
ALTER TABLE rep_assignments DISABLE ROW LEVEL SECURITY;

INSERT INTO rep_assignments (course_code, rep_id, assistant_rep_id) VALUES
  ('CSC301', 'STU/2024/001', 'STU/2024/006'),
  ('CSC401', 'STU/2024/003', NULL),
  ('MTH201', 'STU/2024/004', NULL)
ON CONFLICT (course_code) DO NOTHING;

-- 15. Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  room_code TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  type TEXT NOT NULL,
  file_name TEXT,
  pinned BOOLEAN DEFAULT false,
  reactions JSONB DEFAULT '{}'::jsonb
);
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

INSERT INTO chat_messages (id, room_code, sender_id, sender_name, sender_role, content, timestamp, type, pinned, reactions) VALUES
  ('m1', 'CSC301', 'LEC/001', 'Dr. Emeka Okafor', 'lecturer', 'Good morning everyone! Today we''ll be covering Software Architecture patterns. Please review chapter 4 before class.', '08:15', 'announcement', true, '{}'::jsonb),
  ('m2', 'CSC301', 'REP001', 'Aisha Mohammed (REP)', 'rep', 'Noted sir! I''ve shared the chapter link in the group. Will the quiz still hold today?', '08:22', 'text', false, '{}'::jsonb),
  ('m3', 'CSC301', 'LEC/001', 'Dr. Emeka Okafor', 'lecturer', 'Yes, the quiz holds at the end of the lecture. It will cover chapters 3 and 4.', '08:25', 'text', false, '{}'::jsonb),
  ('m4', 'CSC301', 'AREP001', 'Ibrahim (Asst. REP)', 'assistant_rep', 'I''ve noted the attendance so far. 42 students have confirmed they''re coming.', '08:30', 'text', false, '{}'::jsonb),
  ('m5', 'CSC401', 'LEC/001', 'Dr. Emeka Okafor', 'lecturer', 'Distributed Systems lecture will start at 10:00. We''re in LT-C today.', '09:45', 'announcement', true, '{}'::jsonb),
  ('m6', 'CSC401', 'REP002', 'Fatima Bello (REP)', 'rep', 'Thank you Dr. Okafor. I''ll inform the class.', '09:47', 'text', false, '{}'::jsonb),
  ('m7', 'MTH201', 'LEC/002', 'Prof. Amina Yusuf', 'lecturer', 'Calculus II - please bring your textbooks today. We''ll be doing in-class exercises.', '07:30', 'announcement', true, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
