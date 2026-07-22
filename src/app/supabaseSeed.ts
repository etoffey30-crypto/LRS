import { supabase } from "./supabaseClient";

// --- Seed Data Definitions mirroring memory state in App.tsx and SmartFeatures.tsx ---

export const INIT_DEPARTMENTS = [
  { id: "DEPT001", code: "CSC", name: "Computer Science", description: "Computing, software engineering & AI" },
  { id: "DEPT002", code: "EEE", name: "Electrical Engineering", description: "Power systems, electronics & control" },
  { id: "DEPT003", code: "MTH", name: "Mathematics", description: "Pure & applied mathematics" },
  { id: "DEPT004", code: "PHY", name: "Physics", description: "Classical, modern & applied physics" },
  { id: "DEPT005", code: "CHM", name: "Chemistry", description: "Organic & inorganic chemistry" },
  { id: "DEPT006", code: "CVE", name: "Civil Engineering", description: "Structural, geo & environmental engineering" },
  { id: "DEPT007", code: "MCE", name: "Mechanical Engineering", description: "Thermodynamics, mechanics & manufacturing" }
];

export const INIT_COURSES = [
  { id: "CRS001", code: "CSC101", title: "Introduction to Computing", credits: 3, department_id: "DEPT001", level: 100, semester_offered: "First" },
  { id: "CRS002", code: "CSC201", title: "Data Structures & Algorithms", credits: 3, department_id: "DEPT001", level: 200, semester_offered: "First" },
  { id: "CRS003", code: "CSC301", title: "Software Engineering", credits: 3, department_id: "DEPT001", level: 300, semester_offered: "First" },
  { id: "CRS004", code: "CSC401", title: "Distributed Systems", credits: 3, department_id: "DEPT001", level: 400, semester_offered: "Second" },
  { id: "CRS005", code: "CSC302", title: "Database Management Systems", credits: 3, department_id: "DEPT001", level: 300, semester_offered: "Second" },
  { id: "CRS006", code: "MTH201", title: "Calculus II", credits: 3, department_id: "DEPT003", level: 200, semester_offered: "First" },
  { id: "CRS007", code: "EEE201", title: "Circuit Analysis", credits: 3, department_id: "DEPT002", level: 200, semester_offered: "First" },
  { id: "CRS008", code: "PHY101", title: "General Physics I", credits: 3, department_id: "DEPT004", level: 100, semester_offered: "First" },
  { id: "CRS009", code: "MTH101", title: "Elementary Mathematics", credits: 3, department_id: "DEPT003", level: 100, semester_offered: "Both" },
  { id: "CRS010", code: "EEE301", title: "Electromagnetic Fields", credits: 3, department_id: "DEPT002", level: 300, semester_offered: "First" },
  { id: "CRS011", code: "PHY201", title: "General Physics II", credits: 3, department_id: "DEPT004", level: 200, semester_offered: "Second" }
];

export const INIT_SESSIONS = [
  { id: "SES001", name: "2024/2025", semester: "Second", is_active: false },
  { id: "SES002", name: "2025/2026", semester: "First", is_active: true }
];

export const INIT_OFFERINGS = [
  { id: "OFF001", course_id: "CRS001", session_id: "SES002" },
  { id: "OFF002", course_id: "CRS002", session_id: "SES002" },
  { id: "OFF003", course_id: "CRS003", session_id: "SES002" },
  { id: "OFF004", course_id: "CRS004", session_id: "SES002" },
  { id: "OFF005", course_id: "CRS006", session_id: "SES002" },
  { id: "OFF006", course_id: "CRS007", session_id: "SES002" },
  { id: "OFF007", course_id: "CRS008", session_id: "SES002" },
  { id: "OFF008", course_id: "CRS009", session_id: "SES002" },
  { id: "OFF009", course_id: "CRS010", session_id: "SES002" }
];

export const INIT_STUDENTS = [
  { id: "STU/2024/001", name: "Aisha Mohammed", email: "aisha.m@uni.edu.ng", password: "Aisha@2026", department: "Computer Science", level: "300", status: "active", enrolled: "2022-09-01" },
  { id: "STU/2024/002", name: "Chidi Okonkwo", email: "c.okonkwo@uni.edu.ng", password: "Chidi@2026", department: "Electrical Engineering", level: "200", status: "active", enrolled: "2023-09-01" },
  { id: "STU/2024/003", name: "Fatima Bello", email: "f.bello@uni.edu.ng", password: "Fatima@2026", department: "Computer Science", level: "400", status: "inactive", enrolled: "2021-09-01" },
  { id: "STU/2024/004", name: "Emmanuel Adeyemi", email: "e.adeyemi@uni.edu.ng", password: "Emmanuel@2026", department: "Mathematics", level: "100", status: "active", enrolled: "2024-09-01" },
  { id: "STU/2024/005", name: "Ngozi Eze", email: "n.eze@uni.edu.ng", password: "Ngozi@2026", department: "Physics", level: "300", status: "active", enrolled: "2022-09-01" },
  { id: "STU/2024/006", name: "Ibrahim Suleiman", email: "i.suleiman@uni.edu.ng", password: "Ibrahim@2026", department: "Computer Science", level: "200", status: "active", enrolled: "2023-09-01" },
  { id: "STU/2024/007", name: "Adaeze Nwosu", email: "a.nwosu@uni.edu.ng", password: "Adaeze@2026", department: "Chemistry", level: "400", status: "inactive", enrolled: "2021-09-01" },
  { id: "STU/2024/008", name: "Yusuf Abdullahi", email: "y.abdullahi@uni.edu.ng", password: "Yusuf@2026", department: "Electrical Engineering", level: "300", status: "active", enrolled: "2022-09-01" }
];

export const INIT_LECTURERS = [
  { id: "LEC/001", name: "Dr. Emeka Okafor", email: "e.okafor@uni.edu.ng", password: "Emeka@2026", department: "Computer Science", courses: ["CSC301", "CSC401"], status: "active", joined: "2019-01-15" },
  { id: "LEC/002", name: "Prof. Amina Yusuf", email: "a.yusuf@uni.edu.ng", password: "Amina@2026", department: "Mathematics", courses: ["MTH101", "MTH201"], status: "active", joined: "2015-08-01" },
  { id: "LEC/003", name: "Dr. Rotimi Adeleke", email: "r.adeleke@uni.edu.ng", password: "Rotimi@2026", department: "Electrical Engineering", courses: ["EEE201", "EEE301"], status: "inactive", joined: "2020-03-01" },
  { id: "LEC/004", name: "Dr. Kemi Fashola", email: "k.fashola@uni.edu.ng", password: "Kemi@2026", department: "Computer Science", courses: ["CSC101", "CSC201"], status: "active", joined: "2018-09-01" },
  { id: "LEC/005", name: "Prof. Obinna Nwachukwu", email: "o.nwachukwu@uni.edu.ng", password: "Obinna@2026", department: "Physics", courses: ["PHY101", "PHY201"], status: "active", joined: "2012-04-01" }
];

export const INIT_LECTURER_ASSIGNMENTS = [
  { id: "LA001", offering_id: "OFF001", lecturer_id: "LEC/004" },
  { id: "LA002", offering_id: "OFF002", lecturer_id: "LEC/004" },
  { id: "LA003", offering_id: "OFF003", lecturer_id: "LEC/001" },
  { id: "LA004", offering_id: "OFF004", lecturer_id: "LEC/001" },
  { id: "LA005", offering_id: "OFF005", lecturer_id: "LEC/002" },
  { id: "LA006", offering_id: "OFF006", lecturer_id: "LEC/003" },
  { id: "LA007", offering_id: "OFF007", lecturer_id: "LEC/005" },
  { id: "LA008", offering_id: "OFF008", lecturer_id: "LEC/002" },
  { id: "LA009", offering_id: "OFF009", lecturer_id: "LEC/003" }
];

export const INIT_TIMETABLE_SLOTS = [
  { id: "TS001", offering_id: "OFF001", lecturer_id: "LEC/004", day: "Friday", start_time: "09:00", end_time: "11:00", venue: "LT-A" },
  { id: "TS002", offering_id: "OFF002", lecturer_id: "LEC/004", day: "Wednesday", start_time: "14:00", end_time: "16:00", venue: "LT-B" },
  { id: "TS003", offering_id: "OFF003", lecturer_id: "LEC/001", day: "Monday", start_time: "14:00", end_time: "16:00", venue: "LT-B" },
  { id: "TS004", offering_id: "OFF004", lecturer_id: "LEC/001", day: "Wednesday", start_time: "10:00", end_time: "12:00", venue: "LT-C" },
  { id: "TS005", offering_id: "OFF005", lecturer_id: "LEC/002", day: "Tuesday", start_time: "08:00", end_time: "10:00", venue: "LT-A" },
  { id: "TS006", offering_id: "OFF006", lecturer_id: "LEC/003", day: "Thursday", start_time: "12:00", end_time: "14:00", venue: "ENG-Lab-A" },
  { id: "TS007", offering_id: "OFF007", lecturer_id: "LEC/005", day: "Monday", start_time: "10:00", end_time: "12:00", venue: "SCI-LT" },
  { id: "TS008", offering_id: "OFF008", lecturer_id: "LEC/002", day: "Thursday", start_time: "09:00", end_time: "10:00", venue: "LT-A" },
  { id: "TS009", offering_id: "OFF009", lecturer_id: "LEC/003", day: "Tuesday", start_time: "14:00", end_time: "16:00", venue: "ENG-Lab-B" }
];

export const INIT_STUDENT_REGISTRATIONS = [
  { id: "SR001", student_id: "STU/2024/001", offering_id: "OFF003", status: "registered" },
  { id: "SR002", student_id: "STU/2024/002", offering_id: "OFF006", status: "registered" },
  { id: "SR003", student_id: "STU/2024/004", offering_id: "OFF005", status: "registered" },
  { id: "SR004", student_id: "STU/2024/004", offering_id: "OFF008", status: "registered" },
  { id: "SR005", student_id: "STU/2024/005", offering_id: "OFF007", status: "registered" },
  { id: "SR006", student_id: "STU/2024/006", offering_id: "OFF001", status: "registered" },
  { id: "SR007", student_id: "STU/2024/006", offering_id: "OFF002", status: "registered" },
  { id: "SR008", student_id: "STU/2024/008", offering_id: "OFF009", status: "registered" }
];

export const INIT_ENROLLMENTS = [
  { id: "ENR001", student_id: "STU/2024/001", course_code: "CSC301", session: "2025/2026", status: "active" },
  { id: "ENR002", student_id: "STU/2024/001", course_code: "CSC401", session: "2025/2026", status: "active" },
  { id: "ENR003", student_id: "STU/2024/002", course_code: "EEE201", session: "2025/2026", status: "active" },
  { id: "ENR004", student_id: "STU/2024/004", course_code: "MTH201", session: "2025/2026", status: "active" },
  { id: "ENR005", student_id: "STU/2024/005", course_code: "PHY101", session: "2025/2026", status: "active" },
  { id: "ENR006", student_id: "STU/2024/006", course_code: "CSC201", session: "2025/2026", status: "active" },
  { id: "ENR007", student_id: "STU/2024/006", course_code: "CSC101", session: "2025/2026", status: "active" },
  { id: "ENR008", student_id: "STU/2024/008", course_code: "EEE301", session: "2025/2026", status: "active" }
];

export const INIT_COURSE_ASSIGNMENTS = [
  { id: "CA001", lecturer_id: "LEC/001", course_code: "CSC301", session: "2025/2026" },
  { id: "CA002", lecturer_id: "LEC/001", course_code: "CSC401", session: "2025/2026" },
  { id: "CA003", lecturer_id: "LEC/002", course_code: "MTH201", session: "2025/2026" },
  { id: "CA004", lecturer_id: "LEC/003", course_code: "EEE201", session: "2025/2026" },
  { id: "CA005", lecturer_id: "LEC/004", course_code: "CSC101", session: "2025/2026" },
  { id: "CA006", lecturer_id: "LEC/004", course_code: "CSC201", session: "2025/2026" },
  { id: "CA007", lecturer_id: "LEC/005", course_code: "PHY101", session: "2025/2026" }
];

export const INIT_NOTIFS = [
  { id: "N001", title: "Lecture Rescheduled", message: "CSC301 moved from 10:00 -> 14:00 on Monday 17 June", from: "Dr. Emeka Okafor", to: "CSC 300L Students", type: "update", status: "approved", timestamp: "2026-06-16 08:30" },
  { id: "N002", title: "Class Cancellation Request", message: "MTH201 lecture on 18 June cancelled - conference", from: "Prof. Amina Yusuf", to: "MTH 200L Students", type: "cancellation", status: "pending", timestamp: "2026-06-16 09:15" },
  { id: "N003", title: "Mid-Semester Exam Reminder", message: "CSC401 exam on 20 June at 09:00 in LT-A.", from: "System", to: "CSC 400L Students", type: "reminder", status: "sent", timestamp: "2026-06-15 18:00" },
  { id: "N004", title: "Lab Session Venue Update", message: "EEE201 lab moved to Lab Block C for Friday session", from: "Dr. Rotimi Adeleke", to: "EEE 200L Students", type: "update", status: "pending", timestamp: "2026-06-16 10:00" },
  { id: "N005", title: "Course Registration Reminder", message: "Second-semester registration closes 25 June.", from: "System", to: "All Students", type: "reminder", status: "sent", timestamp: "2026-06-14 09:00" }
];

export const INIT_LOGS = [
  { id: "AL001", action: "Created student account", user: "Super Admin", target: "STU/2024/008 - Yusuf Abdullahi", timestamp: "2026-06-16 10:45", type: "create" },
  { id: "AL002", action: "Approved notification", user: "Super Admin", target: "N001 - Lecture Rescheduled", timestamp: "2026-06-16 09:50", type: "approve" },
  { id: "AL003", action: "Deactivated account", user: "Super Admin", target: "STU/2024/003 - Fatima Bello", timestamp: "2026-06-15 15:20", type: "update" },
  { id: "AL004", action: "Imported 12 student records", user: "Super Admin", target: "Bulk import - Computer Science", timestamp: "2026-06-15 11:00", type: "import" },
  { id: "AL005", action: "Rejected notification", user: "Super Admin", target: "N004 - Lab Session Venue Update", timestamp: "2026-06-14 16:30", type: "reject" },
  { id: "AL006", action: "Reset lecturer password", user: "Super Admin", target: "LEC/003 - Dr. Rotimi Adeleke", timestamp: "2026-06-14 14:00", type: "update" }
];

export const INIT_REP_ASSIGNMENTS = [
  { course_code: "CSC301", rep_id: "STU/2024/001", assistant_rep_id: "STU/2024/006" },
  { course_code: "CSC401", rep_id: "STU/2024/003", assistant_rep_id: null },
  { course_code: "MTH201", rep_id: "STU/2024/004", assistant_rep_id: null }
];

export const INIT_CHAT_MESSAGES = [
  { id: "m1", room_code: "CSC301", sender_id: "LEC/001", sender_name: "Dr. Emeka Okafor", sender_role: "lecturer", content: "Good morning everyone! Today we'll be covering Software Architecture patterns. Please review chapter 4 before class.", timestamp: "08:15", type: "announcement", pinned: true, reactions: {} },
  { id: "m2", room_code: "CSC301", sender_id: "REP001", sender_name: "Aisha Mohammed (REP)", sender_role: "rep", content: "Noted sir! I've shared the chapter link in the group. Will the quiz still hold today?", timestamp: "08:22", type: "text", pinned: false, reactions: {} },
  { id: "m3", room_code: "CSC301", sender_id: "LEC/001", sender_name: "Dr. Emeka Okafor", sender_role: "lecturer", content: "Yes, the quiz holds at the end of the lecture. It will cover chapters 3 and 4.", timestamp: "08:25", type: "text", pinned: false, reactions: {} },
  { id: "m4", room_code: "CSC301", sender_id: "AREP001", sender_name: "Ibrahim (Asst. REP)", sender_role: "assistant_rep", content: "I've noted the attendance so far. 42 students have confirmed they're coming.", timestamp: "08:30", type: "text", pinned: false, reactions: {} },
  { id: "m5", room_code: "CSC401", sender_id: "LEC/001", sender_name: "Dr. Emeka Okafor", sender_role: "lecturer", content: "Distributed Systems lecture will start at 10:00. We're in LT-C today.", timestamp: "09:45", type: "announcement", pinned: true, reactions: {} },
  { id: "m6", room_code: "CSC401", sender_id: "REP002", sender_name: "Fatima Bello (REP)", sender_role: "rep", content: "Thank you Dr. Okafor. I'll inform the class.", timestamp: "09:47", type: "text", pinned: false, reactions: {} },
  { id: "m7", room_code: "MTH201", sender_id: "LEC/002", sender_name: "Prof. Amina Yusuf", sender_role: "lecturer", content: "Calculus II - please bring your textbooks today. We'll be doing in-class exercises.", timestamp: "07:30", type: "announcement", pinned: true, reactions: {} }
];

export async function ensureDatabaseSeeded() {
  console.log("Checking if database needs seeding...");
  try {
    // Check if departments exist
    const { data: deptData, error: deptError } = await supabase
      .from("departments")
      .select("id")
      .limit(1);

    if (deptError) {
      console.warn("Error checking departments, tables might not exist yet:", deptError.message);
      return;
    }

    if (deptData && deptData.length > 0) {
      console.log("Database is already seeded.");
      return;
    }

    console.log("Database is empty. Seeding mockup data...");

    // Seed departments
    await supabase.from("departments").upsert(INIT_DEPARTMENTS);
    // Seed courses
    await supabase.from("courses").upsert(INIT_COURSES);
    // Seed sessions
    await supabase.from("academic_sessions").upsert(INIT_SESSIONS);
    // Seed offerings
    await supabase.from("course_offerings").upsert(INIT_OFFERINGS);
    // Seed students
    await supabase.from("students").upsert(INIT_STUDENTS);
    // Seed lecturers
    await supabase.from("lecturers").upsert(INIT_LECTURERS);
    // Seed lecturer assignments
    await supabase.from("lecturer_assignments").upsert(INIT_LECTURER_ASSIGNMENTS);
    // Seed timetable slots
    await supabase.from("timetable_slots").upsert(INIT_TIMETABLE_SLOTS);
    // Seed registrations
    await supabase.from("student_registrations").upsert(INIT_STUDENT_REGISTRATIONS);
    // Seed enrollments (legacy)
    await supabase.from("enrollments").upsert(INIT_ENROLLMENTS);
    // Seed course assignments (legacy)
    await supabase.from("course_assignments").upsert(INIT_COURSE_ASSIGNMENTS);
    // Seed logs
    await supabase.from("audit_logs").upsert(INIT_LOGS);
    // Seed notifications
    await supabase.from("notifications").upsert(INIT_NOTIFS);
    // Seed rep assignments
    await supabase.from("rep_assignments").upsert(INIT_REP_ASSIGNMENTS);
    // Seed chat messages
    await supabase.from("chat_messages").upsert(INIT_CHAT_MESSAGES);

    console.log("Database successfully seeded with initial mock data.");
  } catch (err) {
    console.error("Failed to seed database:", err);
  }
}
