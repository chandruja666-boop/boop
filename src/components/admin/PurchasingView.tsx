import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { cloudApi } from '../../services/cloudApi';
import { Product, PurchaseEntry } from '../../types';
import {
  Lock,
  Boxes,
  PlusCircle,
  History,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  FileSpreadsheet,
  LogOut,
  Clock,
  ShieldAlert,
  UserCheck,
  User,
  Users,
  FileText,
  Truck,
  CheckCircle,
  AlertTriangle,
  Search,
  ChevronRight,
  ClipboardList
} from 'lucide-react';

// Extended Interfaces for complete PO systems
interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  orderDate: string;
  deliveryDate: string;
  status: 'Draft' | 'Sent' | 'Completed' | 'Cancelled';
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitCost: number;
  }[];
  totalAmount: number;
  notes?: string;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  specialty: string;
  gstin: string;
  bankDetails: string;
  paymentTerms: string;
}

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup_1',
    name: 'Royal Jodhpur Artisans Co.',
    contactPerson: 'Chandra Shekhar Singh',
    phone: '+91 98290 12345',
    email: 'procure@jodhpurartisans.com',
    address: 'Artisan Enclave, Industrial Area, Jodhpur, Rajasthan',
    specialty: 'Handcarved Grade-A Teakwood & Sheesham Frames',
    gstin: '08AAAAA1111A1Z1',
    bankDetails: 'State Bank of India - Acct: 33882200112 - IFSC: SBIN0000101',
    paymentTerms: 'Net 30 Days'
  },
  {
    id: 'sup_2',
    name: 'Jaipur Gold Premium Loom',
    contactPerson: 'Meera Devi',
    phone: '+91 141 276543',
    email: 'wholesale@jaipurloom.com',
    address: 'Textile Park, Sanganer, Jaipur, Rajasthan',
    specialty: 'Pure Velvet, Brocade & Premium Organic Linen Upholstery',
    gstin: '08BBBBB2222B2Z2',
    bankDetails: 'HDFC Bank - Acct: 502000112233 - IFSC: HDFC0000011',
    paymentTerms: 'Net 15 Days'
  },
  {
    id: 'sup_3',
    name: 'Deccan Royal Metallics',
    contactPerson: 'Arjun Rao',
    phone: '+91 40 234567',
    email: 'info@deccanroyal.in',
    address: 'Gachibowli High-Tech Metal Park, Hyderabad',
    specialty: 'Electroplated Solid Brass Accents & 24K Gold Plated Legs',
    gstin: '36CCCCC3333C3Z3',
    bankDetails: 'ICICI Bank - Acct: 000401552233 - IFSC: ICIC0000004',
    paymentTerms: '50% Advance, 50% On Delivery'
  }
];

export const PurchasingView: React.FC = () => {
  const { setCurrentView, showToast } = useApp();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  // Active navigation tab
  const [activeSubTab, setActiveSubTab] = useState<'grn' | 'po' | 'suppliers' | 'inventory'>('grn');

  // Core datasets (synchronized with storage and localStorage)
  const [products, setProducts] = useState<Product[]>([]);
  const [purchaseEntries, setPurchaseEntries] = useState<PurchaseEntry[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // --- FORM STATES ---
  // 1. General Goods Receipt Note (GRN) Inward form states
  const [selectedProductId, setSelectedProductId] = useState('');
  const [inwardQuantity, setInwardQuantity] = useState(5);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().substring(0, 10));
  const [unitCost, setUnitCost] = useState<number>(0);

  // 2. PO Form States
  const [poSupplier, setPoSupplier] = useState('');
  const [poDeliveryDate, setPoDeliveryDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)); // 14 days later
  const [poItems, setPoItems] = useState<{ productId: string; quantity: number; unitCost: number }[]>([
    { productId: '', quantity: 1, unitCost: 0 }
  ]);
  const [poNotes, setPoNotes] = useState('');

  // 3. Supplier Form States
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supSpecialty, setSupSpecialty] = useState('');
  const [supGstin, setSupGstin] = useState('');
  const [supBankDetails, setSupBankDetails] = useState('');
  const [supPaymentTerms, setSupPaymentTerms] = useState('Net 30 Days');

  // --- ADVANCED FILTER STATES ---
  const [filterPoNumber, setFilterPoNumber] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterProductId, setFilterProductId] = useState('');

  // Synchronize on authentication
  useEffect(() => {
    if (isAuthenticated) {
      setProducts(storage.getProducts());
      setPurchaseEntries(storage.getPurchaseEntries());

      // Load Suppliers from localstorage or use fallback
      const savedSups = localStorage.getItem('cpf_procure_suppliers_v1');
      if (savedSups) {
        setSuppliers(JSON.parse(savedSups));
      } else {
        setSuppliers(INITIAL_SUPPLIERS);
        localStorage.setItem('cpf_procure_suppliers_v1', JSON.stringify(INITIAL_SUPPLIERS));
      }

      // Load Purchase Orders
      const savedPOs = localStorage.getItem('cpf_purchase_orders_v1');
      if (savedPOs) {
        setPurchaseOrders(JSON.parse(savedPOs));
      } else {
        setPurchaseOrders([]);
      }
    }
  }, [isAuthenticated]);

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const creds = storage.getPurchasingCredentials();
    if (userId.trim() === creds.userId && password === creds.pass) {
      setIsAuthenticated(true);
      showToast('Procurement Portal Access Authorized!', 'success');
    } else {
      showToast('Invalid Purchasing Credentials. Access Denied.', 'error');
    }
  };

  // 1. Submit stock receipt (GRN) Form
  const handleAddInwardStock = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      showToast('Please select a product from the master catalog.', 'error');
      return;
    }
    if (inwardQuantity <= 0) {
      showToast('Inward quantity must be 1 or higher.', 'error');
      return;
    }
    if (!selectedSupplier) {
      showToast('Please choose an authorized supplier.', 'error');
      return;
    }
    if (unitCost <= 0) {
      showToast('Please specify a valid wholesale cost.', 'error');
      return;

    }

    const matchedProduct = products.find(p => p.id === selectedProductId);
    if (!matchedProduct) {
      showToast('Product validation failed.', 'error');
      return;
    }

    // Prepare purchase entry
    const finalEntry: Omit<PurchaseEntry, 'id'> = {
      productId: matchedProduct.id,
      productName: matchedProduct.name,
      sku: matchedProduct.sku,
      quantity: inwardQuantity,
      supplier: selectedSupplier,
      purchaseDate,
      unitCost,
      totalCost: inwardQuantity * unitCost
    };

    // Save and update stock
    const added = storage.addPurchaseEntry(finalEntry);
    setPurchaseEntries(prev => [added, ...prev]);

    // Update state product stock representation
    const updatedProduct = storage.getProductById(matchedProduct.id);
    setProducts(storage.getProducts());
    if (updatedProduct) {
      void cloudApi.saveProduct(updatedProduct).catch(() => {
        showToast('Stock was saved locally, but cloud synchronization failed. Please retry.', 'error');
      });
    }

    // Clean form
    setSelectedProductId('');
    setInwardQuantity(5);
    setUnitCost(0);

    showToast(`GRN Logged: Successfully received +${inwardQuantity} of ${matchedProduct.name}!`, 'success');
  };

  // 2. Submit Purchase Order (PO) Form
  const handleCreatePurchaseOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!poSupplier) {
      showToast('Please select a supplier for this PO.', 'error');
      return;
    }

    const validItems = poItems.filter(item => item.productId && item.quantity > 0 && item.unitCost > 0);
    if (validItems.length === 0) {
      showToast('Please add at least one valid item with quantity and unit cost.', 'error');
      return;
    }

    // Build items payload
    const formattedItems = validItems.map(item => {
      const p = products.find(prod => prod.id === item.productId);
      return {
        productId: item.productId,
        productName: p ? p.name : 'Unknown Product',
        sku: p ? p.sku : 'N/A',
        quantity: item.quantity,
        unitCost: item.unitCost
      };
    });

    const totalAmount = formattedItems.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);

    const newPO: PurchaseOrder = {
      id: `po_${Math.random().toString(36).substr(2, 9)}`,
      poNumber: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierName: poSupplier,
      orderDate: new Date().toISOString().substring(0, 10),
      deliveryDate: poDeliveryDate,
      status: 'Sent',
      items: formattedItems,
      totalAmount,
      notes: poNotes.trim()
    };

    const updatedPOs = [newPO, ...purchaseOrders];
    setPurchaseOrders(updatedPOs);
    localStorage.setItem('cpf_purchase_orders_v1', JSON.stringify(updatedPOs));

    // Reset PO Form
    setPoSupplier('');
    setPoNotes('');
    setPoItems([{ productId: '', quantity: 1, unitCost: 0 }]);

    showToast(`Purchase Order ${newPO.poNumber} created & transmitted to supplier!`, 'success');
  };

  // 3. Receive full stock from a PO (Completing a PO and auto-generating GRN)
  const handleReceivePOStock = (po: PurchaseOrder) => {
    if (po.status === 'Completed') return;

    // Receive each item in PO as a GRN entry
    po.items.forEach(item => {
      const entry: Omit<PurchaseEntry, 'id'> = {
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        supplier: po.supplierName,
        purchaseDate: new Date().toISOString().substring(0, 10),
        unitCost: item.unitCost,
        totalCost: item.quantity * item.unitCost
      };
      storage.addPurchaseEntry(entry);
      const updatedProduct = storage.getProductById(item.productId);
      if (updatedProduct) {
        void cloudApi.saveProduct(updatedProduct).catch(() => {
          showToast(`Cloud stock sync failed for ${updatedProduct.name}. Please retry.`, 'error');
        });
      }
    });

    // Update PO status to Completed
    const updatedPOs = purchaseOrders.map(p => {
      if (p.id === po.id) {
        return { ...p, status: 'Completed' as const };
      }
      return p;
    });

    setPurchaseOrders(updatedPOs);
    localStorage.setItem('cpf_purchase_orders_v1', JSON.stringify(updatedPOs));

    // Reload catalog and entries
    setProducts(storage.getProducts());
    setPurchaseEntries(storage.getPurchaseEntries());

    showToast(`Goods Receipt Note created for ${po.poNumber}. Stock updated!`, 'success');
  };

  // 4. Create Supplier
  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supName.trim()) {
      showToast('Supplier Name is required.', 'error');
      return;
    }

    const newSup: Supplier = {
      id: `sup_${Math.random().toString(36).substr(2, 9)}`,
      name: supName.trim(),
      contactPerson: supContact.trim(),
      phone: supPhone.trim(),
      email: supEmail.trim(),
      address: supAddress.trim(),
      specialty: supSpecialty.trim(),
      gstin: supGstin.trim() || 'Unspecified',
      bankDetails: supBankDetails.trim() || 'N/A',
      paymentTerms: supPaymentTerms || 'Net 30 Days'
    };

    const updated = [...suppliers, newSup];
    setSuppliers(updated);
    localStorage.setItem('cpf_procure_suppliers_v1', JSON.stringify(updated));

    // Reset Form
    setSupName('');
    setSupContact('');
    setSupPhone('');
    setSupEmail('');
    setSupAddress('');
    setSupSpecialty('');
    setSupGstin('');
    setSupBankDetails('');
    setSupPaymentTerms('Net 30 Days');

    showToast(`Supplier ${newSup.name} registered successfully!`, 'success');
  };

  // --- EXPORT HELPERS ---
  const handleExportCSV = () => {
    // Determine active list based on activeSubTab
    let csvContent = "data:text/csv;charset=utf-8,";

    if (activeSubTab === 'grn') {
      // Export filtered GRN
      csvContent += "ID,Purchase Date,Product Name,SKU,Supplier,Quantity,Unit Cost (INR),Total Cost (INR)\n";
      filteredPurchaseEntries.forEach(entry => {
        const row = [
          `"${entry.id}"`,
          `"${entry.purchaseDate}"`,
          `"${entry.productName.replace(/"/g, '""')}"`,
          `"${entry.sku}"`,
          `"${entry.supplier.replace(/"/g, '""')}"`,
          entry.quantity,
          entry.unitCost,
          entry.totalCost
        ].join(",");
        csvContent += row + "\n";
      });
    } else if (activeSubTab === 'po') {
      // Export filtered POs
      csvContent += "PO Number,Order Date,Delivery Date,Supplier Name,Total Items,Total Amount (INR),Status\n";
      filteredPurchaseOrders.forEach(po => {
        const row = [
          `"${po.poNumber}"`,
          `"${po.orderDate}"`,
          `"${po.deliveryDate}"`,
          `"${po.supplierName.replace(/"/g, '""')}"`,
          po.items.length,
          po.totalAmount,
          `"${po.status}"`
        ].join(",");
        csvContent += row + "\n";
      });
    } else if (activeSubTab === 'suppliers') {
      csvContent += "Supplier Name,Contact Person,Phone,Email,GSTIN,Payment Terms,Specialty\n";
      suppliers.forEach(s => {
        const row = [
          `"${s.name.replace(/"/g, '""')}"`,
          `"${s.contactPerson.replace(/"/g, '""')}"`,
          `"${s.phone}"`,
          `"${s.email}"`,
          `"${s.gstin || 'N/A'}"`,
          `"${s.paymentTerms || 'Net 30 Days'}"`,
          `"${s.specialty.replace(/"/g, '""')}"`
        ].join(",");
        csvContent += row + "\n";
      });
    } else {
      csvContent += "Product ID,Product Name,SKU,Current Showroom Stock,Price (INR)\n";
      filteredProducts.forEach(p => {
        const row = [
          `"${p.id}"`,
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.sku}"`,
          p.stock,
          p.price
        ].join(",");
        csvContent += row + "\n";
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CPF_Procurement_Report_${activeSubTab}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Successfully exported active ${activeSubTab.toUpperCase()} database to Excel-compatible CSV.`, 'success');
  };

  const handleExportPDF = () => {
    // Generate a beautiful, print-ready layout
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Popups blocked. Please allow popups to export printable PDF.', 'error');
      return;
    }

    let itemsHtml = '';
    let title = '';

    if (activeSubTab === 'grn') {
      title = 'Goods Receipt Notes (GRN) Inward History';
      itemsHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #1c1917; color: #f5f5f4; text-align: left; font-size: 11px; text-transform: uppercase;">
              <th style="padding: 10px; border: 1px solid #e7e5e4;">Date</th>
              <th style="padding: 10px; border: 1px solid #e7e5e4;">Product Name</th>
              <th style="padding: 10px; border: 1px solid #e7e5e4;">SKU</th>
              <th style="padding: 10px; border: 1px solid #e7e5e4;">Supplier</th>
              <th style="padding: 10px; border: 1px solid #e7e5e4; text-align: right;">Qty</th>
              <th style="padding: 10px; border: 1px solid #e7e5e4; text-align: right;">Unit Cost (₹)</th>
              <th style="padding: 10px; border: 1px solid #e7e5e4; text-align: right;">Total Cost (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${filteredPurchaseEntries.map(entry => `
              <tr style="font-size: 11px; border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 8px; border: 1px solid #e7e5e4;">${entry.purchaseDate}</td>
                <td style="padding: 8px; border: 1px solid #e7e5e4; font-weight: bold;">${entry.productName}</td>
                <td style="padding: 8px; border: 1px solid #e7e5e4;">${entry.sku}</td>
                <td style="padding: 8px; border: 1px solid #e7e5e4;">${entry.supplier}</td>
                <td style="padding: 8px; border: 1px solid #e7e5e4; text-align: right;">${entry.quantity}</td>
                <td style="padding: 8px; border: 1px solid #e7e5e4; text-align: right;">${entry.unitCost.toLocaleString()}</td>
                <td style="padding: 8px; border: 1px solid #e7e5e4; text-align: right; font-weight: bold;">${entry.totalCost.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (activeSubTab === 'po') {
      title = 'Purchase Orders (PO) Procurement Ledger';
      itemsHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #1c1917; color: #f5f5f4; text-align: left; font-size: 11px; text-transform: uppercase;">
              <th style="padding: 10px; border: 1px solid #e7e5e4;">PO Number</th>
              <th style="padding: 10px; border: 1px solid #e7e5e4;">Order Date</th>
              <th style="padding: 10px; border: 1px solid #e7e5e4;">Delivery Date</th>
              <th style="padding: 10px; border: 1px solid #e7e5e4;">Supplier Name</th>
              <th style="padding: 10px; border: 1px solid #e7e5e4; text-align: right;">Items</th>
              <th style="padding: 10px; border: 1px solid #e7e5e4; text-align: right;">Total (₹)</th>
              <th style="padding: 10px; border: 1px solid #e7e5e4;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredPurchaseOrders.map(po => `
              <tr style="font-size: 11px; border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 8px; border: 1px solid #e7e5e4; font-weight: bold; color: #854d0e;">${po.poNumber}</td>
                <td style="padding: 8px; border: 1px solid #e7e5e4;">${po.orderDate}</td>
                <td style="padding: 8px; border: 1px solid #e7e5e4;">${po.deliveryDate}</td>
                <td style="padding: 8px; border: 1px solid #e7e5e4;">${po.supplierName}</td>
                <td style="padding: 8px; border: 1px solid #e7e5e4; text-align: right;">${po.items.length}</td>
                <td style="padding: 8px; border: 1px solid #e7e5e4; text-align: right; font-weight: bold;">${po.totalAmount.toLocaleString()}</td>
                <td style="padding: 8px; border: 1px solid #e7e5e4; font-weight: bold; color: ${po.status === 'Completed' ? '#059669' : '#d97706'}">${po.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (activeSubTab === 'suppliers') {
      title = 'Approved Premium Supplier Directory';
      itemsHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #1c1917; color: #f5f5f4; text-align: left; font-size: 11px; text-transform: uppercase;">
              <th style="padding: 10px; border: 1px solid #e7e5e4;">Vendor</th>
              <th style="padding: 10px; border: 1px solid #e7e5e4;">GSTIN</th>
              <th style="padding: 10px; border: 1px solid #e7e5e4;">Payment Terms</th>
              <th style="padding: 10px; border: 1px solid #e7e5e4;">Specialty</th>
              <th style="padding: 10px; border: 1px solid #e7e5e4;">Contact Info</th>
            </tr>
          </thead>
          <tbody>
            ${suppliers.map(s => `
              <tr style="font-size: 11px; border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 8px; border: 1px solid #e7e5e4; font-weight: bold;">${s.name}</td>
                <td style="padding: 8px; border: 1px solid #e7e5e4; font-family: monospace;">${s.gstin || 'N/A'}</td>
                <td style="padding: 8px; border: 1px solid #e7e5e4;">${s.paymentTerms || 'Net 30 Days'}</td>
                <td style="padding: 8px; border: 1px solid #e7e5e4;">${s.specialty}</td>
                <td style="padding: 8px; border: 1px solid #e7e5e4; line-height: 1.4;">
                  <strong>${s.contactPerson}</strong><br/>
                  ${s.phone} | ${s.email}<br/>
                  <span style="font-size: 10px; color: #78716c;">${s.address}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      title = 'Current Showroom Inventory Levels';
      itemsHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #1c1917; color: #f5f5f4; text-align: left; font-size: 11px; text-transform: uppercase;">
              <th style="padding: 10px; border: 1px solid #e7e5e4;">Product</th>
              <th style="padding: 10px; border: 1px solid #e7e5e4;">SKU</th>
              <th style="padding: 10px; border: 1px solid #e7e5e4; text-align: right;">Current Showroom Stock</th>
              <th style="padding: 10px; border: 1px solid #e7e5e4; text-align: right;">Retail Price (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${filteredProducts.map(p => `
              <tr style="font-size: 11px; border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 8px; border: 1px solid #e7e5e4; font-weight: bold;">${p.name}</td>
                <td style="padding: 8px; border: 1px solid #e7e5e4; font-family: monospace;">${p.sku}</td>
                <td style="padding: 8px; border: 1px solid #e7e5e4; text-align: right; font-weight: bold; color: ${p.stock <= 0 ? '#b91c1c' : '#1c1917'}">${p.stock} units</td>
                <td style="padding: 8px; border: 1px solid #e7e5e4; text-align: right;">${p.price.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>CPF Procurement - ${title}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1c1917; padding: 40px; margin: 0; line-height: 1.5; }
            h1 { font-family: Georgia, serif; font-size: 24px; border-bottom: 2px solid #854d0e; padding-bottom: 10px; margin-bottom: 5px; }
            p { margin: 0 0 15px 0; font-size: 12px; color: #57534e; }
            .header-meta { font-size: 11px; background-color: #fafaf9; border: 1px solid #e7e5e4; padding: 15px; border-radius: 8px; margin-bottom: 30px; display: flex; justify-content: space-between; }
            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #a8a29e; border-top: 1px dashed #e7e5e4; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h1>CASA PRESTIGE FURNITURE</h1>
              <p>Premium Backoffice Acquisition & Supplier Fulfillment Report</p>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 16px; font-weight: bold; color: #854d0e;">PROCUREMENT PORTAL</span>
            </div>
          </div>
          
          <div class="header-meta">
            <div>
              <strong>Active Tab:</strong> ${activeSubTab.toUpperCase()}<br/>
              <strong>Generated Date:</strong> ${new Date().toLocaleString()}<br/>
              <strong>Export Range:</strong> All filter-matching rows
            </div>
            <div style="text-align: right;">
              <strong>Authorized System Operator:</strong> CPF-Procure-Manager<br/>
              <strong>Security Protocol:</strong> SSL Secure Audit Complete
            </div>
          </div>

          <h2>${title}</h2>
          ${itemsHtml}

          <div class="footer">
            CONFIDENTIAL INTERNAL REPORT - FOR AUDITING PURPOSES ONLY - CASA PRESTIGE FURNITURE SHOWROOMS &copy; ${new Date().getFullYear()}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showToast('PDF Report generation started! Use your browser print preview to save.', 'success');
  };

  // Dynamic filter for active tab searching
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered GRN / Purchase entries
  const filteredPurchaseEntries = useMemo(() => {
    return purchaseEntries.filter(entry => {
      // General text filter (matches productName, SKU, or supplier)
      const matchesSearch = !searchTerm ||
        entry.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.supplier.toLowerCase().includes(searchTerm.toLowerCase());

      // Start date / End date filters
      const matchesStart = !filterStartDate || entry.purchaseDate >= filterStartDate;
      const matchesEnd = !filterEndDate || entry.purchaseDate <= filterEndDate;

      // Select box filters
      const matchesSupplier = !filterSupplier || entry.supplier === filterSupplier;
      const matchesProduct = !filterProductId || entry.productId === filterProductId;

      return matchesSearch && matchesStart && matchesEnd && matchesSupplier && matchesProduct;
    });
  }, [purchaseEntries, searchTerm, filterStartDate, filterEndDate, filterSupplier, filterProductId]);

  // Filtered Purchase Orders
  const filteredPurchaseOrders = useMemo(() => {
    return purchaseOrders.filter(po => {
      // PO number filter
      const matchesPo = !filterPoNumber || po.poNumber.toLowerCase().includes(filterPoNumber.toLowerCase());

      // Select box filters
      const matchesSupplier = !filterSupplier || po.supplierName === filterSupplier;
      const matchesProduct = !filterProductId || po.items.some(item => item.productId === filterProductId);

      // Date range filters
      const matchesStart = !filterStartDate || po.orderDate >= filterStartDate;
      const matchesEnd = !filterEndDate || po.orderDate <= filterEndDate;

      return matchesPo && matchesSupplier && matchesProduct && matchesStart && matchesEnd;
    });
  }, [purchaseOrders, filterPoNumber, filterSupplier, filterProductId, filterStartDate, filterEndDate]);

  // Render Login screen if unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-center items-center px-4 relative">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-stone-500/5 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={() => {
            setCurrentView('home');
            window.history.pushState(null, '', '#/');
          }}
          className="absolute top-6 left-6 flex items-center gap-2 text-stone-500 hover:text-amber-400 text-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </button>

        <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6 text-center">
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 text-amber-400 mb-2">
              <Boxes className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black font-serif-luxury text-white tracking-wide">CP Procurement & PO Portal</h1>
            <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto">
              Secure backoffice portal for purchase order transmission, supplier ledger logging, and active stock receipting.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs text-left">
            <div>
              <label className="font-bold text-stone-300 block mb-1">Purchasing User ID</label>
              <input
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User ID"
                className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-stone-300 block mb-1">Portal Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-2 text-xs"
            >
              <Lock className="w-4 h-4" />
              <span>Authenticate Procurement Portal</span>
            </button>
          </form>

          <p className="text-[10px] text-stone-500">
            Authorization strictly logged under backoffice audit protocols.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500 selection:text-stone-950 w-full max-w-full">

      {/* Header */}
      <header className="border-b border-stone-800 bg-stone-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-base">
              CP
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white uppercase flex items-center gap-1.5">
                <span>CP Backoffice Procurement</span>
                <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded font-bold border border-amber-500/20">Procurement & PO</span>
              </h1>
              <p className="text-[10px] text-stone-400 text-left">Enterprise Goods Receipt (GRN) & Supply Chain Controls</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setUserId('');
                setPassword('');
                showToast('Logged out of Procurement Portal.', 'info');
              }}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 hover:text-rose-400 text-stone-300 font-bold text-[11px] rounded-lg border border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('home');
                window.history.pushState(null, '', '#/');
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Portal Tab Navigation */}
      <div className="border-b border-stone-800 bg-stone-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 text-xs overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveSubTab('grn')}
            className={`py-4 font-black transition-all cursor-pointer border-b-2 flex items-center gap-2 ${activeSubTab === 'grn'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
              }`}
          >
            <Boxes className="w-4 h-4" />
            <span>GRN & Stock Inward</span>
          </button>

          <button
            onClick={() => setActiveSubTab('po')}
            className={`py-4 font-black transition-all cursor-pointer border-b-2 flex items-center gap-2 ${activeSubTab === 'po'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
              }`}
          >
            <FileText className="w-4 h-4" />
            <span>Purchase Orders (PO) Workspace</span>
          </button>

          <button
            onClick={() => setActiveSubTab('suppliers')}
            className={`py-4 font-black transition-all cursor-pointer border-b-2 flex items-center gap-2 ${activeSubTab === 'suppliers'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Supplier Management Directory</span>
          </button>

          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`py-4 font-black transition-all cursor-pointer border-b-2 flex items-center gap-2 ${activeSubTab === 'inventory'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
              }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Inventory Tracking & Health</span>
          </button>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* TAB 1: GRN & STOCK INWARD */}
        {activeSubTab === 'grn' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            {/* Input Form */}
            <section className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-6 h-fit">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base font-serif-luxury text-white">Log Goods Receipt Note (GRN)</h2>
                  <p className="text-[11px] text-stone-400">Instantly inward products into catalog stock</p>
                </div>
              </div>

              <form onSubmit={handleAddInwardStock} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-stone-300 block mb-1">Catalog Product *</label>
                  <select
                    required
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      const matched = products.find(p => p.id === e.target.value);
                      if (matched) {
                        setUnitCost(Math.round(matched.price * 0.45)); // wholesale cost estimate
                      }
                    }}
                    className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500 font-medium"
                  >
                    <option value="">-- Choose Catalogue Furniture --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — Stock: {p.stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-stone-300 block mb-1">Received Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={inwardQuantity}
                      onChange={(e) => setInwardQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-300 block mb-1">Unit Cost (₹ INR) *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={unitCost}
                      onChange={(e) => setUnitCost(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>
                </div>

                {selectedProductId && unitCost > 0 && (
                  <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl space-y-2 text-[11px]">
                    <span className="text-[10px] text-amber-500 font-black uppercase tracking-wider block">Automated Margin Pricing Calculations</span>
                    <div className="h-px bg-stone-800/60 my-1"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400 font-medium">Wholesale Purchase Price:</span>
                      <span className="font-mono text-white font-bold">₹{unitCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400 font-medium">Bespoke Sale Price (+40% markup):</span>
                      <span className="font-mono text-amber-400 font-extrabold">₹{Math.round(unitCost * 1.40).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400 font-medium">Bespoke Showroom MRP (+40% retail):</span>
                      <span className="font-mono text-stone-300 font-bold">₹{Math.round((unitCost * 1.40) * 1.40).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-bold text-stone-300 block mb-1">Supplier Source *</label>
                  <select
                    required
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500 font-medium"
                  >
                    <option value="">-- Choose Authorized Supplier --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.specialty})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-300 block mb-1">Received Date *</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                {selectedProductId && inwardQuantity > 0 && unitCost > 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Total Procurement Capital</span>
                      <span className="text-sm font-black text-white">₹{(inwardQuantity * unitCost).toLocaleString('en-IN')}</span>
                    </div>
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl transition-all shadow-lg hover:shadow-amber-500/10 cursor-pointer text-xs flex items-center justify-center gap-2"
                >
                  <Boxes className="w-4 h-4" />
                  <span>Receive Goods & Add to Catalogue Stock</span>
                </button>
              </form>
            </section>

            {/* Inward History Logs */}
            <section className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base font-serif-luxury text-white">Wholesale Stock GRN History ({purchaseEntries.length})</h2>
                  <p className="text-[11px] text-stone-400">Chronological history of verified luxury stock acquisitions</p>
                </div>
              </div>

              {purchaseEntries.length === 0 ? (
                <div className="p-12 border border-dashed border-stone-800 rounded-2xl text-center space-y-2 text-stone-500">
                  <FileSpreadsheet className="w-10 h-10 mx-auto opacity-30 text-amber-400" />
                  <p className="text-xs font-bold">No goods receipts logged yet</p>
                  <p className="text-[10px]">Use the receipt form on the left to inward catalog inventory.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-stone-800/60">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-950 text-stone-400 font-bold border-b border-stone-800 text-[10px] uppercase tracking-wider">
                        <th className="p-3">Inward Date</th>
                        <th className="p-3">Product Name</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Unit Cost</th>
                        <th className="p-3 text-right">Total outlay</th>
                        <th className="p-3">Supplier Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/50 bg-stone-900/60">
                      {purchaseEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-stone-950/40 transition-colors">
                          <td className="p-3 text-stone-300 font-medium whitespace-nowrap">{entry.purchaseDate}</td>
                          <td className="p-3">
                            <span className="font-bold text-white block">{entry.productName}</span>
                            <span className="text-[10px] text-stone-500 font-mono">{entry.sku}</span>
                          </td>
                          <td className="p-3 text-center text-amber-400 font-black">+{entry.quantity}</td>
                          <td className="p-3 text-right text-stone-300 font-mono">₹{entry.unitCost.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right text-amber-400 font-bold font-mono">₹{entry.totalCost.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-stone-300 font-medium">{entry.supplier}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: PURCHASE ORDERS WORKSPACE */}
        {activeSubTab === 'po' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            {/* Create PO panel */}
            <section className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base font-serif-luxury text-white">Draft Purchase Order (PO)</h2>
                  <p className="text-[11px] text-stone-400">Prepare professional trade supply contracts</p>
                </div>
              </div>

              <form onSubmit={handleCreatePurchaseOrder} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-stone-300 block mb-1">Target Artisan Supplier *</label>
                  <select
                    required
                    value={poSupplier}
                    onChange={(e) => setPoSupplier(e.target.value)}
                    className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500 font-medium"
                  >
                    <option value="">-- Select Registered Supplier --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.specialty})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-300 block mb-1">Expected Delivery Date *</label>
                  <input
                    type="date"
                    required
                    value={poDeliveryDate}
                    onChange={(e) => setPoDeliveryDate(e.target.value)}
                    className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                {/* Dynamically draft PO Line Items */}
                <div className="space-y-3">
                  <label className="font-bold text-stone-300 block">Drafted PO Lines *</label>
                  {poItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 bg-stone-950 p-2.5 rounded-xl border border-stone-800/60">
                      <div className="col-span-6">
                        <select
                          required
                          value={item.productId}
                          onChange={(e) => {
                            const val = e.target.value;
                            const matched = products.find(p => p.id === val);
                            const updated = [...poItems];
                            updated[index].productId = val;
                            if (matched) {
                              updated[index].unitCost = Math.round(matched.price * 0.42);
                            }
                            setPoItems(updated);
                          }}
                          className="w-full p-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 focus:outline-none focus:border-amber-500 font-medium text-[10px]"
                        >
                          <option value="">-- Product --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          required
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...poItems];
                            updated[index].quantity = Math.max(1, parseInt(e.target.value) || 1);
                            setPoItems(updated);
                          }}
                          className="w-full p-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 text-center text-[10px]"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="Cost"
                          required
                          value={item.unitCost || ''}
                          onChange={(e) => {
                            const updated = [...poItems];
                            updated[index].unitCost = Math.max(0, parseFloat(e.target.value) || 0);
                            setPoItems(updated);
                          }}
                          className="w-full p-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 text-right text-[10px]"
                        />
                      </div>

                      <div className="col-span-1 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (poItems.length === 1) return;
                            setPoItems(poItems.filter((_, idx) => idx !== index));
                          }}
                          className="text-stone-500 hover:text-red-400 font-bold text-sm"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-1">
                    <button
                      type="button"
                      onClick={() => setPoItems([...poItems, { productId: '', quantity: 1, unitCost: 0 }])}
                      className="text-amber-400 hover:text-amber-300 font-bold text-[10px] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      + Add Additional PO Line Item
                    </button>
                    <span className="text-[9px] text-stone-500 font-medium">
                      Sale Price = Cost + 40% markup | MRP = Sale Price + 40% retail
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-300 block mb-1">Backoffice Procurement Notes</label>
                  <textarea
                    rows={2}
                    value={poNotes}
                    onChange={(e) => setPoNotes(e.target.value)}
                    placeholder="Provide any custom terms, transit notes, or white glove delivery expectations..."
                    className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Transmit & Dispatch Purchase Order</span>
                </button>
              </form>
            </section>

            {/* List drafted/sent POs */}
            <section className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base font-serif-luxury text-white">Purchase Orders Ledger ({purchaseOrders.length})</h2>
                  <p className="text-[11px] text-stone-400">Track outward procurements and complete receipt fulfillment</p>
                </div>
              </div>

              {purchaseOrders.length === 0 ? (
                <div className="p-12 border border-dashed border-stone-800 rounded-2xl text-center space-y-2 text-stone-500">
                  <Clock className="w-10 h-10 mx-auto opacity-30 text-amber-400" />
                  <p className="text-xs font-bold">No Purchase Orders drafted yet</p>
                  <p className="text-[10px]">Use the draft form on the left to transmit PO contracts.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {purchaseOrders.map((po) => (
                    <div key={po.id} className="bg-stone-950 border border-stone-800/80 rounded-2xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800/50 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif-luxury text-sm font-black text-white">{po.poNumber}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${po.status === 'Completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                              {po.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-400 mt-0.5">Supplier: <strong className="text-stone-300">{po.supplierName}</strong> | Ordered on {po.orderDate}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-stone-400 block uppercase">Est. Outlay</span>
                          <span className="text-xs font-black text-amber-400 font-mono">₹{po.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* PO line items preview */}
                      <div className="space-y-1.5 text-[11px] text-stone-400">
                        {po.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-stone-900/40 px-3 py-1.5 rounded-lg">
                            <span>{item.productName} <strong className="text-stone-500 font-mono text-[9px] ml-1">({item.sku})</strong></span>
                            <span className="text-stone-300">{item.quantity} units &times; ₹{item.unitCost.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      {po.notes && (
                        <p className="text-[10px] text-stone-500 italic bg-stone-900/30 p-2 rounded-lg border border-stone-800/30">
                          Notes: {po.notes}
                        </p>
                      )}

                      {/* Action buttons */}
                      {po.status !== 'Completed' && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleReceivePOStock(po)}
                            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Inward Received Stock (Complete PO)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 3: SUPPLIER DIRECTORY */}
        {activeSubTab === 'suppliers' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            {/* New Supplier Form */}
            <section className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base font-serif-luxury text-white">Register Trade Supplier</h2>
                  <p className="text-[11px] text-stone-400">Onboard new verified luxury manufacturers</p>
                </div>
              </div>

              <form onSubmit={handleCreateSupplier} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-stone-300 block mb-1">Artisan House / Company Name *</label>
                  <input
                    type="text"
                    required
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                    placeholder="e.g. Royal Jodhpur Teakwood Co."
                    className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-300 block mb-1">Key Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                    placeholder="e.g. Chandra Shekhar Singh"
                    className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-stone-300 block mb-1">Direct Phone *</label>
                    <input
                      type="text"
                      required
                      value={supPhone}
                      onChange={(e) => setSupPhone(e.target.value)}
                      placeholder="+91 98290 12345"
                      className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-300 block mb-1">Contact Email *</label>
                    <input
                      type="email"
                      required
                      value={supEmail}
                      onChange={(e) => setSupEmail(e.target.value)}
                      placeholder="procure@jodhpur.com"
                      className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-300 block mb-1">Primary Material / Craft Specialty *</label>
                  <input
                    type="text"
                    required
                    value={supSpecialty}
                    onChange={(e) => setSupSpecialty(e.target.value)}
                    placeholder="e.g. Handcarved Teakwood & Brass Framing"
                    className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-stone-300 block mb-1">GSTIN Number (15-digit)</label>
                    <input
                      type="text"
                      value={supGstin}
                      onChange={(e) => setSupGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 08AAAAA1111A1Z1"
                      maxLength={15}
                      className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-300 block mb-1">Commercial Payment Terms</label>
                    <select
                      value={supPaymentTerms}
                      onChange={(e) => setSupPaymentTerms(e.target.value)}
                      className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500 font-medium"
                    >
                      <option value="Net 15 Days">Net 15 Days</option>
                      <option value="Net 30 Days">Net 30 Days</option>
                      <option value="Net 45 Days">Net 45 Days</option>
                      <option value="Net 60 Days">Net 60 Days</option>
                      <option value="50% Advance, 50% On Delivery">50% Advance, 50% On Delivery</option>
                      <option value="Due on Receipt">Due on Receipt</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-300 block mb-1">Supplier Corporate Bank Details</label>
                  <input
                    type="text"
                    value={supBankDetails}
                    onChange={(e) => setSupBankDetails(e.target.value)}
                    placeholder="e.g. HDFC Bank - Acct: 502000112233 - IFSC: HDFC0000011"
                    className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-300 block mb-1">Factory / Office Address *</label>
                  <textarea
                    rows={2}
                    required
                    value={supAddress}
                    onChange={(e) => setSupAddress(e.target.value)}
                    placeholder="Full physical address for dispatch pick-up coordination..."
                    className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Onboard & Register Supplier</span>
                </button>
              </form>
            </section>

            {/* Supplier Directory List */}
            <section className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base font-serif-luxury text-white">Verified Supplier Ledger ({suppliers.length})</h2>
                  <p className="text-[11px] text-stone-400">Direct contact registry for artisan workshop networks</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suppliers.map((s) => (
                  <div key={s.id} className="bg-stone-950 border border-stone-800/80 rounded-2xl p-4.5 space-y-3">
                    <div>
                      <h3 className="font-serif-luxury text-sm font-black text-white">{s.name}</h3>
                      <p className="text-[10px] text-amber-400 font-bold mt-0.5 uppercase tracking-wide">{s.specialty}</p>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-stone-400 pt-1.5 border-t border-stone-800/40">
                      <p>👤 Contact: <strong className="text-stone-300">{s.contactPerson}</strong></p>
                      <p>📞 Phone: <strong className="text-stone-300 font-mono">{s.phone}</strong></p>
                      <p>✉️ Email: <strong className="text-stone-300 font-mono">{s.email}</strong></p>
                      <p className="text-[10px] text-stone-500 italic mt-1 bg-stone-900/30 p-2 rounded border border-stone-800/20">📍 Address: {s.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 4: INVENTORY TRACKING & HEALTH */}
        {activeSubTab === 'inventory' && (
          <div className="space-y-6 text-left">
            {/* Quick stock status indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Catalogue Catalog Items</span>
                  <span className="text-xl font-black text-white">{products.length} Items</span>
                </div>
                <Boxes className="w-6 h-6 text-amber-500/40" />
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Low Stock Alerts</span>
                  <span className="text-xl font-black text-rose-400">
                    {products.filter(p => p.stock < 5).length} Items
                  </span>
                </div>
                <AlertTriangle className="w-6 h-6 text-rose-500/40" />
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Healthy Stock Items</span>
                  <span className="text-xl font-black text-emerald-400">
                    {products.filter(p => p.stock >= 10).length} Items
                  </span>
                </div>
                <CheckCircle className="w-6 h-6 text-emerald-500/40" />
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Total Active Stock Units</span>
                  <span className="text-xl font-black text-amber-400">
                    {products.reduce((acc, p) => acc + p.stock, 0)} units
                  </span>
                </div>
                <TrendingUp className="w-6 h-6 text-amber-500/40" />
              </div>
            </div>

            {/* Inventory table */}
            <section className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base font-serif-luxury text-white">Live Stock Ledger</h2>
                    <p className="text-[11px] text-stone-400">Monitor active showroom and warehouse catalog counts</p>
                  </div>
                </div>

                {/* Filter */}
                <div className="relative max-w-xs w-full">
                  <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name or SKU..."
                    className="w-full pl-9 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-stone-800/60">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-950 text-stone-400 font-bold border-b border-stone-800 text-[10px] uppercase tracking-wider">
                      <th className="p-3">Product Description</th>
                      <th className="p-3">Department</th>
                      <th className="p-3 text-right">Selling Price</th>
                      <th className="p-3 text-center">Warehouse Stock</th>
                      <th className="p-3 text-center">Status Alert</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/50 bg-stone-900/60">
                    {filteredProducts.map((p) => {
                      const isLow = p.stock < 5;
                      const isCritical = p.stock === 0;

                      return (
                        <tr key={p.id} className="hover:bg-stone-950/40 transition-colors">
                          <td className="p-3 flex items-center gap-3">
                            <img
                              referrerPolicy="no-referrer"
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 object-cover rounded-lg bg-stone-950 border border-stone-800"
                            />
                            <div>
                              <span className="font-bold text-white block">{p.name}</span>
                              <span className="text-[10px] text-stone-500 font-mono uppercase">{p.sku}</span>
                            </div>
                          </td>
                          <td className="p-3 text-stone-300 font-medium capitalize">{p.category}</td>
                          <td className="p-3 text-right font-mono text-stone-300">₹{p.price.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-center font-black font-mono text-white text-sm">{p.stock}</td>
                          <td className="p-3 text-center">
                            {isCritical ? (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">Critical Depleted</span>
                            ) : isLow ? (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">Replenish Now</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono">Stock Solid</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedProductId(p.id);
                                setUnitCost(Math.round(p.price * 0.45));
                                setActiveSubTab('grn');
                                showToast(`Pre-selected ${p.name} for receipt.`, 'info');
                              }}
                              className="px-2.5 py-1 bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-300 font-bold rounded text-[10px] transition-all cursor-pointer inline-flex items-center gap-1 border border-stone-700"
                            >
                              <PlusCircle className="w-3 h-3" />
                              <span>Inward Stock</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

      </main>
    </div>
  );
};
