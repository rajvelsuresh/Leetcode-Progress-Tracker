import { Student, Submission, CohortStats } from '../types';
import { INITIAL_STUDENTS } from '../data/mockStudents';

const STORAGE_KEY = 'leetcode_tracker_students_v1';

export function loadStudents(): Student[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load students from localStorage:', err);
  }
  return [];
}

export function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (err) {
    console.error('Failed to save students to localStorage:', err);
  }
}

export function clearAllStoredStudents(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (err) {
    console.error('Failed to clear students in localStorage:', err);
  }
}

export function resetToDefaultStudents(): Student[] {
  clearAllStoredStudents();
  return [];
}

export function computeCohortStats(students: Student[]): CohortStats {
  if (students.length === 0) {
    return {
      totalStudents: 0,
      totalSolved: 0,
      averageSolved: 0,
      totalEasy: 0,
      totalMedium: 0,
      totalHard: 0,
      activeTodayCount: 0,
      topContestRating: 0,
      averageContestRating: 0,
      avgAcceptanceRate: 0,
    };
  }

  const now = Date.now();
  const oneDayAgo = now - 24 * 3600 * 1000;

  const totalSolved = students.reduce((acc, s) => acc + s.totalSolved, 0);
  const totalEasy = students.reduce((acc, s) => acc + s.easySolved, 0);
  const totalMedium = students.reduce((acc, s) => acc + s.mediumSolved, 0);
  const totalHard = students.reduce((acc, s) => acc + s.hardSolved, 0);
  const activeTodayCount = students.filter(s => s.lastActive >= oneDayAgo).length;
  const topContestRating = Math.max(...students.map(s => s.contestRating || 0));
  const avgContestRating = Math.round(
    students.reduce((acc, s) => acc + (s.contestRating || 1500), 0) / students.length
  );
  const avgAcceptance = +(
    students.reduce((acc, s) => acc + (s.acceptanceRate || 0), 0) / students.length
  ).toFixed(1);

  return {
    totalStudents: students.length,
    totalSolved,
    averageSolved: Math.round(totalSolved / students.length),
    totalEasy,
    totalMedium,
    totalHard,
    activeTodayCount,
    topContestRating,
    averageContestRating: avgContestRating,
    avgAcceptanceRate: avgAcceptance,
  };
}

export function getAllSubmissions(students: Student[]): Submission[] {
  const all: Submission[] = [];
  students.forEach(student => {
    if (Array.isArray(student.recentSubmissions)) {
      student.recentSubmissions.forEach(sub => {
        all.push({
          ...sub,
          studentName: student.name,
          rollNo: student.rollNo,
          leetcodeUsername: student.leetcodeUsername,
        });
      });
    }
  });

  return all.sort((a, b) => b.timestamp - a.timestamp);
}

// Format relative time (e.g., "15m ago", "2h ago", "3d ago")
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

// Format exact human-readable timestamp (e.g., "2026-09-22 09:42:15")
export function formatExactTimestamp(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Live LeetCode Sync helper
export async function syncStudentLeetCode(student: Student): Promise<{
  success: boolean;
  updatedStudent?: Student;
  error?: string;
}> {
  try {
    const res = await fetch(`/api/leetcode/profile/${encodeURIComponent(student.leetcodeUsername)}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.error || `HTTP ${res.status}: Failed to fetch from LeetCode`
      };
    }
    const data = await res.json();
    
    // Merge live data with student record
    const updatedStudent: Student = {
      ...student,
      avatarUrl: data.avatarUrl || student.avatarUrl,
      totalSolved: data.totalSolved ?? student.totalSolved,
      easySolved: data.easySolved ?? student.easySolved,
      mediumSolved: data.mediumSolved ?? student.mediumSolved,
      hardSolved: data.hardSolved ?? student.hardSolved,
      ranking: data.ranking || student.ranking,
      contestRating: data.contestRating || student.contestRating,
      attendedContests: data.attendedContests || student.attendedContests,
      lastActive: Date.now(),
      lastSyncedAt: Date.now(),
      syncError: undefined,
      recentSubmissions: (data.recentSubmissions && data.recentSubmissions.length > 0)
        ? data.recentSubmissions.map((sub: any) => ({
            ...sub,
            studentId: student.id,
            studentName: student.name,
            rollNo: student.rollNo,
            leetcodeUsername: student.leetcodeUsername,
          }))
        : student.recentSubmissions,
      badges: data.badges?.length > 0
        ? data.badges.map((b: any) => ({
            id: b.id || b.displayName,
            displayName: b.displayName || b.name,
            icon: b.icon || '🏅'
          }))
        : student.badges
    };

    return { success: true, updatedStudent };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error communicating with LeetCode API'
    };
  }
}

// CSV Export
export function exportToCSV(students: Student[]): void {
  const headers = [
    'Rank',
    'Roll Number',
    'Name',
    'Department',
    'Batch',
    'LeetCode Username',
    'Total Solved',
    'Easy',
    'Medium',
    'Hard',
    'Acceptance Rate (%)',
    'Contest Rating',
    'Active Streak (Days)',
    'Global Rank',
    'Email'
  ];

  // Sort students by totalSolved descending
  const sorted = [...students].sort((a, b) => b.totalSolved - a.totalSolved);

  const rows = sorted.map((s, idx) => [
    idx + 1,
    `"${s.rollNo}"`,
    `"${s.name}"`,
    `"${s.department}"`,
    `"${s.batch}"`,
    `"${s.leetcodeUsername}"`,
    s.totalSolved,
    s.easySolved,
    s.mediumSolved,
    s.hardSolved,
    s.acceptanceRate,
    s.contestRating,
    s.streakDays,
    s.ranking,
    `"${s.email}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `leetcode_student_rankings_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
