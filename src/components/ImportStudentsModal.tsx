import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Download, Building2 } from 'lucide-react';
import { Student, ClassGroup } from '../types';

interface ImportStudentsModalProps {
  isOpen: boolean;
  classes?: ClassGroup[];
  onClose: () => void;
  onImportStudents: (newStudents: Partial<Student>[]) => void;
}

export const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({
  isOpen,
  classes = [],
  onClose,
  onImportStudents,
}) => {
  const [csvText, setCsvText] = useState('');
  const [targetClassId, setTargetClassId] = useState(classes[0]?.id || '');
  const [parseResult, setParseResult] = useState<{ count: number; error?: string } | null>(null);

  if (!isOpen) return null;

  const sampleCSV = `RollNo,Name,Department,Batch,LeetCodeUsername,Email
22CSE201,Harish Kumar,Computer Science and Engineering,2022-2026,harish_codes,harish@drngpit.ac.in
22CSE202,Tanvi Deshmukh,Computer Science and Engineering,2022-2026,tanvi_dev,tanvi@drngpit.ac.in
22IT105,Manoj Krishnan,Information Technology,2022-2026,manoj_k,manoj@drngpit.ac.in`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leetcode_students_import_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setCsvText(text);
      validateCSV(text);
    };
    reader.readAsText(file);
  };

  const validateCSV = (text: string) => {
    const lines = text.trim().split('\n').filter(l => l.trim().length > 0);
    if (lines.length <= 1) {
      setParseResult({ count: 0, error: 'CSV file must have at least one student row.' });
      return;
    }
    setParseResult({ count: lines.length - 1 });
  };

  const handleProcessImport = () => {
    if (!csvText.trim()) return;

    const lines = csvText.trim().split('\n').filter(l => l.trim().length > 0);
    if (lines.length <= 1) {
      alert('No data rows found.');
      return;
    }

    const assignedClass = classes.find(c => c.id === targetClassId || c._id === targetClassId);

    const importedStudents: Partial<Student>[] = [];
    // Line 0 is header
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      if (cols.length >= 2) {
        const rollNo = cols[0] || `STD${Date.now() + i}`;
        const name = cols[1] || 'Unnamed Student';
        const department = cols[2] || assignedClass?.department || 'Computer Science and Engineering';
        const batch = cols[3] || assignedClass?.batch || '2022-2026';
        const leetcodeUsername = cols[4] || `user_${rollNo.toLowerCase()}`;
        const email = cols[5] || `${rollNo.toLowerCase()}@drngpit.ac.in`;

        const totalSolved = Math.floor(Math.random() * 300) + 80;
        const easySolved = Math.floor(totalSolved * 0.45);
        const mediumSolved = Math.floor(totalSolved * 0.42);
        const hardSolved = totalSolved - easySolved - mediumSolved;

        importedStudents.push({
          rollNo: rollNo.toUpperCase(),
          name,
          department,
          batch,
          classId: assignedClass ? (assignedClass.id || assignedClass._id) : undefined,
          className: assignedClass?.name,
          section: assignedClass?.section,
          facultyAdvisorId: assignedClass?.facultyAdvisorId,
          facultyAdvisorName: assignedClass?.facultyAdvisorName,
          leetcodeUsername,
          email,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${leetcodeUsername}`,
          totalSolved,
          easySolved,
          mediumSolved,
          hardSolved,
          acceptanceRate: +(Math.random() * 20 + 55).toFixed(1),
          ranking: Math.floor(Math.random() * 100000) + 20000,
          contestRating: Math.floor(Math.random() * 500) + 1400,
          attendedContests: Math.floor(Math.random() * 15) + 2,
          streakDays: Math.floor(Math.random() * 15) + 1,
          lastActive: Date.now() - Math.floor(Math.random() * 86400 * 1000 * 3),
          badges: [],
          skillTags: ['Arrays', 'Strings'],
          weeklyGoal: 8,
          weeklySolved: Math.floor(Math.random() * 8),
        });
      }
    }

    if (importedStudents.length > 0) {
      onImportStudents(importedStudents);
      onClose();
    }
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
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Bulk Import Student Roster</h2>
              <p className="text-xs text-slate-500">Upload or paste CSV with student details and LeetCode handles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Class destination selector */}
          {classes.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-500" />
                Assign Imported Students To Class
              </label>
              <select
                value={targetClassId}
                onChange={e => setTargetClassId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">-- No Specific Class --</option>
                {classes.map(c => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.name} ({c.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* File Upload Box */}
          <div className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl p-6 text-center transition-colors bg-slate-50/50">
            <FileText className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Upload CSV File</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Drag and drop or select your class roster spreadsheet</p>
            
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-input"
            />
            <label
              htmlFor="csv-file-input"
              className="mt-3 inline-flex items-center px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer shadow-xs transition-all"
            >
              Choose CSV File
            </label>
          </div>

          {/* Paste CSV Directly */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Or Paste CSV Content
              </label>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="text-xs text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Download Sample Template</span>
              </button>
            </div>
            <textarea
              rows={5}
              placeholder="RollNo,Name,Department,Batch,LeetCodeUsername,Email..."
              value={csvText}
              onChange={e => {
                setCsvText(e.target.value);
                validateCSV(e.target.value);
              }}
              className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {parseResult && (
            <div className={`p-3 rounded-lg flex items-center gap-2 text-xs font-medium ${
              parseResult.error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {parseResult.error ? (
                <>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{parseResult.error}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Ready to import {parseResult.count} student(s).</span>
                </>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setCsvText(sampleCSV);
              validateCSV(sampleCSV);
            }}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 underline"
          >
            Fill Sample Data
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessImport}
              disabled={!csvText.trim() || !!parseResult?.error}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm transition-all"
            >
              Import Roster
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
