import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Trophy, 
  CheckCircle2, 
  UserCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  ChevronRight,
  TrendingUp,
  Target
} from 'lucide-react';
import { ClassGroup, Student, Faculty } from '../types';

interface ClasswiseListProps {
  classes: ClassGroup[];
  students: Student[];
  faculties: Faculty[];
  isAdmin?: boolean;
  onSelectClass: (classId: string) => void;
  onAddClass?: (classData: Partial<ClassGroup>) => void;
  onUpdateClass?: (id: string, classData: Partial<ClassGroup>) => void;
  onDeleteClass?: (id: string) => void;
  onDeleteAllClasses?: () => void;
}

export const ClasswiseList: React.FC<ClasswiseListProps> = ({
  classes,
  students,
  faculties,
  isAdmin = false,
  onSelectClass,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onDeleteAllClasses,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassGroup | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [section, setSection] = useState('A');
  const [batch, setBatch] = useState('2022-2026');
  const [facultyAdvisorId, setFacultyAdvisorId] = useState('');
  const [targetSolvedAverage, setTargetSolvedAverage] = useState(450);

  const openAddModal = () => {
    setEditingClass(null);
    setName('CSE - Section C');
    setCode('CSE-C-2026');
    setDepartment('Computer Science and Engineering');
    setSection('C');
    setBatch('2022-2026');
    setFacultyAdvisorId(faculties[0]?.id || '');
    setTargetSolvedAverage(450);
    setIsModalOpen(true);
  };

  const openEditModal = (c: ClassGroup) => {
    setEditingClass(c);
    setName(c.name);
    setCode(c.code);
    setDepartment(c.department);
    setSection(c.section);
    setBatch(c.batch);
    setFacultyAdvisorId(c.facultyAdvisorId || '');
    setTargetSolvedAverage(c.targetSolvedAverage || 450);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const faculty = faculties.find(f => f.id === facultyAdvisorId || f._id === facultyAdvisorId);
    const payload = {
      name,
      code,
      department,
      section,
      batch,
      facultyAdvisorId,
      facultyAdvisorName: faculty ? faculty.name : 'Unassigned',
      targetSolvedAverage: Number(targetSolvedAverage),
    };

    if (editingClass) {
      if (onUpdateClass) onUpdateClass(editingClass.id || editingClass._id!, payload);
    } else {
      if (onAddClass) onAddClass(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Classwise Cohorts & Section Performance
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {classes.length} Classes
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Section-by-section LeetCode progress, assigned faculty advisors, batch averages, and milestone tracking.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isAdmin && onDeleteAllClasses && classes.length > 0 && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg shadow-2xs transition-all shrink-0"
              title="Delete all class records"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Delete All Classes</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Class</span>
            </button>
          )}
        </div>
      </div>

      {classes.length === 0 && (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500">
          <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No classes configured</p>
          <p className="text-xs text-slate-400 mt-1">
            {isAdmin 
              ? 'Click "Add New Class" above to create an academic section.' 
              : 'No assigned classes found. Please contact the department administrator to configure section assignments.'}
          </p>
        </div>
      )}

      {/* Grid of Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {classes.map(c => {
          const classStudents = students.filter(s => s.classId === c.id || s.classId === c._id);
          const totalSolved = classStudents.reduce((acc, s) => acc + (s.totalSolved || 0), 0);
          const avgSolved = classStudents.length > 0 ? Math.round(totalSolved / classStudents.length) : 0;
          const target = c.targetSolvedAverage || 450;
          const targetPct = Math.min(100, Math.round((avgSolved / target) * 100));
          const faculty = faculties.find(f => f.id === c.facultyAdvisorId || f._id === c.facultyAdvisorId);

          return (
            <div
              key={c.id || c._id}
              className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header: Class Name, Section, Code & Actions */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-base text-slate-900 tracking-tight">
                        {c.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-100 text-amber-900">
                        Sec {c.section}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {c.department} • <span className="font-mono">{c.batch}</span>
                    </p>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="Edit Class Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setClassToDelete(c)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete Class"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Faculty Advisor Row */}
                <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xs">
                      {c.facultyAdvisorName ? c.facultyAdvisorName.charAt(0) : 'F'}
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Faculty Advisor</span>
                      <span className="text-xs font-bold text-slate-800">{c.facultyAdvisorName || faculty?.name || 'Unassigned'}</span>
                    </div>
                  </div>
                  {faculty?.email && (
                    <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                      {faculty.email}
                    </span>
                  )}
                </div>

                {/* Metrics Grid */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Students</span>
                    <span className="font-extrabold text-slate-900 font-mono text-sm">{classStudents.length}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Class Total</span>
                    <span className="font-extrabold text-amber-600 font-mono text-sm">{totalSolved}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Class Average</span>
                    <span className="font-extrabold text-emerald-600 font-mono text-sm">{avgSolved}</span>
                  </div>
                </div>

                {/* Target Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Target className="w-3 h-3 text-amber-500" />
                      Target Average: {target}
                    </span>
                    <span className="font-bold text-slate-700">{targetPct}% reached</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        targetPct >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${targetPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* View Students in Class CTA */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Top Student: <strong className="text-slate-800 font-semibold">
                    {classStudents.sort((a, b) => b.totalSolved - a.totalSolved)[0]?.name || 'N/A'}
                  </strong>
                </span>

                <button
                  onClick={() => onSelectClass(c.id || c._id!)}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <span>Filter Class Leaderboard</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">
                {editingClass ? 'Edit Class Details' : 'Add New Class / Section'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Class Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. CSE - Section A"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Class Code *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="e.g. CSE-A-2026"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Section
                  </label>
                  <input
                    type="text"
                    value={section}
                    onChange={e => setSection(e.target.value)}
                    placeholder="e.g. A"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                >
                  <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
                  <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Faculty Advisor
                </label>
                <select
                  value={facultyAdvisorId}
                  onChange={e => setFacultyAdvisorId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                >
                  <option value="">-- Select Faculty Advisor --</option>
                  {faculties.map(f => (
                    <option key={f.id || f._id} value={f.id || f._id}>
                      {f.name} ({f.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Solved Average
                </label>
                <input
                  type="number"
                  value={targetSolvedAverage}
                  onChange={e => setTargetSolvedAverage(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  {editingClass ? 'Update Class' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Single Class Confirmation Modal */}
      {classToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Class</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete class <strong className="text-slate-800">{classToDelete.name}</strong> (Sec {classToDelete.section}, {classToDelete.code})?
              </p>
              <p className="text-[11px] text-rose-600 font-medium">Students enrolled in this class will become unassigned.</p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setClassToDelete(null)}
                className="flex-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteClass) onDeleteClass(classToDelete.id || classToDelete._id!);
                  setClassToDelete(null);
                }}
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Delete Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Classes Confirmation Modal */}
      {showDeleteAllModal && onDeleteAllClasses && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete All {classes.length} Classes</h3>
              <p className="text-xs text-slate-500">
                This will delete every class section and faculty assignment from the database.
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
                  onDeleteAllClasses();
                  setShowDeleteAllModal(false);
                }}
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Delete All Classes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
