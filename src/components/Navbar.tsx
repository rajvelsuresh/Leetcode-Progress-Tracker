import React from 'react';
import { 
  Trophy, 
  BarChart3, 
  Activity, 
  Users, 
  UserPlus, 
  Upload, 
  Download, 
  RefreshCw,
  Flame,
  Code2,
  Building2,
  GraduationCap,
  Database
} from 'lucide-react';
import { Student, ClassGroup, Faculty } from '../types';

export type NavTab = 'leaderboard' | 'statistics' | 'submissions' | 'classes' | 'faculties' | 'students';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  students: Student[];
  classes?: ClassGroup[];
  faculties?: Faculty[];
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onExportCSV: () => void;
  onSyncAll: () => void;
  isSyncingAll: boolean;
  isServerConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  students,
  classes = [],
  faculties = [],
  onOpenAddModal,
  onOpenImportModal,
  onExportCSV,
  onSyncAll,
  isSyncingAll,
  isServerConnected = true,
}) => {
  const activeStreaksCount = students.filter(s => s.streakDays >= 7).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Code2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  LeetTrack
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 rounded-full border border-amber-200/60">
                  MERN Stack
                </span>
                {isServerConnected && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>API Connected</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                College LeetCode Progress, Class Cohorts & Faculty Oversight
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            <button
              id="sync-all-btn"
              onClick={onSyncAll}
              disabled={isSyncingAll}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                isSyncingAll 
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
              }`}
              title="Sync live stats from LeetCode"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin text-amber-500' : 'text-slate-500'}`} />
              <span className="hidden md:inline">{isSyncingAll ? 'Syncing...' : 'Sync Live'}</span>
            </button>

            <button
              id="export-csv-btn"
              onClick={onExportCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all shadow-xs"
              title="Export leaderboard and problem statistics as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Export CSV</span>
            </button>

            <button
              id="import-csv-btn"
              onClick={onOpenImportModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all shadow-xs"
              title="Bulk import student roster from CSV"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Bulk Import</span>
            </button>

            <button
              id="add-student-btn"
              onClick={onOpenAddModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm hover:shadow transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Student</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-t border-slate-100 py-2 overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 sm:space-x-1.5">
            <button
              id="tab-leaderboard"
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboard</span>
            </button>

            <button
              id="tab-statistics"
              onClick={() => setActiveTab('statistics')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'statistics'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Problem Statistics</span>
            </button>

            <button
              id="tab-submissions"
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'submissions'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Recent 40 Submissions</span>
            </button>

            <button
              id="tab-classes"
              onClick={() => setActiveTab('classes')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'classes'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Classwise List ({classes.length})</span>
            </button>

            <button
              id="tab-faculties"
              onClick={() => setActiveTab('faculties')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'faculties'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Faculties ({faculties.length})</span>
            </button>

            <button
              id="tab-students"
              onClick={() => setActiveTab('students')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'students'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Student Roster ({students.length})</span>
            </button>
          </nav>

          {/* Quick Indicator */}
          <div className="hidden xl:flex items-center space-x-4 text-xs text-slate-500 pl-4">
            <div className="flex items-center space-x-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span><strong className="text-slate-800">{activeStreaksCount}</strong> active streaks</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <div>
              Students: <strong className="text-slate-800">{students.length}</strong>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
