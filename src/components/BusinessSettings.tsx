import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Upload, 
  Save, 
  Check, 
  Download, 
  FileUp, 
  CreditCard, 
  Settings, 
  Printer, 
  QrCode, 
  PenTool, 
  ShieldCheck,
  Lock,
  KeyRound
} from 'lucide-react';
import { Merchant, PaperSize, InvoiceTemplateId } from '../types';
import { saveMerchant, exportMerchantData, importMerchantData, updateMerchantPassword } from '../utils/storage';

interface BusinessSettingsProps {
  merchant: Merchant;
  onUpdateMerchant: (updated: Merchant) => void;
  onRefresh: () => void;
}

export const BusinessSettings: React.FC<BusinessSettingsProps> = ({
  merchant,
  onUpdateMerchant,
  onRefresh,
}) => {
  const [businessName, setBusinessName] = useState(merchant.businessName);
  const [ownerName, setOwnerName] = useState(merchant.ownerName);
  const [address, setAddress] = useState(merchant.address);
  const [mobile, setMobile] = useState(merchant.mobile);
  const [email, setEmail] = useState(merchant.email);
  const [invoicePrefix, setInvoicePrefix] = useState(merchant.invoicePrefix || 'BILL-');
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState(merchant.nextInvoiceNumber || 101);
  const [defaultNotes, setDefaultNotes] = useState(merchant.defaultNotes || '');
  const [defaultTerms, setDefaultTerms] = useState(merchant.defaultTerms || '');
  const [upiId, setUpiId] = useState(merchant.upiId || '');
  const [signatureText, setSignatureText] = useState(merchant.signatureText || '');
  const [signatoryTitle, setSignatoryTitle] = useState(merchant.signatoryTitle || 'Authorized Signatory');
  const [logoUrl, setLogoUrl] = useState(merchant.logoUrl || '');
  const [signatureUrl, setSignatureUrl] = useState(merchant.signatureUrl || '');
  const [template, setTemplate] = useState<InvoiceTemplateId>(merchant.template || 'navy-gold');
  const [paperSize, setPaperSize] = useState<PaperSize>(merchant.paperSize || 'A4');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Password Change State
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    const actualCurrent = merchant.password || 'password123';
    if (currentPasswordInput.trim() !== actualCurrent) {
      setPasswordFeedback({ type: 'error', message: 'Current password does not match.' });
      return;
    }

    if (!newPasswordInput.trim() || newPasswordInput.length < 4) {
      setPasswordFeedback({ type: 'error', message: 'New password must be at least 4 characters.' });
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    updateMerchantPassword(merchant.id, newPasswordInput);
    merchant.password = newPasswordInput;
    onUpdateMerchant({ ...merchant, password: newPasswordInput });
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setPasswordFeedback({ type: 'success', message: 'Password updated successfully!' });
    setTimeout(() => setPasswordFeedback(null), 4000);
  };

  // Logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Signature file upload
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSignatureUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const updated: Merchant = {
      ...merchant,
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      address: address.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      invoicePrefix: invoicePrefix.trim(),
      nextInvoiceNumber: Number(nextInvoiceNumber) || 101,
      defaultNotes: defaultNotes.trim(),
      defaultTerms: defaultTerms.trim(),
      upiId: upiId.trim(),
      signatureText: signatureText.trim(),
      signatoryTitle: signatoryTitle.trim(),
      logoUrl,
      signatureUrl,
      template,
      paperSize,
    };

    saveMerchant(updated);
    onUpdateMerchant(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    exportMerchantData(merchant.id);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importMerchantData(merchant.id, reader.result as string);
      alert(result.message);
      if (result.success) {
        onRefresh();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" /> Business Profile & Invoice Configuration
          </h1>
          <p className="text-xs text-slate-400">Configure your store identity, signature, numbering sequence & templates</p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Settings Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Business Identity */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Store & Owner Information
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Business Name *</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Proprietor / Owner Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Business Address *</label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Logo Upload */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Store Logo (Prints on Bills)</label>
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img src={logoUrl} alt="Store Logo" className="w-12 h-12 rounded border border-slate-700 object-contain p-1 bg-white" />
                ) : (
                  <div className="w-12 h-12 rounded border border-slate-700 bg-slate-950 flex items-center justify-center text-slate-500 text-xs">
                    None
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Logo</span>
                </button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Numbering & Payment Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <QrCode className="w-4 h-4" /> Billing Defaults & UPI QR
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Invoice Prefix</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  placeholder="e.g. BILL-"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Next Bill # Sequence</label>
                <input
                  type="number"
                  value={nextInvoiceNumber}
                  onChange={(e) => setNextInvoiceNumber(parseInt(e.target.value) || 101)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Your Merchant UPI ID (Generates Dynamic QR on Invoices)
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourstore@okhdfcbank or 9876543210@paytm"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Customers can scan the printed UPI QR to pay directly to your bank account with zero fees.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Authorized Signatory Name / Text</label>
                <input
                  type="text"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Signatory Title / Designation (পদবী)</label>
                <input
                  type="text"
                  value={signatoryTitle}
                  onChange={(e) => setSignatoryTitle(e.target.value)}
                  placeholder="e.g. Authorized Signatory, Proprietor, Manager"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Template & Paper Defaults */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Default Template</label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="navy-gold">Executive Navy & Gold</option>
                  <option value="clean-minimal">Modern Minimalist</option>
                  <option value="retail-slip">Compact Retail Slip</option>
                  <option value="corporate">Corporate Structured</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Default Paper Format</label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="A4">Standard A4 Sheet</option>
                  <option value="A5">Compact A5 Sheet</option>
                  <option value="80mm">80mm Thermal Receipt</option>
                  <option value="58mm">58mm Thermal Receipt</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Default Notes & Terms */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Default Notes & Terms (Auto-Inserted into New Bills)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Default Note</label>
              <textarea
                rows={3}
                value={defaultNotes}
                onChange={(e) => setDefaultNotes(e.target.value)}
                placeholder="e.g. Thank you for your business!"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Default Terms & Conditions</label>
              <textarea
                rows={3}
                value={defaultTerms}
                onChange={(e) => setDefaultTerms(e.target.value)}
                placeholder="1. Non-GST Bill of Supply. 2. Goods once sold..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Account Password Change */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Account Security & Password
            </h3>
            <span className="text-[11px] text-slate-500">Merchant ID: {merchant.id}</span>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3 max-w-xl">
            {passwordFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  passwordFeedback.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                }`}
              >
                {passwordFeedback.message}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  placeholder="Enter current"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Min 4 chars"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Confirm new"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Update Password</span>
            </button>
          </form>
        </div>

        {/* Security, Data Isolation & Backup Section */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Data Isolation & Secure Backup
            </h3>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
              Isolated Storage Active
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            All invoices and customer records for merchant <b className="text-white">{merchant.id}</b> are securely isolated. You can download an encrypted backup of your entire billing history at any time or restore on a new machine.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleExportBackup}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Complete Backup (.json)</span>
            </button>

            <input
              type="file"
              ref={backupInputRef}
              onChange={handleImportBackup}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => backupInputRef.current?.click()}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FileUp className="w-4 h-4" />
              <span>Restore Backup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
