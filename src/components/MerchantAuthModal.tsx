import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { Merchant } from '../types';
import { getAllMerchants, verifyAdminPassword, getWebsiteConfig } from '../utils/storage';
import { MtccLogo } from './MtccLogo';

interface MerchantAuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'register' | 'admin';
  onClose: () => void;
  onProceedToPayment: (registrationData: {
    businessName: string;
    ownerName: string;
    email: string;
    mobile: string;
    address: string;
    password?: string;
  }) => void;
  onLoginSuccess: (merchant: Merchant) => void;
  onAdminLoginSuccess: () => void;
}

export const MerchantAuthModal: React.FC<MerchantAuthModalProps> = ({
  isOpen,
  initialTab = 'register',
  onClose,
  onProceedToPayment,
  onLoginSuccess,
  onAdminLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot' | 'admin'>(initialTab);

  // Registration Fields
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');

  // Login Fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin Field
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');

  // Reset State
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const regFee = getWebsiteConfig().registrationFee || 19;

  if (!isOpen) return null;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !ownerName.trim() || !mobile.trim()) {
      alert('Please fill all required registration fields.');
      return;
    }

    onProceedToPayment({
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      mobile: mobile.trim(),
      email: email.trim() || `${mobile.replace(/\D/g, '')}@mtccbillpro.com`,
      address: address.trim() || 'Retail Outlet',
      password: password || 'password123',
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your Mobile Number, Email, or Merchant ID.');
      return;
    }

    const merchants = getAllMerchants();
    const idClean = loginIdentifier.trim().toLowerCase();
    
    // Find merchant by mobile, email, or merchant ID
    const found = merchants.find(
      (m) =>
        m.mobile.replace(/\D/g, '') === idClean.replace(/\D/g, '') ||
        m.email.toLowerCase() === idClean ||
        m.id.toLowerCase() === idClean
    );

    if (found) {
      if (found.status === 'INACTIVE') {
        setLoginError('Your merchant account is currently inactive. Contact admin support.');
        return;
      }
      
      const expectedPass = found.password || 'password123';
      if (loginPassword.trim() && loginPassword.trim() !== expectedPass) {
        setLoginError('Incorrect password. Please verify and try again.');
        return;
      }

      onLoginSuccess(found);
      onClose();
    } else {
      setLoginError('No registered merchant found with this Mobile/Email/Merchant ID.');
    }
  };

  const handleQuickDemoLogin = (merchant: Merchant) => {
    onLoginSuccess(merchant);
    onClose();
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(adminPin)) {
      onAdminLoginSuccess();
      onClose();
    } else {
      setAdminError('Invalid Admin Passcode. Default is admin123 or 9999.');
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier.trim()) return;
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setActiveTab('login');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0B1A30] via-[#0F284E] to-[#0B1A30] border-b border-amber-500/20 px-6 py-4 flex items-center justify-between">
          <MtccLogo variant="compact" size="sm" />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setLoginError(''); }}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'register'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Register (₹{regFee})
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setLoginError(''); }}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'login'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Merchant Login
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setAdminError(''); }}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'admin'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Admin Portal
          </button>
        </div>

        {/* Tab 1: Registration Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
            {/* Promo Box */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-1.5 text-xs text-amber-200">
              <div className="font-extrabold text-amber-300 text-sm flex items-center gap-1.5">
                <span>🔥 Merchant Registration – Only ₹{regFee}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] font-semibold text-slate-300">
                <span>✅ One-Time Payment</span>
                <span>✅ No Monthly Charge</span>
                <span>✅ No Per-Invoice Fee</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1 font-medium">Business / Shop Name *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Royal Auto Care & Spares"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1 font-medium">Proprietor Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1 font-medium">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1 font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="store@email.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1 font-medium">Login Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Choose password"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1 font-medium">Shop / Business Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Market Street, City, State, PIN"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>Pay ₹{regFee} & Activate Merchant Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Tab 2: Merchant Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            {loginError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs">
                {loginError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1 font-medium">
                  Registered Mobile / Email / Merchant ID
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="+91 98765 43210 or MTCC-M-74891"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] text-slate-300 font-medium">Password</label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-[10px] text-amber-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Login to Merchant Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Accounts Helper */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="text-[11px] text-slate-400 font-semibold">One-Click Demo Store Logins:</div>
              <div className="space-y-1.5">
                {getAllMerchants().slice(0, 2).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleQuickDemoLogin(m)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white">{m.businessName}</div>
                      <div className="text-[10px] text-slate-400">{m.mobile} • {m.id}</div>
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Login
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* Tab 3: Forgot Password */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleResetSubmit} className="p-6 space-y-4">
            <div>
              <h3 className="font-bold text-white text-sm">Reset Merchant Password</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter your registered mobile or email to reset your credentials.
              </p>
            </div>

            {resetSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs space-y-1 text-center">
                <CheckCircle2 className="w-6 h-6 mx-auto" />
                <div className="font-bold">Password Reset Instructions Sent!</div>
                <div>A security PIN was dispatched to your mobile. Redirecting to login...</div>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Mobile or Email</label>
                  <input
                    type="text"
                    required
                    value={resetIdentifier}
                    onChange={(e) => setResetIdentifier(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
                  >
                    Send Reset Link
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* Tab 4: Admin Portal Login */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="p-6 space-y-4">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-400" /> Super Admin Portal Access
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Restricted to MTCC BillPro administrators. Manage platform registrations, revenue & announcements.
              </p>
            </div>

            {adminError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-2.5 rounded-xl text-xs">
                {adminError}
              </div>
            )}

            <div>
              <label className="text-[11px] text-slate-300 block mb-1">Admin Security PIN</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Enter admin passcode (e.g. admin123)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-black text-sm shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Enter Admin Dashboard</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
