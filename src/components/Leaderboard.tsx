import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Flame, 
  ExternalLink, 
  Search, 
  ArrowUpDown, 
  Sparkles,
  RefreshCw,
  Medal,
  Award,
  Filter,
  CheckCircle,
  Eye,
  Clock
} from 'lucide-react';
import { Student, SortField, SortDirection } from '../types';
import { TOTAL_LEETCODE_PROBLEMS } from '../data/mockStudents';
import { formatTimeAgo } from '../utils/storage';

interface LeaderboardProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onSyncStudent: (student: Student) => void;
  onViewSubmissions?: (student: Student) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  students,
  onSelectStudent,
  onSyncStudent,
  onViewSubmissions,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [sortBy, setSortBy] = useState<SortField>('totalSolved');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [minSolvedFilter, setMinSolvedFilter] = useState<number>(0);

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.department) set.add(s.department);
    });
    return ['All', ...Array.from(set)];
  }, [students]);

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // Filtered and Sorted Students
  const sortedStudents = useMemo(() => {
    let list = [...students];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.leetcodeUsername.toLowerCase().includes(q)
      );
    }

    // Department filter
    if (selectedDept !== 'All') {
      list = list.filter(s => s.department === selectedDept);
    }

    // Min solved
    if (minSolvedFilter > 0) {
      list = list.filter(s => s.totalSolved >= minSolvedFilter);
    }

    // Sort
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'totalSolved':
          comparison = a.totalSolved - b.totalSolved;
          break;
        case 'contestRating':
          comparison = (a.contestRating || 0) - (b.contestRating || 0);
          break;
        case 'hardSolved':
          comparison = a.hardSolved - b.hardSolved;
          break;
        case 'mediumSolved':
          comparison = a.mediumSolved - b.mediumSolved;
          break;
        case 'streak':
          comparison = a.streakDays - b.streakDays;
          break;
        case 'lastActive':
          comparison = a.lastActive - b.lastActive;
          break;
        default:
          comparison = a.totalSolved - b.totalSolved;
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return list;
  }, [students, searchQuery, selectedDept, minSolvedFilter, sortBy, sortDirection]);

  // Top 3 Podium Students (based on currently sorted list or top total solved)
  const topThree = useMemo(() => {
    return sortedStudents.slice(0, 3);
  }, [sortedStudents]);

  return (
    <div className="space-y-6">
      
      {/* Top 3 Podium Showcase */}
      {sortedStudents.length >= 3 && !searchQuery && (
        <div className="bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent p-5 sm:p-6 rounded-2xl border border-amber-200/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Top Performers Podium
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Ranked by {sortBy === 'totalSolved' ? 'Total Problems Solved' : sortBy === 'contestRating' ? 'Contest Rating' : 'Score'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Rank 2 - Silver */}
            {topThree[1] && (
              <div 
                onClick={() => onSelectStudent(topThree[1])}
                className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group order-2 md:order-1"
              >
                <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-16 h-16 bg-slate-100 rounded-full flex items-end justify-start pl-3 pb-2 text-slate-400 font-black text-xs">
                  #2
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img 
                      src={topThree[1].avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${topThree[1].leetcodeUsername}`} 
                      alt={topThree[1].name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-300" 
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center text-[10px] font-bold shadow-xs">
                      2
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                      {topThree[1].name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">{topThree[1].rollNo}</p>
                    <p className="text-xs text-amber-600 font-medium">@{topThree[1].leetcodeUsername}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Solved</span>
                    <span className="font-bold text-slate-900 font-mono">{topThree[1].totalSolved}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Rating</span>
                    <span className="font-bold text-amber-600 font-mono">{topThree[1].contestRating}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Streak</span>
                    <span className="font-bold text-orange-500 font-mono">🔥 {topThree[1].streakDays}d</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 1 - Gold (Center & Elevated) */}
            {topThree[0] && (
              <div 
                onClick={() => onSelectStudent(topThree[0])}
                className="bg-gradient-to-b from-amber-50/80 to-white p-5 rounded-xl border-2 border-amber-400/80 shadow-md hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group order-1 md:order-2 md:-mt-2"
              >
                <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-16 h-16 bg-amber-400 rounded-full flex items-end justify-start pl-3 pb-2 text-white font-black text-xs shadow-xs">
                  #1
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img 
                      src={topThree[0].avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${topThree[0].leetcodeUsername}`} 
                      alt={topThree[0].name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-sm" 
                    />
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-xs font-black shadow-xs">
                      🏆
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                        {topThree[0].name}
                      </h3>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    </div>
                    <p className="text-xs text-slate-500 font-mono">{topThree[0].rollNo}</p>
                    <p className="text-xs text-amber-600 font-semibold">@{topThree[0].leetcodeUsername}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">Solved</span>
                    <span className="font-extrabold text-slate-900 font-mono text-sm">{topThree[0].totalSolved}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">Rating</span>
                    <span className="font-extrabold text-amber-600 font-mono text-sm">{topThree[0].contestRating}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">Streak</span>
                    <span className="font-extrabold text-orange-500 font-mono text-sm">🔥 {topThree[0].streakDays}d</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 3 - Bronze */}
            {topThree[2] && (
              <div 
                onClick={() => onSelectStudent(topThree[2])}
                className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group order-3"
              >
                <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-16 h-16 bg-amber-100/70 rounded-full flex items-end justify-start pl-3 pb-2 text-amber-800 font-black text-xs">
                  #3
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img 
                      src={topThree[2].avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${topThree[2].leetcodeUsername}`} 
                      alt={topThree[2].name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-600/40" 
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      3
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                      {topThree[2].name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">{topThree[2].rollNo}</p>
                    <p className="text-xs text-amber-600 font-medium">@{topThree[2].leetcodeUsername}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Solved</span>
                    <span className="font-bold text-slate-900 font-mono">{topThree[2].totalSolved}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Rating</span>
                    <span className="font-bold text-amber-600 font-mono">{topThree[2].contestRating}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Streak</span>
                    <span className="font-bold text-orange-500 font-mono">🔥 {topThree[2].streakDays}d</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Control Bar: Search, Filters & Sorters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-students-input"
              type="text"
              placeholder="Search by student name, roll number, or LeetCode handle..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              id="dept-filter"
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>

            {/* Min Solved Filter */}
            <select
              id="min-solved-filter"
              value={minSolvedFilter}
              onChange={e => setMinSolvedFilter(Number(e.target.value))}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value={0}>Any Solved</option>
              <option value={200}>200+ Solved</option>
              <option value={400}>400+ Solved</option>
              <option value={500}>500+ Solved</option>
            </select>
          </div>
        </div>

        {/* Quick Sorting Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium mr-1 shrink-0">Sort By:</span>
          
          <button
            id="sort-total-solved"
            onClick={() => handleSort('totalSolved')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center space-x-1 shrink-0 ${
              sortBy === 'totalSolved' 
                ? 'bg-amber-100 text-amber-900 font-semibold' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Total Solved</span>
            {sortBy === 'totalSolved' && (
              <span className="text-[10px]">{sortDirection === 'desc' ? '↓' : '↑'}</span>
            )}
          </button>

          <button
            id="sort-contest-rating"
            onClick={() => handleSort('contestRating')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center space-x-1 shrink-0 ${
              sortBy === 'contestRating' 
                ? 'bg-amber-100 text-amber-900 font-semibold' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Contest Rating</span>
            {sortBy === 'contestRating' && (
              <span className="text-[10px]">{sortDirection === 'desc' ? '↓' : '↑'}</span>
            )}
          </button>

          <button
            id="sort-hard-solved"
            onClick={() => handleSort('hardSolved')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center space-x-1 shrink-0 ${
              sortBy === 'hardSolved' 
                ? 'bg-rose-100 text-rose-900 font-semibold' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Hard Problems</span>
            {sortBy === 'hardSolved' && (
              <span className="text-[10px]">{sortDirection === 'desc' ? '↓' : '↑'}</span>
            )}
          </button>

          <button
            id="sort-streak"
            onClick={() => handleSort('streak')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center space-x-1 shrink-0 ${
              sortBy === 'streak' 
                ? 'bg-orange-100 text-orange-900 font-semibold' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Daily Streak</span>
            {sortBy === 'streak' && (
              <span className="text-[10px]">{sortDirection === 'desc' ? '↓' : '↑'}</span>
            )}
          </button>

          <button
            id="sort-recent-active"
            onClick={() => handleSort('lastActive')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center space-x-1 shrink-0 ${
              sortBy === 'lastActive' 
                ? 'bg-emerald-100 text-emerald-900 font-semibold' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Recent Activity</span>
            {sortBy === 'lastActive' && (
              <span className="text-[10px]">{sortDirection === 'desc' ? '↓' : '↑'}</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-center w-14">Rank</th>
                <th className="py-3.5 px-4 min-w-[200px]">Student Details</th>
                <th className="py-3.5 px-4 min-w-[140px]">LeetCode Handle</th>
                <th className="py-3.5 px-4 min-w-[180px]">Difficulty Breakdown</th>
                <th className="py-3.5 px-4 text-center min-w-[100px]">Total Solved</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">Contest Rating</th>
                <th className="py-3.5 px-4 text-center min-w-[90px]">Streak</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">Last Active</th>
                <th className="py-3.5 px-4 text-right min-w-[100px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedStudents.map((student, index) => {
                const rank = index + 1;
                const isGold = rank === 1;
                const isSilver = rank === 2;
                const isBronze = rank === 3;
                const totalPct = ((student.totalSolved / TOTAL_LEETCODE_PROBLEMS.total) * 100).toFixed(1);

                return (
                  <tr 
                    key={student.id} 
                    className="hover:bg-amber-50/30 transition-colors group cursor-pointer"
                    onClick={() => onSelectStudent(student)}
                  >
                    
                    {/* Rank */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center">
                        {isGold && (
                          <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-xs">
                            1
                          </span>
                        )}
                        {isSilver && (
                          <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center shadow-xs">
                            2
                          </span>
                        )}
                        {isBronze && (
                          <span className="w-7 h-7 rounded-full bg-amber-700/80 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                            3
                          </span>
                        )}
                        {!isGold && !isSilver && !isBronze && (
                          <span className="text-slate-500 font-semibold font-mono text-xs">
                            #{rank}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={student.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.leetcodeUsername}`}
                          alt={student.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0" 
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                            {student.name}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center space-x-2">
                            <span className="font-mono">{student.rollNo}</span>
                            <span>•</span>
                            <span className="truncate max-w-[120px]">{student.department.split(' ')[0]}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* LeetCode Handle */}
                    <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                      <a
                        href={`https://leetcode.com/${student.leetcodeUsername}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 font-mono text-xs font-medium text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md transition-colors"
                      >
                        <span>@{student.leetcodeUsername}</span>
                        <ExternalLink className="w-3 h-3 text-amber-600" />
                      </a>
                    </td>

                    {/* Difficulty Breakdown Bar */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {/* Mini progress bar */}
                        <div className="w-full h-2 rounded-full bg-slate-100 flex overflow-hidden">
                          <div 
                            style={{ width: `${(student.easySolved / Math.max(1, student.totalSolved)) * 100}%` }}
                            className="bg-emerald-500 h-full"
                            title={`Easy: ${student.easySolved}`}
                          />
                          <div 
                            style={{ width: `${(student.mediumSolved / Math.max(1, student.totalSolved)) * 100}%` }}
                            className="bg-amber-500 h-full"
                            title={`Medium: ${student.mediumSolved}`}
                          />
                          <div 
                            style={{ width: `${(student.hardSolved / Math.max(1, student.totalSolved)) * 100}%` }}
                            className="bg-rose-500 h-full"
                            title={`Hard: ${student.hardSolved}`}
                          />
                        </div>

                        {/* Counts badges */}
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-emerald-700 font-medium">E: {student.easySolved}</span>
                          <span className="text-amber-700 font-medium">M: {student.mediumSolved}</span>
                          <span className="text-rose-700 font-semibold">H: {student.hardSolved}</span>
                        </div>
                      </div>
                    </td>

                    {/* Total Solved */}
                    <td className="py-3 px-4 text-center">
                      <div className="font-bold text-slate-900 font-mono text-base">
                        {student.totalSolved}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {totalPct}% of catalog
                      </div>
                    </td>

                    {/* Contest Rating */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-bold text-slate-900 font-mono text-sm">
                          {student.contestRating || '—'}
                        </span>
                        {student.contestRating >= 2000 && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Guardian
                          </span>
                        )}
                        {student.contestRating >= 1800 && student.contestRating < 2000 && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                            Knight
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Streak */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center space-x-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-mono">
                        <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                        <span>{student.streakDays}d</span>
                      </div>
                    </td>

                    {/* Last Active */}
                    <td className="py-3 px-4 text-center text-xs text-slate-500">
                      {formatTimeAgo(student.lastActive)}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onSyncStudent(student)}
                          disabled={student.isSyncing}
                          title="Sync live stats from LeetCode"
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${student.isSyncing ? 'animate-spin text-amber-500' : ''}`} />
                        </button>
                        {onViewSubmissions && (
                          <button
                            onClick={() => onViewSubmissions(student)}
                            title="Audit 40 Recent Submissions with Exact Timestamps"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                          </button>
                        )}
                        <button
                          onClick={() => onSelectStudent(student)}
                          title="View student profile & submissions"
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}

              {sortedStudents.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">No students match the current filters.</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing your search query or department filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
