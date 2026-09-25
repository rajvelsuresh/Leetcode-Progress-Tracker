import React, { useState } from 'react';
import { Building2, Plus, Sparkles, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { ClassGroup, Faculty } from '../../types';

interface AddClassViewProps {
  classes: ClassGroup[];
  faculties: Faculty[];
  onAddClass: (classData: Partial<ClassGroup>) => Promise<void> | void;
  onDeleteClass?: (classId: string) => Promise<void> | void;
}

export const AddClassView: React.FC<AddClassViewProps> = ({
  classes,
  faculties,
  onAddClass,
  onDeleteClass,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [section, setSection] = useState('A');
  const [batch, setBatch] = useState('2022-2026');
  const [targetSolvedAverage, setTargetSolvedAverage] = useState(450);
  const [facultyAdvisorId, setFacultyAdvisorId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [classToDelete, setClassToDelete] = useState<ClassGroup | null>(null);

  // Auto-generate code when name/section/batch change
  const handleNameChange = (val: string) => {
    setName(val);
    const shortDept = val.includes('CSE') ? 'CSE' : val.includes('AI') ? 'AIDS' : val.includes('IT') ? 'IT' : 'ENG';
    setCode(`${shortDept}-${section}-${batch.slice(-4)}`);
  };

  const handleSectionChange = (val: string) => {
    setSection(val);
    const shortDept = department.includes('Computer') ? 'CSE' : department.includes('Artificial') ? 'AIDS' : 'IT';
    setCode(`${shortDept}-${val}-${batch.slice(-4)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Class name is required (e.g., "CSE - Section C")');
      return;
    }
    if (!code.trim()) {
      setErrorMsg('Class code is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const selectedFaculty = faculties.find(f => f.id === facultyAdvisorId);
      await onAddClass({
        name: name.trim(),
        code: code.trim(),
        department,
        section,
        batch,
        targetSolvedAverage: Number(targetSolvedAverage) || 400,
        facultyAdvisorId: facultyAdvisorId || undefined,
        facultyAdvisorName: selectedFaculty ? selectedFaculty.name : undefined,
      });

      setSuccessMsg(`Class "${name}" created successfully!`);
      // Reset form
      setName('');
      setCode('');
      setFacultyAdvisorId('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create class');
    } finally {
      setIsSubmitting(false);
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
            <span>Academic Cohort Setup</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            Add Class / Section
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create new academic batches and sections, assign faculty advisors, and set LeetCode solve targets.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 shrink-0">
          Total Classes: <strong className="text-slate-900 font-bold">{classes.length}</strong>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-500" />
            New Class Details
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Class Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE - Section C"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Class Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE-C-2026"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={e => {
                    setDepartment(e.target.value);
                    const shortDept = e.target.value.includes('Computer') ? 'CSE' : e.target.value.includes('Artificial') ? 'AIDS' : 'IT';
                    setCode(`${shortDept}-${section}-${batch.slice(-4)}`);
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                >
                  <option value="Computer Science and Engineering">Computer Science & Engg</option>
                  <option value="Artificial Intelligence and Data Science">AI & Data Science</option>
                  <option value="Information Technology">Information Technology</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Section
                </label>
                <select
                  value={section}
                  onChange={e => handleSectionChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batch Year
                </label>
                <input
                  type="text"
                  value={batch}
                  onChange={e => {
                    setBatch(e.target.value);
                    const shortDept = department.includes('Computer') ? 'CSE' : department.includes('Artificial') ? 'AIDS' : 'IT';
                    setCode(`${shortDept}-${section}-${e.target.value.slice(-4)}`);
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                  placeholder="2022-2026"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faculty Advisor / Mentor
                </label>
                <select
                  value={facultyAdvisorId}
                  onChange={e => setFacultyAdvisorId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                >
                  <option value="">-- Assign Faculty Advisor Later --</option>
                  {faculties.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.staffId} - {f.department.slice(0, 15)}...)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target LeetCode Solved Average
                </label>
                <input
                  type="number"
                  min="50"
                  max="2000"
                  value={targetSolvedAverage}
                  onChange={e => setTargetSolvedAverage(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating Class...' : 'Create Class'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Existing Classes List */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
            <span>Existing Academic Batches</span>
            <span className="text-xs font-mono text-slate-400">{classes.length} registered</span>
          </h3>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {classes.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No classes registered yet.
              </div>
            ) : (
              classes.map(c => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {c.name}
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                        {c.code}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-2">
                      <span>Batch {c.batch}</span>
                      <span>•</span>
                      <span>Advisor: <strong className="text-slate-700">{c.facultyAdvisorName || 'Unassigned'}</strong></span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      Target Solved Avg: {c.targetSolvedAverage}
                    </div>
                  </div>

                  {onDeleteClass && (
                    <button
                      onClick={() => setClassToDelete(c)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Class Confirmation Modal */}
      {classToDelete && onDeleteClass && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Class</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete class <strong className="text-slate-800">{classToDelete.name}</strong> ({classToDelete.code})?
              </p>
              <p className="text-[11px] text-rose-600 font-medium">Students enrolled in this section will become unassigned.</p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setClassToDelete(null)}
                className="flex-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onDeleteClass(classToDelete.id || classToDelete._id!);
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

    </div>
  );
};
