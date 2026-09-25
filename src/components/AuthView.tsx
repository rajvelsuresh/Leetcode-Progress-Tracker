import React, { useState } from 'react';
import { 
  ShieldCheck, 
  GraduationCap, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Code2, 
  UserPlus, 
  KeyRound, 
  CheckCircle2, 
  ArrowLeft, 
  Building2, 
  Phone, 
  IdCard, 
  Sparkles,
  HelpCircle,
  Clock
} from 'lucide-react';
import { UserRole, AuthUser, Faculty } from '../types';
import { api } from '../utils/api';

interface AuthViewProps {
  onLoginSuccess: (user: AuthUser) => void;
  faculties: Faculty[];
  onFacultyRegistered?: (faculty: Faculty) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ 
  onLoginSuccess, 
  faculties,
  onFacultyRegistered 
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeRole, setActiveRole] = useState<UserRole>('admin');
  
  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  // Signup Form
  const [signupName, setSignupName] = useState('');
  const [signupStaffId, setSignupStaffId] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupDept, setSignupDept] = useState('Computer Science and Engineering');
  const [signupDesignation, setSignupDesignation] = useState('Assistant Professor');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState<Faculty | null>(null);

  // Forgot Password Modal
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotRole, setForgotRole] = useState<'faculty' | 'admin'>('faculty');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStaffId, setForgotStaffId] = useState('');
  const [forgotRecoveryKey, setForgotRecoveryKey] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');

  const departments = [
    'Computer Science and Engineering',
    'Artificial Intelligence and Data Science',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Biomedical Engineering',
    'Science & Humanities',
  ];

  const designations = [
    'Assistant Professor',
    'Associate Professor',
    'Professor',
    'Professor & HoD',
    'Class Advisor & Mentor',
    'Lab Instructor',
  ];

  const handleRoleSwitch = (role: UserRole) => {
    setActiveRole(role);
    setErrorMessage('');
    setPendingNotice(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setPendingNotice(null);
    setIsLoading(true);

    try {
      // First try backend API
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, role: activeRole }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        onLoginSuccess(data.user);
        return;
      }

      if (res.status === 403 && data.isPending) {
        setPendingNotice(data.error);
        return;
      }

      // If backend gave error
      setErrorMessage(data.error || 'Invalid credentials. Please verify your login details.');
    } catch (err: any) {
      // Offline fallback
      const cleanEmail = email.trim().toLowerCase();
      if (activeRole === 'admin' && cleanEmail === 'admin@drngpit.ac.in' && (password === 'admin123' || password === 'admin')) {
        onLoginSuccess({
          id: 'admin-1',
          name: 'Dr. NGP IT Administrator',
          email: 'admin@drngpit.ac.in',
          role: 'admin',
          designation: 'HoD / Chief Academic Coordinator',
          department: 'Computer Science and Engineering',
        });
        return;
      }

      if (activeRole === 'faculty') {
        const found = faculties.find(f => f.email?.toLowerCase() === cleanEmail);
        if (found) {
          if (found.status === 'pending') {
            setPendingNotice('Your faculty registration is pending approval from the Administrator.');
            return;
          }
          if (password === (found.password || 'faculty123')) {
            onLoginSuccess({
              id: found.id,
              facultyId: found.id,
              name: found.name,
              email: found.email,
              role: 'faculty',
              staffId: found.staffId,
              designation: found.designation,
              department: found.department,
              avatarUrl: found.avatarUrl,
            });
            return;
          }
        }
      }

      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (signupPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.signupFaculty({
        name: signupName.trim(),
        staffId: signupStaffId.trim().toUpperCase(),
        email: signupEmail.trim().toLowerCase(),
        department: signupDept,
        designation: signupDesignation,
        phone: signupPhone.trim(),
        password: signupPassword,
      });

      setSignupSuccess(res.faculty);
      if (onFacultyRegistered) {
        onFacultyRegistered(res.faculty);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccessMsg('');

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('New passwords do not match.');
      return;
    }

    if (forgotNewPassword.length < 4) {
      setForgotError('Password must be at least 4 characters.');
      return;
    }

    setForgotLoading(true);
    try {
      if (forgotRole === 'faculty') {
        const res = await api.forgotPasswordFaculty({
          email: forgotEmail.trim().toLowerCase(),
          staffId: forgotStaffId.trim().toUpperCase(),
          newPassword: forgotNewPassword.trim(),
        });
        setForgotSuccessMsg(res.message);
      } else {
        const res = await api.forgotPasswordAdmin({
          email: forgotEmail.trim().toLowerCase(),
          recoveryKey: forgotRecoveryKey.trim(),
          newPassword: forgotNewPassword.trim(),
        });
        setForgotSuccessMsg(res.message);
      }
    } catch (err: any) {
      setForgotError(err.message || 'Password reset failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-lg w-full space-y-6 relative z-10">
        
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-xl shadow-amber-500/20 mb-2">
            <Code2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            LeetTrack Institutional Portal
          </h1>
          <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
            Dr. N.G.P. Institute of Technology • Department of CSE & AI
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6">

          {/* SIGN IN VIEW */}
          {authMode === 'login' && (
            <div className="space-y-5">
              {/* Role Switcher Tabs */}
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider text-center">
                  Select Login Role
                </div>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    id="portal-tab-admin"
                    onClick={() => handleRoleSwitch('admin')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                      activeRole === 'admin'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Login</span>
                  </button>

                  <button
                    type="button"
                    id="portal-tab-faculty"
                    onClick={() => handleRoleSwitch('faculty')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                      activeRole === 'faculty'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Faculty Login</span>
                  </button>
                </div>
              </div>

              {/* Pending Approval Notice */}
              {pendingNotice && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1 animate-in fade-in">
                  <div className="flex items-center space-x-2 font-bold text-amber-800">
                    <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                    <span>Authentication Approval Pending</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    {pendingNotice}
                  </p>
                  <p className="text-[10px] text-amber-600/90 pt-1 font-medium">
                    The Department Administrator has received your sign up and will approve your credentials shortly.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {activeRole === 'admin' ? 'Admin Email ID' : 'Faculty Mail ID'} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={activeRole === 'admin' ? 'admin@drngpit.ac.in' : 'name@drngpit.ac.in'}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setForgotRole(activeRole);
                        setForgotEmail(email);
                        setForgotError('');
                        setForgotSuccessMsg('');
                      }}
                      className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-medium text-slate-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  id="auth-submit-btn"
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Signing In...</span>
                  ) : (
                    <>
                      {activeRole === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                      <span>Sign In as {activeRole === 'admin' ? 'Administrator' : 'Faculty Member'}</span>
                    </>
                  )}
                </button>
              </form>

              {activeRole === 'faculty' && (
                <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
                  New faculty member?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMessage('');
                    }}
                    className="text-amber-600 font-bold hover:underline"
                  >
                    Register Account
                  </button>
                </div>
              )}
            </div>
          )}

          {/* FACULTY SIGN UP VIEW */}
          {authMode === 'signup' && (
            <div className="space-y-4">
              {signupSuccess ? (
                <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Registration Request Submitted!
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Thank you, <strong className="text-slate-800">{signupSuccess.name}</strong> ({signupSuccess.staffId}). Your profile is now awaiting <strong>Administrator Approval</strong>.
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs space-y-1.5 text-amber-900">
                    <div className="flex items-center space-x-1.5 font-bold text-amber-800">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Next Steps:</span>
                    </div>
                    <p className="text-[11px] text-amber-700">
                      1. The Department Admin will review your Staff ID & Email.
                    </p>
                    <p className="text-[11px] text-amber-700">
                      2. Once approved, you can immediately sign in using your email <strong className="font-mono">{signupSuccess.email}</strong>.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setActiveRole('faculty');
                      setEmail(signupSuccess.email);
                      setSignupSuccess(null);
                    }}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Proceed to Sign In</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSignup} className="space-y-3.5">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Faculty Registration</h3>
                      <p className="text-[11px] text-slate-400">Creates institutional account pending admin authorization</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Admin Approval Required
                    </span>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Full Name with Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={signupName}
                        onChange={e => setSignupName(e.target.value)}
                        placeholder="e.g. Dr. R. Vignesh"
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-medium text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Staff / Employee ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={signupStaffId}
                        onChange={e => setSignupStaffId(e.target.value)}
                        placeholder="e.g. STAFF-CSE-105"
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-mono uppercase font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Official College Email ID *
                      </label>
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={e => setSignupEmail(e.target.value)}
                        placeholder="name@drngpit.ac.in"
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-medium text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Contact / Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={signupPhone}
                        onChange={e => setSignupPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Department *
                      </label>
                      <select
                        value={signupDept}
                        onChange={e => setSignupDept(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-medium text-slate-900"
                      >
                        {departments.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Designation / Role *
                      </label>
                      <select
                        value={signupDesignation}
                        onChange={e => setSignupDesignation(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-medium text-slate-900"
                      >
                        {designations.map(des => (
                          <option key={des} value={des}>{des}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Create Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          required
                          value={signupPassword}
                          onChange={e => setSignupPassword(e.target.value)}
                          placeholder="Min 4 characters"
                          className="w-full px-3 py-1.5 pr-8 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        value={signupConfirmPassword}
                        onChange={e => setSignupConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
                  >
                    {isLoading ? (
                      <span>Submitting Registration...</span>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Submit Registration for Admin Approval</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      Already have an approved account? <span className="text-amber-600 underline">Sign In</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500">
          LeetTrack MERN Authentication Engine • Institutional Role-Based Access
        </p>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Account Password Recovery
                </h3>
                <p className="text-xs text-slate-500">
                  Reset password using verified institutional identity
                </p>
              </div>
            </div>

            {/* Portal Switcher for Recovery */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setForgotRole('faculty');
                  setForgotError('');
                  setForgotSuccessMsg('');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  forgotRole === 'faculty'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Faculty Password Reset
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotRole('admin');
                  setForgotError('');
                  setForgotSuccessMsg('');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  forgotRole === 'admin'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin Password Reset
              </button>
            </div>

            {forgotSuccessMsg ? (
              <div className="space-y-4 py-2 text-center animate-in fade-in">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">Password Reset Successful!</h4>
                  <p className="text-xs text-slate-600">{forgotSuccessMsg}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setAuthMode('login');
                    if (forgotRole === 'faculty') {
                      setActiveRole('faculty');
                      setEmail(forgotEmail);
                    } else {
                      setActiveRole('admin');
                      setEmail('admin@drngpit.ac.in');
                    }
                  }}
                  className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5 pt-1">
                {forgotError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {forgotRole === 'faculty' ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Registered Faculty Email ID *
                      </label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="name@drngpit.ac.in"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Staff / Employee ID (Verification Key) *
                      </label>
                      <input
                        type="text"
                        required
                        value={forgotStaffId}
                        onChange={e => setForgotStaffId(e.target.value)}
                        placeholder="e.g. STAFF-CSE-101"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-mono uppercase font-medium"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Admin Email ID *
                      </label>
                      <input
                        type="email"
                        required
                        value={forgotEmail || 'admin@drngpit.ac.in'}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="admin@drngpit.ac.in"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-medium"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Institution Master Recovery Key *
                        </label>
                        <span className="text-[10px] text-slate-400">
                          Key: <code className="text-amber-700 font-mono">NGPIT-ADMIN-SECURE-2026</code>
                        </span>
                      </div>
                      <input
                        type="password"
                        required
                        value={forgotRecoveryKey}
                        onChange={e => setForgotRecoveryKey(e.target.value)}
                        placeholder="Enter master recovery key"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-mono"
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        required
                        value={forgotNewPassword}
                        onChange={e => setForgotNewPassword(e.target.value)}
                        placeholder="Min 4 chars"
                        className="w-full px-3 py-2 pr-8 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showForgotNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type={showForgotNewPassword ? 'text' : 'password'}
                      required
                      value={forgotConfirmPassword}
                      onChange={e => setForgotConfirmPassword(e.target.value)}
                      placeholder="Confirm"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                  >
                    {forgotLoading ? 'Updating Password...' : 'Reset & Save Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
