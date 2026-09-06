import React from 'react';
import { Invoice, Merchant, PaperSize, InvoiceTemplateId } from '../types';
import { formatCurrency } from '../utils/numberToWords';

interface InvoiceRendererProps {
  invoice: Invoice;
  merchant: Merchant;
  paperSize?: PaperSize;
  template?: InvoiceTemplateId;
  hideActions?: boolean;
}

export const InvoiceRenderer: React.FC<InvoiceRendererProps> = ({
  invoice,
  merchant,
  paperSize = invoice.paperSize || 'A4',
  template = invoice.template || 'navy-gold',
}) => {
  const isThermal = paperSize === '58mm' || paperSize === '80mm';

  // 58mm / 80mm Thermal Receipt Layout
  if (isThermal) {
    const is58 = paperSize === '58mm';
    return (
      <div
        className={`bg-white text-black font-mono mx-auto p-2 border border-dashed border-gray-400 print:border-none ${
          is58 ? 'thermal-58mm max-w-[240px] text-[10px]' : 'thermal-80mm max-w-[320px] text-xs'
        }`}
        id="printable-invoice"
      >
        {/* Header */}
        <div className="text-center pb-2 border-b border-black border-dashed">
          <div className="font-extrabold uppercase text-sm tracking-wide">{merchant.businessName}</div>
          <div className="text-[10px] leading-tight text-gray-700 mt-0.5">{merchant.address}</div>
          <div className="text-[10px] mt-0.5">Mob: {merchant.mobile}</div>
          <div className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold border border-black uppercase">
            NON-GST BILL OF SUPPLY
          </div>
        </div>

        {/* Bill Metadata */}
        <div className="py-1.5 border-b border-black border-dashed text-[10px] space-y-0.5">
          <div className="flex justify-between">
            <span>Bill No: <b>{invoice.invoiceNumber}</b></span>
            <span>{invoice.date}</span>
          </div>
          <div className="flex justify-between">
            <span>Time: {invoice.time || '12:00'}</span>
            <span className="font-bold uppercase">[{invoice.paymentStatus}]</span>
          </div>
          <div className="pt-0.5">
            <div>Customer: <b>{invoice.customerName}</b></div>
            {invoice.customerMobile && <div>Contact: {invoice.customerMobile}</div>}
          </div>
        </div>

        {/* Line Items */}
        <div className="py-1.5 border-b border-black border-dashed">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black border-dotted text-[9px] uppercase">
                <th className="py-0.5 text-left">Item</th>
                <th className="py-0.5 text-center">Qty</th>
                <th className="py-0.5 text-right">Rate</th>
                <th className="py-0.5 text-right">Amt</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200 border-dotted">
                  <td className="py-1 pr-1 font-sans font-medium text-[10px] leading-tight">
                    {item.name}
                    {item.discount > 0 && (
                      <span className="block text-[8px] text-gray-600">(-₹{item.discount} off)</span>
                    )}
                  </td>
                  <td className="py-1 text-center font-mono">{item.quantity}</td>
                  <td className="py-1 text-right font-mono">₹{item.rate}</td>
                  <td className="py-1 text-right font-mono font-bold">₹{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="py-1.5 border-b border-black border-dashed space-y-0.5 text-[10px]">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.totalDiscount > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Total Discount:</span>
              <span>-₹{invoice.totalDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
            <span>GRAND TOTAL:</span>
            <span>₹{invoice.grandTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[10px] pt-0.5">
            <span>Paid Amount ({invoice.paymentMode || 'Cash'}):</span>
            <span>₹{invoice.paidAmount.toFixed(2)}</span>
          </div>
          {invoice.dueAmount > 0 && (
            <div className="flex justify-between font-bold text-red-600">
              <span>Balance Due:</span>
              <span>₹{invoice.dueAmount.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Amount in words */}
        <div className="py-1 text-[9px] italic border-b border-black border-dashed text-center">
          {invoice.amountInWords}
        </div>

        {/* UPI QR if merchant UPI available */}
        {merchant.upiId && (
          <div className="py-2 text-center border-b border-black border-dashed">
            <div className="text-[9px] font-bold uppercase mb-1">Scan & Pay via UPI</div>
            <div className="inline-block p-1 border border-black bg-white">
              {/* Fallback clean QR representation */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(
                  `upi://pay?pa=${merchant.upiId}&pn=${encodeURIComponent(merchant.businessName)}&am=${invoice.dueAmount > 0 ? invoice.dueAmount : invoice.grandTotal}&cu=INR`
                )}`}
                alt="UPI QR Code"
                className="w-16 h-16 mx-auto"
                loading="lazy"
              />
            </div>
            <div className="text-[8px] mt-0.5">{merchant.upiId}</div>
          </div>
        )}

        {/* Notes & Footer */}
        <div className="py-1.5 text-center text-[9px] space-y-1">
          {invoice.notes && <div>{invoice.notes}</div>}
          <div className="font-bold">*** Thank You! Visit Again ***</div>
          <div className="text-[7px] text-gray-500">Billed via MTCC BillPro (Non-GST)</div>
        </div>
      </div>
    );
  }

  // Standard Sheet Layout: A4 or A5
  const isA5 = paperSize === 'A5';

  return (
    <div
      id="printable-invoice"
      className={`bg-white text-slate-900 mx-auto shadow-2xl print:shadow-none transition-all print:m-0 print:p-0 ${
        isA5 ? 'layout-a5 p-6 max-w-[620px] text-xs' : 'layout-a4 p-8 sm:p-10 max-w-[820px] text-sm'
      }`}
    >
      {/* TEMPLATE 1: Navy & Gold Executive */}
      {template === 'navy-gold' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="border-b-2 border-amber-500 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {merchant.logoUrl ? (
                  <img
                    src={merchant.logoUrl}
                    alt={merchant.businessName}
                    className="w-16 h-16 object-contain rounded border border-amber-500/30 p-1"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-[#0B1A30] border border-amber-500/40 flex items-center justify-center text-amber-400 font-extrabold text-xl shadow-md">
                    {merchant.businessName.charAt(0)}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-[#0B1A30] font-['Space_Grotesk'] uppercase">
                    {merchant.businessName}
                  </h1>
                  <p className="text-xs text-slate-600 max-w-sm mt-0.5 leading-relaxed">
                    {merchant.address}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-700 mt-1 font-medium">
                    <span>📞 {merchant.mobile}</span>
                    {merchant.email && <span>✉️ {merchant.email}</span>}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-block bg-[#0B1A30] text-amber-400 px-3 py-1 rounded text-xs font-black tracking-wider uppercase shadow-sm">
                  NON-GST BILL OF SUPPLY
                </div>
                <div className="mt-2 space-y-0.5 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Invoice No:</span>{' '}
                    <span className="font-extrabold text-[#0B1A30] text-base font-mono">{invoice.invoiceNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Date:</span>{' '}
                    <span className="font-semibold text-slate-800">{invoice.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Time:</span>{' '}
                    <span className="font-semibold text-slate-800">{invoice.time || '12:00'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold tracking-wider text-amber-700 uppercase">
                Billed To (Customer):
              </div>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                {invoice.customerName || 'Cash Customer'}
              </div>
              {invoice.customerMobile && (
                <div className="text-xs text-slate-600 mt-0.5">Phone: {invoice.customerMobile}</div>
              )}
              {invoice.customerAddress && (
                <div className="text-xs text-slate-500 mt-0.5 leading-relaxed max-w-xs">
                  {invoice.customerAddress}
                </div>
              )}
            </div>

            <div className="sm:text-right flex sm:flex-col justify-between sm:justify-start">
              <div>
                <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Payment Status</div>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      invoice.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : invoice.paymentStatus === 'PARTIAL'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {invoice.paymentStatus}
                  </span>
                </div>
              </div>
              {invoice.paymentMode && (
                <div className="text-xs text-slate-500 mt-1">
                  Mode: <span className="font-bold text-slate-800">{invoice.paymentMode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-hidden border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0B1A30] text-white text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Item / Description</th>
                  <th className="py-3 px-4 text-center w-20">Qty</th>
                  <th className="py-3 px-4 text-right w-28">Rate (₹)</th>
                  <th className="py-3 px-4 text-right w-24">Discount</th>
                  <th className="py-3 px-4 text-right w-32">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700">{item.quantity}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-700">
                      {item.discount > 0 ? `-₹${item.discount}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Signatures Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Left Column: Words & UPI */}
            <div className="space-y-4">
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5">
                <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                  Amount in Words:
                </div>
                <div className="text-xs font-bold text-slate-800 mt-1 italic">
                  {invoice.amountInWords}
                </div>
              </div>

              {invoice.notes && (
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Notes: </span>
                  {invoice.notes}
                </div>
              )}

              {invoice.terms && (
                <div className="text-[11px] text-slate-500 whitespace-pre-line leading-relaxed">
                  <span className="font-bold text-slate-700 block mb-0.5">Terms & Conditions:</span>
                  {invoice.terms}
                </div>
              )}

              {merchant.upiId && (
                <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(
                      `upi://pay?pa=${merchant.upiId}&pn=${encodeURIComponent(merchant.businessName)}&am=${invoice.dueAmount > 0 ? invoice.dueAmount : invoice.grandTotal}&cu=INR`
                    )}`}
                    alt="UPI Payment QR"
                    className="w-14 h-14 border border-slate-300 rounded p-1"
                    loading="lazy"
                  />
                  <div className="text-xs">
                    <div className="font-bold text-slate-800">Scan to Pay via UPI</div>
                    <div className="text-[11px] text-slate-500 font-mono">{merchant.upiId}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Calculations & Signature */}
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.totalDiscount > 0 && (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>Total Discount:</span>
                    <span className="font-mono">- {formatCurrency(invoice.totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-base font-black text-[#0B1A30] pt-2 border-t border-slate-300">
                  <span>GRAND TOTAL:</span>
                  <span className="font-mono text-lg text-[#0B1A30]">{formatCurrency(invoice.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200">
                  <span>Amount Paid:</span>
                  <span className="font-mono font-bold text-emerald-700">{formatCurrency(invoice.paidAmount)}</span>
                </div>
                {invoice.dueAmount > 0 && (
                  <div className="flex justify-between text-rose-700 font-bold">
                    <span>Balance Due:</span>
                    <span className="font-mono">{formatCurrency(invoice.dueAmount)}</span>
                  </div>
                )}
              </div>

              {/* Authorized Signature */}
              <div className="pt-4 text-right flex flex-col items-end">
                <div className="h-14 flex items-end justify-center">
                  {merchant.signatureUrl ? (
                    <img src={merchant.signatureUrl} alt="Signature" className="max-h-12 max-w-[150px] object-contain" />
                  ) : merchant.signatureText ? (
                    <span className="font-serif italic font-bold text-base text-slate-800">
                      {merchant.signatureText}
                    </span>
                  ) : (
                    <div className="text-xs text-slate-400 italic">Authorized Signatory</div>
                  )}
                </div>
                <div className="w-48 border-t border-slate-400 pt-1 text-center">
                  <div className="text-xs font-bold text-slate-800">For {merchant.businessName}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Authorized Signatory</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE 2: Clean Modern Minimalist */}
      {template === 'clean-minimal' && (
        <div className="space-y-6">
          <div className="flex justify-between items-start border-b border-slate-900 pb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Bill of Supply (Non-GST)</div>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-1">{merchant.businessName}</h1>
              <p className="text-xs text-slate-600 mt-1">{merchant.address}</p>
              <p className="text-xs text-slate-600">Mobile: {merchant.mobile}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono font-bold text-slate-900">#{invoice.invoiceNumber}</div>
              <div className="text-xs text-slate-600 mt-1">Date: {invoice.date}</div>
              <div className="mt-2">
                <span className="px-2.5 py-0.5 rounded border border-slate-900 text-xs font-bold uppercase">
                  {invoice.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="font-bold uppercase tracking-wider text-slate-400 mb-1">Customer</div>
              <div className="font-bold text-sm text-slate-900">{invoice.customerName}</div>
              {invoice.customerMobile && <div>{invoice.customerMobile}</div>}
              {invoice.customerAddress && <div className="text-slate-500 mt-0.5">{invoice.customerAddress}</div>}
            </div>
            <div className="text-right">
              <div className="font-bold uppercase tracking-wider text-slate-400 mb-1">Payment Detail</div>
              <div>Mode: <span className="font-bold">{invoice.paymentMode || 'Cash'}</span></div>
              {invoice.dueAmount > 0 ? (
                <div className="text-rose-600 font-bold mt-1">Due: {formatCurrency(invoice.dueAmount)}</div>
              ) : (
                <div className="text-emerald-600 font-bold mt-1">Fully Settled</div>
              )}
            </div>
          </div>

          {/* Minimalist Items */}
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900 font-bold">
                <th className="py-2.5">Item</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Rate</th>
                <th className="py-2.5 text-right">Disc</th>
                <th className="py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-2.5 font-medium">{item.name}</td>
                  <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                  <td className="py-2.5 text-right font-mono">{formatCurrency(item.rate)}</td>
                  <td className="py-2.5 text-right font-mono text-slate-500">
                    {item.discount > 0 ? `-${item.discount}` : '0'}
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Minimal Totals */}
          <div className="flex justify-between items-end border-t-2 border-slate-900 pt-4">
            <div className="text-xs text-slate-600 max-w-xs space-y-1">
              <div className="font-bold text-slate-800 italic">{invoice.amountInWords}</div>
              {invoice.notes && <div>Note: {invoice.notes}</div>}
            </div>
            <div className="w-64 space-y-1 text-xs text-right">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.totalDiscount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Discount:</span>
                  <span className="font-mono">-{formatCurrency(invoice.totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1 border-t border-slate-300">
                <span>Total:</span>
                <span className="font-mono">{formatCurrency(invoice.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Paid:</span>
                <span className="font-mono font-bold">{formatCurrency(invoice.paidAmount)}</span>
              </div>
              {invoice.dueAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Due:</span>
                  <span className="font-mono">{formatCurrency(invoice.dueAmount)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE 3 & 4 (Retail Slip / Corporate) */}
      {(template === 'retail-slip' || template === 'corporate') && (
        <div className="space-y-6">
          <div className="text-center border-b pb-4">
            <div className="text-[11px] font-bold tracking-widest text-amber-600 uppercase">
              {template === 'corporate' ? 'CORPORATE NON-GST INVOICE' : 'RETAIL BILL OF SUPPLY'}
            </div>
            <h1 className="text-2xl font-black text-[#0B1A30] mt-1">{merchant.businessName}</h1>
            <p className="text-xs text-slate-600">{merchant.address} • Tel: {merchant.mobile}</p>
          </div>

          <div className="flex justify-between text-xs bg-slate-100 p-3 rounded-lg">
            <div>
              <div>Bill No: <b className="font-mono">{invoice.invoiceNumber}</b></div>
              <div>Customer: <b>{invoice.customerName}</b> ({invoice.customerMobile || 'N/A'})</div>
            </div>
            <div className="text-right">
              <div>Date: <b>{invoice.date}</b></div>
              <div>Status: <b className="uppercase">{invoice.paymentStatus}</b></div>
            </div>
          </div>

          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="p-2.5 text-left">Description</th>
                <th className="p-2.5 text-center">Qty</th>
                <th className="p-2.5 text-right">Rate</th>
                <th className="p-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-2.5 font-medium">{item.name}</td>
                  <td className="p-2.5 text-center font-mono">{item.quantity}</td>
                  <td className="p-2.5 text-right font-mono">{formatCurrency(item.rate)}</td>
                  <td className="p-2.5 text-right font-mono font-bold">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-start pt-2 border-t">
            <div className="text-xs text-slate-600 space-y-1">
              <div><b>In Words:</b> {invoice.amountInWords}</div>
              {invoice.notes && <div><b>Note:</b> {invoice.notes}</div>}
            </div>
            <div className="text-right space-y-1 text-xs min-w-[180px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <b>{formatCurrency(invoice.subtotal)}</b>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t">
                <span>Grand Total:</span>
                <span>{formatCurrency(invoice.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Paid:</span>
                <b>{formatCurrency(invoice.paidAmount)}</b>
              </div>
              {invoice.dueAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(invoice.dueAmount)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding Notice */}
      <div className="pt-8 border-t border-slate-100 text-center text-[10px] text-slate-400 no-print flex items-center justify-center gap-2">
        <span>Generated with MTCC BillPro • Smart Simple Professional Billing</span>
      </div>
    </div>
  );
};
