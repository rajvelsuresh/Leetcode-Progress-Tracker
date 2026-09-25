export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type UserRole = 'admin' | 'faculty';

export type FacultyStatus = 'pending' | 'approved' | 'rejected';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation?: string;
  department?: string;
  staffId?: string;
  avatarUrl?: string;
  facultyId?: string;
  status?: FacultyStatus;
}

export type AdminTab = 
  | 'addClass'
  | 'classMembers'
  | 'assigning'
  | 'facultyApprovals'
  | 'passwordReset'
  | 'classes'
  | 'students';

export type FacultyTab =
  | 'myClasses'
  | 'studentwise'
  | 'leaderboard'
  | 'submissions';

export type NavTab = 
  | 'addClass' 
  | 'classMembers' 
  | 'assigning' 
  | 'facultyApprovals'
  | 'passwordReset'
  | 'myClasses'
  | 'leaderboard' 
  | 'statistics' 
  | 'submissions' 
  | 'studentwise' 
  | 'classes' 
  | 'faculties' 
  | 'students';

export type SubmissionStatus = 
  | 'Accepted' 
  | 'Wrong Answer' 
  | 'Time Limit Exceeded' 
  | 'Runtime Error' 
  | 'Compile Error'
  | 'Memory Limit Exceeded';

export interface Badge {
  id: string;
  displayName: string;
  icon?: string;
}

export interface Submission {
  _id?: string;
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  className?: string;
  section?: string;
  leetcodeUsername: string;
  title: string;
  titleSlug: string;
  difficulty: Difficulty;
  status: SubmissionStatus;
  lang: string;
  timestamp: number; // ms
  formattedDate?: string; // Exact readable timestamp e.g. "2026-09-22 09:42:15"
  runtime?: string;
  memory?: string;
  topicTags?: string[];
}

export interface Student {
  _id?: string;
  id: string;
  name: string;
  rollNo: string;
  email: string;
  department: string;
  batch: string;
  classId?: string; // Reference to ClassGroup
  className?: string; // e.g. "CSE - Section A"
  section?: string; // e.g. "A"
  facultyAdvisorId?: string; // Reference to Faculty
  facultyAdvisorName?: string;
  leetcodeUsername: string;
  avatarUrl?: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number; // percentage e.g. 68.4
  ranking: number;
  contestRating: number;
  attendedContests: number;
  streakDays: number;
  lastActive: number; // ms timestamp
  badges: Badge[];
  skillTags: string[];
  weeklyGoal: number;
  weeklySolved: number;
  recentSubmissions: Submission[]; // Up to 40 recent submissions with status and timestamps
  isSyncing?: boolean;
  syncError?: string;
  lastSyncedAt?: number;
}

export interface Faculty {
  _id?: string;
  id: string;
  staffId: string;
  name: string;
  designation: string; // e.g. "Associate Professor", "Assistant Professor", "Head of Department"
  department: string;
  email: string;
  password?: string;
  status?: FacultyStatus; // 'pending' | 'approved' | 'rejected'
  registeredAt?: number;
  approvedAt?: number;
  rejectionReason?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  lastPasswordReset?: number;
  phone?: string;
  avatarUrl?: string;
  assignedClassIds: string[]; // references to ClassGroup IDs
  assignedClassNames?: string[];
  mentoredStudentCount?: number;
}

export interface ClassGroup {
  _id?: string;
  id: string;
  name: string; // e.g. "CSE - Section A"
  code: string; // e.g. "CSE-A-2026"
  department: string;
  section: string; // "A", "B", "C"
  batch: string; // e.g. "2022-2026"
  facultyAdvisorId?: string;
  facultyAdvisorName?: string;
  targetSolvedAverage: number;
  studentCount?: number;
  totalSolved?: number;
  averageSolved?: number;
}

export type SortField = 'rank' | 'totalSolved' | 'contestRating' | 'hardSolved' | 'mediumSolved' | 'streak' | 'lastActive';
export type SortDirection = 'asc' | 'desc';

export interface LeaderboardFilters {
  searchQuery: string;
  department: string;
  batch: string;
  classId: string;
  difficultyFocus: 'all' | 'easy' | 'medium' | 'hard';
  minSolved: number;
  streakOnly: boolean;
  sortBy: SortField;
  sortDirection: SortDirection;
}

export interface CohortStats {
  totalStudents: number;
  totalSolved: number;
  averageSolved: number;
  totalEasy: number;
  totalMedium: number;
  totalHard: number;
  activeTodayCount: number;
  topContestRating: number;
  averageContestRating: number;
  avgAcceptanceRate: number;
  totalFaculties?: number;
  totalClasses?: number;
}
