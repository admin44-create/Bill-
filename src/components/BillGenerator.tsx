import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Save, 
  RotateCcw, 
  Receipt, 
  User, 
  Phone, 
  MapPin, 
  Sparkles, 
  CreditCard, 
  Check, 
  Search, 
  Clock, 
  Calendar,
  Building2,
  Upload,
  Image as ImageIcon,
  X,
  ChevronDown,
  ChevronUp,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { Invoice, InvoiceItem, Merchant, Customer, PaymentStatus, PaymentMode } from '../types';
import { numberToIndianWords, formatCurrency } from '../utils/numberToWords';
import { saveMerchantInvoice, saveMerchantCustomer, getMerchantCustomers, saveMerchant } from '../utils/storage';
import { InvoiceRenderer } from './InvoiceRenderer';

interface BillGeneratorProps {
  merchant: Merchant;
  onInvoiceCreated?: (invoice: Invoice) => void;
  onSavedInvoice?: (invoice: Invoice) => void;
  onUpdateMerchant?: (updated: Merchant) => void;
  onCancel?: () => void;
  initialInvoice?: Invoice | null;
  existingInvoice?: Invoice | null;
  duplicateFrom?: Invoice | null;
  isDemo?: boolean;
}

export const BillGenerator: React.FC<BillGeneratorProps> = ({
  merchant,
  onInvoiceCreated,
  onSavedInvoice,
  onUpdateMerchant,
  onCancel,
  initialInvoice,
  existingInvoice,
  duplicateFrom,
  isDemo = false,
}) => {
  const sourceInvoice = existingInvoice || duplicateFrom || initialInvoice;

  // Existing customers for auto-fill
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Business / Company Identity State (Customizable per bill in both User & Admin panels)
  const [businessName, setBusinessName] = useState(
    sourceInvoice?.businessName || merchant.businessName || ''
  );
  const [logoUrl, setLogoUrl] = useState(
    sourceInvoice?.logoUrl !== undefined ? sourceInvoice.logoUrl : (merchant.logoUrl || '')
  );
  const [businessAddress, setBusinessAddress] = useState(
    sourceInvoice?.businessAddress || merchant.address || ''
  );
  const [businessMobile, setBusinessMobile] = useState(
    sourceInvoice?.businessMobile || merchant.mobile || ''
  );
  const [businessEmail, setBusinessEmail] = useState(
    sourceInvoice?.businessEmail || merchant.email || ''
  );
  const [saveToStoreProfile, setSaveToStoreProfile] = useState(true);
  const [isCompanyDetailsOpen, setIsCompanyDetailsOpen] = useState(true);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState(
    existingInvoice
      ? existingInvoice.invoiceNumber
      : `${merchant.invoicePrefix || 'BILL-'}${merchant.nextInvoiceNumber || 101}`
  );
  const [date, setDate] = useState(
    sourceInvoice ? sourceInvoice.date : new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState(
    sourceInvoice ? sourceInvoice.time : new Date().toTimeString().slice(0, 5)
  );

  // Customer State
  const [customerName, setCustomerName] = useState(sourceInvoice?.customerName || '');
  const [customerMobile, setCustomerMobile] = useState(sourceInvoice?.customerMobile || '');
  const [customerAddress, setCustomerAddress] = useState(sourceInvoice?.customerAddress || '');
  const [customerId, setCustomerId] = useState(sourceInvoice?.customerId || '');

  // Items State
  const [items, setItems] = useState<InvoiceItem[]>(
    sourceInvoice?.items && sourceInvoice.items.length > 0
      ? sourceInvoice.items
      : [
          {
            id: '1',
            name: 'Standard Service / Product',
            quantity: 1,
            rate: 500,
            discount: 0,
            discountType: 'amount',
            total: 500,
          },
        ]
  );

  // Payment Tracking State
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    initialInvoice?.paymentStatus || 'PAID'
  );
  const [paidAmountInput, setPaidAmountInput] = useState<string>(
    initialInvoice ? String(initialInvoice.paidAmount) : '500'
  );
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(
    initialInvoice?.paymentMode || 'CASH'
  );

  // Notes & Terms
  const [notes, setNotes] = useState(initialInvoice?.notes || merchant.defaultNotes || 'Thank you for your business!');
  const [terms, setTerms] = useState(
    initialInvoice?.terms || merchant.defaultTerms || '1. Non-GST Bill of Supply.\n2. Goods once sold are non-refundable.'
  );

  // Load merchant customers
  useEffect(() => {
    if (merchant.id) {
      const list = getMerchantCustomers(merchant.id);
      setCustomers(list);
    }
  }, [merchant.id]);

  // Sync with merchant details if changed outside
  useEffect(() => {
    if (!existingInvoice && !duplicateFrom) {
      setBusinessName(merchant.businessName || '');
      setLogoUrl(merchant.logoUrl || '');
      setBusinessAddress(merchant.address || '');
      setBusinessMobile(merchant.mobile || '');
      setBusinessEmail(merchant.email || '');
      setInvoiceNumber(`${merchant.invoicePrefix || 'BILL-'}${merchant.nextInvoiceNumber || 101}`);
    }
  }, [
    merchant.id,
    merchant.businessName,
    merchant.logoUrl,
    merchant.address,
    merchant.mobile,
    merchant.email,
    merchant.invoicePrefix,
    merchant.nextInvoiceNumber,
  ]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Please choose an image smaller than 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setLogoUrl(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.mobile.includes(customerSearch)
  );

  const handleQuickCashCustomer = () => {
    setCustomerName('Cash / Walk-in Customer');
    setCustomerMobile('');
    setCustomerAddress('');
    setCustomerId('');
  };

  const handleClearCustomer = () => {
    setCustomerName('');
    setCustomerMobile('');
    setCustomerAddress('');
    setCustomerId('');
  };

  // Recalculate totals
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const totalDiscount = items.reduce((acc, item) => {
    if (item.discountType === 'percent') {
      return acc + (item.quantity * item.rate * (item.discount / 100));
    }
    return acc + (item.discount || 0);
  }, 0);
  const grandTotal = Math.max(0, subtotal - totalDiscount);
  const amountInWords = numberToIndianWords(grandTotal);

  // Synchronize paid amount based on payment status
  useEffect(() => {
    if (paymentStatus === 'PAID') {
      setPaidAmountInput(String(grandTotal));
    } else if (paymentStatus === 'UNPAID') {
      setPaidAmountInput('0');
    }
  }, [paymentStatus, grandTotal]);

  const paidAmount = parseFloat(paidAmountInput) || 0;
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  // Item Management
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };

    const qty = field === 'quantity' ? Number(value) : current.quantity;
    const rate = field === 'rate' ? Number(value) : current.rate;
    const disc = field === 'discount' ? Number(value) : current.discount;
    const discType = field === 'discountType' ? value : current.discountType;

    const base = qty * rate;
    const discountAmt = discType === 'percent' ? (base * (disc / 100)) : disc;
    current.total = Math.max(0, base - discountAmt);

    updated[index] = current;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: String(Date.now()),
        name: '',
        quantity: 1,
        rate: 0,
        discount: 0,
        discountType: 'amount',
        total: 0,
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleQuickAdd = (name: string, rate: number) => {
    setItems([
      ...items,
      {
        id: String(Date.now()),
        name,
        quantity: 1,
        rate,
        discount: 0,
        discountType: 'amount',
        total: rate,
      }
    ]);
  };

  // Customer Auto-Select
  const handleSelectCustomer = (c: Customer) => {
    setCustomerName(c.name);
    setCustomerMobile(c.mobile);
    setCustomerAddress(c.address || '');
    setCustomerId(c.id);
    setShowCustomerDropdown(false);
  };

  // Form Submit / Save
  const handleSaveBill = (isDraft: boolean = false) => {
    if (!customerName.trim()) {
      alert('Please enter a Customer Name (or "Cash Customer")');
      return;
    }

    if (items.some((it) => !it.name.trim() || it.rate <= 0)) {
      alert('Please enter valid product/service names and rates for all items.');
      return;
    }

    // Auto-save customer if new
    let assignedCustId = customerId;
    if (!assignedCustId && customerMobile) {
      const existing = customers.find((c) => c.mobile === customerMobile);
      if (existing) {
        assignedCustId = existing.id;
      } else {
        const newCust: Customer = {
          id: `CUST-${Date.now()}`,
          merchantId: merchant.id,
          name: customerName,
          mobile: customerMobile,
          address: customerAddress,
          createdAt: new Date().toISOString(),
        };
        saveMerchantCustomer(merchant.id, newCust);
        assignedCustId = newCust.id;
      }
    }

    const newInvoice: Invoice = {
      id: initialInvoice ? initialInvoice.id : `INV-${Date.now()}`,
      invoiceNumber: invoiceNumber.trim() || `${merchant.invoicePrefix || 'BILL-'}${Date.now().toString().slice(-4)}`,
      merchantId: merchant.id,
      businessName: businessName.trim() || merchant.businessName,
      businessAddress: businessAddress.trim() || merchant.address,
      businessMobile: businessMobile.trim() || merchant.mobile,
      businessEmail: businessEmail.trim() || merchant.email,
      logoUrl: logoUrl.trim(),
      date,
      time,
      customerId: assignedCustId,
      customerName: customerName.trim(),
      customerMobile: customerMobile.trim(),
      customerAddress: customerAddress.trim(),
      items,
      subtotal,
      totalDiscount,
      grandTotal,
      amountInWords,
      paymentStatus,
      paidAmount,
      dueAmount,
      paymentMode,
      notes,
      terms,
      template: merchant.template || 'navy-gold',
      paperSize: merchant.paperSize || 'A4',
      createdAt: initialInvoice ? initialInvoice.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDraft,
    };

    if (!isDemo) {
      saveMerchantInvoice(merchant.id, newInvoice);

      // Save to store profile if merchant/admin checked the box
      if (saveToStoreProfile) {
        const updatedMerchant: Merchant = {
          ...merchant,
          businessName: businessName.trim() || merchant.businessName,
          address: businessAddress.trim() || merchant.address,
          mobile: businessMobile.trim() || merchant.mobile,
          email: businessEmail.trim() || merchant.email,
          logoUrl: logoUrl.trim(),
        };
        saveMerchant(updatedMerchant);
        if (onUpdateMerchant) {
          onUpdateMerchant(updatedMerchant);
        }
      }
    }

    if (onInvoiceCreated) onInvoiceCreated(newInvoice);
    if (onSavedInvoice) onSavedInvoice(newInvoice);
  };

  const handleReset = () => {
    if (window.confirm('Reset all fields and start a fresh bill?')) {
      setInvoiceNumber(`${merchant.invoicePrefix || 'BILL-'}${merchant.nextInvoiceNumber || 101}`);
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().slice(0, 5));
      setBusinessName(merchant.businessName || '');
      setLogoUrl(merchant.logoUrl || '');
      setBusinessAddress(merchant.address || '');
      setBusinessMobile(merchant.mobile || '');
      setBusinessEmail(merchant.email || '');
      setCustomerName('');
      setCustomerMobile('');
      setCustomerAddress('');
      setCustomerId('');
      setItems([
        {
          id: '1',
          name: '',
          quantity: 1,
          rate: 0,
          discount: 0,
          discountType: 'amount',
          total: 0,
        }
      ]);
      setPaymentStatus('PAID');
      setPaidAmountInput('0');
      setPaymentMode('CASH');
    }
  };

  // Live preview invoice object
  const previewInvoiceObject: Invoice = {
    id: initialInvoice ? initialInvoice.id : 'PREVIEW-TEMP',
    invoiceNumber: invoiceNumber.trim() || 'BILL-PREVIEW',
    merchantId: merchant.id,
    businessName: businessName.trim() || merchant.businessName,
    businessAddress: businessAddress.trim() || merchant.address,
    businessMobile: businessMobile.trim() || merchant.mobile,
    businessEmail: businessEmail.trim() || merchant.email,
    logoUrl: logoUrl.trim(),
    date,
    time,
    customerName: customerName.trim() || 'Customer Name',
    customerMobile: customerMobile.trim(),
    customerAddress: customerAddress.trim(),
    items,
    subtotal,
    totalDiscount,
    grandTotal,
    amountInWords,
    paymentStatus,
    paidAmount,
    dueAmount,
    paymentMode,
    notes,
    terms,
    template: merchant.template || 'navy-gold',
    paperSize: merchant.paperSize || 'A4',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner Notice */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="w-12 h-12 object-contain rounded-xl bg-white/10 border border-amber-500/40 p-1 shadow"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Receipt className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white">Generate Non-GST Bill</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  100% Tax-Exempt / Bill of Supply
                </span>
                {logoUrl && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Custom Logo Attached
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>Billed as: <span className="text-amber-300 font-bold">{businessName || merchant.businessName}</span></span>
                {businessMobile && <span>• 📞 {businessMobile}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowLivePreview(true)}
              className="px-3 py-2 rounded-xl border border-amber-500/40 hover:bg-amber-500/10 text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveBill(false)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Preview Bill</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Bill Meta, Company Branding, Customer & Items */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Metadata Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Bill Metadata
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Invoice / Bill Number *</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                  placeholder="BILL-101"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Date *</label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Company & Store Identity Card (Customizable per bill) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <span>Company & Store Branding (কোম্পানির নাম ও লোগো)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Customize your business name, upload your own logo, or edit address/contacts for this bill
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCompanyDetailsOpen(!isCompanyDetailsOpen)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 p-1 cursor-pointer"
              >
                <span>{isCompanyDetailsOpen ? 'Hide' : 'Edit Details'}</span>
                {isCompanyDetailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {isCompanyDetailsOpen && (
              <div className="pt-2 border-t border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Company / Business Name */}
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">
                      Company / Business Name * (কোম্পানির নাম)
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Maa Tara Electricals / Modern Tech Solutions"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Company Logo Upload & Preview */}
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">
                      Company Logo (লোগো আপলোড বা ছবি দিন)
                    </label>
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex items-center gap-3">
                      {logoUrl ? (
                        <div className="relative group">
                          <img
                            src={logoUrl}
                            alt="Company Logo"
                            className="w-12 h-12 object-contain rounded-xl border border-amber-500/40 bg-white/5 p-1 shadow"
                          />
                          <button
                            type="button"
                            onClick={() => setLogoUrl('')}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs shadow hover:bg-rose-500"
                            title="Remove Logo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-dashed border-slate-700 flex items-center justify-center text-slate-500">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}

                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{logoUrl ? 'Change Logo' : 'Upload Logo File'}</span>
                          </button>
                          {logoUrl && (
                            <button
                              type="button"
                              onClick={() => setLogoUrl('')}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium transition-colors"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          placeholder="Or paste image URL (https://...)"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Address */}
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">
                      Business Address (দোকান বা অফিসের ঠিকানা)
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        placeholder="e.g. Shop 4B, Main Market, Kolkata"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Business Phone & Email */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">
                        Store Phone (ফোন নম্বর)
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                        <input
                          type="tel"
                          value={businessMobile}
                          onChange={(e) => setBusinessMobile(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">
                        Store Email (ইমেইল)
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                        <input
                          type="email"
                          value={businessEmail}
                          onChange={(e) => setBusinessEmail(e.target.value)}
                          placeholder="store@email.com"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save to Profile Checkbox */}
                <label className="flex items-center gap-2.5 pt-1 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={saveToStoreProfile}
                    onChange={(e) => setSaveToStoreProfile(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>
                    Save these company details and logo to store profile for future bills (দোকানের প্রোফাইলেও সেভ করুন)
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Customer Details Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 relative">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <User className="w-4 h-4" /> Customer Details (কাস্টমার ডিটেলস)
              </h3>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleQuickCashCustomer}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-semibold border border-amber-500/30 transition-colors cursor-pointer"
                >
                  + Cash Customer
                </button>

                {(customerName || customerMobile || customerAddress) && (
                  <button
                    type="button"
                    onClick={handleClearCustomer}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}

                {customers.length > 0 && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                      className="text-xs text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1 cursor-pointer bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700"
                    >
                      <span>Saved Customers ({customers.length})</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {showCustomerDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-30 space-y-2">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            placeholder="Search name or mobile..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="max-h-52 overflow-y-auto space-y-1">
                          {filteredCustomers.length === 0 ? (
                            <div className="text-[11px] text-slate-500 p-2 text-center">No customer found</div>
                          ) : (
                            filteredCustomers.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => handleSelectCustomer(c)}
                                className="w-full text-left p-2 rounded-xl hover:bg-slate-800 text-xs text-white flex flex-col transition-colors cursor-pointer"
                              >
                                <span className="font-bold text-amber-300">{c.name}</span>
                                <span className="text-[11px] text-slate-400">{c.mobile || 'No mobile'}</span>
                                {c.address && <span className="text-[10px] text-slate-500 truncate">{c.address}</span>}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Customer / Client Name * (কাস্টমারের নাম)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Patel or Cash Customer"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Customer Mobile (for WhatsApp) (মোবাইল নম্বর)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Customer Address (Optional) (কাস্টমারের ঠিকানা)</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Address / City / Landmark"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product & Service Items Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Billed Items / Services
                </h3>
                <span className="text-[11px] text-slate-400">Non-GST line items with instant calculations</span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickAdd('Consultation / Service Charge', 500)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg border border-slate-700"
                >
                  + Service (₹500)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd('Standard Repair & Labor', 800)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg border border-slate-700"
                >
                  + Repair (₹800)
                </button>
              </div>
            </div>

            {/* Line items list */}
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3"
                >
                  {/* Item Description */}
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-400 font-medium block sm:hidden">Item Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      placeholder="Product or service description"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="w-20">
                    <label className="text-[10px] text-slate-400 font-medium block sm:hidden">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs sm:text-sm text-white font-mono text-center focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Rate */}
                  <div className="w-28">
                    <label className="text-[10px] text-slate-400 font-medium block sm:hidden">Rate (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.rate || ''}
                      onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white font-mono text-right focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Discount */}
                  <div className="w-24">
                    <label className="text-[10px] text-slate-400 font-medium block sm:hidden">Disc (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={item.discount || ''}
                      onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs sm:text-sm text-amber-300 font-mono text-right focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Total */}
                  <div className="w-28 text-right font-mono font-bold text-white text-xs sm:text-sm pt-1 sm:pt-0">
                    <span className="text-[10px] text-slate-500 sm:hidden block">Total: </span>
                    {formatCurrency(item.total)}
                  </div>

                  {/* Delete */}
                  <div className="text-right sm:text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length <= 1}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 disabled:opacity-30 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2.5 border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl text-xs font-bold text-slate-300 hover:text-amber-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Item</span>
            </button>
          </div>

          {/* Notes & Terms Accordion */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Notes & Terms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Invoice Notes (e.g. warranty / gratitude)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Totals, Payment Tracking, Actions */}
        <div className="space-y-6">
          
          {/* Totals Summary Box */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Bill Calculation
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300 border-b border-slate-800 pb-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal:</span>
                <span className="font-mono font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Total Discount:</span>
                  <span className="font-mono">- {formatCurrency(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm font-black text-white pt-2 border-t border-slate-800">
                <span>Grand Total:</span>
                <span className="text-lg font-mono text-amber-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Amount in words */}
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-[11px] text-slate-400 italic">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase mb-0.5">Amount in Words:</span>
              "{amountInWords}"
            </div>

            {/* Payment Tracking Controls */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Payment Status
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['PAID', 'PARTIAL', 'UNPAID'] as PaymentStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setPaymentStatus(st)}
                      className={`py-2 text-center rounded-xl text-xs font-extrabold transition-all ${
                        paymentStatus === st
                          ? st === 'PAID'
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : st === 'PARTIAL'
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                          : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paid Amount Input */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Paid Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    max={grandTotal}
                    value={paidAmountInput}
                    onChange={(e) => {
                      setPaidAmountInput(e.target.value);
                      const p = parseFloat(e.target.value) || 0;
                      if (p >= grandTotal) setPaymentStatus('PAID');
                      else if (p > 0) setPaymentStatus('PARTIAL');
                      else setPaymentStatus('UNPAID');
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Balance Due (₹)</label>
                  <div className={`px-3 py-2 rounded-xl border text-xs font-mono font-extrabold ${
                    dueAmount > 0 
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    {formatCurrency(dueAmount)}
                  </div>
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                  <option value="OTHER">Other / Credit</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 space-y-2">
              <button
                type="button"
                onClick={() => handleSaveBill(false)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save & Preview Bill</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveBill(true)}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Save as Draft</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {showLivePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Live Bill Preview</span>
                    <span className="text-xs text-amber-400 font-normal">({businessName || merchant.businessName})</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Real-time look of the invoice with current company branding, logo, and customer details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLivePreview(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex justify-center">
              <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden text-slate-900">
                <InvoiceRenderer
                  invoice={previewInvoiceObject}
                  merchant={merchant}
                  template={merchant.template || 'navy-gold'}
                  paperSize={merchant.paperSize || 'A4'}
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowLivePreview(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Back to Editing
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowLivePreview(false);
                  handleSaveBill(false);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save & Generate Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
