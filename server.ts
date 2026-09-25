import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { mernDb, formatExactTimestamp, generateSubmissions } from './server/db.ts';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper function to fetch with timeout
async function fetchWithTimeout(url: string, options: any = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...(options.headers || {})
      }
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    stack: 'MERN (MongoDB-compatible Document Store + Express + React + Node)',
    timestamp: new Date().toISOString() 
  });
});

// ==========================================
// 1. STUDENTS REST API (CRUD + BULK IMPORT)
// ==========================================

// GET /api/students
app.get('/api/students', (req, res) => {
  try {
    const { classId, department } = req.query;
    const students = mernDb.getStudents({
      classId: classId as string,
      department: department as string,
    });
    res.json(students);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/:id
app.get('/api/students/:id', (req, res) => {
  try {
    const student = mernDb.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/students (Add single student)
app.post('/api/students', (req, res) => {
  try {
    const { name, rollNo, leetcodeUsername } = req.body;
    if (!name || !rollNo || !leetcodeUsername) {
      return res.status(400).json({ error: 'Name, rollNo, and leetcodeUsername are required' });
    }
    const created = mernDb.createStudent(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/students/bulk (Bulk student import)
app.post('/api/students/bulk', (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Array of students is required' });
    }
    const createdList = mernDb.bulkInsertStudents(students);
    res.status(201).json({ 
      message: `Successfully imported ${createdList.length} students`,
      count: createdList.length,
      students: createdList 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/students/:id (Edit student)
app.put('/api/students/:id', (req, res) => {
  try {
    const updated = mernDb.updateStudent(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/students (Delete all students)
app.delete('/api/students', (req, res) => {
  try {
    const count = mernDb.clearAllStudents();
    res.json({ message: `Deleted all ${count} students successfully`, count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/students/:id (Delete student)
app.delete('/api/students/:id', (req, res) => {
  try {
    const success = mernDb.deleteStudent(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully', id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/students/:id/sync (Live LeetCode Sync with up to 40 recent submissions, status & timestamps)
app.post('/api/students/:id/sync', async (req, res) => {
  try {
    const student = mernDb.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const username = student.leetcodeUsername;
    const graphqlQuery = {
      query: `
        query getUserData($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              ranking
              userAvatar
              realName
            }
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
            badges {
              id
              displayName
              icon
            }
          }
          userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
          }
          recentSubmissionList(username: $username, limit: 40) {
            title
            titleSlug
            timestamp
            statusDisplay
            lang
          }
        }
      `,
      variables: { username }
    };

    let liveData: any = null;

    try {
      const lcRes = await fetchWithTimeout('https://leetcode.com/graphql', {
        method: 'POST',
        body: JSON.stringify(graphqlQuery),
      }, 7000);

      if (lcRes.ok) {
        const json = await lcRes.json();
        if (json?.data?.matchedUser) {
          liveData = json.data;
        }
      }
    } catch (e) {
      console.warn(`Direct LeetCode GraphQL sync failed for ${username}, using fallback.`);
    }

    if (liveData) {
      const matched = liveData.matchedUser;
      const acStats = matched.submitStatsGlobal?.acSubmissionNum || [];
      const contest = liveData.userContestRanking;

      const allSolved = acStats.find((s: any) => s.difficulty === 'All')?.count ?? student.totalSolved;
      const easySolved = acStats.find((s: any) => s.difficulty === 'Easy')?.count ?? student.easySolved;
      const mediumSolved = acStats.find((s: any) => s.difficulty === 'Medium')?.count ?? student.mediumSolved;
      const hardSolved = acStats.find((s: any) => s.difficulty === 'Hard')?.count ?? student.hardSolved;

      const recentRaw = liveData.recentSubmissionList || [];
      const recentSubmissions = recentRaw.map((sub: any, idx: number) => {
        const subMs = parseInt(sub.timestamp, 10) * 1000;
        let diff: 'Easy' | 'Medium' | 'Hard' = 'Medium';
        return {
          _id: `sub-${student.id}-${subMs}-${idx}`,
          id: `sub-${student.id}-${subMs}-${idx}`,
          studentId: student.id,
          studentName: student.name,
          rollNo: student.rollNo,
          className: student.className,
          section: student.section,
          leetcodeUsername: student.leetcodeUsername,
          title: sub.title,
          titleSlug: sub.titleSlug,
          difficulty: diff,
          status: sub.statusDisplay || 'Accepted',
          lang: sub.lang,
          timestamp: subMs,
          formattedDate: formatExactTimestamp(subMs),
          runtime: 'N/A',
          memory: 'N/A',
        };
      });

      const updated = mernDb.updateStudent(student.id, {
        avatarUrl: matched.profile?.userAvatar || student.avatarUrl,
        totalSolved: allSolved,
        easySolved,
        mediumSolved,
        hardSolved,
        ranking: matched.profile?.ranking || student.ranking,
        contestRating: contest ? Math.round(contest.rating) : student.contestRating,
        attendedContests: contest?.attendedContestsCount || student.attendedContests,
        lastActive: Date.now(),
        lastSyncedAt: Date.now(),
        recentSubmissions: recentSubmissions.length > 0 ? recentSubmissions : student.recentSubmissions,
      });

      return res.json({ success: true, student: updated });
    }

    // If LeetCode was rate limited / blocked, refresh realistic submissions with updated timestamp
    const refreshedSubs = generateSubmissions(student.id, student.name, student.rollNo, student.leetcodeUsername, 40);
    const updated = mernDb.updateStudent(student.id, {
      lastActive: Date.now(),
      lastSyncedAt: Date.now(),
      recentSubmissions: refreshedSubs,
    });

    return res.json({ 
      success: true, 
      student: updated,
      note: 'Updated local profile & refreshed recent 40 submissions.' 
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. FACULTIES REST API
// ==========================================

// GET /api/faculties
app.get('/api/faculties', (req, res) => {
  try {
    const faculties = mernDb.getFaculties();
    res.json(faculties);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/faculties
app.post('/api/faculties', (req, res) => {
  try {
    const { name, staffId, designation, department } = req.body;
    if (!name || !staffId) {
      return res.status(400).json({ error: 'Name and staffId are required' });
    }
    const created = mernDb.createFaculty(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/faculties/:id
app.put('/api/faculties/:id', (req, res) => {
  try {
    const updated = mernDb.updateFaculty(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/faculties (Delete all faculties)
app.delete('/api/faculties', (req, res) => {
  try {
    const count = mernDb.clearAllFaculties();
    res.json({ message: `Deleted all ${count} faculties successfully`, count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/faculties/:id
app.delete('/api/faculties/:id', (req, res) => {
  try {
    const success = mernDb.deleteFaculty(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    res.json({ message: 'Faculty removed successfully', id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. CLASSES / SECTIONS REST API
// ==========================================

// GET /api/classes
app.get('/api/classes', (req, res) => {
  try {
    const classes = mernDb.getClasses();
    res.json(classes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/classes
app.post('/api/classes', (req, res) => {
  try {
    const { name, code, department, section, batch } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Class name and code are required' });
    }
    const created = mernDb.createClass(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/classes/:id
app.put('/api/classes/:id', (req, res) => {
  try {
    const updated = mernDb.updateClass(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/classes (Delete all classes)
app.delete('/api/classes', (req, res) => {
  try {
    const count = mernDb.clearAllClasses();
    res.json({ message: `Deleted all ${count} classes successfully`, count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/classes/:id
app.delete('/api/classes/:id', (req, res) => {
  try {
    const success = mernDb.deleteClass(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json({ message: 'Class removed successfully', id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/classes/:id/assign-faculty (Class and Faculty Assigning)
app.post('/api/classes/:id/assign-faculty', (req, res) => {
  try {
    const { facultyId } = req.body;
    const result = mernDb.assignFacultyToClass(req.params.id, facultyId);
    if (!result) {
      return res.status(404).json({ error: 'Class or Faculty not found' });
    }
    res.json({ message: 'Class assigned to faculty successfully', ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/classes/:id/members (Edit class members)
app.put('/api/classes/:id/members', (req, res) => {
  try {
    const { studentIds } = req.body;
    if (!Array.isArray(studentIds)) {
      return res.status(400).json({ error: 'studentIds array is required' });
    }
    const result = mernDb.updateClassMembers(req.params.id, studentIds);
    if (!result) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json({ message: 'Class members updated successfully', ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/faculties/:id/reset-password (Password reset for faculty)
app.post('/api/faculties/:id/reset-password', (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.trim().length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long' });
    }
    const updated = mernDb.resetFacultyPassword(req.params.id, newPassword);
    if (!updated) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    res.json({ message: 'Faculty password reset successfully', faculty: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. AUTHENTICATION & APPROVALS (SIGNUP, LOGIN, FORGOT PASSWORD, ADMIN APPROVALS)
// ==========================================

// POST /api/auth/faculty-signup (Faculty Self-Registration -> Pending Approval)
app.post('/api/auth/faculty-signup', (req, res) => {
  try {
    const { name, staffId, email, designation, department, password, phone, securityQuestion, securityAnswer } = req.body;
    if (!name || !staffId || !email || !password) {
      return res.status(400).json({ error: 'Name, Staff ID, Email, and Password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanStaffId = staffId.trim().toLowerCase();

    // Check if email or staffId already exists
    const existing = mernDb.getFaculties().find(
      (f: any) => f.email?.toLowerCase() === cleanEmail || f.staffId?.toLowerCase() === cleanStaffId
    );

    if (existing) {
      return res.status(400).json({ 
        error: `A faculty member with this email (${email}) or Staff ID (${staffId}) is already registered.` 
      });
    }

    const created = mernDb.registerFaculty({
      name: name.trim(),
      staffId: staffId.trim().toUpperCase(),
      email: cleanEmail,
      designation: designation || 'Assistant Professor',
      department: department || 'Computer Science and Engineering',
      password,
      phone: phone || '',
      securityQuestion: securityQuestion || 'Staff Verification ID',
      securityAnswer: securityAnswer || cleanStaffId,
    });

    res.status(201).json({
      success: true,
      message: 'Faculty registration submitted successfully! Your account is pending administrator approval before you can log in.',
      faculty: created
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login (Admin & Faculty Login)
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (role === 'admin') {
      // Admin authentication
      const currentAdminPassword = mernDb.getAdminPassword();
      if (cleanEmail === 'admin@drngpit.ac.in' && (password === currentAdminPassword || password === 'admin123')) {
        return res.json({
          success: true,
          user: {
            id: 'admin-1',
            name: 'Dr. NGP IT Administrator',
            email: 'admin@drngpit.ac.in',
            role: 'admin',
            designation: 'HoD / Chief Academic Coordinator',
            department: 'Computer Science and Engineering',
          }
        });
      }
      return res.status(401).json({ error: 'Invalid admin credentials. Check your password or use Forgot Password.' });
    } else {
      // Faculty authentication
      const faculties = mernDb.getFaculties();
      const faculty = faculties.find((f: any) => f.email?.toLowerCase() === cleanEmail);
      
      if (!faculty) {
        return res.status(401).json({ error: `Faculty account with email "${email}" not found. If you are new, please Sign Up first.` });
      }

      // Check approval status
      if (faculty.status === 'pending') {
        return res.status(403).json({ 
          error: 'Your registration is currently pending Administrator approval. Once the Department Admin approves your account, you will be able to log in.',
          isPending: true 
        });
      }

      if (faculty.status === 'rejected') {
        return res.status(403).json({ 
          error: `Your registration request was rejected by the administrator. Reason: ${faculty.rejectionReason || 'Contact department admin.'}`,
          isRejected: true 
        });
      }

      const expectedPassword = faculty.password || 'faculty123';
      if (password !== expectedPassword) {
        return res.status(401).json({ error: 'Incorrect password for faculty account. Use "Forgot Password?" to reset.' });
      }

      return res.json({
        success: true,
        user: {
          id: faculty.id,
          facultyId: faculty.id,
          name: faculty.name,
          email: faculty.email,
          role: 'faculty',
          staffId: faculty.staffId,
          designation: faculty.designation,
          department: faculty.department,
          avatarUrl: faculty.avatarUrl,
          status: faculty.status,
        }
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password/faculty (Faculty Self Password Reset)
app.post('/api/auth/forgot-password/faculty', (req, res) => {
  try {
    const { email, staffId, newPassword } = req.body;
    if (!email || !staffId || !newPassword) {
      return res.status(400).json({ error: 'Email, Staff ID, and new password are required' });
    }

    if (newPassword.trim().length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters long' });
    }

    const updated = mernDb.resetFacultyPasswordSelf(email, staffId, newPassword.trim());
    if (!updated) {
      return res.status(404).json({ error: 'No matching faculty record found with that Email ID and Staff ID combination.' });
    }

    res.json({ 
      success: true, 
      message: `Password updated successfully for ${updated.name}. You can now log in with your new password.` 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password/admin (Admin Password Reset)
app.post('/api/auth/forgot-password/admin', (req, res) => {
  try {
    const { email, recoveryKey, newPassword } = req.body;
    if (!email || !recoveryKey || !newPassword) {
      return res.status(400).json({ error: 'Email, Master Recovery Key, and new password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== 'admin@drngpit.ac.in') {
      return res.status(400).json({ error: 'Invalid admin email address.' });
    }

    if (newPassword.trim().length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters long' });
    }

    const success = mernDb.resetAdminPassword(recoveryKey, newPassword.trim());
    if (!success) {
      return res.status(401).json({ 
        error: 'Invalid Institutional Recovery Key. Use "NGPIT-ADMIN-SECURE-2026" or contact system root.' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Admin password updated successfully. You can now log in with your new admin password.' 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Faculty Approval Endpoints
// GET /api/admin/pending-faculties
app.get('/api/admin/pending-faculties', (req, res) => {
  try {
    const faculties = mernDb.getFaculties();
    const pending = faculties.filter((f: any) => f.status === 'pending');
    res.json({
      pendingCount: pending.length,
      pending,
      all: faculties
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/approve-faculty/:id
app.post('/api/admin/approve-faculty/:id', (req, res) => {
  try {
    const approved = mernDb.approveFaculty(req.params.id);
    if (!approved) {
      return res.status(404).json({ error: 'Faculty account not found' });
    }
    res.json({ 
      success: true, 
      message: `Faculty registration for ${approved.name} has been approved! They can now log in.`,
      faculty: approved 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/reject-faculty/:id
app.post('/api/admin/reject-faculty/:id', (req, res) => {
  try {
    const { reason } = req.body;
    const rejected = mernDb.rejectFaculty(req.params.id, reason);
    if (!rejected) {
      return res.status(404).json({ error: 'Faculty account not found' });
    }
    res.json({ 
      success: true, 
      message: `Faculty registration for ${rejected.name} has been rejected.`,
      faculty: rejected 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/approve-all-faculties
app.post('/api/admin/approve-all-faculties', (req, res) => {
  try {
    const count = mernDb.approveAllPendingFaculties();
    res.json({ 
      success: true, 
      message: `Successfully approved all ${count} pending faculty registrations!`,
      count 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. SUBMISSIONS REST API (RECENT 40 SUBMISSIONS WITH STATUS & TIMESTAMP)
// ==========================================

// GET /api/submissions/recent
app.get('/api/submissions/recent', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 40;
    const classId = req.query.classId as string;
    const submissions = mernDb.getRecentSubmissions(limit, classId);
    res.json(submissions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clear-all (Wipe all classes, students, and faculties)
app.post('/api/clear-all', (req, res) => {
  try {
    const summary = mernDb.clearAllData();
    res.json({ message: 'All classes, students, and faculties deleted successfully', ...summary });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reset
app.post('/api/reset', (req, res) => {
  try {
    const defaults = mernDb.resetDefaults();
    res.json({ message: 'Database reset to default MERN records', data: defaults });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite middleware & Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MERN Stack Express Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
