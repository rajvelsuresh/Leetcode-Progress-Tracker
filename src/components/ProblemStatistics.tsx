import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { 
  BarChart2, 
  PieChart as PieChartIcon, 
  CheckCircle, 
  Award, 
  Flame, 
  Layers,
  Sparkles
} from 'lucide-react';
import { Student, CohortStats } from '../types';
import { TOTAL_LEETCODE_PROBLEMS } from '../data/mockStudents';

interface ProblemStatisticsProps {
  students: Student[];
  stats: CohortStats;
}

const DIFFICULTY_COLORS = {
  Easy: '#10b981',    // Emerald
  Medium: '#f59e0b',  // Amber
  Hard: '#ef4444',    // Rose
};

export const ProblemStatistics: React.FC<ProblemStatisticsProps> = ({ students, stats }) => {
  
  // 1. Cohort Difficulty Pie Data
  const difficultyPieData = useMemo(() => {
    return [
      { name: 'Easy', value: stats.totalEasy, color: DIFFICULTY_COLORS.Easy },
      { name: 'Medium', value: stats.totalMedium, color: DIFFICULTY_COLORS.Medium },
      { name: 'Hard', value: stats.totalHard, color: DIFFICULTY_COLORS.Hard },
    ];
  }, [stats]);

  // 2. Top 8 Students Stacked Bar Data
  const topStudentsBarData = useMemo(() => {
    const sorted = [...students].sort((a, b) => b.totalSolved - a.totalSolved).slice(0, 8);
    return sorted.map(s => ({
      name: s.name.split(' ')[0],
      fullName: s.name,
      Easy: s.easySolved,
      Medium: s.mediumSolved,
      Hard: s.hardSolved,
      Total: s.totalSolved,
    }));
  }, [students]);

  // 3. Contest Rating Bins
  const ratingDistributionData = useMemo(() => {
    const bins = [
      { range: '< 1500', count: 0, label: 'Beginner / Developing' },
      { range: '1500-1650', count: 0, label: 'Intermediate' },
      { range: '1650-1800', count: 0, label: 'Proficient' },
      { range: '1800-2000', count: 0, label: 'Knight Tier' },
      { range: '2000+', count: 0, label: 'Guardian Tier' },
    ];

    students.forEach(s => {
      const r = s.contestRating || 1500;
      if (r < 1500) bins[0].count++;
      else if (r < 1650) bins[1].count++;
      else if (r < 1800) bins[2].count++;
      else if (r < 2000) bins[3].count++;
      else bins[4].count++;
    });

    return bins;
  }, [students]);

  // 4. Topic Mastery aggregation
  const topicData = useMemo(() => {
    const topics: Record<string, number> = {
      'Dynamic Prog.': 0,
      'Trees & Graphs': 0,
      'Arrays & Hash': 0,
      'Two Pointers': 0,
      'Binary Search': 0,
      'Strings': 0,
      'Linked Lists': 0,
      'Greedy / Heap': 0,
    };

    students.forEach(s => {
      s.skillTags?.forEach(tag => {
        if (tag.includes('Dynamic Programming')) topics['Dynamic Prog.'] += 1;
        if (tag.includes('Tree') || tag.includes('Graph')) topics['Trees & Graphs'] += 1;
        if (tag.includes('Array')) topics['Arrays & Hash'] += 1;
        if (tag.includes('Two Pointers') || tag.includes('Sliding Window')) topics['Two Pointers'] += 1;
        if (tag.includes('Binary Search')) topics['Binary Search'] += 1;
        if (tag.includes('String')) topics['Strings'] += 1;
        if (tag.includes('Linked List')) topics['Linked Lists'] += 1;
        if (tag.includes('Greedy') || tag.includes('Heap')) topics['Greedy / Heap'] += 1;
      });
    });

    return Object.entries(topics).map(([name, count]) => ({ name, count }));
  }, [students]);

  // 5. Streaks breakdown
  const streakDistribution = useMemo(() => {
    return [
      { range: '30+ Days 🔥', count: students.filter(s => s.streakDays >= 30).length },
      { range: '14-29 Days', count: students.filter(s => s.streakDays >= 14 && s.streakDays < 30).length },
      { range: '7-13 Days', count: students.filter(s => s.streakDays >= 7 && s.streakDays < 14).length },
      { range: '< 7 Days', count: students.filter(s => s.streakDays < 7).length },
    ];
  }, [students]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner Stats */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-amber-500" />
              Cohort Problem Completion Statistics
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Holistic algorithmic problem solving distribution, difficulty spread, and contest performance analytics.
            </p>
          </div>

          {/* Quick catalog completion indicator */}
          <div className="flex items-center space-x-6 text-xs border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6">
            <div>
              <div className="text-slate-400 font-medium">Platform Problems</div>
              <div className="font-bold text-slate-800 font-mono text-sm">{TOTAL_LEETCODE_PROBLEMS.total} Total</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Cohort Hard Ratio</div>
              <div className="font-bold text-rose-600 font-mono text-sm">
                {stats.totalSolved > 0 ? ((stats.totalHard / stats.totalSolved) * 100).toFixed(1) : 0}%
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Avg Contest Rating</div>
              <div className="font-bold text-amber-600 font-mono text-sm">{stats.averageContestRating}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Difficulty Distribution & Top Students Stacked Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Difficulty Pie Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-slate-500" />
              Difficulty Composition
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">{stats.totalSolved} total</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {difficultyPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${Number(val).toLocaleString()} problems (${((Number(val)/Math.max(1, stats.totalSolved))*100).toFixed(1)}%)`, 'Solved']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Difficulty Legend Cards */}
          <div className="grid grid-cols-3 gap-2 mt-auto pt-3 border-t border-slate-100 text-center">
            <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Easy</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{stats.totalEasy}</span>
              <span className="text-[10px] text-slate-500 block">
                {stats.totalSolved > 0 ? Math.round((stats.totalEasy / stats.totalSolved) * 100) : 0}%
              </span>
            </div>

            <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Medium</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{stats.totalMedium}</span>
              <span className="text-[10px] text-slate-500 block">
                {stats.totalSolved > 0 ? Math.round((stats.totalMedium / stats.totalSolved) * 100) : 0}%
              </span>
            </div>

            <div className="p-2 rounded-lg bg-rose-50/70 border border-rose-100">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">Hard</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{stats.totalHard}</span>
              <span className="text-[10px] text-slate-500 block">
                {stats.totalSolved > 0 ? Math.round((stats.totalHard / stats.totalSolved) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Top 8 Students Comparison Stacked Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Top Solvers by Problem Complexity
            </h3>
            <span className="text-xs text-slate-400">Easy / Medium / Hard Stack</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topStudentsBarData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value: any, name: any) => [value, `${name}`]}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-lg">
                          <p className="font-bold">{data.fullName}</p>
                          <p className="text-slate-300 font-mono text-[11px] mb-1.5">Total Solved: {data.Total}</p>
                          <div className="space-y-0.5 font-mono text-[10px]">
                            <p className="text-emerald-400">● Easy: {data.Easy}</p>
                            <p className="text-amber-400">● Medium: {data.Medium}</p>
                            <p className="text-rose-400">● Hard: {data.Hard}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="Easy" stackId="a" fill={DIFFICULTY_COLORS.Easy} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Medium" stackId="a" fill={DIFFICULTY_COLORS.Medium} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Hard" stackId="a" fill={DIFFICULTY_COLORS.Hard} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 2: Contest Rating Distribution & Topic Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Contest Rating Bins */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Contest Rating Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Rating tiers across the student batch</p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  formatter={(val: any) => [`${val} Students`, 'Count']}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DSA Topic Mastery Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                DSA Topic & Skill Coverage
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Focus areas tracked across student profiles</p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData} layout="vertical" margin={{ top: 5, right: 20, left: 35, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip formatter={(val: any) => [`${val} Students proficient`, 'Students']} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3: Consistency & Streak Metrics Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            Consistency & Daily Streak Health
          </h3>
          <span className="text-xs text-slate-500">LeetCode daily problem challenge active streaks</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {streakDistribution.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700 block">{item.range}</span>
                <span className="text-[11px] text-slate-400">
                  {students.length > 0 ? Math.round((item.count / students.length) * 100) : 0}% of class
                </span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-mono">
                {item.count}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
