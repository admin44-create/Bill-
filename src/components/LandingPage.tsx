import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Printer, 
  Share2, 
  Sparkles, 
  Lock, 
  HelpCircle, 
  PhoneCall, 
  Mail, 
  MessageSquare, 
  ChevronDown, 
  FileText, 
  Check, 
  Play,
  IndianRupee,
  Layers,
  Smartphone,
  MapPin,
  Clock,
  Phone
} from 'lucide-react';
import { WebsiteConfig } from '../types';
import { MtccLogo } from './MtccLogo';

interface LandingPageProps {
  websiteConfig: WebsiteConfig;
  onRegisterClick: () => void;
  onLoginClick: () => void;
  onDemoBillClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  websiteConfig,
  onRegisterClick,
  onLoginClick,
  onDemoBillClick,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const regFee = websiteConfig.registrationFee || 19;
  const banner = websiteConfig.bannerText || `🔥 Merchant Registration – Only ₹${regFee} One-Time`;

  const faqs = [
    {
      q: 'What makes MTCC BillPro strictly for Non-GST billing?',
      a: 'MTCC BillPro is custom-crafted specifically for small retailers, service centers, tutors, freelancers, traders, and contractors whose annual turnover is exempt from GST registration. There are NO confusing GSTIN, CGST, SGST, IGST, or HSN tax calculations. It generates clean, legal "Bill of Supply" and retail cash memos effortlessly.',
    },
    {
      q: `Is ₹${regFee} really a one-time fee with no monthly charges?`,
      a: `Yes, 100%! You pay ₹${regFee} once during merchant registration, and your merchant account is activated for lifetime usage. There are NO monthly fees, NO annual renewal fees, and NO per-invoice charges.`,
    },
    {
      q: 'Can I print on standard thermal POS printers (58mm and 80mm)?',
      a: 'Absolutely. MTCC BillPro features dedicated printer layout engines for standard 58mm and 80mm thermal receipt roll printers, as well as full-page A4 and half-page A5 desktop printers.',
    },
    {
      q: 'How does the 1-click WhatsApp sharing work?',
      a: 'With one click, MTCC BillPro formats your bill into an elegant, formatted WhatsApp message containing your business name, bill number, item breakdown, total, and balance due, plus your UPI ID so customers can pay directly.',
    },
    {
      q: 'Is my merchant business data isolated from other merchants?',
      a: 'Yes, every merchant account has dedicated data isolation. Invoices, customers, and business settings belonging to your merchant ID are strictly private and never exposed to other merchants.',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-6 pb-12 overflow-hidden text-center px-4">
        {/* Background glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-amber-500/40 shadow-lg shadow-amber-500/10">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-300">
              {banner}
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Create Professional Bills <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                in Seconds
              </span>
            </h1>

            <p className="text-xl sm:text-2xl font-bold text-slate-300 max-w-2xl mx-auto">
              ₹{regFee} One-Time Merchant Registration • No Monthly Charge
            </p>

            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              Tailor-made for non-GST retailers, repair centers, freelancers, and service providers. A4, A5, 58mm & 80mm thermal receipts, instant WhatsApp sharing, and client ledger.
            </p>
          </div>

          {/* 3 Key Value Props */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm font-bold text-slate-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" /> One-Time Payment
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" /> No Monthly Charge
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" /> No Per-Invoice Charge
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              type="button"
              onClick={onRegisterClick}
              className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-base shadow-2xl shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Register for ₹{regFee}</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>

            <button
              type="button"
              onClick={onLoginClick}
              className="w-full sm:w-auto py-4 px-7 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Merchant Login</span>
            </button>

            <button
              type="button"
              onClick={onDemoBillClick}
              className="w-full sm:w-auto py-4 px-7 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 font-bold text-sm border border-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-amber-400" />
              <span>Create Demo Bill</span>
            </button>
          </div>
        </div>

        {/* Floating Preview Card Mockup */}
        <div className="max-w-4xl mx-auto mt-12 bg-slate-900 border border-amber-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-black/80 relative text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-400 font-mono ml-2">MTCC BillPro Live Preview</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                Non-GST Bill of Supply
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-slate-500 uppercase font-bold text-[10px]">Merchant</div>
              <div className="font-extrabold text-white text-sm">Sharma Electronics & Services</div>
              <div className="text-slate-400 text-[11px]">Pune, Maharashtra • +91 98765 43210</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-slate-500 uppercase font-bold text-[10px]">Customer</div>
              <div className="font-extrabold text-white text-sm">Amitabh Sen</div>
              <div className="text-slate-400 text-[11px]">Bill #BILL-101 • Paid via UPI</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 flex flex-col justify-between">
              <div>
                <div className="text-slate-500 uppercase font-bold text-[10px]">Amount</div>
                <div className="font-mono font-extrabold text-amber-400 text-lg">₹4,800.00</div>
              </div>
              <div className="text-[10px] text-emerald-400 font-bold">✓ 100% Tax-Free Non-GST Format</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-black uppercase tracking-widest text-amber-400">Engineered For Indian Retail & Services</h2>
          <p className="text-3xl font-black text-white">Everything You Need for Fast Non-GST Billing</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-amber-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">100% Non-GST Focused</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No complex GSTIN inputs, tax splits, or HSN codes. Clean legal retail bills of supply tailored for small businesses.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-amber-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Thermal (58mm/80mm) & A4/A5</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Print directly on Bluetooth/USB POS thermal printers (58mm, 80mm) or full-sheet laser printers in A4 and A5 sizes.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-amber-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">1-Click WhatsApp Sharing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Send instant professional invoice summaries with payment balances and UPI links directly to your customer's WhatsApp.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-amber-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Indian Currency In Words</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Auto-converts amounts into Indian words (Rupees, Lakhs, Crores, Paise) instantly to avoid handwritten calculation errors.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-amber-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Payment & Due Tracking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Easily track Paid, Partial, and Unpaid bills. Keep a ledger of customer balances and send payment reminders.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-amber-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Isolated Data & Offline Backup</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Each merchant has strictly isolated data. Download full JSON encrypted backups at any time for complete peace of mind.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-black uppercase tracking-widest text-amber-400">3 Simple Steps</h2>
          <p className="text-3xl font-black text-white">How MTCC BillPro Works</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center mx-auto text-sm">
              1
            </div>
            <h3 className="font-bold text-white text-base">Register for ₹{regFee}</h3>
            <p className="text-xs text-slate-400">
              Pay ₹{regFee} once via UPI, Card, or NetBanking to activate your lifetime merchant ID immediately.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center mx-auto text-sm">
              2
            </div>
            <h3 className="font-bold text-white text-base">Setup Your Store</h3>
            <p className="text-xs text-slate-400">
              Add your store name, logo, phone number, UPI ID, and customized signature in seconds.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center mx-auto text-sm">
              3
            </div>
            <h3 className="font-bold text-white text-base">Issue Unlimited Bills</h3>
            <p className="text-xs text-slate-400">
              Generate non-GST bills, print receipts on thermal or A4 printers, and share directly to WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-slate-900 via-[#0C1A30] to-slate-900 border-2 border-amber-500/50 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
              Unbeatable Transparency
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Lifetime Billing Access for Just <span className="text-amber-400">₹{regFee}</span>
            </h2>
            <p className="text-xs text-slate-300">
              Why pay ₹5,000 to ₹12,000 every year to bloated billing software when you only need fast Non-GST bills?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Traditional Software</div>
              <div className="text-2xl font-bold text-slate-400 line-through">₹4,999 / year</div>
              <ul className="space-y-2 text-xs text-slate-400 pt-2">
                <li className="flex items-center gap-2">❌ Monthly renewal hassles</li>
                <li className="flex items-center gap-2">❌ Forced complicated GST filings</li>
                <li className="flex items-center gap-2">❌ High charges per thermal invoice</li>
              </ul>
            </div>

            <div className="bg-amber-500/10 rounded-2xl p-6 border border-amber-500/40 space-y-3">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">{websiteConfig.siteName || 'MTCC BillPro'} Lifetime</div>
              <div className="text-3xl font-black text-white flex items-baseline gap-1">
                <span>₹{regFee}</span>
                <span className="text-xs font-normal text-slate-400">ONE-TIME</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200 pt-2">
                <li className="flex items-center gap-2 font-semibold">✅ One-Time Lifetime Payment</li>
                <li className="flex items-center gap-2 font-semibold">✅ No Monthly or Annual Fee</li>
                <li className="flex items-center gap-2 font-semibold">✅ Unlimited A4, A5, 58mm, 80mm Bills</li>
                <li className="flex items-center gap-2 font-semibold">✅ 1-Click WhatsApp Sharing</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={onRegisterClick}
              className="py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm shadow-xl hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>Activate Merchant Account for ₹{regFee}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-black uppercase tracking-widest text-amber-400">Questions & Answers</h2>
          <p className="text-3xl font-black text-white">Frequently Asked Questions</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-amber-300"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Support */}
      <section className="max-w-3xl mx-auto px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <h3 className="text-xl font-black text-white">Need Help or Have Questions?</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Our merchant support team is ready to assist you with onboarding, thermal printer pairing, and custom bill formats.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            {websiteConfig.supportEmail && (
              <a
                href={`mailto:${websiteConfig.supportEmail}`}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <Mail className="w-4 h-4 text-amber-400" />
                <span>{websiteConfig.supportEmail}</span>
              </a>
            )}

            {websiteConfig.supportPhone && (
              <a
                href={`tel:${websiteConfig.supportPhone.replace(/\s+/g, '')}`}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>{websiteConfig.supportPhone} {websiteConfig.supportHours ? `(${websiteConfig.supportHours})` : ''}</span>
              </a>
            )}

            {websiteConfig.whatsappNumber && (
              <a
                href={`https://wa.me/${websiteConfig.whatsappNumber.replace(/\D/g, '')}?text=Hello%20MTCC%20BillPro%20Support`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 flex items-center gap-2 border border-emerald-500/30 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp: {websiteConfig.whatsappNumber}</span>
              </a>
            )}
          </div>

          {websiteConfig.officeAddress && (
            <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{websiteConfig.officeAddress}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
