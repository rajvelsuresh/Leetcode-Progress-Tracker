import React, { useState } from 'react';
import { 
  UserCheck, 
  Building2, 
  GraduationCap, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { ClassGroup, Faculty, Student } from '../../types';

interface ClassFacultyAssigningViewProps {
  classes: ClassGroup[];
  faculties: Faculty[];
  students: Student[];
  onAssignFacultyToClass: (classId: string, facultyId: string) => Promise<void> | void;
}

export const ClassFacultyAssigningView: React.FC<ClassFacultyAssigningViewProps> = ({
  classes,
  faculties,
  students,
  onAssignFacultyToClass,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Active/Approved faculties only
  const activeFaculties = faculties.filter(f => f.status !== 'rejected');

  const filteredClasses = classes.filter(c => {
    if (selectedDept !== 'all' && c.department !== selectedDept) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.facultyAdvisorName && c.facultyAdvisorName.toLowerCase().includes(q))
    );
  });

  const handleSelectFaculty = (classId: string, facultyId: string) => {
    setAssignments(prev => ({
      ...prev,
      [classId]: facultyId,
    }));
  };

  const handleSaveAssignment = async (classGroup: ClassGroup) => {
    const classId = classGroup.id || classGroup._id || '';
    const facultyId = assignments[classId] !== undefined ? assignments[classId] : (classGroup.facultyAdvisorId || '');

    setIsSaving(classId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await onAssignFacultyToClass(classId, facultyId);
      const facObj = faculties.find(f => f.id === facultyId);
      setSuccessMessage(`Section "${classGroup.name}" assigned to ${facObj ? facObj.name : 'Unassigned'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update faculty assignment');
    } finally {
      setIsSaving(null);
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
            <span>Faculty Delegation</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-500" />
            Class & Faculty Assigning
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Map faculty advisors to specific sections to grant them cohort oversight, submission tracking, and analytics access.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search classes or advisors..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-medium text-slate-800"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500 shrink-0">Department:</label>
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-semibold text-slate-800"
          >
            <option value="all">All Departments</option>
            <option value="Computer Science and Engineering">CSE</option>
            <option value="Artificial Intelligence and Data Science">AI & DS</option>
            <option value="Information Technology">IT</option>
          </select>
        </div>
      </div>

      {/* Class Assignment List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No classes found</p>
            <p className="text-xs text-slate-400 mt-1">Add classes in the Add Class tab to begin assigning advisors.</p>
          </div>
        ) : (
          filteredClasses.map(c => {
            const classId = c.id || c._id || '';
            const currentVal = assignments[classId] !== undefined ? assignments[classId] : (c.facultyAdvisorId || '');
            const classStudents = students.filter(s => s.classId === classId || s.className === c.name);
            const isModified = assignments[classId] !== undefined && assignments[classId] !== (c.facultyAdvisorId || '');

            return (
              <div
                key={classId}
                className={`bg-white p-5 rounded-xl border transition-all ${
                  isModified ? 'border-amber-400 shadow-sm ring-1 ring-amber-400/20' : 'border-slate-200/80 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-slate-900">{c.name}</span>
                      <span className="font-mono text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                        {c.code}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-2">
                      <span>{c.department}</span>
                      <span>•</span>
                      <span>Batch {c.batch}</span>
                      <span>•</span>
                      <span className="font-bold text-slate-700">{classStudents.length} Students</span>
                    </div>
                  </div>

                  <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                    Target: {c.targetSolvedAverage} Solved
                  </span>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                      <span>Assigned Faculty Advisor</span>
                    </label>
                    <select
                      value={currentVal}
                      onChange={e => handleSelectFaculty(classId, e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-medium text-slate-900"
                    >
                      <option value="">-- No Advisor Assigned --</option>
                      {activeFaculties.map(f => {
                        const fId = f.id || f._id || '';
                        return (
                          <option key={fId} value={fId}>
                            {f.name} ({f.designation} - {f.department})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-slate-400">
                      {c.facultyAdvisorName ? (
                        <span>Current: <strong className="text-slate-700">{c.facultyAdvisorName}</strong></span>
                      ) : (
                        <span className="text-amber-600 font-medium">Currently unassigned</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSaveAssignment(c)}
                      disabled={isSaving === classId || !isModified}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        isModified
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <span>{isSaving === classId ? 'Updating...' : 'Save Assignment'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
