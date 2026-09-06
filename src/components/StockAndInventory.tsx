import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Edit3, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Clock, 
  Boxes, 
  Layers, 
  X, 
  Save, 
  PlusCircle, 
  RefreshCw,
  FileText,
  IndianRupee,
  Calendar,
  Building2,
  ChevronRight
} from 'lucide-react';
import { 
  Merchant, 
  Invoice, 
  Purchase, 
  PurchaseItem, 
  StockItem, 
  StockSummaryRecord, 
  PaymentStatus, 
  PaymentMode 
} from '../types';
import { 
  getMerchantPurchases, 
  saveMerchantPurchase, 
  deleteMerchantPurchase, 
  getMerchantStockItems, 
  saveMerchantStockItem, 
  deleteMerchantStockItem, 
  computeMerchantStockSummary 
} from '../utils/storage';
import { formatCurrency } from '../utils/numberToWords';

interface StockAndInventoryProps {
  merchant: Merchant;
  invoices: Invoice[];
  onCreateBillWithItem?: (itemName: string, rate: number) => void;
  onRefreshData?: () => void;
}

export const StockAndInventory: React.FC<StockAndInventoryProps> = ({
  merchant,
  invoices,
  onCreateBillWithItem,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'purchases' | 'sales'>('stock');

  // Local Data State
  const [stockRecords, setStockRecords] = useState<StockSummaryRecord[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [catalogItems, setCatalogItems] = useState<StockItem[]>([]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Modals State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);

  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [adjustingRecord, setAdjustingRecord] = useState<StockSummaryRecord | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Physical stock verification');

  // Load all data
  const loadData = () => {
    const summary = computeMerchantStockSummary(merchant.id);
    const purs = getMerchantPurchases(merchant.id);
    const catalog = getMerchantStockItems(merchant.id);
    setStockRecords(summary);
    setPurchases(purs);
    setCatalogItems(catalog);
  };

  useEffect(() => {
    loadData();
  }, [merchant.id, invoices]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    stockRecords.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set);
  }, [stockRecords]);

  // Metrics
  const totalStockValuation = useMemo(() => {
    return stockRecords.reduce((sum, r) => sum + r.stockValue, 0);
  }, [stockRecords]);

  const lowStockCount = useMemo(() => {
    return stockRecords.filter((r) => r.status === 'LOW_STOCK').length;
  }, [stockRecords]);

  const outOfStockCount = useMemo(() => {
    return stockRecords.filter((r) => r.status === 'OUT_OF_STOCK').length;
  }, [stockRecords]);

  const totalPurchasesAmount = useMemo(() => {
    return purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  }, [purchases]);

  const totalPurchasesDue = useMemo(() => {
    return purchases.reduce((sum, p) => sum + (p.dueAmount || 0), 0);
  }, [purchases]);

  const totalSalesRevenue = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  }, [invoices]);

  // Filtered Stock Records
  const filteredStock = useMemo(() => {
    return stockRecords.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === 'ALL' || r.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [stockRecords, searchTerm, categoryFilter, statusFilter]);

  // --- ITEM FORM STATE ---
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemUnit, setItemUnit] = useState('Pcs');
  const [itemOpeningStock, setItemOpeningStock] = useState<number>(0);
  const [itemMinAlert, setItemMinAlert] = useState<number>(5);
  const [itemPurchaseRate, setItemPurchaseRate] = useState<number>(0);
  const [itemSellingRate, setItemSellingRate] = useState<number>(0);
  const [itemLocation, setItemLocation] = useState('');
  const [itemNotes, setItemNotes] = useState('');

  const openAddItemModal = (itemToEdit?: StockItem) => {
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setItemName(itemToEdit.name);
      setItemCategory(itemToEdit.category);
      setItemUnit(itemToEdit.unit || 'Pcs');
      setItemOpeningStock(itemToEdit.openingStock || 0);
      setItemMinAlert(itemToEdit.minStockAlert || 5);
      setItemPurchaseRate(itemToEdit.purchaseRate || 0);
      setItemSellingRate(itemToEdit.sellingRate || 0);
      setItemLocation(itemToEdit.locationOrRack || '');
      setItemNotes(itemToEdit.notes || '');
    } else {
      setEditingItem(null);
      setItemName('');
      setItemCategory('General');
      setItemUnit('Pcs');
      setItemOpeningStock(0);
      setItemMinAlert(5);
      setItemPurchaseRate(0);
      setItemSellingRate(0);
      setItemLocation('');
      setItemNotes('');
    }
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      alert('Please enter a product or item name.');
      return;
    }

    const newItem: StockItem = {
      id: editingItem ? editingItem.id : `STK-${Date.now()}`,
      merchantId: merchant.id,
      name: itemName.trim(),
      category: itemCategory.trim() || 'General',
      unit: itemUnit.trim() || 'Pcs',
      openingStock: Number(itemOpeningStock) || 0,
      minStockAlert: Number(itemMinAlert) || 5,
      purchaseRate: Number(itemPurchaseRate) || 0,
      sellingRate: Number(itemSellingRate) || 0,
      locationOrRack: itemLocation.trim(),
      notes: itemNotes.trim(),
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveMerchantStockItem(merchant.id, newItem);
    loadData();
    setIsItemModalOpen(false);
    if (onRefreshData) onRefreshData();
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from stock catalog?`)) {
      deleteMerchantStockItem(merchant.id, id);
      loadData();
      if (onRefreshData) onRefreshData();
    }
  };

  // --- ADJUST STOCK QUICK MODAL ---
  const handleOpenAdjust = (rec: StockSummaryRecord) => {
    setAdjustingRecord(rec);
    setAdjustQty(0);
    setAdjustReason('Physical stock audit');
    setIsAdjustStockModalOpen(true);
  };

  const handleSaveStockAdjustment = () => {
    if (!adjustingRecord) return;
    const diff = Number(adjustQty);
    if (diff === 0) {
      setIsAdjustStockModalOpen(false);
      return;
    }

    // Find master item or create one to store new opening stock
    const existingMaster = catalogItems.find(
      (c) => c.name.trim().toLowerCase() === adjustingRecord.name.trim().toLowerCase()
    );

    if (existingMaster) {
      const updated: StockItem = {
        ...existingMaster,
        openingStock: (existingMaster.openingStock || 0) + diff,
        notes: `Adjustment (${diff > 0 ? '+' : ''}${diff} ${existingMaster.unit}): ${adjustReason}`,
        updatedAt: new Date().toISOString(),
      };
      saveMerchantStockItem(merchant.id, updated);
    } else {
      const newItem: StockItem = {
        id: `STK-${Date.now()}`,
        merchantId: merchant.id,
        name: adjustingRecord.name,
        category: adjustingRecord.category,
        unit: adjustingRecord.unit,
        openingStock: (adjustingRecord.openingStock || 0) + diff,
        minStockAlert: adjustingRecord.minStockAlert,
        purchaseRate: adjustingRecord.purchaseRate,
        sellingRate: adjustingRecord.sellingRate,
        notes: `Initial stock balance audit (${diff > 0 ? '+' : ''}${diff}): ${adjustReason}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveMerchantStockItem(merchant.id, newItem);
    }

    loadData();
    setIsAdjustStockModalOpen(false);
    if (onRefreshData) onRefreshData();
  };

  // --- PURCHASE FORM STATE ---
  const [purNumber, setPurNumber] = useState('');
  const [purSupplierName, setPurSupplierName] = useState('');
  const [purSupplierMobile, setPurSupplierMobile] = useState('');
  const [purSupplierAddress, setPurSupplierAddress] = useState('');
  const [purDate, setPurDate] = useState(new Date().toISOString().split('T')[0]);
  const [purItems, setPurItems] = useState<PurchaseItem[]>([
    {
      id: '1',
      name: '',
      category: 'General',
      quantity: 1,
      unit: 'Pcs',
      purchaseRate: 0,
      total: 0,
      suggestedSellingRate: 0,
    },
  ]);
  const [purPaymentStatus, setPurPaymentStatus] = useState<PaymentStatus>('PAID');
  const [purPaidAmount, setPurPaidAmount] = useState<number>(0);
  const [purPaymentMode, setPurPaymentMode] = useState<PaymentMode>('BANK_TRANSFER');
  const [purNotes, setPurNotes] = useState('');

  const openNewPurchaseModal = () => {
    setPurNumber(`PUR-${Date.now().toString().slice(-5)}`);
    setPurSupplierName('');
    setPurSupplierMobile('');
    setPurSupplierAddress('');
    setPurDate(new Date().toISOString().split('T')[0]);
    setPurItems([
      {
        id: '1',
        name: '',
        category: 'General',
        quantity: 5,
        unit: 'Pcs',
        purchaseRate: 100,
        total: 500,
        suggestedSellingRate: 150,
      },
    ]);
    setPurPaymentStatus('PAID');
    setPurPaidAmount(500);
    setPurPaymentMode('BANK_TRANSFER');
    setPurNotes('');
    setIsPurchaseModalOpen(true);
  };

  const handleAddPurchaseItemRow = () => {
    setPurItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString().slice(2, 5)}`,
        name: '',
        category: 'General',
        quantity: 1,
        unit: 'Pcs',
        purchaseRate: 0,
        total: 0,
        suggestedSellingRate: 0,
      },
    ]);
  };

  const handleUpdatePurchaseItem = (index: number, field: keyof PurchaseItem, value: any) => {
    setPurItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      if (field === 'quantity' || field === 'purchaseRate') {
        item.total = Number(item.quantity || 0) * Number(item.purchaseRate || 0);
      }
      // If user picks name matching catalog item, auto-fill unit & selling rate
      if (field === 'name') {
        const match = catalogItems.find(
          (c) => c.name.trim().toLowerCase() === String(value).trim().toLowerCase()
        );
        if (match) {
          item.unit = match.unit || 'Pcs';
          item.category = match.category || 'General';
          if (match.purchaseRate && (!item.purchaseRate || item.purchaseRate === 0)) {
            item.purchaseRate = match.purchaseRate;
            item.total = Number(item.quantity || 0) * match.purchaseRate;
          }
          if (match.sellingRate) {
            item.suggestedSellingRate = match.sellingRate;
          }
        }
      }
      updated[index] = item;
      return updated;
    });
  };

  const handleRemovePurchaseItem = (index: number) => {
    if (purItems.length <= 1) return;
    setPurItems((prev) => prev.filter((_, i) => i !== index));
  };

  const purchaseTotalCalculated = useMemo(() => {
    return purItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  }, [purItems]);

  useEffect(() => {
    if (purPaymentStatus === 'PAID') {
      setPurPaidAmount(purchaseTotalCalculated);
    } else if (purPaymentStatus === 'UNPAID') {
      setPurPaidAmount(0);
    }
  }, [purchaseTotalCalculated, purPaymentStatus]);

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purSupplierName.trim()) {
      alert('Please enter Supplier or Vendor name.');
      return;
    }
    if (purItems.some((it) => !it.name.trim() || it.quantity <= 0)) {
      alert('Please ensure all items have a valid name and quantity greater than 0.');
      return;
    }

    const total = purchaseTotalCalculated;
    const paid = Math.min(total, Number(purPaidAmount) || 0);
    const due = Math.max(0, total - paid);

    const newPurchase: Purchase = {
      id: `PUR-${Date.now()}`,
      purchaseNumber: purNumber.trim() || `PUR-${Date.now().toString().slice(-6)}`,
      merchantId: merchant.id,
      supplierName: purSupplierName.trim(),
      supplierMobile: purSupplierMobile.trim(),
      supplierAddress: purSupplierAddress.trim(),
      date: purDate,
      time: new Date().toTimeString().slice(0, 5),
      items: purItems,
      totalAmount: total,
      paidAmount: paid,
      dueAmount: due,
      paymentStatus: due === 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID',
      paymentMode: purPaymentMode,
      notes: purNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    saveMerchantPurchase(merchant.id, newPurchase);
    loadData();
    setIsPurchaseModalOpen(false);
    if (onRefreshData) onRefreshData();
  };

  const handleDeletePurchase = (id: string, purNum: string) => {
    if (window.confirm(`Delete purchase record #${purNum}? Stock quantities will adjust accordingly.`)) {
      deleteMerchantPurchase(merchant.id, id);
      loadData();
      if (onRefreshData) onRefreshData();
    }
  };

  // Export Stock CSV
  const handleExportStockCSV = () => {
    const headers = ['Item Name', 'Category', 'Unit', 'Opening Stock', 'Purchased Qty', 'Sold Qty', 'Available Stock', 'Min Alert', 'Purchase Cost', 'Selling Rate', 'Stock Value', 'Status'];
    const rows = stockRecords.map((r) => [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.category.replace(/"/g, '""')}"`,
      `"${r.unit}"`,
      r.openingStock,
      r.totalPurchased,
      r.totalSold,
      r.availableStock,
      r.minStockAlert,
      r.purchaseRate,
      r.sellingRate,
      r.stockValue,
      r.status,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Stock_Summary_${merchant.businessName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Boxes className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">Stock Summary, Sales & Purchases</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete inventory tracking for <span className="text-amber-400 font-bold">{merchant.businessName}</span>. Auto-syncs inward purchases & outward sales bills.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => openAddItemModal()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product Master</span>
          </button>

          <button
            type="button"
            onClick={openNewPurchaseModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 active:scale-95 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
            <span>+ Record Purchase</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Stock Valuation */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Stock Value</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {formatCurrency(totalStockValuation)}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
              Across {stockRecords.length} catalog products
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Low / Reorder Alerts</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {lowStockCount + outOfStockCount} <span className="text-xs text-slate-400 font-normal">items</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              {outOfStockCount} Out of Stock • {lowStockCount} Running Low
            </div>
          </div>
        </div>

        {/* Total Purchases Recorded */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Purchases</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {formatCurrency(totalPurchasesAmount)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              {purchases.length} supplier bills {totalPurchasesDue > 0 ? `• ₹${totalPurchasesDue.toLocaleString('en-IN')} Due` : '• Fully Paid'}
            </div>
          </div>
        </div>

        {/* Total Sales Outwards */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Sales (Bills)</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {formatCurrency(totalSalesRevenue)}
            </div>
            <div className="text-[11px] text-purple-400 font-medium mt-0.5">
              {invoices.length} invoices generated
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'stock'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Stock Summary ({stockRecords.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('purchases')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'purchases'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Purchases Inwards ({purchases.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'sales'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Sales Outwards ({invoices.length})</span>
        </button>
      </div>

      {/* TAB 1: STOCK SUMMARY */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          
          {/* Filters and Search Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search product name or category..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="ALL">All Stock Statuses</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock Alert (&lt; min)</option>
                <option value="OUT_OF_STOCK">Out of Stock (0 or negative)</option>
              </select>

              {/* Export CSV */}
              <button
                type="button"
                onClick={handleExportStockCSV}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Download Stock CSV"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={loadData}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Refresh Inventory"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stock Summary Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Product Name & Category</th>
                    <th className="p-3.5 text-center">Unit</th>
                    <th className="p-3.5 text-center">Opening</th>
                    <th className="p-3.5 text-center text-blue-400">Purchased (+)</th>
                    <th className="p-3.5 text-center text-purple-400">Sold (-)</th>
                    <th className="p-3.5 text-center">Available Stock</th>
                    <th className="p-3.5 text-right">Cost Price</th>
                    <th className="p-3.5 text-right">Selling Price</th>
                    <th className="p-3.5 text-right">Stock Valuation</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredStock.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-500">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <div>No stock records match your filters.</div>
                        <button
                          type="button"
                          onClick={() => openAddItemModal()}
                          className="mt-3 text-xs text-amber-400 font-bold hover:underline"
                        >
                          + Add a product to your catalog
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredStock.map((item) => {
                      const isLow = item.status === 'LOW_STOCK';
                      const isOut = item.status === 'OUT_OF_STOCK';

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-white text-sm">{item.name}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                {item.category}
                              </span>
                              {item.minStockAlert > 0 && (
                                <span className="text-[10px] text-slate-500">
                                  Min Alert: {item.minStockAlert} {item.unit}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5 text-center font-mono text-slate-400">
                            {item.unit}
                          </td>

                          <td className="p-3.5 text-center font-mono text-slate-300">
                            {item.openingStock}
                          </td>

                          <td className="p-3.5 text-center font-mono text-blue-400 font-medium">
                            +{item.totalPurchased}
                          </td>

                          <td className="p-3.5 text-center font-mono text-purple-400 font-medium">
                            -{item.totalSold}
                          </td>

                          <td className="p-3.5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 font-mono font-black text-sm px-2.5 py-1 rounded-lg border ${
                                isOut
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                  : isLow
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              }`}
                            >
                              {item.availableStock}
                              {isOut && <span className="text-[9px] uppercase font-bold">Out</span>}
                              {isLow && <span className="text-[9px] uppercase font-bold">Low</span>}
                            </span>
                          </td>

                          <td className="p-3.5 text-right font-mono text-slate-300">
                            {formatCurrency(item.purchaseRate)}
                          </td>

                          <td className="p-3.5 text-right font-mono font-bold text-white">
                            {formatCurrency(item.sellingRate)}
                          </td>

                          <td className="p-3.5 text-right font-mono font-extrabold text-emerald-400">
                            {formatCurrency(item.stockValue)}
                          </td>

                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Quick stock adjustment */}
                              <button
                                type="button"
                                onClick={() => handleOpenAdjust(item)}
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-semibold transition-colors cursor-pointer"
                                title="Adjust Stock / Physical count"
                              >
                                Adjust
                              </button>

                              {/* Create bill for this item */}
                              {onCreateBillWithItem && (
                                <button
                                  type="button"
                                  onClick={() => onCreateBillWithItem(item.name, item.sellingRate)}
                                  className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-bold border border-amber-500/20 transition-colors cursor-pointer"
                                  title="Create Bill with this Item"
                                >
                                  Bill
                                </button>
                              )}

                              {/* Edit item master if exists in catalog */}
                              <button
                                type="button"
                                onClick={() => {
                                  const master = catalogItems.find((c) => c.name === item.name);
                                  openAddItemModal(master || {
                                    id: item.id,
                                    merchantId: merchant.id,
                                    name: item.name,
                                    category: item.category,
                                    unit: item.unit,
                                    openingStock: item.openingStock,
                                    minStockAlert: item.minStockAlert,
                                    purchaseRate: item.purchaseRate,
                                    sellingRate: item.sellingRate,
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                  });
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title="Edit Product Info"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom summary bar */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <div>
                Showing <b className="text-white">{filteredStock.length}</b> of <b className="text-white">{stockRecords.length}</b> total products in inventory
              </div>
              <div className="flex items-center gap-4">
                <span>Total Units In Stock: <b className="text-white font-mono">{filteredStock.reduce((s, r) => s + Math.max(0, r.availableStock), 0)}</b></span>
                <span>Valuation: <b className="text-emerald-400 font-mono">{formatCurrency(filteredStock.reduce((s, r) => s + r.stockValue, 0))}</b></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PURCHASES */}
      {activeTab === 'purchases' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-sm">Purchase Ledger & Supplier Bills</h3>
              <p className="text-xs text-slate-400">Track all incoming stock, cost prices, and supplier payments</p>
            </div>

            <button
              type="button"
              onClick={openNewPurchaseModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer hover:brightness-110"
            >
              <Plus className="w-4 h-4" />
              <span>+ Record New Purchase</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Bill / Voucher #</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Supplier / Vendor</th>
                    <th className="p-3.5">Items Purchased</th>
                    <th className="p-3.5 text-right">Total Amount</th>
                    <th className="p-3.5 text-right">Paid</th>
                    <th className="p-3.5 text-right">Due</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <div>No purchase entries recorded yet.</div>
                        <button
                          type="button"
                          onClick={openNewPurchaseModal}
                          className="mt-2 text-xs text-amber-400 font-bold hover:underline"
                        >
                          + Record your first purchase
                        </button>
                      </td>
                    </tr>
                  ) : (
                    purchases.map((pur) => (
                      <tr key={pur.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-amber-400">
                          {pur.purchaseNumber}
                        </td>

                        <td className="p-3.5 text-slate-300">
                          {pur.date}
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-white">{pur.supplierName}</div>
                          {pur.supplierMobile && (
                            <div className="text-[11px] text-slate-400 font-mono">{pur.supplierMobile}</div>
                          )}
                        </td>

                        <td className="p-3.5 text-slate-300 max-w-xs truncate">
                          {pur.items.map((it) => `${it.name} (${it.quantity} ${it.unit || 'Pcs'})`).join(', ')}
                        </td>

                        <td className="p-3.5 text-right font-mono font-bold text-white">
                          {formatCurrency(pur.totalAmount)}
                        </td>

                        <td className="p-3.5 text-right font-mono text-emerald-400 font-medium">
                          {formatCurrency(pur.paidAmount)}
                        </td>

                        <td className="p-3.5 text-right font-mono font-bold text-rose-400">
                          {pur.dueAmount > 0 ? formatCurrency(pur.dueAmount) : '₹0'}
                        </td>

                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              pur.paymentStatus === 'PAID'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : pur.paymentStatus === 'PARTIAL'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {pur.paymentStatus}
                          </span>
                        </td>

                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setViewingPurchase(pur)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePurchase(pur.id, pur.purchaseNumber)}
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Delete Purchase"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SALES */}
      {activeTab === 'sales' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-sm">Sales Outwards Ledger (Generated Bills)</h3>
              <p className="text-xs text-slate-400">
                Live customer sales ledger automatically synchronized with MTCC BillPro invoices
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Sales Revenue:</span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                {formatCurrency(totalSalesRevenue)}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Invoice #</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Customer Name</th>
                    <th className="p-3.5">Products Sold</th>
                    <th className="p-3.5 text-right">Bill Total</th>
                    <th className="p-3.5 text-right">Paid</th>
                    <th className="p-3.5 text-right">Due</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <div>No sales invoices created yet.</div>
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-amber-400">
                          {inv.invoiceNumber}
                        </td>
                        <td className="p-3.5 text-slate-300 font-mono">
                          {inv.date}
                        </td>
                        <td className="p-3.5 font-bold text-white">
                          {inv.customerName}
                          {inv.customerMobile && (
                            <span className="block text-[11px] text-slate-400 font-normal">{inv.customerMobile}</span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-300 max-w-xs truncate">
                          {inv.items.map((it) => `${it.name} (x${it.quantity})`).join(', ')}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-white">
                          {formatCurrency(inv.grandTotal)}
                        </td>
                        <td className="p-3.5 text-right font-mono text-emerald-400 font-medium">
                          {formatCurrency(inv.paidAmount)}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-rose-400">
                          {inv.dueAmount > 0 ? formatCurrency(inv.dueAmount) : '₹0'}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              inv.paymentStatus === 'PAID'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : inv.paymentStatus === 'PARTIAL'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {inv.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 1: ADD / EDIT PRODUCT MASTER --- */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <span>{editingItem ? 'Edit Product in Catalog' : 'Add New Product to Catalog'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Product / Item Name *</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Wireless Mouse or 65W Fast Charger"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category</label>
                  <input
                    type="text"
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    placeholder="e.g. Electronics, Mobile, Spares"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Unit of Measurement</label>
                  <select
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Pcs">Pcs (Pieces)</option>
                    <option value="Box">Box</option>
                    <option value="Kg">Kg (Kilogram)</option>
                    <option value="Gm">Gm (Gram)</option>
                    <option value="Ltr">Ltr (Litre)</option>
                    <option value="Mtr">Mtr (Meter)</option>
                    <option value="Pkt">Pkt (Packet)</option>
                    <option value="Set">Set</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Opening Stock Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={itemOpeningStock}
                    onChange={(e) => setItemOpeningStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Low Stock Alert Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={itemMinAlert}
                    onChange={(e) => setItemMinAlert(parseInt(e.target.value) || 5)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={itemPurchaseRate}
                    onChange={(e) => setItemPurchaseRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Selling Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={itemSellingRate}
                    onChange={(e) => setItemSellingRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Rack / Storage Location (Optional)</label>
                <input
                  type="text"
                  value={itemLocation}
                  onChange={(e) => setItemLocation(e.target.value)}
                  placeholder="e.g. Rack A-3, Shelf 2"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-800">
                {editingItem ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(editingItem.id, editingItem.name)}
                    className="text-rose-400 hover:text-rose-300 text-xs font-semibold cursor-pointer"
                  >
                    Delete Item
                  </button>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsItemModalOpen(false)}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold hover:brightness-110 cursor-pointer shadow-lg"
                  >
                    Save Product
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: RECORD NEW PURCHASE --- */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Record Inward Stock / Purchase Entry</h3>
                  <p className="text-[11px] text-slate-400">Incoming inventory increases your available stock automatically</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPurchaseModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              
              {/* Supplier & Bill Header */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Supplier / Vendor Name *</label>
                  <input
                    type="text"
                    required
                    value={purSupplierName}
                    onChange={(e) => setPurSupplierName(e.target.value)}
                    placeholder="e.g. National Wholesale Agency"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Supplier Mobile / Phone</label>
                  <input
                    type="text"
                    value={purSupplierMobile}
                    onChange={(e) => setPurSupplierMobile(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Purchase Invoice / Bill #</label>
                  <input
                    type="text"
                    value={purNumber}
                    onChange={(e) => setPurNumber(e.target.value)}
                    placeholder="e.g. WH-4892"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={purDate}
                    onChange={(e) => setPurDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-300 font-semibold block mb-1">Supplier Address (Optional)</label>
                  <input
                    type="text"
                    value={purSupplierAddress}
                    onChange={(e) => setPurSupplierAddress(e.target.value)}
                    placeholder="Wholesale Market, City"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                    Purchased Items & Rates
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddPurchaseItemRow}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item Row</span>
                  </button>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                        <th className="p-2.5">Item Name</th>
                        <th className="p-2.5 w-24">Qty</th>
                        <th className="p-2.5 w-24">Unit</th>
                        <th className="p-2.5 w-28 text-right">Cost Rate (₹)</th>
                        <th className="p-2.5 w-28 text-right">Total (₹)</th>
                        <th className="p-2.5 w-28 text-right">Selling Rate</th>
                        <th className="p-2.5 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                      {purItems.map((pItem, idx) => (
                        <tr key={pItem.id}>
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              value={pItem.name}
                              onChange={(e) => handleUpdatePurchaseItem(idx, 'name', e.target.value)}
                              placeholder="Type item name..."
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500 text-xs font-medium"
                            />
                          </td>

                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={pItem.quantity}
                              onChange={(e) => handleUpdatePurchaseItem(idx, 'quantity', parseFloat(e.target.value) || 1)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-center focus:outline-none focus:border-amber-500"
                            />
                          </td>

                          <td className="p-2">
                            <select
                              value={pItem.unit || 'Pcs'}
                              onChange={(e) => handleUpdatePurchaseItem(idx, 'unit', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                            >
                              <option value="Pcs">Pcs</option>
                              <option value="Box">Box</option>
                              <option value="Kg">Kg</option>
                              <option value="Ltr">Ltr</option>
                              <option value="Mtr">Mtr</option>
                              <option value="Pkt">Pkt</option>
                              <option value="Set">Set</option>
                            </select>
                          </td>

                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={pItem.purchaseRate}
                              onChange={(e) => handleUpdatePurchaseItem(idx, 'purchaseRate', parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-right focus:outline-none focus:border-amber-500"
                            />
                          </td>

                          <td className="p-2 text-right font-mono font-bold text-white">
                            {formatCurrency(pItem.total)}
                          </td>

                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={pItem.suggestedSellingRate || 0}
                              onChange={(e) => handleUpdatePurchaseItem(idx, 'suggestedSellingRate', parseFloat(e.target.value) || 0)}
                              placeholder="Sale Rate"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-right focus:outline-none focus:border-amber-500 text-[11px]"
                            />
                          </td>

                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemovePurchaseItem(idx)}
                              disabled={purItems.length <= 1}
                              className="text-slate-500 hover:text-rose-400 disabled:opacity-20 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div>
                  <div className="text-slate-400 text-xs">Total Purchase Cost:</div>
                  <div className="text-xl font-black text-white font-mono mt-0.5">
                    {formatCurrency(purchaseTotalCalculated)}
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Payment Status</label>
                  <select
                    value={purPaymentStatus}
                    onChange={(e) => setPurPaymentStatus(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="PAID">Fully Paid</option>
                    <option value="PARTIAL">Partial Payment</option>
                    <option value="UNPAID">Unpaid / Credit Due</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={purPaidAmount}
                    onChange={(e) => setPurPaidAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black hover:brightness-110 shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Purchase & Update Stock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: QUICK STOCK ADJUSTMENT --- */}
      {isAdjustStockModalOpen && adjustingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <span>Adjust Stock Quantity</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAdjustStockModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="font-bold text-white">{adjustingRecord.name}</div>
                <div className="text-slate-400 mt-1 flex justify-between">
                  <span>Current Available:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {adjustingRecord.availableStock} {adjustingRecord.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Quantity Difference to Add/Deduct (+ / -)
                </label>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                  placeholder="e.g. +5 or -2"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-base font-bold focus:outline-none focus:border-amber-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  New Available will be: <b>{(adjustingRecord.availableStock + (Number(adjustQty) || 0))} {adjustingRecord.unit}</b>
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Reason for adjustment</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Physical stock verification">Physical stock verification audit</option>
                  <option value="Damaged or expired goods">Damaged or broken stock write-off</option>
                  <option value="Customer return without bill">Customer return without bill</option>
                  <option value="Opening stock balance correction">Opening stock balance correction</option>
                  <option value="Other adjustment">Other</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustStockModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveStockAdjustment}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold hover:brightness-110 cursor-pointer shadow-lg"
                >
                  Apply Adjustment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: VIEW PURCHASE DETAILS --- */}
      {viewingPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Purchase Voucher #{viewingPurchase.purchaseNumber}</h3>
                <span className="text-slate-400 text-[11px]">{viewingPurchase.date}</span>
              </div>
              <button
                type="button"
                onClick={() => setViewingPurchase(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-slate-400">Supplier: <b className="text-white">{viewingPurchase.supplierName}</b></div>
              {viewingPurchase.supplierMobile && (
                <div className="text-slate-400">Contact: <b className="text-white">{viewingPurchase.supplierMobile}</b></div>
              )}
              {viewingPurchase.supplierAddress && (
                <div className="text-slate-400">Address: <span className="text-slate-300">{viewingPurchase.supplierAddress}</span></div>
              )}
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Cost</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {viewingPurchase.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-medium text-white">{it.name}</td>
                      <td className="p-2 text-center font-mono">{it.quantity} {it.unit}</td>
                      <td className="p-2 text-right font-mono">{formatCurrency(it.purchaseRate)}</td>
                      <td className="p-2 text-right font-mono font-bold text-amber-400">{formatCurrency(it.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800 text-right font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Grand Total:</span>
                <span className="font-bold text-white">{formatCurrency(viewingPurchase.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Amount Paid ({viewingPurchase.paymentMode || 'Cash'}):</span>
                <span>{formatCurrency(viewingPurchase.paidAmount)}</span>
              </div>
              {viewingPurchase.dueAmount > 0 && (
                <div className="flex justify-between text-rose-400 font-bold">
                  <span>Balance Due to Supplier:</span>
                  <span>{formatCurrency(viewingPurchase.dueAmount)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingPurchase(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
