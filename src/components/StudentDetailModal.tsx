import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  RefreshCw, 
  Award, 
  Calendar, 
  Mail, 
  GraduationCap, 
  Layers, 
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Edit2,
  Building2,
  Filter,
  AlertCircle
} from 'lucide-react';
import { Student } from '../types';
import { TOTAL_LEETCODE_PROBLEMS } from '../data/mockStudents';
import { formatTimeAgo } from '../utils/storage';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
  onSyncStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onEditStudent?: (student: Student) => void;
  onOpenStudentwiseView?: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onSyncStudent,
  onDeleteStudent,
  onEditStudent,
  onOpenStudentwiseView,
}) => {
  const [subStatusFilter, setSubStatusFilter] = useState<string>('All');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!student) return null;

  const easyPct = Math.min(100, Math.round((student.easySolved / TOTAL_LEETCODE_PROBLEMS.easy) * 100));
  const mediumPct = Math.min(100, Math.round((student.mediumSolved / TOTAL_LEETCODE_PROBLEMS.medium) * 100));
  const hardPct = Math.min(100, Math.round((student.hardSolved / TOTAL_LEETCODE_PROBLEMS.hard) * 100));
  const totalCatalogPct = ((student.totalSolved / TOTAL_LEETCODE_PROBLEMS.total) * 100).toFixed(1);

  // Submissions up to 40
  const submissions = student.recentSubmissions || [];
  const filteredSubmissions = submissions.filter(sub => {
    if (subStatusFilter === 'All') return true;
    return sub.status === subStatusFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <img
                src={student.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.leetcodeUsername}`}
                alt={student.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover border-2 border-amber-400 shadow-md shrink-0"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {student.name}
                  </h2>
                  {student.contestRating >= 2000 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-400 text-amber-950">
                      GUARDIAN
                    </span>
                  )}
                  {student.contestRating >= 1800 && student.contestRating < 2000 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-400 text-purple-950">
                      KNIGHT
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 mt-1">
                  <span className="font-mono text-amber-300 font-medium">{student.rollNo}</span>
                  {student.className && (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-white bg-white/10 px-2 py-0.2 rounded">
                        {student.className}
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span>{student.department}</span>
                </div>

                {student.facultyAdvisorName && (
                  <div className="text-xs text-amber-200/80 mt-1 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Advisor: <strong>{student.facultyAdvisorName}</strong></span>
                  </div>
                )}

                <div className="flex items-center space-x-3 mt-2">
                  <a
                    href={`https://leetcode.com/${student.leetcodeUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 font-mono text-xs text-amber-300 hover:text-amber-200 underline decoration-amber-400/40"
                  >
                    <span>@{student.leetcodeUsername}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {student.email && (
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Mail className="w-3 h-3" />
                      {student.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              {onEditStudent && (
                <button
                  onClick={() => {
                    onEditStudent(student);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Data</span>
                </button>
              )}

              <button
                onClick={() => onSyncStudent(student)}
                disabled={student.isSyncing}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-bold rounded-lg transition-all shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${student.isSyncing ? 'animate-spin' : ''}`} />
                <span>{student.isSyncing ? 'Fetching...' : 'Sync LeetCode'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Solved</span>
              <span className="text-2xl font-black text-slate-900 font-mono">{student.totalSolved}</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">{totalCatalogPct}% of catalog</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Contest Rating</span>
              <span className="text-2xl font-black text-amber-600 font-mono">{student.contestRating || '—'}</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">{student.attendedContests || 0} contests attended</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Streak</span>
              <span className="text-2xl font-black text-orange-600 font-mono flex items-center gap-1">
                <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
                {student.streakDays}d
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Active daily streak</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Global Ranking</span>
              <span className="text-2xl font-black text-slate-800 font-mono">
                {student.ranking ? `#${student.ranking.toLocaleString()}` : 'Top 5%'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Acc. {student.acceptanceRate}%</span>
            </div>
          </div>

          {/* Difficulty Progress Bars */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Problem Solving Breakdown vs LeetCode Catalog
            </h3>

            {/* Easy */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-bold text-emerald-700">Easy Problems</span>
                <span className="text-slate-600 font-semibold">{student.easySolved} / {TOTAL_LEETCODE_PROBLEMS.easy} ({easyPct}%)</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${easyPct}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-bold text-amber-700">Medium Problems</span>
                <span className="text-slate-600 font-semibold">{student.mediumSolved} / {TOTAL_LEETCODE_PROBLEMS.medium} ({mediumPct}%)</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${mediumPct}%` }}
                />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-bold text-rose-700">Hard Problems</span>
                <span className="text-slate-600 font-semibold">{student.hardSolved} / {TOTAL_LEETCODE_PROBLEMS.hard} ({hardPct}%)</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${hardPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Recent 40 Submissions History with Status & Timestamp */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Recent Submissions History ({submissions.length} Total, Max 40)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Comprehensive audit trail with execution verdicts, language, and exact timestamps.
                </p>
              </div>

              {/* Status filter and Full View button for submissions */}
              <div className="flex items-center space-x-2 text-xs">
                {onOpenStudentwiseView && (
                  <button
                    onClick={() => {
                      onOpenStudentwiseView(student);
                      onClose();
                    }}
                    className="inline-flex items-center space-x-1 py-1 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-md font-semibold text-xs transition-colors"
                  >
                    <span>Full 40 Submissions Tab</span>
                    <ExternalLink className="w-3 h-3 text-amber-600" />
                  </button>
                )}
                <div className="flex items-center space-x-1">
                  <span className="text-slate-400 text-[11px]">Filter:</span>
                  <select
                    value={subStatusFilter}
                    onChange={e => setSubStatusFilter(e.target.value)}
                    className="text-xs py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium"
                  >
                    <option value="All">All Verdicts</option>
                    <option value="Accepted">Accepted Only</option>
                    <option value="Wrong Answer">Wrong Answer</option>
                    <option value="Time Limit Exceeded">Time Limit</option>
                    <option value="Runtime Error">Runtime Error</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submissions Table / Feed */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub, idx) => {
                  const formattedDate = sub.formattedDate || new Date(sub.timestamp).toLocaleString();
                  return (
                    <div 
                      key={sub.id || idx} 
                      className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className="font-mono text-[11px] text-slate-400 w-5 shrink-0">
                          #{idx + 1}
                        </span>

                        {/* Status Icon */}
                        {sub.status === 'Accepted' ? (
                          <span className="p-1 rounded-md bg-emerald-50 text-emerald-600 shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        ) : sub.status === 'Wrong Answer' ? (
                          <span className="p-1 rounded-md bg-rose-50 text-rose-600 shrink-0">
                            <XCircle className="w-4 h-4" />
                          </span>
                        ) : sub.status === 'Time Limit Exceeded' ? (
                          <span className="p-1 rounded-md bg-amber-50 text-amber-600 shrink-0">
                            <Clock className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="p-1 rounded-md bg-purple-50 text-purple-600 shrink-0">
                            <AlertCircle className="w-4 h-4" />
                          </span>
                        )}

                        <div className="min-w-0">
                          <a
                            href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-slate-900 hover:text-amber-600 truncate block text-sm"
                          >
                            {sub.title}
                          </a>
                          
                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                            <span className={`font-bold font-mono ${
                              sub.difficulty === 'Easy' ? 'text-emerald-600' :
                              sub.difficulty === 'Medium' ? 'text-amber-600' : 'text-rose-600'
                            }`}>{sub.difficulty}</span>
                            <span>•</span>
                            <span className="font-mono font-medium text-slate-600">{sub.lang}</span>
                            {sub.runtime && sub.runtime !== 'N/A' && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-slate-500">⚡ {sub.runtime}</span>
                              </>
                            )}
                            {sub.memory && sub.memory !== 'N/A' && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-slate-500">💾 {sub.memory}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status badge & Exact Timestamp */}
                      <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0 text-right">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          sub.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700' :
                          sub.status === 'Wrong Answer' ? 'bg-rose-50 text-rose-700' :
                          sub.status === 'Time Limit Exceeded' ? 'bg-amber-50 text-amber-700' :
                          'bg-purple-50 text-purple-700'
                        }`}>
                          {sub.status}
                        </span>

                        <div className="mt-1 flex items-center space-x-1.5 font-mono text-[10px] text-slate-500">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formattedDate}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-amber-600 font-sans font-semibold">
                            {formatTimeAgo(sub.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                  No submissions matched the selected filter.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {!isConfirmingDelete ? (
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Student</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg">
              <span className="text-xs font-semibold text-rose-800">Confirm deletion?</span>
              <button
                onClick={() => {
                  onDeleteStudent(student.id || student._id!);
                  onClose();
                }}
                className="px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            {onEditStudent && (
              <button
                onClick={() => onEditStudent(student)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center space-x-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
