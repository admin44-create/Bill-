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
