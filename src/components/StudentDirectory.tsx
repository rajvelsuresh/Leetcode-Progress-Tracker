import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  ExternalLink, 
  Flame, 
  Trophy, 
  RefreshCw, 
  Eye, 
  Trash2, 
  Mail, 
  GraduationCap, 
  Edit2, 
  Building2, 
  Clock,
  UserPlus,
  Upload,
  Download
} from 'lucide-react';
import { Student, ClassGroup } from '../types';
import { formatTimeAgo } from '../utils/storage';

interface StudentDirectoryProps {
  students: Student[];
  classes?: ClassGroup[];
  onSelectStudent: (student: Student) => void;
  onSyncStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onDeleteAllStudents?: () => void;
  onEditStudent?: (student: Student) => void;
  onViewSubmissions?: (student: Student) => void;
  onOpenAddModal?: () => void;
  onOpenImportModal?: () => void;
  onExportCSV?: () => void;
  onSyncAll?: () => void;
  isSyncingAll?: boolean;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({
  students,
  classes = [],
  onSelectStudent,
  onSyncStudent,
  onDeleteStudent,
  onDeleteAllStudents,
  onEditStudent,
  onViewSubmissions,
  onOpenAddModal,
  onOpenImportModal,
  onExportCSV,
  onSyncAll,
  isSyncingAll = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  const departments = ['All', ...Array.from(new Set(students.map(s => s.department)))];

  const filtered = students.filter(s => {
    if (deptFilter !== 'All' && s.department !== deptFilter) return false;
    if (classFilter !== 'All') {
      if (s.classId !== classFilter && s.className !== classFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.leetcodeUsername.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner & Management Actions */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            Manage Students
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Student roster, profile editing, faculty advisor assignment, and batch management.
          </p>
        </div>

        {/* Action Buttons Hub: Add, Import, Export, Sync */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenAddModal && (
            <button
              id="manage-add-student-btn"
              onClick={onOpenAddModal}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add New Student</span>
            </button>
          )}

          {onOpenImportModal && (
            <button
              id="manage-import-btn"
              onClick={onOpenImportModal}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
              title="Bulk import students from CSV"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import CSV</span>
            </button>
          )}

          {onExportCSV && (
            <button
              id="manage-export-btn"
              onClick={onExportCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
              title="Export students roster to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          )}

          {onSyncAll && (
            <button
              id="manage-sync-btn"
              onClick={onSyncAll}
              disabled={isSyncingAll}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold border shadow-2xs transition-colors ${
                isSyncingAll
                  ? 'bg-amber-50 text-amber-600 border-amber-200 cursor-not-allowed'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
              title="Live sync all students with LeetCode"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin text-amber-500' : 'text-slate-500'}`} />
              <span>{isSyncingAll ? 'Syncing All...' : 'Sync All'}</span>
            </button>
          )}

          {onDeleteAllStudents && students.length > 0 && (
            <button
              id="manage-delete-all-students-btn"
              onClick={() => setShowDeleteAllModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold transition-colors"
              title="Delete all students from roster"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Delete All Students</span>
            </button>
          )}

          <div className="text-xs font-mono text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <strong>{filtered.length}</strong> / {students.length}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or handle..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {classes.length > 0 && (
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="All">All Classes</option>
              {classes.map(c => (
                <option key={c.id || c._id} value={c.id || c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            {departments.map(d => (
              <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(student => (
          <div
            key={student.id}
            onClick={() => onSelectStudent(student)}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Card Header: Avatar, Name, Handle */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={student.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.leetcodeUsername}`}
                    alt={student.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 group-hover:border-amber-400 transition-colors shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                      {student.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">{student.rollNo}</p>
                    <a
                      href={`https://leetcode.com/${student.leetcodeUsername}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-xs text-amber-600 font-mono hover:underline inline-flex items-center gap-1 mt-0.5 truncate"
                    >
                      <span>@{student.leetcodeUsername}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center space-x-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-mono">
                    <Flame className="w-3 h-3 fill-orange-500" />
                    <span>{student.streakDays}d</span>
                  </span>
                </div>
              </div>

              {/* Class & Faculty Advisor badges */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {student.className && (
                  <span className="text-[11px] font-semibold text-slate-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-amber-600" />
                    {student.className}
                  </span>
                )}
                <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md truncate">
                  {student.department}
                </span>
                {student.facultyAdvisorName && (
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 w-full mt-1">
                    <GraduationCap className="w-3 h-3 text-slate-400" />
                    <span>Mentor: {student.facultyAdvisorName}</span>
                  </span>
                )}
              </div>

              {/* Stats Grid */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Total Solved</span>
                  <span className="font-extrabold text-slate-900 font-mono text-sm">{student.totalSolved}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Rating</span>
                  <span className="font-extrabold text-amber-600 font-mono text-sm">{student.contestRating || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Accuracy</span>
                  <span className="font-extrabold text-slate-700 font-mono text-sm">{student.acceptanceRate}%</span>
                </div>
              </div>

              {/* Mini Difficulty Progress Bar */}
              <div className="mt-3 space-y-1">
                <div className="w-full h-1.5 rounded-full bg-slate-100 flex overflow-hidden">
                  <div 
                    style={{ width: `${(student.easySolved / Math.max(1, student.totalSolved)) * 100}%` }}
                    className="bg-emerald-500 h-full"
                  />
                  <div 
                    style={{ width: `${(student.mediumSolved / Math.max(1, student.totalSolved)) * 100}%` }}
                    className="bg-amber-500 h-full"
                  />
                  <div 
                    style={{ width: `${(student.hardSolved / Math.max(1, student.totalSolved)) * 100}%` }}
                    className="bg-rose-500 h-full"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span className="text-emerald-600">{student.easySolved} Easy</span>
                  <span className="text-amber-600">{student.mediumSolved} Med</span>
                  <span className="text-rose-600">{student.hardSolved} Hard</span>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400" onClick={e => e.stopPropagation()}>
              <span>Active {formatTimeAgo(student.lastActive)}</span>
              <div className="flex items-center space-x-1">
                {onEditStudent && (
                  <button
                    onClick={() => onEditStudent(student)}
                    className="p-1.5 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                    title="Edit Student Data"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => onSyncStudent(student)}
                  disabled={student.isSyncing}
                  className="p-1.5 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                  title="Sync LeetCode data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${student.isSyncing ? 'animate-spin text-amber-500' : ''}`} />
                </button>
                {onViewSubmissions && (
                  <button
                    onClick={() => onViewSubmissions(student)}
                    className="p-1.5 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                    title="View 40 Recent Submissions with Timestamps"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                  </button>
                )}
                <button
                  onClick={() => onSelectStudent(student)}
                  className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                  title="View Profile & Submissions"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setStudentToDelete(student)}
                  className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  title="Delete Student"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No students matched</p>
          <p className="text-xs text-slate-400 mt-1">Adjust search keywords, class, or department selection, or add new students.</p>
        </div>
      )}

      {/* Delete Single Student Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Student Record</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete <strong className="text-slate-800">{studentToDelete.name}</strong> ({studentToDelete.rollNo}, @{studentToDelete.leetcodeUsername})?
              </p>
              <p className="text-[11px] text-rose-600 font-medium">This will remove all associated submissions and performance data.</p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="flex-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteStudent(studentToDelete.id || studentToDelete._id!);
                  setStudentToDelete(null);
                }}
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Students Confirmation Modal */}
      {showDeleteAllModal && onDeleteAllStudents && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete All {students.length} Students</h3>
              <p className="text-xs text-slate-500">
                This will delete every student record, ranking, and submission log from the tracker database.
              </p>
              <p className="text-[11px] text-rose-600 font-medium font-mono">This action cannot be undone.</p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="flex-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteAllStudents();
                  setShowDeleteAllModal(false);
                }}
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Delete All Students
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
