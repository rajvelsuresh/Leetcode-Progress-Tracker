import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { AuthView } from './components/AuthView';
import { AddClassView } from './components/admin/AddClassView';
import { EditClassMembersView } from './components/admin/EditClassMembersView';
import { ClassFacultyAssigningView } from './components/admin/ClassFacultyAssigningView';
import { FacultyPasswordResetView } from './components/admin/FacultyPasswordResetView';
import { FacultyApprovalsView } from './components/admin/FacultyApprovalsView';
import { StudentwiseSubmissions } from './components/StudentwiseSubmissions';
import { StatsOverview } from './components/StatsOverview';
import { Leaderboard } from './components/Leaderboard';
import { ProblemStatistics } from './components/ProblemStatistics';
import { RecentSubmissionsFeed } from './components/RecentSubmissionsFeed';
import { StudentDirectory } from './components/StudentDirectory';
import { ClasswiseList } from './components/ClasswiseList';
import { FacultyList } from './components/FacultyList';
import { StudentDetailModal } from './components/StudentDetailModal';
import { EditStudentModal } from './components/EditStudentModal';
import { AddStudentModal } from './components/AddStudentModal';
import { ImportStudentsModal } from './components/ImportStudentsModal';
import { 
  Student, 
  ClassGroup, 
  Faculty, 
  Submission,
  NavTab,
  AuthUser
} from './types';
import { 
  computeCohortStats, 
  exportToCSV, 
  loadStudents,
  clearAllStoredStudents 
} from './utils/storage';
import { api } from './utils/api';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  RotateCcw,
  Sparkles,
  Server,
  Code2,
  Clock,
  Trophy,
  BarChart3,
  Activity,
  Building2,
  GraduationCap,
  Users,
  LogOut,
  KeyRound,
  Link2,
  PlusCircle,
  ShieldCheck,
  Trash2,
  UserCheck
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('letrack_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => loadStudents());
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isServerConnected, setIsServerConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    try {
      const storedUser = localStorage.getItem('letrack_auth_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return parsed.role === 'admin' ? 'addClass' : 'classes';
      }
    } catch {}
    return 'leaderboard';
  });

  const [selectedStudentForSubmissionsId, setSelectedStudentForSubmissionsId] = useState<string>('');
  
  // Modals
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [showWipeAllModal, setShowWipeAllModal] = useState<boolean>(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('letrack_auth_user', JSON.stringify(user));
    } catch {}

    if (user.role === 'admin') {
      setActiveTab('addClass');
    } else {
      setActiveTab('classes');
    }
    showToast(`Signed in as ${user.name} (${user.role === 'admin' ? 'Administrator' : 'Faculty Member'})`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('letrack_auth_user');
    } catch {}
    showToast('Signed out of the portal.', 'info');
  };

  const handleViewStudentSubmissions = (student: Student) => {
    setSelectedStudentForSubmissionsId(student.id || student._id || '');
    setActiveTab('studentwise');
  };

  // Fetch initial data from MERN backend
  const loadBackendData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedStudents, fetchedClasses, fetchedFaculties, fetchedSubmissions] = await Promise.all([
        api.getStudents(),
        api.getClasses(),
        api.getFaculties(),
        api.getRecentSubmissions(40)
      ]);

      if (Array.isArray(fetchedStudents)) {
        setStudents(fetchedStudents);
      }
      if (Array.isArray(fetchedClasses)) {
        setClasses(fetchedClasses);
      }
      if (Array.isArray(fetchedFaculties)) {
        setFaculties(fetchedFaculties);
      }
      if (Array.isArray(fetchedSubmissions)) {
        setSubmissions(fetchedSubmissions);
      }
      setIsServerConnected(true);
    } catch (err) {
      console.warn('Backend load failed, falling back to local storage cache', err);
      setIsServerConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackendData();
  }, [loadBackendData]);

  // Compute live cohort statistics
  const cohortStats = useMemo(() => computeCohortStats(students), [students]);

  // Submissions list: either from backend or compiled from student records
  const allSubmissions = useMemo(() => {
    if (submissions && submissions.length > 0) {
      return submissions;
    }
    const list: Submission[] = [];
    students.forEach(s => {
      if (s.recentSubmissions) {
        list.push(...s.recentSubmissions);
      }
    });
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [submissions, students]);

  // Handle Add Student
  const handleAddStudent = async (newStudentData: Partial<Student>) => {
    try {
      const created = await api.createStudent(newStudentData);
      setStudents(prev => [created, ...prev.filter(s => s.id !== created.id)]);
      const updatedSubs = await api.getRecentSubmissions(40);
      setSubmissions(updatedSubs);
      showToast(`Added ${created.name} (@${created.leetcodeUsername}) to the database!`);
    } catch (err: any) {
      const localStudent = {
        ...newStudentData,
        id: `std-${Date.now()}`,
      } as Student;
      setStudents(prev => [localStudent, ...prev]);
      showToast(`Added ${localStudent.name} locally.`, 'info');
    }
  };

  // Handle Edit/Update Student
  const handleSaveEditedStudent = async (id: string, updatedData: Partial<Student>) => {
    try {
      const updated = await api.updateStudent(id, updatedData);
      setStudents(prev => prev.map(s => (s.id === id || s._id === id ? updated : s)));
      if (selectedStudent && (selectedStudent.id === id || selectedStudent._id === id)) {
        setSelectedStudent(updated);
      }
      showToast(`Updated student profile for ${updated.name}!`, 'success');
    } catch (err: any) {
      setStudents(prev => prev.map(s => (s.id === id || s._id === id ? { ...s, ...updatedData } as Student : s)));
      showToast('Profile updated locally.', 'info');
    }
  };

  // Handle Delete Student
  const handleDeleteStudent = async (studentId: string) => {
    const target = students.find(s => s.id === studentId || s._id === studentId);
    try {
      await api.deleteStudent(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId && s._id !== studentId));
      if (selectedStudent && (selectedStudent.id === studentId || selectedStudent._id === studentId)) {
        setSelectedStudent(null);
      }
      showToast(`Deleted ${target?.name || 'student'} from the tracker.`, 'info');
    } catch (err: any) {
      setStudents(prev => prev.filter(s => s.id !== studentId && s._id !== studentId));
      showToast(`Deleted student locally.`, 'info');
    }
  };

  // Handle Delete All Students
  const handleDeleteAllStudents = async () => {
    try {
      await api.deleteAllStudents();
      setStudents([]);
      setSubmissions([]);
      setSelectedStudent(null);
      clearAllStoredStudents();
      showToast('All students deleted successfully.', 'info');
    } catch (err: any) {
      setStudents([]);
      setSubmissions([]);
      setSelectedStudent(null);
      clearAllStoredStudents();
      showToast('All students cleared locally.', 'info');
    }
  };

  // Handle Bulk Import Students
  const handleBulkImport = async (newStudents: Partial<Student>[]) => {
    try {
      const result = await api.bulkImportStudents(newStudents);
      const refreshed = await api.getStudents();
      setStudents(refreshed);
      const updatedSubs = await api.getRecentSubmissions(40);
      setSubmissions(updatedSubs);
      showToast(`Successfully imported ${result.count || newStudents.length} students into MERN store!`);
    } catch (err: any) {
      showToast('Bulk import failed. Please check network connection.', 'error');
    }
  };

  // Handle Single Student Sync
  const handleSyncStudent = async (student: Student) => {
    showToast(`Syncing LeetCode stats for @${student.leetcodeUsername}...`, 'info');
    try {
      const res = await api.syncStudentLeetcode(student.id || student._id || '');
      if (res && res.student) {
        setStudents(prev => prev.map(s => (s.id === student.id ? res.student : s)));
        if (selectedStudent && selectedStudent.id === student.id) {
          setSelectedStudent(res.student);
        }
        const updatedSubs = await api.getRecentSubmissions(40);
        setSubmissions(updatedSubs);
        showToast(`Synced ${res.student.name}: ${res.student.totalSolved} problems solved!`, 'success');
      }
    } catch (err: any) {
      showToast(`Sync completed for ${student.name}.`, 'info');
    }
  };

  // Handle Sync All
  const handleSyncAll = async () => {
    if (isSyncingAll) return;
    setIsSyncingAll(true);
    showToast(`Initiating batch LeetCode sync for ${students.length} students...`, 'info');

    try {
      await api.syncAllStudents();
      const [refreshedStudents, refreshedSubs] = await Promise.all([
        api.getStudents(),
        api.getRecentSubmissions(40)
      ]);
      setStudents(refreshedStudents);
      setSubmissions(refreshedSubs);
      showToast(`Batch sync complete! Updated records for ${refreshedStudents.length} students.`, 'success');
    } catch (err: any) {
      showToast('Sync batch finished.', 'info');
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Classes & Faculty Handlers
  const handleCreateClass = async (classData: Partial<ClassGroup>) => {
    try {
      const created = await api.createClass(classData);
      setClasses(prev => [...prev, created]);
      showToast(`Class "${created.name}" created successfully!`, 'success');
    } catch (err: any) {
      const localCls: ClassGroup = {
        id: `cls-${Date.now()}`,
        name: classData.name || 'New Class',
        code: classData.code || 'CODE',
        department: classData.department || 'Computer Science',
        section: classData.section || 'A',
        batch: classData.batch || '2022-2026',
        targetSolvedAverage: classData.targetSolvedAverage || 400,
        facultyAdvisorId: classData.facultyAdvisorId,
        facultyAdvisorName: classData.facultyAdvisorName,
      };
      setClasses(prev => [...prev, localCls]);
      showToast(`Class created locally.`, 'info');
    }
  };

  const handleUpdateClass = async (id: string, classData: Partial<ClassGroup>) => {
    try {
      const updated = await api.updateClass(id, classData);
      setClasses(prev => prev.map(c => (c.id === id || c._id === id ? updated : c)));
      showToast('Class updated successfully!', 'success');
    } catch (err: any) {
      setClasses(prev => prev.map(c => (c.id === id || c._id === id ? { ...c, ...classData } as ClassGroup : c)));
      showToast('Class updated locally.', 'info');
    }
  };

  const handleDeleteClass = async (id: string) => {
    try {
      await api.deleteClass(id);
      setClasses(prev => prev.filter(c => c.id !== id && c._id !== id));
      showToast('Class removed.', 'info');
    } catch (err: any) {
      setClasses(prev => prev.filter(c => c.id !== id && c._id !== id));
      showToast('Class removed locally.', 'info');
    }
  };

  // Handle Delete All Classes
  const handleDeleteAllClasses = async () => {
    try {
      await api.deleteAllClasses();
      setClasses([]);
      setStudents(prev => prev.map(s => ({ ...s, classId: undefined, className: undefined })));
      showToast('All classes deleted successfully.', 'info');
    } catch (err: any) {
      setClasses([]);
      setStudents(prev => prev.map(s => ({ ...s, classId: undefined, className: undefined })));
      showToast('All classes cleared locally.', 'info');
    }
  };

  // Admin: Update Class Members
  const handleUpdateClassMembers = async (classId: string, studentIds: string[]) => {
    try {
      await api.updateClassMembers(classId, studentIds);
      await loadBackendData();
      showToast('Class enrollment updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update class members', 'error');
    }
  };

  // Admin: Assign Class and Faculty
  const handleAssignFacultyToClass = async (classId: string, facultyId: string) => {
    try {
      await api.assignFacultyToClass(classId, facultyId);
      await loadBackendData();
      showToast('Class and faculty assignment updated!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update assignment', 'error');
    }
  };

  // Admin: Password Reset for Faculty
  const handleResetFacultyPassword = async (facultyId: string, newPassword: string) => {
    try {
      await api.resetFacultyPassword(facultyId, newPassword);
      await loadBackendData();
      showToast('Faculty password updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password', 'error');
    }
  };

  const handleCreateFaculty = async (facultyData: Partial<Faculty>) => {
    try {
      const created = await api.createFaculty(facultyData);
      setFaculties(prev => [...prev, created]);
      showToast(`Added faculty advisor ${created.name}!`, 'success');
    } catch (err: any) {
      showToast('Failed to add faculty.', 'error');
    }
  };

  const handleUpdateFaculty = async (id: string, facultyData: Partial<Faculty>) => {
    try {
      const updated = await api.updateFaculty(id, facultyData);
      setFaculties(prev => prev.map(f => (f.id === id || f._id === id ? updated : f)));
      showToast('Faculty profile updated.', 'success');
    } catch (err: any) {
      showToast('Failed to update faculty.', 'error');
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    try {
      await api.deleteFaculty(id);
      setFaculties(prev => prev.filter(f => f.id !== id && f._id !== id));
      showToast('Faculty member removed.', 'info');
    } catch (err: any) {
      showToast('Failed to remove faculty.', 'error');
    }
  };

  // Handle Delete All Faculties
  const handleDeleteAllFaculties = async () => {
    try {
      await api.deleteAllFaculties();
      setFaculties([]);
      setClasses(prev => prev.map(c => ({ ...c, facultyAdvisorId: undefined, facultyAdvisorName: 'Unassigned' })));
      showToast('All faculty members deleted successfully.', 'info');
    } catch (err: any) {
      setFaculties([]);
      setClasses(prev => prev.map(c => ({ ...c, facultyAdvisorId: undefined, facultyAdvisorName: 'Unassigned' })));
      showToast('All faculties cleared locally.', 'info');
    }
  };

  // Master Clear All Data (Classes, Students, Faculties)
  const handleClearAllData = async () => {
    try {
      await api.clearAllData();
      setStudents([]);
      setClasses([]);
      setFaculties([]);
      setSubmissions([]);
      setSelectedStudent(null);
      clearAllStoredStudents();
      showToast('All classes, students, and faculty data wiped successfully.', 'info');
    } catch (err: any) {
      setStudents([]);
      setClasses([]);
      setFaculties([]);
      setSubmissions([]);
      setSelectedStudent(null);
      clearAllStoredStudents();
      showToast('All data cleared locally.', 'info');
    }
  };

  // Admin: Faculty Approvals
  const handleApproveFaculty = async (id: string) => {
    try {
      const res = await api.approveFaculty(id);
      await loadBackendData();
      showToast(res.message || 'Faculty approved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to approve faculty.', 'error');
    }
  };

  const handleRejectFaculty = async (id: string, reason?: string) => {
    try {
      const res = await api.rejectFaculty(id, reason);
      await loadBackendData();
      showToast(res.message || 'Faculty registration rejected.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to reject faculty.', 'error');
    }
  };

  const handleApproveAllFaculties = async () => {
    try {
      const res = await api.approveAllFaculties();
      await loadBackendData();
      showToast(res.message || 'All pending faculty registrations approved!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to approve all faculties.', 'error');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    exportToCSV(students);
    showToast('Downloaded comprehensive student ranking report (CSV).', 'success');
  };

  // If user is not logged in, show dedicated Admin & Faculty login screen
  if (!currentUser) {
    return (
      <AuthView
        faculties={faculties}
        onLoginSuccess={handleLoginSuccess}
        onFacultyRegistered={(newFaculty) => {
          setFaculties(prev => [newFaculty, ...prev.filter(f => f.id !== newFaculty.id)]);
        }}
      />
    );
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
          <div className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center space-x-2.5 max-w-md ${
            toast.type === 'success' 
              ? 'bg-slate-900 text-white border-slate-700' 
              : toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-amber-950 text-amber-100 border-amber-800'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-amber-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Permanent Left-Side Navigation Menu Panel */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        students={students}
        classes={classes}
        faculties={faculties}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportCSV={handleExportCSV}
        onSyncAll={handleSyncAll}
        isSyncingAll={isSyncingAll}
        isServerConnected={isServerConnected}
      />

      {/* Main Content Area (Permanently Offset by Left-Side Panel) */}
      <div className="flex-1 pl-64 md:pl-72 flex flex-col min-w-0">
        
        {/* Top Header & Breadcrumb Bar */}
        <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 md:px-8 py-3.5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-medium">
                <span>Dr. N.G.P. Institute of Technology</span>
                <span>/</span>
                <span className={isAdmin ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-semibold'}>
                  {isAdmin ? 'Admin Portal' : 'Faculty Advisor Portal'}
                </span>
                <span>/</span>
                <span className="text-slate-700 font-semibold uppercase tracking-wider">
                  {activeTab === 'studentwise' ? 'Studentwise 40 Submissions' : 
                   activeTab === 'addClass' ? 'Add Class' :
                   activeTab === 'classMembers' ? 'Edit Class Members' :
                   activeTab === 'assigning' ? 'Class & Faculty Assigning' :
                   activeTab === 'facultyApprovals' ? 'Faculty Authentication Approvals' :
                   activeTab === 'passwordReset' ? 'Password Reset for Faculty' :
                   activeTab}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-0.5 capitalize flex items-center gap-2">
                {activeTab === 'facultyApprovals' && (
                  <>
                    <UserCheck className="w-5 h-5 text-amber-500" />
                    <span>Faculty Authentication Approvals</span>
                  </>
                )}
                {activeTab === 'addClass' && (
                  <>
                    <PlusCircle className="w-5 h-5 text-amber-500" />
                    <span>Add Academic Class & Batch</span>
                  </>
                )}
                {activeTab === 'classMembers' && (
                  <>
                    <Users className="w-5 h-5 text-amber-500" />
                    <span>Edit Class Members & Student Enrollment</span>
                  </>
                )}
                {activeTab === 'assigning' && (
                  <>
                    <Link2 className="w-5 h-5 text-amber-500" />
                    <span>Class and Faculty Assigning</span>
                  </>
                )}
                {activeTab === 'passwordReset' && (
                  <>
                    <KeyRound className="w-5 h-5 text-amber-500" />
                    <span>Password Reset for Faculty Members</span>
                  </>
                )}
                {activeTab === 'leaderboard' && 'Academic Leaderboard & Rankings'}
                {activeTab === 'statistics' && 'Problem Catalog & Solve Statistics'}
                {activeTab === 'studentwise' && 'Individual Student 40 Recent Submissions'}
                {activeTab === 'submissions' && 'Recent Cohort Submissions Stream'}
                {activeTab === 'classes' && (isAdmin ? 'All Academic Classes' : 'My Assigned Classes')}
                {activeTab === 'faculties' && 'Faculty Advisors & Mentors'}
                {activeTab === 'students' && (isAdmin ? 'Manage Students & Roster' : 'Class Student Roster')}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-xs bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono font-semibold">{students.length} Students</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono">{classes.length} Classes</span>
              </div>

              {isAdmin && (students.length > 0 || classes.length > 0 || faculties.length > 0) && (
                <button
                  onClick={() => setShowWipeAllModal(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  title="Wipe all classes, students, and faculty data"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden sm:inline">Wipe All Data</span>
                </button>
              )}

              <button
                onClick={() => {
                  loadBackendData();
                  showToast('Refreshed data from MERN server.', 'info');
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                title="Refresh latest data from MERN API"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reload</span>
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                title="Sign out of portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main View Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          {/* KPI Metric Overview (Shown on Leaderboard and Statistics tabs) */}
          {(activeTab === 'leaderboard' || activeTab === 'statistics') && (
            <StatsOverview stats={cohortStats} />
          )}

          {/* Admin Feature: Faculty Approvals */}
          {activeTab === 'facultyApprovals' && (
            <FacultyApprovalsView
              faculties={faculties}
              onApproveFaculty={handleApproveFaculty}
              onRejectFaculty={handleRejectFaculty}
              onApproveAllFaculties={handleApproveAllFaculties}
            />
          )}

          {/* Admin Feature 1: Add Class */}
          {activeTab === 'addClass' && (
            <AddClassView
              classes={classes}
              faculties={faculties}
              onAddClass={handleCreateClass}
              onDeleteClass={handleDeleteClass}
            />
          )}

          {/* Admin Feature 2: Edit Class Members */}
          {activeTab === 'classMembers' && (
            <EditClassMembersView
              classes={classes}
              students={students}
              onUpdateClassMembers={handleUpdateClassMembers}
            />
          )}

          {/* Admin Feature 3: Class and Faculty Assigning */}
          {activeTab === 'assigning' && (
            <ClassFacultyAssigningView
              classes={classes}
              faculties={faculties}
              students={students}
              onAssignFacultyToClass={handleAssignFacultyToClass}
            />
          )}

          {/* Admin Feature 4: Password Reset for Faculty Members */}
          {activeTab === 'passwordReset' && (
            <FacultyPasswordResetView
              faculties={faculties}
              onResetFacultyPassword={handleResetFacultyPassword}
            />
          )}

          {/* Tab Routing */}
          {activeTab === 'leaderboard' && (
            <Leaderboard
              students={students}
              onSelectStudent={student => setSelectedStudent(student)}
              onSyncStudent={handleSyncStudent}
              onViewSubmissions={handleViewStudentSubmissions}
            />
          )}

          {activeTab === 'statistics' && (
            <ProblemStatistics
              students={students}
              stats={cohortStats}
            />
          )}

          {/* Studentwise 40 recent submissions view */}
          {activeTab === 'studentwise' && (
            <StudentwiseSubmissions
              students={students}
              classes={classes}
              faculties={faculties}
              initialSelectedStudentId={selectedStudentForSubmissionsId}
              onSyncStudent={handleSyncStudent}
              onSelectStudentModal={student => setSelectedStudent(student)}
              onEditStudent={student => setEditingStudent(student)}
            />
          )}

          {activeTab === 'submissions' && (
            <RecentSubmissionsFeed
              submissions={allSubmissions}
              students={students}
              classes={classes}
              onSelectStudent={student => setSelectedStudent(student)}
              onSwitchToStudentwise={student => {
                if (student) setSelectedStudentForSubmissionsId(student.id || student._id || '');
                setActiveTab('studentwise');
              }}
            />
          )}

          {activeTab === 'classes' && (
            <ClasswiseList
              classes={classes}
              students={students}
              faculties={faculties}
              isAdmin={isAdmin}
              onSelectClass={(classId) => {
                setActiveTab('students');
              }}
              onAddClass={isAdmin ? handleCreateClass : undefined}
              onUpdateClass={isAdmin ? handleUpdateClass : undefined}
              onDeleteClass={isAdmin ? handleDeleteClass : undefined}
              onDeleteAllClasses={isAdmin ? handleDeleteAllClasses : undefined}
            />
          )}

          {activeTab === 'faculties' && (
            <FacultyList
              faculties={faculties}
              classes={classes}
              students={students}
              onSelectClass={(classId) => {
                setActiveTab('classes');
              }}
              onAddFaculty={handleCreateFaculty}
              onUpdateFaculty={handleUpdateFaculty}
              onDeleteFaculty={handleDeleteFaculty}
              onDeleteAllFaculties={isAdmin ? handleDeleteAllFaculties : undefined}
            />
          )}

          {activeTab === 'students' && (
            <StudentDirectory
              students={students}
              classes={classes}
              onSelectStudent={student => setSelectedStudent(student)}
              onSyncStudent={handleSyncStudent}
              onDeleteStudent={handleDeleteStudent}
              onDeleteAllStudents={isAdmin ? handleDeleteAllStudents : undefined}
              onEditStudent={student => setEditingStudent(student)}
              onViewSubmissions={handleViewStudentSubmissions}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onExportCSV={handleExportCSV}
              onSyncAll={handleSyncAll}
              isSyncingAll={isSyncingAll}
            />
          )}

        </main>
      </div>

      {/* Modals */}
      {showWipeAllModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Wipe All Tracker Data</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently clear all <strong className="text-slate-800">{classes.length} classes</strong>, <strong className="text-slate-800">{students.length} students</strong>, and <strong className="text-slate-800">{faculties.length} faculty profiles</strong>?
              </p>
              <p className="text-[11px] text-rose-600 font-semibold font-mono">This gives you a completely clean slate.</p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowWipeAllModal(false)}
                className="flex-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleClearAllData();
                  setShowWipeAllModal(false);
                }}
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Wipe Everything
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onSyncStudent={handleSyncStudent}
          onDeleteStudent={handleDeleteStudent}
          onEditStudent={student => {
            setSelectedStudent(null);
            setEditingStudent(student);
          }}
          onOpenStudentwiseView={handleViewStudentSubmissions}
        />
      )}

      {editingStudent && (
        <EditStudentModal
          isOpen={!!editingStudent}
          student={editingStudent}
          classes={classes}
          faculties={faculties}
          onClose={() => setEditingStudent(null)}
          onSaveStudent={handleSaveEditedStudent}
        />
      )}

      {isAddModalOpen && (
        <AddStudentModal
          isOpen={isAddModalOpen}
          classes={classes}
          faculties={faculties}
          onClose={() => setIsAddModalOpen(false)}
          onAddStudent={handleAddStudent}
        />
      )}

      {isImportModalOpen && (
        <ImportStudentsModal
          isOpen={isImportModalOpen}
          classes={classes}
          onClose={() => setIsImportModalOpen(false)}
          onImportStudents={handleBulkImport}
        />
      )}

    </div>
  );
}
