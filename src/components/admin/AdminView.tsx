import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Boxes,
  Tag,
  Settings,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Eye,
  EyeOff,
  X,
  Lock,
  RefreshCw,
  Printer,
  Store,
  ShieldCheck,
  ArrowLeft,
  Menu,
  Mail,
  Star,
  MessageSquare,
  Filter,
  Check,
  ThumbsUp,
  Flag,
  FileSpreadsheet,
  Download,
  ArrowDownToLine,
  Truck,
  History,
  Sparkles,
  Layers,
  Loader2,
  Calendar,
  Clock,
  ArrowDownRight,
  Building2,
  MapPin,
  Phone,
  ExternalLink,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  Power
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, Order, Category, Coupon, OrderStatus, CustomerReview, InventoryLog, Showroom } from '../../types';
import { storage } from '../../services/storage';
import { AdminAnalytics } from './AdminAnalytics';
import { ProductImageUpload } from './ProductImageUpload';
import { ShowroomImageUpload } from './ShowroomImageUpload';
import { BannerImageInput } from './BannerImageInput';
import { compressImageFile } from '../../utils/imageOptimizer';
import {
  exportInventoryToExcel,
  exportInventoryToPDF,
  computeProductInventoryMetrics
} from '../../utils/inventoryExport';
import {
  exportCustomersToExcel,
  exportCustomersToPDF
} from '../../utils/customerExport';

export const AdminView: React.FC = () => {
  const {
    adminUser,
    loginAdmin,
    logoutAdmin,
    products,
    categories,
    orders,
    customers,
    inventoryLogs,
    coupons,
    websiteContent,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    renameSubcategory,
    deleteSubcategory,
    updateOrderStatus,
    addCoupon,
    deleteCoupon,
    updateWebsiteContent,
    setSelectedOrderId,
    setCurrentView,
    printOrderInvoice,
    showToast,
    reviews,
    deleteCustomerReview,
    updateCustomerReviewStatus,
    openProductDetail,
    adminActivityLogs,
    clearAdminActivityLogs,
    addAdminActivityLog,
    invoiceSettings,
    updateInvoiceSettings
  } = useApp();

  // Mobile sidebar toggle
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Admin login states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Active admin tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'analytics' | 'products' | 'categories' | 'orders' | 'reviews' | 'inventory' | 'customers' | 'coupons' | 'content' | 'security' | 'billing'
  >('dashboard');

  // Inventory & Export State
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('all');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfExportProgress, setPdfExportProgress] = useState('');
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Inward Restock Modal
  const [showInwardModal, setShowInwardModal] = useState(false);
  const [inwardProductId, setInwardProductId] = useState(products[0]?.id || '');
  const [inwardUnits, setInwardUnits] = useState(10);
  const [inwardBatchRef, setInwardBatchRef] = useState('');
  const [inwardSupplier, setInwardSupplier] = useState('Mysore Solid Woodcraft Hub');
  const [inwardNotes, setInwardNotes] = useState('');

  // Customer Reviews Moderation State
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<'all' | 'published' | 'pending' | 'flagged'>('all');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number | 'all'>('all');
  const [reviewProductFilter, setReviewProductFilter] = useState<string>('all');
  const [editingNotesReviewId, setEditingNotesReviewId] = useState<string | null>(null);
  const [tempAdminNote, setTempAdminNote] = useState('');
  const [deleteReviewConfirmId, setDeleteReviewConfirmId] = useState<string | null>(null);

  // Product Modal (Add / Edit)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Bill & Invoice Local States
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [localInvoiceHeader, setLocalInvoiceHeader] = useState(invoiceSettings?.invoiceHeader || '');
  const [localCompanyName, setLocalCompanyName] = useState(invoiceSettings?.companyName || '');
  const [localRegisteredOfficeAddress, setLocalRegisteredOfficeAddress] = useState(invoiceSettings?.registeredOfficeAddress || '');
  const [localGstin, setLocalGstin] = useState(invoiceSettings?.gstin || '');
  const [localCin, setLocalCin] = useState(invoiceSettings?.cin || '');
  const [localFulfillmentCenterName, setLocalFulfillmentCenterName] = useState(invoiceSettings?.fulfillmentCenterName || '');
  const [localWarehouseAddress, setLocalWarehouseAddress] = useState(invoiceSettings?.warehouseAddress || '');
  const [localDispatchNote, setLocalDispatchNote] = useState(invoiceSettings?.dispatchNote || '');
  const [localDeliveryWindowText, setLocalDeliveryWindowText] = useState(invoiceSettings?.deliveryWindowText || '');

  useEffect(() => {
    if (invoiceSettings) {
      setLocalInvoiceHeader(invoiceSettings.invoiceHeader);
      setLocalCompanyName(invoiceSettings.companyName);
      setLocalRegisteredOfficeAddress(invoiceSettings.registeredOfficeAddress);
      setLocalGstin(invoiceSettings.gstin);
      setLocalCin(invoiceSettings.cin);
      setLocalFulfillmentCenterName(invoiceSettings.fulfillmentCenterName);
      setLocalWarehouseAddress(invoiceSettings.warehouseAddress);
      setLocalDispatchNote(invoiceSettings.dispatchNote);
      setLocalDeliveryWindowText(invoiceSettings.deliveryWindowText);
    }
  }, [invoiceSettings]);

  // Category Modal & Subcategory Management
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<{
    categoryId: string;
    categoryName: string;
    subcategoryName: string;
    affectedProductsCount: number;
  } | null>(null);
  const [catFormName, setCatFormName] = useState('');
  const [catFormDesc, setCatFormDesc] = useState('');
  const [catFormImage, setCatFormImage] = useState('');
  const [catFormSubcategories, setCatFormSubcategories] = useState('');
  const [editingSubcategory, setEditingSubcategory] = useState<{
    categoryId: string;
    oldName: string;
    currentName: string;
  } | null>(null);
  const [addingSubcategoryCatId, setAddingSubcategoryCatId] = useState<string | null>(null);
  const [newSubcategoryText, setNewSubcategoryText] = useState('');

  // Coupon Modal
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(15);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState(30000);
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [newCouponExpiry, setNewCouponExpiry] = useState('2026-12-31');

  // Order filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [ordersSubTab, setOrdersSubTab] = useState<'orders_list' | 'customer_details'>('orders_list');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // Product filters
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');

  // Temporary state for Product form
  const [pName, setPName] = useState('');
  const [pSku, setPSku] = useState('');
  const [pCategory, setPCategory] = useState(categories[0]?.name || 'Sofas & Seating');
  const [pSubcategory, setPSubcategory] = useState('');
  const [pBrand, setPBrand] = useState('CP Heritage Woodcraft');
  const [pMaterial, setPMaterial] = useState('Solid Seasoned Teak Wood');
  const [pPrice, setPPrice] = useState(45000);
  const [pSalePrice, setPSalePrice] = useState(38000);
  const [pStock, setPStock] = useState(12);
  const [pLowStock, setPLowStock] = useState(3);
  const [pDesc, setPDesc] = useState('');
  const [productImages, setProductImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [pWarranty, setPWarranty] = useState('10-Year Comprehensive Wood Warranty');
  const [pIsBestSeller, setPIsBestSeller] = useState(false);
  const [pIsNewArrival, setPIsNewArrival] = useState(false);
  const [pIsTrending, setPIsTrending] = useState(false);

  // New tabbed product info states
  const [pCraftsmanshipHighlights, setPCraftsmanshipHighlights] = useState('');
  const [pSpecificationsText, setPSpecificationsText] = useState('');
  const [pCareInstructions, setPCareInstructions] = useState('');
  const [pReturnPolicy, setPReturnPolicy] = useState('');
  const [pFormTab, setPFormTab] = useState<'desc' | 'specs' | 'care' | 'warranty_returns'>('desc');

  // Content & Banners edit state
  const [contentAnnouncement, setContentAnnouncement] = useState(
    websiteContent.announcement || '✨ FESTIVE SHOWROOM SALE: Up to 40% Off + Free White-Glove Installation on Orders Above ₹19,999! Code: FESTIVE25'
  );
  const [contentAnnouncementEnabled, setContentAnnouncementEnabled] = useState(
    websiteContent.announcementEnabled !== false
  );
  const [contentPhone, setContentPhone] = useState(websiteContent.contactPhone || '+91 1800 200 4848 (Toll Free)');
  const [contentEmail, setContentEmail] = useState(websiteContent.contactEmail || 'concierge@cpfurniture.com');
  const [contentAddress, setContentAddress] = useState(websiteContent.headquartersAddress || 'CP Furniture Design Tower, 12th Avenue, Bengaluru, India');
  const [contentAboutUs, setContentAboutUs] = useState(websiteContent.aboutUsText || '');
  const [contentSectionTab, setContentSectionTab] = useState<'hero' | 'banners' | 'showrooms' | 'contact'>('hero');

  // Homepage Hero Banner Slides Edit States
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [slideToDelete, setSlideToDelete] = useState<any>(null);

  // Hero slide form fields
  const [slideTagline, setSlideTagline] = useState('');
  const [slideBadge, setSlideBadge] = useState('');
  const [slideTitle, setSlideTitle] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideImage, setSlideImage] = useState('');
  const [slideCtaText, setSlideCtaText] = useState('');
  const [slideCtaLink, setSlideCtaLink] = useState('');
  const [slideSecondaryCtaText, setSlideSecondaryCtaText] = useState('');
  const [slideSecondaryCtaLink, setSlideSecondaryCtaLink] = useState('');
  const [slideSizeOption, setSlideSizeOption] = useState<'full' | 'wide' | 'compact'>('wide');

  // Festive Banner edit states
  const [fEnabled, setFEnabled] = useState(websiteContent.festiveBanner?.enabled !== false);
  const [fBadge, setFBadge] = useState(websiteContent.festiveBanner?.badge || '🕉️ AUSPICIOUS BLESSINGS • VINAYAGAR CHATHURTHI SPECIAL');
  const [fTitle, setFTitle] = useState(websiteContent.festiveBanner?.title || 'Divine Beginnings for Your Luxury Home');
  const [fSubtitle, setFSubtitle] = useState(websiteContent.festiveBanner?.subtitle || 'Celebrate the auspicious occasion of Vinayagar Chathurthi with handcrafted solid teakwood suites, sculpted dining sets, and bespoke Italian velvet seating at exclusive festive privileges.');
  const [fCode, setFCode] = useState(websiteContent.festiveBanner?.code || 'VINAYAGAR15');
  const [fDiscountText, setFDiscountText] = useState(websiteContent.festiveBanner?.discountText || 'EXTRA 15% OFF');
  const [fExpiryText, setFExpiryText] = useState(websiteContent.festiveBanner?.expiryText || 'Valid Till Chaturthi Weekend');
  const [fImage, setFImage] = useState(websiteContent.festiveBanner?.image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80');
  const [fCtaText, setFCtaText] = useState(websiteContent.festiveBanner?.ctaText || 'Explore Festive Collection');
  const [fCtaLink, setFCtaLink] = useState(websiteContent.festiveBanner?.ctaLink || 'shop');
  const [fSecondaryCtaText, setFSecondaryCtaText] = useState(websiteContent.festiveBanner?.secondaryCtaText || 'Visit Experience Centers');
  const [fSecondaryCtaLink, setFSecondaryCtaLink] = useState(websiteContent.festiveBanner?.secondaryCtaLink || 'showrooms');

  // Experience Centers (Showroom) Management State
  const [showShowroomModal, setShowShowroomModal] = useState(false);
  const [editingShowroom, setEditingShowroom] = useState<Showroom | null>(null);
  const [showroomToDelete, setShowroomToDelete] = useState<Showroom | null>(null);
  const [showroomSearchQuery, setShowroomSearchQuery] = useState('');

  // Showroom Form Fields
  const [srName, setSrName] = useState('');
  const [srCity, setSrCity] = useState('Bangalore Flagship');
  const [srAddress, setSrAddress] = useState('');
  const [srPhone, setSrPhone] = useState('+91 80 4912 8800');
  const [srTiming, setSrTiming] = useState('10:00 AM - 9:00 PM (All 7 Days)');
  const [srImage, setSrImage] = useState('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80');
  const [srVirtualTourUrl, setSrVirtualTourUrl] = useState('');

  // Security management states
  const [secNewUserId, setSecNewUserId] = useState(storage.getAdminCredentials().email);
  const [secNewPassword, setSecNewPassword] = useState('');
  const [secConfirmPassword, setSecConfirmPassword] = useState('');
  const [secVerifyCurrentPassword, setSecVerifyCurrentPassword] = useState('');
  const [secShowNewPassword, setSecShowNewPassword] = useState(false);
  const [secShowConfirmPassword, setSecShowConfirmPassword] = useState(false);
  const [secShowVerifyPassword, setSecShowVerifyPassword] = useState(false);
  const [securityLogs, setSecurityLogs] = useState<Array<{ action: string; ip: string; date: string; success: boolean }>>([
    { action: 'Dashboard Login Success', ip: '192.168.1.14', date: '2026-09-13 14:05', success: true },
    { action: 'Inventory Export Generated', ip: '192.168.1.14', date: '2026-09-13 15:20', success: true },
  ]);

  // Purchasing credentials management
  const [purchUserId, setPurchUserId] = useState(storage.getPurchasingCredentials().userId);
  const [purchPassword, setPurchPassword] = useState(storage.getPurchasingCredentials().pass);

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await loginAdmin(adminEmail, adminPassword);
    if (ok) {
      showToast('Admin access authorized. Welcome back!', 'success');
    } else {
      showToast('Invalid credentials. Please verify your email and password.', 'error');
    }
  };

  // IF NOT AUTHENTICATED AS ADMIN
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between p-4 sm:p-8">
        {/* Dedicated Admin Portal Top Bar */}
        <header className="max-w-5xl w-full mx-auto flex items-center justify-between pb-6 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-base shadow">
              CP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-200 text-sm tracking-wide">CP Furniture</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                  /admin
                </span>
              </div>
              <p className="text-xs text-stone-400">Executive Showroom CMS & Inventory Management</p>
            </div>
          </div>

          <button
            id="admin-login-back-to-store-btn"
            onClick={() => {
              setCurrentView('home');
              window.history.pushState(null, '', '#/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-2 border border-stone-700 transition-all cursor-pointer shadow-sm"
          >
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span>Return to Customer Storefront</span>
          </button>
        </header>

        {/* Center Login Card */}
        <div className="max-w-md w-full mx-auto my-8">
          <div className="bg-stone-900 rounded-3xl p-8 border border-stone-800 text-white shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-stone-800 text-amber-400 mx-auto flex items-center justify-center border border-stone-700 shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold font-serif-luxury">Admin Dashboard Login</h1>
              <p className="text-xs text-stone-400">
                Secure backoffice for product catalog, stock inventory, and orders.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-300 block mb-1">Admin Email</label>
                <input
                  id="admin-login-email"
                  type="text"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@cpfurniture.com"
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-stone-300 block mb-1">Password</label>
                <div className="relative">
                  <input
                    id="admin-login-password"
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="admin-login-submit-btn"
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Log In to Admin Dashboard</span>
              </button>
            </form>

            <div className="text-center pt-2 flex flex-col gap-2 border-t border-stone-800">
              <button
                onClick={() => {
                  setCurrentView('home');
                  window.history.pushState(null, '', '#/');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
              >
                &larr; Switch to Customer Shopping Store
              </button>
            </div>
          </div>
        </div>

        {/* Admin Footer info */}
        <footer className="max-w-5xl w-full mx-auto text-center text-[11px] text-stone-500 pt-6 border-t border-stone-800/50">
          CP Furniture Operating System &bull; Dedicated Showroom Administrator Console (/admin)
        </footer>
      </div>
    );
  }

  // CALCULATE DASHBOARD METRICS
  const totalSales = orders.reduce(
    (sum, o) => sum + (o.orderStatus !== 'Cancelled' ? (o.total ?? o.grandTotal ?? 0) : 0),
    0
  );
  const totalOrders = orders.length;
  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockLimit);
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length;

  // Open Add Product Modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setPName('');
    setPSku(`CP-${Date.now().toString().slice(-4)}`);
    setPCategory(categories[0]?.name || 'Sofas & Seating');
    setPSubcategory('');
    setPBrand('CP Heritage Woodcraft');
    setPMaterial('Solid Seasoned Teak Wood');
    setPPrice(50000);
    setPSalePrice(42000);
    setPStock(10);
    setPLowStock(3);
    setPDesc('Mastercrafted solid hardwood furniture piece designed for lifetime durability.');
    setProductImages([
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'
    ]);
    setPWarranty('10-Year Structural Wood Warranty');
    setPIsBestSeller(false);
    setPIsNewArrival(true);
    setPIsTrending(false);

    // Initial values for new custom tabs
    setPCraftsmanshipHighlights(
      [
        'Kiln-seasoned hardwood frame engineered to resist warpage across humidity fluctuations.',
        'German precision hardware fittings certified for over 100,000 opening cycles.',
        'Hand-applied organic beeswax and non-toxic Italian polyurethane matte protective clear-coat.',
        'Custom-engineered high resilience multi-density core offering lifetime back posture support.'
      ].join('\n')
    );
    setPSpecificationsText(
      [
        'Frame Material: Certified Kiln-Dried Solid Teakwood',
        'Foam Density: 40D High-Resilience PU Cushioning',
        'Upholstery Grade: Ultra-soft Premium Velvet (380 GSM)',
        'Suspension: Pocket Springs with Multi-Core Elastic Webbing'
      ].join('\n')
    );
    setPCareInstructions(
      [
        'Vacuum clean once a week using a soft brush attachment',
        'Blot liquid spills immediately with a dry, clean micro-fiber cloth; do not rub',
        'Avoid prolonged direct exposure to intense sunlight to maintain rich fabric color'
      ].join('\n')
    );
    setPReturnPolicy('');

    setShowProductModal(true);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPSku(prod.sku);
    setPCategory(prod.category);
    setPSubcategory(prod.subcategory);
    setPBrand(prod.brand);
    setPMaterial(prod.material);
    setPPrice(prod.price);
    setPSalePrice(prod.salePrice);
    setPStock(prod.stock);
    setPLowStock(prod.lowStockLimit);
    setPDesc(prod.description);
    setProductImages(prod.images && prod.images.length > 0 ? prod.images : [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80'
    ]);
    setPWarranty(prod.warranty);
    setPIsBestSeller(prod.isBestSeller);
    setPIsNewArrival(prod.isNewArrival);
    setPIsTrending(prod.isTrending);

    // Load new custom tab fields
    setPCraftsmanshipHighlights(
      (prod.craftsmanshipHighlights && prod.craftsmanshipHighlights.length > 0)
        ? prod.craftsmanshipHighlights.join('\n')
        : [
          'Kiln-seasoned hardwood frame engineered to resist warpage across humidity fluctuations.',
          'German precision hardware fittings certified for over 100,000 opening cycles.',
          'Hand-applied organic beeswax and non-toxic Italian polyurethane matte protective clear-coat.',
          'Custom-engineered high resilience multi-density core offering lifetime back posture support.'
        ].join('\n')
    );
    setPSpecificationsText(
      prod.specifications
        ? Object.entries(prod.specifications)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n')
        : ''
    );
    setPCareInstructions(
      (prod.careInstructions && prod.careInstructions.length > 0)
        ? prod.careInstructions.join('\n')
        : [
          'Vacuum clean once a week using a soft brush attachment',
          'Blot liquid spills immediately with a dry, clean micro-fiber cloth; do not rub',
          'Avoid prolonged direct exposure to intense sunlight to maintain rich fabric color'
        ].join('\n')
    );
    setPReturnPolicy(prod.returnPolicy || '');

    setShowProductModal(true);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const imageArray = productImages.filter(Boolean);

    const discount = pPrice > pSalePrice ? Math.round(((pPrice - pSalePrice) / pPrice) * 100) : 0;

    // Process new fields on save
    const craftsmanshipHighlights = pCraftsmanshipHighlights
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const specifications: Record<string, string> = {};
    pSpecificationsText.split('\n').forEach((line) => {
      const idx = line.indexOf(':');
      if (idx > -1) {
        const k = line.slice(0, idx).trim();
        const v = line.slice(idx + 1).trim();
        if (k && v) {
          specifications[k] = v;
        }
      }
    });

    const careInstructions = pCareInstructions
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const returnPolicy = pReturnPolicy.trim();

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: pName,
        sku: pSku,
        category: pCategory,
        subcategory: pSubcategory,
        brand: pBrand,
        material: pMaterial,
        price: Number(pPrice),
        salePrice: Number(pSalePrice),
        discount,
        stock: Number(pStock),
        lowStockLimit: Number(pLowStock),
        description: pDesc,
        images: imageArray.length > 0 ? imageArray : editingProduct.images,
        warranty: pWarranty,
        isBestSeller: pIsBestSeller,
        isNewArrival: pIsNewArrival,
        isTrending: pIsTrending,
        craftsmanshipHighlights,
        specifications,
        careInstructions,
        returnPolicy
      });
      showToast('Product updated successfully.', 'success');
    } else {
      addProduct({
        name: pName,
        sku: pSku,
        category: pCategory,
        subcategory: pSubcategory,
        brand: pBrand,
        material: pMaterial,
        price: Number(pPrice),
        salePrice: Number(pSalePrice),
        discount,
        stock: Number(pStock),
        lowStockLimit: Number(pLowStock),
        dimensions: { length: 78, width: 36, height: 32, unit: 'inches' },
        weight: 45,
        warranty: pWarranty,
        colors: [
          { name: 'Warm Honey Teak', hex: '#b45309' },
          { name: 'Deep Walnut', hex: '#451a03' }
        ],
        sizes: ['Standard 3-Seater', 'King Size'],
        description: pDesc,
        careInstructions,
        images:
          imageArray.length > 0
            ? imageArray
            : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80'],
        rating: 4.8,
        reviewCount: 1,
        isBestSeller: pIsBestSeller,
        isNewArrival: pIsNewArrival,
        isTrending: pIsTrending,
        isPublished: true,
        assemblyRequired: true,
        specifications: Object.keys(specifications).length > 0 ? specifications : {
          Wood: pMaterial,
          Finish: 'Natural Matte Polyurethane',
          Joints: 'Traditional Mortise & Tenon'
        },
        craftsmanshipHighlights,
        returnPolicy
      });
      showToast('New product added to catalog.', 'success');
    }

    setShowProductModal(false);
  };

  // Add Coupon Handler
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    addCoupon({
      code: newCouponCode.toUpperCase(),
      discountPercent: Number(newCouponDiscount),
      minOrderValue: Number(newCouponMinOrder),
      description: newCouponDesc || `${newCouponDiscount}% off on minimum order of ₹${newCouponMinOrder}`,
      expiryDate: newCouponExpiry,
      isActive: true
    });
    setShowCouponModal(false);
    setNewCouponCode('');
    showToast('New coupon generated.', 'success');
  };

  // Showroom Open Add Modal
  const handleOpenAddShowroom = () => {
    setEditingShowroom(null);
    setSrName('');
    setSrCity('Bangalore Flagship');
    setSrAddress('');
    setSrPhone('+91 80 4912 8800');
    setSrTiming('10:00 AM - 9:00 PM (All 7 Days)');
    setSrImage('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80');
    setSrVirtualTourUrl('');
    setShowShowroomModal(true);
  };

  // Showroom Open Edit Modal
  const handleOpenEditShowroom = (sr: Showroom) => {
    setEditingShowroom(sr);
    setSrName(sr.name);
    setSrCity(sr.city);
    setSrAddress(sr.address);
    setSrPhone(sr.phone);
    setSrTiming(sr.timing);
    setSrImage(sr.image);
    setSrVirtualTourUrl(sr.virtualTourUrl || '');
    setShowShowroomModal(true);
  };

  // Showroom Save (Add or Update)
  const handleSaveShowroom = (e: React.FormEvent) => {
    e.preventDefault();
    const currentList = websiteContent.showrooms || [];

    if (editingShowroom) {
      const updated = currentList.map((sr) =>
        sr.id === editingShowroom.id
          ? {
            ...sr,
            name: srName.trim(),
            city: srCity.trim(),
            address: srAddress.trim(),
            phone: srPhone.trim(),
            timing: srTiming.trim(),
            image: srImage.trim() || sr.image,
            virtualTourUrl: srVirtualTourUrl.trim() || undefined
          }
          : sr
      );
      updateWebsiteContent({ showrooms: updated });
      showToast(`Experience Center "${srName.trim()}" updated successfully.`, 'success');
    } else {
      const newShowroom: Showroom = {
        id: `sr-${Date.now()}`,
        name: srName.trim(),
        city: srCity.trim(),
        address: srAddress.trim(),
        phone: srPhone.trim(),
        timing: srTiming.trim() || '10:00 AM - 9:00 PM (All 7 Days)',
        image: srImage.trim() || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
        virtualTourUrl: srVirtualTourUrl.trim() || undefined
      };
      updateWebsiteContent({ showrooms: [...currentList, newShowroom] });
      showToast(`New Experience Center "${srName.trim()}" published to storefront.`, 'success');
    }

    setShowShowroomModal(false);
  };

  // Showroom Delete
  const handleDeleteShowroom = (srId: string) => {
    const currentList = websiteContent.showrooms || [];
    const target = currentList.find((s) => s.id === srId);
    const updated = currentList.filter((s) => s.id !== srId);
    updateWebsiteContent({ showrooms: updated });
    setShowroomToDelete(null);
    showToast(`Experience Center "${target?.name || ''}" removed.`, 'info');
  };

  // Hero Slide Open Add Modal
  const handleOpenAddSlide = () => {
    setEditingSlide(null);
    setSlideTagline('THE NEW 2026 SHOWROOM COLLECTION');
    setSlideBadge('EXCLUSIVE');
    setSlideTitle('Architectural Elegance for Modern Living');
    setSlideSubtitle('Discover mastercrafted solid premium teak suites, custom-curated dining settings, and bespoke upholstery made for timeless architectural homes.');
    setSlideImage('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80');
    setSlideCtaText('Explore Series');
    setSlideCtaLink('sofas-seating');
    setSlideSecondaryCtaText('Book Private Consultation');
    setSlideSecondaryCtaLink('showrooms');
    setSlideSizeOption('wide');
    setShowSlideModal(true);
  };

  // Hero Slide Open Edit Modal
  const handleOpenEditSlide = (slide: any) => {
    setEditingSlide(slide);
    setSlideTagline(slide.tagline || '');
    setSlideBadge(slide.badge || '');
    setSlideTitle(slide.title || '');
    setSlideSubtitle(slide.subtitle || '');
    setSlideImage(slide.image || '');
    setSlideCtaText(slide.ctaText || 'Shop Collection');
    setSlideCtaLink(slide.ctaLink || '');
    setSlideSecondaryCtaText(slide.secondaryCtaText || '');
    setSlideSecondaryCtaLink(slide.secondaryCtaLink || '');
    setSlideSizeOption(slide.sizeOption || 'wide');
    setShowSlideModal(true);
  };

  // Hero Slide Save (Add or Update)
  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    const currentList = websiteContent.heroSlides || [];

    if (editingSlide) {
      const updated = currentList.map((slide) =>
        slide.id === editingSlide.id
          ? {
            ...slide,
            tagline: slideTagline.trim(),
            badge: slideBadge.trim(),
            title: slideTitle.trim(),
            subtitle: slideSubtitle.trim(),
            image: slideImage.trim(),
            ctaText: slideCtaText.trim(),
            ctaLink: slideCtaLink.trim(),
            secondaryCtaText: slideSecondaryCtaText.trim(),
            secondaryCtaLink: slideSecondaryCtaLink.trim(),
            sizeOption: slideSizeOption
          }
          : slide
      );
      updateWebsiteContent({ heroSlides: updated });
      showToast(`Hero Slide "${slideTitle.trim()}" updated successfully.`, 'success');
    } else {
      const newSlide = {
        id: `slide-${Date.now()}`,
        tagline: slideTagline.trim(),
        badge: slideBadge.trim(),
        title: slideTitle.trim(),
        subtitle: slideSubtitle.trim(),
        image: slideImage.trim() || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
        ctaText: slideCtaText.trim(),
        ctaLink: slideCtaLink.trim(),
        secondaryCtaText: slideSecondaryCtaText.trim(),
        secondaryCtaLink: slideSecondaryCtaLink.trim(),
        sizeOption: slideSizeOption
      };
      updateWebsiteContent({ heroSlides: [...currentList, newSlide] });
      showToast(`New Hero Slide "${slideTitle.trim()}" published successfully.`, 'success');
    }

    setShowSlideModal(false);
  };

  // Hero Slide Delete
  const handleDeleteSlide = (slideId: string) => {
    const currentList = websiteContent.heroSlides || [];
    const target = currentList.find((s) => s.id === slideId);
    if (currentList.length <= 1) {
      showToast('Cannot delete the last remaining hero slide. Keep at least one slide active.', 'error');
      setSlideToDelete(null);
      return;
    }
    const updated = currentList.filter((s) => s.id !== slideId);
    updateWebsiteContent({ heroSlides: updated });
    setSlideToDelete(null);
    showToast(`Hero Slide "${target?.title || ''}" removed.`, 'info');
  };

  // Hero Slide File Upload
  const handleSlideFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const optimized = await compressImageFile(file, { maxWidth: 1600, maxHeight: 900, quality: 0.82 });
        setSlideImage(optimized);
      } catch {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result && typeof event.target.result === 'string') {
            setSlideImage(event.target.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Save Content & Top Banner Handler
  const handleSaveContent = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateWebsiteContent({
      announcement: contentAnnouncement.trim(),
      announcementEnabled: contentAnnouncementEnabled,
      contactPhone: contentPhone.trim(),
      contactEmail: contentEmail.trim(),
      headquartersAddress: contentAddress.trim(),
      aboutUsText: contentAboutUs.trim()
    });
    showToast('Site banners and storefront settings saved successfully.', 'success');
  };

  // Save Festive Banner Handler
  const handleSaveFestiveBanner = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateWebsiteContent({
      festiveBanner: {
        enabled: fEnabled,
        badge: fBadge.trim(),
        title: fTitle.trim(),
        subtitle: fSubtitle.trim(),
        code: fCode.trim(),
        discountText: fDiscountText.trim(),
        expiryText: fExpiryText.trim(),
        image: fImage.trim(),
        ctaText: fCtaText.trim(),
        ctaLink: fCtaLink.trim(),
        secondaryCtaText: fSecondaryCtaText.trim(),
        secondaryCtaLink: fSecondaryCtaLink.trim()
      }
    });
    showToast('Vinayagar Chathurthi Hero Banner settings saved successfully.', 'success');
  };

  // Toggle Festive Banner Switch
  const handleToggleFestiveBanner = (enabled: boolean) => {
    setFEnabled(enabled);
    updateWebsiteContent({
      festiveBanner: {
        enabled,
        badge: fBadge.trim(),
        title: fTitle.trim(),
        subtitle: fSubtitle.trim(),
        code: fCode.trim(),
        discountText: fDiscountText.trim(),
        expiryText: fExpiryText.trim(),
        image: fImage.trim(),
        ctaText: fCtaText.trim(),
        ctaLink: fCtaLink.trim(),
        secondaryCtaText: fSecondaryCtaText.trim(),
        secondaryCtaLink: fSecondaryCtaLink.trim()
      }
    });
    showToast(
      enabled
        ? '🕉️ Festive Hero Banner is now ENABLED on customer home page.'
        : 'Festive Hero Banner is now HIDDEN from customer home page.',
      enabled ? 'success' : 'info'
    );
  };

  // Toggle Announcement Banner Switch
  const handleToggleAnnouncement = (enabled: boolean) => {
    setContentAnnouncementEnabled(enabled);
    updateWebsiteContent({
      announcement: contentAnnouncement.trim(),
      announcementEnabled: enabled
    });
    showToast(
      enabled
        ? '✨ Top Festive Banner is now ENABLED on customer storefront.'
        : 'Top Festive Banner is now HIDDEN from customer storefront.',
      enabled ? 'success' : 'info'
    );
  };

  // Filtered Orders for Orders Table
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all') {
      const ordSt = (o.orderStatus || '').toLowerCase();
      const filterSt = orderStatusFilter.toLowerCase();
      if (filterSt === 'pending') {
        if (!ordSt.includes('pend') && !ordSt.includes('placed')) return false;
      } else if (!ordSt.includes(filterSt)) {
        return false;
      }
    }
    if (orderSearchQuery) {
      const q = orderSearchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Customers for Customer Details CRM tab
  const filteredCustomersList = (customers || []).filter((c) => {
    if (!customerSearchQuery) return true;
    const q = customerSearchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q)
    );
  });

  // Filtered Products for Products Table
  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter && p.category !== productCategoryFilter) return false;
    if (productSearch) {
      const q = productSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Reviews for Admin Moderation Table
  const filteredAdminReviews = reviews.filter((rev) => {
    if (reviewStatusFilter !== 'all' && rev.status !== reviewStatusFilter) {
      return false;
    }
    if (reviewRatingFilter !== 'all' && rev.rating !== reviewRatingFilter) {
      return false;
    }
    if (reviewProductFilter !== 'all' && rev.productId !== reviewProductFilter) {
      return false;
    }
    if (reviewSearchQuery.trim()) {
      const q = reviewSearchQuery.toLowerCase();
      const matchAuthor = (rev.authorName || '').toLowerCase().includes(q);
      const matchEmail = (rev.authorEmail || '').toLowerCase().includes(q);
      const matchCity = (rev.authorCity || '').toLowerCase().includes(q);
      const matchHeadline = (rev.headline || '').toLowerCase().includes(q);
      const matchComment = (rev.comment || '').toLowerCase().includes(q);
      const prod = products.find((p) => p.id === rev.productId);
      const matchProduct = prod ? prod.name.toLowerCase().includes(q) : false;
      return matchAuthor || matchEmail || matchCity || matchHeadline || matchComment || matchProduct;
    }
    return true;
  });

  const totalReviewsCount = reviews.length;
  const publishedReviewsCount = reviews.filter((r) => r.status === 'published').length;
  const pendingReviewsCount = reviews.filter((r) => r.status === 'pending').length;
  const flaggedReviewsCount = reviews.filter((r) => r.status === 'flagged').length;
  const attentionQueueCount = pendingReviewsCount + flaggedReviewsCount;
  const avgShowroomRating =
    publishedReviewsCount > 0
      ? reviews
        .filter((r) => r.status === 'published')
        .reduce((acc, r) => acc + r.rating, 0) / publishedReviewsCount
      : 5.0;
  const fiveStarReviewsCount = reviews.filter((r) => r.rating === 5).length;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col md:flex-row">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Dedicated Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 lg:w-72 bg-stone-950 border-r border-stone-800 flex flex-col z-50 transition-transform duration-200 shrink-0 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-base shadow">
              CP
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm tracking-wide font-serif-luxury">CP Furniture</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  /admin
                </span>
              </div>
              <p className="text-[11px] text-stone-400">Showroom Control Panel</p>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Distinct Back to Customer Storefront Button */}
        <div className="p-4 border-b border-stone-800/80 bg-stone-900/30">
          <button
            id="admin-sidebar-back-to-store-btn"
            onClick={() => {
              setCurrentView('home');
              window.history.pushState(null, '', '#/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-between border border-stone-700 transition-all cursor-pointer group shadow-sm"
            title="Exit Admin Panel and Return to Customer Storefront (/)"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Customer Store</span>
            </div>
            <span className="text-[10px] bg-stone-950 text-stone-400 px-1.5 py-0.5 rounded font-mono border border-stone-800">
              /
            </span>
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-3 mb-2">
              Navigation Menu
            </div>
            <nav className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
                { id: 'analytics', label: 'Showroom Analytics', icon: BarChart3 },
                { id: 'products', label: 'Products Catalog', icon: Package, count: products.length },
                { id: 'categories', label: 'Categories Taxonomy', icon: FolderTree, count: categories.length },
                { id: 'orders', label: 'Customer Orders', icon: ShoppingBag, count: orders.length },
                {
                  id: 'reviews',
                  label: 'Customer Reviews',
                  icon: Star,
                  count: reviews.length,
                  alert: reviews.filter(r => r.status === 'pending' || r.status === 'flagged').length > 0
                },
                { id: 'inventory', label: 'Inventory & Alerts', icon: Boxes, count: lowStockProducts.length, alert: lowStockProducts.length > 0 },
                { id: 'coupons', label: 'Discount Coupons', icon: Tag, count: coupons.length },
                { id: 'content', label: 'Site Content & Banners', icon: Settings, count: websiteContent.showrooms?.length || 0 },
                { id: 'billing', label: 'Bill & Invoice Settings', icon: FileText },
                { id: 'security', label: 'Admin Security', icon: ShieldCheck }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isActive
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-stone-900'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${isActive
                          ? 'bg-stone-950 text-amber-400'
                          : item.alert
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-stone-800 text-stone-400'
                          }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer: Admin Profile & Logout */}
        <div className="p-4 border-t border-stone-800 bg-stone-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-stone-800 text-amber-400 border border-stone-700 flex items-center justify-center font-bold text-xs shrink-0">
                {adminUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-200 truncate">{adminUser.name}</p>
                <p className="text-[10px] text-stone-500 truncate">{adminUser.email}</p>
              </div>
            </div>
            <button
              id="admin-sidebar-logout-btn"
              onClick={() => {
                logoutAdmin();
                showToast('Admin session logged out.', 'info');
              }}
              className="p-2 text-stone-400 hover:text-red-400 hover:bg-stone-900 rounded-lg transition-colors cursor-pointer"
              title="Logout of Admin Panel"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-stone-900 overflow-y-auto">
        {/* Top Header inside Admin Area */}
        <header className="sticky top-0 z-30 bg-stone-950/90 backdrop-blur-md border-b border-stone-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 text-stone-300 hover:text-white rounded-xl bg-stone-900 border border-stone-800 cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span>Admin Console</span>
                <ChevronRight className="w-3 h-3 text-stone-600" />
                <span className="text-amber-400 font-bold capitalize">{activeTab}</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                {activeTab === 'dashboard' && 'Showroom Executive Overview'}
                {activeTab === 'analytics' && 'Showroom Financial Analytics & Intelligence'}
                {activeTab === 'products' && 'Product Catalog & Inventory'}
                {activeTab === 'categories' && 'Department Taxonomy'}
                {activeTab === 'orders' && 'Customer Orders & Invoicing'}
                {activeTab === 'reviews' && 'Customer Reviews & Ratings Moderation Queue'}
                {activeTab === 'inventory' && 'Stock Alerts & Warehousing'}
                {activeTab === 'coupons' && 'Promotions & Discount Codes'}
                {activeTab === 'content' && 'Storefront Content Management'}
                {activeTab === 'billing' && 'Billing, Tax Invoices & Order Fulfillment Controls'}
                {activeTab === 'security' && 'Admin Account Security & Credentials'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="admin-topbar-back-store-btn"
              onClick={() => {
                setCurrentView('home');
                window.history.pushState(null, '', '#/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow cursor-pointer"
              title="Exit Admin Panel and Return to Customer Storefront (/)"
            >
              <Store className="w-3.5 h-3.5 text-stone-950" />
              <span className="hidden sm:inline">Back to Customer Store</span>
              <span className="sm:hidden">Store</span>
              <span className="text-[10px] bg-black/20 text-stone-950 px-1.5 py-0.5 rounded font-mono font-normal">/</span>
            </button>

            <button
              id="admin-topbar-logout-btn"
              onClick={() => {
                logoutAdmin();
                showToast('Admin session logged out.', 'info');
              }}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-stone-900 hover:bg-red-950/60 text-stone-400 hover:text-red-300 border border-stone-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Admin Body Content Container */}
        <div className="p-4 sm:p-8 space-y-8 max-w-7xl w-full">

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Executive Analytics & Visual Sales Summary */}
              <AdminAnalytics
                orders={orders}
                products={products}
                categories={categories}
                onNavigateToOrders={(statusFilter) => {
                  if (statusFilter) setOrderStatusFilter(statusFilter);
                  setActiveTab('orders');
                }}
                onNavigateToProducts={() => setActiveTab('products')}
              />

              {/* Recent Orders & Quick Alerts Split (Themed in Dark/Gold CP Furniture Palette) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recent Orders Table (8 cols) */}
                <div className="lg:col-span-8 bg-stone-900/90 rounded-3xl border border-stone-800 p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base font-serif-luxury text-white">
                        Recent Showroom Orders
                      </h3>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Live stream of newly placed customer checkout reservations.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                    >
                      <span>View All Orders</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-stone-800 text-stone-400 uppercase text-[10px]">
                          <th className="py-2.5">Order ID</th>
                          <th className="py-2.5">Customer</th>
                          <th className="py-2.5">Total</th>
                          <th className="py-2.5">Status</th>
                          <th className="py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/60">
                        {orders.slice(0, 5).map((ord) => (
                          <tr key={ord.id} className="hover:bg-stone-800/40 transition-colors">
                            <td className="py-3 font-mono font-bold text-amber-400">{ord.id}</td>
                            <td className="py-3">
                              <p className="font-bold text-stone-200">{ord.customerName}</p>
                              <p className="text-[10px] text-stone-400">{ord.orderDate || ord.date || 'Recent'}</p>
                            </td>
                            <td className="py-3 font-bold text-white font-mono">
                              ₹{(ord.total ?? ord.grandTotal ?? 0).toLocaleString()}
                            </td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${(ord.orderStatus || '').toLowerCase() === 'delivered'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : (ord.orderStatus || '').toLowerCase() === 'shipped'
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : (ord.orderStatus || '').toLowerCase() === 'cancelled'
                                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                      : (ord.orderStatus || '').toLowerCase() === 'confirmed'
                                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  }`}
                              >
                                {(ord.orderStatus || 'Pending').replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => printOrderInvoice(ord.id)}
                                  className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-300 hover:text-amber-400 transition-colors"
                                  title="Print Bill"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedOrderId(ord.id);
                                    setCurrentView('invoice');
                                  }}
                                  className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-300 hover:text-amber-400 transition-colors"
                                  title="View Tax Invoice"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Low Stock Watchlist (4 cols) */}
                <div className="lg:col-span-4 bg-stone-900/90 rounded-3xl border border-stone-800 p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base font-serif-luxury text-white">
                        Low Stock Watchlist
                      </h3>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Warehouse restock thresholds.
                      </p>
                    </div>
                    <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold px-2 py-0.5 rounded-full font-mono">
                      {lowStockProducts.length} Items
                    </span>
                  </div>

                  <div className="space-y-3">
                    {lowStockProducts.slice(0, 4).map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-xs p-3 bg-stone-950 rounded-2xl border border-stone-800/80">
                        <div className="truncate mr-2">
                          <p className="font-bold text-stone-200 truncate">{p.name}</p>
                          <p className="text-[10px] text-stone-400 font-mono">{p.sku}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-rose-400 font-bold font-mono block">{p.stock} left</span>
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold underline mt-0.5 inline-block"
                          >
                            Add Stock
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity Log Section (Curated luxury card) */}
              <div className="bg-stone-900/90 rounded-3xl border border-stone-800 p-6 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-amber-400 animate-pulse" />
                      <h3 className="font-bold text-base font-serif-luxury text-white">
                        Showroom Backoffice Activity Log
                      </h3>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Real-time audit trails of catalog operations, taxonomy updates, promotional campaigns, and website alteration events.
                    </p>
                  </div>

                  {adminActivityLogs.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear the recent activity logs?')) {
                          clearAdminActivityLogs();
                          showToast('Activity logs cleared.', 'info');
                        }
                      }}
                      className="text-xs bg-stone-950 hover:bg-red-950/40 text-stone-400 hover:text-red-400 border border-stone-800 rounded-xl px-4 py-2 transition-all font-bold cursor-pointer self-start sm:self-auto"
                    >
                      Clear Log History
                    </button>
                  )}
                </div>

                {adminActivityLogs.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-stone-800 rounded-2xl bg-stone-950/40">
                    <Clock className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                    <p className="text-stone-400 text-xs font-bold">No Recent Activity Recorded</p>
                    <p className="text-stone-500 text-[11px] mt-0.5">Major backoffice actions will propagate here automatically.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-800/40 max-h-[380px] overflow-y-auto pr-1.5 scroll-smooth no-scrollbar">
                    {adminActivityLogs.map((log) => {
                      let categoryColor = 'bg-stone-800 text-stone-300';
                      let iconElement = <Clock className="w-4 h-4 text-amber-400" />;

                      if (log.category === 'product') {
                        categoryColor = 'bg-amber-950/60 text-amber-400 border border-amber-500/20';
                        iconElement = <Package className="w-4 h-4 text-amber-400" />;
                      } else if (log.category === 'banner') {
                        categoryColor = 'bg-sky-950/60 text-sky-400 border border-sky-500/20';
                        iconElement = <Sparkles className="w-4 h-4 text-sky-400" />;
                      } else if (log.category === 'category') {
                        categoryColor = 'bg-purple-950/60 text-purple-400 border border-purple-500/20';
                        iconElement = <Layers className="w-4 h-4 text-purple-400" />;
                      } else if (log.category === 'coupon') {
                        categoryColor = 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20';
                        iconElement = <Tag className="w-4 h-4 text-emerald-400" />;
                      } else if (log.category === 'security') {
                        categoryColor = 'bg-red-950/60 text-red-400 border border-red-500/20';
                        iconElement = <Lock className="w-4 h-4 text-red-400" />;
                      } else if (log.category === 'order') {
                        categoryColor = 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/20';
                        iconElement = <ShoppingBag className="w-4 h-4 text-indigo-400" />;
                      } else if (log.category === 'billing') {
                        categoryColor = 'bg-amber-950/60 text-amber-300 border border-amber-500/25';
                        iconElement = <FileText className="w-4 h-4 text-amber-300" />;
                      }

                      return (
                        <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs group hover:bg-stone-800/20 px-2 rounded-xl transition-colors">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="p-2 bg-stone-950 rounded-xl border border-stone-800/80 group-hover:border-amber-500/30 transition-colors flex-shrink-0">
                              {iconElement}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-stone-200">{log.action}</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${categoryColor}`}>
                                  {log.category}
                                </span>
                              </div>
                              <p className="text-stone-400 mt-1 text-[11px] leading-relaxed break-words">{log.details}</p>
                              <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-stone-500">
                                <Clock className="w-3 h-3 text-stone-600" />
                                <span>{log.date}</span>
                                <span>&bull;</span>
                                <span>By: {log.adminEmail}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1.5: DEDICATED SHOWROOM ANALYTICS DEEP DIVE */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <AdminAnalytics
                orders={orders}
                products={products}
                categories={categories}
                standaloneView={true}
                onNavigateToOrders={(statusFilter) => {
                  if (statusFilter) setOrderStatusFilter(statusFilter);
                  setActiveTab('orders');
                }}
                onNavigateToProducts={() => setActiveTab('products')}
              />
            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-serif-luxury text-stone-900">
                    Showroom Furniture Catalog ({filteredProducts.length})
                  </h2>
                  <p className="text-xs text-stone-500">
                    Manage dimensions, woods, upholstery finishes, and inventory thresholds.
                  </p>
                </div>

                <button
                  id="admin-add-product-btn"
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-amber-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Furniture Piece</span>
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search catalog by name, SKU, or timber type..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800 cursor-pointer"
                >
                  <option value="" className="bg-white text-stone-900 font-medium">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name} className="bg-white text-stone-900 font-medium">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px]">
                      <th className="py-3">Piece</th>
                      <th className="py-3">Category</th>
                      <th className="py-3">Material</th>
                      <th className="py-3">Sale Price</th>
                      <th className="py-3">Stock</th>
                      <th className="py-3">Badges</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-12 h-12 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="truncate max-w-xs">
                              <p className="font-bold text-stone-900 truncate">{p.name}</p>
                              <span className="text-[10px] font-mono text-stone-400">{p.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-stone-600">{p.category}</td>
                        <td className="py-3 text-stone-600 truncate max-w-[140px]">{p.material}</td>
                        <td className="py-3">
                          <span className="font-bold text-stone-900">₹{p.salePrice.toLocaleString()}</span>
                          {p.discount > 0 && (
                            <span className="text-[10px] text-stone-400 line-through block">
                              ₹{p.price.toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <span
                            className={`font-bold ${p.stock <= p.lowStockLimit ? 'text-red-600' : 'text-emerald-700'
                              }`}
                          >
                            {p.stock} units
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1 flex-wrap">
                            {p.isBestSeller && (
                              <span className="bg-stone-900 text-amber-300 text-[9px] px-1.5 py-0.5 rounded">
                                Best
                              </span>
                            )}
                            {p.isNewArrival && (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded">
                                New
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 hover:bg-stone-200 rounded text-stone-600"
                            title="Edit piece"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${p.name} from catalog?`)) {
                                deleteProduct(p.id);
                                showToast('Product removed from catalog.', 'info');
                              }
                            }}
                            className="p-1.5 hover:bg-red-100 rounded text-red-600"
                            title="Delete piece"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORY & TAXONOMY MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="bg-stone-900/95 rounded-3xl border border-stone-800 p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Taxonomy Engine
                    </span>
                    <span className="text-stone-500 text-xs">•</span>
                    <span className="text-stone-400 text-xs">Dynamic Shop Filters & Navigation</span>
                  </div>
                  <h2 className="text-xl font-bold font-serif-luxury text-white">
                    Showroom Space Categories & Subcategories ({categories.length})
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    Manage luxury department groupings, rename subcategories with auto-syncing to product filters and search tags.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setCatFormName('');
                    setCatFormDesc('');
                    setCatFormImage('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80');
                    setCatFormSubcategories('Standard Pieces, Luxury Variants');
                    setShowCategoryModal(true);
                  }}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-stone-950" />
                  <span>Add Department Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((c) => {
                  const productCount = products.filter(
                    (p) => p.category.toLowerCase() === c.name.toLowerCase() || p.category === c.name
                  ).length;

                  return (
                    <div
                      key={c.id}
                      className="p-5 rounded-2xl border border-stone-800 bg-stone-950/80 hover:border-stone-700 transition-all flex flex-col justify-between space-y-4 shadow-lg group/card"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-white text-base font-serif-luxury tracking-wide">
                              {c.name}
                            </h3>
                            <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">{c.description}</p>
                          </div>
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono font-bold whitespace-nowrap">
                            {productCount} items
                          </span>
                        </div>

                        {/* SUBCATEGORIES TAXONOMY SECTION */}
                        <div className="pt-3 border-t border-stone-800/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                              <FolderTree className="w-3 h-3 text-amber-400" />
                              Subcategories ({c.subcategories.length}):
                            </span>
                            <span className="text-[10px] text-stone-500">Click &times; to remove</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
                            {c.subcategories.map((sub) => {
                              const isEditing =
                                editingSubcategory?.categoryId === c.id && editingSubcategory?.oldName === sub;
                              const subProductCount = products.filter(
                                (p) =>
                                  (p.category.toLowerCase() === c.name.toLowerCase() || p.category === c.name) &&
                                  p.subcategory === sub
                              ).length;

                              if (isEditing) {
                                return (
                                  <form
                                    key={sub}
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      if (editingSubcategory.currentName.trim()) {
                                        renameSubcategory(c.id, sub, editingSubcategory.currentName.trim());
                                      }
                                      setEditingSubcategory(null);
                                    }}
                                    className="inline-flex items-center gap-1 bg-stone-900 border-2 border-amber-400 rounded-xl px-2 py-1 shadow-lg ring-2 ring-amber-400/20"
                                  >
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editingSubcategory.currentName}
                                      onChange={(e) =>
                                        setEditingSubcategory({
                                          ...editingSubcategory,
                                          currentName: e.target.value
                                        })
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === 'Escape') setEditingSubcategory(null);
                                      }}
                                      className="bg-transparent text-amber-200 text-xs font-semibold focus:outline-none w-28 placeholder-stone-600"
                                      placeholder="Subcategory..."
                                    />
                                    <button
                                      type="submit"
                                      className="p-1 hover:bg-emerald-500/20 rounded text-emerald-400 transition-colors cursor-pointer"
                                      title="Save subcategory name"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingSubcategory(null)}
                                      className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
                                      title="Cancel editing"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </form>
                                );
                              }

                              return (
                                <div
                                  key={sub}
                                  className="group inline-flex items-center gap-1.5 bg-stone-900 text-stone-200 border border-stone-700/70 hover:border-amber-500/70 px-2.5 py-1 rounded-xl text-xs transition-all shadow-sm"
                                >
                                  <span className="font-medium text-stone-200 group-hover:text-amber-300 transition-colors">
                                    {sub}
                                  </span>
                                  {subProductCount > 0 && (
                                    <span
                                      className="text-[9px] font-mono font-semibold bg-stone-800 text-stone-400 px-1.5 py-0.2 rounded group-hover:bg-amber-500/20 group-hover:text-amber-300 transition-colors"
                                      title={`${subProductCount} furniture item(s)`}
                                    >
                                      {subProductCount}
                                    </span>
                                  )}

                                  {/* Edit & Delete Action Buttons */}
                                  <div className="flex items-center gap-0.5 ml-0.5 opacity-90 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditingSubcategory({
                                          categoryId: c.id,
                                          oldName: sub,
                                          currentName: sub
                                        })
                                      }
                                      className="p-1 hover:bg-amber-500/20 rounded-md text-stone-400 hover:text-amber-400 transition-colors cursor-pointer"
                                      title={`Edit "${sub}" name`}
                                    >
                                      <Edit2 className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSubcategoryToDelete({
                                          categoryId: c.id,
                                          categoryName: c.name,
                                          subcategoryName: sub,
                                          affectedProductsCount: subProductCount
                                        });
                                      }}
                                      className="p-1 hover:bg-rose-500/30 rounded-md text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                                      title={`Remove "${sub}"`}
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Inline Add Subcategory input or trigger */}
                            {addingSubcategoryCatId === c.id ? (
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const trimmed = newSubcategoryText.trim();
                                  if (trimmed && !c.subcategories.includes(trimmed)) {
                                    updateCategory({
                                      ...c,
                                      subcategories: [...c.subcategories, trimmed]
                                    });
                                    showToast(`Added subcategory "${trimmed}" to ${c.name}.`, 'success');
                                    setNewSubcategoryText('');
                                    setAddingSubcategoryCatId(null);
                                  }
                                }}
                                className="inline-flex items-center gap-1 bg-stone-900 border border-amber-500/80 rounded-xl px-2 py-1 shadow-md"
                              >
                                <input
                                  type="text"
                                  autoFocus
                                  value={newSubcategoryText}
                                  onChange={(e) => setNewSubcategoryText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                      setAddingSubcategoryCatId(null);
                                      setNewSubcategoryText('');
                                    }
                                  }}
                                  placeholder="New subcategory..."
                                  className="bg-transparent text-amber-200 text-xs font-medium focus:outline-none w-28 placeholder-stone-500"
                                />
                                <button
                                  type="submit"
                                  className="p-1 hover:bg-emerald-500/20 rounded text-emerald-400 transition-colors cursor-pointer"
                                  title="Add subcategory"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAddingSubcategoryCatId(null);
                                    setNewSubcategoryText('');
                                  }}
                                  className="p-1 hover:bg-stone-800 rounded text-stone-400 transition-colors cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </form>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setAddingSubcategoryCatId(c.id);
                                  setNewSubcategoryText('');
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400/90 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-1 rounded-xl transition-all cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(c);
                            setCatFormName(c.name);
                            setCatFormDesc(c.description || '');
                            setCatFormImage(c.image || '');
                            setCatFormSubcategories(c.subcategories.join(', '));
                            setShowCategoryModal(true);
                          }}
                          className="text-xs font-semibold text-stone-400 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit Category</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryToDelete(c)}
                          className="text-xs font-semibold text-rose-400/80 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ORDER MANAGEMENT & STATUS STEPS */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6">

              {/* Luxury gold-accented Sub-tab Switcher */}
              <div className="flex border-b border-stone-100 pb-3 justify-between items-center flex-wrap gap-4">
                <div className="flex gap-6">
                  <button
                    type="button"
                    id="orders-subtab-list"
                    onClick={() => setOrdersSubTab('orders_list')}
                    className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${ordersSubTab === 'orders_list'
                      ? 'border-amber-600 text-stone-900 font-bold'
                      : 'border-transparent text-stone-400 hover:text-stone-600'
                      }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Orders Fulfillment Ledger</span>
                  </button>
                  <button
                    type="button"
                    id="orders-subtab-customers"
                    onClick={() => setOrdersSubTab('customer_details')}
                    className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${ordersSubTab === 'customer_details'
                      ? 'border-amber-600 text-stone-900 font-bold'
                      : 'border-transparent text-stone-400 hover:text-stone-600'
                      }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Customer CRM & LTV Directory</span>
                  </button>
                </div>
              </div>

              {ordersSubTab === 'orders_list' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold font-serif-luxury text-stone-900">
                        Order Fulfillment & White-Glove Dispatch ({filteredOrders.length})
                      </h2>
                      <p className="text-xs text-stone-500">
                        Update status to automatically trigger milestone progress and tracking notifications.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { id: 'all', label: 'All Orders' },
                        { id: 'pending', label: 'Pending' },
                        { id: 'confirmed', label: 'Confirmed' },
                        { id: 'processing', label: 'Processing' },
                        { id: 'shipped', label: 'Shipped' },
                        { id: 'delivered', label: 'Delivered' },
                        { id: 'cancelled', label: 'Cancelled' }
                      ].map((st) => (
                        <button
                          key={st.id}
                          onClick={() => setOrderStatusFilter(st.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors flex items-center gap-1.5 ${orderStatusFilter === st.id
                            ? 'bg-stone-900 text-white shadow-sm'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                        >
                          <span>{st.label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${orderStatusFilter === st.id
                              ? 'bg-stone-700 text-stone-200'
                              : 'bg-stone-200 text-stone-700'
                              }`}
                          >
                            {st.id === 'all'
                              ? orders.length
                              : orders.filter((o) => {
                                const s = (o.orderStatus || '').toLowerCase();
                                if (st.id === 'pending') return s.includes('pend') || s.includes('placed');
                                return s.includes(st.id);
                              }).length}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px]">
                          <th className="py-3">Order ID & Date</th>
                          <th className="py-3">Customer Info</th>
                          <th className="py-3">Items Reserved</th>
                          <th className="py-3">Total Payable</th>
                          <th className="py-3">Live Status Step</th>
                          <th className="py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-stone-50">
                            <td className="py-3">
                              <span className="font-mono font-bold text-stone-900 block">
                                {ord.orderNumber ? `#${ord.orderNumber}` : ord.id}
                              </span>
                              <span className="text-[10px] font-mono text-stone-400 block">{ord.id}</span>
                              <span className="text-[10px] text-stone-400">{ord.orderDate || ord.date || 'Recent'}</span>
                            </td>
                            <td className="py-3">
                              <p className="font-bold text-stone-900">{ord.customerName}</p>
                              <p className="text-[10px] text-stone-500">
                                {ord.shippingAddress?.phone || ord.customerPhone || ''}
                              </p>
                              <p className="text-[10px] text-stone-400">
                                {ord.shippingAddress?.city || 'Bengaluru'}, {ord.shippingAddress?.pincode || ''}
                              </p>
                            </td>
                            <td className="py-3">
                              <span className="font-medium text-stone-800">
                                {(ord.items || []).length} {(ord.items || []).length === 1 ? 'item' : 'items'}
                              </span>
                              <span className="text-[10px] text-stone-400 block truncate max-w-[160px]">
                                {ord.items?.[0]?.productName || ord.items?.[0]?.name || ''}
                              </span>
                            </td>
                            <td className="py-3 font-bold font-mono text-amber-950">
                              <div>₹{(ord.total ?? ord.grandTotal ?? 0).toLocaleString()}</div>
                              <span className="text-[10px] text-stone-500 block font-normal capitalize">
                                {ord.paymentMethod}
                              </span>
                              {ord.razorpayPaymentId && (
                                <div className="mt-1">
                                  <span className="text-[9px] font-mono bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded block truncate max-w-[140px]" title={ord.razorpayPaymentId}>
                                    ⚡ {ord.razorpayPaymentId}
                                  </span>
                                  <span className="text-[9px] text-emerald-700 font-semibold block mt-0.5">
                                    Bank Settled (@anandhanchandru)
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="py-3">
                              <div className="space-y-1.5 min-w-[150px]">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${(ord.orderStatus || '').toLowerCase().includes('pend') ||
                                      (ord.orderStatus || '').toLowerCase().includes('placed')
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : (ord.orderStatus || '').toLowerCase().includes('confirm')
                                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                        : (ord.orderStatus || '').toLowerCase().includes('process')
                                          ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                          : (ord.orderStatus || '').toLowerCase().includes('ship')
                                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                            : (ord.orderStatus || '').toLowerCase().includes('deliver')
                                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                              : 'bg-red-100 text-red-900 border border-red-200'
                                      }`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    <span>{ord.orderStatus || 'Pending'}</span>
                                  </span>
                                </div>
                                {/* Interactive Status Selector */}
                                <select
                                  value={ord.orderStatus}
                                  onChange={(e) => {
                                    updateOrderStatus(ord.id, e.target.value as OrderStatus);
                                  }}
                                  className="w-full p-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-900 cursor-pointer shadow-2xs"
                                >
                                  <option value="Pending">Pending (Awaiting Verification)</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Processing">Processing / Crafting</option>
                                  <option value="Shipped">Dispatched via Logistics</option>
                                  <option value="Delivered">Delivered & Assembled</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => printOrderInvoice(ord.id)}
                                  className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold inline-flex items-center gap-1 text-xs"
                                  title="Print Bill"
                                >
                                  <Printer className="w-3 h-3" />
                                  <span>Print</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedOrderId(ord.id);
                                    setCurrentView('invoice');
                                  }}
                                  className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-bold inline-flex items-center gap-1 text-xs"
                                  title="View Full Invoice"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>Invoice</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {ordersSubTab === 'customer_details' && (
                <div className="space-y-6">
                  {/* Action Header & Luxury Export Buttons */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold font-serif-luxury text-stone-900">
                        VIP Client Portfolio & CRM Ledger
                      </h2>
                      <p className="text-xs text-stone-500">
                        Monitor registered luxury accounts, lifetime purchases, and saved physical delivery coordinates.
                      </p>
                    </div>

                    {/* Export Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        id="export-customers-excel"
                        onClick={() => {
                          try {
                            exportCustomersToExcel(customers, orders);
                            showToast('Customer Directory exported to Excel successfully!', 'success');
                            addAdminActivityLog(
                              'Customer CRM Exported',
                              'Downloaded full multi-sheet client purchase ledger in XLSX format',
                              'orders'
                            );
                          } catch (err) {
                            showToast('Failed to export to Excel.', 'error');
                          }
                        }}
                        className="group px-4 py-2.5 bg-stone-900 border border-stone-800 text-amber-400 font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-stone-800 hover:border-amber-600 transition-all shadow-md cursor-pointer"
                        title="Export complete client directory and item-wise purchase history spreadsheet"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-500" />
                        <span>Export Excel Ledger</span>
                      </button>

                      <button
                        type="button"
                        id="export-customers-pdf"
                        onClick={() => {
                          try {
                            exportCustomersToPDF(customers, orders);
                            showToast('Customer PDF Report downloaded successfully!', 'success');
                            addAdminActivityLog(
                              'Customer PDF Report Downloaded',
                              'Generated and downloaded official landscape customer CRM directory PDF',
                              'orders'
                            );
                          } catch (err) {
                            showToast('Failed to export to PDF.', 'error');
                          }
                        }}
                        className="group px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                        title="Download professional printable landscape customer report"
                      >
                        <Download className="w-3.5 h-3.5 text-stone-950" />
                        <span>Download PDF Audit</span>
                      </button>
                    </div>
                  </div>

                  {/* Luxury Analytics Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-500/15 shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Registered VIPs</span>
                        <span className="text-xl font-bold text-stone-900">{customers.length}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center border border-emerald-500/15 shrink-0">
                        <span className="text-lg font-bold">₹</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Lifetime Spent (LTV)</span>
                        <span className="text-xl font-bold text-stone-900">
                          ₹{orders.filter(o => o.orderStatus?.toLowerCase() !== 'cancelled').reduce((sum, o) => sum + (o.grandTotal ?? o.total ?? 0), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center border border-blue-500/15 shrink-0">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Average Order Value</span>
                        <span className="text-xl font-bold text-stone-900">
                          ₹{Math.round(
                            orders.filter(o => o.orderStatus?.toLowerCase() !== 'cancelled').length > 0
                              ? orders.filter(o => o.orderStatus?.toLowerCase() !== 'cancelled').reduce((sum, o) => sum + (o.grandTotal ?? o.total ?? 0), 0) / orders.filter(o => o.orderStatus?.toLowerCase() !== 'cancelled').length
                              : 0
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-stone-400" />
                    </span>
                    <input
                      type="text"
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      placeholder="Search customers by name, email, or telephone number..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
                    />
                  </div>

                  {/* Customers Interactive Directory List */}
                  <div className="space-y-4">
                    {filteredCustomersList.length === 0 ? (
                      <div className="p-12 text-center bg-stone-50 border border-dashed border-stone-200 rounded-2xl">
                        <p className="text-xs text-stone-400 font-semibold">No registered customers match your search criteria.</p>
                      </div>
                    ) : (
                      filteredCustomersList.map((c) => {
                        const cOrders = orders.filter(o => o.customerId === c.id);
                        const successfulCOrders = cOrders.filter(o => o.orderStatus?.toLowerCase() !== 'cancelled');
                        const totalSpent = successfulCOrders.reduce((sum, o) => sum + (o.grandTotal ?? o.total ?? 0), 0);

                        return (
                          <div key={c.id} className="bg-white border border-stone-200 hover:border-amber-500/40 rounded-2xl p-5 shadow-sm transition-all text-left space-y-4">

                            {/* Top Row: Basic Info & Stats */}
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                              <div className="flex items-center gap-3">
                                {/* Avatar Initials */}
                                <div className="w-10 h-10 rounded-full bg-stone-900 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                                  {(c.name || 'VIP').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-stone-900 text-sm">{c.name}</h3>
                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/45 rounded text-[9px] font-bold uppercase tracking-wider">
                                      VIP Gold Member
                                    </span>
                                  </div>
                                  <p className="text-stone-500 text-xs">{c.email} &bull; {c.phone || 'No phone updated'}</p>
                                </div>
                              </div>

                              {/* Summary Metrics */}
                              <div className="flex flex-wrap items-center gap-4 text-xs">
                                <div className="bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-100 text-center min-w-[80px]">
                                  <span className="text-[9px] text-stone-400 uppercase tracking-wide block">Total Spent</span>
                                  <span className="font-bold text-amber-800 font-mono">₹{totalSpent.toLocaleString()}</span>
                                </div>
                                <div className="bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-100 text-center min-w-[70px]">
                                  <span className="text-[9px] text-stone-400 uppercase tracking-wide block">Orders Placed</span>
                                  <span className="font-bold text-stone-800">{cOrders.length}</span>
                                </div>
                                <div className="bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-100 text-center min-w-[120px]">
                                  <span className="text-[9px] text-stone-400 uppercase tracking-wide block">Active Since</span>
                                  <span className="font-bold text-stone-700 flex items-center justify-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                    {new Date(c.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Middle Section: Saved Delivery Addresses & Date-wise Orders */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs">

                              {/* Left: Saved Addresses (4 columns) */}
                              <div className="md:col-span-4 space-y-2">
                                <h4 className="font-bold text-stone-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                                  <span>Saved Physical Addresses</span>
                                </h4>

                                {(c.addresses || []).length === 0 ? (
                                  <p className="text-stone-400 italic text-xs">No addresses saved to profile.</p>
                                ) : (
                                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                                    {(c.addresses || []).map((addr) => (
                                      <div key={addr.id} className="p-2.5 bg-stone-50 border border-stone-100 rounded-xl space-y-1">
                                        <div className="flex items-center justify-between font-bold text-stone-800 text-[11px]">
                                          <span>{addr.name}</span>
                                          <span className="px-1.5 py-0.2 bg-stone-200 text-stone-700 text-[9px] rounded uppercase font-bold">
                                            {addr.type || 'Home'}
                                          </span>
                                        </div>
                                        <p className="text-stone-500 leading-snug">{addr.street}</p>
                                        <p className="text-stone-400 text-[10px]">{addr.landmark ? `${addr.landmark}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}</p>
                                        <p className="text-stone-400 text-[10px] font-semibold">Phone: {addr.phone}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Right: Purchased Products History Date-wise (8 columns) */}
                              <div className="md:col-span-8 space-y-2">
                                <h4 className="font-bold text-stone-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                                  <ShoppingBag className="w-3.5 h-3.5 text-stone-400" />
                                  <span>Date-wise Purchase History Ledger</span>
                                </h4>

                                {cOrders.length === 0 ? (
                                  <p className="text-stone-400 italic text-xs">This VIP customer hasn't purchased any items yet.</p>
                                ) : (
                                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                                    {cOrders.map((ord) => (
                                      <div key={ord.id} className="p-3 bg-stone-50 hover:bg-amber-50/10 border border-stone-100 rounded-xl space-y-2">
                                        <div className="flex items-center justify-between flex-wrap gap-2 text-[11px]">
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold font-mono text-stone-900">
                                              {ord.orderNumber ? `#${ord.orderNumber}` : ord.id}
                                            </span>
                                            <span className="text-stone-400">
                                              {new Date(ord.orderDate || ord.date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${ord.orderStatus?.toLowerCase().includes('deliv')
                                              ? 'bg-emerald-100 text-emerald-800'
                                              : ord.orderStatus?.toLowerCase().includes('canc')
                                                ? 'bg-rose-100 text-rose-800'
                                                : 'bg-amber-100 text-amber-800'
                                              }`}>
                                              {ord.orderStatus || 'Pending'}
                                            </span>
                                            <span className="font-mono font-bold text-amber-900">
                                              ₹{(ord.grandTotal ?? ord.total ?? 0).toLocaleString()}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="space-y-1 pl-2 border-l border-stone-200">
                                          {(ord.items || []).map((it, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-[10px] text-stone-600">
                                              <span className="truncate max-w-[250px]">
                                                <span className="font-semibold">{it.productName || it.name}</span>{' '}
                                                <span className="text-stone-400 font-mono font-bold text-[9px]">({it.sku})</span>
                                              </span>
                                              <span className="font-mono text-stone-500">
                                                {it.quantity} x ₹{it.price.toLocaleString()} = <span className="font-bold text-stone-700">₹{(it.quantity * it.price).toLocaleString()}</span>
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: CUSTOMER REVIEWS & RATINGS MODERATION */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      Storefront Reputation & Trust
                    </span>
                    <span className="text-xs text-stone-400 font-mono">CP-MODERATION-v2</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-stone-900">
                    Customer Reviews & Ratings Moderation ({filteredAdminReviews.length})
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Audit homeowner ratings, approve authentic verified feedback, flag spam or inappropriate submissions, and maintain catalog excellence.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setCurrentView('home');
                      window.history.pushState(null, '', '#/');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Store className="w-3.5 h-3.5 text-amber-800" />
                    <span>View on Storefront</span>
                  </button>
                </div>
              </div>

              {/* Top KPI Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1: Total Reviews */}
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Reviews</span>
                    <MessageSquare className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-stone-900 font-mono">
                      {totalReviewsCount}
                    </span>
                    <span className="text-xs text-stone-500">across catalog</span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    <strong className="text-stone-800">{publishedReviewsCount}</strong> live on storefront
                  </p>
                </div>

                {/* KPI 2: Storewide Average Rating */}
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Catalog Rating</span>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-stone-900 font-serif-luxury">
                      {avgShowroomRating.toFixed(1)}
                    </span>
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= Math.round(avgShowroomRating) ? 'fill-current' : 'text-stone-300'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    <strong className="text-stone-800">{fiveStarReviewsCount}</strong> perfect 5-star ratings ({totalReviewsCount > 0 ? Math.round((fiveStarReviewsCount / totalReviewsCount) * 100) : 0}%)
                  </p>
                </div>

                {/* KPI 3: Verified Homeowner Reviews */}
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Verified Buyers</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-stone-900 font-mono">
                      {reviews.filter((r) => r.verified).length}
                    </span>
                    <span className="text-xs text-stone-500">purchasers</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    100% matched to verified invoice records
                  </p>
                </div>

                {/* KPI 4: Moderation Queue */}
                <div
                  className={`p-5 rounded-2xl border space-y-2 transition-colors ${attentionQueueCount > 0
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : 'bg-stone-50 border-stone-200'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Attention Queue</span>
                    <AlertTriangle className={`w-4 h-4 ${attentionQueueCount > 0 ? 'text-amber-600' : 'text-stone-400'}`} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl sm:text-3xl font-black font-mono ${attentionQueueCount > 0 ? 'text-amber-900' : 'text-stone-900'}`}>
                      {attentionQueueCount}
                    </span>
                    <span className="text-xs text-stone-500">needs audit</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-amber-800 font-semibold">{pendingReviewsCount} pending</span>
                    <span className="text-stone-300">&bull;</span>
                    <span className="text-rose-700 font-semibold">{flaggedReviewsCount} flagged</span>
                  </div>
                </div>
              </div>

              {/* Status Tabs Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: 'All Reviews', count: totalReviewsCount },
                    { id: 'published', label: 'Published', count: publishedReviewsCount },
                    { id: 'pending', label: 'Pending Moderation', count: pendingReviewsCount },
                    { id: 'flagged', label: 'Flagged / Hidden', count: flaggedReviewsCount }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setReviewStatusFilter(st.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${reviewStatusFilter === st.id
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                    >
                      <span>{st.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${reviewStatusFilter === st.id
                          ? 'bg-amber-500 text-stone-950'
                          : 'bg-stone-200 text-stone-700'
                          }`}
                      >
                        {st.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Rating Quick Filter Buttons */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-stone-400 font-semibold mr-1">Rating:</span>
                  <button
                    onClick={() => setReviewRatingFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${reviewRatingFilter === 'all'
                      ? 'bg-amber-800 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                  >
                    All
                  </button>
                  {[5, 4, 3, 2, 1].map((s) => (
                    <button
                      key={s}
                      onClick={() => setReviewRatingFilter(s)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-0.5 ${reviewRatingFilter === s
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                    >
                      <span>{s}</span>
                      <Star className="w-3 h-3 fill-current text-amber-500" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Search and Product Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                {/* Search Input */}
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={reviewSearchQuery}
                    onChange={(e) => setReviewSearchQuery(e.target.value)}
                    placeholder="Search by customer name, email, city, headline, or product..."
                    className="w-full pl-9 pr-8 py-2 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800"
                  />
                  {reviewSearchQuery && (
                    <button
                      onClick={() => setReviewSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Product Selector Filter */}
                <div className="sm:col-span-4">
                  <select
                    value={reviewProductFilter}
                    onChange={(e) => setReviewProductFilter(e.target.value)}
                    className="w-full py-2 px-3 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800 cursor-pointer"
                  >
                    <option value="all" className="bg-white text-stone-900 font-medium">All Catalog Furniture Pieces ({products.length})</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id} className="bg-white text-stone-900 font-medium">
                        {p.name} (SKU: {p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reset Filters */}
                <div className="sm:col-span-2 flex items-center justify-end">
                  {(reviewStatusFilter !== 'all' ||
                    reviewRatingFilter !== 'all' ||
                    reviewProductFilter !== 'all' ||
                    reviewSearchQuery) && (
                      <button
                        onClick={() => {
                          setReviewStatusFilter('all');
                          setReviewRatingFilter('all');
                          setReviewProductFilter('all');
                          setReviewSearchQuery('');
                        }}
                        className="w-full py-2 px-3 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset Filters</span>
                      </button>
                    )}
                </div>
              </div>

              {/* Reviews Moderation List */}
              {filteredAdminReviews.length === 0 ? (
                <div className="text-center py-16 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <Star className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-stone-900 text-base font-serif-luxury">
                    No Customer Reviews Match Current Filter Criteria
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Try switching the status filter, selecting all ratings, or clearing your search term.
                  </p>
                  <button
                    onClick={() => {
                      setReviewStatusFilter('all');
                      setReviewRatingFilter('all');
                      setReviewProductFilter('all');
                      setReviewSearchQuery('');
                    }}
                    className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-amber-900 transition-colors"
                  >
                    Show All Reviews
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAdminReviews.map((rev) => {
                    const prod = products.find((p) => p.id === rev.productId);
                    const isEditingNotes = editingNotesReviewId === rev.id;

                    return (
                      <div
                        key={rev.id}
                        className="p-5 sm:p-6 bg-white rounded-2xl border border-stone-200 shadow-xs hover:border-amber-300 transition-all space-y-4"
                      >
                        {/* Top Row: Product Details & Status Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                          {/* Product Preview */}
                          <div className="flex items-center gap-3">
                            <img
                              src={prod?.images[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300'}
                              alt={prod?.name || 'Product'}
                              className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-mono">
                                  {prod?.category || 'Furniture'}
                                </span>
                                <span className="text-[11px] text-stone-400 font-mono">
                                  SKU: {prod?.sku || 'CP-WOOD'}
                                </span>
                              </div>
                              <h4 className="font-bold text-stone-900 text-sm font-serif-luxury mt-0.5">
                                {prod?.name || 'CP Furniture Piece'}
                              </h4>
                              {prod && (
                                <button
                                  type="button"
                                  onClick={() => openProductDetail(prod.id)}
                                  className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                                >
                                  <span>View Product Details</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2">
                            {rev.status === 'published' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Published on Store</span>
                              </span>
                            )}
                            {rev.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-full text-xs font-bold animate-pulse">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                <span>Pending Moderation</span>
                              </span>
                            )}
                            {rev.status === 'flagged' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-xs font-bold">
                                <Flag className="w-3.5 h-3.5 text-rose-600" />
                                <span>Flagged / Hidden</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle Row: Rating, Date, Headline & Comments */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="flex text-amber-500">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-4 h-4 ${s <= rev.rating ? 'fill-current text-amber-500' : 'text-stone-300'
                                      }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-bold text-stone-800 font-mono bg-stone-100 px-1.5 py-0.5 rounded">
                                {rev.rating}.0
                              </span>
                              {rev.verified && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Verified Buyer
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-stone-400 font-medium">
                              Submitted on {new Date(rev.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          <h5 className="font-bold text-stone-900 text-sm font-serif-luxury">
                            "{rev.headline}"
                          </h5>

                          <p className="text-xs text-stone-600 leading-relaxed bg-stone-50/70 p-3.5 rounded-xl border border-stone-100">
                            {rev.comment}
                          </p>
                        </div>

                        {/* Customer Info & Helpful Count */}
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 pt-2 border-t border-stone-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-stone-900 text-amber-400 font-bold flex items-center justify-center text-xs">
                              {rev.authorName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong className="text-stone-800">{rev.authorName}</strong>
                              <span className="text-stone-400 ml-1.5 font-mono text-[11px]">
                                ({rev.authorEmail || 'verified@user.com'})
                              </span>
                              <span className="text-stone-300 mx-1">&bull;</span>
                              <span className="text-stone-500">{rev.authorCity || 'Showroom Customer'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-stone-400 text-[11px]">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{rev.helpfulCount || 0} customers found this helpful</span>
                          </div>
                        </div>

                        {/* Admin Moderation Staff Notes */}
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] uppercase tracking-wider text-stone-500 flex items-center gap-1">
                              <FileText className="w-3 h-3 text-stone-400" />
                              Staff Audit Note
                            </span>
                            {!isEditingNotes && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNotesReviewId(rev.id);
                                  setTempAdminNote(rev.adminNotes || '');
                                }}
                                className="text-amber-800 hover:text-amber-900 font-bold text-[11px] flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>{rev.adminNotes ? 'Edit Staff Note' : 'Add Note'}</span>
                              </button>
                            )}
                          </div>

                          {isEditingNotes ? (
                            <div className="space-y-2">
                              <textarea
                                value={tempAdminNote}
                                onChange={(e) => setTempAdminNote(e.target.value)}
                                placeholder="Add internal moderation note (e.g. Verified delivery dispatch date; verified genuine customer query)..."
                                className="w-full p-2.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-none focus:border-amber-800"
                                rows={2}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingNotesReviewId(null)}
                                  className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-semibold"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateCustomerReviewStatus(rev.id, rev.status, tempAdminNote);
                                    setEditingNotesReviewId(null);
                                    showToast('Internal audit note saved.', 'success');
                                  }}
                                  className="px-3 py-1 bg-stone-900 hover:bg-amber-900 text-white rounded-lg text-xs font-bold"
                                >
                                  Save Note
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[11px] text-stone-600 italic">
                              {rev.adminNotes || 'No internal moderation notes recorded for this submission.'}
                            </p>
                          )}
                        </div>

                        {/* Moderation Actions Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div className="flex items-center gap-2">
                            {rev.status !== 'published' && (
                              <button
                                type="button"
                                onClick={() => {
                                  updateCustomerReviewStatus(rev.id, 'published');
                                  showToast(`Review by ${rev.authorName} approved and published to storefront.`, 'success');
                                }}
                                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve & Publish</span>
                              </button>
                            )}

                            {rev.status !== 'flagged' && (
                              <button
                                type="button"
                                onClick={() => {
                                  updateCustomerReviewStatus(rev.id, 'flagged');
                                  showToast(`Review by ${rev.authorName} flagged and hidden from storefront.`, 'info');
                                }}
                                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Flag className="w-3.5 h-3.5 text-amber-700" />
                                <span>Flag & Hide</span>
                              </button>
                            )}

                            {rev.status === 'flagged' && (
                              <button
                                type="button"
                                onClick={() => {
                                  updateCustomerReviewStatus(rev.id, 'pending');
                                  showToast(`Review by ${rev.authorName} moved to pending queue.`, 'info');
                                }}
                                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                              >
                                Move to Pending
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => setDeleteReviewConfirmId(rev.id)}
                            className="px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-rose-200"
                            title="Delete Review Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Review</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MODAL: DELETE REVIEW CONFIRMATION */}
          {deleteReviewConfirmId && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white text-stone-900 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-150">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold font-serif-luxury text-stone-900">
                    Delete Customer Review?
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    This action will permanently delete this review from the CP Furniture database and automatically re-calculate the product's aggregate star rating and verified review count.
                  </p>
                </div>

                {(() => {
                  const revToDelete = reviews.find((r) => r.id === deleteReviewConfirmId);
                  if (!revToDelete) return null;
                  const prod = products.find((p) => p.id === revToDelete.productId);
                  return (
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                      <p className="font-bold text-stone-800">
                        "{revToDelete.headline}"
                      </p>
                      <p className="text-stone-500 text-[11px]">
                        by {revToDelete.authorName} on {prod?.name || 'Product'}
                      </p>
                    </div>
                  );
                })()}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteReviewConfirmId(null)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteCustomerReview(deleteReviewConfirmId);
                      setDeleteReviewConfirmId(null);
                      showToast('Customer review permanently deleted.', 'info');
                    }}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow transition-colors cursor-pointer"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* TAB 5: INVENTORY & WAREHOUSE STOCK TRACKER */}
          {activeTab === 'inventory' && (() => {
            const metrics = computeProductInventoryMetrics(products, inventoryLogs, orders);
            const totalValuation = metrics.reduce((sum, m) => sum + m.valuation, 0);
            const totalUnitsInStock = metrics.reduce((sum, m) => sum + m.product.stock, 0);
            const totalInwardUnits = metrics.reduce((sum, m) => sum + m.totalInward, 0);
            const totalOutwardUnits = metrics.reduce((sum, m) => sum + m.totalOutward, 0);
            const alertCount = metrics.filter((m) => m.statusCode !== 'OK').length;

            // Filter products
            const filteredMetrics = metrics.filter((m) => {
              const p = m.product;
              const matchesSearch =
                !inventorySearch ||
                p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                p.sku.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                p.category.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                (p.subcategory && p.subcategory.toLowerCase().includes(inventorySearch.toLowerCase())) ||
                (p.material && p.material.toLowerCase().includes(inventorySearch.toLowerCase()));

              const matchesCategory =
                inventoryCategoryFilter === 'all' ||
                p.category.toLowerCase() === inventoryCategoryFilter.toLowerCase();

              let matchesStatus = true;
              if (inventoryStatusFilter === 'in_stock') {
                matchesStatus = m.statusCode === 'OK';
              } else if (inventoryStatusFilter === 'low_stock') {
                matchesStatus = m.statusCode === 'LOW';
              } else if (inventoryStatusFilter === 'out_of_stock') {
                matchesStatus = m.statusCode === 'OOS';
              }

              return matchesSearch && matchesCategory && matchesStatus;
            });

            // Combined chronological ledger for inward and outward activity
            const combinedLedger = [
              ...inventoryLogs.map((l) => ({
                id: l.id,
                date: l.date || 'Recent',
                sku: l.sku,
                productName: l.productName,
                type: l.type,
                quantityChange: l.quantityChange,
                previousStock: l.previousStock,
                newStock: l.newStock,
                reason: l.reason,
                isInward: l.quantityChange > 0
              }))
            ];

            // Also incorporate recent order dispatches
            orders.forEach((ord) => {
              ord.items.forEach((item) => {
                const p = products.find((pr) => pr.id === item.productId);
                combinedLedger.push({
                  id: `ord-disp-${ord.id}-${item.productId}`,
                  date: ord.orderDate || ord.date || 'Recent',
                  sku: p?.sku || 'CP-FURN',
                  productName: item.productName || item.name || 'CP Furniture Piece',
                  type: 'Order Fulfillment Dispatch',
                  quantityChange: -item.quantity,
                  previousStock: (p?.stock ?? 0) + item.quantity,
                  newStock: p?.stock ?? 0,
                  reason: `Customer Order #${ord.orderNumber || ord.id} (${ord.customerName} - ${ord.orderStatus})`,
                  isInward: false
                });
              });
            });

            return (
              <div className="space-y-6">
                {/* Top Header & Prominent Luxury Export Buttons */}
                <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-xl relative overflow-hidden">
                  {/* Subtle background glow */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-mono">
                          Showroom & Central Warehouse Operations
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          Live Audited
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black font-serif-luxury text-white">
                        Inventory, Purchasing & Alerts Management
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl leading-relaxed">
                        Real-time stock valuation, factory timber batch inward receipts, customer order dispatch deductions, and automated low-threshold warnings.
                      </p>
                    </div>

                    {/* PROMINENT EXPORT BUTTONS matching Luxury Dark/Gold Aesthetic */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Download Excel (XLSX) Button */}
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            setIsExportingExcel(true);
                            exportInventoryToExcel(products, categories, inventoryLogs, orders);
                            showToast('Inventory Excel Report (.xlsx) downloaded successfully.', 'success');
                          } catch (err) {
                            console.error('Error exporting Excel:', err);
                            showToast('Failed to generate Excel report.', 'error');
                          } finally {
                            setIsExportingExcel(false);
                          }
                        }}
                        disabled={isExportingExcel}
                        className="group relative inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-stone-950 hover:bg-stone-800 text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 shadow-lg shadow-black/40 transition-all duration-200 text-xs font-bold tracking-wide cursor-pointer disabled:opacity-50"
                        title="Export complete 3-sheet Excel spreadsheet with thumbnails, inward-outward ledger, and category valuation"
                      >
                        <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                          {isExportingExcel ? (
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                          ) : (
                            <FileSpreadsheet className="w-4 h-4" />
                          )}
                        </div>
                        <div className="text-left">
                          <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-mono">
                            Spreadsheet
                          </span>
                          <span className="block font-serif-luxury font-bold text-amber-300 group-hover:text-amber-200 text-xs sm:text-sm">
                            Download Excel (XLSX)
                          </span>
                        </div>
                        <Download className="w-3.5 h-3.5 text-amber-400 ml-1 group-hover:translate-y-0.5 transition-transform" />
                      </button>

                      {/* Download PDF Report Button */}
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setIsExportingPDF(true);
                            await exportInventoryToPDF(
                              products,
                              categories,
                              inventoryLogs,
                              orders,
                              (progress) => setPdfExportProgress(progress)
                            );
                            showToast('Master Inventory PDF Report generated & downloaded.', 'success');
                          } catch (err) {
                            console.error('Error generating PDF:', err);
                            showToast('Failed to generate PDF report.', 'error');
                          } finally {
                            setIsExportingPDF(false);
                            setPdfExportProgress('');
                          }
                        }}
                        disabled={isExportingPDF}
                        className="group relative inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black shadow-lg shadow-amber-900/30 transition-all duration-200 text-xs tracking-wide cursor-pointer disabled:opacity-50 border border-amber-300/40"
                        title="Generate high-resolution executive PDF report with embedded image thumbnails and transaction tables"
                      >
                        <div className="w-7 h-7 rounded-xl bg-stone-950/20 text-stone-950 flex items-center justify-center border border-stone-950/20 group-hover:scale-110 transition-transform">
                          {isExportingPDF ? (
                            <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <div className="text-left">
                          <span className="block text-[10px] uppercase tracking-wider text-amber-950/80 font-mono font-bold">
                            Audit Document
                          </span>
                          <span className="block font-serif-luxury font-bold text-stone-950 text-xs sm:text-sm">
                            {isExportingPDF ? (pdfExportProgress || 'Exporting PDF...') : 'Download PDF Report'}
                          </span>
                        </div>
                        <Download className="w-3.5 h-3.5 text-stone-950 ml-1 group-hover:translate-y-0.5 transition-transform" />
                      </button>

                      {/* Log Inward Restock Shipment Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setInwardProductId(products[0]?.id || '');
                          setInwardUnits(10);
                          setInwardBatchRef(`PO-${Date.now().toString().slice(-5)}`);
                          setInwardSupplier('Mysore Solid Woodcraft Hub');
                          setInwardNotes('Factory batch reception with moisture test certificate');
                          setShowInwardModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 transition-all text-xs font-bold cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-amber-400" />
                        <span>Receive Inward Batch</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inventory KPI Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Metric 1: Total Valuation */}
                  <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-stone-400">
                      <span className="text-[10px] uppercase font-bold tracking-wider font-mono">
                        Total Valuation
                      </span>
                      <DollarSign className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black font-serif-luxury text-stone-900">
                      ₹{totalValuation.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-stone-500">
                      At showroom exclusive selling rates
                    </p>
                  </div>

                  {/* Metric 2: Live Units */}
                  <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-stone-400">
                      <span className="text-[10px] uppercase font-bold tracking-wider font-mono">
                        In-Stock Units
                      </span>
                      <Boxes className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black font-mono text-emerald-700">
                      {totalUnitsInStock} <span className="text-xs font-normal text-stone-500">units</span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Across {products.length} live catalog items
                    </p>
                  </div>

                  {/* Metric 3: Purchased Inward */}
                  <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-stone-400">
                      <span className="text-[10px] uppercase font-bold tracking-wider font-mono">
                        Purchased Inward
                      </span>
                      <Truck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black font-mono text-blue-700">
                      +{totalInwardUnits} <span className="text-xs font-normal text-stone-500">units</span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Total factory & workshop inward
                    </p>
                  </div>

                  {/* Metric 4: Dispatched Outward */}
                  <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-stone-400">
                      <span className="text-[10px] uppercase font-bold tracking-wider font-mono">
                        Dispatched Outward
                      </span>
                      <ArrowDownRight className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black font-mono text-purple-700">
                      -{totalOutwardUnits} <span className="text-xs font-normal text-stone-500">units</span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Sold & dispatched customer orders
                    </p>
                  </div>

                  {/* Metric 5: Low Stock Alerts */}
                  <div className={`p-5 rounded-3xl border shadow-xs space-y-1 ${alertCount > 0
                    ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                    : 'bg-white border-stone-200'
                    }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-stone-500">
                        Reorder Alerts
                      </span>
                      <AlertTriangle className={`w-4 h-4 ${alertCount > 0 ? 'text-amber-600 animate-pulse' : 'text-stone-400'}`} />
                    </div>
                    <div className={`text-xl sm:text-2xl font-black font-mono ${alertCount > 0 ? 'text-amber-900' : 'text-stone-900'}`}>
                      {alertCount} <span className="text-xs font-normal text-stone-500">items</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      {alertCount > 0 ? 'Below minimum threshold' : 'All warehouse stocks healthy'}
                    </p>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { id: 'all', label: 'All Catalog Items', count: metrics.length },
                        { id: 'in_stock', label: 'Healthy In Stock', count: metrics.filter((m) => m.statusCode === 'OK').length },
                        { id: 'low_stock', label: 'Low Stock Alerts', count: metrics.filter((m) => m.statusCode === 'LOW').length },
                        { id: 'out_of_stock', label: 'Out of Stock', count: metrics.filter((m) => m.statusCode === 'OOS').length }
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setInventoryStatusFilter(st.id as any)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${inventoryStatusFilter === st.id
                            ? 'bg-stone-900 text-white shadow-sm'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                        >
                          <span>{st.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${inventoryStatusFilter === st.id
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-200 text-stone-700'
                            }`}>
                            {st.count}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Category Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-700 font-bold">Department:</span>
                      <select
                        value={inventoryCategoryFilter}
                        onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                        className="py-2 px-3 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800 cursor-pointer shadow-xs"
                      >
                        <option value="all" className="bg-white text-stone-900 font-medium">All Departments ({categories.length})</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.name} className="bg-white text-stone-900 font-medium">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Search input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      placeholder="Search inventory by furniture name, SKU code, category, subcategory, or wood material..."
                      className="w-full pl-10 pr-8 py-2.5 bg-white border border-stone-300 rounded-2xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800 transition-colors shadow-xs"
                    />
                    {inventorySearch && (
                      <button
                        type="button"
                        onClick={() => setInventorySearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Warehouse Inventory Table with Product Thumbnails */}
                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold font-serif-luxury text-stone-900">
                        Master Inventory Catalog ({filteredMetrics.length} Items Displayed)
                      </h3>
                      <p className="text-xs text-stone-500">
                        Showing product imagery, inward purchased units, outward orders, and instant stock controls.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] font-mono tracking-wider">
                          <th className="py-3.5 px-4">Item & Preview</th>
                          <th className="py-3.5 px-3">SKU Code</th>
                          <th className="py-3.5 px-3">Department & Subcategory</th>
                          <th className="py-3.5 px-3">MRP / Exclusive Price</th>
                          <th className="py-3.5 px-3 text-center">Inward (+) / Outward (-)</th>
                          <th className="py-3.5 px-3 text-center">Current Stock</th>
                          <th className="py-3.5 px-3 text-right">Asset Valuation</th>
                          <th className="py-3.5 px-3 text-center">Status</th>
                          <th className="py-3.5 px-4 text-right">Quick Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredMetrics.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-12 text-center text-stone-400">
                              <Boxes className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                              <p className="font-bold text-stone-700">No furniture pieces found matching your criteria</p>
                              <p className="text-xs text-stone-400">Try clearing the search or changing status filters.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredMetrics.map((m) => {
                            const p = m.product;
                            const isLow = m.statusCode === 'LOW';
                            const isOos = m.statusCode === 'OOS';

                            return (
                              <tr
                                key={p.id}
                                className={`hover:bg-amber-50/20 transition-colors ${isOos ? 'bg-rose-50/30' : isLow ? 'bg-amber-50/40' : ''
                                  }`}
                              >
                                {/* Product Thumbnail & Name */}
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 group">
                                      <img
                                        src={p.images[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200'}
                                        alt={p.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                    <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                                      <h4 className="font-bold text-stone-900 text-xs font-serif-luxury truncate">
                                        {p.name}
                                      </h4>
                                      <p className="text-[11px] text-stone-500 truncate">
                                        {p.material || 'Solid Hardwood'}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* SKU */}
                                <td className="py-3.5 px-3">
                                  <span className="font-mono text-[11px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                                    {p.sku}
                                  </span>
                                </td>

                                {/* Department & Subcategory */}
                                <td className="py-3.5 px-3">
                                  <div className="font-semibold text-stone-800">{p.category}</div>
                                  <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded font-mono">
                                    {p.subcategory || 'Standard'}
                                  </span>
                                </td>

                                {/* Price */}
                                <td className="py-3.5 px-3">
                                  <div className="font-bold text-stone-900">
                                    ₹{p.salePrice.toLocaleString('en-IN')}
                                  </div>
                                  <div className="text-[10px] text-stone-400 line-through">
                                    MRP ₹{p.price.toLocaleString('en-IN')}
                                  </div>
                                </td>

                                {/* Purchasing Inward & Outward Counts */}
                                <td className="py-3.5 px-3 text-center">
                                  <div className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                                    <span className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded" title="Total Inward / Purchased Units">
                                      +{m.totalInward}
                                    </span>
                                    <span className="text-stone-300">/</span>
                                    <span className="text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded" title="Total Outward / Dispatched Units">
                                      -{m.totalOutward}
                                    </span>
                                  </div>
                                </td>

                                {/* Current Stock */}
                                <td className="py-3.5 px-3 text-center">
                                  <div className="flex flex-col items-center">
                                    <span className={`font-black font-mono text-sm ${isOos ? 'text-rose-600' : isLow ? 'text-amber-700' : 'text-emerald-800'
                                      }`}>
                                      {p.stock}
                                    </span>
                                    <span className="text-[10px] text-stone-400 font-mono">
                                      Min: {p.lowStockLimit}
                                    </span>
                                  </div>
                                </td>

                                {/* Asset Valuation */}
                                <td className="py-3.5 px-3 text-right">
                                  <span className="font-mono font-bold text-stone-900">
                                    ₹{m.valuation.toLocaleString('en-IN')}
                                  </span>
                                </td>

                                {/* Status Badge */}
                                <td className="py-3.5 px-3 text-center">
                                  {isOos ? (
                                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full border border-rose-200 inline-flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                      OUT OF STOCK
                                    </span>
                                  ) : isLow ? (
                                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300 inline-flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                      REORDER ALERT
                                    </span>
                                  ) : (
                                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                      HEALTHY
                                    </span>
                                  )}
                                </td>

                                {/* Quick Stock Modifier Actions */}
                                <td className="py-3.5 px-4 text-right">
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateProduct({ ...p, stock: Math.max(0, p.stock - 1) });
                                        showToast(`Decreased 1 unit of ${p.name}.`, 'info');
                                      }}
                                      className="w-7 h-7 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                                      title="Dispatch / Reduce 1 unit"
                                    >
                                      -1
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateProduct({ ...p, stock: p.stock + 1 });
                                        showToast(`Added 1 unit of ${p.name}.`, 'success');
                                      }}
                                      className="w-7 h-7 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                                      title="Inward / Add 1 unit"
                                    >
                                      +1
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateProduct({ ...p, stock: p.stock + 5 });
                                        showToast(`Restocked +5 units of ${p.name}.`, 'success');
                                      }}
                                      className="px-2.5 py-1 bg-amber-800 hover:bg-amber-700 text-white rounded-lg font-mono font-bold text-xs transition-colors cursor-pointer"
                                      title="Quick restock +5 units"
                                    >
                                      +5
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setInwardProductId(p.id);
                                        setInwardUnits(5);
                                        setInwardBatchRef(`PO-${Date.now().toString().slice(-5)}`);
                                        setInwardSupplier('Mysore Solid Woodcraft Hub');
                                        setInwardNotes(`Timber batch for ${p.name}`);
                                        setShowInwardModal(true);
                                      }}
                                      className="p-1.5 bg-stone-900 hover:bg-amber-900 text-amber-300 rounded-lg transition-colors cursor-pointer"
                                      title="Receive custom batch"
                                    >
                                      <Truck className="w-3.5 h-3.5" />
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
                </div>

                {/* Purchasing Inward and Outward Activity Audit Ledger */}
                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                    <div>
                      <h3 className="text-base font-bold font-serif-luxury text-stone-900 flex items-center gap-2">
                        <History className="w-4 h-4 text-amber-700" />
                        <span>Purchasing Inward & Outward Activity Audit Ledger</span>
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Chronological timeline of workshop batch arrivals, order deductions, and inventory adjustments with exact timestamps.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-stone-400">
                      {combinedLedger.length} Recorded Transactions
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px] font-mono">
                          <th className="py-2.5 px-3">Date & Timestamp</th>
                          <th className="py-2.5 px-3">SKU</th>
                          <th className="py-2.5 px-3">Furniture Product</th>
                          <th className="py-2.5 px-3">Transaction Flow</th>
                          <th className="py-2.5 px-3 text-center">Movement Qty</th>
                          <th className="py-2.5 px-3 text-center">Prior &rarr; Resulting Stock</th>
                          <th className="py-2.5 px-3">Reference & Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-mono">
                        {combinedLedger.slice(0, 20).map((log, idx) => (
                          <tr key={`${log.id}-${idx}`} className="hover:bg-stone-50 text-stone-700">
                            <td className="py-3 px-3 font-semibold text-stone-900 whitespace-nowrap">
                              {log.date}
                            </td>
                            <td className="py-3 px-3 font-bold text-stone-600">
                              {log.sku}
                            </td>
                            <td className="py-3 px-3 font-sans font-medium text-stone-900">
                              {log.productName}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-sans ${log.isInward
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                                }`}>
                                {log.type}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-bold">
                              <span className={log.quantityChange > 0 ? 'text-blue-700' : 'text-purple-700'}>
                                {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center text-stone-500">
                              {log.previousStock} &rarr; <strong className="text-stone-900">{log.newStock}</strong>
                            </td>
                            <td className="py-3 px-3 font-sans text-stone-600 text-xs">
                              {log.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 6: COUPONS & DISCOUNTS */}
          {activeTab === 'coupons' && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-serif-luxury text-stone-900">
                    Discount Coupons & Promo Campaigns
                  </h2>
                  <p className="text-xs text-stone-500">
                    Configure percentage discounts and minimum order values.
                  </p>
                </div>
                <button
                  onClick={() => setShowCouponModal(true)}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-amber-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((c) => (
                  <div key={c.id || c.code} className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-lg font-black text-amber-950">{c.code}</span>
                      <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                        {c.discountPercent ?? (c.discountType === 'percentage' ? c.discountValue : 0)}% OFF
                      </span>
                    </div>
                    <p className="text-xs text-stone-600">{c.description}</p>
                    <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-200 flex justify-between">
                      <span>Min Order: ₹{(c.minOrderValue ?? 0).toLocaleString()}</span>
                      <span>Expires: {c.expiryDate}</span>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          deleteCoupon(c.id || c.code);
                          showToast(`Coupon ${c.code} deleted.`, 'info');
                        }}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Captured Newsletter Subscribers & Email Marketing Audience */}
              <div className="pt-8 border-t border-stone-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold font-serif-luxury text-stone-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-amber-700" />
                      <span>Captured Newsletter & Marketing Emails</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Audience captured via the storefront footer subscription section for private previews and promotional campaigns.
                    </p>
                  </div>
                  <span className="self-start sm:self-auto text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1 rounded-full font-mono">
                    {storage.getNewsletterSubscribers().length} Active VIP Subscribers
                  </span>
                </div>

                <div className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-stone-200 text-stone-500 uppercase text-[10px] bg-stone-100/70">
                          <th className="py-3 px-4">Subscriber Email</th>
                          <th className="py-3 px-4">Enrolled Date</th>
                          <th className="py-3 px-4">Acquisition Channel</th>
                          <th className="py-3 px-4 text-right">Welcome Incentive</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200/70">
                        {storage.getNewsletterSubscribers().map((sub, idx) => (
                          <tr key={idx} className="hover:bg-white transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-stone-800 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                              <span>{sub.email}</span>
                            </td>
                            <td className="py-3 px-4 text-stone-500">
                              {new Date(sub.subscribedAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-700">
                                {sub.source.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 font-mono">
                                WELCOME25 (₹2,500 Off)
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* New Coupon Modal */}
              {showCouponModal && (
                <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                  <form
                    onSubmit={handleCreateCoupon}
                    className="bg-white rounded-3xl p-6 max-w-md w-full border border-stone-200 shadow-2xl space-y-4 text-xs"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                      <h3 className="font-bold text-base text-stone-900 font-serif-luxury">Create Promo Coupon</h3>
                      <button
                        type="button"
                        onClick={() => setShowCouponModal(false)}
                        className="text-stone-400 hover:text-stone-700 font-bold"
                      >
                        Close
                      </button>
                    </div>

                    <div>
                      <label className="font-bold text-stone-900 block mb-1">Coupon Code (Uppercase)</label>
                      <input
                        type="text"
                        required
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. LUXURY25"
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono uppercase text-stone-900 font-semibold placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-stone-900 block mb-1">Discount %</label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={70}
                          value={newCouponDiscount}
                          onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                          className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-stone-900 font-semibold placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-900 block mb-1">Min Order Value (₹)</label>
                        <input
                          type="number"
                          required
                          value={newCouponMinOrder}
                          onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                          className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-stone-900 font-semibold placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-stone-900 block mb-1">Description</label>
                      <input
                        type="text"
                        value={newCouponDesc}
                        onChange={(e) => setNewCouponDesc(e.target.value)}
                        placeholder="e.g. Special festive showroom savings"
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-semibold placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-900 block mb-1">Expiry Date</label>
                      <input
                        type="date"
                        required
                        value={newCouponExpiry}
                        onChange={(e) => setNewCouponExpiry(e.target.value)}
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-stone-900 font-semibold focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs cursor-pointer"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-stone-900 hover:bg-amber-900 text-white font-bold rounded-xl mt-2 transition-colors cursor-pointer shadow-md"
                    >
                      Publish Coupon
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB: SITE CONTENT, TOP BANNERS & EXPERIENCE CENTERS */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Top Sub-Navigation Header */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                        <Settings className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold font-serif-luxury text-stone-900">
                          Site Banners & Content Management
                        </h2>
                        <p className="text-xs text-stone-500">
                          Configure top festive announcement marquee, manage luxury experience centers, and concierge contacts.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sub-Navigation Tabs */}
                  <div className="flex flex-wrap items-center bg-stone-100 p-1 rounded-2xl border border-stone-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setContentSectionTab('hero')}
                      className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${contentSectionTab === 'hero'
                        ? 'bg-stone-900 text-amber-400 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                        }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span>Homepage Hero Slides</span>
                      <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-700 font-mono">
                        {websiteContent.heroSlides?.length || 0}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentSectionTab('banners')}
                      className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${contentSectionTab === 'banners'
                        ? 'bg-stone-900 text-amber-400 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                        }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Top Festive Banner</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentSectionTab('showrooms')}
                      className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${contentSectionTab === 'showrooms'
                        ? 'bg-stone-900 text-amber-400 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                        }`}
                    >
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Experience Centers</span>
                      <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-700 font-mono">
                        {websiteContent.showrooms?.length || 0}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentSectionTab('contact')}
                      className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${contentSectionTab === 'contact'
                        ? 'bg-stone-900 text-amber-400 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                        }`}
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Concierge & HQ</span>
                    </button>
                  </div>
                </div>

                {/* SUB-SECTION 0: HOMEPAGE HERO BANNER SLIDES CONTROL */}
                {contentSectionTab === 'hero' && (
                  <div className="pt-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/40 p-4 rounded-2xl border border-stone-200">
                      <div>
                        <h3 className="font-bold text-sm text-stone-900 font-serif-luxury">
                          Homepage Hero Banner Slides
                        </h3>
                        <p className="text-xs text-stone-500">
                          Rearrange, edit, or introduce bespoke seasonal hero presentations designed to captivate visitors.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenAddSlide}
                        className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-amber-900 transition-colors shadow cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Create Custom Slide</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(websiteContent.heroSlides || []).map((slide, index) => (
                        <div
                          key={slide.id}
                          className="bg-stone-950 text-white rounded-2xl border border-stone-800 overflow-hidden shadow-lg flex flex-col group"
                        >
                          {/* Image / Layout preview */}
                          <div className="relative aspect-[16/9] bg-stone-900 overflow-hidden">
                            <img
                              src={slide.image}
                              alt={slide.title}
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/70 to-transparent flex flex-col justify-between p-4">
                              <div>
                                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-md border border-amber-500/40 uppercase tracking-wider">
                                  Slide {index + 1} &bull; {slide.sizeOption || 'wide'} height
                                </span>
                              </div>

                              <div className="space-y-1 max-w-xs">
                                <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider font-mono">
                                  {slide.tagline} {slide.badge && `• ${slide.badge}`}
                                </p>
                                <h4 className="font-bold text-white text-sm font-serif-luxury line-clamp-1">
                                  {slide.title}
                                </h4>
                                <p className="text-[10px] text-stone-300 line-clamp-2">
                                  {slide.subtitle}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Control options */}
                          <div className="p-4 bg-stone-900/60 border-t border-stone-800/80 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                              <span className="font-mono bg-stone-800 text-stone-300 px-2 py-0.5 rounded border border-stone-700">
                                CTA: {slide.ctaText}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditSlide(slide)}
                                className="py-1.5 px-3 bg-stone-800 hover:bg-amber-800 text-stone-200 hover:text-white font-bold rounded-lg border border-stone-700 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if ((websiteContent.heroSlides || []).length <= 1) {
                                    showToast('Cannot delete the last remaining hero slide.', 'error');
                                  } else {
                                    setSlideToDelete(slide);
                                  }
                                }}
                                className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 rounded-lg border border-red-900/40 transition-colors cursor-pointer"
                                title="Delete Slide"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUB-SECTION 1: TOP FESTIVE BANNER CONTROL */}
                {contentSectionTab === 'banners' && (
                  <div className="pt-6 space-y-6">
                    {/* Banner Status & Switch Card */}
                    <div className="p-5 bg-stone-950 rounded-2xl border border-stone-800 text-white space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${contentAnnouncementEnabled ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-stone-800 text-stone-500 border border-stone-700'
                            }`}>
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white font-serif-luxury">
                                Top Marquee Announcement Banner
                              </h3>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${contentAnnouncementEnabled
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-stone-800 text-stone-400 border border-stone-700'
                                }`}>
                                {contentAnnouncementEnabled ? '● LIVE ON STOREFRONT' : '○ DISABLED / HIDDEN'}
                              </span>
                            </div>
                            <p className="text-xs text-stone-400">
                              Controls the prominent luxury gold top announcement ticker shown across all store pages.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleAnnouncement(!contentAnnouncementEnabled)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm ${contentAnnouncementEnabled
                              ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold'
                              : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
                              }`}
                          >
                            <Power className={`w-4 h-4 ${contentAnnouncementEnabled ? 'text-stone-950' : 'text-stone-400'}`} />
                            <span>{contentAnnouncementEnabled ? 'Banner Enabled' : 'Banner Disabled'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Live Storefront Preview Simulation Box */}
                      <div className="space-y-1.5 pt-2 border-t border-stone-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Live Customer Storefront Preview:</span>
                        </span>

                        <div className="bg-stone-900 rounded-xl border border-stone-800 p-3 flex items-center justify-between text-xs text-stone-300 overflow-hidden shadow-inner">
                          <div className="hidden sm:flex items-center gap-2 text-[11px] text-stone-400">
                            <MapPin className="w-3 h-3 text-amber-500" />
                            <span>Showrooms ({websiteContent.showrooms?.length || 3} Centers)</span>
                          </div>

                          <div className="flex-1 text-center font-medium text-amber-300 text-xs flex items-center justify-center gap-2 px-3 overflow-hidden">
                            {contentAnnouncementEnabled && contentAnnouncement ? (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                                <span className="truncate font-serif-luxury tracking-wide">{contentAnnouncement}</span>
                              </>
                            ) : (
                              <span className="text-stone-500 italic text-[11px]">
                                [Banner currently disabled or empty – clean luxury header will be displayed]
                              </span>
                            )}
                          </div>

                          <div className="hidden sm:flex items-center gap-1 text-[11px] text-stone-400">
                            <Truck className="w-3 h-3 text-amber-500" />
                            <span>Track Order</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Banner Textarea & Preset Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveContent();
                      }}
                      className="space-y-4 text-xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-stone-900 block text-xs">
                            Banner Headline & Offer Announcement Text <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-[11px] text-stone-400 font-mono">
                            {contentAnnouncement.length} characters
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          required
                          value={contentAnnouncement}
                          onChange={(e) => setContentAnnouncement(e.target.value)}
                          placeholder="e.g. ✨ FESTIVE SHOWROOM SALE: Up to 40% Off + Free White-Glove Installation on Orders Above ₹19,999! Code: FESTIVE25"
                          className="w-full p-3 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs leading-relaxed"
                        />
                      </div>

                      {/* 1-Click Curated Festive Presets */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>One-Click Festive Campaign Templates:</span>
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[
                            {
                              label: '✨ Grand Festive Sale',
                              text: '✨ FESTIVE SHOWROOM SALE: Up to 40% Off + Free White-Glove Installation on Orders Above ₹19,999! Code: FESTIVE25'
                            },
                            {
                              label: '👑 Master Craftsman Week',
                              text: '👑 MASTER CRAFTSMAN WEEK: Complimentary 15-Year Solid Teakwood Warranty On All Living & Bedroom Suites'
                            },
                            {
                              label: '🏛️ Experience Center VIP Consult',
                              text: '🏛️ VISIT OUR EXPERIENCE CENTERS: Book Private 1-on-1 Interior Specialist Consultation Across All Flagships'
                            },
                            {
                              label: '🛋️ Monsoon Living Upgrade',
                              text: '🛋️ LIVING ROOM UPGRADE: Extra ₹3,000 Off on Handcrafted Chesterfield & Sectional Sofas | Code: CPFLAT3000'
                            }
                          ].map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setContentAnnouncement(preset.text);
                                setContentAnnouncementEnabled(true);
                                updateWebsiteContent({
                                  announcement: preset.text,
                                  announcementEnabled: true
                                });
                                showToast(`Applied preset "${preset.label}". Saved to live storefront!`, 'success');
                              }}
                              className="p-3 text-left bg-stone-50 hover:bg-amber-50/70 border border-stone-200 hover:border-amber-400 rounded-xl transition-all cursor-pointer group shadow-2xs space-y-1"
                            >
                              <span className="font-bold text-stone-900 text-xs group-hover:text-amber-900 block">
                                {preset.label}
                              </span>
                              <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                                {preset.text}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Save Banner Actions */}
                      <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setContentAnnouncement('✨ FESTIVE SHOWROOM SALE: Up to 40% Off + Free White-Glove Installation on Orders Above ₹19,999! Code: FESTIVE25');
                            setContentAnnouncementEnabled(true);
                            updateWebsiteContent({
                              announcement: '✨ FESTIVE SHOWROOM SALE: Up to 40% Off + Free White-Glove Installation on Orders Above ₹19,999! Code: FESTIVE25',
                              announcementEnabled: true
                            });
                            showToast('Restored default festive marquee banner.', 'info');
                          }}
                          className="text-xs text-stone-600 hover:text-stone-900 font-semibold cursor-pointer underline"
                        >
                          Reset to Default Banner
                        </button>

                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-stone-900 hover:bg-amber-900 text-white font-bold rounded-xl shadow transition-colors cursor-pointer flex items-center gap-2"
                        >
                          <Check className="w-4 h-4 text-amber-400" />
                          <span>Save Top Banner Changes</span>
                        </button>
                      </div>
                    </form>

                    {/* VINAYAGAR CHATHURTHI FESTIVE HERO BANNER MANAGER */}
                    <div className="pt-8 mt-8 border-t border-stone-200 space-y-6">
                      <div className="p-5 bg-stone-950 rounded-2xl border border-stone-800 text-white space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${fEnabled ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-stone-800 text-stone-500 border border-stone-700'
                              }`}>
                              <Sparkles className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-white font-serif-luxury">
                                  Vinayagar Chathurthi Festive Hero Banner (Home Page)
                                </h3>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${fEnabled
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-stone-800 text-stone-400 border border-stone-700'
                                  }`}>
                                  {fEnabled ? '● LIVE ON HOME PAGE' : '○ DISABLED / HIDDEN'}
                                </span>
                              </div>
                              <p className="text-xs text-stone-400">
                                Stunning luxury-themed auspicious hero banner featuring Vinayagar motif, animated transitions, and exclusive code.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleFestiveBanner(!fEnabled)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm ${fEnabled
                                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold'
                                : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
                                }`}
                            >
                              <Power className={`w-4 h-4 ${fEnabled ? 'text-stone-950' : 'text-stone-400'}`} />
                              <span>{fEnabled ? 'Hero Enabled' : 'Hero Disabled'}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Live Festive Hero Banner Customer Storefront Simulation Preview */}
                      <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 text-white space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Live Festive Hero Storefront Preview (Home Page):</span>
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {fEnabled ? 'Status: Active on Storefront' : 'Status: Hidden from Storefront'}
                          </span>
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/40 border border-amber-500/30 flex flex-col md:flex-row gap-4 items-center justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-[10px] font-bold">
                              <span>🪔</span>
                              <span>{fBadge || '🕉️ AUSPICIOUS BLESSINGS • VINAYAGAR CHATHURTHI SPECIAL'}</span>
                            </div>
                            <h4 className="text-base font-bold font-serif-luxury text-white">
                              {fTitle || 'Divine Beginnings for Your Luxury Home'}
                            </h4>
                            <p className="text-[11px] text-stone-300 line-clamp-2 max-w-lg">
                              {fSubtitle}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <span className="px-2 py-0.5 rounded bg-amber-500 text-stone-950 text-[10px] font-extrabold uppercase">
                                {fDiscountText || 'EXTRA 15% OFF'}
                              </span>
                              <span className="font-mono text-[11px] text-amber-400 font-bold px-2 py-0.5 bg-stone-950 rounded border border-amber-500/40">
                                {fCode || 'VINAYAGAR15'}
                              </span>
                              <span className="text-[10px] text-stone-400">
                                {fExpiryText}
                              </span>
                            </div>
                          </div>

                          {/* Mini Preview of Banner Image */}
                          <div className="w-44 h-28 rounded-xl overflow-hidden border border-amber-500/40 relative shrink-0 shadow-md bg-stone-950">
                            <img
                              src={fImage || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'}
                              alt="Festive Showcase Preview"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent flex items-end p-1.5">
                              <span className="text-[9px] font-bold text-amber-300 bg-stone-950/80 px-1.5 py-0.5 rounded">
                                Showcase Preview
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <form
                        onSubmit={handleSaveFestiveBanner}
                        className="space-y-4 text-xs bg-stone-50 border border-stone-200 rounded-2xl p-5"
                      >
                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-amber-950 block mb-2">
                          Customize Hero Copy, Media & Privileges
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="font-bold text-stone-900 block text-xs">
                              Festive Badge Header Text
                            </label>
                            <input
                              type="text"
                              required
                              value={fBadge}
                              onChange={(e) => setFBadge(e.target.value)}
                              placeholder="🕉️ AUSPICIOUS BLESSINGS • VINAYAGAR CHATHURTHI SPECIAL"
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-2xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-stone-900 block text-xs">
                              Festive Title Headline
                            </label>
                            <input
                              type="text"
                              required
                              value={fTitle}
                              onChange={(e) => setFTitle(e.target.value)}
                              placeholder="Divine Beginnings for Your Luxury Home"
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-2xs"
                            />
                          </div>

                          <div className="space-y-1.5 md:col-span-2">
                            <label className="font-bold text-stone-900 block text-xs">
                              Sub-headline / Festive Narrative Summary
                            </label>
                            <textarea
                              rows={2}
                              required
                              value={fSubtitle}
                              onChange={(e) => setFSubtitle(e.target.value)}
                              placeholder="Celebrate with mastercrafted furniture privileges..."
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-2xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-stone-900 block text-xs">
                              Auspicious Coupon Code
                            </label>
                            <input
                              type="text"
                              required
                              value={fCode}
                              onChange={(e) => setFCode(e.target.value)}
                              placeholder="VINAYAGAR15"
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-2xs uppercase"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-stone-900 block text-xs">
                              Coupon Discount Text Tag
                            </label>
                            <input
                              type="text"
                              required
                              value={fDiscountText}
                              onChange={(e) => setFDiscountText(e.target.value)}
                              placeholder="EXTRA 15% OFF"
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-2xs"
                            />
                          </div>

                          <div className="space-y-1.5 md:col-span-2">
                            <label className="font-bold text-stone-900 block text-xs">
                              Validity / Expiry Label Text
                            </label>
                            <input
                              type="text"
                              required
                              value={fExpiryText}
                              onChange={(e) => setFExpiryText(e.target.value)}
                              placeholder="Valid Till Chaturthi Weekend"
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-2xs"
                            />
                          </div>

                          {/* ENHANCED FESTIVE SHOWCASE IMAGE WITH DUAL INPUT, GUIDELINES & INSTANT PREVIEW */}
                          <div className="md:col-span-2 pt-2 border-t border-stone-200/60">
                            <BannerImageInput
                              value={fImage}
                              onChange={(newUrl) => setFImage(newUrl)}
                              label="Festive Showcase Photography / Artwork"
                              required
                              recommendedDimensions="1200 × 800 pixels for landscape showcase banners / 800 × 800 pixels for square cards"
                              aspectRatioHint="Landscape 3:2 or 4:3 Showcase"
                              aspectRatioClass="aspect-[16/10]"
                              presets={[
                                { name: 'Royal Teak Suite', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80' },
                                { name: 'Carved Temple Teak', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' },
                                { name: 'Grand Dining Table', url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80' },
                                { name: 'Bespoke Living Room', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80' }
                              ]}
                              helperNotes="Showcases mastercrafted solid teakwood furniture on the festive hero section"
                              idPrefix="festive-hero"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-stone-900 block text-xs">
                              Primary CTA Button Text
                            </label>
                            <input
                              type="text"
                              required
                              value={fCtaText}
                              onChange={(e) => setFCtaText(e.target.value)}
                              placeholder="Explore Festive Collection"
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-2xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-stone-900 block text-xs">
                              Primary CTA Destination (View ID)
                            </label>
                            <select
                              value={fCtaLink}
                              onChange={(e) => setFCtaLink(e.target.value)}
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-2xs cursor-pointer"
                            >
                              <option value="shop">Showroom Shop Catalog</option>
                              <option value="home">Home Page</option>
                              <option value="offers">Festive Coupon Offers</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-stone-900 block text-xs">
                              Secondary CTA Button Text
                            </label>
                            <input
                              type="text"
                              required
                              value={fSecondaryCtaText}
                              onChange={(e) => setFSecondaryCtaText(e.target.value)}
                              placeholder="Visit Experience Centers"
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-2xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-stone-900 block text-xs">
                              Secondary CTA Destination (View ID)
                            </label>
                            <select
                              value={fSecondaryCtaLink}
                              onChange={(e) => setFSecondaryCtaLink(e.target.value)}
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-2xs cursor-pointer"
                            >
                              <option value="showrooms">Physical Showrooms</option>
                              <option value="contact">Concierge Desk</option>
                              <option value="shop">Catalog</option>
                            </select>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-stone-900 hover:bg-amber-900 text-white font-bold rounded-xl shadow transition-colors cursor-pointer flex items-center gap-2"
                          >
                            <Check className="w-4 h-4 text-amber-400" />
                            <span>Save Festive Hero Configuration</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* SUB-SECTION 2: OUR EXPERIENCE CENTERS CRUD */}
                {contentSectionTab === 'showrooms' && (
                  <div className="pt-6 space-y-6">
                    {/* Showrooms Header & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold font-serif-luxury text-stone-900">
                          Showroom Experience Centers ({websiteContent.showrooms?.length || 0})
                        </h3>
                        <p className="text-xs text-stone-500">
                          Manage physical flagship locations, addresses, direct showroom phone numbers, and luxury showroom photography.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentView('showrooms');
                            window.history.pushState(null, '', '#/showrooms');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl border border-stone-300 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-stone-600" />
                          <span>View Customer Storefront Page</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleOpenAddShowroom}
                          className="px-4 py-2 bg-stone-900 hover:bg-amber-900 text-white text-xs font-bold rounded-xl shadow transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4 text-amber-400" />
                          <span>Add New Experience Center</span>
                        </button>
                      </div>
                    </div>

                    {/* Search / Filter Bar */}
                    <div className="relative max-w-md">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={showroomSearchQuery}
                        onChange={(e) => setShowroomSearchQuery(e.target.value)}
                        placeholder="Search centers by city, name, or street..."
                        className="w-full pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 shadow-2xs"
                      />
                      {showroomSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setShowroomSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Showrooms Grid */}
                    {(() => {
                      const filteredList = (websiteContent.showrooms || []).filter((sr) => {
                        if (!showroomSearchQuery.trim()) return true;
                        const q = showroomSearchQuery.toLowerCase();
                        return (
                          sr.name.toLowerCase().includes(q) ||
                          sr.city.toLowerCase().includes(q) ||
                          sr.address.toLowerCase().includes(q) ||
                          sr.phone.toLowerCase().includes(q)
                        );
                      });

                      if (filteredList.length === 0) {
                        return (
                          <div className="p-12 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 space-y-3">
                            <Building2 className="w-10 h-10 text-stone-400 mx-auto" />
                            <h4 className="text-sm font-bold text-stone-800">No Experience Centers Found</h4>
                            <p className="text-xs text-stone-500 max-w-md mx-auto">
                              {showroomSearchQuery
                                ? `No showroom centers matched "${showroomSearchQuery}". Try clearing your search.`
                                : 'No experience centers currently configured.'}
                            </p>
                            <button
                              type="button"
                              onClick={handleOpenAddShowroom}
                              className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-amber-900 transition-colors shadow cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5 text-amber-400" />
                              <span>Create First Experience Center</span>
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredList.map((sr) => (
                            <div
                              key={sr.id}
                              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                            >
                              {/* Showroom Image Header */}
                              <div className="relative aspect-[16/10] bg-stone-900 overflow-hidden">
                                <img
                                  src={sr.image}
                                  alt={sr.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3.5">
                                  <span className="px-2.5 py-1 bg-amber-500 text-stone-950 font-bold text-[10px] rounded-lg shadow uppercase tracking-wider font-mono">
                                    {sr.city}
                                  </span>
                                  {sr.virtualTourUrl && (
                                    <span className="px-2 py-0.5 bg-stone-900/90 text-amber-300 font-bold text-[10px] rounded-md border border-amber-500/40">
                                      3D Virtual Tour
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Showroom Details Body */}
                              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                <div className="space-y-2">
                                  <h4 className="font-bold text-stone-900 text-sm font-serif-luxury leading-snug">
                                    {sr.name}
                                  </h4>

                                  <div className="space-y-1.5 text-xs text-stone-600">
                                    <div className="flex items-start gap-2">
                                      <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                                      <p className="line-clamp-2 text-[11px] leading-relaxed">{sr.address}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Phone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                      <p className="font-mono text-[11px] font-semibold text-stone-800">{sr.phone}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                      <p className="text-[11px] text-stone-500">{sr.timing}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditShowroom(sr)}
                                    className="flex-1 py-2 px-3 bg-stone-100 hover:bg-amber-100/70 text-stone-800 hover:text-amber-900 text-xs font-bold rounded-xl border border-stone-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                                    <span>Edit Center</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setShowroomToDelete(sr)}
                                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                                    title="Remove Experience Center"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* SUB-SECTION 3: CONCIERGE & HQ CONTACTS */}
                {contentSectionTab === 'contact' && (
                  <div className="pt-6 max-w-2xl">
                    <form onSubmit={handleSaveContent} className="space-y-4 text-xs">
                      <div>
                        <label className="font-bold text-stone-900 block mb-1">
                          Concierge Toll-Free Hotline
                        </label>
                        <input
                          type="text"
                          value={contentPhone}
                          onChange={(e) => setContentPhone(e.target.value)}
                          placeholder="+91 1800 200 4848 (Toll Free)"
                          className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-semibold placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-stone-900 block mb-1">
                          Official Concierge Support Email
                        </label>
                        <input
                          type="email"
                          value={contentEmail}
                          onChange={(e) => setContentEmail(e.target.value)}
                          placeholder="concierge@cpfurniture.com"
                          className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-semibold placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-stone-900 block mb-1">
                          Corporate Headquarters Address
                        </label>
                        <textarea
                          rows={2}
                          value={contentAddress}
                          onChange={(e) => setContentAddress(e.target.value)}
                          placeholder="CP Furniture Design Tower, 12th Avenue, Bengaluru, India"
                          className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-semibold placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-stone-900 block mb-1">
                          Brand Heritage Story & About Us
                        </label>
                        <textarea
                          rows={4}
                          value={contentAboutUs}
                          onChange={(e) => setContentAboutUs(e.target.value)}
                          placeholder="Founded in 2012, CP Furniture has set the benchmark for luxury handcrafted residential and commercial furniture..."
                          className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-semibold placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-stone-900 hover:bg-amber-900 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-md flex items-center gap-2"
                        >
                          <Check className="w-4 h-4 text-amber-400" />
                          <span>Save Concierge Information</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SECURITY, ADMINISTRATIVE CREDENTIALS */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">

                {/* Left Column - Security Information & Status */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 text-stone-100 shadow-xl space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base font-serif-luxury text-white">Security Integrity</h3>
                        <p className="text-[11px] text-stone-400">CP Furniture Backoffice Security Center</p>
                      </div>
                    </div>

                    <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800/80 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-400">Security Shield</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Active & Enforced
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-400">Current Login ID</span>
                        <span className="text-stone-300 font-mono font-bold truncate max-w-[150px]" title={storage.getAdminCredentials().email}>{storage.getAdminCredentials().email}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-400">Auth Token Class</span>
                        <span className="text-amber-400 font-mono text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">SHA-256 SESSION</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <h4 className="font-bold text-stone-300">Security Best Practices:</h4>
                      <ul className="space-y-1.5 text-stone-400 list-disc list-inside text-[11px]">
                        <li>Avoid using generic terms such as "admin" or "password".</li>
                        <li>Utilize mixed casing, numbers, and symbols for credentials.</li>
                        <li>Change backoffice access credentials at least every 90 days.</li>
                        <li>Always verify current credentials before authorizing changes.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Security Logs Card */}
                  <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 text-stone-100 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400">Recent Security Activity</h4>
                      <span className="text-[10px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded-full font-mono">{securityLogs.length} Logs</span>
                    </div>
                    <div className="space-y-2.5">
                      {securityLogs.map((log, index) => (
                        <div key={index} className="p-3 bg-stone-950 rounded-2xl border border-stone-800 text-[11px] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-200">{log.action}</span>
                            <span className="text-emerald-400 text-[9px] bg-emerald-400/10 px-1.5 py-0.2 rounded border border-emerald-400/20">Success</span>
                          </div>
                          <div className="flex items-center justify-between text-stone-500 font-mono text-[10px]">
                            <span>IP: {log.ip}</span>
                            <span>{log.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Update Form */}
                <div className="lg:col-span-8 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-stone-100 shadow-xl space-y-6">
                  <div>
                    <h3 className="font-bold text-lg font-serif-luxury text-white">Update Administrator Access Credentials</h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Securely modify the email/username and secret password for the CP Furniture Backoffice dashboard. All updates require confirmation of your active secret password.
                    </p>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();

                    // Validation
                    const activeCreds = storage.getAdminCredentials();
                    if (secVerifyCurrentPassword !== activeCreds.pass) {
                      showToast('Verification failed: Current password is incorrect.', 'error');
                      return;
                    }

                    if (!secNewUserId.trim()) {
                      showToast('Invalid Login ID: Username/Email cannot be blank.', 'error');
                      return;
                    }

                    if (secNewPassword) {
                      if (secNewPassword.length < 5) {
                        showToast('Weak Password: New password must be at least 5 characters.', 'error');
                        return;
                      }
                      if (secNewPassword !== secConfirmPassword) {
                        showToast('Mismatch: New passwords do not match.', 'error');
                        return;
                      }
                    }

                    // Apply changes
                    const finalPass = secNewPassword || activeCreds.pass;
                    storage.saveAdminCredentials(secNewUserId, finalPass);

                    // Add security log
                    const newLog = {
                      action: 'Credentials Updated Successfully',
                      ip: '192.168.1.14',
                      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                      success: true
                    };
                    setSecurityLogs(prev => [newLog, ...prev]);

                    // Clear verification inputs
                    setSecNewPassword('');
                    setSecConfirmPassword('');
                    setSecVerifyCurrentPassword('');

                    // Show toast & refresh
                    showToast('Backoffice Security Credentials successfully updated!', 'success');
                  }} className="space-y-5 text-xs">

                    {/* ID Field */}
                    <div>
                      <label className="font-bold text-stone-300 block mb-1 text-left">New Admin User ID (Email or Username) *</label>
                      <p className="text-[10px] text-stone-500 mb-2 text-left">Used for logging into the dashboard. Defaults to admin@cpfurniture.com.</p>
                      <input
                        type="text"
                        required
                        value={secNewUserId}
                        onChange={(e) => setSecNewUserId(e.target.value)}
                        placeholder="admin@cpfurniture.com"
                        className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 font-semibold"
                      />
                    </div>

                    <div className="border-t border-stone-800/80 my-5 pt-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <h4 className="font-bold text-stone-300">Change Admin Password</h4>
                          <p className="text-[10px] text-stone-500">Leave fields blank if you do not want to alter the current password.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                            const generated = `CP-Luxury-${randomSuffix}`;
                            setSecNewPassword(generated);
                            setSecConfirmPassword(generated);
                            showToast(`Secure password generated: ${generated}. Write this down safely!`, 'info');
                          }}
                          className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold rounded-lg border border-amber-500/20 transition-colors cursor-pointer text-[10px] flex items-center gap-1 shrink-0"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Auto Generate Secure Password</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="text-left">
                          <label className="font-bold text-stone-300 block mb-1">New Password</label>
                          <div className="relative">
                            <input
                              type={secShowNewPassword ? 'text' : 'password'}
                              value={secNewPassword}
                              onChange={(e) => setSecNewPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setSecShowNewPassword(!secShowNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                            >
                              {secShowNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="text-left">
                          <label className="font-bold text-stone-300 block mb-1">Confirm New Password</label>
                          <div className="relative">
                            <input
                              type={secShowConfirmPassword ? 'text' : 'password'}
                              value={secConfirmPassword}
                              onChange={(e) => setSecConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setSecShowConfirmPassword(!secShowConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                            >
                              {secShowConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Verification password (always required to save) */}
                    <div className="border-t border-stone-800/80 my-5 pt-5 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 space-y-3 text-left">
                      <div>
                        <label className="font-bold text-amber-400 block mb-1">Current Secret Password Verification *</label>
                        <p className="text-[10px] text-stone-400 mb-2">Required step: provide your current backoffice login password (e.g. admin123) to authorize changes.</p>
                        <div className="relative">
                          <input
                            type={secShowVerifyPassword ? 'text' : 'password'}
                            required
                            value={secVerifyCurrentPassword}
                            onChange={(e) => setSecVerifyCurrentPassword(e.target.value)}
                            placeholder="Verify with current password"
                            className="w-full p-3 bg-stone-950 border border-amber-500/20 rounded-xl text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 pr-10 font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => setSecShowVerifyPassword(!secShowVerifyPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                          >
                            {secShowVerifyPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 text-left">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all shadow-lg hover:shadow-amber-500/10 cursor-pointer flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 font-bold" />
                        <span>Enforce Security Updates</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Purchasing Portal Credentials Section */}
                <div className="lg:col-span-12 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-stone-100 shadow-xl space-y-6 text-left mt-6">
                  <div>
                    <h3 className="font-bold text-lg font-serif-luxury text-white">Modify Purchasing Portal Security Credentials</h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Change the secure User ID and secret Password required to login to the dedicated Purchasing & Stock Inward Portal.
                    </p>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!purchUserId.trim() || !purchPassword.trim()) {
                      showToast('Purchasing credentials cannot be blank.', 'error');
                      return;
                    }
                    storage.savePurchasingCredentials({ userId: purchUserId, pass: purchPassword });
                    showToast('Purchasing Portal security credentials updated successfully!', 'success');
                  }} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-stone-300 block mb-1">Purchasing User ID</label>
                        <input
                          type="text"
                          required
                          value={purchUserId}
                          onChange={(e) => setPurchUserId(e.target.value)}
                          placeholder="purchasing"
                          className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500 font-semibold text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-300 block mb-1">Purchasing Password</label>
                        <input
                          type="text"
                          required
                          value={purchPassword}
                          onChange={(e) => setPurchPassword(e.target.value)}
                          placeholder="purchasing123"
                          className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500 font-semibold text-xs"
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all shadow-lg hover:shadow-amber-500/10 cursor-pointer text-xs flex items-center gap-2"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Save Purchasing Credentials</span>
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* TAB: BILLING & INVOICE MANAGEMENT */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">

                {/* Left Column - Billing Guidelines & Real-time Live Preview */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 text-stone-100 shadow-xl space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base font-serif-luxury text-white">Fulfillment Hub</h3>
                        <p className="text-[11px] text-stone-400">Tax Invoice & Delivery Configuration</p>
                      </div>
                    </div>

                    <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800/80 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-400">PDF Dispatch System</span>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          Active & Synchronized
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-400">Invoice Schema</span>
                        <span className="text-stone-300 font-bold font-mono">v1.2.0-Production</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <h4 className="font-bold text-stone-300">Administrative Guidelines:</h4>
                      <ul className="space-y-1.5 text-stone-400 list-disc list-inside text-[11px] leading-relaxed">
                        <li>Invoice headers represent official billing titles printed on custom customer order receipts.</li>
                        <li>Avoid hardcoded fulfillment notes or warehouse duplicate records by editing the center name directly.</li>
                        <li>Changes made here apply instantly to all generated orders, downloaded PDF files, and mail receipts.</li>
                      </ul>
                    </div>
                  </div>

                  {/* LIVE DIGITAL INVOICE PREVIEW */}
                  <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 text-stone-100 shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                      <span className="text-[10px] font-bold uppercase text-amber-500/80 tracking-wider">Live Invoice Preview</span>
                      <span className="text-[9px] font-mono bg-stone-950 px-2 py-0.5 rounded border border-stone-800 text-stone-400 font-bold">DIGITAL PROOF</span>
                    </div>

                    <div className="bg-white text-stone-900 p-4 rounded-2xl shadow-inner text-[10px] space-y-3 font-sans leading-relaxed">
                      <div className="flex justify-between items-start border-b border-stone-100 pb-2">
                        <div>
                          <h4 className="font-bold text-stone-800 text-xs">CP FURNITURE</h4>
                          <p className="font-semibold text-[8px] text-stone-600">{localCompanyName || 'CP FURNITURE RETAIL PRIVATE LIMITED'}</p>
                          <p className="text-[8px] text-stone-400">{localRegisteredOfficeAddress || 'Registered office address'}</p>
                          <p className="text-[8px] text-stone-400">GSTIN: {localGstin || 'GSTIN'} | CIN: {localCin || 'CIN'}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-1.5 py-0.5 bg-stone-950 text-amber-400 font-bold text-[8px] rounded uppercase mb-1">
                            {localInvoiceHeader || 'Tax Invoice'}
                          </span>
                          <p className="font-mono text-[7px] text-stone-400">INV-988C1Z8</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-start pt-1 text-[8px]">
                        <div>
                          <p className="font-bold text-stone-500 uppercase tracking-wide">Customer Details</p>
                          <p className="font-semibold text-stone-800">Siddharth Sen</p>
                          <p className="text-stone-400">Prestige Golfshire, Bengaluru</p>
                        </div>
                        <div className="text-right space-y-0.5">
                          <p className="font-bold text-stone-500 uppercase tracking-wide">Fulfillment Details</p>
                          <p className="font-bold text-stone-800">{localFulfillmentCenterName || 'CP Central Hub'}</p>
                          <p className="text-stone-400">{localWarehouseAddress || 'Bengaluru Logi-Park'}</p>
                          <p className="text-stone-400">Delivery: {localDeliveryWindowText || '3-5 Days'}</p>
                          <p className="text-amber-700 italic font-medium">{localDispatchNote || 'White-Glove Care'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Billing Settings Edit Panel */}
                <div className="lg:col-span-8 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-stone-100 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white font-serif-luxury tracking-wide">Bill & Invoice Configuration</h3>
                    <p className="text-xs text-stone-400">Customize official document headers, warehousing nodes, dispatch parameters, and fulfillment metadata.</p>
                  </div>

                  <div className="border-t border-stone-800/80 my-4"></div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <label className="font-bold text-stone-300 block mb-1.5 text-xs">Invoice Header / Document Title</label>
                        <input
                          type="text"
                          disabled={!isEditingBilling}
                          value={localInvoiceHeader}
                          onChange={(e) => setLocalInvoiceHeader(e.target.value)}
                          placeholder="e.g. CP Furniture Showroom Tax Invoice"
                          className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 transition-colors font-semibold text-xs disabled:opacity-50 disabled:bg-stone-950/40"
                        />
                        <p className="text-[10px] text-stone-500 mt-1">Changes the main title badge of the Tax Invoice receipt (e.g. Tax Invoice, Showroom Sales Receipt, Custom Invoice).</p>
                      </div>

                      <div className="sm:col-span-2 pt-2 border-t border-stone-800/80">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80 mb-3">Company Information</p>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-bold text-stone-300 block mb-1.5 text-xs">Company Name</label>
                        <input
                          type="text"
                          disabled={!isEditingBilling}
                          value={localCompanyName}
                          onChange={(e) => setLocalCompanyName(e.target.value)}
                          placeholder="e.g. CP FURNITURE RETAIL PRIVATE LIMITED"
                          className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 transition-colors font-semibold text-xs disabled:opacity-50 disabled:bg-stone-950/40"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-bold text-stone-300 block mb-1.5 text-xs">Registered Office Address</label>
                        <input
                          type="text"
                          disabled={!isEditingBilling}
                          value={localRegisteredOfficeAddress}
                          onChange={(e) => setLocalRegisteredOfficeAddress(e.target.value)}
                          placeholder="e.g. Plot 18A, Indiranagar 100ft Road, Bengaluru"
                          className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 transition-colors font-semibold text-xs disabled:opacity-50 disabled:bg-stone-950/40"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-stone-300 block mb-1.5 text-xs">GSTIN Number</label>
                        <input
                          type="text"
                          disabled={!isEditingBilling}
                          value={localGstin}
                          onChange={(e) => setLocalGstin(e.target.value.toUpperCase())}
                          placeholder="e.g. 29AAACP9988C1Z8"
                          className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 transition-colors font-semibold text-xs disabled:opacity-50 disabled:bg-stone-950/40"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-stone-300 block mb-1.5 text-xs">CIN Number</label>
                        <input
                          type="text"
                          disabled={!isEditingBilling}
                          value={localCin}
                          onChange={(e) => setLocalCin(e.target.value.toUpperCase())}
                          placeholder="e.g. U36100KA2018PTC112345"
                          className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 transition-colors font-semibold text-xs disabled:opacity-50 disabled:bg-stone-950/40"
                        />
                      </div>

                      <div className="sm:col-span-2 pt-2 border-t border-stone-800/80">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80 mb-1">Fulfillment & Dispatch</p>
                      </div>

                      <div>
                        <label className="font-bold text-stone-300 block mb-1.5 text-xs">Fulfillment Center / Hub Name</label>
                        <input
                          type="text"
                          disabled={!isEditingBilling}
                          value={localFulfillmentCenterName}
                          onChange={(e) => setLocalFulfillmentCenterName(e.target.value)}
                          placeholder="e.g. CP Central Furniture Hub - South"
                          className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 transition-colors font-semibold text-xs disabled:opacity-50 disabled:bg-stone-950/40"
                        />
                        <p className="text-[10px] text-stone-500 mt-1">Configures the dispatched fulfillment branch printed on receipts.</p>
                      </div>

                      <div>
                        <label className="font-bold text-stone-300 block mb-1.5 text-xs">Delivery Window Text</label>
                        <input
                          type="text"
                          disabled={!isEditingBilling}
                          value={localDeliveryWindowText}
                          onChange={(e) => setLocalDeliveryWindowText(e.target.value)}
                          placeholder="e.g. 3-5 Business Days"
                          className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 transition-colors font-semibold text-xs disabled:opacity-50 disabled:bg-stone-950/40"
                        />
                        <p className="text-[10px] text-stone-500 mt-1">Updates the customer's expected delivery ETA text in the order invoice.</p>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-bold text-stone-300 block mb-1.5 text-xs">Warehouse Node Address</label>
                        <input
                          type="text"
                          disabled={!isEditingBilling}
                          value={localWarehouseAddress}
                          onChange={(e) => setLocalWarehouseAddress(e.target.value)}
                          placeholder="e.g. Whitefield Logistics Park, Bengaluru"
                          className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 transition-colors font-semibold text-xs disabled:opacity-50 disabled:bg-stone-950/40"
                        />
                        <p className="text-[10px] text-stone-500 mt-1">Specifies the warehouse node from where outward stock units are dispatched.</p>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-bold text-stone-300 block mb-1.5 text-xs">Dispatch Note / Quality Statement</label>
                        <input
                          type="text"
                          disabled={!isEditingBilling}
                          value={localDispatchNote}
                          onChange={(e) => setLocalDispatchNote(e.target.value)}
                          placeholder="e.g. Dispatched with White-Glove Care"
                          className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-700 focus:outline-none focus:border-amber-500 transition-colors font-semibold text-xs disabled:opacity-50 disabled:bg-stone-950/40"
                        />
                        <p className="text-[10px] text-stone-500 mt-1">Outward quality seal dispatched along with order parcels.</p>
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3 text-xs">
                      {!isEditingBilling ? (
                        <button
                          type="button"
                          id="admin-billing-edit-btn"
                          onClick={() => setIsEditingBilling(true)}
                          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2 font-semibold"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Edit Configurations</span>
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            id="admin-billing-discard-btn"
                            onClick={() => {
                              if (invoiceSettings) {
                                setLocalInvoiceHeader(invoiceSettings.invoiceHeader);
                                setLocalCompanyName(invoiceSettings.companyName);
                                setLocalRegisteredOfficeAddress(invoiceSettings.registeredOfficeAddress);
                                setLocalGstin(invoiceSettings.gstin);
                                setLocalCin(invoiceSettings.cin);
                                setLocalFulfillmentCenterName(invoiceSettings.fulfillmentCenterName);
                                setLocalWarehouseAddress(invoiceSettings.warehouseAddress);
                                setLocalDispatchNote(invoiceSettings.dispatchNote);
                                setLocalDeliveryWindowText(invoiceSettings.deliveryWindowText);
                              }
                              setIsEditingBilling(false);
                              showToast('Edits discarded.', 'info');
                            }}
                            className="px-5 py-3 border border-stone-800 hover:bg-stone-800 text-stone-300 font-bold rounded-xl transition-colors cursor-pointer font-semibold"
                          >
                            Discard
                          </button>
                          <button
                            type="button"
                            id="admin-billing-save-btn"
                            onClick={() => {
                              updateInvoiceSettings({
                                invoiceHeader: localInvoiceHeader,
                                companyName: localCompanyName,
                                registeredOfficeAddress: localRegisteredOfficeAddress,
                                gstin: localGstin,
                                cin: localCin,
                                fulfillmentCenterName: localFulfillmentCenterName,
                                warehouseAddress: localWarehouseAddress,
                                dispatchNote: localDispatchNote,
                                deliveryWindowText: localDeliveryWindowText
                              });
                              setIsEditingBilling(false);

                              // Track in admin activity log
                              addAdminActivityLog(
                                'Updated Bill & Invoice Settings',
                                `Updated invoice template header to "${localInvoiceHeader}" and fulfillment center to "${localFulfillmentCenterName}"`,
                                'billing'
                              );
                            }}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2 font-semibold"
                          >
                            <Check className="w-4 h-4 font-bold" />
                            <span>Save Changes</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ADD / EDIT PRODUCT MODAL */}
          {showProductModal && (
            <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <form
                onSubmit={handleSaveProduct}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-stone-200 shadow-2xl space-y-4 text-xs my-8 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <h3 className="font-bold text-lg text-stone-900 font-serif-luxury">
                    {editingProduct ? 'Edit Furniture Piece' : 'Add New Furniture to Showroom'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="text-stone-400 hover:text-stone-700 font-bold"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-stone-900 block mb-1 text-xs">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="e.g. Royal Teak 6-Seater Dining Suite"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-semibold text-xs placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-900 block mb-1 text-xs">SKU Code *</label>
                    <input
                      type="text"
                      required
                      value={pSku}
                      onChange={(e) => setPSku(e.target.value)}
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-mono font-semibold text-xs placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-900 block mb-1 text-xs">Showroom Category *</label>
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-semibold text-xs focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name} className="bg-white text-stone-900 py-1 font-medium">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-stone-900 block mb-1 text-xs">Brand / Craftsmanship Studio</label>
                    <input
                      type="text"
                      value={pBrand}
                      onChange={(e) => setPBrand(e.target.value)}
                      placeholder="e.g. CP Luxury Living"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-semibold text-xs placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-900 block mb-1 text-xs">Primary Material *</label>
                    <input
                      type="text"
                      required
                      value={pMaterial}
                      onChange={(e) => setPMaterial(e.target.value)}
                      placeholder="e.g. Solid Kiln-Dried Teak Wood"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-semibold text-xs placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-900 block mb-1 text-xs">Showroom MRP (₹) *</label>
                    <input
                      type="number"
                      required
                      value={pPrice}
                      onChange={(e) => setPPrice(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-mono font-semibold text-xs placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-900 block mb-1 text-xs">Exclusive Sale Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={pSalePrice}
                      onChange={(e) => setPSalePrice(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-mono font-semibold text-xs placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-900 block mb-1 text-xs">Initial Stock Units</label>
                    <input
                      type="number"
                      value={pStock}
                      onChange={(e) => setPStock(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-mono font-semibold text-xs placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-900 block mb-1 text-xs">Low Stock Alert Level</label>
                    <input
                      type="number"
                      value={pLowStock}
                      onChange={(e) => setPLowStock(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-mono font-semibold text-xs placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 focus:bg-white"
                    />
                  </div>

                  <ProductImageUpload
                    images={productImages}
                    onChange={setProductImages}
                    maxImages={4}
                  />

                  <div className="sm:col-span-2 space-y-4 pt-4 border-t border-stone-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-amber-900">
                        Product Information Tabs (Storefront)
                      </h4>
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold uppercase">
                        Luxury CMS Editor
                      </span>
                    </div>

                    {/* Sub-tab selection bar */}
                    <div className="flex border border-stone-300 rounded-xl overflow-hidden bg-stone-50">
                      {[
                        { id: 'desc', label: 'Description & Craftsmanship' },
                        { id: 'specs', label: 'Technical Specifications' },
                        { id: 'care', label: 'Care Instructions' },
                        { id: 'warranty_returns', label: 'Warranty & Return Policy' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setPFormTab(tab.id as any)}
                          className={`flex-1 py-2 text-[10px] sm:text-[11px] font-bold transition-all text-center ${pFormTab === tab.id
                            ? 'bg-stone-900 text-amber-400 shadow-sm'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/50'
                            }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Sub-tab content areas */}
                    <div className="p-4 bg-stone-950 border border-stone-900 rounded-2xl text-stone-300 space-y-4">
                      {pFormTab === 'desc' && (
                        <div className="space-y-3">
                          <div>
                            <label className="font-bold text-amber-400 block mb-1 text-xs">
                              Product Description & Design Highlights (Main Text)
                            </label>
                            <textarea
                              rows={3}
                              value={pDesc}
                              onChange={(e) => setPDesc(e.target.value)}
                              placeholder="Enter main product description..."
                              className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 font-semibold text-xs placeholder:text-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-amber-400 block mb-1 text-xs">
                              Craftsmanship Highlights (One per line)
                            </label>
                            <textarea
                              rows={4}
                              value={pCraftsmanshipHighlights}
                              onChange={(e) => setPCraftsmanshipHighlights(e.target.value)}
                              placeholder="e.g. Kiln-seasoned hardwood frame engineered to resist warpage."
                              className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 font-mono text-xs placeholder:text-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                            />
                            <p className="text-[10px] text-stone-400 mt-1">
                              Each line represents a bullet point in the storefront highlights tab.
                            </p>
                          </div>
                        </div>
                      )}

                      {pFormTab === 'specs' && (
                        <div className="space-y-2">
                          <label className="font-bold text-amber-400 block mb-1 text-xs">
                            Technical Specifications (Format: Key: Value)
                          </label>
                          <textarea
                            rows={6}
                            value={pSpecificationsText}
                            onChange={(e) => setPSpecificationsText(e.target.value)}
                            placeholder="Frame Material: Certified Kiln-Dried Solid Teakwood&#10;Foam Density: 40D High-Resilience PU"
                            className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 font-mono text-xs placeholder:text-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                          />
                          <p className="text-[10px] text-stone-400">
                            Enter each technical spec on a new line using a colon (:) to separate key and value.
                          </p>
                        </div>
                      )}

                      {pFormTab === 'care' && (
                        <div className="space-y-2">
                          <label className="font-bold text-amber-400 block mb-1 text-xs">
                            Care Instructions (One per line)
                          </label>
                          <textarea
                            rows={5}
                            value={pCareInstructions}
                            onChange={(e) => setPCareInstructions(e.target.value)}
                            placeholder="Vacuum clean once a week using soft brush.&#10;Avoid direct exposure to sunlight."
                            className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 font-mono text-xs placeholder:text-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                          />
                          <p className="text-[10px] text-stone-400">
                            Enter each care instruction on a new line. They will be beautifully itemized on the product detail page.
                          </p>
                        </div>
                      )}

                      {pFormTab === 'warranty_returns' && (
                        <div className="space-y-3">
                          <div>
                            <label className="font-bold text-amber-400 block mb-1 text-xs">
                              Warranty Details Text
                            </label>
                            <input
                              type="text"
                              value={pWarranty}
                              onChange={(e) => setPWarranty(e.target.value)}
                              placeholder="e.g. 10-Year Comprehensive Wood Warranty"
                              className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 font-semibold text-xs placeholder:text-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-amber-400 block mb-1 text-xs">
                              Return Policy Text (Custom overrides default policy)
                            </label>
                            <textarea
                              rows={4}
                              value={pReturnPolicy}
                              onChange={(e) => setPReturnPolicy(e.target.value)}
                              placeholder="Enter custom return rules for this product, or leave empty to use our standard 30-day hassle-free return policy..."
                              className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 font-semibold text-xs placeholder:text-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pIsBestSeller}
                        onChange={(e) => setPIsBestSeller(e.target.checked)}
                        className="accent-stone-900 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-bold text-stone-900 text-xs">Best Seller Tag</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pIsNewArrival}
                        onChange={(e) => setPIsNewArrival(e.target.checked)}
                        className="accent-stone-900 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-bold text-stone-900 text-xs">New Arrival Tag</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pIsTrending}
                        onChange={(e) => setPIsTrending(e.target.checked)}
                        className="accent-stone-900 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-bold text-stone-900 text-xs">Trending Tag</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-4 py-2.5 border border-stone-300 rounded-xl text-stone-800 hover:bg-stone-100 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-stone-900 hover:bg-amber-900 text-white font-bold rounded-xl shadow cursor-pointer transition-colors"
                  >
                    {editingProduct ? 'Update Furniture' : 'Save to Showroom'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MODAL: LOG INWARD WORKSHOP SHIPMENT */}
          {showInwardModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-amber-500/20 space-y-5 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-serif-luxury text-stone-900">
                        Receive Inward Workshop Batch
                      </h3>
                      <p className="text-xs text-stone-500">
                        Log timber shipment arrival and automatically update live warehouse stock.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInwardModal(false)}
                    className="text-stone-400 hover:text-stone-600 cursor-pointer p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const product = products.find((p) => p.id === inwardProductId);
                    if (product) {
                      const oldStock = product.stock;
                      const newStock = oldStock + Number(inwardUnits);
                      updateProduct({ ...product, stock: newStock });

                      const now = new Date();
                      const dateStr = now.toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      storage.addInventoryLog({
                        id: `inward-${Date.now()}`,
                        productId: product.id,
                        productName: product.name,
                        sku: product.sku,
                        type: 'Stock In',
                        quantityChange: Number(inwardUnits),
                        previousStock: oldStock,
                        newStock: newStock,
                        date: dateStr,
                        reason: `Inward PO Batch: ${inwardBatchRef || 'PO-' + Date.now().toString().slice(-5)} (${inwardSupplier}). ${inwardNotes}`
                      });

                      showToast(`Received +${inwardUnits} units of ${product.name}.`, 'success');
                      setShowInwardModal(false);
                    }
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block text-stone-900 font-bold mb-1">
                      Select Furniture Piece
                    </label>
                    <select
                      value={inwardProductId}
                      onChange={(e) => setInwardProductId(e.target.value)}
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 cursor-pointer shadow-xs"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id} className="bg-white text-stone-900 py-1 font-medium">
                          [{p.sku}] {p.name} (Current: {p.stock} units)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-900 font-bold mb-1">
                        Inward Quantity (Units)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={inwardUnits}
                        onChange={(e) => setInwardUnits(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-stone-900 font-bold mb-1">
                        PO Batch Reference #
                      </label>
                      <input
                        type="text"
                        value={inwardBatchRef}
                        onChange={(e) => setInwardBatchRef(e.target.value)}
                        placeholder="e.g. PO-84920"
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-900 font-bold mb-1">
                      Timber Workshop / Supplier Hub
                    </label>
                    <input
                      type="text"
                      value={inwardSupplier}
                      onChange={(e) => setInwardSupplier(e.target.value)}
                      placeholder="e.g. Mysore Solid Woodcraft Hub"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-900 font-bold mb-1">
                      Quality Audit & Arrival Notes
                    </label>
                    <textarea
                      rows={2}
                      value={inwardNotes}
                      onChange={(e) => setInwardNotes(e.target.value)}
                      placeholder="Moisture content inspected, teak wood seasoning certified..."
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                    />
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowInwardModal(false)}
                      className="px-4 py-2 border border-stone-300 rounded-xl text-stone-800 hover:bg-stone-100 font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-stone-900 hover:bg-amber-900 text-white font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Confirm Inward Stock</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: REMOVE SUBCATEGORY CONFIRMATION */}
          {subcategoryToDelete && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white text-stone-900 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-150">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold font-serif-luxury text-stone-900">
                    Remove Subcategory?
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Are you sure you want to remove <span className="font-bold text-stone-900">"{subcategoryToDelete.subcategoryName}"</span> from the <span className="font-bold text-stone-900">{subcategoryToDelete.categoryName}</span> category?
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-stone-600">
                    <span>Department Category:</span>
                    <span className="font-bold text-stone-900">{subcategoryToDelete.categoryName}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600">
                    <span>Target Subcategory:</span>
                    <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">
                      {subcategoryToDelete.subcategoryName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600">
                    <span>Linked Furniture Items:</span>
                    <span className={`font-mono font-bold ${subcategoryToDelete.affectedProductsCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {subcategoryToDelete.affectedProductsCount > 0
                        ? `${subcategoryToDelete.affectedProductsCount} piece(s) will be unlinked`
                        : '0 pieces affected'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubcategoryToDelete(null)}
                    className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteSubcategory(subcategoryToDelete.categoryId, subcategoryToDelete.subcategoryName);
                      setSubcategoryToDelete(null);
                    }}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    Yes, Remove Subcategory
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: DELETE CATEGORY CONFIRMATION */}
          {categoryToDelete && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white text-stone-900 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-150">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold font-serif-luxury text-stone-900">
                    Delete Category?
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Permanently delete department <span className="font-bold text-stone-900">"{categoryToDelete.name}"</span> and its {categoryToDelete.subcategories?.length || 0} subcategories?
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1.5">
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    Note: Products assigned to this category will remain in the catalog with unassigned department until updated.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCategoryToDelete(null)}
                    className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteCategory(categoryToDelete.id);
                      setCategoryToDelete(null);
                      showToast(`Category "${categoryToDelete.name}" deleted.`, 'info');
                    }}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    Yes, Delete Category
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: ADD / EDIT CATEGORY */}
          {showCategoryModal && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white text-stone-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <FolderTree className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-stone-900 font-serif-luxury">
                        {editingCategory ? 'Edit Department Category' : 'New Department Category'}
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Configure department taxonomy and subcategory tags
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const trimmedName = catFormName.trim();
                    if (!trimmedName) return;

                    const subcategoriesArray = catFormSubcategories
                      .split(',')
                      .map((s) => s.trim())
                      .filter((s) => s.length > 0);

                    if (editingCategory) {
                      updateCategory({
                        ...editingCategory,
                        name: trimmedName,
                        slug: trimmedName.toLowerCase().replace(/\s+/g, '-'),
                        description: catFormDesc.trim(),
                        image: catFormImage.trim() || editingCategory.image,
                        subcategories: subcategoriesArray.length > 0 ? subcategoriesArray : editingCategory.subcategories
                      });
                      showToast(`Category "${trimmedName}" updated successfully.`, 'success');
                    } else {
                      addCategory({
                        name: trimmedName,
                        slug: trimmedName.toLowerCase().replace(/\s+/g, '-'),
                        description: catFormDesc.trim() || `Signature ${trimmedName} luxury furniture collection.`,
                        image: catFormImage.trim() || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
                        subcategories: subcategoriesArray.length > 0 ? subcategoriesArray : ['Standard Collection', 'Luxury Custom']
                      });
                      showToast(`Category "${trimmedName}" created successfully.`, 'success');
                    }
                    setShowCategoryModal(false);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block text-stone-900 font-bold mb-1">
                      Category Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={catFormName}
                      onChange={(e) => setCatFormName(e.target.value)}
                      placeholder="e.g. Dining & Entertaining"
                      required
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-900 font-bold mb-1">
                      Department Description
                    </label>
                    <textarea
                      rows={2}
                      value={catFormDesc}
                      onChange={(e) => setCatFormDesc(e.target.value)}
                      placeholder="Artisanal hand-carved dining tables, chairs, and luxury credenzas..."
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-900 font-bold mb-1">
                      Banner Image URL
                    </label>
                    <input
                      type="url"
                      value={catFormImage}
                      onChange={(e) => setCatFormImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-900 font-bold mb-1">
                      Subcategories (comma separated)
                    </label>
                    <input
                      type="text"
                      value={catFormSubcategories}
                      onChange={(e) => setCatFormSubcategories(e.target.value)}
                      placeholder="e.g. 6-Seater Tables, 8-Seater Tables, Dining Chairs, Sideboards"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                    />
                    <p className="text-[10px] text-stone-500 mt-1">
                      Separate subcategory tags with commas. Each tag becomes an instant catalog filter.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(false)}
                      className="px-4 py-2 border border-stone-300 rounded-xl text-stone-800 hover:bg-stone-100 font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-stone-900 hover:bg-amber-900 text-white font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <FolderTree className="w-3.5 h-3.5 text-amber-400" />
                      <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ADD / EDIT EXPERIENCE CENTER MODAL */}
          {showShowroomModal && (
            <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <form
                onSubmit={handleSaveShowroom}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-stone-200 shadow-2xl space-y-4 text-xs my-8 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-serif-luxury text-stone-900">
                        {editingShowroom ? 'Edit Experience Center' : 'Add New Experience Center'}
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Showroom location details and photography will update across the live store immediately.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowShowroomModal(false)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Showroom Center Name */}
                <div>
                  <label className="font-bold text-stone-900 block mb-1">
                    Experience Center Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={srName}
                    onChange={(e) => setSrName(e.target.value)}
                    placeholder="e.g. CP Furniture Luxury Flagship - Indiranagar"
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                  />
                </div>

                {/* City Tag & Presets */}
                <div>
                  <label className="font-bold text-stone-900 block mb-1">
                    City / Region Tag <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={srCity}
                    onChange={(e) => setSrCity(e.target.value)}
                    placeholder="e.g. Bangalore Flagship, Mumbai, Delhi NCR"
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs mb-2"
                  />
                  {/* Quick City Presets */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] text-stone-400 self-center mr-1">Quick Select:</span>
                    {[
                      'Bangalore Flagship',
                      'Mumbai',
                      'Delhi NCR',
                      'Hyderabad',
                      'Chennai',
                      'Kolkata',
                      'Pune',
                      'Ahmedabad'
                    ].map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setSrCity(city)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${srCity === city
                          ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400'
                          }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="font-bold text-stone-900 block mb-1">
                    Full Physical Showroom Address <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={srAddress}
                    onChange={(e) => setSrAddress(e.target.value)}
                    placeholder="e.g. 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038"
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                  />
                </div>

                {/* Phone & Timings Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-900 block mb-1">
                      Showroom Phone / Hotline <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={srPhone}
                      onChange={(e) => setSrPhone(e.target.value)}
                      placeholder="+91 80 4912 8800"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-900 block mb-1">
                      Operating Hours <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={srTiming}
                      onChange={(e) => setSrTiming(e.target.value)}
                      placeholder="10:00 AM - 9:00 PM (All 7 Days)"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                    />
                  </div>
                </div>

                {/* Direct Image File Upload & Presets */}
                <div className="pt-2 border-t border-stone-100">
                  <ShowroomImageUpload
                    imageUrl={srImage}
                    onImageChange={(newUrl) => setSrImage(newUrl)}
                  />
                </div>

                {/* 3D Virtual Tour URL (Optional) */}
                <div>
                  <label className="font-bold text-stone-900 block mb-1">
                    3D Virtual Tour / VR Link <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={srVirtualTourUrl}
                    onChange={(e) => setSrVirtualTourUrl(e.target.value)}
                    placeholder="https://my.matterport.com/show/?m=example"
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                  />
                </div>

                {/* Modal Actions */}
                <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowShowroomModal(false)}
                    className="px-4 py-2 border border-stone-300 rounded-xl text-stone-800 hover:bg-stone-100 font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-stone-900 hover:bg-amber-900 text-white font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>{editingShowroom ? 'Update Experience Center' : 'Publish Experience Center'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* DELETE EXPERIENCE CENTER CONFIRMATION MODAL */}
          {showroomToDelete && (
            <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-stone-200 shadow-2xl space-y-4 text-xs">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold font-serif-luxury text-stone-900">
                    Remove Experience Center?
                  </h3>
                  <p className="text-xs text-stone-600">
                    Are you sure you want to remove <strong className="text-stone-900">{showroomToDelete.name}</strong> ({showroomToDelete.city}) from the customer storefront?
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-600 space-y-1 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    <span className="truncate">{showroomToDelete.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-500" />
                    <span>{showroomToDelete.phone}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowroomToDelete(null)}
                    className="flex-1 py-2.5 border border-stone-300 rounded-xl text-stone-800 hover:bg-stone-100 font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteShowroom(showroomToDelete.id)}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow cursor-pointer transition-colors"
                  >
                    Yes, Remove Center
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* MODAL: ADD / EDIT HOMEPAGE HERO SLIDE */}
          {showSlideModal && (
            <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <form
                onSubmit={handleSaveSlide}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-stone-200 shadow-2xl space-y-4 text-xs my-8 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-serif-luxury text-stone-900">
                        {editingSlide ? 'Edit Homepage Hero Slide' : 'Add Custom Hero Slide'}
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Modify headline text, banner images, height preferences, and customer call-to-actions.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSlideModal(false)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Title / Headline */}
                <div>
                  <label className="font-bold text-stone-900 block mb-1">
                    Main Headline Text <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={slideTitle}
                    onChange={(e) => setSlideTitle(e.target.value)}
                    placeholder="e.g. Architectural Elegance for Modern Living"
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                  />
                </div>

                {/* Subtitle / Paragraph */}
                <div>
                  <label className="font-bold text-stone-900 block mb-1">
                    Subtitle Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={slideSubtitle}
                    onChange={(e) => setSlideSubtitle(e.target.value)}
                    placeholder="Write a captivating design description for this collection banner..."
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                  />
                </div>

                {/* Tagline & Badge Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-900 block mb-1">
                      Tagline Text
                    </label>
                    <input
                      type="text"
                      value={slideTagline}
                      onChange={(e) => setSlideTagline(e.target.value)}
                      placeholder="e.g. THE NEW 2026 SHOWROOM COLLECTION"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-900 block mb-1">
                      Highlight Badge
                    </label>
                    <input
                      type="text"
                      value={slideBadge}
                      onChange={(e) => setSlideBadge(e.target.value)}
                      placeholder="e.g. EXCLUSIVE, BESTSELLER, 15% OFF"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-xs"
                    />
                  </div>
                </div>

                {/* Sizing and Aspect Ratio Height Option */}
                <div>
                  <label className="font-bold text-stone-900 block mb-1">
                    Aspect Sizing Option (Height Adjustments)
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-stone-50 p-1.5 rounded-2xl border border-stone-200">
                    {[
                      { value: 'compact', title: 'Compact Height', desc: '400px (Dense, sleek)' },
                      { value: 'wide', title: 'Balanced Wide', desc: '500px (Majestic)' },
                      { value: 'full', title: 'Full Immersive', desc: '660px (Max impact)' }
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setSlideSizeOption(item.value as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${slideSizeOption === item.value
                          ? 'bg-stone-900 text-amber-400 border-stone-900 shadow-sm'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-stone-450'
                          }`}
                      >
                        <p className="font-bold text-[11px]">{item.title}</p>
                        <p className="text-[9px] opacity-85 mt-0.5">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Image File Upload Field, Dual URL Input & Guidelines */}
                <div className="pt-2 border-t border-stone-200">
                  <BannerImageInput
                    value={slideImage}
                    onChange={(newUrl) => setSlideImage(newUrl)}
                    label="Custom Banner Image / Artwork"
                    required
                    recommendedDimensions="1200 × 800 pixels for landscape showcase banners / 800 × 800 pixels for square cards (or 1920 × 800 px for ultra-wide hero slides)"
                    aspectRatioHint="Desktop Ultra-Wide (16:9 or 2.4:1)"
                    aspectRatioClass="aspect-[16/9]"
                    presets={[
                      { name: 'Cozy Living', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80' },
                      { name: 'Art Lounge', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80' },
                      { name: 'Teak Dining', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80' },
                      { name: 'Bespoke Bed', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80' }
                    ]}
                    helperNotes="Edge-to-edge high-resolution showcase photography with instant preview and auto-saving"
                    idPrefix="hero-slide-img"
                  />
                </div>

                {/* CTAs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                  <div className="space-y-1">
                    <label className="font-bold text-stone-900 block">Primary Action Button (CTA)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={slideCtaText}
                        onChange={(e) => setSlideCtaText(e.target.value)}
                        placeholder="e.g. Shop Collection"
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg text-[11px]"
                      />
                      <input
                        type="text"
                        value={slideCtaLink}
                        onChange={(e) => setSlideCtaLink(e.target.value)}
                        placeholder="e.g. sofas-seating"
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-900 block">Secondary Action Button</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={slideSecondaryCtaText}
                        onChange={(e) => setSlideSecondaryCtaText(e.target.value)}
                        placeholder="e.g. Book Consultation"
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg text-[11px]"
                      />
                      <input
                        type="text"
                        value={slideSecondaryCtaLink}
                        onChange={(e) => setSlideSecondaryCtaLink(e.target.value)}
                        placeholder="e.g. showrooms"
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSlideModal(false)}
                    className="px-4 py-2 border border-stone-300 rounded-xl text-stone-800 hover:bg-stone-100 font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-stone-900 hover:bg-amber-900 text-white font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>{editingSlide ? 'Update Hero Slide' : 'Publish Hero Slide'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CONFIRM DELETE HERO SLIDE */}
          {slideToDelete && (
            <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-stone-200 shadow-2xl space-y-4 text-xs">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold font-serif-luxury text-stone-900">
                    Remove Homepage Hero Slide?
                  </h3>
                  <p className="text-xs text-stone-600">
                    Are you sure you want to permanently delete the slide <strong className="text-stone-900">"{slideToDelete.title}"</strong>?
                  </p>
                </div>

                <div className="pt-2 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSlideToDelete(null)}
                    className="flex-1 py-2.5 border border-stone-300 rounded-xl text-stone-800 hover:bg-stone-100 font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(slideToDelete.id)}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow cursor-pointer transition-colors"
                  >
                    Yes, Remove Slide
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
