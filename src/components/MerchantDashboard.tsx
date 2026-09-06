import React, { useState } from 'react';
import { 
  Receipt, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Plus, 
  Printer, 
  Share2, 
  ArrowUpRight, 
  Search, 
  Calendar,
  IndianRupee,
  Bell,
  Download,
  Filter,
  Package,
  Boxes,
  ShoppingBag
} from 'lucide-react';
import { Merchant, Invoice, Customer, SystemAnnouncement } from '../types';
import { formatCurrency } from '../utils/numberToWords';
import { computeMerchantStockSummary } from '../utils/storage';

interface MerchantDashboardProps {
  merchant: Merchant;
  invoices: Invoice[];
  customers: Customer[];
  announcements: SystemAnnouncement[];
  onCreateBill: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onNavigateTab: (tab: string) => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  merchant,
  invoices,
  customers,
  announcements,
  onCreateBill,
  onViewInvoice,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PARTIAL' | 'UNPAID'>('ALL');

  // Metrics calculation
  const totalBillsCount = invoices.length;
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todayInvoices = invoices.filter((inv) => inv.date === todayStr);
  const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalDue = invoices.reduce((sum, inv) => sum + inv.dueAmount, 0);
  const totalCustomersCount = customers.length;

  // Stock inventory metrics
  const stockSummary = computeMerchantStockSummary(merchant.id);
  const totalStockItems = stockSummary.length;
  const totalStockValuation = stockSummary.reduce((acc, item) => acc + item.stockValue, 0);
  const lowStockCount = stockSummary.filter((item) => item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK').length;

  // Filtered recent invoices
  const filteredInvoices = invoices
    .filter((inv) => {
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerMobile.includes(searchTerm);
      const matchStatus = statusFilter === 'ALL' || inv.paymentStatus === statusFilter;
      return matchSearch && matchStatus;
    })
    .slice(0, 8); // Top 8 recent

  const activeAnnouncements = announcements.filter((a) => a.active);

  return (
    <div className="space-y-6">
      
      {/* Announcements Banner */}
      {activeAnnouncements.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-blue-900/30 to-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 flex-shrink-0 mt-0.5">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-amber-300 text-sm">{activeAnnouncements[0].title}</div>
            <p className="text-xs text-slate-300 mt-0.5">{activeAnnouncements[0].message}</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('settings')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline flex-shrink-0"
          >
            Settings
          </button>
        </div>
      )}

      {/* Hero Welcome Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">{merchant.businessName}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
              {merchant.status}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
            <span>Merchant ID: <b className="text-amber-400 font-mono">{merchant.id}</b></span>
            <span>•</span>
            <span>Proprietor: <b className="text-slate-200">{merchant.ownerName}</b></span>
            <span>•</span>
            <span>Registration: <b className="text-emerald-400">₹99 Lifetime Paid</b></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('stock')}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-sm border border-amber-500/30 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Package className="w-4 h-4" />
            <span>Stock & Purchases</span>
          </button>

          <button
            type="button"
            onClick={onCreateBill}
            className="py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create New Bill</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Bills */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Bills</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-white font-mono">
            {totalBillsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Non-GST Invoices</div>
        </div>

        {/* Today's Sales */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Today's Sales</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-amber-400 font-mono">
            {formatCurrency(todaySales)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{todayInvoices.length} bills generated today</div>
        </div>

        {/* Paid Amount */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Paid Amount</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-emerald-400 font-mono">
            {formatCurrency(totalPaid)}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1">Collected Revenue</div>
        </div>

        {/* Due Amount */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Due Amount</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-rose-400 font-mono">
            {formatCurrency(totalDue)}
          </div>
          <div className="text-[11px] text-rose-500/80 mt-1">Pending Balance</div>
        </div>

        {/* Total Customers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 shadow-lg col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Customers</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-white font-mono">
            {totalCustomersCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Saved Client Profiles</div>
        </div>
      </div>

      {/* Due Amount Urgent Alert Bar if due amount exists */}
      {totalDue > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-rose-300">
                You have {formatCurrency(totalDue)} outstanding payment pending from customers.
              </span>
              <span className="text-[11px] text-rose-200/80 block">
                Send 1-click WhatsApp payment reminders with UPI QR codes to collect dues quickly.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('customers')}
            className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow transition-colors"
          >
            View Unpaid Invoices
          </button>
        </div>
      )}

      {/* Stock & Purchases Overview Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-white">Stock & Inventory Summary (স্টক ও ক্রয়-বিক্রয়)</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                {totalStockItems} Products
              </span>
              {lowStockCount > 0 && (
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">
                  {lowStockCount} Low Stock
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Total Stock Valuation: <b className="text-emerald-400 font-mono">{formatCurrency(totalStockValuation)}</b> • Stock Summary, Purchases & Sales
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('stock')}
          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span>Open Stock & Purchase</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Recent Invoices Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Table Header Bar */}
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-400" /> Recent Invoices
            </h2>
            <p className="text-xs text-slate-400">Track and manage your generated non-GST bills</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search bill # or customer..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid Only</option>
              <option value="PARTIAL">Partial Only</option>
              <option value="UNPAID">Unpaid Only</option>
            </select>
          </div>
        </div>

        {/* Invoices List */}
        {filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{invoice.date}</td>
                    <td className="py-3 px-4 font-medium text-white">
                      <div>{invoice.customerName}</div>
                      {invoice.customerMobile && (
                        <div className="text-[11px] text-slate-400">{invoice.customerMobile}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      {formatCurrency(invoice.grandTotal)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">
                      {formatCurrency(invoice.paidAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-400">
                      {invoice.dueAmount > 0 ? formatCurrency(invoice.dueAmount) : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          invoice.paymentStatus === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : invoice.paymentStatus === 'PARTIAL'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {invoice.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewInvoice(invoice)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="View & Print Bill"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onViewInvoice(invoice)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-[11px] transition-colors"
                        >
                          Open Bill
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Receipt className="w-6 h-6" />
            </div>
            <div className="text-slate-300 font-semibold text-sm">No invoices found matching criteria</div>
            <p className="text-xs text-slate-500">Create your first professional non-GST bill now.</p>
            <button
              type="button"
              onClick={onCreateBill}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all cursor-pointer"
            >
              Generate Bill
            </button>
          </div>
        )}

        {/* Footer Link */}
        <div className="p-4 bg-slate-950/40 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500">Showing {filteredInvoices.length} of {invoices.length} invoices</span>
          <button
            type="button"
            onClick={() => onNavigateTab('invoices')}
            className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            <span>View Complete Invoice Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
