import React, { useState } from 'react';
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  Building2, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle,
  Briefcase
} from 'lucide-react';
import { Faculty, ClassGroup, Student } from '../types';

interface FacultyListProps {
  faculties: Faculty[];
  classes: ClassGroup[];
  students: Student[];
  onAddFaculty: (facultyData: Partial<Faculty>) => void;
  onUpdateFaculty: (id: string, facultyData: Partial<Faculty>) => void;
  onDeleteFaculty: (id: string) => void;
  onDeleteAllFaculties?: () => void;
  onSelectClass: (classId: string) => void;
}

export const FacultyList: React.FC<FacultyListProps> = ({
  faculties,
  classes,
  students,
  onAddFaculty,
  onUpdateFaculty,
  onDeleteFaculty,
  onDeleteAllFaculties,
  onSelectClass,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  const openAddModal = () => {
    setEditingFaculty(null);
    setName('');
    setStaffId(`FAC-CSE-00${faculties.length + 5}`);
    setDesignation('Assistant Professor');
    setDepartment('Computer Science and Engineering');
    setEmail('');
    setPhone('');
    setSelectedClassIds([]);
    setIsModalOpen(true);
  };

  const openEditModal = (f: Faculty) => {
    setEditingFaculty(f);
    setName(f.name);
    setStaffId(f.staffId);
    setDesignation(f.designation);
    setDepartment(f.department);
    setEmail(f.email);
    setPhone(f.phone || '');
    setSelectedClassIds(f.assignedClassIds || []);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedClassNames = classes
      .filter(c => selectedClassIds.includes(c.id || c._id!))
      .map(c => c.name);

    const payload = {
      name,
      staffId,
      designation,
      department,
      email,
      phone,
      assignedClassIds: selectedClassIds,
      assignedClassNames,
      avatarUrl: editingFaculty?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
    };

    if (editingFaculty) {
      onUpdateFaculty(editingFaculty.id || editingFaculty._id!, payload);
    } else {
      onAddFaculty(payload);
    }
    setIsModalOpen(false);
  };

  const toggleClassSelection = (classId: string) => {
    setSelectedClassIds(prev => 
      prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Faculty Mentors & Department Advisors
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {faculties.length} Advisors
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Faculty members overseeing student coding progression, contest preparation, and class benchmarks.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onDeleteAllFaculties && faculties.length > 0 && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg shadow-2xs transition-all shrink-0"
              title="Delete all faculty records"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Delete All Faculty</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Faculty Member</span>
          </button>
        </div>
      </div>

      {faculties.length === 0 && (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500">
          <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No faculty members found</p>
          <p className="text-xs text-slate-400 mt-1">Click "Add Faculty Member" above to create faculty accounts.</p>
        </div>
      )}

      {/* Faculty Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {faculties.map(faculty => {
          const assignedClasses = classes.filter(c => 
            (faculty.assignedClassIds || []).includes(c.id || c._id!) ||
            c.facultyAdvisorId === faculty.id || c.facultyAdvisorId === faculty._id
          );
          
          const totalMentoredStudents = students.filter(s => 
            assignedClasses.some(c => c.id === s.classId || c._id === s.classId) ||
            s.facultyAdvisorId === faculty.id || s.facultyAdvisorId === faculty._id
          ).length;

          return (
            <div
              key={faculty.id || faculty._id}
              className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={faculty.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${faculty.name}`}
                      alt={faculty.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                    <div>
                      <h3 className="font-bold text-base text-slate-900 tracking-tight">
                        {faculty.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-medium text-amber-700">{faculty.designation}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">{faculty.staffId}</span>
                        {faculty.status === 'pending' && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800">
                            Pending Approval
                          </span>
                        )}
                        {faculty.status === 'rejected' && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-800">
                            Rejected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {faculty.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(faculty)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      title="Edit Faculty"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setFacultyToDelete(faculty)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete Faculty"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contact row */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-center space-x-1 font-mono">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{faculty.email}</span>
                  </div>
                  {faculty.phone && (
                    <div className="flex items-center space-x-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{faculty.phone}</span>
                    </div>
                  )}
                </div>

                {/* Assigned Classes */}
                <div className="mt-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Assigned Classes & Cohorts
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedClasses.length > 0 ? (
                      assignedClasses.map(c => (
                        <button
                          key={c.id || c._id}
                          onClick={() => onSelectClass(c.id || c._id!)}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-700 transition-colors inline-flex items-center space-x-1 border border-slate-200/60"
                        >
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{c.name}</span>
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No classes currently assigned</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom stats summary */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center space-x-1 text-slate-700 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mentoring <strong>{totalMentoredStudents}</strong> active students</span>
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  Active Advisor
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Faculty Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">
                {editingFaculty ? 'Edit Faculty Advisor' : 'Add New Faculty Member'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Dr. R. Suresh"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Staff ID *
                  </label>
                  <input
                    type="text"
                    value={staffId}
                    onChange={e => setStaffId(e.target.value)}
                    placeholder="e.g. FAC-CSE-001"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Designation
                  </label>
                  <select
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="Associate Professor & HoD">Associate Professor & HoD</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor (Sr. Gr)">Assistant Professor (Sr. Gr)</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Technical Trainer / Lead">Technical Trainer / Lead</option>
                  </select>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    College Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. suresh@drngpit.ac.in"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. +91 98422 10123"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Assign Classes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assign Mentored Classes
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {classes.map(c => {
                    const isChecked = selectedClassIds.includes(c.id || c._id!);
                    return (
                      <label 
                        key={c.id || c._id} 
                        className={`flex items-center space-x-2 p-1.5 rounded cursor-pointer text-xs ${
                          isChecked ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleClassSelection(c.id || c._id!)}
                          className="rounded text-amber-500 focus:ring-amber-400"
                        />
                        <span>{c.name}</span>
                      </label>
                    );
                  })}
                </div>
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
                  {editingFaculty ? 'Update Faculty' : 'Save Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Single Faculty Confirmation Modal */}
      {facultyToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Faculty Member</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently remove <strong className="text-slate-800">{facultyToDelete.name}</strong> ({facultyToDelete.staffId}, {facultyToDelete.designation})?
              </p>
              <p className="text-[11px] text-rose-600 font-medium">Assigned class advisories will become unassigned.</p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setFacultyToDelete(null)}
                className="flex-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteFaculty(facultyToDelete.id || facultyToDelete._id!);
                  setFacultyToDelete(null);
                }}
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Delete Faculty
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Faculty Confirmation Modal */}
      {showDeleteAllModal && onDeleteAllFaculties && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete All {faculties.length} Faculty Members</h3>
              <p className="text-xs text-slate-500">
                This will delete every faculty profile and unassign all class advisory roles in the database.
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
                  onDeleteAllFaculties();
                  setShowDeleteAllModal(false);
                }}
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Delete All Faculty
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
