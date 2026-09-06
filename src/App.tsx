import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Plus, 
  Users, 
  Settings, 
  LayoutDashboard, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X, 
  Sparkles,
  Phone,
  HelpCircle,
  Play,
  ArrowRight,
  ExternalLink,
  Package
} from 'lucide-react';
import { 
  Merchant, 
  Invoice, 
  Customer, 
  SystemAnnouncement,
  WebsiteConfig 
} from './types';
import { 
  getCurrentMerchant, 
  setCurrentMerchant, 
  getMerchantInvoices, 
  getMerchantCustomers, 
  getAnnouncements, 
  saveMerchant, 
  saveMerchantInvoice,
  createDefaultDemoMerchant,
  getWebsiteConfig
} from './utils/storage';
import { MtccLogo } from './components/MtccLogo';
import { LandingPage } from './components/LandingPage';
import { MerchantDashboard } from './components/MerchantDashboard';
import { BillGenerator } from './components/BillGenerator';
import { InvoicesList } from './components/InvoicesList';
import { CustomerManagement } from './components/CustomerManagement';
import { StockAndInventory } from './components/StockAndInventory';
import { BusinessSettings } from './components/BusinessSettings';
import { AdminPanel } from './components/AdminPanel';
import { MerchantAuthModal } from './components/MerchantAuthModal';
import { PaymentGatewayModal } from './components/PaymentGatewayModal';
import { InvoiceModal } from './components/InvoiceModal';

export default function App() {
  // Current active merchant or null (if viewing landing page / logged out)
  const [currentMerchant, setActiveMerchantState] = useState<Merchant | null>(null);

  // Global Website Configuration
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig>(getWebsiteConfig());
  
  // Navigation View: 'landing' | 'dashboard' | 'create-bill' | 'invoices' | 'customers' | 'settings' | 'admin'
  const [currentView, setCurrentView] = useState<string>('landing');
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [duplicateInvoice, setDuplicateInvoice] = useState<Invoice | null>(null);

  // In-memory synced data for current merchant
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'admin'>('register');
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingRegistrationData, setPendingRegistrationData] = useState<{
    businessName: string;
    ownerName: string;
    email: string;
    mobile: string;
    address: string;
    password?: string;
  } | null>(null);

  // Invoice view / print modal
  const [modalInvoice, setModalInvoice] = useState<Invoice | null>(null);
  
  // Mobile nav drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load initial merchant
  useEffect(() => {
    const existing = getCurrentMerchant();
    if (existing) {
      setActiveMerchantState(existing);
      setCurrentView('dashboard');
      loadMerchantData(existing.id);
    } else {
      // Setup demo merchant in storage if first time
      const demo = createDefaultDemoMerchant();
      // default landing page
      setCurrentView('landing');
      setAnnouncements(getAnnouncements());
    }
  }, []);

  const loadMerchantData = (merchantId: string) => {
    setInvoices(getMerchantInvoices(merchantId));
    setCustomers(getMerchantCustomers(merchantId));
    setAnnouncements(getAnnouncements());
  };

  const handleRefresh = () => {
    if (currentMerchant) {
      loadMerchantData(currentMerchant.id);
    }
  };

  // Login handler
  const handleLoginSuccess = (merchant: Merchant) => {
    setCurrentMerchant(merchant);
    setActiveMerchantState(merchant);
    setCurrentView('dashboard');
    loadMerchantData(merchant.id);
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentMerchant(null);
    setActiveMerchantState(null);
    setCurrentView('landing');
  };

  // Registration -> Payment Flow
  const handleProceedToPayment = (regData: typeof pendingRegistrationData) => {
    setPendingRegistrationData(regData);
    setIsAuthModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (txnId: string, utrNumber?: string) => {
    if (!pendingRegistrationData) return;

    const newMerchantId = `MTCC-M-${Math.floor(10000 + Math.random() * 90000)}`;
    const effectiveTxnId = utrNumber ? `UTR-${utrNumber}` : txnId;
    const newMerchant: Merchant = {
      id: newMerchantId,
      businessName: pendingRegistrationData.businessName,
      ownerName: pendingRegistrationData.ownerName,
      email: pendingRegistrationData.email,
      mobile: pendingRegistrationData.mobile,
      address: pendingRegistrationData.address,
      registrationDate: new Date().toISOString(),
      paymentStatus: 'PAID',
      registrationTxnId: effectiveTxnId,
      status: 'ACTIVE',
      template: 'navy-gold',
      paperSize: 'A4',
      invoicePrefix: 'BILL-',
      nextInvoiceNumber: 101,
      defaultNotes: 'Thank you for your patronage! Visit us again soon.',
      defaultTerms: '1. This is a Non-GST Bill of Supply under Turnover Exemption.\n2. Goods once sold will be exchanged within 7 days against original receipt.\n3. Subject to local jurisdiction.',
      signatureText: `${pendingRegistrationData.ownerName} (Authorized Signatory)`,
      password: pendingRegistrationData.password || 'password123',
    };

    saveMerchant(newMerchant);
    setCurrentMerchant(newMerchant);
    setActiveMerchantState(newMerchant);
    setIsPaymentModalOpen(false);
    setPendingRegistrationData(null);
    setCurrentView('dashboard');
    loadMerchantData(newMerchant.id);
  };

  // Demo Bill action (from landing page)
  const handleDemoBillClick = () => {
    if (currentMerchant) {
      setEditingInvoice(null);
      setDuplicateInvoice(null);
      setCurrentView('create-bill');
    } else {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0A1628]/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div 
            onClick={() => {
              if (currentMerchant) {
                setCurrentView('dashboard');
              } else {
                setCurrentView('landing');
              }
            }}
            className="cursor-pointer flex-shrink-0"
          >
            <MtccLogo 
              size="md" 
              logoUrl={websiteConfig.logoUrl} 
              siteName={websiteConfig.siteName} 
              tagline={websiteConfig.tagline} 
            />
          </div>

          {/* Center Navigation Links (When Logged In) */}
          {currentMerchant && currentView !== 'admin' && (
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <button
                type="button"
                onClick={() => { setCurrentView('dashboard'); setEditingInvoice(null); setDuplicateInvoice(null); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'dashboard'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => { setCurrentView('create-bill'); setEditingInvoice(null); setDuplicateInvoice(null); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'create-bill'
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                }`}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create Bill</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('invoices')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'invoices'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Invoices ({invoices.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('customers')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'customers'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Customers</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('stock')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'stock'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Stock & Purchases</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('settings')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'settings'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </nav>
          )}

          {/* Right Action Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {currentMerchant ? (
              <>
                {/* Active Store Badge */}
                <div className="hidden xl:flex items-center gap-2 bg-slate-900 border border-slate-800 py-1.5 px-3 rounded-xl text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-white max-w-[150px] truncate">{currentMerchant.businessName}</span>
                  <span className="text-[10px] text-amber-400 font-mono">₹{websiteConfig.registrationFee || 19} Verified</span>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentView('admin')}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 text-xs font-semibold transition-colors"
                  title="Super Admin Portal"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('admin');
                    setIsAuthModalOpen(true);
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors px-2 py-1"
                >
                  Admin Portal
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Merchant Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Register for ₹{websiteConfig.registrationFee || 99}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0A1628] border-b border-slate-800 p-4 space-y-3">
            {currentMerchant ? (
              <>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 mb-2">
                  <div className="font-bold text-white text-sm">{currentMerchant.businessName}</div>
                  <div className="text-xs text-amber-400 font-mono">ID: {currentMerchant.id}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }}
                    className="p-2.5 rounded-xl bg-slate-900 text-xs font-bold text-slate-200 text-left flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-amber-400" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setCurrentView('create-bill'); setEditingInvoice(null); setDuplicateInvoice(null); setMobileMenuOpen(false); }}
                    className="p-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black text-left flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Create Bill</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setCurrentView('invoices'); setMobileMenuOpen(false); }}
                    className="p-2.5 rounded-xl bg-slate-900 text-xs font-bold text-slate-200 text-left flex items-center gap-2"
                  >
                    <Receipt className="w-4 h-4 text-blue-400" />
                    <span>Invoices</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setCurrentView('customers'); setMobileMenuOpen(false); }}
                    className="p-2.5 rounded-xl bg-slate-900 text-xs font-bold text-slate-200 text-left flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>Customers</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setCurrentView('stock'); setMobileMenuOpen(false); }}
                    className="p-2.5 rounded-xl bg-slate-900 text-xs font-bold text-slate-200 text-left flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-amber-400" />
                    <span>Stock & Purchases</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setCurrentView('settings'); setMobileMenuOpen(false); }}
                    className="p-2.5 rounded-xl bg-slate-900 text-xs font-bold text-slate-200 text-left flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setCurrentView('admin'); setMobileMenuOpen(false); }}
                    className="p-2.5 rounded-xl bg-slate-900 text-xs font-bold text-amber-300 text-left flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20 text-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('register');
                    setIsAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs text-center"
                >
                  🔥 Register for ₹99 (One-Time)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('login');
                    setIsAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-slate-200 text-xs font-bold border border-slate-700 text-center"
                >
                  Merchant Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDemoBillClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-amber-400 text-xs font-bold border border-amber-500/30 text-center flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-amber-400" />
                  <span>Create Demo Bill</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* VIEW 1: LANDING PAGE */}
        {currentView === 'landing' && (
          <LandingPage
            websiteConfig={websiteConfig}
            onRegisterClick={() => {
              setAuthModalTab('register');
              setIsAuthModalOpen(true);
            }}
            onLoginClick={() => {
              setAuthModalTab('login');
              setIsAuthModalOpen(true);
            }}
            onDemoBillClick={handleDemoBillClick}
          />
        )}

        {/* VIEW 2: MERCHANT DASHBOARD */}
        {currentView === 'dashboard' && currentMerchant && (
          <MerchantDashboard
            merchant={currentMerchant}
            invoices={invoices}
            customers={customers}
            announcements={announcements}
            onCreateBill={() => {
              setEditingInvoice(null);
              setDuplicateInvoice(null);
              setCurrentView('create-bill');
            }}
            onViewInvoice={(inv) => setModalInvoice(inv)}
            onNavigateTab={(tab) => setCurrentView(tab)}
          />
        )}

        {/* VIEW 3: BILL GENERATOR */}
        {currentView === 'create-bill' && currentMerchant && (
          <BillGenerator
            merchant={currentMerchant}
            existingInvoice={editingInvoice || undefined}
            duplicateFrom={duplicateInvoice || undefined}
            onUpdateMerchant={(updated) => {
              setActiveMerchantState(updated);
              handleRefresh();
            }}
            onSavedInvoice={(savedInv) => {
              handleRefresh();
              setModalInvoice(savedInv);
              setCurrentView('dashboard');
            }}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {/* VIEW 4: INVOICES LEDGER */}
        {currentView === 'invoices' && currentMerchant && (
          <InvoicesList
            merchant={currentMerchant}
            invoices={invoices}
            onViewInvoice={(inv) => setModalInvoice(inv)}
            onDuplicateInvoice={(inv) => {
              setDuplicateInvoice(inv);
              setEditingInvoice(null);
              setCurrentView('create-bill');
            }}
            onEditInvoice={(inv) => {
              setEditingInvoice(inv);
              setDuplicateInvoice(null);
              setCurrentView('create-bill');
            }}
            onCreateBill={() => {
              setEditingInvoice(null);
              setDuplicateInvoice(null);
              setCurrentView('create-bill');
            }}
            onRefresh={handleRefresh}
          />
        )}

        {/* VIEW 5: CUSTOMER MANAGEMENT */}
        {currentView === 'customers' && currentMerchant && (
          <CustomerManagement
            merchant={currentMerchant}
            customers={customers}
            invoices={invoices}
            onViewInvoice={(inv) => setModalInvoice(inv)}
            onRefresh={handleRefresh}
          />
        )}

        {/* VIEW: STOCK, PURCHASES & SALES SUMMARY */}
        {currentView === 'stock' && currentMerchant && (
          <StockAndInventory
            merchant={currentMerchant}
            invoices={invoices}
            onCreateBill={() => {
              setEditingInvoice(null);
              setDuplicateInvoice(null);
              setCurrentView('create-bill');
            }}
          />
        )}

        {/* VIEW 6: BUSINESS SETTINGS */}
        {currentView === 'settings' && currentMerchant && (
          <BusinessSettings
            merchant={currentMerchant}
            onUpdateMerchant={(updated) => {
              setActiveMerchantState(updated);
              handleRefresh();
            }}
            onRefresh={handleRefresh}
          />
        )}

        {/* VIEW 7: ADMIN PANEL */}
        {currentView === 'admin' && (
          <AdminPanel
            websiteConfig={websiteConfig}
            onUpdateWebsiteConfig={(cfg) => {
              setWebsiteConfig(cfg);
            }}
            onSelectMerchantToInspect={(merchant) => {
              setCurrentMerchant(merchant);
              setActiveMerchantState(merchant);
              loadMerchantData(merchant.id);
              setCurrentView('dashboard');
            }}
            onExitAdmin={() => {
              if (currentMerchant) {
                setCurrentView('dashboard');
              } else {
                setCurrentView('landing');
              }
            }}
            onViewInvoice={(invoice, merchant) => {
              setCurrentMerchant(merchant);
              setActiveMerchantState(merchant);
              setModalInvoice(invoice);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#070F1C] border-t border-slate-900 py-8 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MtccLogo 
              variant="compact" 
              size="sm" 
              logoUrl={websiteConfig.logoUrl} 
              siteName={websiteConfig.siteName} 
            />
            <span>• Non-GST Billing Platform for India</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-400">
            <span>₹{websiteConfig.registrationFee || 99} One-Time Activation</span>
            <span>A4 / A5 / 58mm / 80mm Print Engine</span>
            <span>WhatsApp 1-Click Sharing</span>
            <span>Local Isolated Storage</span>
          </div>

          <div className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} {websiteConfig.siteName || 'MTCC BillPro'}. All rights reserved.
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Auth Modal (Register / Login / Admin) */}
      <MerchantAuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onProceedToPayment={handleProceedToPayment}
        onLoginSuccess={handleLoginSuccess}
        onAdminLoginSuccess={() => {
          setCurrentView('admin');
        }}
      />

      {/* 2. Payment Gateway Modal (₹99 One-Time) */}
      {pendingRegistrationData && (
        <PaymentGatewayModal
          isOpen={isPaymentModalOpen}
          amount={websiteConfig.registrationFee || 99}
          businessName={pendingRegistrationData.businessName}
          ownerName={pendingRegistrationData.ownerName}
          mobile={pendingRegistrationData.mobile}
          email={pendingRegistrationData.email}
          websiteConfig={websiteConfig}
          onSuccess={({ txnId, utrNumber }) => handlePaymentSuccess(txnId, utrNumber)}
          onCancel={() => {
            setIsPaymentModalOpen(false);
            setPendingRegistrationData(null);
          }}
        />
      )}

      {/* 3. Invoice View / Print / WhatsApp Share Modal */}
      {modalInvoice && currentMerchant && (
        <InvoiceModal
          isOpen={!!modalInvoice}
          invoice={modalInvoice}
          merchant={currentMerchant}
          onClose={() => setModalInvoice(null)}
        />
      )}
    </div>
  );
}
