import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  CheckSquare, 
  Square, 
  Save, 
  UserCheck, 
  UserX, 
  AlertCircle, 
  GraduationCap,
  Building2,
  Filter
} from 'lucide-react';
import { ClassGroup, Student } from '../../types';

interface EditClassMembersViewProps {
  classes: ClassGroup[];
  students: Student[];
  onUpdateClassMembers: (classId: string, studentIds: string[]) => Promise<void> | void;
}

export const EditClassMembersView: React.FC<EditClassMembersViewProps> = ({
  classes,
  students,
  onUpdateClassMembers,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || classes[0]?._id || '');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'enrolled' | 'unassigned'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const currentClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId || c._id === selectedClassId) || null;
  }, [classes, selectedClassId]);

  // When class changes, initialize selectedStudentIds from students belonging to this class
  React.useEffect(() => {
    if (selectedClassId) {
      const classIdStr = selectedClassId;
      const enrolled = students
        .filter(s => s.classId === classIdStr || s.className === currentClass?.name)
        .map(s => s.id || s._id || '');
      setSelectedStudentIds(new Set(enrolled.filter(Boolean)));
    }
  }, [selectedClassId, currentClass, students]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const studentId = student.id || student._id || '';
      const isEnrolled = selectedStudentIds.has(studentId);
      
      if (filterMode === 'enrolled' && !isEnrolled) return false;
      if (filterMode === 'unassigned' && student.classId && !isEnrolled) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        student.name.toLowerCase().includes(q) ||
        (student.rollNo && student.rollNo.toLowerCase().includes(q)) ||
        student.leetcodeUsername.toLowerCase().includes(q) ||
        (student.department && student.department.toLowerCase().includes(q))
      );
    });
  }, [students, selectedStudentIds, filterMode, searchQuery]);

  const toggleStudent = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedStudentIds(next);
  };

  const selectAllFiltered = () => {
    const next = new Set(selectedStudentIds);
    filteredStudents.forEach(s => {
      const id = s.id || s._id;
      if (id) next.add(id);
    });
    setSelectedStudentIds(next);
  };

  const deselectAllFiltered = () => {
    const next = new Set(selectedStudentIds);
    filteredStudents.forEach(s => {
      const id = s.id || s._id;
      if (id) next.delete(id);
    });
    setSelectedStudentIds(next);
  };

  const handleSave = async () => {
    if (!selectedClassId) {
      setErrorMessage('Please select a class first');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await onUpdateClassMembers(selectedClassId, Array.from(selectedStudentIds));
      setSuccessMessage(`Class roster for "${currentClass?.name}" updated successfully with ${selectedStudentIds.size} students!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update class members');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
            <span>Admin Portal</span>
            <span>•</span>
            <span>Roster & Enrollment Management</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            Edit Class Members
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Assign or transfer students into specific academic classes and sections.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !selectedClassId}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Roster...' : `Save Enrollment (${selectedStudentIds.size})`}</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Class Selection & Search Bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Target Class / Section</span>
            </label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-semibold text-slate-800"
            >
              {classes.length === 0 && <option value="">No Classes Found</option>}
              {classes.map(c => {
                const id = c.id || c._id || '';
                return (
                  <option key={id} value={id}>
                    {c.name} ({c.code}) - Batch: {c.batch}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search Students</span>
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Name, Roll No, LeetCode..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filter View</span>
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`py-1 text-[11px] font-bold rounded-md transition-all ${
                  filterMode === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({students.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('enrolled')}
                className={`py-1 text-[11px] font-bold rounded-md transition-all ${
                  filterMode === 'enrolled'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Enrolled ({selectedStudentIds.size})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('unassigned')}
                className={`py-1 text-[11px] font-bold rounded-md transition-all ${
                  filterMode === 'unassigned'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unassigned
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <div className="text-slate-500">
            Showing <span className="font-bold text-slate-900">{filteredStudents.length}</span> students • <span className="font-bold text-amber-600">{selectedStudentIds.size}</span> enrolled in {currentClass?.name || 'Selected Class'}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={selectAllFiltered}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center space-x-1"
            >
              <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>Select All Shown</span>
            </button>
            <button
              type="button"
              onClick={deselectAllFiltered}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center space-x-1"
            >
              <Square className="w-3.5 h-3.5 text-slate-400" />
              <span>Deselect All Shown</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Checklist Grid */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No students found matching current filters</p>
            <p className="text-xs text-slate-400 mt-1">Try changing your search query or switching the filter view.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredStudents.map(student => {
              const studentId = student.id || student._id || '';
              const isChecked = selectedStudentIds.has(studentId);

              return (
                <div
                  key={studentId}
                  onClick={() => toggleStudent(studentId)}
                  className={`p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50/80 cursor-pointer transition-colors ${
                    isChecked ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      type="button"
                      className="text-slate-400 hover:text-amber-600 focus:outline-hidden"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-amber-600 fill-amber-100" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900 truncate">{student.name}</span>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {student.rollNo}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="text-amber-700 font-mono">@{student.leetcodeUsername}</span>
                        <span>•</span>
                        <span>{student.department || 'CSE'}</span>
                        <span>•</span>
                        <span>{student.section ? `Sec ${student.section}` : 'No Sec'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0 text-right">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{student.totalSolved} Solved</div>
                      <div className="text-[10px] text-slate-400 font-mono">Rank #{student.ranking || '-'}</div>
                    </div>

                    <div>
                      {isChecked ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          <UserCheck className="w-3 h-3" />
                          <span>Enrolled</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          <UserX className="w-3 h-3" />
                          <span>Not Enrolled</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
