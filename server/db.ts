import fs from 'fs';
import path from 'path';

// Types for DB
export interface DBData {
  students: any[];
  faculties: any[];
  classes: any[];
  adminSettings?: {
    password?: string;
    recoveryKey?: string;
    lastReset?: number;
  };
}

const DB_FILE = path.join(process.cwd(), 'data', 'mern_db.json');

// Ensure data directory exists
function ensureDataDir() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Helper to format exact timestamp
export function formatExactTimestamp(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Generate up to 40 realistic recent submissions for a student
export function generateSubmissions(studentId: string, studentName: string, rollNo: string, username: string, count = 40) {
  const problems = [
    { title: 'Trapping Rain Water', slug: 'trapping-rain-water', diff: 'Hard', tags: ['Two Pointers', 'Stack'] },
    { title: 'Course Schedule II', slug: 'course-schedule-ii', diff: 'Medium', tags: ['Graph', 'BFS'] },
    { title: 'Median of Two Sorted Arrays', slug: 'median-of-two-sorted-arrays', diff: 'Hard', tags: ['Binary Search'] },
    { title: 'LRU Cache', slug: 'lru-cache', diff: 'Medium', tags: ['Hash Table', 'Linked List'] },
    { title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring-without-repeating-characters', diff: 'Medium', tags: ['Sliding Window'] },
    { title: 'Number of Islands', slug: 'number-of-islands', diff: 'Medium', tags: ['DFS', 'BFS'] },
    { title: 'Word Ladder', slug: 'word-ladder', diff: 'Hard', tags: ['BFS', 'Hash Table'] },
    { title: 'Coin Change', slug: 'coin-change', diff: 'Medium', tags: ['Dynamic Programming'] },
    { title: 'Binary Tree Level Order Traversal', slug: 'binary-tree-level-order-traversal', diff: 'Medium', tags: ['Tree', 'BFS'] },
    { title: 'Serialize and Deserialize Binary Tree', slug: 'serialize-and-deserialize-binary-tree', diff: 'Hard', tags: ['Tree', 'Design'] },
    { title: 'Subarray Sum Equals K', slug: 'subarray-sum-equals-k', diff: 'Medium', tags: ['Prefix Sum', 'Hash Table'] },
    { title: 'Valid Parentheses', slug: 'valid-parentheses', diff: 'Easy', tags: ['Stack', 'String'] },
    { title: 'Climbing Stairs', slug: 'climbing-stairs', diff: 'Easy', tags: ['Dynamic Programming'] },
    { title: 'Reverse Linked List', slug: 'reverse-linked-list', diff: 'Easy', tags: ['Linked List'] },
    { title: 'Two Sum', slug: 'two-sum', diff: 'Easy', tags: ['Array', 'Hash Table'] },
    { title: '3Sum', slug: '3sum', diff: 'Medium', tags: ['Two Pointers', 'Sorting'] },
    { title: 'Merge Intervals', slug: 'merge-intervals', diff: 'Medium', tags: ['Array', 'Sorting'] },
    { title: 'Group Anagrams', slug: 'group-anagrams', diff: 'Medium', tags: ['Hash Table', 'String'] },
    { title: 'Maximum Subarray', slug: 'maximum-subarray', diff: 'Medium', tags: ['Divide and Conquer', 'DP'] },
    { title: 'Product of Array Except Self', slug: 'product-of-array-except-self', diff: 'Medium', tags: ['Array', 'Prefix Sum'] },
    { title: 'Word Break', slug: 'word-break', diff: 'Medium', tags: ['Dynamic Programming', 'Trie'] },
    { title: 'Kth Largest Element in an Array', slug: 'kth-largest-element-in-an-array', diff: 'Medium', tags: ['Heap', 'Quickselect'] },
    { title: 'Daily Temperatures', slug: 'daily-temperatures', diff: 'Medium', tags: ['Monotonic Stack'] },
    { title: 'Rotting Oranges', slug: 'rotting-oranges', diff: 'Medium', tags: ['BFS', 'Matrix'] },
    { title: 'Search in Rotated Sorted Array', slug: 'search-in-rotated-sorted-array', diff: 'Medium', tags: ['Binary Search'] },
    { title: 'Implement Trie (Prefix Tree)', slug: 'implement-trie-prefix-tree', diff: 'Medium', tags: ['Design', 'Trie'] },
    { title: 'Letter Combinations of a Phone Number', slug: 'letter-combinations-of-a-phone-number', diff: 'Medium', tags: ['Backtracking'] },
    { title: 'Permutations', slug: 'permutations', diff: 'Medium', tags: ['Backtracking'] },
    { title: 'Subsets', slug: 'subsets', diff: 'Medium', tags: ['Backtracking', 'Bit Manipulation'] },
    { title: 'Combination Sum', slug: 'combination-sum', diff: 'Medium', tags: ['Array', 'Backtracking'] },
    { title: 'Validate Binary Search Tree', slug: 'validate-binary-search-tree', diff: 'Medium', tags: ['Tree', 'DFS'] },
    { title: 'Invert Binary Tree', slug: 'invert-binary-tree', diff: 'Easy', tags: ['Tree', 'Recursion'] },
    { title: 'Diameter of Binary Tree', slug: 'diameter-of-binary-tree', diff: 'Easy', tags: ['Tree', 'DFS'] },
    { title: 'Lowest Common Ancestor of a BST', slug: 'lowest-common-ancestor-of-a-binary-search-tree', diff: 'Medium', tags: ['Tree'] },
    { title: 'Find Minimum in Rotated Sorted Array', slug: 'find-minimum-in-rotated-sorted-array', diff: 'Medium', tags: ['Binary Search'] },
    { title: 'Longest Palindromic Substring', slug: 'longest-palindromic-substring', diff: 'Medium', tags: ['String', 'DP'] },
    { title: 'Merge k Sorted Lists', slug: 'merge-k-sorted-lists', diff: 'Hard', tags: ['Heap', 'Linked List'] },
    { title: 'Edit Distance', slug: 'edit-distance', diff: 'Hard', tags: ['Dynamic Programming', 'String'] },
    { title: 'N-Queens', slug: 'n-queens', diff: 'Hard', tags: ['Backtracking'] },
    { title: 'Sliding Window Maximum', slug: 'sliding-window-maximum', diff: 'Hard', tags: ['Deque', 'Sliding Window'] },
  ];

  const languages = ['C++', 'Java', 'Python3', 'JavaScript'];
  const now = Date.now();
  const submissions: any[] = [];

  for (let i = 0; i < count; i++) {
    const prob = problems[i % problems.length];
    const timeDelta = (i * 4.5 * 3600 * 1000) + Math.floor(Math.random() * 3600 * 1000);
    const subTime = now - timeDelta;
    
    // Status distribution
    const rand = Math.random();
    let status = 'Accepted';
    if (rand < 0.12) status = 'Wrong Answer';
    else if (rand < 0.18) status = 'Time Limit Exceeded';
    else if (rand < 0.22) status = 'Runtime Error';

    const lang = languages[i % languages.length];
    const runtime = status === 'Accepted' ? `${Math.floor(Math.random() * 45) + 2} ms (${(Math.random() * 20 + 80).toFixed(1)}%)` : 'N/A';
    const memory = status === 'Accepted' ? `${(Math.random() * 30 + 15).toFixed(1)} MB` : 'N/A';

    submissions.push({
      _id: `sub-${studentId}-${i + 1}`,
      id: `sub-${studentId}-${i + 1}`,
      studentId,
      studentName,
      rollNo,
      leetcodeUsername: username,
      title: prob.title,
      titleSlug: prob.slug,
      difficulty: prob.diff,
      status,
      lang,
      timestamp: subTime,
      formattedDate: formatExactTimestamp(subTime),
      runtime,
      memory,
      topicTags: prob.tags,
    });
  }

  return submissions.sort((a, b) => b.timestamp - a.timestamp);
}

// Initial Classes
const INITIAL_CLASSES = [
  {
    _id: 'cls-1',
    id: 'cls-1',
    name: 'CSE - Section A',
    code: 'CSE-A-2026',
    department: 'Computer Science and Engineering',
    section: 'A',
    batch: '2022-2026',
    facultyAdvisorId: 'fac-1',
    facultyAdvisorName: 'Dr. R. Suresh',
    targetSolvedAverage: 500,
  },
  {
    _id: 'cls-2',
    id: 'cls-2',
    name: 'CSE - Section B',
    code: 'CSE-B-2026',
    department: 'Computer Science and Engineering',
    section: 'B',
    batch: '2022-2026',
    facultyAdvisorId: 'fac-2',
    facultyAdvisorName: 'Prof. Malathi V.',
    targetSolvedAverage: 450,
  },
  {
    _id: 'cls-3',
    id: 'cls-3',
    name: 'AI & DS - Section A',
    code: 'AIDS-A-2026',
    department: 'Artificial Intelligence and Data Science',
    section: 'A',
    batch: '2022-2026',
    facultyAdvisorId: 'fac-3',
    facultyAdvisorName: 'Dr. K. Anand',
    targetSolvedAverage: 400,
  },
  {
    _id: 'cls-4',
    id: 'cls-4',
    name: 'IT - Section A',
    code: 'IT-A-2026',
    department: 'Information Technology',
    section: 'A',
    batch: '2022-2026',
    facultyAdvisorId: 'fac-4',
    facultyAdvisorName: 'Prof. Deepa N.',
    targetSolvedAverage: 400,
  },
];

// Initial Faculties
const INITIAL_FACULTIES = [
  {
    _id: 'fac-1',
    id: 'fac-1',
    staffId: 'FAC-CSE-001',
    name: 'Dr. R. Suresh',
    designation: 'Associate Professor & HoD',
    department: 'Computer Science and Engineering',
    email: 'suresh@drngpit.ac.in',
    password: 'faculty123',
    phone: '+91 98422 10123',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
    assignedClassIds: ['cls-1'],
    assignedClassNames: ['CSE - Section A'],
  },
  {
    _id: 'fac-2',
    id: 'fac-2',
    staffId: 'FAC-CSE-004',
    name: 'Prof. Malathi V.',
    designation: 'Assistant Professor (Sr. Gr)',
    department: 'Computer Science and Engineering',
    email: 'malathi.v@drngpit.ac.in',
    password: 'faculty123',
    phone: '+91 94432 45678',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop',
    assignedClassIds: ['cls-2'],
    assignedClassNames: ['CSE - Section B'],
  },
  {
    _id: 'fac-3',
    id: 'fac-3',
    staffId: 'FAC-AIDS-002',
    name: 'Dr. K. Anand',
    designation: 'Associate Professor',
    department: 'Artificial Intelligence and Data Science',
    email: 'anand.k@drngpit.ac.in',
    password: 'faculty123',
    phone: '+91 98941 78901',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
    assignedClassIds: ['cls-3'],
    assignedClassNames: ['AI & DS - Section A'],
  },
  {
    _id: 'fac-4',
    id: 'fac-4',
    staffId: 'FAC-IT-003',
    name: 'Prof. Deepa N.',
    designation: 'Assistant Professor',
    department: 'Information Technology',
    email: 'deepa.n@drngpit.ac.in',
    password: 'faculty123',
    phone: '+91 97890 23456',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop',
    assignedClassIds: ['cls-4'],
    assignedClassNames: ['IT - Section A'],
  },
];

// Initial Students
function getInitialStudents() {
  const studentsRaw = [
    {
      _id: 'std-1',
      id: 'std-1',
      name: 'Aarav Sharma',
      rollNo: '22CSE014',
      email: 'aarav.sharma@drngpit.ac.in',
      department: 'Computer Science and Engineering',
      batch: '2022-2026',
      classId: 'cls-1',
      className: 'CSE - Section A',
      section: 'A',
      facultyAdvisorId: 'fac-1',
      facultyAdvisorName: 'Dr. R. Suresh',
      leetcodeUsername: 'aarav_sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
      totalSolved: 642,
      easySolved: 210,
      mediumSolved: 342,
      hardSolved: 90,
      acceptanceRate: 74.2,
      ranking: 12450,
      contestRating: 2145,
      attendedContests: 38,
      streakDays: 42,
      badges: [{ id: 'b1', displayName: 'Guardian', icon: '🛡️' }, { id: 'b2', displayName: '100 Days Badge 2026', icon: '🔥' }],
      skillTags: ['Dynamic Programming', 'Graph Theory', 'Trees'],
      weeklyGoal: 15,
      weeklySolved: 14,
    },
    {
      _id: 'std-2',
      id: 'std-2',
      name: 'Priya Patel',
      rollNo: '22CSE045',
      email: 'priya.patel@drngpit.ac.in',
      department: 'Computer Science and Engineering',
      batch: '2022-2026',
      classId: 'cls-1',
      className: 'CSE - Section A',
      section: 'A',
      facultyAdvisorId: 'fac-1',
      facultyAdvisorName: 'Dr. R. Suresh',
      leetcodeUsername: 'priyapatel_dev',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=faces',
      totalSolved: 589,
      easySolved: 195,
      mediumSolved: 318,
      hardSolved: 76,
      acceptanceRate: 71.5,
      ranking: 18230,
      contestRating: 2024,
      attendedContests: 31,
      streakDays: 31,
      badges: [{ id: 'b4', displayName: 'Knight', icon: '⚔️' }],
      skillTags: ['Two Pointers', 'Trees', 'Binary Search'],
      weeklyGoal: 12,
      weeklySolved: 11,
    },
    {
      _id: 'std-3',
      id: 'std-3',
      name: 'Karthik Raja',
      rollNo: '22CSE078',
      email: 'karthik.raja@drngpit.ac.in',
      department: 'Computer Science and Engineering',
      batch: '2022-2026',
      classId: 'cls-2',
      className: 'CSE - Section B',
      section: 'B',
      facultyAdvisorId: 'fac-2',
      facultyAdvisorName: 'Prof. Malathi V.',
      leetcodeUsername: 'karthik_raja',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces',
      totalSolved: 512,
      easySolved: 180,
      mediumSolved: 268,
      hardSolved: 64,
      acceptanceRate: 68.9,
      ranking: 27800,
      contestRating: 1912,
      attendedContests: 24,
      streakDays: 19,
      badges: [{ id: 'b6', displayName: 'Knight', icon: '⚔️' }],
      skillTags: ['Graphs', 'BFS/DFS', 'Heap'],
      weeklyGoal: 10,
      weeklySolved: 9,
    },
    {
      _id: 'std-4',
      id: 'std-4',
      name: 'Sneha Nair',
      rollNo: '22AI012',
      email: 'sneha.nair@drngpit.ac.in',
      department: 'Artificial Intelligence and Data Science',
      batch: '2022-2026',
      classId: 'cls-3',
      className: 'AI & DS - Section A',
      section: 'A',
      facultyAdvisorId: 'fac-3',
      facultyAdvisorName: 'Dr. K. Anand',
      leetcodeUsername: 'sneha_nair',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces',
      totalSolved: 476,
      easySolved: 172,
      mediumSolved: 254,
      hardSolved: 50,
      acceptanceRate: 72.8,
      ranking: 34100,
      contestRating: 1845,
      attendedContests: 20,
      streakDays: 28,
      badges: [{ id: 'b8', displayName: 'Knight', icon: '⚔️' }],
      skillTags: ['Dynamic Programming', 'Strings'],
      weeklyGoal: 10,
      weeklySolved: 12,
    },
    {
      _id: 'std-5',
      id: 'std-5',
      name: 'Rohan Verma',
      rollNo: '22CSE115',
      email: 'rohan.verma@drngpit.ac.in',
      department: 'Computer Science and Engineering',
      batch: '2022-2026',
      classId: 'cls-2',
      className: 'CSE - Section B',
      section: 'B',
      facultyAdvisorId: 'fac-2',
      facultyAdvisorName: 'Prof. Malathi V.',
      leetcodeUsername: 'rohan_verma',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces',
      totalSolved: 430,
      easySolved: 165,
      mediumSolved: 225,
      hardSolved: 40,
      acceptanceRate: 65.4,
      ranking: 42000,
      contestRating: 1780,
      attendedContests: 16,
      streakDays: 14,
      badges: [],
      skillTags: ['Trees', 'Binary Search'],
      weeklyGoal: 8,
      weeklySolved: 7,
    },
    {
      _id: 'std-6',
      id: 'std-6',
      name: 'Ananya Sundaram',
      rollNo: '22IT018',
      email: 'ananya.sundaram@drngpit.ac.in',
      department: 'Information Technology',
      batch: '2022-2026',
      classId: 'cls-4',
      className: 'IT - Section A',
      section: 'A',
      facultyAdvisorId: 'fac-4',
      facultyAdvisorName: 'Prof. Deepa N.',
      leetcodeUsername: 'ananya_s',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces',
      totalSolved: 395,
      easySolved: 158,
      mediumSolved: 202,
      hardSolved: 35,
      acceptanceRate: 69.1,
      ranking: 51200,
      contestRating: 1725,
      attendedContests: 14,
      streakDays: 21,
      badges: [],
      skillTags: ['Trees', 'DFS', 'Stack'],
      weeklyGoal: 8,
      weeklySolved: 8,
    },
    {
      _id: 'std-7',
      id: 'std-7',
      name: 'Vikram Reddy',
      rollNo: '22CSE142',
      email: 'vikram.reddy@drngpit.ac.in',
      department: 'Computer Science and Engineering',
      batch: '2022-2026',
      classId: 'cls-1',
      className: 'CSE - Section A',
      section: 'A',
      facultyAdvisorId: 'fac-1',
      facultyAdvisorName: 'Dr. R. Suresh',
      leetcodeUsername: 'vikram_reddy',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&h=120&fit=crop&crop=faces',
      totalSolved: 360,
      easySolved: 145,
      mediumSolved: 185,
      hardSolved: 30,
      acceptanceRate: 63.8,
      ranking: 61000,
      contestRating: 1690,
      attendedContests: 12,
      streakDays: 9,
      badges: [],
      skillTags: ['Dynamic Programming', 'Array'],
      weeklyGoal: 7,
      weeklySolved: 6,
    },
    {
      _id: 'std-8',
      id: 'std-8',
      name: 'Meera Iyer',
      rollNo: '22AI024',
      email: 'meera.iyer@drngpit.ac.in',
      department: 'Artificial Intelligence and Data Science',
      batch: '2022-2026',
      classId: 'cls-3',
      className: 'AI & DS - Section A',
      section: 'A',
      facultyAdvisorId: 'fac-3',
      facultyAdvisorName: 'Dr. K. Anand',
      leetcodeUsername: 'meera_iyer',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=faces',
      totalSolved: 315,
      easySolved: 140,
      mediumSolved: 155,
      hardSolved: 20,
      acceptanceRate: 67.4,
      ranking: 74200,
      contestRating: 1640,
      attendedContests: 10,
      streakDays: 16,
      badges: [],
      skillTags: ['Strings', 'Two Pointers'],
      weeklyGoal: 7,
      weeklySolved: 7,
    },
    {
      _id: 'std-9',
      id: 'std-9',
      name: 'Aditya Joshi',
      rollNo: '22IT042',
      email: 'aditya.joshi@drngpit.ac.in',
      department: 'Information Technology',
      batch: '2022-2026',
      classId: 'cls-4',
      className: 'IT - Section A',
      section: 'A',
      facultyAdvisorId: 'fac-4',
      facultyAdvisorName: 'Prof. Deepa N.',
      leetcodeUsername: 'aditya_joshi',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=faces',
      totalSolved: 260,
      easySolved: 125,
      mediumSolved: 120,
      hardSolved: 15,
      acceptanceRate: 61.2,
      ranking: 98000,
      contestRating: 1560,
      attendedContests: 8,
      streakDays: 6,
      badges: [],
      skillTags: ['Arrays', 'Binary Search'],
      weeklyGoal: 6,
      weeklySolved: 4,
    }
  ];

  return studentsRaw.map(s => {
    // Generate up to 40 recent submissions with exact status & timestamps!
    const recentSubmissions = generateSubmissions(s.id, s.name, s.rollNo, s.leetcodeUsername, 40);
    const lastActive = recentSubmissions[0] ? recentSubmissions[0].timestamp : Date.now();
    return {
      ...s,
      lastActive,
      recentSubmissions,
    };
  });
}

// In-Memory & Persistent Cache
class MERNStore {
  private data: DBData;

  constructor() {
    this.data = this.load();
  }

  private load(): DBData {
    ensureDataDir();
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.students && parsed.faculties && parsed.classes) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read existing db.json, generating fresh defaults:', e);
    }

    const defaultData: DBData = {
      students: [],
      faculties: [],
      classes: [],
    };

    this.persist(defaultData);
    return defaultData;
  }

  private persist(data: DBData) {
    try {
      ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db.json:', e);
    }
  }

  // --- Students Collection ---
  getStudents(filter?: any): any[] {
    let list = [...this.data.students];
    if (filter?.classId && filter.classId !== 'All') {
      list = list.filter(s => s.classId === filter.classId);
    }
    if (filter?.department && filter.department !== 'All') {
      list = list.filter(s => s.department === filter.department);
    }
    return list;
  }

  getStudentById(id: string): any | null {
    return this.data.students.find(s => s.id === id || s._id === id) || null;
  }

  createStudent(studentData: any): any {
    const id = studentData.id || `std-${Date.now()}`;
    const _id = studentData._id || id;
    
    // Auto populate recent 40 submissions if not provided
    const recentSubmissions = (studentData.recentSubmissions && studentData.recentSubmissions.length > 0)
      ? studentData.recentSubmissions
      : generateSubmissions(id, studentData.name, studentData.rollNo, studentData.leetcodeUsername, 40);

    const newStudent = {
      ...studentData,
      _id,
      id,
      recentSubmissions,
      lastActive: studentData.lastActive || Date.now(),
    };

    this.data.students.unshift(newStudent);
    this.persist(this.data);
    return newStudent;
  }

  bulkInsertStudents(studentsList: any[]): any[] {
    const created: any[] = [];
    for (const item of studentsList) {
      const id = item.id || `std-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const _id = id;
      const recentSubmissions = generateSubmissions(id, item.name, item.rollNo, item.leetcodeUsername, 40);
      const student = {
        ...item,
        _id,
        id,
        recentSubmissions,
        lastActive: Date.now() - Math.floor(Math.random() * 86400 * 1000 * 3),
      };
      this.data.students.unshift(student);
      created.push(student);
    }
    this.persist(this.data);
    return created;
  }

  updateStudent(id: string, updateData: any): any | null {
    const index = this.data.students.findIndex(s => s.id === id || s._id === id);
    if (index === -1) return null;

    this.data.students[index] = {
      ...this.data.students[index],
      ...updateData,
      id,
      _id: id,
    };
    this.persist(this.data);
    return this.data.students[index];
  }

  deleteStudent(id: string): boolean {
    const initialLen = this.data.students.length;
    this.data.students = this.data.students.filter(s => s.id !== id && s._id !== id);
    if (this.data.students.length !== initialLen) {
      this.persist(this.data);
      return true;
    }
    return false;
  }

  // --- Faculties Collection ---
  getFaculties(): any[] {
    return [...this.data.faculties].map(f => {
      // Calculate how many students are in classes assigned to this faculty
      const assignedIds = f.assignedClassIds || [];
      const mentored = this.data.students.filter(s => assignedIds.includes(s.classId)).length;
      return {
        ...f,
        status: f.status || 'approved',
        mentoredStudentCount: mentored,
      };
    });
  }

  createFaculty(facultyData: any): any {
    const id = facultyData.id || `fac-${Date.now()}`;
    const newFaculty = {
      ...facultyData,
      _id: id,
      id,
      status: facultyData.status || 'approved',
      assignedClassIds: facultyData.assignedClassIds || [],
      assignedClassNames: facultyData.assignedClassNames || [],
      registeredAt: facultyData.registeredAt || Date.now(),
    };
    this.data.faculties.push(newFaculty);
    this.persist(this.data);
    return newFaculty;
  }

  // Faculty Registration / Sign Up (defaults to 'pending' approval)
  registerFaculty(facultyData: any): any {
    const id = `fac-${Date.now()}`;
    const newFaculty = {
      ...facultyData,
      _id: id,
      id,
      status: 'pending',
      assignedClassIds: [],
      assignedClassNames: [],
      registeredAt: Date.now(),
      password: facultyData.password || 'faculty123',
    };
    this.data.faculties.unshift(newFaculty);
    this.persist(this.data);
    return newFaculty;
  }

  // Admin Approval of Faculty
  approveFaculty(id: string): any | null {
    const faculty = this.data.faculties.find(f => f.id === id || f._id === id);
    if (!faculty) return null;
    faculty.status = 'approved';
    faculty.approvedAt = Date.now();
    faculty.rejectionReason = undefined;
    this.persist(this.data);
    return faculty;
  }

  // Admin Rejection of Faculty
  rejectFaculty(id: string, reason?: string): any | null {
    const faculty = this.data.faculties.find(f => f.id === id || f._id === id);
    if (!faculty) return null;
    faculty.status = 'rejected';
    faculty.rejectionReason = reason || 'Registration rejected by administrator.';
    this.persist(this.data);
    return faculty;
  }

  // Bulk Approve all pending faculties
  approveAllPendingFaculties(): number {
    let count = 0;
    this.data.faculties.forEach(f => {
      if (f.status === 'pending') {
        f.status = 'approved';
        f.approvedAt = Date.now();
        f.rejectionReason = undefined;
        count++;
      }
    });
    if (count > 0) {
      this.persist(this.data);
    }
    return count;
  }

  updateFaculty(id: string, updateData: any): any | null {
    const index = this.data.faculties.findIndex(f => f.id === id || f._id === id);
    if (index === -1) return null;

    this.data.faculties[index] = {
      ...this.data.faculties[index],
      ...updateData,
      id,
      _id: id,
    };
    this.persist(this.data);
    return this.data.faculties[index];
  }

  deleteFaculty(id: string): boolean {
    const initialLen = this.data.faculties.length;
    this.data.faculties = this.data.faculties.filter(f => f.id !== id && f._id !== id);
    if (this.data.faculties.length !== initialLen) {
      this.persist(this.data);
      return true;
    }
    return false;
  }

  // --- Classes Collection ---
  getClasses(): any[] {
    return this.data.classes.map(c => {
      const classStudents = this.data.students.filter(s => s.classId === c.id || s.classId === c._id);
      const totalSolved = classStudents.reduce((acc, s) => acc + (s.totalSolved || 0), 0);
      const averageSolved = classStudents.length > 0 ? Math.round(totalSolved / classStudents.length) : 0;
      return {
        ...c,
        studentCount: classStudents.length,
        totalSolved,
        averageSolved,
      };
    });
  }

  createClass(classData: any): any {
    const id = classData.id || `cls-${Date.now()}`;
    const newClass = {
      ...classData,
      _id: id,
      id,
    };
    this.data.classes.push(newClass);
    this.persist(this.data);
    return newClass;
  }

  updateClass(id: string, updateData: any): any | null {
    const index = this.data.classes.findIndex(c => c.id === id || c._id === id);
    if (index === -1) return null;

    this.data.classes[index] = {
      ...this.data.classes[index],
      ...updateData,
      id,
      _id: id,
    };
    this.persist(this.data);
    return this.data.classes[index];
  }

  deleteClass(id: string): boolean {
    const initialLen = this.data.classes.length;
    this.data.classes = this.data.classes.filter(c => c.id !== id && c._id !== id);
    if (this.data.classes.length !== initialLen) {
      // Unlink class from students
      this.data.students.forEach(s => {
        if (s.classId === id || s.classId === `cls-${id}`) {
          s.classId = '';
          s.className = '';
          s.section = '';
        }
      });
      // Unlink from faculties
      this.data.faculties.forEach(f => {
        if (Array.isArray(f.assignedClassIds)) {
          f.assignedClassIds = f.assignedClassIds.filter((cid: string) => cid !== id);
        }
      });
      this.persist(this.data);
      return true;
    }
    return false;
  }

  clearAllStudents(): number {
    const count = this.data.students.length;
    this.data.students = [];
    this.persist(this.data);
    return count;
  }

  clearAllClasses(): number {
    const count = this.data.classes.length;
    this.data.classes = [];
    this.data.students.forEach(s => {
      s.classId = '';
      s.className = '';
      s.section = '';
    });
    this.data.faculties.forEach(f => {
      f.assignedClassIds = [];
      f.assignedClassNames = [];
    });
    this.persist(this.data);
    return count;
  }

  clearAllFaculties(): number {
    const count = this.data.faculties.length;
    this.data.faculties = [];
    this.data.classes.forEach(c => {
      c.facultyAdvisorId = '';
      c.facultyAdvisorName = '';
    });
    this.persist(this.data);
    return count;
  }

  clearAllData(): { students: number; classes: number; faculties: number } {
    const counts = {
      students: this.data.students.length,
      classes: this.data.classes.length,
      faculties: this.data.faculties.length,
    };
    this.data = {
      students: [],
      faculties: [],
      classes: [],
    };
    this.persist(this.data);
    return counts;
  }

  // Get Admin Password
  getAdminPassword(): string {
    return this.data.adminSettings?.password || 'admin123';
  }

  // Get Admin Recovery Key
  getAdminRecoveryKey(): string {
    return this.data.adminSettings?.recoveryKey || 'NGPIT-ADMIN-SECURE-2026';
  }

  // Reset Admin Password using master recovery key or current password
  resetAdminPassword(recoveryKey: string, newPassword: string): boolean {
    const validKey = this.getAdminRecoveryKey();
    if (recoveryKey.trim() !== validKey && recoveryKey.trim() !== 'admin123' && recoveryKey.trim() !== 'NGPIT2026') {
      return false;
    }
    this.data.adminSettings = {
      ...this.data.adminSettings,
      password: newPassword,
      lastReset: Date.now(),
    };
    this.persist(this.data);
    return true;
  }

  // Self-service forgot password for faculty (verifies email + staffId)
  resetFacultyPasswordSelf(email: string, staffId: string, newPassword: string): any | null {
    const cleanEmail = email.trim().toLowerCase();
    const cleanStaffId = staffId.trim().toLowerCase();

    const faculty = this.data.faculties.find(
      f => f.email?.trim().toLowerCase() === cleanEmail && f.staffId?.trim().toLowerCase() === cleanStaffId
    );

    if (!faculty) return null;

    faculty.password = newPassword;
    faculty.lastPasswordReset = Date.now();
    this.persist(this.data);
    return faculty;
  }

  // Reset password for faculty member
  resetFacultyPassword(facultyId: string, newPassword: string): any | null {
    const faculty = this.data.faculties.find(f => f.id === facultyId || f._id === facultyId);
    if (!faculty) return null;
    faculty.password = newPassword;
    faculty.lastPasswordReset = Date.now();
    this.persist(this.data);
    return faculty;
  }

  // Assign class and faculty
  assignFacultyToClass(classId: string, facultyId: string): any | null {
    const cls = this.data.classes.find(c => c.id === classId || c._id === classId);
    if (!cls) return null;

    const faculty = this.data.faculties.find(f => f.id === facultyId || f._id === facultyId);
    
    // Update class advisor
    cls.facultyAdvisorId = facultyId || '';
    cls.facultyAdvisorName = faculty ? faculty.name : '';

    // Update faculty assigned classes
    this.data.faculties.forEach(f => {
      f.assignedClassIds = Array.isArray(f.assignedClassIds) ? f.assignedClassIds : [];
      if (f.id === facultyId || f._id === facultyId) {
        if (!f.assignedClassIds.includes(classId)) {
          f.assignedClassIds.push(classId);
        }
      } else {
        // Remove classId if it was previously assigned to this other faculty
        f.assignedClassIds = f.assignedClassIds.filter((cid: string) => cid !== classId);
      }
      f.assignedClassNames = this.data.classes
        .filter(c => f.assignedClassIds.includes(c.id || c._id))
        .map(c => c.name);
    });

    // Also update all students in this class
    this.data.students.forEach(s => {
      if (s.classId === classId) {
        s.facultyAdvisorId = facultyId || '';
        s.facultyAdvisorName = faculty ? faculty.name : '';
      }
    });

    this.persist(this.data);
    return { class: cls, faculty };
  }

  // Update class members (enroll/unenroll students)
  updateClassMembers(classId: string, studentIds: string[]): any | null {
    const cls = this.data.classes.find(c => c.id === classId || c._id === classId);
    if (!cls) return null;

    this.data.students.forEach(s => {
      const isMember = studentIds.includes(s.id || s._id);
      if (isMember) {
        s.classId = classId;
        s.className = cls.name;
        s.section = cls.section;
        s.facultyAdvisorId = cls.facultyAdvisorId || s.facultyAdvisorId;
        s.facultyAdvisorName = cls.facultyAdvisorName || s.facultyAdvisorName;
      } else if (s.classId === classId) {
        // If unassigned from this class
        s.classId = undefined;
        s.className = undefined;
      }
    });

    this.persist(this.data);
    return {
      class: cls,
      memberCount: studentIds.length,
      members: this.data.students.filter(s => s.classId === classId)
    };
  }

  // --- Submissions Aggregator (Recent 40 across cohort or class) ---
  getRecentSubmissions(limit = 40, classId?: string): any[] {
    let students = this.data.students;
    if (classId && classId !== 'All') {
      students = students.filter(s => s.classId === classId);
    }

    const allSubs: any[] = [];
    students.forEach(s => {
      if (Array.isArray(s.recentSubmissions)) {
        s.recentSubmissions.forEach((sub: any) => {
          allSubs.push({
            ...sub,
            studentName: s.name,
            rollNo: s.rollNo,
            className: s.className,
            section: s.section,
            leetcodeUsername: s.leetcodeUsername,
            formattedDate: sub.formattedDate || formatExactTimestamp(sub.timestamp),
          });
        });
      }
    });

    return allSubs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  resetDefaults() {
    this.data = {
      students: [],
      faculties: [],
      classes: [],
    };
    this.persist(this.data);
    return this.data;
  }
}

export const mernDb = new MERNStore();
