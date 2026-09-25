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
  Clock,
  KeyRound,
  Link2,
  PlusCircle,
  FolderGit2,
  LogOut,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Student, ClassGroup, Faculty, NavTab, AuthUser } from '../types';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  students: Student[];
  classes?: ClassGroup[];
  faculties?: Faculty[];
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onExportCSV: () => void;
  onSyncAll: () => void;
  isSyncingAll: boolean;
  isServerConnected?: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface SidebarItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

interface SidebarSection {
  heading: string;
  items: SidebarItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  students,
  classes = [],
  faculties = [],
  currentUser,
  onLogout,
  onOpenAddModal,
  onOpenImportModal,
  onExportCSV,
  onSyncAll,
  isSyncingAll,
  isServerConnected = true,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const activeStreaksCount = students.filter(s => s.streakDays >= 7).length;
  const isAdmin = currentUser?.role === 'admin';
  const pendingApprovalsCount = faculties.filter(f => f.status === 'pending').length;

  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  // Dedicated menu configuration based on role
  const menuSections: SidebarSection[] = isAdmin
    ? [
        {
          heading: 'Administration Menu',
          items: [
            {
              id: 'facultyApprovals' as NavTab,
              label: 'Faculty Approvals',
              icon: UserCheck,
              badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Pending` : undefined,
              highlight: pendingApprovalsCount > 0,
            },
            {
              id: 'addClass' as NavTab,
              label: 'Add Class',
              icon: PlusCircle,
              highlight: false,
            },
            {
              id: 'classMembers' as NavTab,
              label: 'Edit Class Members',
              icon: Users,
            },
            {
              id: 'assigning' as NavTab,
              label: 'Class & Faculty Assigning',
              icon: Link2,
            },
            {
              id: 'passwordReset' as NavTab,
              label: 'Password Reset for Faculty',
              icon: KeyRound,
              badge: `${faculties.length}`,
            }
          ]
        },
        {
          heading: 'Academic Directories',
          items: [
            {
              id: 'students' as NavTab,
              label: 'Manage Students',
              icon: GraduationCap,
              badge: `${students.length}`
            },
            {
              id: 'classes' as NavTab,
              label: 'Classwise Directory',
              icon: Building2,
              badge: `${classes.length}`
            },
            {
              id: 'faculties' as NavTab,
              label: 'Faculty Advisors',
              icon: UserCheck,
              badge: `${faculties.length}`
            }
          ]
        },
        {
          heading: 'LeetCode Analytics',
          items: [
            {
              id: 'studentwise' as NavTab,
              label: 'Studentwise 40 Submissions',
              icon: Clock,
              badge: 'Audit'
            },
            {
              id: 'leaderboard' as NavTab,
              label: 'Leaderboard',
              icon: Trophy,
              badge: `${students.length}`
            },
            {
              id: 'statistics' as NavTab,
              label: 'Problem Statistics',
              icon: BarChart3
            }
          ]
        }
      ]
    : [
        {
          heading: 'Faculty Advisor Portal',
          items: [
            {
              id: 'classes' as NavTab,
              label: 'My Assigned Classes',
              icon: Building2,
              highlight: true,
              badge: `${classes.length}`
            },
            {
              id: 'studentwise' as NavTab,
              label: 'Studentwise 40 Submissions',
              icon: Clock,
              badge: 'Live Audit'
            },
            {
              id: 'students' as NavTab,
              label: 'Student Roster',
              icon: Users,
              badge: `${students.length}`
            }
          ]
        },
        {
          heading: 'Cohort Performance',
          items: [
            {
              id: 'leaderboard' as NavTab,
              label: 'Academic Leaderboard',
              icon: Trophy,
              badge: `${students.length}`
            },
            {
              id: 'submissions' as NavTab,
              label: 'All Recent Submissions',
              icon: Activity
            },
            {
              id: 'statistics' as NavTab,
              label: 'Problem Statistics',
              icon: BarChart3
            }
          ]
        }
      ];

  return (
    <aside 
      id="left-side-menu-panel"
      className="fixed top-0 bottom-0 left-0 z-30 w-64 md:w-72 bg-white border-r border-slate-200 flex flex-col h-screen select-none"
    >
      
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
            <Code2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                LeetTrack
              </span>
              <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${
                isAdmin 
                  ? 'bg-amber-100 text-amber-900 border-amber-300' 
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300'
              }`}>
                {isAdmin ? 'Admin' : 'Faculty'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">
              Dr. NGP IT CSE Tracker
            </p>
          </div>
        </div>
      </div>

      {/* Server & Streaks Status Banner */}
      <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-[11px] shrink-0">
        <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isServerConnected ? 'MERN Server Live' : 'Local Storage Mode'}</span>
        </div>
        <div className="flex items-center space-x-1 text-orange-600 font-semibold">
          <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
          <span>{activeStreaksCount} Streaks</span>
        </div>
      </div>

      {/* Scrollable Navigation Menus */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              {section.heading}
            </div>

            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div key={item.id} className="space-y-1">
                  <button
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all group ${
                      isActive 
                        ? 'bg-amber-500 text-slate-950 shadow-xs font-bold' 
                        : item.highlight
                        ? 'bg-amber-50/70 hover:bg-amber-100/70 text-amber-950 font-semibold border border-amber-200/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className={`p-1 rounded-md shrink-0 transition-colors ${
                        isActive 
                          ? 'bg-white/30 text-slate-950' 
                          : item.highlight
                          ? 'bg-amber-100 text-amber-700'
                          : 'text-slate-500 group-hover:text-slate-900 group-hover:bg-slate-200/50'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs truncate font-medium">
                        {item.label}
                      </span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-1.5 ${
                        isActive 
                          ? 'bg-slate-950/20 text-slate-950 font-mono' 
                          : item.highlight
                          ? 'bg-amber-200 text-amber-900 font-mono'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 font-mono'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>

                  {/* Sub-actions under Manage Students for quick access */}
                  {item.id === 'students' && (
                    <div className="mt-1 ml-4 pl-3 border-l-2 border-slate-200/80 space-y-1 py-1">
                      <button
                        id="sidebar-manage-add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab('students');
                          onOpenAddModal();
                        }}
                        className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-md text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors group font-medium"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0" />
                        <span>Add New Student</span>
                      </button>
                      <button
                        id="sidebar-manage-import-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab('students');
                          onOpenImportModal();
                        }}
                        className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-md text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors group font-medium"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0" />
                        <span>Import CSV</span>
                      </button>
                      <button
                        id="sidebar-manage-export-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onExportCSV();
                        }}
                        className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-md text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors group font-medium"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0" />
                        <span>Export CSV</span>
                      </button>
                      <button
                        id="sidebar-manage-sync-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSyncAll();
                        }}
                        disabled={isSyncingAll}
                        className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-md text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors group font-medium disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isSyncingAll ? 'animate-spin text-amber-500' : 'text-slate-400 group-hover:text-slate-700'}`} />
                        <span>{isSyncingAll ? 'Syncing...' : 'Sync LeetCode'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User / Profile & Logout Footer */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/80 shrink-0">
        <div className="flex items-center space-x-3 px-2 py-1.5 rounded-lg bg-white border border-slate-200/70 shadow-2xs">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${
            isAdmin
              ? 'bg-gradient-to-tr from-amber-600 to-amber-400'
              : 'bg-gradient-to-tr from-emerald-600 to-emerald-400'
          }`}>
            {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : (isAdmin ? 'AD' : 'FC')}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-800 truncate">
                {currentUser?.name || (isAdmin ? 'Administrator' : 'Faculty Member')}
              </p>
              <span className={`text-[9px] font-mono font-semibold px-1 rounded ${
                isAdmin ? 'text-amber-800 bg-amber-50' : 'text-emerald-700 bg-emerald-50'
              }`}>
                {isAdmin ? 'Admin' : 'Faculty'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 truncate font-mono">
              {currentUser?.email || (isAdmin ? 'admin@drngpit.ac.in' : 'faculty@drngpit.ac.in')}
            </p>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            id="sidebar-logout-btn"
            className="mt-2 w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out ({isAdmin ? 'Admin' : 'Faculty'})</span>
          </button>
        )}
      </div>

    </aside>
  );
};
