import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  QrCode, 
  CreditCard, 
  Building2, 
  Smartphone, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  Copy, 
  Check, 
  ExternalLink,
  Info
} from 'lucide-react';
import { WebsiteConfig } from '../types';
import { MtccLogo } from './MtccLogo';
import { buildUpiUri, generateQrDataUrl } from '../utils/upiQr';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  amount: number;
  businessName: string;
  ownerName: string;
  mobile: string;
  email?: string;
  websiteConfig: WebsiteConfig;
  onSuccess: (paymentDetails: { txnId: string; utrNumber?: string }) => void;
  onCancel: () => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  amount,
  businessName,
  ownerName,
  mobile,
  email,
  websiteConfig,
  onSuccess,
  onCancel,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi_qr' | 'upi_id' | 'card' | 'netbanking'>('upi_qr');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [utrInput, setUtrInput] = useState('');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8921');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('•••');
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Dynamic QR state
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [upiUri, setUpiUri] = useState<string>('');

  const adminUpiId = websiteConfig.adminUpiId || 'mtccbillpro@icici';
  const adminPayee = websiteConfig.adminUpiPayeeName || 'MTCC BillPro Payments';
  const regFee = amount || websiteConfig.registrationFee || 99;

  // Build UPI URI and generate scannable QR code
  useEffect(() => {
    const uri = buildUpiUri({
      upiId: adminUpiId,
      payeeName: adminPayee,
      amount: regFee,
      note: `MTCC Reg - ${businessName.slice(0, 15)}`,
    });
    setUpiUri(uri);

    if (websiteConfig.useCustomQr && websiteConfig.adminCustomQrUrl) {
      setQrCodeDataUrl(websiteConfig.adminCustomQrUrl);
    } else {
      generateQrDataUrl(uri).then((url) => {
        setQrCodeDataUrl(url);
      });
    }
  }, [adminUpiId, adminPayee, regFee, businessName, websiteConfig.useCustomQr, websiteConfig.adminCustomQrUrl]);

  if (!isOpen) return null;

  const handlePayNow = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      const generatedTxn = 'PAY_UPI_' + Math.floor(10000000 + Math.random() * 90000000);
      setTxnId(generatedTxn);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#EAB308', '#38BDF8', '#10B981', '#F59E0B'],
        });
      } catch {
        // ignore
      }
    }, 1800);
  };

  const handleFinish = () => {
    onSuccess({ 
      txnId, 
      utrNumber: utrInput.trim() || undefined 
    });
  };

  const copyVPA = () => {
    navigator.clipboard.writeText(adminUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-6">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#0B1A30] via-[#0F284E] to-[#0B1A30] border-b border-amber-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MtccLogo 
              variant="icon-only" 
              size="sm" 
              logoUrl={websiteConfig.logoUrl} 
            />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Official Merchant Activation
              </div>
              <h3 className="text-base font-bold text-white">One-Time Registration Fee</h3>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 line-through">₹999</div>
            <div className="text-2xl font-black text-amber-400">₹{regFee}</div>
          </div>
        </div>

        {!paymentSuccess ? (
          <div className="p-6 space-y-5">
            {/* Value Highlights */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 text-xs text-amber-200 space-y-1">
              <div className="font-bold flex items-center justify-between text-amber-300 text-sm">
                <span>🔥 Lifetime Merchant License – ₹{regFee} Only</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Instant Activation
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] font-medium text-slate-300">
                <span className="flex items-center gap-1">✅ One-Time Only</span>
                <span className="flex items-center gap-1">✅ Zero Renewal Fee</span>
                <span className="flex items-center gap-1">✅ Unlimited Invoices</span>
              </div>
            </div>

            {/* Merchant Details Summary */}
            <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60 text-xs flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Registering Store</div>
                <div className="font-bold text-white text-sm">{businessName}</div>
                <div className="text-slate-300 text-[11px]">{ownerName} • {mobile}</div>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-[10px]">
                NON-GST BILLING
              </div>
            </div>

            {/* Payment Methods Tabs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select Payment Method
                </label>
                <span className="text-[10px] text-amber-400 font-bold">Fastest: UPI QR</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('upi_qr')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedMethod === 'upi_qr'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4 mb-1 text-amber-400" />
                  <span>UPI QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('upi_id')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedMethod === 'upi_id'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mb-1" />
                  <span>UPI VPA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedMethod === 'card'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-1" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('netbanking')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedMethod === 'netbanking'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-1" />
                  <span>NetBank</span>
                </button>
              </div>
            </div>

            {/* Method Content */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4">
              
              {/* OPTION 1: UPI QR CODE (AUTO GENERATED FROM ADMIN UPI ID) */}
              {selectedMethod === 'upi_qr' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* QR Code Container */}
                    <div className="relative bg-white p-2.5 rounded-2xl border-2 border-amber-400 shadow-lg flex-shrink-0 flex items-center justify-center">
                      {qrCodeDataUrl ? (
                        <img 
                          src={qrCodeDataUrl} 
                          alt="Official UPI Payment QR Code" 
                          className="w-32 h-32 object-contain"
                        />
                      ) : (
                        <div className="w-32 h-32 flex items-center justify-center bg-slate-100 rounded-lg">
                          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      
                      {/* Indian Flag / UPI Badge Overlay */}
                      <div className="absolute -bottom-2 bg-slate-900 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500 text-[9px] font-black tracking-wider">
                        BHIM UPI
                      </div>
                    </div>

                    {/* QR Instructions & Direct Action */}
                    <div className="space-y-2 text-xs flex-1 text-center sm:text-left">
                      <div className="font-bold text-white text-sm flex items-center justify-center sm:justify-start gap-1.5">
                        <span>Scan & Pay ₹{regFee}</span>
                        <span className="text-emerald-400 font-normal text-[11px]">(Instant)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Open Google Pay, PhonePe, Paytm, BHIM, or any banking UPI app and scan this QR code.
                      </p>

                      {/* Payee Info */}
                      <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Payee Name:</span>
                          <span className="font-bold text-white">{adminPayee}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">UPI ID:</span>
                          <div className="flex items-center gap-1.5">
                            <code className="text-amber-400 font-mono font-bold">{adminUpiId}</code>
                            <button
                              type="button"
                              onClick={copyVPA}
                              className="text-slate-400 hover:text-white p-1 cursor-pointer transition-colors"
                              title="Copy UPI ID"
                            >
                              {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Mobile One-Click UPI Intent Link */}
                      {upiUri && (
                        <a
                          href={upiUri}
                          className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold border border-amber-500/30 transition-colors"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                          <span>Tap here to Pay via UPI App directly</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* UTR / Transaction Reference Input */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                      <span>UPI Reference / UTR Number (Optional / Recommended)</span>
                      <span className="text-[10px] text-slate-500 font-normal">12-digit UTR from GPay/PhonePe</span>
                    </label>
                    <input
                      type="text"
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value.replace(/\s+/g, ''))}
                      placeholder="e.g. 423891028371 or Txn Reference ID"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* OPTION 2: ENTER CUSTOM UPI ID */}
              {selectedMethod === 'upi_id' && (
                <div className="space-y-3 py-2">
                  <label className="text-xs text-slate-300 block">Enter your Virtual Payment Address (VPA / UPI ID)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      placeholder="e.g. yourname@okaxis or mobile@paytm"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> A collect request of ₹{regFee} will be sent to your UPI app.
                  </div>
                </div>
              )}

              {/* OPTION 3: CARD */}
              {selectedMethod === 'card' && (
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Card Number (Visa / RuPay / Mastercard)</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Valid Thru</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* OPTION 4: NET BANKING */}
              {selectedMethod === 'netbanking' && (
                <div className="space-y-2 py-1">
                  <label className="text-xs text-slate-300 block">Popular Indian NetBanking</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['SBI', 'HDFC', 'ICICI', 'Axis'].map((bank) => (
                      <button
                        type="button"
                        key={bank}
                        onClick={() => setSelectedBank(bank)}
                        className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          selectedBank === bank
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {bank} Bank
                      </button>
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    You will be redirected to {selectedBank} Bank's secure portal for ₹{regFee}.
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePayNow}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying ₹{regFee}...</span>
                  </>
                ) : (
                  <>
                    <span>I Have Paid ₹{regFee} • Activate</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Direct Bank Settled via UPI • 100% money-back guarantee within 7 days</span>
            </div>
          </div>
        ) : (
          /* Payment Success View */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/20 animate-bounce">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                Payment Verified • Merchant Activated
              </div>
              <h2 className="text-2xl font-black text-white">Welcome to {websiteConfig.siteName || 'MTCC BillPro'}!</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your ₹{regFee} one-time registration payment has been verified. Your merchant profile is active with unlimited billing privileges.
              </p>
            </div>

            {/* Receipt Details Card */}
            <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Registered Store</span>
                <span className="font-bold text-white">{businessName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Payment Reference ID</span>
                <span className="font-mono text-amber-400">{utrInput ? `UTR-${utrInput}` : txnId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Amount Paid</span>
                <span className="font-bold text-emerald-400">₹{regFee}.00 (One-Time Lifetime)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Paid To</span>
                <span className="font-mono text-slate-300">{adminUpiId}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Merchant Status</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ACTIVE
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to Merchant Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
