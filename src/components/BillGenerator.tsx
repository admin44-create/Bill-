import React, { useState, useEffect } from 'react';
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
  Calendar 
} from 'lucide-react';
import { Invoice, InvoiceItem, Merchant, Customer, PaymentStatus, PaymentMode } from '../types';
import { numberToIndianWords, formatCurrency } from '../utils/numberToWords';
import { saveMerchantInvoice, saveMerchantCustomer, getMerchantCustomers } from '../utils/storage';

interface BillGeneratorProps {
  merchant: Merchant;
  onInvoiceCreated?: (invoice: Invoice) => void;
  onSavedInvoice?: (invoice: Invoice) => void;
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
    }

    if (onInvoiceCreated) onInvoiceCreated(newInvoice);
    if (onSavedInvoice) onSavedInvoice(newInvoice);
  };

  const handleReset = () => {
    if (window.confirm('Reset all fields and start a fresh bill?')) {
      setInvoiceNumber(`${merchant.invoicePrefix || 'BILL-'}${merchant.nextInvoiceNumber || 101}`);
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().slice(0, 5));
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner Notice */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">Generate Non-GST Bill</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  100% Tax-Exempt / Bill of Supply
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Billed under: <span className="text-white font-semibold">{merchant.businessName}</span> • Mob: {merchant.mobile}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
        
        {/* Left 2 Cols: Bill Meta, Customer & Items */}
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

          {/* Customer Details Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <User className="w-4 h-4" /> Customer Details
              </h3>
              {customers.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                    className="text-xs text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Choose Existing ({customers.length})</span>
                  </button>

                  {showCustomerDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-20 space-y-1 max-h-52 overflow-y-auto">
                      <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">Select Customer</div>
                      {customers.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectCustomer(c)}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-700 text-xs text-white flex flex-col"
                        >
                          <span className="font-bold">{c.name}</span>
                          <span className="text-[11px] text-slate-400">{c.mobile}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Customer / Client Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Patel or Cash Customer"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Customer Mobile (for WhatsApp)</label>
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
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Customer Address (Optional)</label>
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
    </div>
  );
};
