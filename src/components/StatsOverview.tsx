import React from 'react';
import { 
  CheckCircle2, 
  Flame, 
  Trophy, 
  TrendingUp, 
  Zap, 
  BookOpen 
} from 'lucide-react';
import { CohortStats } from '../types';

interface StatsOverviewProps {
  stats: CohortStats;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
      
      {/* Total Solved */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Total Solved</span>
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
          {stats.totalSolved.toLocaleString()}
        </div>
        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
          <span className="text-emerald-600 font-semibold">Across cohort</span>
        </div>
      </div>

      {/* Class Average */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Class Average</span>
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
          {stats.averageSolved}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Problems / student
        </div>
      </div>

      {/* Hard Problems Solved */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Hard Solved</span>
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-rose-600 tracking-tight font-mono">
          {stats.totalHard.toLocaleString()}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {stats.totalSolved > 0 ? ((stats.totalHard / stats.totalSolved) * 100).toFixed(1) : 0}% of all solved
        </div>
      </div>

      {/* Top Contest Rating */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Top Rating</span>
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
          {stats.topContestRating}
        </div>
        <div className="text-xs text-amber-600 font-semibold mt-1">
          Guardian tier
        </div>
      </div>

      {/* Active Today */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Active Today</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
          {stats.activeTodayCount}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {stats.totalStudents > 0 ? Math.round((stats.activeTodayCount / stats.totalStudents) * 100) : 0}% active rate
        </div>
      </div>

      {/* Average Acceptance Rate */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Avg Accuracy</span>
          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
          {stats.avgAcceptanceRate}%
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Acceptance rate
        </div>
      </div>

    </div>
  );
};
