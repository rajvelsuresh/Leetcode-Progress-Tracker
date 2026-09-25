import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ExternalLink, 
  Search, 
  Filter,
  Code2,
  Calendar,
  Building2,
  Check,
  AlertCircle
} from 'lucide-react';
import { Submission, Student, Difficulty, SubmissionStatus, ClassGroup } from '../types';
import { formatTimeAgo } from '../utils/storage';

interface RecentSubmissionsFeedProps {
  submissions: Submission[];
  students: Student[];
  classes?: ClassGroup[];
  onSelectStudent: (student: Student) => void;
  onSwitchToStudentwise?: (student?: Student) => void;
}

export const RecentSubmissionsFeed: React.FC<RecentSubmissionsFeedProps> = ({
  submissions,
  students,
  classes = [],
  onSelectStudent,
  onSwitchToStudentwise,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [langFilter, setLangFilter] = useState<string>('All');
  const [classFilter, setClassFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique languages
  const languages = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach(s => {
      if (s.lang) set.add(s.lang);
    });
    return ['All', ...Array.from(set)];
  }, [submissions]);

  // Take recent 40 submissions by default
  const recent40Submissions = useMemo(() => {
    return [...submissions]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 40);
  }, [submissions]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return recent40Submissions.filter(sub => {
      // Status
      if (statusFilter !== 'All' && sub.status !== statusFilter) return false;
      // Difficulty
      if (difficultyFilter !== 'All' && sub.difficulty !== difficultyFilter) return false;
      // Language
      if (langFilter !== 'All' && sub.lang !== langFilter) return false;
      // Class filter
      if (classFilter !== 'All') {
        const student = students.find(s => s.id === sub.studentId);
        if (student?.classId !== classFilter && student?.className !== classFilter) return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesStudent = sub.studentName.toLowerCase().includes(q) || sub.rollNo.toLowerCase().includes(q);
        const matchesTitle = sub.title.toLowerCase().includes(q);
        if (!matchesStudent && !matchesTitle) return false;
      }
      return true;
    });
  }, [recent40Submissions, statusFilter, difficultyFilter, langFilter, classFilter, searchQuery, students]);

  // Breakdown of recent 40
  const statusStats = useMemo(() => {
    const counts = {
      Accepted: 0,
      'Wrong Answer': 0,
      'Time Limit Exceeded': 0,
      'Runtime Error': 0,
    };
    recent40Submissions.forEach(s => {
      if (s.status in counts) {
        counts[s.status as keyof typeof counts]++;
      }
    });
    return counts;
  }, [recent40Submissions]);

  // Status Badge Helper
  const renderStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Accepted</span>
          </span>
        );
      case 'Wrong Answer':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Wrong Answer</span>
          </span>
        );
      case 'Time Limit Exceeded':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Time Limit Exceeded</span>
          </span>
        );
      case 'Runtime Error':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <AlertCircle className="w-3.5 h-3.5 text-purple-600" />
            <span>Runtime Error</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
            <span>{status}</span>
          </span>
        );
    }
  };

  // Difficulty Pill Helper
  const renderDifficultyPill = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-100 text-emerald-800">
            Easy
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-amber-100 text-amber-800">
            Medium
          </span>
        );
      case 'Hard':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-rose-100 text-rose-800">
            Hard
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Status Breakdown Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Live Submissions Feed (Recent 40 Activity Log)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800">
                40 Submissions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live verdict statuses, exact timestamps, problem difficulties, and execution metrics across all classes.
            </p>
          </div>

          {/* Right side: Quick status summary cards and studentwise button */}
          <div className="flex flex-col sm:items-end gap-2.5">
            {onSwitchToStudentwise && (
              <button
                onClick={() => onSwitchToStudentwise()}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-all shadow-2xs self-start sm:self-auto"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Switch to Individual Studentwise (40 Submissions)</span>
              </button>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <div className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-semibold">
                <Check className="w-3.5 h-3.5" />
                <span>{statusStats.Accepted} Accepted</span>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 font-semibold">
                <XCircle className="w-3.5 h-3.5" />
                <span>{statusStats['Wrong Answer']} WA</span>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>{statusStats['Time Limit Exceeded']} TLE</span>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{statusStats['Runtime Error']} RE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, roll number, or problem..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Class Filter */}
          {classes.length > 0 && (
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="All">All Classes</option>
              {classes.map(c => (
                <option key={c.id || c._id} value={c.id || c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Status */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="All">All Statuses</option>
            <option value="Accepted">Accepted Only (✅)</option>
            <option value="Wrong Answer">Wrong Answer (❌)</option>
            <option value="Time Limit Exceeded">Time Limit Exceeded (⏳)</option>
            <option value="Runtime Error">Runtime Error (⚠️)</option>
          </select>

          {/* Difficulty */}
          <select
            value={difficultyFilter}
            onChange={e => setDifficultyFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy Only</option>
            <option value="Medium">Medium Only</option>
            <option value="Hard">Hard Only</option>
          </select>

          {/* Language */}
          <select
            value={langFilter}
            onChange={e => setLangFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
          >
            {languages.map(l => (
              <option key={l} value={l}>{l === 'All' ? 'All Languages' : l}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Submissions List */}
      <div className="space-y-2.5">
        {filteredSubmissions.map((submission, index) => {
          const student = students.find(s => s.id === submission.studentId);
          const formattedDate = submission.formattedDate || new Date(submission.timestamp).toLocaleString();

          return (
            <div
              key={submission.id || `sub-${index}`}
              className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              
              {/* Left Column: Student Info & Problem */}
              <div className="flex items-start space-x-3 min-w-0">
                <button
                  onClick={() => student && onSelectStudent(student)}
                  className="shrink-0 group"
                  title="View Student"
                >
                  <img
                    src={student?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${submission.leetcodeUsername}`}
                    alt={submission.studentName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:border-amber-500 transition-colors"
                  />
                </button>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => student && onSelectStudent(student)}
                      className="font-bold text-sm text-slate-900 hover:text-amber-600 transition-colors text-left"
                    >
                      {submission.studentName}
                    </button>
                    <span className="text-xs text-slate-400 font-mono">({submission.rollNo})</span>
                    {student?.className && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {student.className}
                      </span>
                    )}
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-amber-600 font-mono">@{submission.leetcodeUsername}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <a
                      href={`https://leetcode.com/problems/${submission.titleSlug}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-slate-800 hover:text-amber-600 inline-flex items-center gap-1 transition-colors"
                    >
                      <span>{submission.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    {renderDifficultyPill(submission.difficulty)}
                  </div>

                  {/* Topic tags if available */}
                  {submission.topicTags && submission.topicTags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      {submission.topicTags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Status Verdict, Language, Runtime & EXACT TIMESTAMP */}
              <div className="flex flex-wrap sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                <div className="flex items-center space-x-2">
                  {renderStatusBadge(submission.status)}
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-700">
                    {submission.lang}
                  </span>
                </div>

                <div className="flex flex-col sm:items-end text-xs text-slate-400 space-y-0.5">
                  {submission.runtime && submission.runtime !== 'N/A' && (
                    <span className="font-mono text-slate-600 text-[11px]">⚡ {submission.runtime}</span>
                  )}
                  {/* Exact Timestamp Display */}
                  <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-600">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{formattedDate}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-amber-600 font-sans font-semibold">
                      {formatTimeAgo(submission.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          );
        })}

        {filteredSubmissions.length === 0 && (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500">
            <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No submissions found</p>
            <p className="text-xs text-slate-400 mt-1">Try relaxing the status, difficulty, class, or search filters.</p>
          </div>
        )}
      </div>

    </div>
  );
};
