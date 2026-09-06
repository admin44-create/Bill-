import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  IndianRupee, 
  CheckCircle, 
  XCircle, 
  Search, 
  Bell, 
  Activity, 
  Sliders, 
  Send, 
  Trash2, 
  Eye, 
  Power,
  RefreshCw,
  Building,
  Calendar,
  Lock,
  Globe,
  Receipt,
  KeyRound,
  Phone,
  Mail,
  MapPin,
  Clock,
  Plus,
  Edit,
  Save,
  Check,
  Upload,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  QrCode,
  Copy,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { Merchant, SystemAnnouncement, SystemActivity, WebsiteConfig, Invoice } from '../types';
import { 
  getAllMerchants, 
  saveMerchant,
  updateMerchantStatus, 
  updateMerchantPassword,
  deleteMerchant,
  createMerchantByAdmin,
  getAnnouncements, 
  saveAnnouncement, 
  deleteAnnouncement, 
  getActivityLog, 
  getMerchantInvoices,
  getAdminPassword,
  setAdminPassword,
  verifyAdminPassword,
  saveWebsiteConfig,
  getWebsiteConfig
} from '../utils/storage';
import { formatCurrency } from '../utils/numberToWords';
import { BillGenerator } from './BillGenerator';
import { MtccLogo } from './MtccLogo';
import { buildUpiUri, generateQrDataUrl } from '../utils/upiQr';

interface AdminPanelProps {
  websiteConfig: WebsiteConfig;
  onUpdateWebsiteConfig: (config: WebsiteConfig) => void;
  onSelectMerchantToInspect?: (merchant: Merchant) => void;
  onExitAdmin: () => void;
  onViewInvoice?: (invoice: Invoice, merchant: Merchant) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  websiteConfig,
  onUpdateWebsiteConfig,
  onSelectMerchantToInspect,
  onExitAdmin,
  onViewInvoice,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'bill-generator' | 'website' | 'security' | 'announcements' | 'activity'>('users');
  const [merchants, setMerchants] = useState<Merchant[]>(getAllMerchants());
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>(getAnnouncements());
  const [activities, setActivities] = useState<SystemActivity[]>(getActivityLog());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Website Config Form State
  const [siteName, setSiteName] = useState(websiteConfig.siteName);
  const [tagline, setTagline] = useState(websiteConfig.tagline);
  const [supportPhone, setSupportPhone] = useState(websiteConfig.supportPhone);
  const [secondaryPhone, setSecondaryPhone] = useState(websiteConfig.secondaryPhone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(websiteConfig.whatsappNumber);
  const [supportEmail, setSupportEmail] = useState(websiteConfig.supportEmail);
  const [supportHours, setSupportHours] = useState(websiteConfig.supportHours);
  const [officeAddress, setOfficeAddress] = useState(websiteConfig.officeAddress);
  const [registrationFee, setRegistrationFee] = useState<number>(websiteConfig.registrationFee || 99);
  const [logoUrl, setLogoUrl] = useState(websiteConfig.logoUrl || '');
  const [bannerText, setBannerText] = useState(websiteConfig.bannerText || '');
  const [websiteSaveSuccess, setWebsiteSaveSuccess] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // UPI QR and Payment Configuration State
  const [adminUpiId, setAdminUpiId] = useState(websiteConfig.adminUpiId || 'mtccbillpro@icici');
  const [adminUpiPayeeName, setAdminUpiPayeeName] = useState(websiteConfig.adminUpiPayeeName || 'MTCC BillPro Payments');
  const [upiPaymentNote, setUpiPaymentNote] = useState(websiteConfig.upiPaymentNote || 'MTCC Merchant Registration');
  const [adminCustomQrUrl, setAdminCustomQrUrl] = useState(websiteConfig.adminCustomQrUrl || '');
  const [useCustomQr, setUseCustomQr] = useState<boolean>(websiteConfig.useCustomQr || false);
  const [generatedQrDataUrl, setGeneratedQrDataUrl] = useState<string>('');
  const [liveUpiUri, setLiveUpiUri] = useState<string>('');
  const [copiedAdminUpi, setCopiedAdminUpi] = useState(false);
  const [copiedUpiLink, setCopiedUpiLink] = useState(false);
  const qrFileInputRef = useRef<HTMLInputElement>(null);

  // Real-time automatic UPI QR code generation whenever UPI ID, Payee Name, Amount, or Note changes
  useEffect(() => {
    if (adminUpiId.trim()) {
      const uri = buildUpiUri({
        upiId: adminUpiId.trim(),
        payeeName: adminUpiPayeeName.trim() || 'MTCC BillPro Admin',
        amount: Number(registrationFee) || 99,
        note: upiPaymentNote.trim() || 'MTCC Registration Fee',
      });
      setLiveUpiUri(uri);
      generateQrDataUrl(uri).then(setGeneratedQrDataUrl);
    } else {
      setLiveUpiUri('');
      setGeneratedQrDataUrl('');
    }
  }, [adminUpiId, adminUpiPayeeName, registrationFee, upiPaymentNote]);

  // Admin Password Change State
  const [currentAdminPass, setCurrentAdminPass] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [adminPassFeedback, setAdminPassFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Merchant Password Change Modal
  const [passwordModalMerchant, setPasswordModalMerchant] = useState<Merchant | null>(null);
  const [merchantNewPassword, setMerchantNewPassword] = useState('');
  const [merchantPasswordSaved, setMerchantPasswordSaved] = useState(false);

  // Merchant Edit Modal
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);

  // New Merchant Creation Modal (Admin Override)
  const [showAddMerchantModal, setShowAddMerchantModal] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPassword, setNewPassword] = useState('password123');

  // Announcement creator state
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');

  // Selected merchant for Admin Bill Generator
  const [billGenMerchantId, setBillGenMerchantId] = useState<string>(merchants[0]?.id || '');
  const [generatedBillNotice, setGeneratedBillNotice] = useState<string | null>(null);

  const refreshData = () => {
    setMerchants(getAllMerchants());
    setAnnouncements(getAnnouncements());
    setActivities(getActivityLog());
  };

  const handleToggleStatus = (merchantId: string, currentStatus: 'ACTIVE' | 'INACTIVE') => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    updateMerchantStatus(merchantId, nextStatus);
    refreshData();
  };

  const handleDeleteMerchant = (merchant: Merchant) => {
    if (window.confirm(`Are you sure you want to permanently delete merchant "${merchant.businessName}" (${merchant.id})? This will also remove all their invoices.`)) {
      deleteMerchant(merchant.id);
      refreshData();
    }
  };

  // Save Website Management Changes
  const handleSaveWebsiteConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: WebsiteConfig = {
      siteName: siteName.trim() || 'MTCC BillPro',
      tagline: tagline.trim() || 'Smart • Simple • Professional Billing',
      supportPhone: supportPhone.trim(),
      secondaryPhone: secondaryPhone.trim(),
      whatsappNumber: whatsappNumber.trim(),
      supportEmail: supportEmail.trim(),
      supportHours: supportHours.trim(),
      officeAddress: officeAddress.trim(),
      registrationFee: Number(registrationFee) || 99,
      logoUrl: logoUrl.trim(),
      bannerText: bannerText.trim(),
      adminUpiId: adminUpiId.trim(),
      adminUpiPayeeName: adminUpiPayeeName.trim(),
      adminCustomQrUrl: adminCustomQrUrl.trim(),
      useCustomQr: Boolean(useCustomQr),
      upiPaymentNote: upiPaymentNote.trim(),
    };

    saveWebsiteConfig(updated);
    onUpdateWebsiteConfig(updated);
    setWebsiteSaveSuccess(true);
    setTimeout(() => setWebsiteSaveSuccess(false), 3500);
  };

  // Upload Custom QR Image File
  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAdminCustomQrUrl(reader.result as string);
      setUseCustomQr(true);
    };
    reader.readAsDataURL(file);
  };

  // Upload Logo File
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Change Admin Master Password
  const handleChangeAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPassFeedback(null);

    if (!verifyAdminPassword(currentAdminPass)) {
      setAdminPassFeedback({ type: 'error', message: 'Current admin passcode is incorrect.' });
      return;
    }

    if (!newAdminPass.trim() || newAdminPass.length < 4) {
      setAdminPassFeedback({ type: 'error', message: 'New passcode must be at least 4 characters.' });
      return;
    }

    if (newAdminPass !== confirmAdminPass) {
      setAdminPassFeedback({ type: 'error', message: 'New passcode and confirmation do not match.' });
      return;
    }

    setAdminPassword(newAdminPass);
    setCurrentAdminPass('');
    setNewAdminPass('');
    setConfirmAdminPass('');
    setAdminPassFeedback({ type: 'success', message: 'Master Admin Passcode updated successfully!' });
    setTimeout(() => setAdminPassFeedback(null), 4000);
  };

  // Change User / Merchant Password
  const handleSaveMerchantPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalMerchant || !merchantNewPassword.trim()) return;

    updateMerchantPassword(passwordModalMerchant.id, merchantNewPassword.trim());
    setMerchantPasswordSaved(true);
    refreshData();
    setTimeout(() => {
      setMerchantPasswordSaved(false);
      setPasswordModalMerchant(null);
      setMerchantNewPassword('');
    }, 1500);
  };

  // Edit Merchant Save
  const handleSaveEditedMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMerchant) return;
    saveMerchant(editingMerchant);
    setEditingMerchant(null);
    refreshData();
  };

  // Admin Create New Merchant
  const handleAdminCreateMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusinessName.trim() || !newOwnerName.trim() || !newMobile.trim()) {
      alert('Please fill Business Name, Owner Name, and Mobile Number.');
      return;
    }

    createMerchantByAdmin({
      businessName: newBusinessName.trim(),
      ownerName: newOwnerName.trim(),
      mobile: newMobile.trim(),
      email: newEmail.trim() || `${newMobile.replace(/\D/g, '')}@store.com`,
      address: newAddress.trim() || 'Store Location',
      password: newPassword.trim() || 'password123',
    });

    setNewBusinessName('');
    setNewOwnerName('');
    setNewMobile('');
    setNewEmail('');
    setNewAddress('');
    setNewPassword('password123');
    setShowAddMerchantModal(false);
    refreshData();
  };

  // Create Announcement
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;

    const newAnn: SystemAnnouncement = {
      id: `ANN-${Date.now()}`,
      title: annTitle.trim(),
      message: annMessage.trim(),
      date: new Date().toISOString().split('T')[0],
      active: true,
    };

    saveAnnouncement(newAnn);
    setAnnTitle('');
    setAnnMessage('');
    refreshData();
  };

  const handleDeleteAnnouncement = (id: string) => {
    deleteAnnouncement(id);
    refreshData();
  };

  // KPIs
  const totalRegistrations = merchants.length;
  const paidRegistrations = merchants.filter((m) => m.paymentStatus === 'PAID').length;
  const totalRegistrationRevenue = paidRegistrations * (websiteConfig.registrationFee || 99);
  const activeMerchantsCount = merchants.filter((m) => m.status === 'ACTIVE').length;

  const filteredMerchants = merchants.filter((m) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      m.businessName.toLowerCase().includes(q) ||
      m.ownerName.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.mobile.includes(q) ||
      m.email.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selectedBillMerchant = merchants.find((m) => m.id === billGenMerchantId) || merchants[0];

  return (
    <div className="space-y-6">
      
      {/* Top Admin Security Notice Header */}
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">MTCC BillPro Central Admin Control</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase">
                Master SuperAdmin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Full control: Bill Generation, User & Merchant Management, Website Details & Contact Edit, Passwords
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={refreshData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onExitAdmin}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            Exit to App
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Registered Merchants</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">{totalRegistrations}</div>
          <div className="text-[11px] text-slate-500 mt-1">{activeMerchantsCount} Active Stores</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Registration Revenue</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400 font-mono">
            {formatCurrency(totalRegistrationRevenue)}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1">₹{websiteConfig.registrationFee} x {paidRegistrations} paid stores</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Website Support Contact</span>
            <Phone className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-sm font-bold text-amber-300 truncate">
            {websiteConfig.supportPhone || 'Not configured'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Editable in Website Tab</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Admin Passcode Status</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-sm font-bold text-purple-300">Protected</div>
          <div className="text-[11px] text-slate-500 mt-1">Editable in Security Tab</div>
        </div>
      </div>

      {/* Main Admin Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User & Merchant Management ({merchants.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bill-generator')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'bill-generator'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Generate Bill (Admin)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('website')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'website'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Website & Contact Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'security'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Admin Password Change</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'announcements'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Announcements</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'activity'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Audit Logs</span>
        </button>
      </div>

      {/* TAB 1: USER & MERCHANT MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" /> Registered Merchants & Users Directory
              </h2>
              <p className="text-xs text-slate-400">
                Manage stores, reset user passwords, edit contact profiles, or activate/deactivate accounts
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <button
                type="button"
                onClick={() => setShowAddMerchantModal(true)}
                className="py-1.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Merchant</span>
              </button>

              <div className="relative flex-1 sm:w-56">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search merchant, owner, phone..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <th className="py-3 px-4">Merchant ID</th>
                  <th className="py-3 px-4">Shop / Business & Owner</th>
                  <th className="py-3 px-4">Phone & Email</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Bills</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredMerchants.map((m) => {
                  const invoiceCount = getMerchantInvoices(m.id).length;
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {m.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm">{m.businessName}</div>
                        <div className="text-[11px] text-slate-400">{m.ownerName}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <div className="font-semibold text-white">{m.mobile}</div>
                        <div className="text-[11px] text-slate-400">{m.email}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" /> PAID (₹{websiteConfig.registrationFee})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            m.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-slate-300">
                        {invoiceCount} bills
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Change Password */}
                          <button
                            type="button"
                            onClick={() => {
                              setPasswordModalMerchant(m);
                              setMerchantNewPassword('');
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/20 text-xs font-semibold transition-colors"
                            title="Change User Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => setEditingMerchant(m)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/20 text-xs font-semibold transition-colors"
                            title="Edit Merchant Profile"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Status toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(m.id, m.status)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                              m.status === 'ACTIVE'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            }`}
                          >
                            {m.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>

                          {/* Switch To Store */}
                          {onSelectMerchantToInspect && (
                            <button
                              type="button"
                              onClick={() => onSelectMerchantToInspect(m)}
                              className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-semibold hover:bg-amber-500/25 transition-colors"
                            >
                              Login As Store
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteMerchant(m)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="Delete Merchant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BILL GENERATOR (ADMIN CAN GENERATE BILL FOR ANY MERCHANT) */}
      {activeTab === 'bill-generator' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" /> Admin Bill Generator
              </h2>
              <p className="text-xs text-slate-400">
                Generate and print Non-GST bills under any registered store identity or custom branding
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-300">Generate Under Store:</label>
              <select
                value={billGenMerchantId}
                onChange={(e) => setBillGenMerchantId(e.target.value)}
                className="bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none"
              >
                {merchants.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.businessName} ({m.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {generatedBillNotice && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-between">
              <span>{generatedBillNotice}</span>
              <button
                type="button"
                onClick={() => setGeneratedBillNotice(null)}
                className="text-emerald-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {selectedBillMerchant ? (
            <BillGenerator
              merchant={selectedBillMerchant}
              onUpdateMerchant={() => {
                refreshData();
              }}
              onInvoiceCreated={(inv) => {
                refreshData();
                setGeneratedBillNotice(`Bill #${inv.invoiceNumber} for ₹${inv.grandTotal} generated and saved successfully under ${inv.businessName || selectedBillMerchant.businessName}!`);
                if (onViewInvoice) {
                  onViewInvoice(inv, selectedBillMerchant);
                }
              }}
            />
          ) : (
            <div className="text-center py-12 text-slate-400">No merchant available to bill under.</div>
          )}
        </div>
      )}

      {/* TAB 3: WEBSITE MANAGEMENT (PHONE NUMBERS, CONTACT DETAILS, LOGO EDIT) */}
      {activeTab === 'website' && (
        <form onSubmit={handleSaveWebsiteConfig} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-400" /> Website Management & Contact Details
              </h2>
              <p className="text-xs text-slate-400">
                Edit website phone numbers, support contact details, logo, brand title, and registration fee
              </p>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              {websiteSaveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{websiteSaveSuccess ? 'Website Details Saved!' : 'Save Website Details'}</span>
            </button>
          </div>

          {websiteSaveSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Website branding, phone numbers, contact details, and logo updated instantly!</span>
            </div>
          )}

          {/* Website Logo Section */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Website Brand Logo Edit
            </h3>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Preview Box */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-2xl bg-[#0A1628] border border-amber-500/40 flex items-center justify-center p-2 shadow-lg overflow-hidden">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Website Logo Preview"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <MtccLogo variant="icon-only" size="lg" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">Active Logo Preview</span>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3 w-full">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Logo Image URL (Direct Link)</label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/brand-logo.png"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload Custom Logo File</span>
                  </button>

                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="py-2 px-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-colors cursor-pointer"
                    >
                      Reset to Official MTCC Crest Logo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Website Contact & Numbers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Contact Numbers */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Website Phone & WhatsApp Numbers
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Primary Support Phone Number *</label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500">Displayed in Landing Page header & support section</span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Secondary / Toll-Free Contact Number</label>
                  <input
                    type="text"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    placeholder="+91 94231 88776"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Official WhatsApp Support Number *</label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500">Used for WhatsApp support links</span>
                </div>
              </div>
            </div>

            {/* Email & Location Details */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Support Email & Office Details
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Support Email Address *</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="support@mtccbillpro.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Support Operating Hours *</label>
                  <input
                    type="text"
                    value={supportHours}
                    onChange={(e) => setSupportHours(e.target.value)}
                    placeholder="Mon - Sat: 9:00 AM - 8:00 PM"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Office / Corporate Address *</label>
                  <textarea
                    rows={2}
                    value={officeAddress}
                    onChange={(e) => setOfficeAddress(e.target.value)}
                    placeholder="Shop 14, Commercial Arcade, MG Road, Pune"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Brand Title & Pricing */}
            <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Website Brand Titles & Pricing
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Website Brand Name</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="MTCC BillPro"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Brand Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Smart • Simple • Professional Billing"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">One-Time Registration Fee (₹)</label>
                  <input
                    type="number"
                    value={registrationFee}
                    onChange={(e) => setRegistrationFee(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[11px] text-slate-400 block mb-1">Hero Top Announcement Banner Text</label>
                  <input
                    type="text"
                    value={bannerText}
                    onChange={(e) => setBannerText(e.target.value)}
                    placeholder="🔥 One-Time Merchant Registration – Only ₹99 Lifetime Access!"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* UPI QR Payment Setup & Live Auto Generator */}
            <div className="md:col-span-2 bg-slate-950 border-2 border-amber-500/40 rounded-2xl p-5 space-y-5 shadow-xl shadow-amber-500/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-amber-400" /> Registration Fee ₹{registrationFee || 99} UPI QR Setup
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    UPI ID দিলে লাইভ অটোমেটিক QR Code জেনারেট হবে। ইউজার রেজিস্ট্রেশনের সময় স্ক্যান করে ₹{registrationFee || 99} ফি দিতে পারবে।
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Auto-Live QR
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Inputs Column */}
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-white block mb-1">
                      Admin UPI ID / VPA * <span className="text-amber-400 font-normal">(Receiving Bank Account)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={adminUpiId}
                        onChange={(e) => setAdminUpiId(e.target.value.replace(/\s+/g, ''))}
                        placeholder="e.g. yourname@okaxis, 9876543210@paytm, mtcc@icici"
                        className="w-full bg-slate-900 border-2 border-amber-500/50 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 font-mono font-bold"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span className="text-amber-300/90 font-medium">⚡ UPI ID লিখলেই নিচে সরাসরি QR কোড তৈরি হয়ে যাবে</span>
                      {adminUpiId && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(adminUpiId);
                            setCopiedAdminUpi(true);
                            setTimeout(() => setCopiedAdminUpi(false), 2000);
                          }}
                          className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedAdminUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedAdminUpi ? 'Copied' : 'Copy UPI ID'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Payee / Account Name</label>
                      <input
                        type="text"
                        value={adminUpiPayeeName}
                        onChange={(e) => setAdminUpiPayeeName(e.target.value)}
                        placeholder="MTCC BillPro Payments"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-[10px] text-slate-500">Displayed in merchant's UPI app</span>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Payment Note / Description</label>
                      <input
                        type="text"
                        value={upiPaymentNote}
                        onChange={(e) => setUpiPaymentNote(e.target.value)}
                        placeholder="MTCC Merchant Registration"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-[10px] text-slate-500">Transaction description</span>
                    </div>
                  </div>

                  {/* QR Mode Switch & Custom Upload Option */}
                  <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">QR Code Type:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setUseCustomQr(false)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            !useCustomQr 
                              ? 'bg-amber-500 text-slate-950 shadow-md' 
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          Auto-Generated UPI QR
                        </button>
                        <button
                          type="button"
                          onClick={() => setUseCustomQr(true)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            useCustomQr 
                              ? 'bg-amber-500 text-slate-950 shadow-md' 
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          Custom Uploaded QR
                        </button>
                      </div>
                    </div>

                    {useCustomQr && (
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <label className="text-[11px] text-slate-400 block">
                          Upload Custom QR Code Image (Paytm Soundbox / PhonePe Standee / Bank Scanner)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            ref={qrFileInputRef}
                            onChange={handleQrFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => qrFileInputRef.current?.click()}
                            className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5 text-amber-400" />
                            <span>Upload QR Image File</span>
                          </button>
                          {adminCustomQrUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setAdminCustomQrUrl('');
                                setUseCustomQr(false);
                              }}
                              className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-colors cursor-pointer"
                            >
                              Remove Custom QR
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live QR Code Preview Column */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {useCustomQr ? 'Custom QR Code Preview' : 'Live Auto-Generated UPI QR'}
                  </span>

                  <div className="relative bg-white p-3 rounded-2xl border-2 border-amber-400 shadow-xl flex items-center justify-center">
                    {useCustomQr && adminCustomQrUrl ? (
                      <img
                        src={adminCustomQrUrl}
                        alt="Custom UPI QR"
                        className="w-40 h-40 object-contain"
                      />
                    ) : generatedQrDataUrl ? (
                      <img
                        src={generatedQrDataUrl}
                        alt="Live Auto-Generated UPI QR Code"
                        className="w-40 h-40 object-contain"
                      />
                    ) : (
                      <div className="w-40 h-40 flex flex-col items-center justify-center text-slate-400 text-xs p-2">
                        <QrCode className="w-8 h-8 text-slate-400 mb-1" />
                        <span>Enter UPI ID to generate QR</span>
                      </div>
                    )}
                    <div className="absolute -bottom-2.5 bg-slate-950 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500 text-[10px] font-black tracking-wider">
                      ₹{registrationFee || 99} UPI QR
                    </div>
                  </div>

                  <div className="w-full text-xs space-y-1 pt-1">
                    <div className="font-bold text-white text-sm">{adminUpiPayeeName || 'MTCC BillPro Payments'}</div>
                    <div className="font-mono text-amber-400 font-bold text-xs">{adminUpiId || 'No UPI ID Set'}</div>
                    <div className="text-[11px] text-slate-400">
                      Amount: <span className="text-emerald-400 font-bold">₹{registrationFee || 99}.00</span> (Lifetime License)
                    </div>
                  </div>

                  {liveUpiUri && (
                    <div className="w-full flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(liveUpiUri);
                          setCopiedUpiLink(true);
                          setTimeout(() => setCopiedUpiLink(false), 2000);
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedUpiLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUpiLink ? 'URI Copied' : 'Copy UPI Link'}</span>
                      </button>

                      <a
                        href={liveUpiUri}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30 flex items-center justify-center gap-1 transition-colors"
                        title="Open UPI Intent on Mobile"
                      >
                        <Smartphone className="w-3 h-3 text-amber-400" />
                        <span>Test on App</span>
                      </a>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: MASTER ADMIN PASSWORD CHANGE */}
      {activeTab === 'security' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 max-w-xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" /> Change Master Admin Passcode
            </h2>
            <p className="text-xs text-slate-400">
              Update the security passcode required to access this Central Admin Panel
            </p>
          </div>

          <form onSubmit={handleChangeAdminPassword} className="space-y-4">
            {adminPassFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  adminPassFeedback.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                }`}
              >
                {adminPassFeedback.message}
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 block mb-1">Current Admin Passcode *</label>
              <input
                type="password"
                value={currentAdminPass}
                onChange={(e) => setCurrentAdminPass(e.target.value)}
                placeholder="Enter current admin passcode (default: admin123)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">New Admin Passcode *</label>
              <input
                type="password"
                value={newAdminPass}
                onChange={(e) => setNewAdminPass(e.target.value)}
                placeholder="Enter new strong passcode"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Confirm New Admin Passcode *</label>
              <input
                type="password"
                value={confirmAdminPass}
                onChange={(e) => setConfirmAdminPass(e.target.value)}
                placeholder="Repeat new passcode"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Update Admin Passcode</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" /> Platform Announcement Broadcast
            </h2>
            <p className="text-xs text-slate-400">
              Broadcast high-priority notices and updates directly to all logged-in merchant dashboards
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form onSubmit={handleCreateAnnouncement} className="space-y-4 bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Publish New Broadcast</h3>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Announcement Title *</label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. 🚀 New 58mm Thermal Receipt format is now live!"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Message Content *</label>
                <textarea
                  rows={3}
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="Detail your message here..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast Announcement</span>
              </button>
            </form>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Broadcasts ({announcements.length})</h3>
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-amber-300 text-sm">{ann.title}</div>
                    <div className="text-slate-300 text-xs mt-1">{ann.message}</div>
                    <div className="text-[10px] text-slate-500 mt-2">{ann.date}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ACTIVITY AUDIT LOGS */}
      {activeTab === 'activity' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" /> Real-time System Audit Feed
            </h2>
            <p className="text-xs text-slate-400">
              Audit trails of registrations, payments, store logins, and bill generations
            </p>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {activities.map((act) => (
              <div
                key={act.id}
                className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      act.type === 'REGISTRATION' || act.type === 'PAYMENT'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {act.type}
                    </span>
                    <span className="font-semibold text-white">{act.description}</span>
                  </div>
                  {act.merchantId && (
                    <span className="text-[10px] font-mono text-amber-400">Store: {act.merchantId}</span>
                  )}
                </div>

                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                  {new Date(act.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: CHANGE MERCHANT PASSWORD */}
      {passwordModalMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" /> Change User Password
                </h3>
                <span className="text-xs text-slate-400">{passwordModalMerchant.businessName} ({passwordModalMerchant.id})</span>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalMerchant(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMerchantPassword} className="space-y-4">
              {merchantPasswordSaved ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" /> Password changed successfully!
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">New User Password *</label>
                    <input
                      type="text"
                      value={merchantNewPassword}
                      onChange={(e) => setMerchantNewPassword(e.target.value)}
                      placeholder="Enter new password for merchant"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      required
                      autoFocus
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      The user will use this new password to login from their device.
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setPasswordModalMerchant(null)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black"
                    >
                      Save Password
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT MERCHANT PROFILE */}
      {editingMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Edit Store Profile</h3>
                <span className="text-xs font-mono text-amber-400">{editingMerchant.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingMerchant(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedMerchant} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Shop / Business Name *</label>
                <input
                  type="text"
                  value={editingMerchant.businessName}
                  onChange={(e) => setEditingMerchant({ ...editingMerchant, businessName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Owner Name *</label>
                  <input
                    type="text"
                    value={editingMerchant.ownerName}
                    onChange={(e) => setEditingMerchant({ ...editingMerchant, ownerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    value={editingMerchant.mobile}
                    onChange={(e) => setEditingMerchant({ ...editingMerchant, mobile: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editingMerchant.email}
                  onChange={(e) => setEditingMerchant({ ...editingMerchant, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Store Address</label>
                <textarea
                  rows={2}
                  value={editingMerchant.address}
                  onChange={(e) => setEditingMerchant({ ...editingMerchant, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Invoice Prefix</label>
                  <input
                    type="text"
                    value={editingMerchant.invoicePrefix}
                    onChange={(e) => setEditingMerchant({ ...editingMerchant, invoicePrefix: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Merchant UPI ID</label>
                  <input
                    type="text"
                    value={editingMerchant.upiId || ''}
                    onChange={(e) => setEditingMerchant({ ...editingMerchant, upiId: e.target.value })}
                    placeholder="store@upi"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingMerchant(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
                >
                  Save Store Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD NEW MERCHANT BY ADMIN */}
      {showAddMerchantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-400" /> Provision Merchant Account (Admin Bypass)
                </h3>
                <span className="text-xs text-slate-400">Instantly creates active account with paid status</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMerchantModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdminCreateMerchant} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Shop / Business Name *</label>
                <input
                  type="text"
                  value={newBusinessName}
                  onChange={(e) => setNewBusinessName(e.target.value)}
                  placeholder="e.g. Royal Watch & Optical Services"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Owner / Proprietor Name *</label>
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="e.g. Anand Kumar"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                    placeholder="+91 98000 11111"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="owner@store.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Initial Password *</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Shop Address</label>
                <textarea
                  rows={2}
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Market road, City"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMerchantModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
                >
                  Create & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
