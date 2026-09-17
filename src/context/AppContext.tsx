import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Product,
  Category,
  Customer,
  Order,
  Coupon,
  WebsiteContent,
  CartItem,
  Address,
  PaymentMethod,
  OrderStatus,
  CustomerReview,
  InventoryLog,
  AdminActivityLog,
  InvoiceSettings,
  DEFAULT_INVOICE_SETTINGS
} from '../types';
import { storage } from '../services/storage';
import { cloudApi } from '../services/cloudApi';

export type AppView =
  | 'home'
  | 'shop'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'account'
  | 'auth'
  | 'wishlist'
  | 'offers'
  | 'about'
  | 'contact'
  | 'showrooms'
  | 'order-tracking'
  | 'admin'
  | 'admin-login'
  | 'invoice'
  | 'purchasing';

export interface FilterState {
  category: string;
  subcategory: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  minDiscount: number;
  material: string;
  color: string;
  size: string;
  availability: 'all' | 'in-stock' | 'low-stock';
  minRating: number;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'newest' | 'rating' | 'popular';
  searchQuery: string;
}

const DEFAULT_FILTERS: FilterState = {
  category: '',
  subcategory: '',
  brand: '',
  minPrice: 0,
  maxPrice: 100000,
  minDiscount: 0,
  material: '',
  color: '',
  size: '',
  availability: 'all',
  minRating: 0,
  sortBy: 'featured',
  searchQuery: ''
};

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface ComputedCartTotal {
  totalItems: number;
  subtotal: number;
  discount: number;
  couponDiscount: number;
  delivery: number;
  tax: number;
  total: number;
  grandTotal: number;
}

export interface AppContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  quickViewProductId: string | null;
  setQuickViewProductId: (id: string | null) => void;
  openProductDetail: (id: string) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (orderId: string | null) => void;
  openOrderDetail: (orderId: string) => void;

  // Catalogs and data
  products: Product[];
  categories: Category[];
  websiteContent: WebsiteContent;
  coupons: Coupon[];
  orders: Order[];
  inventoryLogs: InventoryLog[];
  refreshData: () => void;

  // Filters
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  selectCategoryFromHome: (categorySlugOrName: string, subcategory?: string) => void;

  // Customer & Auth
  customer: Customer | null;
  customers: Customer[];
  adminUser: { name: string; email: string; role: string } | null;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  refreshCustomer: () => void;
  loginCustomer: (identifier: string, pass: string) => boolean;
  loginCustomerWithPhone: (phone: string, name?: string) => boolean;
  registerCustomer: (name: string, email: string, phone: string, pass: string, address?: string) => boolean;
  logoutCustomer: () => void;
  customerLogout: () => void;
  updateCustomerProfile: (data: Partial<Customer>) => void;
  addCustomerAddress: (address: Address) => void;
  deleteCustomerAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;

  // Admin Actions
  loginAdmin: (email: string, pass: string) => Promise<boolean>;
  logoutAdmin: () => void;
  addProduct: (product: any) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addCategory: (category: any) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  renameSubcategory: (categoryId: string, oldSubName: string, newSubName: string) => boolean;
  deleteSubcategory: (categoryId: string, subcategoryName: string) => boolean;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addCoupon: (coupon: any) => void;
  deleteCoupon: (couponCode: string) => void;
  updateWebsiteContent: (data: Partial<WebsiteContent>) => void;

  // Order Actions
  placeOrder: (
    address: Address,
    paymentMethod: PaymentMethod | string,
    notes?: string,
    extraPaymentInfo?: {
      razorpayPaymentId?: string;
      razorpayHandle?: string;
      bankSettlementStatus?: 'Direct Settled to Bank' | 'Instant Settled' | 'Processing';
      paymentReference?: string;
    }
  ) => Order;
  cancelOrder: (orderId: string, reason?: string) => boolean;
  requestOrderReturn: (orderId: string, reason?: string) => boolean;

  // Cart & Wishlist
  cartItems: Array<{ product: Product; item: CartItem }>;
  cartTotal: ComputedCartTotal;
  cartItemCount: number;
  wishlistCount: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (productId: string, quantity?: number, color?: string, size?: string) => void;
  updateCartQuantity: (id: string, arg2: number) => void;
  removeFromCart: (id: string) => void;
  saveForLater: (cartItemId: string) => void;
  moveToCartFromSaved: (savedItemId: string) => void;
  toggleWishlist: (productId: string) => void;
  quickBuyNow: (productId: string, quantity?: number, color?: string, size?: string) => void;

  // Coupons
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;

  // UI Helpers
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  printOrderInvoice: (orderId: string) => void;
  invoiceToPrint: Order | null;
  setInvoiceToPrint: (order: Order | null) => void;

  // Customer Reviews & Ratings
  reviews: CustomerReview[];
  refreshReviews: () => void;
  addCustomerReview: (reviewData: Omit<CustomerReview, 'id' | 'date'> & { id?: string; date?: string }) => CustomerReview;
  deleteCustomerReview: (reviewId: string) => boolean;
  updateCustomerReviewStatus: (reviewId: string, status: 'published' | 'pending' | 'flagged', notes?: string) => boolean;

  // Admin Activity Tracking
  adminActivityLogs: AdminActivityLog[];
  addAdminActivityLog: (action: string, details: string, category: string) => void;
  clearAdminActivityLogs: () => void;

  // Invoice & Billing Settings
  invoiceSettings: InvoiceSettings;
  updateInvoiceSettings: (settings: Partial<InvoiceSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [invoiceToPrint, setInvoiceToPrint] = useState<Order | null>(null);

  // Core data from storage
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [websiteContent, setWebsiteContent] = useState<WebsiteContent>(storage.getContent());
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [adminActivityLogs, setAdminActivityLogs] = useState<AdminActivityLog[]>([]);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(() => {
    const saved = localStorage.getItem('cp_invoice_settings');
    if (saved) {
      try {
        return { ...DEFAULT_INVOICE_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_INVOICE_SETTINGS;
  });

  const refreshData = async () => {
    setProducts(storage.getProducts());
    setCategories(storage.getCategories());
    setWebsiteContent(storage.getContent());
    setCoupons(storage.getCoupons());
    setOrders(storage.getOrders());
    setCustomer(storage.getActiveCustomer());
    setCustomers(storage.getCustomers());
    setReviews(storage.getReviews());
    setInventoryLogs(storage.getInventoryLogs());
    setAdminActivityLogs(storage.getAdminActivityLogs());
    const adminToken = localStorage.getItem('cp_admin_session_token');
    if (adminToken) {
      try {
        const session = await cloudApi.adminSession(adminToken);
        setAdminUser(session.user || null);
        setIsAdmin(Boolean(session.user));
      } catch {
        localStorage.removeItem('cp_admin_session_token');
        setAdminUser(null);
        setIsAdmin(false);
      }
    } else {
      setAdminUser(null);
      setIsAdmin(false);
    }

    try {
      const [cloudProducts, cloudOrders, cloudContent] = await Promise.all([
        cloudApi.getProducts(),
        cloudApi.getOrders(),
        cloudApi.getContent()
      ]);
      setProducts(cloudProducts);
      setOrders(cloudOrders);

      // Securely merge cloud content while strictly preserving local admin image uploads
      if (cloudContent && cloudContent.festiveBanner) {
        const localCurrent = storage.getContent();
        const mergedContent = {
          ...cloudContent,
          festiveBanner: {
            ...cloudContent.festiveBanner,
            ...(localCurrent.festiveBanner?.image && localCurrent.festiveBanner.image !== ''
              ? { image: localCurrent.festiveBanner.image }
              : {})
          }
        };
        setWebsiteContent(mergedContent);
        storage.saveContent(mergedContent);
      }

      cloudProducts.forEach((product) => storage.saveProduct(product));
      cloudOrders.forEach((order) => storage.saveOrderToSecureBackup(order));
    } catch (error) {
      console.warn('Cloud sync unavailable; continuing with local cache.', error);
    }
  };

  useEffect(() => {
    void refreshData();
    const unsubscribe = cloudApi.subscribe(() => {
      void refreshData();
    });
    const syncTimer = window.setInterval(() => {
      void refreshData();
    }, 5000);

    return () => {
      unsubscribe();
      window.clearInterval(syncTimer);
    };
  }, []);

  const refreshCustomer = () => {
    setCustomer(storage.getActiveCustomer());
    setCustomers(storage.getCustomers());
    setOrders(storage.getOrders());
  };

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openProductDetail = (id: string) => {
    setSelectedProductId(id);
    storage.addRecentlyViewed(id);
    refreshCustomer();
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openOrderDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentView('order-tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const selectCategoryFromHome = (catIdentifier: string, subcategoryName?: string) => {
    const matched = categories.find(
      (c) => c.slug === catIdentifier || c.name.toLowerCase() === catIdentifier.toLowerCase()
    );
    setFilters({
      ...DEFAULT_FILTERS,
      category: matched ? matched.name : catIdentifier,
      subcategory: subcategoryName || ''
    });
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CART ITEMS COMPUTED
  const cartItems = useMemo(() => {
    if (!customer || !customer.cart) return [];
    return customer.cart
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        return { product, item };
      })
      .filter(Boolean) as Array<{ product: Product; item: CartItem }>;
  }, [customer, products]);

  // CART TOTALS COMPUTED
  const cartTotal = useMemo<ComputedCartTotal>(() => {
    const totalItems = cartItems.reduce((sum, ci) => sum + ci.item.quantity, 0);
    const subtotal = cartItems.reduce((sum, ci) => sum + ci.item.quantity * ci.product.salePrice, 0);

    let couponDiscount = 0;
    if (appliedCoupon && subtotal >= (appliedCoupon.minOrderValue || 0)) {
      if (appliedCoupon.discountType === 'percentage') {
        couponDiscount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
        if (appliedCoupon.maxDiscount && couponDiscount > appliedCoupon.maxDiscount) {
          couponDiscount = appliedCoupon.maxDiscount;
        }
      } else {
        couponDiscount = appliedCoupon.discountValue;
      }
    }
    couponDiscount = Math.min(couponDiscount, subtotal);

    const discount = couponDiscount;
    const delivery = subtotal > 25000 || subtotal === 0 ? 0 : 999;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableAmount * 0.18);
    const grandTotal = Math.max(0, taxableAmount + delivery);

    return {
      totalItems,
      subtotal,
      discount,
      couponDiscount,
      delivery,
      tax,
      total: grandTotal,
      grandTotal
    };
  }, [cartItems, appliedCoupon]);

  const addToCart = (productId: string, quantity = 1, color?: string, size?: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    if (prod.stock <= 0) {
      showToast(`${prod.name} is currently out of stock.`, 'warning');
      return;
    }

    const selColor = color || (prod.colors && prod.colors.length > 0 ? prod.colors[0].name : undefined);
    const selSize = size || (prod.sizes && prod.sizes.length > 0 ? prod.sizes[0] : undefined);

    storage.addToCart(productId, quantity, selColor, selSize);
    refreshCustomer();
    showToast(`Added ${prod.name} to your cart!`, 'success');
  };

  const updateCartQuantity = (id: string, arg2: number) => {
    const cust = storage.getActiveCustomer();
    if (!cust) return;

    const idx = cust.cart.findIndex((item) => item.id === id || item.productId === id);
    if (idx >= 0) {
      if (arg2 <= 0) {
        cust.cart.splice(idx, 1);
        showToast('Item removed from cart', 'info');
      } else {
        const prod = products.find((p) => p.id === cust.cart[idx].productId);
        const maxStock = prod ? prod.stock : 99;
        cust.cart[idx].quantity = Math.min(arg2, maxStock);
      }
      storage.updateCustomer(cust);
      refreshCustomer();
    }
  };

  const removeFromCart = (id: string) => {
    const cust = storage.getActiveCustomer();
    if (!cust) return;
    cust.cart = cust.cart.filter((item) => item.id !== id && item.productId !== id);
    storage.updateCustomer(cust);
    refreshCustomer();
    showToast('Item removed from cart', 'info');
  };

  const saveForLater = (cartItemId: string) => {
    storage.saveForLater(cartItemId);
    refreshCustomer();
    showToast('Saved item for later', 'info');
  };

  const moveToCartFromSaved = (savedItemId: string) => {
    storage.moveToCartFromSaved(savedItemId);
    refreshCustomer();
    showToast('Item moved back to cart', 'success');
  };

  const toggleWishlist = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const added = storage.toggleWishlist(productId);
    refreshCustomer();
    if (added) {
      showToast(`Added ${prod?.name || 'piece'} to your wishlist`, 'success');
    } else {
      showToast(`Removed from your wishlist`, 'info');
    }
  };

  const quickBuyNow = (productId: string, quantity = 1, color?: string, size?: string) => {
    addToCart(productId, quantity, color, size);
    setIsCartDrawerOpen(false);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // COUPON APPLICATION
  const applyCoupon = (code: string): boolean => {
    const trimmed = code.trim().toUpperCase();
    const result = storage.validateCoupon(trimmed, cartTotal.subtotal);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      showToast(result.message, 'success');
      return true;
    } else {
      showToast(result.message || 'Invalid coupon code.', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed from cart.', 'info');
  };

  // ORDER PLACEMENT
  const placeOrder = (
    address: Address,
    paymentMethod: PaymentMethod | string,
    notes?: string,
    extraPaymentInfo?: {
      razorpayPaymentId?: string;
      razorpayHandle?: string;
      bankSettlementStatus?: 'Direct Settled to Bank' | 'Instant Settled' | 'Processing';
      paymentReference?: string;
    }
  ): Order => {
    const currentCust = storage.getActiveCustomer() || customer;
    if (!currentCust || cartItems.length === 0) {
      throw new Error('Cannot place order: cart is empty or customer not found.');
    }

    const orderItems = cartItems.map(({ product, item }) => ({
      productId: product.id,
      name: product.name,
      productName: product.name,
      image: product.images[0] || '',
      productImage: product.images[0] || '',
      sku: product.sku,
      quantity: item.quantity,
      price: product.salePrice,
      color: item.selectedColor,
      selectedColor: item.selectedColor,
      size: item.selectedSize,
      selectedSize: item.selectedSize,
      subtotal: product.salePrice * item.quantity,
      totalPrice: product.salePrice * item.quantity
    }));

    const isCod = paymentMethod === 'Cash on Delivery' || paymentMethod === 'cod';

    const created = storage.createOrder({
      customerId: currentCust.id,
      customerName: address.name || currentCust.name,
      customerEmail: currentCust.email,
      customerPhone: address.phone || currentCust.phone,
      items: orderItems as any,
      shippingAddress: address,
      deliveryMethod: 'CP White-Glove Direct',
      deliveryCharge: cartTotal.delivery,
      subtotal: cartTotal.subtotal,
      discount: cartTotal.discount,
      couponCode: appliedCoupon?.code,
      tax: cartTotal.tax,
      grandTotal: cartTotal.grandTotal,
      paymentMethod: paymentMethod as any,
      paymentStatus: isCod ? 'Pending' : 'Paid',
      razorpayPaymentId: extraPaymentInfo?.razorpayPaymentId,
      razorpayHandle: extraPaymentInfo?.razorpayHandle || (paymentMethod.includes('Razorpay') ? 'razorpay.me/@anandhanchandru' : undefined),
      bankSettlementStatus: extraPaymentInfo?.bankSettlementStatus || (paymentMethod.includes('Razorpay') ? 'Direct Settled to Bank' : undefined),
      paymentReference: extraPaymentInfo?.paymentReference,
      orderStatus: 'Pending',
      notes
    });

    const enrichedOrder: Order = {
      ...created,
      total: created.grandTotal,
      estimatedDelivery: new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      items: created.items.map((it: any) => ({
        ...it,
        productName: it.name || it.productName,
        productImage: it.image || it.productImage
      }))
    } as any;

    setAppliedCoupon(null);
    refreshData();
    void cloudApi.createOrder(enrichedOrder).then(() => refreshData()).catch((error) => {
      console.warn('Order cloud sync failed:', error);
    });
    showToast(`Order #${created.orderNumber} placed successfully! Status: Pending showroom verification.`, 'success');
    return enrichedOrder;
  };

  const cancelOrder = (orderId: string, reason = 'Cancelled by customer'): boolean => {
    const ok = storage.cancelOrder(orderId, reason);
    if (ok) {
      refreshData();
      showToast('Order cancellation initiated successfully.', 'info');
    } else {
      showToast('This order has already been dispatched and cannot be cancelled directly.', 'warning');
    }
    return ok;
  };

  const requestOrderReturn = (orderId: string, reason = 'Return requested by customer'): boolean => {
    const ok = storage.requestReturn(orderId, reason);
    if (ok) {
      refreshData();
      showToast('Return request submitted. Our team will contact you within 24 hours.', 'info');
    } else {
      showToast('Return can only be requested for delivered orders.', 'warning');
    }
    return ok;
  };

  // CUSTOMER AUTH & PROFILE
  const loginCustomer = (identifier: string, pass: string): boolean => {
    const res = storage.loginCustomer(identifier, pass);
    if (res.success && res.customer) {
      refreshCustomer();
      showToast(res.message, 'success');
      return true;
    } else {
      showToast(res.message, 'error');
      return false;
    }
  };

  const loginCustomerWithPhone = (phone: string, name?: string): boolean => {
    const res = storage.loginCustomerWithPhone(phone, name);
    if (res.success && res.customer) {
      refreshCustomer();
      showToast(res.message, 'success');
      return true;
    } else {
      showToast(res.message, 'error');
      return false;
    }
  };

  const registerCustomer = (name: string, email: string, phone: string, pass: string, address?: string): boolean => {
    const res = storage.registerCustomer({ name, email, phone, password: pass, address });
    if (res.success && res.customer) {
      refreshCustomer();
      showToast(res.message, 'success');
      return true;
    } else {
      showToast(res.message, 'error');
      return false;
    }
  };

  const logoutCustomer = () => {
    storage.logoutCustomer();
    refreshCustomer();
    showToast('You have been signed out.', 'info');
    setCurrentView('home');
  };

  const customerLogout = logoutCustomer;

  const updateCustomerProfile = (data: Partial<Customer>) => {
    const cust = storage.getActiveCustomer();
    if (!cust) return;
    const updated = { ...cust, ...data };
    storage.updateCustomer(updated);
    refreshCustomer();
    showToast('Profile updated successfully!', 'success');
  };

  const addCustomerAddress = (newAddr: Address) => {
    const cust = storage.getActiveCustomer();
    if (!cust) return;
    if (newAddr.isDefault) {
      cust.addresses.forEach((a) => (a.isDefault = false));
    }
    cust.addresses.push(newAddr);
    storage.updateCustomer(cust);
    refreshCustomer();
    showToast('New delivery address saved!', 'success');
  };

  const deleteCustomerAddress = (addrId: string) => {
    const cust = storage.getActiveCustomer();
    if (!cust) return;
    cust.addresses = cust.addresses.filter((a) => a.id !== addrId);
    storage.updateCustomer(cust);
    refreshCustomer();
    showToast('Address removed.', 'info');
  };

  const setDefaultAddress = (addrId: string) => {
    const cust = storage.getActiveCustomer();
    if (!cust) return;
    cust.addresses.forEach((a) => {
      a.isDefault = a.id === addrId;
    });
    storage.updateCustomer(cust);
    refreshCustomer();
    showToast('Default delivery address updated.', 'success');
  };

  // ADMIN OPERATIONS
  const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
    try {
      const result = await cloudApi.adminLogin(email, pass);
      if (!result.success || !result.user) throw new Error('Invalid credentials');
      const admin = result.user;
      setAdminUser(admin);
      setIsAdmin(true);
      if (result.token) localStorage.setItem('cp_admin_session_token', result.token);
      showToast('Admin access authorized. Welcome to Showroom Backoffice.', 'success');
      return true;
    } catch {
      showToast('Invalid admin credentials or authentication service unavailable.', 'error');
      return false;
    }
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    setIsAdmin(false);
    localStorage.removeItem('cp_admin_session_token');
    storage.adminLogout();
    showToast('Admin session terminated.', 'info');
    setCurrentView('home');
  };

  const addAdminActivityLog = (action: string, details: string, category: string) => {
    storage.addAdminActivityLog({
      action,
      details,
      category,
      adminEmail: adminUser?.email || 'admin@cpfurniture.com'
    });
    refreshData();
  };

  const clearAdminActivityLogs = () => {
    storage.clearAdminActivityLogs();
    refreshData();
  };

  const addProduct = (prod: any) => {
    const newProd: Product = {
      ...prod,
      id: prod.id || `prod-${Date.now()}`,
      rating: prod.rating || 5.0,
      reviewCount: prod.reviewCount || 0,
      isPublished: true,
      isNewArrival: prod.isNewArrival !== undefined ? prod.isNewArrival : true
    };
    storage.saveProduct(newProd);
    void cloudApi.saveProduct(newProd).then(() => refreshData()).catch((error) => {
      console.warn('Product cloud sync failed:', error);
    });
    storage.addAdminActivityLog({
      action: 'Product Added',
      details: `Added new piece "${newProd.name}" (SKU: ${newProd.sku}) to ${newProd.category} at ₹${newProd.salePrice.toLocaleString()}`,
      category: 'product',
      adminEmail: adminUser?.email || 'admin@cpfurniture.com'
    });
    refreshData();
    showToast(`Product "${newProd.name}" added successfully! Visible on customer storefront.`, 'success');
  };

  const updateProduct = (prod: Product) => {
    storage.saveProduct(prod);
    void cloudApi.saveProduct(prod).then(() => refreshData()).catch((error) => {
      console.warn('Product cloud sync failed:', error);
    });
    storage.addAdminActivityLog({
      action: 'Product Updated',
      details: `Updated details and stock (${prod.stock} left) for "${prod.name}" (SKU: ${prod.sku})`,
      category: 'product',
      adminEmail: adminUser?.email || 'admin@cpfurniture.com'
    });
    refreshData();
    showToast(`Product "${prod.name}" updated successfully.`, 'success');
  };

  const deleteProduct = (prodId: string) => {
    const name = storage.getProductById(prodId)?.name || prodId;
    storage.deleteProduct(prodId);
    void cloudApi.deleteProduct(prodId).then(() => refreshData()).catch((error) => {
      console.warn('Product deletion cloud sync failed:', error);
    });
    storage.addAdminActivityLog({
      action: 'Product Deleted',
      details: `Removed "${name}" (ID: ${prodId}) from the catalog`,
      category: 'product',
      adminEmail: adminUser?.email || 'admin@cpfurniture.com'
    });
    refreshData();
    showToast('Product removed from catalog.', 'info');
  };

  const addCategory = (cat: any) => {
    const newCat: Category = {
      ...cat,
      id: cat.id || `cat-${Date.now()}`
    };
    storage.saveCategory(newCat);
    storage.addAdminActivityLog({
      action: 'Category Added',
      details: `Created new department "${newCat.name}" with initial setup`,
      category: 'category',
      adminEmail: adminUser?.email || 'admin@cpfurniture.com'
    });
    refreshData();
    showToast(`Category "${newCat.name}" added to catalog navigation.`, 'success');
  };

  const updateCategory = (cat: Category) => {
    storage.saveCategory(cat);
    storage.addAdminActivityLog({
      action: 'Category Updated',
      details: `Modified department "${cat.name}" layout details or image banner`,
      category: 'category',
      adminEmail: adminUser?.email || 'admin@cpfurniture.com'
    });
    refreshData();
    showToast(`Category "${cat.name}" updated.`, 'success');
  };

  const deleteCategory = (catId: string) => {
    const name = categories.find((c) => c.id === catId)?.name || catId;
    storage.deleteCategory(catId);
    storage.addAdminActivityLog({
      action: 'Category Deleted',
      details: `Deleted department "${name}" (ID: ${catId}) from taxonomy`,
      category: 'category',
      adminEmail: adminUser?.email || 'admin@cpfurniture.com'
    });
    refreshData();
    showToast('Category deleted.', 'info');
  };

  const renameSubcategory = (catId: string, oldSub: string, newSub: string): boolean => {
    const trimmedNew = newSub.trim();
    if (!trimmedNew) {
      showToast('Subcategory name cannot be empty.', 'error');
      return false;
    }
    const result = storage.renameSubcategory(catId, oldSub, trimmedNew);
    if (result.success) {
      storage.addAdminActivityLog({
        action: 'Subcategory Renamed',
        details: `Renamed subcategory "${oldSub}" to "${trimmedNew}" across ${result.count} products`,
        category: 'category',
        adminEmail: adminUser?.email || 'admin@cpfurniture.com'
      });
      refreshData();
      showToast(
        `Subcategory updated to "${trimmedNew}". Synchronized across ${result.count} product(s) in catalog.`,
        'success'
      );
      return true;
    }
    showToast('Failed to update subcategory.', 'error');
    return false;
  };

  const deleteSubcategory = (catId: string, subName: string): boolean => {
    const trimmedSub = (subName || '').trim();
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
            ...c,
            subcategories: (c.subcategories || []).filter(
              (s) => s && s.trim() !== trimmedSub && s !== subName
            )
          }
          : c
      )
    );

    const result = storage.deleteSubcategory(catId, subName);
    if (result.success) {
      storage.addAdminActivityLog({
        action: 'Subcategory Deleted',
        details: `Deleted subcategory "${trimmedSub}" from category ID: ${catId}`,
        category: 'category',
        adminEmail: adminUser?.email || 'admin@cpfurniture.com'
      });
      refreshData();
      if (result.count > 0) {
        showToast(
          `Subcategory "${trimmedSub}" removed (unlinked from ${result.count} product(s)).`,
          'info'
        );
      } else {
        showToast(`Subcategory "${trimmedSub}" removed successfully.`, 'info');
      }
      return true;
    }
    showToast('Failed to remove subcategory.', 'error');
    return false;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    storage.updateOrderStatus(orderId, status);
    void cloudApi.updateOrderStatus(orderId, status).then(() => refreshData()).catch((error) => {
      console.warn('Order status cloud sync failed:', error);
    });
    storage.addAdminActivityLog({
      action: 'Order Fulfilled',
      details: `Updated Order ID #${orderId} status to "${status}"`,
      category: 'order',
      adminEmail: adminUser?.email || 'admin@cpfurniture.com'
    });
    refreshData();
    showToast(`Order status updated to "${status}".`, 'success');
  };

  const addCoupon = (coupon: any) => {
    storage.saveCoupon(coupon);
    storage.addAdminActivityLog({
      action: 'Coupon Created',
      details: `Created promo discount code "${coupon.code}" (${coupon.discountValue}% Off)`,
      category: 'coupon',
      adminEmail: adminUser?.email || 'admin@cpfurniture.com'
    });
    refreshData();
    showToast(`Coupon code ${coupon.code} created!`, 'success');
  };

  const deleteCoupon = (couponCode: string) => {
    storage.deleteCoupon(couponCode);
    storage.addAdminActivityLog({
      action: 'Coupon Deleted',
      details: `Removed promo code "${couponCode}"`,
      category: 'coupon',
      adminEmail: adminUser?.email || 'admin@cpfurniture.com'
    });
    refreshData();
    showToast(`Coupon ${couponCode} deleted.`, 'info');
  };

  const updateWebsiteContent = (data: Partial<WebsiteContent>) => {
    const current = storage.getContent();
    const updated = {
      ...current,
      ...data,
      festiveBanner: {
        ...(current.festiveBanner || {}),
        ...(data.festiveBanner || {})
      }
    };
    storage.saveContent(updated);
    storage.addAdminActivityLog({
      action: 'Content Updated',
      details: `Modified storefront configuration settings or homepage sliders`,
      category: 'banner',
      adminEmail: adminUser?.email || 'admin@cpfurniture.com'
    });
    setWebsiteContent(updated);
    void cloudApi.saveContent(updated).then(() => refreshData()).catch((error) => {
      console.warn('Website content cloud sync failed:', error);
    });
    refreshData();
    showToast('Showroom storefront configuration saved!', 'success');
  };

  const printOrderInvoice = (orderId: string) => {
    const order = storage.getOrderById(orderId) || orders.find((o) => o.id === orderId);
    if (order) {
      setInvoiceToPrint(order);
      setSelectedOrderId(orderId);
      setCurrentView('invoice');
      setTimeout(() => {
        try {
          window.print();
        } catch (e) {
          console.warn('Auto print dialog error:', e);
        }
      }, 400);
    } else {
      showToast('Order details not found for invoice printing.', 'error');
    }
  };

  // CUSTOMER REVIEWS & MODERATION
  const refreshReviews = () => {
    setReviews(storage.getReviews());
    setProducts(storage.getProducts());
  };

  const addCustomerReview = (
    reviewData: Omit<CustomerReview, 'id' | 'date'> & { id?: string; date?: string }
  ) => {
    const created = storage.addReview(reviewData);
    refreshReviews();
    refreshCustomer();
    showToast('Your review has been published and added to CP Furniture verified reviews!', 'success');
    return created;
  };

  const deleteCustomerReview = (reviewId: string) => {
    const res = storage.deleteReview(reviewId);
    if (res) {
      refreshReviews();
      showToast('Customer review removed successfully.', 'info');
    }
    return res;
  };

  const updateCustomerReviewStatus = (
    reviewId: string,
    status: 'published' | 'pending' | 'flagged',
    notes?: string
  ) => {
    const res = storage.updateReviewStatus(reviewId, status, notes);
    if (res) {
      refreshReviews();
      showToast(`Review status updated to ${status}.`, 'success');
    }
    return res;
  };

  const updateInvoiceSettings = (settings: Partial<InvoiceSettings>) => {
    setInvoiceSettings((prev) => {
      const updated = { ...prev, ...settings };
      localStorage.setItem('cp_invoice_settings', JSON.stringify(updated));
      return updated;
    });
    showToast('Invoice & Billing details updated successfully!', 'success');
  };

  const cartItemCount = customer?.cart ? customer.cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const wishlistCount = customer?.wishlist ? customer.wishlist.length : 0;

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedProductId,
        setSelectedProductId,
        quickViewProductId,
        setQuickViewProductId,
        openProductDetail,
        selectedOrderId,
        setSelectedOrderId,
        openOrderDetail,
        products,
        categories,
        websiteContent,
        coupons,
        orders,
        inventoryLogs,
        refreshData,
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        selectCategoryFromHome,
        customer,
        customers,
        adminUser,
        isAdmin,
        setIsAdmin,
        refreshCustomer,
        loginCustomer,
        loginCustomerWithPhone,
        registerCustomer,
        logoutCustomer,
        customerLogout,
        updateCustomerProfile,
        addCustomerAddress,
        deleteCustomerAddress,
        setDefaultAddress,
        loginAdmin,
        logoutAdmin,
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
        placeOrder,
        cancelOrder,
        requestOrderReturn,
        cartItems,
        cartTotal,
        cartItemCount,
        wishlistCount,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        saveForLater,
        moveToCartFromSaved,
        toggleWishlist,
        quickBuyNow,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        isSearchOpen,
        setIsSearchOpen,
        toasts,
        showToast,
        removeToast,
        printOrderInvoice,
        invoiceToPrint,
        setInvoiceToPrint,
        reviews,
        refreshReviews,
        addCustomerReview,
        deleteCustomerReview,
        updateCustomerReviewStatus,
        adminActivityLogs,
        addAdminActivityLog,
        clearAdminActivityLogs,
        invoiceSettings,
        updateInvoiceSettings
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};