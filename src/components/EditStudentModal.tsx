import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, User, Building2, BookOpen } from 'lucide-react';
import { Student, ClassGroup, Faculty } from '../types';

interface EditStudentModalProps {
  student: Student | null;
  classes: ClassGroup[];
  faculties: Faculty[];
  isOpen: boolean;
  onClose: () => void;
  onSaveStudent: (id: string, updatedData: Partial<Student>) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  classes,
  faculties,
  isOpen,
  onClose,
  onSaveStudent,
}) => {
  if (!isOpen || !student) return null;

  const [name, setName] = useState(student.name);
  const [rollNo, setRollNo] = useState(student.rollNo);
  const [leetcodeUsername, setLeetcodeUsername] = useState(student.leetcodeUsername);
  const [department, setDepartment] = useState(student.department);
  const [batch, setBatch] = useState(student.batch);
  const [classId, setClassId] = useState(student.classId || '');
  const [email, setEmail] = useState(student.email);
  const [weeklyGoal, setWeeklyGoal] = useState(student.weeklyGoal || 10);
  const [totalSolved, setTotalSolved] = useState(student.totalSolved);
  const [easySolved, setEasySolved] = useState(student.easySolved);
  const [mediumSolved, setMediumSolved] = useState(student.mediumSolved);
  const [hardSolved, setHardSolved] = useState(student.hardSolved);
  const [contestRating, setContestRating] = useState(student.contestRating);

  useEffect(() => {
    if (student) {
      setName(student.name);
      setRollNo(student.rollNo);
      setLeetcodeUsername(student.leetcodeUsername);
      setDepartment(student.department);
      setBatch(student.batch);
      setClassId(student.classId || '');
      setEmail(student.email);
      setWeeklyGoal(student.weeklyGoal || 10);
      setTotalSolved(student.totalSolved);
      setEasySolved(student.easySolved);
      setMediumSolved(student.mediumSolved);
      setHardSolved(student.hardSolved);
      setContestRating(student.contestRating);
    }
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClass = classes.find(c => c.id === classId || c._id === classId);
    const faculty = faculties.find(f => f.id === selectedClass?.facultyAdvisorId || f._id === selectedClass?.facultyAdvisorId);

    const updatedData: Partial<Student> = {
      name: name.trim(),
      rollNo: rollNo.trim().toUpperCase(),
      leetcodeUsername: leetcodeUsername.trim(),
      department,
      batch,
      classId: selectedClass ? (selectedClass.id || selectedClass._id) : undefined,
      className: selectedClass?.name,
      section: selectedClass?.section,
      facultyAdvisorId: faculty ? (faculty.id || faculty._id) : undefined,
      facultyAdvisorName: faculty?.name,
      email: email.trim(),
      weeklyGoal: Number(weeklyGoal),
      totalSolved: Number(totalSolved),
      easySolved: Number(easySolved),
      mediumSolved: Number(mediumSolved),
      hardSolved: Number(hardSolved),
      contestRating: Number(contestRating),
    };

    onSaveStudent(student.id || student._id!, updatedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500 text-white">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Edit Student Record</h2>
              <p className="text-xs text-slate-500">Update academic details, LeetCode handle, and class allocation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Name & Roll No */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Roll Number *
              </label>
              <input
                type="text"
                value={rollNo}
                onChange={e => setRollNo(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* LeetCode Handle & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                LeetCode Handle *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">@</span>
                <input
                  type="text"
                  value={leetcodeUsername}
                  onChange={e => setLeetcodeUsername(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                College Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Class / Section Allocation & Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Class / Section Allocation
              </label>
              <select
                value={classId}
                onChange={e => setClassId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="">-- Select Class --</option>
                {classes.map(c => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Batch
              </label>
              <input
                type="text"
                value={batch}
                onChange={e => setBatch(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
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
              <option value="Computer Science and Engineering">Computer Science and Engineering (CSE)</option>
              <option value="Information Technology">Information Technology (IT)</option>
              <option value="Artificial Intelligence and Data Science">Artificial Intelligence & Data Science (AI & DS)</option>
              <option value="Electronics and Communication Engineering">Electronics & Communication (ECE)</option>
            </select>
          </div>

          {/* Solved Statistics Overrides */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              LeetCode Statistics & Rating
            </span>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-semibold mb-1">Total</label>
                <input
                  type="number"
                  value={totalSolved}
                  onChange={e => setTotalSolved(Number(e.target.value))}
                  className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-emerald-600 font-semibold mb-1">Easy</label>
                <input
                  type="number"
                  value={easySolved}
                  onChange={e => setEasySolved(Number(e.target.value))}
                  className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-amber-600 font-semibold mb-1">Medium</label>
                <input
                  type="number"
                  value={mediumSolved}
                  onChange={e => setMediumSolved(Number(e.target.value))}
                  className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-rose-600 font-semibold mb-1">Hard</label>
                <input
                  type="number"
                  value={hardSolved}
                  onChange={e => setHardSolved(Number(e.target.value))}
                  className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-semibold mb-1">Contest Rating</label>
                <input
                  type="number"
                  value={contestRating}
                  onChange={e => setContestRating(Number(e.target.value))}
                  className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-500 font-semibold mb-1">Weekly Target Goal</label>
                <input
                  type="number"
                  value={weeklyGoal}
                  onChange={e => setWeeklyGoal(Number(e.target.value))}
                  className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
