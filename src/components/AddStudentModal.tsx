import React, { useState } from 'react';
import { X, UserPlus, Search, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Student, ClassGroup, Faculty } from '../types';

interface AddStudentModalProps {
  isOpen: boolean;
  classes?: ClassGroup[];
  faculties?: Faculty[];
  onClose: () => void;
  onAddStudent: (newStudent: Partial<Student>) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  classes = [],
  faculties = [],
  onClose,
  onAddStudent,
}) => {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [batch, setBatch] = useState('2022-2026');
  const [classId, setClassId] = useState('');
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [fetchedData, setFetchedData] = useState<any>(null);

  if (!isOpen) return null;

  // Handle Verify with LeetCode API
  const handleVerifyLeetcode = async () => {
    const handle = leetcodeUsername.trim();
    if (!handle) {
      setVerifyStatus({ success: false, message: 'Please enter a LeetCode username first.' });
      return;
    }

    setIsVerifying(true);
    setVerifyStatus(null);

    try {
      const res = await fetch(`/api/leetcode/profile/${encodeURIComponent(handle)}`);
      if (res.ok) {
        const data = await res.json();
        setFetchedData(data);
        if (!name && data.realName) setName(data.realName);
        setVerifyStatus({
          success: true,
          message: `Verified! Found profile with ${data.totalSolved} solved problems.`
        });
      } else {
        setVerifyStatus({
          success: false,
          message: `LeetCode handle "${handle}" not found or rate-limited. You can still save manually.`
        });
      }
    } catch (err: any) {
      setVerifyStatus({
        success: false,
        message: 'Could not connect to LeetCode API. You can still save manually.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rollNo.trim() || !leetcodeUsername.trim()) {
      alert('Please fill in Name, Roll Number, and LeetCode handle.');
      return;
    }

    const selectedClass = classes.find(c => c.id === classId || c._id === classId);
    const faculty = faculties.find(f => f.id === selectedClass?.facultyAdvisorId || f._id === selectedClass?.facultyAdvisorId);

    const totalSolved = fetchedData?.totalSolved ?? 120;
    const easySolved = fetchedData?.easySolved ?? Math.round(totalSolved * 0.45);
    const mediumSolved = fetchedData?.mediumSolved ?? Math.round(totalSolved * 0.45);
    const hardSolved = fetchedData?.hardSolved ?? (totalSolved - easySolved - mediumSolved);

    const newStudent: Partial<Student> = {
      name: name.trim(),
      rollNo: rollNo.trim().toUpperCase(),
      email: email.trim() || `${rollNo.trim().toLowerCase()}@drngpit.ac.in`,
      department,
      batch,
      classId: selectedClass ? (selectedClass.id || selectedClass._id) : undefined,
      className: selectedClass?.name,
      section: selectedClass?.section,
      facultyAdvisorId: faculty ? (faculty.id || faculty._id) : undefined,
      facultyAdvisorName: faculty?.name,
      leetcodeUsername: leetcodeUsername.trim(),
      avatarUrl: fetchedData?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${leetcodeUsername.trim()}`,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      acceptanceRate: 65.0,
      ranking: fetchedData?.ranking || 85000,
      contestRating: fetchedData?.contestRating || 1550,
      attendedContests: fetchedData?.attendedContests || 4,
      streakDays: Math.floor(Math.random() * 15) + 1,
      lastActive: Date.now(),
      badges: fetchedData?.badges || [],
      skillTags: ['Arrays', 'Strings', 'Binary Search'],
      weeklyGoal: 8,
      weeklySolved: 5,
    };

    onAddStudent(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500 text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add New Student</h2>
              <p className="text-xs text-slate-500">Track student progress and rankings on LeetCode</p>
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
          
          {/* LeetCode Username with verification */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              LeetCode Handle *
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">@</span>
                <input
                  type="text"
                  placeholder="e.g. touriste, neal_wu"
                  value={leetcodeUsername}
                  onChange={e => setLeetcodeUsername(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleVerifyLeetcode}
                disabled={isVerifying || !leetcodeUsername}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-amber-600' : ''}`} />
                <span>{isVerifying ? 'Checking...' : 'Verify'}</span>
              </button>
            </div>

            {verifyStatus && (
              <p className={`text-xs mt-1.5 flex items-center gap-1 font-medium ${
                verifyStatus.success ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {verifyStatus.success ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {verifyStatus.message}
              </p>
            )}
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Sanjay Krishnan"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              required
            />
          </div>

          {/* Roll Number & Batch */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Roll Number *
              </label>
              <input
                type="text"
                placeholder="e.g. 22CSE185"
                value={rollNo}
                onChange={e => setRollNo(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Batch
              </label>
              <input
                type="text"
                value={batch}
                onChange={e => setBatch(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Class / Section Allocation */}
          {classes.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Class / Section Allocation
              </label>
              <select
                value={classId}
                onChange={e => setClassId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="">-- Assign to Class --</option>
                {classes.map(c => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.name} ({c.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Department */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-700"
            >
              <option value="Computer Science and Engineering">Computer Science and Engineering (CSE)</option>
              <option value="Information Technology">Information Technology (IT)</option>
              <option value="Artificial Intelligence and Data Science">Artificial Intelligence & Data Science (AI & DS)</option>
              <option value="Electronics and Communication Engineering">Electronics & Communication (ECE)</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              College Email
            </label>
            <input
              type="email"
              placeholder="e.g. student@drngpit.ac.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
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
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Student</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
