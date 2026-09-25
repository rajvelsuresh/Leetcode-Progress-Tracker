import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ExternalLink, 
  Search, 
  Filter, 
  User, 
  GraduationCap, 
  Building2, 
  Trophy, 
  Flame, 
  RefreshCw, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  ArrowUpDown,
  BookOpen
} from 'lucide-react';
import { Student, Submission, ClassGroup, Faculty, Difficulty, SubmissionStatus } from '../types';
import { formatTimeAgo, formatExactTimestamp } from '../utils/storage';

interface StudentwiseSubmissionsProps {
  students: Student[];
  classes?: ClassGroup[];
  faculties?: Faculty[];
  onSelectStudentModal?: (student: Student) => void;
  onSyncStudent: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
  initialSelectedStudentId?: string;
}

export const StudentwiseSubmissions: React.FC<StudentwiseSubmissionsProps> = ({
  students,
  classes = [],
  faculties = [],
  onSelectStudentModal,
  onSyncStudent,
  onEditStudent,
  initialSelectedStudentId,
}) => {
  // Currently selected student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (initialSelectedStudentId) return initialSelectedStudentId;
    return students.length > 0 ? (students[0].id || students[0]._id || '') : '';
  });

  // Selector filters
  const [classFilter, setClassFilter] = useState<string>('All');
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Submission filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [langFilter, setLangFilter] = useState<string>('All');
  const [problemSearch, setProblemSearch] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filtered list of students for selection
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      if (classFilter !== 'All' && student.classId !== classFilter && student.className !== classFilter) {
        return false;
      }
      if (studentSearch.trim()) {
        const q = studentSearch.toLowerCase();
        const matchName = student.name.toLowerCase().includes(q);
        const matchRoll = student.rollNo.toLowerCase().includes(q);
        const matchUser = student.leetcodeUsername.toLowerCase().includes(q);
        if (!matchName && !matchRoll && !matchUser) return false;
      }
      return true;
    });
  }, [students, classFilter, studentSearch]);

  // Current selected student object
  const currentStudent = useMemo(() => {
    const found = students.find(s => s.id === selectedStudentId || s._id === selectedStudentId);
    return found || students[0] || null;
  }, [students, selectedStudentId]);

  // Current student index in filtered list for navigation
  const currentIndex = useMemo(() => {
    if (!currentStudent) return -1;
    return filteredStudents.findIndex(s => s.id === currentStudent.id || s._id === currentStudent._id);
  }, [filteredStudents, currentStudent]);

  // Navigate to previous student
  const handlePrevStudent = () => {
    if (currentIndex > 0) {
      const prev = filteredStudents[currentIndex - 1];
      setSelectedStudentId(prev.id || prev._id || '');
    }
  };

  // Navigate to next student
  const handleNextStudent = () => {
    if (currentIndex < filteredStudents.length - 1) {
      const next = filteredStudents[currentIndex + 1];
      setSelectedStudentId(next.id || next._id || '');
    }
  };

  // Extract exactly up to 40 recent submissions for this student
  const rawSubmissions = useMemo(() => {
    if (!currentStudent) return [];
    const subs = currentStudent.recentSubmissions || [];
    // Sort descending by timestamp and slice top 40
    return [...subs].sort((a, b) => b.timestamp - a.timestamp).slice(0, 40);
  }, [currentStudent]);

  // Available languages for this student's 40 submissions
  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    rawSubmissions.forEach(s => {
      if (s.lang) set.add(s.lang);
    });
    return ['All', ...Array.from(set)];
  }, [rawSubmissions]);

  // Filtered & sorted submissions
  const filteredSubmissions = useMemo(() => {
    let list = rawSubmissions.filter(sub => {
      if (statusFilter !== 'All' && sub.status !== statusFilter) return false;
      if (difficultyFilter !== 'All' && sub.difficulty !== difficultyFilter) return false;
      if (langFilter !== 'All' && sub.lang !== langFilter) return false;
      if (problemSearch.trim()) {
        const q = problemSearch.toLowerCase();
        const matchesTitle = sub.title.toLowerCase().includes(q);
        const matchesTags = sub.topicTags?.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesTags) return false;
      }
      return true;
    });

    if (sortOrder === 'asc') {
      list.sort((a, b) => a.timestamp - b.timestamp);
    } else {
      list.sort((a, b) => b.timestamp - a.timestamp);
    }

    return list;
  }, [rawSubmissions, statusFilter, difficultyFilter, langFilter, problemSearch, sortOrder]);

  // Summary statistics for the individual 40 submissions
  const submissionsStats = useMemo(() => {
    const total = rawSubmissions.length;
    let accepted = 0;
    let wrongAnswer = 0;
    let timeLimit = 0;
    let runtimeError = 0;
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;
    const langCounts: Record<string, number> = {};

    rawSubmissions.forEach(sub => {
      if (sub.status === 'Accepted') accepted++;
      else if (sub.status === 'Wrong Answer') wrongAnswer++;
      else if (sub.status === 'Time Limit Exceeded') timeLimit++;
      else runtimeError++;

      if (sub.difficulty === 'Easy') easyCount++;
      else if (sub.difficulty === 'Medium') mediumCount++;
      else if (sub.difficulty === 'Hard') hardCount++;

      if (sub.lang) {
        langCounts[sub.lang] = (langCounts[sub.lang] || 0) + 1;
      }
    });

    const passRate = total > 0 ? ((accepted / total) * 100).toFixed(1) : '0';

    // Primary language
    let topLang = 'None';
    let topLangCount = 0;
    Object.entries(langCounts).forEach(([lang, count]) => {
      if (count > topLangCount) {
        topLangCount = count;
        topLang = lang;
      }
    });

    // Date range
    const newestTime = rawSubmissions[0]?.timestamp;
    const oldestTime = rawSubmissions[rawSubmissions.length - 1]?.timestamp;

    return {
      total,
      accepted,
      wrongAnswer,
      timeLimit,
      runtimeError,
      passRate,
      easyCount,
      mediumCount,
      hardCount,
      topLang,
      topLangCount,
      newestDate: newestTime ? formatExactTimestamp(newestTime) : 'N/A',
      oldestDate: oldestTime ? formatExactTimestamp(oldestTime) : 'N/A',
    };
  }, [rawSubmissions]);

  // Export individual student submissions as CSV
  const handleExportStudentCSV = () => {
    if (!currentStudent || rawSubmissions.length === 0) return;

    const headers = [
      'Submission Index',
      'Student Name',
      'Roll Number',
      'LeetCode Username',
      'Problem Title',
      'Difficulty',
      'Verdict Status',
      'Exact Timestamp',
      'Language',
      'Runtime',
      'Memory',
      'Topic Tags'
    ];

    const rows = rawSubmissions.map((sub, i) => [
      i + 1,
      `"${currentStudent.name.replace(/"/g, '""')}"`,
      `"${currentStudent.rollNo}"`,
      `"${currentStudent.leetcodeUsername}"`,
      `"${sub.title.replace(/"/g, '""')}"`,
      sub.difficulty,
      sub.status,
      `"${sub.formattedDate || formatExactTimestamp(sub.timestamp)}"`,
      sub.lang,
      `"${sub.runtime || 'N/A'}"`,
      `"${sub.memory || 'N/A'}"`,
      `"${(sub.topicTags || []).join('; ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentStudent.rollNo}_${currentStudent.leetcodeUsername}_40_recent_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentStudent) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-900">No Student Records Found</h3>
        <p className="text-xs text-slate-500 mt-1">Please add or import students to audit recent submissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Top Banner & Student Selection Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
                <Clock className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Individual Studentwise: 40 Recent Submissions
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300/50">
                Exact Timestamps & Verdict
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select any student to inspect their 40 recent LeetCode submissions with date, time, execution verdict, language, runtime, and memory metrics.
            </p>
          </div>

          {/* Quick Prev / Next Student Controls */}
          <div className="flex items-center space-x-2 self-start lg:self-auto">
            <button
              onClick={handlePrevStudent}
              disabled={currentIndex <= 0}
              className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                currentIndex <= 0 
                  ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="Previous student"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <span className="text-xs text-slate-500 font-mono px-2 py-1 bg-slate-50 rounded border border-slate-200">
              {currentIndex + 1} of {filteredStudents.length}
            </span>

            <button
              onClick={handleNextStudent}
              disabled={currentIndex >= filteredStudents.length - 1}
              className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                currentIndex >= filteredStudents.length - 1 
                  ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="Next student"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Student Picker Controls: Class Filter + Student Dropdown/Search */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-4">
          
          {/* Class Filter */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Filter by Class:
            </label>
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="All">All Classes ({students.length} students)</option>
              {classes.map(c => (
                <option key={c.id || c._id} value={c.id || c._id}>
                  {c.name} ({c.studentCount || 0} students)
                </option>
              ))}
            </select>
          </div>

          {/* Student Search */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Search Student:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                placeholder="Name, roll number, or handle..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Student Selector Dropdown */}
          <div className="md:col-span-5">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Active Student to Inspect:
            </label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-amber-50/60 border border-amber-300/80 rounded-lg text-amber-950 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
            >
              {filteredStudents.map(s => (
                <option key={s.id || s._id} value={s.id || s._id}>
                  {s.name} ({s.rollNo}) — @{s.leetcodeUsername} • {s.totalSolved} solved
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Selected Student Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-2xl text-white p-6 shadow-md border border-slate-800 relative overflow-hidden">
        
        {/* Background glow accent */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Avatar & Core Identity */}
          <div className="flex items-center space-x-4">
            <div className="relative shrink-0">
              <img
                src={currentStudent.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentStudent.leetcodeUsername}`}
                alt={currentStudent.name}
                referrerPolicy="no-referrer"
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400/90 shadow-md"
              />
              <span className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-slate-950 shadow-xs">
                {currentStudent.rollNo.slice(-3)}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {currentStudent.name}
                </h1>
                {currentStudent.contestRating >= 2000 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-400 text-amber-950 shadow-xs">
                    GUARDIAN
                  </span>
                )}
                {currentStudent.contestRating >= 1800 && currentStudent.contestRating < 2000 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-400 text-purple-950 shadow-xs">
                    KNIGHT
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 mt-1.5">
                <span className="font-mono text-amber-300 font-semibold">{currentStudent.rollNo}</span>
                <span>•</span>
                <span>{currentStudent.className || 'CSE Class'}</span>
                <span>•</span>
                <span>{currentStudent.department}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                <a
                  href={`https://leetcode.com/${currentStudent.leetcodeUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 font-mono text-amber-400 hover:text-amber-300 bg-white/10 hover:bg-white/15 px-2 py-0.5 rounded-md transition-colors"
                >
                  <span>@{currentStudent.leetcodeUsername}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {currentStudent.facultyAdvisorName && (
                  <span className="inline-flex items-center space-x-1 text-slate-300 bg-white/5 px-2 py-0.5 rounded-md">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Advisor: {currentStudent.facultyAdvisorName}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={() => onSyncStudent(currentStudent)}
              disabled={currentStudent.isSyncing}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                currentStudent.isSyncing 
                  ? 'bg-amber-500/50 text-white cursor-not-allowed' 
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
              title="Sync live submissions from LeetCode"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${currentStudent.isSyncing ? 'animate-spin' : ''}`} />
              <span>{currentStudent.isSyncing ? 'Syncing...' : 'Sync Live'}</span>
            </button>

            <button
              onClick={handleExportStudentCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
              title="Export 40 submissions as CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>Export 40 CSV</span>
            </button>

            {onSelectStudentModal && (
              <button
                onClick={() => onSelectStudentModal(currentStudent)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 text-slate-200 transition-colors"
              >
                <span>Full Card</span>
              </button>
            )}
          </div>

        </div>

        {/* Lifetime Solve Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/60">
          
          <div className="bg-slate-800/60 backdrop-blur-xs rounded-xl p-3 border border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Solved</span>
            <div className="text-xl font-black text-white mt-0.5">{currentStudent.totalSolved}</div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
              <span className="text-emerald-400 font-bold">{currentStudent.easySolved}E</span>
              <span>/</span>
              <span className="text-amber-400 font-bold">{currentStudent.mediumSolved}M</span>
              <span>/</span>
              <span className="text-rose-400 font-bold">{currentStudent.hardSolved}H</span>
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xs rounded-xl p-3 border border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contest Rating</span>
            <div className="text-xl font-black text-amber-400 mt-0.5">{currentStudent.contestRating}</div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              Attended: {currentStudent.attendedContests} contests
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xs rounded-xl p-3 border border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Streak</span>
            <div className="text-xl font-black text-orange-400 mt-0.5 flex items-center gap-1">
              <Flame className="w-5 h-5 fill-orange-400 text-orange-400" />
              <span>{currentStudent.streakDays} Days</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Goal: {currentStudent.weeklySolved}/{currentStudent.weeklyGoal} wk
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xs rounded-xl p-3 border border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Acceptance Rate</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{currentStudent.acceptanceRate}%</div>
            <div className="text-[10px] text-slate-400 mt-1 truncate">
              Global Rank #{currentStudent.ranking.toLocaleString()}
            </div>
          </div>

        </div>

      </div>

      {/* KPI Summary for this Student's 40 Recent Submissions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Audit Scope</span>
          <div className="text-xl font-black text-slate-900 mt-0.5">{submissionsStats.total} Subs</div>
          <span className="text-[10px] text-slate-500 font-medium">Recent 40 Logged</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accepted</span>
          <div className="text-xl font-black text-emerald-600 mt-0.5">{submissionsStats.accepted}</div>
          <span className="text-[10px] text-emerald-700 font-semibold">{submissionsStats.passRate}% Success Rate</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Wrong Answer</span>
          <div className="text-xl font-black text-rose-600 mt-0.5">{submissionsStats.wrongAnswer}</div>
          <span className="text-[10px] text-slate-500">Unsuccessful tests</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time Limit (TLE)</span>
          <div className="text-xl font-black text-amber-600 mt-0.5">{submissionsStats.timeLimit}</div>
          <span className="text-[10px] text-slate-500">Exceeded limits</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Difficulties</span>
          <div className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1 font-mono">
            <span className="text-emerald-600">{submissionsStats.easyCount}E</span>
            <span>•</span>
            <span className="text-amber-600">{submissionsStats.mediumCount}M</span>
            <span>•</span>
            <span className="text-rose-600">{submissionsStats.hardCount}H</span>
          </div>
          <span className="text-[10px] text-slate-500">In 40 recent</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Language</span>
          <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">{submissionsStats.topLang}</div>
          <span className="text-[10px] text-slate-500">{submissionsStats.topLangCount} of 40 subs</span>
        </div>

      </div>

      {/* 40 Recent Submissions Table & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Controls Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Chronological 40 Submissions</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
                {filteredSubmissions.length} of {rawSubmissions.length}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Exact timestamp format: <code className="font-mono text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200/60">YYYY-MM-DD HH:MM:SS</code>
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Search problem */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={problemSearch}
                onChange={e => setProblemSearch(e.target.value)}
                placeholder="Search problem title..."
                className="pl-7 pr-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Verdict Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs py-1 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            >
              <option value="All">All Verdicts</option>
              <option value="Accepted">Accepted Only</option>
              <option value="Wrong Answer">Wrong Answer</option>
              <option value="Time Limit Exceeded">Time Limit Exceeded</option>
              <option value="Runtime Error">Runtime Error</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={e => setDifficultyFilter(e.target.value)}
              className="text-xs py-1 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Language Filter */}
            <select
              value={langFilter}
              onChange={e => setLangFilter(e.target.value)}
              className="text-xs py-1 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            >
              {availableLanguages.map(l => (
                <option key={l} value={l}>{l === 'All' ? 'All Languages' : l}</option>
              ))}
            </select>

            {/* Sort order toggle */}
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium transition-colors"
              title="Toggle sort order"
            >
              <ArrowUpDown className="w-3 h-3 text-slate-500" />
              <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>

          </div>
        </div>

        {/* The 40 Recent Submissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-4">Problem Title</th>
                <th className="py-3 px-3">Difficulty</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4">Exact Timestamp (Date & Time)</th>
                <th className="py-3 px-3">Language</th>
                <th className="py-3 px-3">Runtime</th>
                <th className="py-3 px-3">Memory</th>
                <th className="py-3 px-3 text-right">LeetCode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub, idx) => {
                  const exactTime = sub.formattedDate || formatExactTimestamp(sub.timestamp);
                  const timeAgo = formatTimeAgo(sub.timestamp);

                  return (
                    <tr 
                      key={sub.id || idx}
                      className="hover:bg-amber-50/40 transition-colors group"
                    >
                      {/* Index */}
                      <td className="py-3.5 px-3 text-center font-mono text-[11px] text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Problem Title & Tags */}
                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="flex items-center space-x-1.5">
                          <a
                            href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors hover:underline"
                          >
                            {sub.title}
                          </a>
                        </div>
                        {sub.topicTags && sub.topicTags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            {sub.topicTags.slice(0, 3).map((tag, tIdx) => (
                              <span 
                                key={tIdx}
                                className="px-1.5 py-0.2 rounded text-[9px] bg-slate-100 text-slate-500 font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Difficulty Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          sub.difficulty === 'Easy' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : sub.difficulty === 'Medium' 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {sub.difficulty}
                        </span>
                      </td>

                      {/* Verdict Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {sub.status === 'Accepted' ? (
                          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>Accepted</span>
                          </span>
                        ) : sub.status === 'Wrong Answer' ? (
                          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>Wrong Answer</span>
                          </span>
                        ) : sub.status === 'Time Limit Exceeded' ? (
                          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>Time Limit</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            <AlertCircle className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span>{sub.status}</span>
                          </span>
                        )}
                      </td>

                      {/* Exact Timestamp (Date & Time) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div>
                            <div className="font-mono text-xs font-bold text-slate-800 tracking-tight">
                              {exactTime}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {timeAgo}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Language */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono text-slate-700 font-medium">
                        {sub.lang}
                      </td>

                      {/* Runtime */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[11px]">
                        {sub.runtime && sub.runtime !== 'N/A' ? (
                          <span className="text-slate-700">{sub.runtime}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Memory */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[11px]">
                        {sub.memory && sub.memory !== 'N/A' ? (
                          <span className="text-slate-700">{sub.memory}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* External Link */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <a
                          href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-slate-100 transition-colors"
                          title="Open on LeetCode"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-600">No submissions matching current filters</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing status, difficulty, or search terms.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Audit Summary:</span>
            <span>Displaying exactly {filteredSubmissions.length} of {rawSubmissions.length} recent submissions for {currentStudent.name}</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Oldest: {submissionsStats.oldestDate} • Newest: {submissionsStats.newestDate}
          </div>
        </div>

      </div>

    </div>
  );
};
