import React, { useState } from 'react';
import { 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  GraduationCap, 
  Mail, 
  Phone, 
  Building2, 
  BadgeCheck, 
  RotateCcw,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { Faculty } from '../../types';

interface FacultyApprovalsViewProps {
  faculties: Faculty[];
  onApproveFaculty: (id: string) => Promise<void> | void;
  onRejectFaculty: (id: string, reason?: string) => Promise<void> | void;
  onApproveAllFaculties: () => Promise<void> | void;
}

export const FacultyApprovalsView: React.FC<FacultyApprovalsViewProps> = ({
  faculties,
  onApproveFaculty,
  onRejectFaculty,
  onApproveAllFaculties,
}) => {
  const [filterTab, setFilterTab] = useState<'pending' | 'all' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [rejectingFaculty, setRejectingFaculty] = useState<Faculty | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showApproveAllModal, setShowApproveAllModal] = useState(false);

  const pendingFaculties = faculties.filter(f => f.status === 'pending');
  const approvedFaculties = faculties.filter(f => !f.status || f.status === 'approved');
  const rejectedFaculties = faculties.filter(f => f.status === 'rejected');

  const getFilteredList = () => {
    let list = faculties;
    if (filterTab === 'pending') list = pendingFaculties;
    else if (filterTab === 'approved') list = approvedFaculties;
    else if (filterTab === 'rejected') list = rejectedFaculties;

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      f =>
        f.name.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.staffId.toLowerCase().includes(q) ||
        f.department.toLowerCase().includes(q)
    );
  };

  const filteredList = getFilteredList();

  const handleApprove = async (id: string) => {
    setIsActionLoading(id);
    try {
      await onApproveFaculty(id);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingFaculty) return;
    const id = rejectingFaculty.id || rejectingFaculty._id!;
    setIsActionLoading(id);
    try {
      await onRejectFaculty(id, rejectReason.trim() || 'Details could not be verified by Department Admin.');
      setRejectingFaculty(null);
      setRejectReason('');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleBulkApprove = async () => {
    setIsActionLoading('all');
    try {
      await onApproveAllFaculties();
      setShowApproveAllModal(false);
    } finally {
      setIsActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
            <span>Admin Portal</span>
            <span>•</span>
            <span>Access Control & Onboarding</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-500" />
            Faculty Authentication Approvals
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Review and grant portal access to faculty members who signed up. Approved faculty can log in, view class analytics, and manage mentored students.
          </p>
        </div>

        {pendingFaculties.length > 0 && (
          <button
            onClick={() => setShowApproveAllModal(true)}
            disabled={isActionLoading === 'all'}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve All Pending ({pendingFaculties.length})</span>
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setFilterTab('pending')}
          className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
            filterTab === 'pending'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Pending Approvals</span>
            <div className={`p-2 rounded-lg ${pendingFaculties.length > 0 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{pendingFaculties.length}</span>
            <span className="text-xs text-amber-600 font-medium">Awaiting Admin Action</span>
          </div>
        </button>

        <button
          onClick={() => setFilterTab('approved')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterTab === 'approved'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Approved Faculty</span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <BadgeCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{approvedFaculties.length}</span>
            <span className="text-xs text-emerald-600 font-medium">Authorized for Login</span>
          </div>
        </button>

        <button
          onClick={() => setFilterTab('rejected')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterTab === 'rejected'
              ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Rejected / Blocked</span>
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{rejectedFaculties.length}</span>
            <span className="text-xs text-rose-600 font-medium">Access Denied</span>
          </div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-1.5 ${
              filterTab === 'pending'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Pending</span>
            {pendingFaculties.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black">
                {pendingFaculties.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilterTab('approved')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              filterTab === 'approved'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved ({approvedFaculties.length})
          </button>

          <button
            onClick={() => setFilterTab('rejected')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              filterTab === 'rejected'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rejected ({rejectedFaculties.length})
          </button>

          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              filterTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({faculties.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty name, staff ID, email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
          />
        </div>
      </div>

      {/* Main List */}
      {filteredList.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {filterTab === 'pending' ? 'All Caught Up! No Pending Approvals' : 'No Faculty Records Found'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {filterTab === 'pending'
                ? 'When faculty members sign up on the portal, their requests will appear here for authentication.'
                : 'Try adjusting your search query or switching tabs.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map(faculty => {
            const facultyId = faculty.id || faculty._id!;
            const isPending = faculty.status === 'pending';
            const isApproved = !faculty.status || faculty.status === 'approved';
            const isRejected = faculty.status === 'rejected';
            const isLoading = isActionLoading === facultyId;

            return (
              <div
                key={facultyId}
                className={`bg-white rounded-2xl border p-5 space-y-4 shadow-xs transition-all relative ${
                  isPending
                    ? 'border-amber-300 ring-1 ring-amber-400/30'
                    : isRejected
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Status Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                      {faculty.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-900 text-sm">{faculty.name}</h4>
                        <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {faculty.staffId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {faculty.designation} • {faculty.department}
                      </p>
                    </div>
                  </div>

                  {isPending && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                      <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                      <span>Pending Review</span>
                    </span>
                  )}

                  {isApproved && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                      <BadgeCheck className="w-3 h-3 text-emerald-600" />
                      <span>Approved</span>
                    </span>
                  )}

                  {isRejected && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      <span>Rejected</span>
                    </span>
                  )}
                </div>

                {/* Faculty Details Table */}
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email ID:</span>
                    </span>
                    <span className="font-mono font-medium text-slate-900">{faculty.email}</span>
                  </div>

                  {faculty.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center space-x-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        <span>Phone:</span>
                      </span>
                      <span className="font-mono text-slate-800">{faculty.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Department:</span>
                    </span>
                    <span className="font-medium text-slate-800">{faculty.department}</span>
                  </div>

                  {faculty.registeredAt && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-400">Registered On:</span>
                      <span className="text-slate-600">
                        {new Date(faculty.registeredAt).toLocaleDateString()} at{' '}
                        {new Date(faculty.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  {faculty.rejectionReason && (
                    <div className="pt-1 border-t border-rose-100 text-[11px] text-rose-700">
                      <strong>Rejection Note:</strong> {faculty.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-100">
                  {isPending && (
                    <>
                      <button
                        onClick={() => setRejectingFaculty(faculty)}
                        disabled={isLoading}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center space-x-1 disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleApprove(facultyId)}
                        disabled={isLoading}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isLoading ? 'Approving...' : 'Approve Access'}</span>
                      </button>
                    </>
                  )}

                  {isRejected && (
                    <button
                      onClick={() => handleApprove(facultyId)}
                      disabled={isLoading}
                      className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-Approve Access</span>
                    </button>
                  )}

                  {isApproved && (
                    <button
                      onClick={() => setRejectingFaculty(faculty)}
                      disabled={isLoading}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center space-x-1"
                      title="Revoke faculty access"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Revoke Access</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingFaculty && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Reject Faculty Registration
                </h3>
                <p className="text-xs text-slate-500">
                  {rejectingFaculty.name} ({rejectingFaculty.staffId})
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Are you sure you want to reject access for <strong className="text-slate-900">{rejectingFaculty.name}</strong>? They will not be able to log in to the faculty portal.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Rejection (Optional note for applicant):
                </label>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="e.g. Staff ID could not be verified with Department records."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectingFaculty(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Approve All Modal */}
      {showApproveAllModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Approve All Pending Registrations</h3>
              <p className="text-xs text-slate-500">
                You are about to authorize <strong className="text-slate-900">{pendingFaculties.length} faculty members</strong> to access the portal immediately.
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowApproveAllModal(false)}
                className="flex-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkApprove}
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
              >
                Approve All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
