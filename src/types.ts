export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL';
export type MerchantStatus = 'ACTIVE' | 'INACTIVE';
export type PaperSize = 'A4' | 'A5' | '58mm' | '80mm';
export type InvoiceTemplateId = 'navy-gold' | 'clean-minimal' | 'retail-slip' | 'corporate';
export type PaymentMode = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'OTHER';

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  discount: number;
  discountType: 'amount' | 'percent';
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  merchantId: string;
  businessName?: string;
  businessAddress?: string;
  businessMobile?: string;
  businessEmail?: string;
  logoUrl?: string;
  date: string;
  time: string;
  customerId?: string;
  customerName: string;
  customerMobile: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  grandTotal: number;
  amountInWords: string;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  dueAmount: number;
  paymentMode?: PaymentMode;
  notes: string;
  terms: string;
  signatureUrl?: string;
  signatureText?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  hideSignature?: boolean;
  template: InvoiceTemplateId;
  paperSize: PaperSize;
  createdAt: string;
  updatedAt: string;
  isDraft?: boolean;
}

export interface Customer {
  id: string;
  merchantId: string;
  name: string;
  mobile: string;
  address?: string;
  email?: string;
  createdAt: string;
}

export interface Merchant {
  id: string; // e.g. MTCC-M-84920
  businessName: string;
  ownerName: string;
  email: string;
  mobile: string;
  address: string;
  logoUrl?: string;
  signatureUrl?: string;
  signatureText?: string;
  signatoryTitle?: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  defaultNotes: string;
  defaultTerms: string;
  upiId?: string;
  status: MerchantStatus;
  paymentStatus: 'PAID' | 'PENDING';
  registrationDate: string;
  registrationTxnId?: string;
  password?: string;
  template: InvoiceTemplateId;
  paperSize: PaperSize;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  date: string;
  active: boolean;
}

export interface SystemActivity {
  id: string;
  type: 'REGISTRATION' | 'PAYMENT' | 'BILL_GENERATED' | 'MERCHANT_LOGIN';
  description: string;
  merchantId?: string;
  timestamp: string;
  amount?: number;
}

export interface WebsiteConfig {
  siteName: string;
  tagline: string;
  supportPhone: string;
  secondaryPhone?: string;
  whatsappNumber: string;
  supportEmail: string;
  supportHours: string;
  officeAddress: string;
  registrationFee: number;
  logoUrl?: string;
  bannerText?: string;
  // UPI QR & Payment configuration
  adminUpiId?: string;
  adminUpiPayeeName?: string;
  adminCustomQrUrl?: string;
  useCustomQr?: boolean;
  upiPaymentNote?: string;
}

// Purchase and Vendor Management
export interface PurchaseItem {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  unit: string; // Pcs, Box, Kg, Mtr, Ltr, Pkt, etc.
  purchaseRate: number; // Cost Price
  total: number;
  suggestedSellingRate?: number; // Retail Selling Price
}

export interface Purchase {
  id: string; // e.g. PUR-1725...
  purchaseNumber: string; // Supplier invoice or inward voucher no
  merchantId: string;
  supplierName: string;
  supplierMobile?: string;
  supplierAddress?: string;
  date: string;
  time?: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  paymentMode?: PaymentMode;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Inventory & Stock Tracking
export interface StockItem {
  id: string;
  merchantId: string;
  name: string;
  category: string;
  unit: string;
  openingStock: number;
  minStockAlert: number; // Low stock alert threshold
  purchaseRate: number; // Default/Latest Purchase Cost Price
  sellingRate: number;  // Default Selling Price
  locationOrRack?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockSummaryRecord {
  id: string;
  name: string;
  category: string;
  unit: string;
  openingStock: number;
  totalPurchased: number; // Inwards
  totalSold: number;      // Outwards
  availableStock: number; // opening + purchased - sold
  minStockAlert: number;
  purchaseRate: number;
  sellingRate: number;
  stockValue: number;    // availableStock * purchaseRate
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  lastUpdated?: string;
}

