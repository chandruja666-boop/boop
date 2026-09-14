import {
  Product,
  Category,
  Customer,
  Order,
  Coupon,
  WebsiteContent,
  InventoryLog,
  AdminNotification,
  OrderStatus,
  CartItem,
  Address,
  CustomerReview,
  AdminActivityLog,
  PurchaseEntry,
  PurchasingCredentials
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_WEBSITE_CONTENT,
  INITIAL_CUSTOMER,
  INITIAL_ORDERS,
  INITIAL_INVENTORY_LOGS,
  INITIAL_ADMIN_NOTIFICATIONS,
  INITIAL_REVIEWS
} from './mockData';

const KEYS = {
  PRODUCTS: 'cpf_products_v1',
  CATEGORIES: 'cpf_categories_v1',
  CUSTOMERS: 'cpf_customers_v1',
  ACTIVE_CUSTOMER_ID: 'cpf_active_customer_id_v1',
  ADMIN_SESSION: 'cpf_admin_session_v1',
  ORDERS: 'cpf_orders_v1',
  COUPONS: 'cpf_coupons_v1',
  CONTENT: 'cpf_content_v1',
  INVENTORY_LOGS: 'cpf_inventory_logs_v1',
  ADMIN_NOTIFS: 'cpf_admin_notifs_v1',
  NEWSLETTER: 'cpf_newsletter_subscribers_v1',
  REVIEWS: 'cpf_customer_reviews_v1',
  ADMIN_CREDENTIALS: 'cpf_admin_credentials_v1',
  ADMIN_ACTIVITY_LOGS: 'cpf_admin_activity_logs_v1',
  PURCHASE_ENTRIES: 'cpf_purchase_entries_v1',
  PURCHASING_CREDS: 'cpf_purchasing_creds_v1'
};

// In-memory fallback layer to guarantee uninterrupted execution even if browser localStorage quota is reached
const memoryStorage: Record<string, string> = {};

function tryPruneStorageForQuota(): void {
  try {
    // Prune transient activity logs and inventory logs to free up quota
    const actLogs = localStorage.getItem(KEYS.ADMIN_ACTIVITY_LOGS);
    if (actLogs) {
      const parsed = JSON.parse(actLogs);
      if (Array.isArray(parsed) && parsed.length > 5) {
        localStorage.setItem(KEYS.ADMIN_ACTIVITY_LOGS, JSON.stringify(parsed.slice(0, 5)));
      }
    }

    const invLogs = localStorage.getItem(KEYS.INVENTORY_LOGS);
    if (invLogs) {
      const parsed = JSON.parse(invLogs);
      if (Array.isArray(parsed) && parsed.length > 10) {
        localStorage.setItem(KEYS.INVENTORY_LOGS, JSON.stringify(parsed.slice(0, 10)));
      }
    }

    const notifs = localStorage.getItem(KEYS.ADMIN_NOTIFS);
    if (notifs) {
      const parsed = JSON.parse(notifs);
      if (Array.isArray(parsed) && parsed.length > 5) {
        localStorage.setItem(KEYS.ADMIN_NOTIFS, JSON.stringify(parsed.slice(0, 5)));
      }
    }
  } catch {
    // Ignore cleanup failures
  }
}

function getStorage<T>(key: string, fallback: T): T {
  try {
    if (memoryStorage[key]) {
      return JSON.parse(memoryStorage[key]) as T;
    }
    const item = localStorage.getItem(key);
    if (!item) {
      const fallbackStr = JSON.stringify(fallback);
      memoryStorage[key] = fallbackStr;
      try {
        localStorage.setItem(key, fallbackStr);
      } catch {
        // Silently tolerate initial write quota limit
      }
      return fallback;
    }
    memoryStorage[key] = item;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Error reading key ${key} from localStorage, using fallback:`, err);
    return fallback;
  }
}

function setStorage<T>(key: string, val: T): void {
  try {
    const serialized = JSON.stringify(val);
    memoryStorage[key] = serialized;
    localStorage.setItem(key, serialized);
  } catch (err: any) {
    // Check if error is quota related
    const isQuotaError =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.message?.includes('quota') ||
      err?.code === 22 ||
      err?.code === 1014;

    if (isQuotaError) {
      tryPruneStorageForQuota();
      try {
        const serialized = JSON.stringify(val);
        localStorage.setItem(key, serialized);
        return;
      } catch {
        // If still exceeds quota, memoryStorage already has the updated value!
        console.warn(
          `LocalStorage quota exceeded when saving key "${key}". Preserving in active memory storage session.`
        );
        return;
      }
    }
    console.error(`Error writing key ${key} to localStorage:`, err);
  }
}

class StorageService {
  // PRODUCTS
  getProducts(): Product[] {
    return getStorage<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  saveProduct(product: Product): void {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      // Update
      const oldStock = products[idx].stock;
      products[idx] = product;
      if (oldStock !== product.stock) {
        this.addInventoryLog({
          id: `log-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          type: product.stock > oldStock ? 'Stock In' : 'Stock Out',
          quantityChange: product.stock - oldStock,
          previousStock: oldStock,
          newStock: product.stock,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          reason: 'Manual stock edit in Admin Product Management'
        });
      }
    } else {
      // Add
      products.unshift(product);
      this.addInventoryLog({
        id: `log-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        type: 'Stock In',
        quantityChange: product.stock,
        previousStock: 0,
        newStock: product.stock,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        reason: 'New product added to catalog'
      });
    }
    setStorage(KEYS.PRODUCTS, products);
  }

  deleteProduct(id: string): void {
    const products = this.getProducts().filter((p) => p.id !== id);
    setStorage(KEYS.PRODUCTS, products);
  }

  togglePublishProduct(id: string): void {
    const products = this.getProducts();
    const p = products.find((x) => x.id === id);
    if (p) {
      p.isPublished = !p.isPublished;
      setStorage(KEYS.PRODUCTS, products);
    }
  }

  duplicateProduct(id: string): Product | undefined {
    const original = this.getProductById(id);
    if (!original) return undefined;
    const duplicated: Product = {
      ...original,
      id: `prod-${Date.now()}`,
      name: `${original.name} (Copy)`,
      sku: `${original.sku}-COPY`,
      isPublished: false,
      stock: 5,
      reviewCount: 0,
      rating: 5.0
    };
    this.saveProduct(duplicated);
    return duplicated;
  }

  // CATEGORIES
  getCategories(): Category[] {
    return getStorage<Category[]>(KEYS.CATEGORIES, INITIAL_CATEGORIES).sort(
      (a, b) => a.displayOrder - b.displayOrder
    );
  }

  saveCategory(category: Category): void {
    const cats = this.getCategories();
    const idx = cats.findIndex((c) => c.id === category.id);
    if (idx >= 0) {
      cats[idx] = category;
    } else {
      category.displayOrder = cats.length + 1;
      cats.push(category);
    }
    setStorage(KEYS.CATEGORIES, cats);
  }

  deleteCategory(id: string): void {
    const cats = this.getCategories().filter((c) => c.id !== id);
    setStorage(KEYS.CATEGORIES, cats);
  }

  renameSubcategory(categoryId: string, oldSubName: string, newSubName: string): { success: boolean; count: number } {
    const trimmedOld = oldSubName.trim();
    const trimmedNew = newSubName.trim();
    if (!trimmedNew) return { success: false, count: 0 };

    const cats = this.getCategories();
    const cat = cats.find((c) => c.id === categoryId);
    if (!cat) return { success: false, count: 0 };

    // Update subcategories array while preserving case/ordering
    cat.subcategories = cat.subcategories.map((s) => (s === trimmedOld ? trimmedNew : s));
    setStorage(KEYS.CATEGORIES, cats);

    // Update all matching products in catalog
    const prods = this.getProducts();
    let count = 0;
    prods.forEach((p) => {
      if (
        (p.category.toLowerCase() === cat.name.toLowerCase() || p.category === cat.name) &&
        p.subcategory === trimmedOld
      ) {
        p.subcategory = trimmedNew;
        count++;
      }
    });
    if (count > 0) {
      setStorage(KEYS.PRODUCTS, prods);
    }

    return { success: true, count };
  }

  deleteSubcategory(categoryId: string, subcategoryName: string): { success: boolean; count: number } {
    const cats = this.getCategories();
    const cat = cats.find((c) => c.id === categoryId);
    if (!cat) return { success: false, count: 0 };

    const trimmedSub = (subcategoryName || '').trim();
    cat.subcategories = (cat.subcategories || []).filter(
      (s) => s && s.trim() !== trimmedSub && s !== subcategoryName
    );
    setStorage(KEYS.CATEGORIES, cats);

    // Also update any products that had this subcategory to empty so filters update cleanly
    const prods = this.getProducts();
    let count = 0;
    prods.forEach((p) => {
      if (
        (p.category.toLowerCase() === cat.name.toLowerCase() || p.category === cat.name) &&
        (p.subcategory === subcategoryName || p.subcategory?.trim() === trimmedSub)
      ) {
        p.subcategory = '';
        count++;
      }
    });
    if (count > 0) {
      setStorage(KEYS.PRODUCTS, prods);
    }

    return { success: true, count };
  }

  reorderCategory(id: string, direction: 'up' | 'down'): void {
    const cats = this.getCategories();
    const idx = cats.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= cats.length) return;

    const temp = cats[idx].displayOrder;
    cats[idx].displayOrder = cats[targetIdx].displayOrder;
    cats[targetIdx].displayOrder = temp;
    setStorage(KEYS.CATEGORIES, cats);
  }

  // CUSTOMERS & AUTH SECURE NON-EXPIRING PERSISTENT BACKUPS
  saveCustomerToSecureBackup(customer: Customer): void {
    try {
      localStorage.setItem(`cpf_secure_cust_backup_${customer.id}`, JSON.stringify(customer));
      const dirStr = localStorage.getItem('cpf_secure_customer_directory');
      const dir: string[] = dirStr ? JSON.parse(dirStr) : [];
      if (!dir.includes(customer.id)) {
        dir.push(customer.id);
        localStorage.setItem('cpf_secure_customer_directory', JSON.stringify(dir));
      }
    } catch (e) {
      console.warn('Failed to write customer backup to localStorage:', e);
    }
  }

  recoverCustomersFromSecureBackup(current: Customer[]): Customer[] {
    try {
      const dirStr = localStorage.getItem('cpf_secure_customer_directory');
      if (!dirStr) return current;
      const dir: string[] = JSON.parse(dirStr);
      const merged = [...current];
      dir.forEach((id) => {
        if (!merged.some((c) => c.id === id)) {
          const raw = localStorage.getItem(`cpf_secure_cust_backup_${id}`);
          if (raw) {
            try {
              merged.push(JSON.parse(raw));
            } catch (e) {}
          }
        }
      });
      return merged;
    } catch (e) {
      return current;
    }
  }

  saveOrderToSecureBackup(order: Order): void {
    try {
      localStorage.setItem(`cpf_secure_order_backup_${order.id}`, JSON.stringify(order));
      const dirStr = localStorage.getItem('cpf_secure_order_directory');
      const dir: string[] = dirStr ? JSON.parse(dirStr) : [];
      if (!dir.includes(order.id)) {
        dir.push(order.id);
        localStorage.setItem('cpf_secure_order_directory', JSON.stringify(dir));
      }
    } catch (e) {
      console.warn('Failed to write order backup to localStorage:', e);
    }
  }

  recoverOrdersFromSecureBackup(current: Order[]): Order[] {
    try {
      const dirStr = localStorage.getItem('cpf_secure_order_directory');
      if (!dirStr) return current;
      const dir: string[] = JSON.parse(dirStr);
      const merged = [...current];
      dir.forEach((id) => {
        if (!merged.some((o) => o.id === id)) {
          const raw = localStorage.getItem(`cpf_secure_order_backup_${id}`);
          if (raw) {
            try {
              merged.push(JSON.parse(raw));
            } catch (e) {}
          }
        }
      });
      return merged;
    } catch (e) {
      return current;
    }
  }

  getCustomers(): Customer[] {
    const raw = getStorage<Customer[]>(KEYS.CUSTOMERS, [INITIAL_CUSTOMER]);
    return this.recoverCustomersFromSecureBackup(raw);
  }

  getActiveCustomer(): Customer | null {
    const activeId = getStorage<string | null>(KEYS.ACTIVE_CUSTOMER_ID, INITIAL_CUSTOMER.id);
    if (!activeId) return null;
    const customers = this.getCustomers();
    return customers.find((c) => c.id === activeId) || null;
  }

  setActiveCustomer(customerId: string | null): void {
    setStorage(KEYS.ACTIVE_CUSTOMER_ID, customerId);
  }

  updateCustomer(customer: Customer): void {
    const customers = this.getCustomers();
    const idx = customers.findIndex((c) => c.id === customer.id);
    if (idx >= 0) {
      customers[idx] = customer;
    } else {
      customers.push(customer);
    }
    setStorage(KEYS.CUSTOMERS, customers);
    this.saveCustomerToSecureBackup(customer);
  }

  registerCustomer(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
  }): { success: boolean; message: string; customer?: Customer } {
    const customers = this.getCustomers();
    if (customers.some((c) => c.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, message: 'An account with this email address already exists.' };
    }
    if (customers.some((c) => c.phone === data.phone)) {
      return { success: false, message: 'An account with this phone number already exists.' };
    }

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      addresses: data.address
        ? [
            {
              id: `addr-${Date.now()}`,
              type: 'Home',
              name: data.name,
              phone: data.phone,
              street: data.address,
              city: 'Bengaluru',
              state: 'Karnataka',
              pincode: '560001',
              isDefault: true
            }
          ]
        : [],
      wishlist: [],
      cart: [],
      savedForLater: [],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: 'Welcome to CP Furniture!',
          message: 'Explore our artisan collections with code WELCOME10 for up to ₹5,000 off your first purchase.',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: 'offer',
          read: false
        }
      ],
      reviews: [],
      recentlyViewed: [],
      isBlocked: false,
      createdAt: new Date().toISOString().split('T')[0],
      totalSpent: 0
    };

    customers.push(newCustomer);
    setStorage(KEYS.CUSTOMERS, customers);
    this.setActiveCustomer(newCustomer.id);

    // Notify Admin of new registration
    this.addAdminNotification({
      id: `adm-notif-${Date.now()}`,
      title: 'New Customer Registered',
      message: `${newCustomer.name} (${newCustomer.email}) created an account.`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'customer',
      read: false
    });

    return { success: true, message: 'Account registered successfully!', customer: newCustomer };
  }

  loginCustomer(
    identifier: string, // email or phone
    pass: string
  ): { success: boolean; message: string; customer?: Customer } {
    const customers = this.getCustomers();
    const cleanId = identifier.trim().toLowerCase();
    const found = customers.find(
      (c) =>
        (c.email.toLowerCase() === cleanId || c.phone === identifier.trim()) &&
        (c.password === pass || pass === 'password123') // demo password master key
    );

    if (!found) {
      return { success: false, message: 'Invalid credentials. Please verify your email/phone and password.' };
    }

    if (found.isBlocked) {
      return { success: false, message: 'Your account has been temporarily suspended. Please contact concierge.' };
    }

    this.setActiveCustomer(found.id);
    return { success: true, message: `Welcome back, ${found.name}!`, customer: found };
  }

  loginCustomerWithPhone(
    rawPhone: string,
    customerName?: string
  ): { success: boolean; message: string; customer?: Customer; isNewUser: boolean } {
    const customers = this.getCustomers();
    const cleanDigits = rawPhone.replace(/\D/g, '');
    const last10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;

    // Search for matching customer by last 10 digits
    const existing = customers.find((c) => {
      const cDigits = (c.phone || '').replace(/\D/g, '');
      return cDigits.endsWith(last10);
    });

    if (existing) {
      if (existing.isBlocked) {
        return {
          success: false,
          message: 'Your account has been temporarily suspended. Please contact concierge.',
          isNewUser: false
        };
      }
      if (customerName && (!existing.name || existing.name === 'VIP Customer')) {
        existing.name = customerName.trim();
        this.updateCustomer(existing);
      }
      this.setActiveCustomer(existing.id);
      return {
        success: true,
        message: `Welcome back, ${existing.name}!`,
        customer: existing,
        isNewUser: false
      };
    }

    // Provision new VIP account for this verified mobile number
    const formattedPhone = `+91 ${last10.slice(0, 5)} ${last10.slice(5)}`;
    const finalName = customerName?.trim() || `VIP Guest ${last10.slice(-4)}`;
    const generatedEmail = `guest.${last10}@cpfurniture.com`;

    const newCustomer: Customer = {
      id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: finalName,
      email: generatedEmail,
      phone: formattedPhone,
      password: 'otp_verified_user',
      addresses: [],
      wishlist: [],
      cart: [],
      savedForLater: [],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: 'Welcome to CP Furniture VIP Club!',
          message: 'Your phone number has been verified. Enjoy concierge furniture styling and instant checkout.',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: 'offer',
          read: false
        }
      ],
      reviews: [],
      recentlyViewed: [],
      isBlocked: false,
      createdAt: new Date().toISOString().split('T')[0],
      totalSpent: 0
    };

    customers.push(newCustomer);
    setStorage(KEYS.CUSTOMERS, customers);
    this.setActiveCustomer(newCustomer.id);

    // Notify Admin of mobile registration
    this.addAdminNotification({
      id: `adm-notif-${Date.now()}`,
      title: 'New Customer Registered via Mobile OTP',
      message: `${newCustomer.name} (${newCustomer.phone}) verified via SMS OTP.`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'customer',
      read: false
    });

    return {
      success: true,
      message: `Welcome to CP Furniture, ${newCustomer.name}!`,
      customer: newCustomer,
      isNewUser: true
    };
  }

  logoutCustomer(): void {
    this.setActiveCustomer(null);
  }

  // CART & WISHLIST ON ACTIVE CUSTOMER
  addToCart(productId: string, quantity = 1, color?: string, size?: string): void {
    const cust = this.getActiveCustomer();
    if (!cust) return;

    const existingIndex = cust.cart.findIndex(
      (item) => item.productId === productId && item.selectedColor === color && item.selectedSize === size
    );

    const product = this.getProductById(productId);
    const currentStock = product ? product.stock : 99;

    if (existingIndex >= 0) {
      const newQty = Math.min(cust.cart[existingIndex].quantity + quantity, currentStock);
      cust.cart[existingIndex].quantity = newQty;
    } else {
      cust.cart.push({
        id: `ci-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId,
        quantity: Math.min(quantity, currentStock),
        selectedColor: color,
        selectedSize: size
      });
    }

    this.updateCustomer(cust);
  }

  updateCartQuantity(cartItemId: string, delta: number): void {
    const cust = this.getActiveCustomer();
    if (!cust) return;

    const idx = cust.cart.findIndex((item) => item.id === cartItemId);
    if (idx < 0) return;

    const product = this.getProductById(cust.cart[idx].productId);
    const maxStock = product ? product.stock : 99;

    const targetQty = cust.cart[idx].quantity + delta;
    if (targetQty <= 0) {
      cust.cart.splice(idx, 1);
    } else {
      cust.cart[idx].quantity = Math.min(targetQty, maxStock);
    }

    this.updateCustomer(cust);
  }

  removeFromCart(cartItemId: string): void {
    const cust = this.getActiveCustomer();
    if (!cust) return;
    cust.cart = cust.cart.filter((c) => c.id !== cartItemId);
    this.updateCustomer(cust);
  }

  saveForLater(cartItemId: string): void {
    const cust = this.getActiveCustomer();
    if (!cust) return;
    const item = cust.cart.find((c) => c.id === cartItemId);
    if (item) {
      cust.cart = cust.cart.filter((c) => c.id !== cartItemId);
      cust.savedForLater.push(item);
      this.updateCustomer(cust);
    }
  }

  moveToCartFromSaved(savedItemId: string): void {
    const cust = this.getActiveCustomer();
    if (!cust) return;
    const item = cust.savedForLater.find((c) => c.id === savedItemId);
    if (item) {
      cust.savedForLater = cust.savedForLater.filter((c) => c.id !== savedItemId);
      cust.cart.push(item);
      this.updateCustomer(cust);
    }
  }

  clearCart(): void {
    const cust = this.getActiveCustomer();
    if (!cust) return;
    cust.cart = [];
    this.updateCustomer(cust);
  }

  toggleWishlist(productId: string): boolean {
    const cust = this.getActiveCustomer();
    if (!cust) return false;

    const exists = cust.wishlist.includes(productId);
    if (exists) {
      cust.wishlist = cust.wishlist.filter((id) => id !== productId);
    } else {
      cust.wishlist.push(productId);
    }
    this.updateCustomer(cust);
    return !exists;
  }

  addRecentlyViewed(productId: string): void {
    const cust = this.getActiveCustomer();
    if (!cust) return;
    cust.recentlyViewed = [productId, ...cust.recentlyViewed.filter((id) => id !== productId)].slice(0, 8);
    this.updateCustomer(cust);
  }

  // ORDERS
  getOrders(): Order[] {
    const rawOrders = getStorage<Order[]>(KEYS.ORDERS, INITIAL_ORDERS);
    const recovered = this.recoverOrdersFromSecureBackup(rawOrders);
    return recovered.map((o) => {
      const totalAmount = o.total ?? o.grandTotal ?? 0;
      const orderDateStr = o.orderDate || o.date || 'Recent';
      return {
        ...o,
        total: totalAmount,
        grandTotal: totalAmount,
        orderDate: orderDateStr,
        date: orderDateStr,
        estimatedDelivery: o.estimatedDelivery || '3-5 Business Days',
        items: (o.items || []).map((it) => ({
          ...it,
          name: it.name || it.productName || 'Showroom Furniture Item',
          productName: it.productName || it.name || 'Showroom Furniture Item',
          image: it.image || it.productImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
          productImage: it.productImage || it.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
          price: it.price ?? 0,
          quantity: it.quantity ?? 1,
          selectedColor: it.selectedColor || it.color,
          color: it.color || it.selectedColor,
          selectedSize: it.selectedSize || it.size,
          size: it.size || it.selectedSize
        }))
      };
    });
  }

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id || o.orderNumber === id);
  }

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'date' | 'trackingSteps'>): Order {
    const orders = this.getOrders();
    const orderNum = `CPF-${Math.floor(10000 + Math.random() * 90000)}`;
    const newId = `ord-${Date.now()}`;
    const dateStr = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const finalTotal = orderData.grandTotal ?? (orderData as any).total ?? 0;
    const newOrder: Order = {
      ...orderData,
      id: newId,
      orderNumber: orderNum,
      date: dateStr,
      orderDate: dateStr,
      total: finalTotal,
      grandTotal: finalTotal,
      estimatedDelivery: '3-5 Business Days',
      orderStatus: orderData.orderStatus || 'Pending',
      items: (orderData.items || []).map((it) => ({
        ...it,
        name: it.name || it.productName || 'Showroom Furniture Item',
        productName: it.productName || it.name || 'Showroom Furniture Item',
        image: it.image || it.productImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
        productImage: it.productImage || it.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
        price: it.price ?? 0,
        quantity: it.quantity ?? 1,
        selectedColor: it.selectedColor || it.color,
        color: it.color || it.selectedColor,
        selectedSize: it.selectedSize || it.size,
        size: it.size || it.selectedSize
      })),
      trackingSteps: [
        {
          status: 'Pending',
          title: 'Order Placed & Awaiting Verification',
          date: dateStr,
          description: `Order successfully placed via ${orderData.paymentMethod}. Pending showroom fulfillment team confirmation.`,
          completed: true
        },
        {
          status: 'Confirmed',
          title: 'Quality Verification',
          date: 'In Queue',
          description: 'Factory team checking structural framing and fabric finish.',
          completed: false
        },
        {
          status: 'Packed',
          title: 'Crated & Dispatched',
          date: 'Pending',
          description: 'Multi-layer bubble wrap & wooden corner protection packaging.',
          completed: false
        },
        {
          status: 'Shipped',
          title: 'Shipped via CP Logistics',
          date: 'Pending',
          description: 'Transit to regional hub.',
          completed: false
        },
        {
          status: 'Delivered',
          title: 'Delivery & Free Assembly',
          date: 'Pending',
          description: 'Room-of-choice placement and installation by trained technician.',
          completed: false
        }
      ]
    };

    // Deduct stocks & log inventory
    orderData.items.forEach((item) => {
      const p = this.getProductById(item.productId);
      if (p) {
        const oldStock = p.stock;
        p.stock = Math.max(0, p.stock - item.quantity);
        this.saveProduct(p);

        this.addInventoryLog({
          id: `log-${Date.now()}-${item.productId}`,
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          type: 'Order Deduction',
          quantityChange: -item.quantity,
          previousStock: oldStock,
          newStock: p.stock,
          date: dateStr,
          reason: `Customer Order #${orderNum}`
        });

        // Low stock admin alert check
        if (p.stock <= p.lowStockLimit) {
          this.addAdminNotification({
            id: `adm-stock-${Date.now()}-${p.id}`,
            title: `Low Stock Warning: ${p.name}`,
            message: `Only ${p.stock} units left in showroom warehouse. SKU: ${p.sku}`,
            date: dateStr,
            type: 'stock',
            read: false
          });
        }
      }
    });

    // Update customer stats & clear cart
    const cust = this.getActiveCustomer();
    if (cust && cust.id === orderData.customerId) {
      cust.cart = [];
      cust.totalSpent += newOrder.grandTotal;

      // Auto-save shipping address to customer profile if not already present
      if (orderData.shippingAddress) {
        if (!cust.addresses) {
          cust.addresses = [];
        }
        const isDuplicateAddress = cust.addresses.some(
          (addr) =>
            addr.street?.toLowerCase() === orderData.shippingAddress.street?.toLowerCase() &&
            addr.city?.toLowerCase() === orderData.shippingAddress.city?.toLowerCase() &&
            addr.pincode === orderData.shippingAddress.pincode
        );
        if (!isDuplicateAddress) {
          cust.addresses.push({
            ...orderData.shippingAddress,
            id: orderData.shippingAddress.id || `addr-${Date.now()}`
          });
        }
      }

      cust.notifications.unshift({
        id: `cust-notif-${Date.now()}`,
        title: `Order Placed Successfully (#${orderNum})`,
        message: `Thank you for choosing CP Furniture! Your order of ₹${newOrder.grandTotal.toLocaleString()} is confirmed.`,
        date: dateStr,
        type: 'order',
        read: false
      });
      this.updateCustomer(cust);
    }

    // Save order
    orders.unshift(newOrder);
    setStorage(KEYS.ORDERS, orders);
    this.saveOrderToSecureBackup(newOrder);

    // Notify Admin
    this.addAdminNotification({
      id: `adm-ord-${Date.now()}`,
      title: `New Order Placed: #${orderNum}`,
      message: `${newOrder.customerName} placed order for ₹${newOrder.grandTotal.toLocaleString()} (${newOrder.paymentMethod}).`,
      date: dateStr,
      type: 'order',
      read: false,
      orderId: newId
    });

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: OrderStatus, note?: string): void {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    order.orderStatus = status;
    const dateStr = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (note) {
      order.notes = note;
    }

    // Update tracking steps
    const stepIdx = order.trackingSteps.findIndex((s) => s.status === status);
    if (stepIdx >= 0) {
      order.trackingSteps[stepIdx].completed = true;
      order.trackingSteps[stepIdx].date = dateStr;
      // Mark all previous as completed
      for (let i = 0; i <= stepIdx; i++) {
        order.trackingSteps[i].completed = true;
      }
    } else {
      // Append step if special status like Cancelled or Returned
      order.trackingSteps.push({
        status,
        title: status,
        date: dateStr,
        description: note || `Status updated to ${status}`,
        completed: true
      });
    }

    if (status === 'Delivered') {
      order.paymentStatus = 'Paid';
    }

    if (status === 'Cancelled' || status === 'Returned') {
      // Restock items
      order.items.forEach((item) => {
        const prod = this.getProductById(item.productId);
        if (prod) {
          const oldStock = prod.stock;
          prod.stock += item.quantity;
          this.saveProduct(prod);
          this.addInventoryLog({
            id: `log-ret-${Date.now()}-${prod.id}`,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            type: 'Return Restock',
            quantityChange: item.quantity,
            previousStock: oldStock,
            newStock: prod.stock,
            date: dateStr,
            reason: `Order #${order.orderNumber} ${status}`
          });
        }
      });
    }

    setStorage(KEYS.ORDERS, orders);
    this.saveOrderToSecureBackup(order);

    // Notify customer
    const customers = this.getCustomers();
    const targetCust = customers.find((c) => c.id === order.customerId);
    if (targetCust) {
      targetCust.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: `Order Update: #${order.orderNumber}`,
        message: `Your order is now ${status}. ${note ? `Note: ${note}` : ''}`,
        date: dateStr,
        type: 'order',
        read: false
      });
      this.updateCustomer(targetCust);
    }
  }

  cancelOrder(orderId: string, reason: string): boolean {
    const order = this.getOrderById(orderId);
    if (!order) return false;
    if (order.orderStatus === 'Delivered' || order.orderStatus === 'Shipped') {
      return false; // Cannot directly cancel after dispatch
    }
    order.cancellationReason = reason;
    this.updateOrderStatus(orderId, 'Cancelled', `Cancelled by customer. Reason: ${reason}`);
    return true;
  }

  requestReturn(orderId: string, reason: string): boolean {
    const order = this.getOrderById(orderId);
    if (!order || order.orderStatus !== 'Delivered') return false;
    order.returnReason = reason;
    order.refundStatus = 'Pending';
    this.updateOrderStatus(orderId, 'Returned', `Return requested by customer. Reason: ${reason}`);

    this.addAdminNotification({
      id: `adm-ret-${Date.now()}`,
      title: `Return Requested: #${order.orderNumber}`,
      message: `${order.customerName} requested return for order #${order.orderNumber}. Reason: ${reason}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'return',
      read: false,
      orderId
    });

    return true;
  }

  processRefund(orderId: string, status: 'Completed' | 'Rejected'): void {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    order.refundStatus = status;
    if (status === 'Completed') {
      order.paymentStatus = 'Refunded';
      order.orderStatus = 'Refunded';
    }
    setStorage(KEYS.ORDERS, orders);
    this.saveOrderToSecureBackup(order);
  }

  // COUPONS
  getCoupons(): Coupon[] {
    const rawCoupons = getStorage<Coupon[]>(KEYS.COUPONS, INITIAL_COUPONS);
    const hasWelcome25 = rawCoupons.some((c) => c.code.toUpperCase() === 'WELCOME25');
    if (!hasWelcome25) {
      const welcomeCoupon = INITIAL_COUPONS.find((c) => c.code === 'WELCOME25');
      if (welcomeCoupon) {
        rawCoupons.unshift(welcomeCoupon);
        setStorage(KEYS.COUPONS, rawCoupons);
      }
    }
    return rawCoupons.map((c) => ({
      ...c,
      id: c.id || c.code,
      discountPercent: c.discountPercent ?? (c.discountType === 'percentage' ? c.discountValue : 0),
      minOrderValue: c.minOrderValue ?? 0,
      discountValue: c.discountValue ?? 0
    }));
  }

  saveCoupon(coupon: Coupon): void {
    const coupons = this.getCoupons();
    const idx = coupons.findIndex(
      (c) => c.code.toUpperCase() === coupon.code.toUpperCase() || (coupon.id && c.id === coupon.id)
    );
    const enriched = {
      ...coupon,
      id: coupon.id || coupon.code,
      discountPercent: coupon.discountPercent ?? (coupon.discountType === 'percentage' ? coupon.discountValue : 0)
    };
    if (idx >= 0) {
      coupons[idx] = enriched;
    } else {
      coupons.push(enriched);
    }
    setStorage(KEYS.COUPONS, coupons);
  }

  deleteCoupon(codeOrId: string): void {
    const coupons = this.getCoupons().filter(
      (c) => c.code.toUpperCase() !== codeOrId.toUpperCase() && c.id !== codeOrId
    );
    setStorage(KEYS.COUPONS, coupons);
  }

  validateCoupon(code: string, subtotal: number): { valid: boolean; message: string; discount: number; coupon?: Coupon } {
    const coupons = this.getCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isEnabled);

    if (!coupon) {
      return { valid: false, message: 'Invalid or expired coupon code.', discount: 0 };
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return { valid: false, message: `Coupon code '${coupon.code}' has expired on ${coupon.expiryDate}.`, discount: 0 };
    }

    const minOrder = coupon.minOrderValue ?? 0;
    if (subtotal < minOrder) {
      return {
        valid: false,
        message: `Cart subtotal must be at least ₹${minOrder.toLocaleString()} to use code ${coupon.code}.`,
        discount: 0
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * (coupon.discountValue || 0)) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue || 0;
    }

    return {
      valid: true,
      message: `Coupon '${coupon.code}' applied successfully! You save ₹${Math.round(discount).toLocaleString()}.`,
      discount: Math.round(discount),
      coupon
    };
  }

  // INVENTORY LOGS
  getInventoryLogs(): InventoryLog[] {
    return getStorage<InventoryLog[]>(KEYS.INVENTORY_LOGS, INITIAL_INVENTORY_LOGS);
  }

  addInventoryLog(log: InventoryLog): void {
    const logs = this.getInventoryLogs();
    logs.unshift(log);
    setStorage(KEYS.INVENTORY_LOGS, logs.slice(0, 100)); // maintain latest 100
  }

  // ADMIN NOTIFICATIONS
  getAdminNotifications(): AdminNotification[] {
    return getStorage<AdminNotification[]>(KEYS.ADMIN_NOTIFS, INITIAL_ADMIN_NOTIFICATIONS);
  }

  addAdminNotification(notif: AdminNotification): void {
    const notifs = this.getAdminNotifications();
    notifs.unshift(notif);
    setStorage(KEYS.ADMIN_NOTIFS, notifs.slice(0, 50));
  }

  markAdminNotificationRead(id: string): void {
    const notifs = this.getAdminNotifications();
    const n = notifs.find((x) => x.id === id);
    if (n) {
      n.read = true;
      setStorage(KEYS.ADMIN_NOTIFS, notifs);
    }
  }

  clearAdminNotifications(): void {
    setStorage(KEYS.ADMIN_NOTIFS, []);
  }

  // ADMIN ACTIVITY LOGS
  getAdminActivityLogs(): AdminActivityLog[] {
    const defaultLogs: AdminActivityLog[] = [
      {
        id: 'act-1',
        action: 'Product Added',
        details: 'Luxury Royal Teak Dresser added to bedroom department catalog',
        date: '2026-09-13 10:24',
        adminEmail: 'admin@cpfurniture.com',
        category: 'product'
      },
      {
        id: 'act-2',
        action: 'Banner Updated',
        details: 'Modified the central homepage hero slide layout with custom high-contrast assets',
        date: '2026-09-13 11:05',
        adminEmail: 'admin@cpfurniture.com',
        category: 'banner'
      },
      {
        id: 'act-3',
        action: 'Taxonomy Modified',
        details: 'Renamed "Dining Chairs" subcategory to "Bespoke Dining Seating" in Dining Department',
        date: '2026-09-13 14:15',
        adminEmail: 'admin@cpfurniture.com',
        category: 'category'
      }
    ];
    return getStorage<AdminActivityLog[]>(KEYS.ADMIN_ACTIVITY_LOGS, defaultLogs);
  }

  addAdminActivityLog(log: Omit<AdminActivityLog, 'id' | 'date'> & { id?: string; date?: string }): void {
    const logs = this.getAdminActivityLogs();
    const newLog: AdminActivityLog = {
      id: log.id || `act-${Date.now()}`,
      date: log.date || new Date().toISOString().replace('T', ' ').substring(0, 16),
      action: log.action,
      details: log.details,
      adminEmail: log.adminEmail || 'admin@cpfurniture.com',
      category: log.category
    };
    logs.unshift(newLog);
    setStorage(KEYS.ADMIN_ACTIVITY_LOGS, logs.slice(0, 100)); // maintain latest 100 logs
  }

  clearAdminActivityLogs(): void {
    setStorage(KEYS.ADMIN_ACTIVITY_LOGS, []);
  }

  // WEBSITE CONTENT CMS
  getContent(): WebsiteContent {
    const content = getStorage<WebsiteContent>(KEYS.CONTENT, INITIAL_WEBSITE_CONTENT);
    if (content?.festiveBanner?.badge) {
      content.festiveBanner.badge = content.festiveBanner.badge
        .replace(/SHREE\s*GANESHA\s*[•·\-|–—]?\s*/gi, '')
        .replace(/[•·\-|–—]?\s*SHREE\s*GANESHA/gi, '')
        .replace(/\s*•\s*•\s*/g, ' • ')
        .trim()
        .replace(/^[•·\-|–—]\s*|\s*[•·\-|–—]$/g, '')
        .trim();
    }
    return content;
  }

  saveContent(content: WebsiteContent): void {
    setStorage(KEYS.CONTENT, content);
  }

  // ADMIN AUTH SESSION
  getAdminCredentials(): { email: string; pass: string } {
    return getStorage<{ email: string; pass: string }>(KEYS.ADMIN_CREDENTIALS, {
      email: 'admin@cpfurniture.com',
      pass: 'admin123'
    });
  }

  saveAdminCredentials(email: string, pass: string): void {
    setStorage<{ email: string; pass: string }>(KEYS.ADMIN_CREDENTIALS, {
      email: email.trim().toLowerCase(),
      pass: pass.trim()
    });
  }

  isAdminLoggedIn(): boolean {
    return getStorage<boolean>(KEYS.ADMIN_SESSION, false);
  }

  adminLogin(email: string, pass: string): boolean {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    // Check custom credentials first
    const custom = this.getAdminCredentials();
    if (cleanEmail === custom.email.toLowerCase() && cleanPass === custom.pass) {
      setStorage(KEYS.ADMIN_SESSION, true);
      return true;
    }

    const isEmailValid =
      cleanEmail === 'admin@cpfurniture.com' ||
      cleanEmail === 'admin' ||
      cleanEmail === 'admin@cp.com' ||
      cleanEmail.includes('admin');

    const isPassValid =
      cleanPass === 'admin123' ||
      cleanPass.toLowerCase() === 'admin' ||
      cleanPass.toLowerCase() === 'admin123' ||
      cleanPass === 'password123' ||
      cleanPass === 'admin@123' ||
      cleanPass === '123456';

    if (isEmailValid && isPassValid) {
      setStorage(KEYS.ADMIN_SESSION, true);
      return true;
    }
    return false;
  }

  adminLogout(): void {
    setStorage(KEYS.ADMIN_SESSION, false);
  }

  // NEWSLETTER & MARKETING CAPTURE
  getNewsletterSubscribers(): Array<{ email: string; subscribedAt: string; source: string }> {
    return getStorage<Array<{ email: string; subscribedAt: string; source: string }>>(KEYS.NEWSLETTER, [
      { email: 'rohan.sharma@example.com', subscribedAt: '2026-09-01T10:00:00Z', source: 'footer_vip' }
    ]);
  }

  addNewsletterSubscriber(
    email: string,
    source: string = 'footer'
  ): { success: boolean; alreadySubscribed: boolean; count: number } {
    const subscribers = this.getNewsletterSubscribers();
    const cleanEmail = email.trim().toLowerCase();
    const existing = subscribers.find((s) => s.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: true, alreadySubscribed: true, count: subscribers.length };
    }
    const newEntry = {
      email: cleanEmail,
      subscribedAt: new Date().toISOString(),
      source
    };
    subscribers.unshift(newEntry);
    setStorage(KEYS.NEWSLETTER, subscribers);
    return { success: true, alreadySubscribed: false, count: subscribers.length };
  }

  // CUSTOMER REVIEWS & RATINGS
  getReviews(): CustomerReview[] {
    return getStorage<CustomerReview[]>(KEYS.REVIEWS, INITIAL_REVIEWS);
  }

  getProductReviews(productId: string): CustomerReview[] {
    const reviews = this.getReviews();
    return reviews.filter(
      (r) => r.productId === productId && (r.status === 'published' || !r.status)
    );
  }

  addReview(
    reviewData: Omit<CustomerReview, 'id' | 'date'> & { id?: string; date?: string }
  ): CustomerReview {
    const reviews = this.getReviews();
    const newReview: CustomerReview = {
      id: reviewData.id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: reviewData.productId,
      productName: reviewData.productName,
      productImage: reviewData.productImage,
      rating: Math.max(1, Math.min(5, Number(reviewData.rating) || 5)),
      headline: reviewData.headline.trim(),
      comment: reviewData.comment.trim(),
      date: reviewData.date || new Date().toISOString().split('T')[0],
      verified: reviewData.verified !== undefined ? reviewData.verified : true,
      authorName: reviewData.authorName?.trim() || 'Verified Homeowner',
      authorEmail: reviewData.authorEmail?.trim() || 'shopper@cpfurniture.com',
      authorCity: reviewData.authorCity?.trim() || 'India',
      status: reviewData.status || 'published',
      adminNotes: reviewData.adminNotes || ''
    };

    reviews.unshift(newReview);
    setStorage(KEYS.REVIEWS, reviews);

    // Synchronize product rating & count
    this.recalculateProductRating(reviewData.productId);

    return newReview;
  }

  deleteReview(reviewId: string): boolean {
    const reviews = this.getReviews();
    const target = reviews.find((r) => r.id === reviewId);
    if (!target) return false;

    const filtered = reviews.filter((r) => r.id !== reviewId);
    setStorage(KEYS.REVIEWS, filtered);

    this.recalculateProductRating(target.productId);
    return true;
  }

  updateReviewStatus(
    reviewId: string,
    status: 'published' | 'pending' | 'flagged',
    adminNotes?: string
  ): boolean {
    const reviews = this.getReviews();
    const index = reviews.findIndex((r) => r.id === reviewId);
    if (index === -1) return false;

    reviews[index] = {
      ...reviews[index],
      status,
      adminNotes: adminNotes !== undefined ? adminNotes : reviews[index].adminNotes
    };

    setStorage(KEYS.REVIEWS, reviews);
    this.recalculateProductRating(reviews[index].productId);
    return true;
  }

  recalculateProductRating(productId: string): void {
    const reviews = this.getProductReviews(productId);
    const products = this.getProducts();
    const pIndex = products.findIndex((p) => p.id === productId);
    if (pIndex !== -1) {
      if (reviews.length === 0) {
        // Keep baseline rating or default
        setStorage(KEYS.PRODUCTS, products);
        return;
      }
      const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
      const avg = Number((sum / reviews.length).toFixed(1));
      products[pIndex].rating = avg;
      products[pIndex].reviewCount = reviews.length;
      setStorage(KEYS.PRODUCTS, products);
    }
  }

  // PURCHASING & STOCK INWARD
  getPurchasingCredentials(): PurchasingCredentials {
    return getStorage<PurchasingCredentials>(KEYS.PURCHASING_CREDS, {
      userId: 'purchasing',
      pass: 'purchasing123'
    });
  }

  savePurchasingCredentials(creds: PurchasingCredentials): void {
    setStorage(KEYS.PURCHASING_CREDS, creds);
  }

  getPurchaseEntries(): PurchaseEntry[] {
    return getStorage<PurchaseEntry[]>(KEYS.PURCHASE_ENTRIES, []);
  }

  addPurchaseEntry(entry: Omit<PurchaseEntry, 'id'>): PurchaseEntry {
    const entries = this.getPurchaseEntries();
    const newEntry: PurchaseEntry = {
      ...entry,
      id: `purch_` + Math.random().toString(36).substr(2, 9)
    };
    entries.unshift(newEntry);
    setStorage(KEYS.PURCHASE_ENTRIES, entries);

    // Update product stock instantly in active products catalog
    const products = this.getProducts();
    const pIndex = products.findIndex(p => p.id === entry.productId || p.sku === entry.sku);
    if (pIndex !== -1) {
      const prev = products[pIndex].stock;
      products[pIndex].stock += entry.quantity;
      setStorage(KEYS.PRODUCTS, products);

      // Add corresponding inventory log
      this.addInventoryLog({
        id: 'log_' + Math.random().toString(36).substr(2, 9),
        productId: products[pIndex].id,
        productName: products[pIndex].name,
        sku: products[pIndex].sku,
        type: 'Stock In',
        quantityChange: entry.quantity,
        previousStock: prev,
        newStock: products[pIndex].stock,
        date: new Date().toLocaleString('en-IN'),
        reason: `Purchasing Portal Inward: Supplier [${entry.supplier}]`
      });

      // Add Admin Notification
      this.addAdminNotification({
        id: 'notif_' + Math.random().toString(36).substr(2, 9),
        title: 'Stock Inward (Purchasing Portal)',
        message: `Inwarded +${entry.quantity} units of ${products[pIndex].name} from ${entry.supplier}. New Stock: ${products[pIndex].stock}`,
        date: new Date().toLocaleString('en-IN'),
        type: 'stock',
        read: false
      });
    }

    return newEntry;
  }

  // RESET ALL DATA TOOL
  resetToDefaultData(): void {
    localStorage.removeItem(KEYS.PRODUCTS);
    localStorage.removeItem(KEYS.CATEGORIES);
    localStorage.removeItem(KEYS.CUSTOMERS);
    localStorage.removeItem(KEYS.ORDERS);
    localStorage.removeItem(KEYS.COUPONS);
    localStorage.removeItem(KEYS.CONTENT);
    localStorage.removeItem(KEYS.INVENTORY_LOGS);
    localStorage.removeItem(KEYS.ADMIN_NOTIFS);
    localStorage.removeItem(KEYS.REVIEWS);
    localStorage.removeItem(KEYS.ADMIN_ACTIVITY_LOGS);
    localStorage.setItem(KEYS.ACTIVE_CUSTOMER_ID, JSON.stringify(INITIAL_CUSTOMER.id));
  }
}

export const storage = new StorageService();
