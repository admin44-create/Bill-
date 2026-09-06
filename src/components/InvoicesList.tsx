import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Filter, 
  Printer, 
  Share2, 
  Copy, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  IndianRupee, 
  Download, 
  Plus,
  Calendar,
  X
} from 'lucide-react';
import { Invoice, Merchant, PaymentStatus } from '../types';
import { formatCurrency } from '../utils/numberToWords';
import { saveMerchantInvoice, deleteMerchantInvoice } from '../utils/storage';

interface InvoicesListProps {
  merchant: Merchant;
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onCreateBill: () => void;
  onRefresh: () => void;
}

export const InvoicesList: React.FC<InvoicesListProps> = ({
  merchant,
  invoices,
  onViewInvoice,
  onDuplicateInvoice,
  onEditInvoice,
  onCreateBill,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus | 'DRAFT'>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  
  // Quick payment recording state
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [additionalPayment, setAdditionalPayment] = useState<number>(0);

  // Filters logic
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const filtered = invoices.filter((inv) => {
    // Search
    const q = searchTerm.toLowerCase();
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q) ||
      inv.customerMobile.includes(q);

    // Status
    let matchStatus = true;
    if (statusFilter === 'DRAFT') {
      matchStatus = !!inv.isDraft;
    } else if (statusFilter !== 'ALL') {
      matchStatus = inv.paymentStatus === statusFilter && !inv.isDraft;
    }

    // Date
    let matchDate = true;
    if (dateFilter === 'TODAY') {
      matchDate = inv.date === todayStr;
    } else if (dateFilter === 'WEEK') {
      const invDate = new Date(inv.date);
      const diffDays = (now.getTime() - invDate.getTime()) / (1000 * 3600 * 24);
      matchDate = diffDays <= 7;
    } else if (dateFilter === 'MONTH') {
      const invDate = new Date(inv.date);
      const diffDays = (now.getTime() - invDate.getTime()) / (1000 * 3600 * 24);
      matchDate = diffDays <= 30;
    }

    return matchSearch && matchStatus && matchDate;
  });

  const handleDelete = (id: string, invoiceNum: string) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoiceNum}?`)) {
      deleteMerchantInvoice(merchant.id, id);
      onRefresh();
    }
  };

  const handleOpenPaymentModal = (inv: Invoice) => {
    setPayingInvoice(inv);
    setAdditionalPayment(inv.dueAmount);
  };

  const handleSavePayment = () => {
    if (!payingInvoice) return;
    const newPaid = payingInvoice.paidAmount + additionalPayment;
    const newDue = Math.max(0, payingInvoice.grandTotal - newPaid);
    const newStatus: PaymentStatus = newDue <= 0 ? 'PAID' : newPaid > 0 ? 'PARTIAL' : 'UNPAID';

    const updated: Invoice = {
      ...payingInvoice,
      paidAmount: newPaid,
      dueAmount: newDue,
      paymentStatus: newStatus,
      updatedAt: new Date().toISOString(),
    };

    saveMerchantInvoice(merchant.id, updated);
    setPayingInvoice(null);
    onRefresh();
  };

  const exportCSV = () => {
    const headers = ['Invoice Number', 'Date', 'Customer Name', 'Customer Mobile', 'Subtotal', 'Discount', 'Grand Total', 'Paid Amount', 'Due Amount', 'Status', 'Payment Mode'];
    const rows = filtered.map((i) => [
      i.invoiceNumber,
      i.date,
      `"${i.customerName}"`,
      `"${i.customerMobile}"`,
      i.subtotal,
      i.totalDiscount,
      i.grandTotal,
      i.paidAmount,
      i.dueAmount,
      i.paymentStatus,
      i.paymentMode || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MTCC_Bills_${merchant.id}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" /> Invoice Ledger & History
            </h1>
            <p className="text-xs text-slate-400">Search, filter, track payments, print and duplicate invoices</p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={exportCSV}
              className="px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={onCreateBill}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Bill</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Bill #, Customer name or mobile..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PAID">Paid Only</option>
              <option value="PARTIAL">Partial Payment Only</option>
              <option value="UNPAID">Unpaid Only</option>
              <option value="DRAFT">Drafts Only</option>
            </select>
          </div>

          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Created Today</option>
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {inv.invoiceNumber}
                      {inv.isDraft && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{inv.date}</div>
                      <div className="text-[11px] text-slate-500">{inv.time || '12:00'}</div>
                    </td>
                    <td className="py-3 px-4 text-white">
                      <div className="font-semibold">{inv.customerName}</div>
                      {inv.customerMobile && (
                        <div className="text-[11px] text-slate-400">{inv.customerMobile}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      {formatCurrency(inv.grandTotal)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">
                      {formatCurrency(inv.paidAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-400">
                      {inv.dueAmount > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleOpenPaymentModal(inv)}
                          className="hover:underline font-bold text-rose-400 cursor-pointer"
                          title="Click to record payment"
                        >
                          {formatCurrency(inv.dueAmount)}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          inv.paymentStatus === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : inv.paymentStatus === 'PARTIAL'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewInvoice(inv)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="View / Print Bill"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateInvoice(inv)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Duplicate as New Bill"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditInvoice(inv)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Edit Bill"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Bill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            No invoices found matching your filters.
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-400" /> Record Received Payment
              </h3>
              <button
                type="button"
                onClick={() => setPayingInvoice(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Bill Number:</span>
                <span className="font-mono font-bold text-white">{payingInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-semibold text-white">{payingInvoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Grand Total:</span>
                <span className="font-mono text-white">{formatCurrency(payingInvoice.grandTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Already Paid:</span>
                <span className="font-mono text-emerald-400">{formatCurrency(payingInvoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800 font-bold">
                <span className="text-rose-400">Remaining Due:</span>
                <span className="font-mono text-rose-400">{formatCurrency(payingInvoice.dueAmount)}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Payment Received Now (₹)
              </label>
              <input
                type="number"
                min="1"
                max={payingInvoice.dueAmount}
                value={additionalPayment || ''}
                onChange={(e) => setAdditionalPayment(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPayingInvoice(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePayment}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
