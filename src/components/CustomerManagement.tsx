import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  MapPin, 
  Mail, 
  Receipt, 
  Share2, 
  Trash2, 
  Edit, 
  X, 
  Check, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { Customer, Invoice, Merchant } from '../types';
import { formatCurrency } from '../utils/numberToWords';
import { saveMerchantCustomer, deleteMerchantCustomer } from '../utils/storage';

interface CustomerManagementProps {
  merchant: Merchant;
  customers: Customer[];
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
  onRefresh: () => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  merchant,
  customers,
  invoices,
  onViewInvoice,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // Active customer history drawer
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form inputs
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');

  const openAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setMobile('');
    setAddress('');
    setEmail('');
    setIsModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setMobile(cust.mobile);
    setAddress(cust.address || '');
    setEmail(cust.email || '');
    setIsModalOpen(true);
  };

  const handleSaveCustomer = () => {
    if (!name.trim()) {
      alert('Please enter a Customer Name');
      return;
    }

    const newCustomer: Customer = {
      id: editingCustomer ? editingCustomer.id : `CUST-${Date.now()}`,
      merchantId: merchant.id,
      name: name.trim(),
      mobile: mobile.trim(),
      address: address.trim(),
      email: email.trim(),
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString(),
    };

    saveMerchantCustomer(merchant.id, newCustomer);
    setIsModalOpen(false);
    onRefresh();
  };

  const handleDeleteCustomer = (id: string, custName: string) => {
    if (window.confirm(`Delete customer "${custName}"?`)) {
      deleteMerchantCustomer(merchant.id, id);
      if (selectedCustomer?.id === id) setSelectedCustomer(null);
      onRefresh();
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm) ||
      (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Helper for customer totals
  const getCustomerMetrics = (c: Customer) => {
    const custInvoices = invoices.filter(
      (inv) => inv.customerId === c.id || (c.mobile && inv.customerMobile === c.mobile)
    );
    const totalBilled = custInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
    const totalPaid = custInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const totalDue = custInvoices.reduce((sum, i) => sum + i.dueAmount, 0);

    return { custInvoices, totalBilled, totalPaid, totalDue };
  };

  const handleSendReminder = (c: Customer, dueAmount: number) => {
    const rawMobile = c.mobile.replace(/\D/g, '');
    const phone = rawMobile.length === 10 ? `91${rawMobile}` : rawMobile;

    const message = `Hello ${c.name},\n` +
      `This is a gentle payment reminder from *${merchant.businessName}*.\n` +
      `You have an outstanding balance due of *${formatCurrency(dueAmount)}*.\n` +
      (merchant.upiId ? `Please settle via UPI: *${merchant.upiId}*\n` : '') +
      `Thank you for choosing ${merchant.businessName}!`;

    const url = phone
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" /> Customer Management & Ledger
          </h1>
          <p className="text-xs text-slate-400">Track customer billing history, total paid and outstanding balances</p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by customer name, mobile or address..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 shadow-md"
        />
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((c) => {
          const { custInvoices, totalBilled, totalPaid, totalDue } = getCustomerMetrics(c);
          return (
            <div
              key={c.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white">{c.name}</h3>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{c.mobile || 'No phone'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Edit Customer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomer(c.id, c.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {c.address && (
                  <div className="text-[11px] text-slate-400 flex items-start gap-1 mt-2">
                    <MapPin className="w-3 h-3 text-slate-500 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{c.address}</span>
                  </div>
                )}
              </div>

              {/* Financial Ledger Mini-Metrics */}
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Billed ({custInvoices.length} bills):</span>
                  <span className="font-mono text-white font-semibold">{formatCurrency(totalBilled)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Paid:</span>
                  <span className="font-mono text-emerald-400 font-semibold">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400 font-bold">Total Due:</span>
                  <span className={`font-mono font-bold ${totalDue > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {formatCurrency(totalDue)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(c)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Bills ({custInvoices.length})</span>
                </button>

                {totalDue > 0 && (
                  <button
                    type="button"
                    onClick={() => handleSendReminder(c, totalDue)}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 transition-colors shadow"
                    title="Send WhatsApp Reminder"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
          No customer records found. Add your first customer or they will automatically be saved when you issue a bill!
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Mobile Number (WhatsApp)</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Address / Landmark</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, Postal Code"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@email.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustomer}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition-colors cursor-pointer"
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Invoices Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-lg h-full max-h-[90vh] rounded-2xl p-6 shadow-2xl flex flex-col space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white">{selectedCustomer.name}</h3>
                <div className="text-xs text-slate-400">{selectedCustomer.mobile}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoices list for this customer */}
            <div className="flex-1 space-y-2 overflow-y-auto">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Invoice History
              </div>
              {invoices.filter((inv) => inv.customerId === selectedCustomer.id || inv.customerMobile === selectedCustomer.mobile).map((inv) => (
                <div
                  key={inv.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="font-mono font-bold text-amber-400">{inv.invoiceNumber}</div>
                    <div className="text-slate-400 text-[11px]">{inv.date}</div>
                    <div className="text-slate-300 font-semibold mt-0.5">{formatCurrency(inv.grandTotal)}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      inv.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {inv.paymentStatus}
                    </span>
                    <div>
                      <button
                        type="button"
                        onClick={() => onViewInvoice(inv)}
                        className="text-amber-400 hover:underline text-[11px] font-semibold"
                      >
                        View Bill
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
