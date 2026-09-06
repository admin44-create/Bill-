import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Share2, 
  Copy, 
  Edit3, 
  X, 
  FileText, 
  Receipt, 
  Check, 
  Image as ImageIcon 
} from 'lucide-react';
import { Invoice, Merchant, PaperSize, InvoiceTemplateId } from '../types';
import { InvoiceRenderer } from './InvoiceRenderer';
import { formatCurrency } from '../utils/numberToWords';

interface InvoiceModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  merchant: Merchant;
  onClose: () => void;
  onDuplicate?: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  invoice,
  merchant,
  onClose,
  onDuplicate,
  onEdit,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplateId>(
    invoice?.template || 'navy-gold'
  );
  const [selectedPaperSize, setSelectedPaperSize] = useState<PaperSize>(
    invoice?.paperSize || 'A4'
  );
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const rawMobile = invoice.customerMobile.replace(/\D/g, '');
    const phone = rawMobile.length === 10 ? `91${rawMobile}` : rawMobile;

    const itemsSummary = invoice.items
      .map((item) => `• ${item.name} (${item.quantity} x ₹${item.rate}) = ₹${item.total}`)
      .join('\n');

    const message = `*NON-GST BILL OF SUPPLY - ${merchant.businessName.toUpperCase()}*\n` +
      `-----------------------------------------\n` +
      `*Bill No:* ${invoice.invoiceNumber}\n` +
      `*Date:* ${invoice.date}\n` +
      `*Customer:* ${invoice.customerName}\n` +
      `-----------------------------------------\n` +
      `*ITEMS:*\n${itemsSummary}\n` +
      `-----------------------------------------\n` +
      `*Grand Total:* ₹${invoice.grandTotal.toLocaleString('en-IN')}\n` +
      `*Paid Amount:* ₹${invoice.paidAmount.toLocaleString('en-IN')}\n` +
      (invoice.dueAmount > 0 ? `*Balance Due:* ₹${invoice.dueAmount.toLocaleString('en-IN')}\n` : '') +
      `*Payment Status:* ${invoice.paymentStatus}\n` +
      `-----------------------------------------\n` +
      (merchant.upiId ? `*Pay via UPI:* ${merchant.upiId}\n` : '') +
      `*Thank you for your business!*\n` +
      `Generated with MTCC BillPro`;

    const url = phone
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  };

  const handleDownloadImage = () => {
    // Generate an image representation using SVG to Canvas
    const invoiceEl = document.getElementById('printable-invoice');
    if (!invoiceEl) return;

    // Use window.print with user instruction
    alert('Tip: In the print dialog, select "Save as PDF" or your Thermal Receipt printer to save a high-res digital copy!');
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      {/* Top Controls Toolbar - Hidden on Print */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3 shadow-xl no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Bill Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base font-mono">{invoice.invoiceNumber}</h3>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                  invoice.paymentStatus === 'PAID'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : invoice.paymentStatus === 'PARTIAL'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
                  {invoice.paymentStatus}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {invoice.customerName} • {formatCurrency(invoice.grandTotal)}
              </div>
            </div>
          </div>

          {/* Template & Paper Size Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Template Selector */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <span className="text-slate-400 px-2 font-medium hidden sm:inline">Theme:</span>
              <button
                type="button"
                onClick={() => setSelectedTemplate('navy-gold')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  selectedTemplate === 'navy-gold' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Executive
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate('clean-minimal')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  selectedTemplate === 'clean-minimal' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Minimal
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate('retail-slip')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  selectedTemplate === 'retail-slip' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Retail
              </button>
            </div>

            {/* Paper Size Selector */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <span className="text-slate-400 px-2 font-medium hidden sm:inline">Format:</span>
              {(['A4', 'A5', '80mm', '58mm'] as PaperSize[]).map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => setSelectedPaperSize(size)}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    selectedPaperSize === size ? 'bg-blue-600 text-white font-bold shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Bill (Ctrl+P)"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share Bill via WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            {onDuplicate && (
              <button
                type="button"
                onClick={() => onDuplicate(invoice)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Duplicate Bill"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Duplicate</span>
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(invoice)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Edit Bill"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Edit</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Invoice Preview Canvas */}
      <main className="flex-1 p-4 md:p-8 flex justify-center items-start overflow-auto">
        <div className="w-full flex justify-center">
          <InvoiceRenderer
            invoice={invoice}
            merchant={merchant}
            paperSize={selectedPaperSize}
            template={selectedTemplate}
          />
        </div>
      </main>
    </div>
  );
};
