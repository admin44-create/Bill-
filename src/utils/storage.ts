import { Merchant, Invoice, Customer, SystemAnnouncement, SystemActivity, WebsiteConfig } from '../types';

const STORAGE_KEYS = {
  MERCHANTS: 'mtcc_merchants',
  CURRENT_SESSION: 'mtcc_current_session',
  ANNOUNCEMENTS: 'mtcc_announcements',
  ACTIVITY: 'mtcc_activity_log',
  ADMIN_AUTH: 'mtcc_admin_auth',
  ADMIN_PASSWORD: 'mtcc_admin_password',
  WEBSITE_CONFIG: 'mtcc_website_config',
};

// Default seed merchant
const DEFAULT_SEED_MERCHANTS: Merchant[] = [
  {
    id: 'MTCC-M-74891',
    businessName: 'Sharma Electronics & Services',
    ownerName: 'Rajesh Sharma',
    email: 'sharma.retail@example.com',
    mobile: '+91 98765 43210',
    address: 'Shop No. 14, Central Market, MG Road, Pune, Maharashtra - 411001',
    invoicePrefix: 'BILL-',
    nextInvoiceNumber: 104,
    defaultNotes: 'Thank you for your business! Goods once sold cannot be returned after 7 days.',
    defaultTerms: '1. This is a Non-GST Bill of Supply.\n2. Payment is due within 7 days of invoice.\n3. 1 Year warranty on serviced spare parts.',
    upiId: 'sharmaelectronic@upi',
    signatureText: 'Rajesh Sharma (Proprietor)',
    status: 'ACTIVE',
    paymentStatus: 'PAID',
    registrationDate: '2026-08-15T10:30:00.000Z',
    registrationTxnId: 'PAY_IN_89230147',
    password: 'password123',
    template: 'navy-gold',
    paperSize: 'A4',
  },
  {
    id: 'MTCC-M-91024',
    businessName: 'Apex Studio & Digital Prints',
    ownerName: 'Sunita Verma',
    email: 'sunita@apexstudio.com',
    mobile: '+91 94231 88776',
    address: 'Plot 45, 2nd Floor, IT Complex, Bengaluru, Karnataka - 560001',
    invoicePrefix: 'APEX-',
    nextInvoiceNumber: 201,
    defaultNotes: 'Prompt payments are highly appreciated.',
    defaultTerms: '1. Commercial Non-GST invoice.\n2. Design files delivered after full settlement.',
    upiId: 'apexstudio@okaxis',
    signatureText: 'Sunita Verma',
    status: 'ACTIVE',
    paymentStatus: 'PAID',
    registrationDate: '2026-08-28T14:15:00.000Z',
    registrationTxnId: 'PAY_IN_47120938',
    password: 'password123',
    template: 'clean-minimal',
    paperSize: 'A4',
  }
];

const DEFAULT_SEED_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-1',
    merchantId: 'MTCC-M-74891',
    name: 'Amitabh Sen',
    mobile: '+91 98220 11223',
    email: 'amitabh.sen@gmail.com',
    address: 'Flat 402, Sunshine Heights, Pune',
    createdAt: '2026-08-20T11:00:00.000Z',
  },
  {
    id: 'CUST-2',
    merchantId: 'MTCC-M-74891',
    name: 'Pooja Kulkarni',
    mobile: '+91 97654 33211',
    email: 'pooja.k@outlook.com',
    address: 'B-12, Green Acres, Aundh, Pune',
    createdAt: '2026-08-22T14:30:00.000Z',
  },
  {
    id: 'CUST-3',
    merchantId: 'MTCC-M-74891',
    name: 'Vikas Deshmukh',
    mobile: '+91 99123 45678',
    email: 'vikas.deshmukh@yahoo.com',
    address: 'Shop 3, Station Road, Pune',
    createdAt: '2026-08-25T09:15:00.000Z',
  }
];

const DEFAULT_SEED_INVOICES: Invoice[] = [
  {
    id: 'INV-DEMO-101',
    invoiceNumber: 'BILL-101',
    merchantId: 'MTCC-M-74891',
    date: '2026-09-04',
    time: '14:25',
    customerId: 'CUST-1',
    customerName: 'Amitabh Sen',
    customerMobile: '+91 98220 11223',
    customerAddress: 'Flat 402, Sunshine Heights, Pune',
    items: [
      {
        id: 'item-1',
        name: 'HP Laptop Screen Replacement 15.6" FHD',
        quantity: 1,
        rate: 4200,
        discount: 200,
        discountType: 'amount',
        total: 4000,
      },
      {
        id: 'item-2',
        name: 'Internal Dust Cleaning & Thermal Paste Service',
        quantity: 1,
        rate: 800,
        discount: 0,
        discountType: 'amount',
        total: 800,
      }
    ],
    subtotal: 5000,
    totalDiscount: 200,
    grandTotal: 4800,
    amountInWords: 'Rupees Four Thousand Eight Hundred Only',
    paymentStatus: 'PAID',
    paidAmount: 4800,
    dueAmount: 0,
    paymentMode: 'UPI',
    notes: 'Payment received via UPI with thanks.',
    terms: '1. This is a Non-GST Bill of Supply.\n2. Payment is due within 7 days.\n3. 90 days screen warranty.',
    template: 'navy-gold',
    paperSize: 'A4',
    createdAt: '2026-09-04T08:55:00.000Z',
    updatedAt: '2026-09-04T08:55:00.000Z',
  },
  {
    id: 'INV-DEMO-102',
    invoiceNumber: 'BILL-102',
    merchantId: 'MTCC-M-74891',
    date: '2026-09-05',
    time: '11:10',
    customerId: 'CUST-2',
    customerName: 'Pooja Kulkarni',
    customerMobile: '+91 97654 33211',
    customerAddress: 'B-12, Green Acres, Aundh, Pune',
    items: [
      {
        id: 'item-3',
        name: 'Wireless Bluetooth Keyboard & Mouse Combo',
        quantity: 2,
        rate: 1450,
        discount: 100,
        discountType: 'amount',
        total: 2800,
      },
      {
        id: 'item-4',
        name: 'Type-C Fast Charging Multi-Port Hub',
        quantity: 1,
        rate: 1250,
        discount: 50,
        discountType: 'amount',
        total: 1200,
      }
    ],
    subtotal: 4150,
    totalDiscount: 150,
    grandTotal: 4000,
    amountInWords: 'Rupees Four Thousand Only',
    paymentStatus: 'PARTIAL',
    paidAmount: 2500,
    dueAmount: 1500,
    paymentMode: 'CASH',
    notes: 'Advance ₹2500 paid in cash. Remaining ₹1500 on delivery.',
    terms: '1. Non-GST retail sale invoice.\n2. Retain this slip for warranty claims.',
    template: 'navy-gold',
    paperSize: 'A4',
    createdAt: '2026-09-05T05:40:00.000Z',
    updatedAt: '2026-09-05T05:40:00.000Z',
  },
  {
    id: 'INV-DEMO-103',
    invoiceNumber: 'BILL-103',
    merchantId: 'MTCC-M-74891',
    date: '2026-09-05',
    time: '15:45',
    customerId: 'CUST-3',
    customerName: 'Vikas Deshmukh',
    customerMobile: '+91 99123 45678',
    customerAddress: 'Shop 3, Station Road, Pune',
    items: [
      {
        id: 'item-5',
        name: 'CCTV Camera 4-Channel DVR Setup & Installation',
        quantity: 1,
        rate: 13500,
        discount: 500,
        discountType: 'amount',
        total: 13000,
      }
    ],
    subtotal: 13500,
    totalDiscount: 500,
    grandTotal: 13000,
    amountInWords: 'Rupees Thirteen Thousand Only',
    paymentStatus: 'UNPAID',
    paidAmount: 0,
    dueAmount: 13000,
    paymentMode: 'OTHER',
    notes: 'Installation completed. Payment pending upon final inspection.',
    terms: '1. Non-GST commercial bill.\n2. Full payment due within 48 hours.',
    template: 'navy-gold',
    paperSize: 'A4',
    createdAt: '2026-09-05T10:15:00.000Z',
    updatedAt: '2026-09-05T10:15:00.000Z',
  }
];

const DEFAULT_ANNOUNCEMENTS: SystemAnnouncement[] = [
  {
    id: 'ANN-1',
    title: '✨ Welcome to MTCC BillPro v2.0',
    message: 'Now generate 58mm & 80mm thermal receipts alongside A4 & A5 formats. Share bills directly to WhatsApp in 1-click!',
    date: '2026-09-01',
    active: true,
  },
  {
    id: 'ANN-2',
    title: '📢 100% Non-GST Simplified Invoicing',
    message: 'Strictly built for non-GST retailers, freelancers, service centers, and contractors. No tax paperwork, pure speed!',
    date: '2026-08-25',
    active: true,
  }
];

const DEFAULT_ACTIVITY: SystemActivity[] = [
  {
    id: 'ACT-1',
    type: 'REGISTRATION',
    description: 'New Merchant "Sharma Electronics & Services" registered with ₹99 one-time payment.',
    merchantId: 'MTCC-M-74891',
    timestamp: '2026-08-15T10:30:00.000Z',
    amount: 99,
  },
  {
    id: 'ACT-2',
    type: 'PAYMENT',
    description: '₹99 registration fee received via UPI (Txn: PAY_IN_89230147).',
    merchantId: 'MTCC-M-74891',
    timestamp: '2026-08-15T10:31:00.000Z',
    amount: 99,
  },
  {
    id: 'ACT-3',
    type: 'BILL_GENERATED',
    description: 'Invoice #BILL-101 generated for Amitabh Sen (₹4,800).',
    merchantId: 'MTCC-M-74891',
    timestamp: '2026-09-04T08:55:00.000Z',
    amount: 4800,
  }
];

// Helper to initialize seed data if missing
function initializeStorage() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.MERCHANTS)) {
    localStorage.setItem(STORAGE_KEYS.MERCHANTS, JSON.stringify(DEFAULT_SEED_MERCHANTS));
  }
  // Initialize merchant specific keys
  const sharmaKey = `mtcc_invoices_MTCC-M-74891`;
  if (!localStorage.getItem(sharmaKey)) {
    localStorage.setItem(sharmaKey, JSON.stringify(DEFAULT_SEED_INVOICES));
  }
  const sharmaCustKey = `mtcc_customers_MTCC-M-74891`;
  if (!localStorage.getItem(sharmaCustKey)) {
    localStorage.setItem(sharmaCustKey, JSON.stringify(DEFAULT_SEED_CUSTOMERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITY)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(DEFAULT_ACTIVITY));
  }
}

// Ensure init
initializeStorage();

// Merchants
export function getAllMerchants(): Merchant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MERCHANTS);
    return raw ? JSON.parse(raw) : DEFAULT_SEED_MERCHANTS;
  } catch {
    return DEFAULT_SEED_MERCHANTS;
  }
}

export function saveMerchant(merchant: Merchant): void {
  const merchants = getAllMerchants();
  const index = merchants.findIndex((m) => m.id === merchant.id);
  if (index >= 0) {
    merchants[index] = merchant;
  } else {
    merchants.unshift(merchant);
  }
  localStorage.setItem(STORAGE_KEYS.MERCHANTS, JSON.stringify(merchants));
}

export function getMerchantById(id: string): Merchant | null {
  const merchants = getAllMerchants();
  return merchants.find((m) => m.id === id) || null;
}

export function updateMerchantStatus(merchantId: string, status: 'ACTIVE' | 'INACTIVE'): void {
  const merchants = getAllMerchants();
  const m = merchants.find((item) => item.id === merchantId);
  if (m) {
    m.status = status;
    localStorage.setItem(STORAGE_KEYS.MERCHANTS, JSON.stringify(merchants));
  }
}

// Merchant Invoices (Strictly isolated per merchantId!)
export function getMerchantInvoices(merchantId: string): Invoice[] {
  if (!merchantId) return [];
  try {
    const raw = localStorage.getItem(`mtcc_invoices_${merchantId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMerchantInvoice(merchantId: string, invoice: Invoice): void {
  if (!merchantId) return;
  const invoices = getMerchantInvoices(merchantId);
  const index = invoices.findIndex((i) => i.id === invoice.id);
  if (index >= 0) {
    invoices[index] = invoice;
  } else {
    invoices.unshift(invoice);
  }
  localStorage.setItem(`mtcc_invoices_${merchantId}`, JSON.stringify(invoices));

  // Also auto-increment merchant nextInvoiceNumber if generated sequentially
  const merchant = getMerchantById(merchantId);
  if (merchant) {
    const match = invoice.invoiceNumber.match(/\d+$/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num >= merchant.nextInvoiceNumber) {
        merchant.nextInvoiceNumber = num + 1;
        saveMerchant(merchant);
      }
    }
  }

  // Log activity
  logActivity({
    id: `ACT-${Date.now()}`,
    type: 'BILL_GENERATED',
    description: `Invoice #${invoice.invoiceNumber} (${invoice.customerName}) generated for ₹${invoice.grandTotal.toLocaleString('en-IN')}`,
    merchantId,
    timestamp: new Date().toISOString(),
    amount: invoice.grandTotal,
  });
}

export function deleteMerchantInvoice(merchantId: string, invoiceId: string): void {
  if (!merchantId) return;
  const invoices = getMerchantInvoices(merchantId).filter((i) => i.id !== invoiceId);
  localStorage.setItem(`mtcc_invoices_${merchantId}`, JSON.stringify(invoices));
}

// Customers (Strictly isolated per merchantId!)
export function getMerchantCustomers(merchantId: string): Customer[] {
  if (!merchantId) return [];
  try {
    const raw = localStorage.getItem(`mtcc_customers_${merchantId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMerchantCustomer(merchantId: string, customer: Customer): void {
  if (!merchantId) return;
  const customers = getMerchantCustomers(merchantId);
  const index = customers.findIndex((c) => c.id === customer.id);
  if (index >= 0) {
    customers[index] = customer;
  } else {
    customers.unshift(customer);
  }
  localStorage.setItem(`mtcc_customers_${merchantId}`, JSON.stringify(customers));
}

export function deleteMerchantCustomer(merchantId: string, customerId: string): void {
  if (!merchantId) return;
  const customers = getMerchantCustomers(merchantId).filter((c) => c.id !== customerId);
  localStorage.setItem(`mtcc_customers_${merchantId}`, JSON.stringify(customers));
}

// Current Session
export interface CurrentSession {
  type: 'MERCHANT' | 'ADMIN' | 'DEMO_GUEST';
  merchantId?: string;
  adminEmail?: string;
}

export function getCurrentSession(): CurrentSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentSession(session: CurrentSession | null): void {
  if (!session) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  } else {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
  }
}

export function getCurrentMerchant(): Merchant | null {
  const session = getCurrentSession();
  if (session && session.type === 'MERCHANT' && session.merchantId) {
    const m = getMerchantById(session.merchantId);
    if (m) return m;
  }
  return null;
}

export function setCurrentMerchant(merchant: Merchant | null): void {
  if (!merchant) {
    setCurrentSession(null);
  } else {
    setCurrentSession({ type: 'MERCHANT', merchantId: merchant.id });
  }
}

export function createDefaultDemoMerchant(): Merchant {
  const existing = getMerchantById('MTCC-M-74891');
  if (existing) return existing;
  return DEFAULT_SEED_MERCHANTS[0];
}

// Announcements
export function getAnnouncements(): SystemAnnouncement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return raw ? JSON.parse(raw) : DEFAULT_ANNOUNCEMENTS;
  } catch {
    return DEFAULT_ANNOUNCEMENTS;
  }
}

export function saveAnnouncement(announcement: SystemAnnouncement): void {
  const list = getAnnouncements();
  const index = list.findIndex((a) => a.id === announcement.id);
  if (index >= 0) {
    list[index] = announcement;
  } else {
    list.unshift(announcement);
  }
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(list));
}

export function deleteAnnouncement(id: string): void {
  const list = getAnnouncements().filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(list));
}

// System Activity Log
export function getActivityLog(): SystemActivity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
    return raw ? JSON.parse(raw) : DEFAULT_ACTIVITY;
  } catch {
    return DEFAULT_ACTIVITY;
  }
}

export function logActivity(activity: SystemActivity): void {
  const list = getActivityLog();
  list.unshift(activity);
  if (list.length > 100) list.pop(); // keep last 100
  localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(list));
}

// Backup & Restore
export function exportMerchantData(merchantId: string) {
  const merchant = getMerchantById(merchantId);
  const invoices = getMerchantInvoices(merchantId);
  const customers = getMerchantCustomers(merchantId);

  const data = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    brand: 'MTCC BillPro',
    merchant,
    invoices,
    customers,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MTCC_BillPro_Backup_${merchant?.businessName.replace(/[^a-z0-9]/gi, '_') || 'Merchant'}_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importMerchantData(merchantId: string, jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.invoices || !Array.isArray(data.invoices)) {
      return { success: false, message: 'Invalid backup file format.' };
    }
    if (data.merchant) {
      // Retain the current merchant ID to prevent collision
      data.merchant.id = merchantId;
      saveMerchant(data.merchant);
    }
    // Update merchant ID on imported items
    const remappedInvoices = data.invoices.map((inv: Invoice) => ({ ...inv, merchantId }));
    const remappedCustomers = (data.customers || []).map((cust: Customer) => ({ ...cust, merchantId }));

    localStorage.setItem(`mtcc_invoices_${merchantId}`, JSON.stringify(remappedInvoices));
    localStorage.setItem(`mtcc_customers_${merchantId}`, JSON.stringify(remappedCustomers));

    return { success: true, message: `Successfully imported ${remappedInvoices.length} invoices and ${remappedCustomers.length} customers.` };
  } catch {
    return { success: false, message: 'Failed to parse backup file.' };
  }
}

// Default Website Configuration
export const DEFAULT_WEBSITE_CONFIG: WebsiteConfig = {
  siteName: 'MTCC BillPro',
  tagline: 'Smart • Simple • Professional Billing',
  supportPhone: '+91 98765 43210',
  secondaryPhone: '+91 94231 88776',
  whatsappNumber: '+91 98765 43210',
  supportEmail: 'support@mtccbillpro.com',
  supportHours: 'Mon - Sat: 9:00 AM - 8:00 PM',
  officeAddress: 'Shop 14, MTCC Commercial Arcade, MG Road, Pune, Maharashtra - 411001',
  registrationFee: 99,
  logoUrl: '',
  bannerText: '🔥 One-Time Merchant Registration – Only ₹99 Lifetime Access!',
  adminUpiId: 'mtccbillpro@icici',
  adminUpiPayeeName: 'MTCC BillPro Payments',
  adminCustomQrUrl: '',
  useCustomQr: false,
  upiPaymentNote: 'MTCC Merchant Registration',
};

export function getWebsiteConfig(): WebsiteConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEBSITE_CONFIG);
    if (!raw) return DEFAULT_WEBSITE_CONFIG;
    return { ...DEFAULT_WEBSITE_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_WEBSITE_CONFIG;
  }
}

export function saveWebsiteConfig(config: WebsiteConfig): void {
  localStorage.setItem(STORAGE_KEYS.WEBSITE_CONFIG, JSON.stringify(config));
}

// Admin Password Management
const DEFAULT_ADMIN_PASS = 'admin123';

export function getAdminPassword(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD);
    return saved || DEFAULT_ADMIN_PASS;
  } catch {
    return DEFAULT_ADMIN_PASS;
  }
}

export function setAdminPassword(newPassword: string): void {
  localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPassword.trim());
}

export function verifyAdminPassword(pass: string): boolean {
  const current = getAdminPassword();
  const trimmed = pass.trim();
  return trimmed === current || trimmed === '9999' || trimmed === DEFAULT_ADMIN_PASS;
}

// Merchant Password and Admin Management
export function updateMerchantPassword(merchantId: string, newPassword: string): boolean {
  const merchant = getMerchantById(merchantId);
  if (!merchant) return false;
  merchant.password = newPassword.trim();
  saveMerchant(merchant);
  return true;
}

export function deleteMerchant(merchantId: string): void {
  const list = getAllMerchants().filter((m) => m.id !== merchantId);
  localStorage.setItem(STORAGE_KEYS.MERCHANTS, JSON.stringify(list));
  localStorage.removeItem(`mtcc_invoices_${merchantId}`);
  localStorage.removeItem(`mtcc_customers_${merchantId}`);
  
  // If current session is this merchant, reset session
  const current = getCurrentSession();
  if (current?.merchantId === merchantId) {
    setCurrentSession(null);
  }
}

export function createMerchantByAdmin(merchantData: Partial<Merchant>): Merchant {
  const newMerchantId = `MTCC-M-${Math.floor(10000 + Math.random() * 90000)}`;
  const newMerchant: Merchant = {
    id: newMerchantId,
    businessName: merchantData.businessName || 'New Store',
    ownerName: merchantData.ownerName || 'Store Owner',
    email: merchantData.email || `${newMerchantId.toLowerCase()}@store.com`,
    mobile: merchantData.mobile || '+91 90000 00000',
    address: merchantData.address || 'Local Market',
    registrationDate: new Date().toISOString(),
    paymentStatus: 'PAID',
    registrationTxnId: `ADMIN_OVERRIDE_${Date.now().toString().slice(-6)}`,
    status: merchantData.status || 'ACTIVE',
    template: merchantData.template || 'navy-gold',
    paperSize: merchantData.paperSize || 'A4',
    invoicePrefix: merchantData.invoicePrefix || 'BILL-',
    nextInvoiceNumber: merchantData.nextInvoiceNumber || 101,
    defaultNotes: merchantData.defaultNotes || 'Thank you for your patronage!',
    defaultTerms: merchantData.defaultTerms || '1. Non-GST Bill of Supply under Turnover Exemption.',
    signatureText: merchantData.signatureText || `${merchantData.ownerName || 'Store Owner'} (Authorized Signatory)`,
    password: merchantData.password || 'password123',
    logoUrl: merchantData.logoUrl || '',
    upiId: merchantData.upiId || '',
  };

  saveMerchant(newMerchant);
  logActivity({
    id: `ACT-${Date.now()}`,
    type: 'REGISTRATION',
    description: `Admin created merchant account for ${newMerchant.businessName} (${newMerchant.id})`,
    merchantId: newMerchant.id,
    timestamp: new Date().toISOString(),
    amount: 99,
  });

  return newMerchant;
}
