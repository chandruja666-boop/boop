export type OrderStatus =
  | 'Pending'
  | 'Order Placed'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned'
  | 'Refunded';

export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'inches' | 'cm';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  salePrice: number;
  discount: number; // percentage
  stock: number;
  lowStockLimit: number;
  rating: number;
  reviewCount: number;
  isPublished: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  colors: ProductColor[];
  sizes: string[];
  material: string;
  dimensions: ProductDimensions;
  weight: number; // kg
  images: string[];
  description: string;
  specifications: Record<string, string>;
  careInstructions: string[];
  warranty: string;
  deliveryEstimate: string;
  assemblyRequired: boolean;
  frequentlyBoughtWith?: string[]; // Product IDs
  craftsmanshipHighlights?: string[];
  returnPolicy?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  subcategories: string[];
  isEnabled: boolean;
  displayOrder: number;
  featured?: boolean;
}

export interface Address {
  id: string;
  type: 'Home' | 'Office' | 'Other';
  name: string;
  phone: string;
  gstin?: string;
  street: string;
  landmark?: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface CartItem {
  id: string; // unique cart item id
  productId: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'order' | 'offer' | 'system';
  read: boolean;
}

export interface CustomerReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  headline: string;
  comment: string;
  date: string;
  verified: boolean;
  authorName?: string;
  authorEmail?: string;
  authorCity?: string;
  status?: 'published' | 'pending' | 'flagged';
  adminNotes?: string;
  helpfulCount?: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  avatar?: string;
  addresses: Address[];
  wishlist: string[]; // product IDs
  cart: CartItem[];
  savedForLater: CartItem[];
  notifications: CustomerNotification[];
  reviews: CustomerReview[];
  recentlyViewed: string[]; // product IDs
  isBlocked: boolean;
  createdAt: string;
  totalSpent: number;
  loyaltyPoints?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  productName?: string;
  sku: string;
  image: string;
  productImage?: string;
  price: number;
  quantity: number;
  color?: string;
  selectedColor?: string;
  size?: string;
  selectedSize?: string;
  subtotal: number;
}

export interface TrackingStep {
  status: OrderStatus;
  title: string;
  date: string;
  description: string;
  completed: boolean;
}

export type PaymentMethod =
  | 'Razorpay'
  | 'Razorpay (razorpay.me/@anandhanchandru)'
  | 'UPI'
  | 'Credit/Debit Card'
  | 'Net Banking'
  | 'EMI'
  | 'Cash on Delivery';

export const RAZORPAY_CONFIG = {
  merchantHandle: 'razorpay.me/@anandhanchandru',
  paymentUrl: 'https://razorpay.me/@anandhanchandru',
  merchantName: 'Anandhan Chandru',
  businessName: 'CP Furniture',
  upiId: 'chandruja666-3@okaxis',
  supportEmail: 'chandruja666@gmail.com',
  settlementType: 'Direct Bank Settlement (Registered Axis Account)'
};

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  orderDate?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: Address;
  deliveryMethod: string;
  deliveryCharge: number;
  subtotal: number;
  discount: number;
  couponCode?: string;
  tax: number; // 18% GST
  grandTotal: number;
  total?: number;
  estimatedDelivery?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpayHandle?: string;
  bankSettlementStatus?: 'Direct Settled to Bank' | 'Instant Settled' | 'Processing';
  paymentReference?: string;
  orderStatus: OrderStatus;
  trackingSteps: TrackingStep[];
  cancellationReason?: string;
  returnReason?: string;
  refundStatus?: 'Pending' | 'Processed' | 'Completed' | 'Rejected';
  notes?: string;
}

export interface Coupon {
  id?: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountPercent?: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isEnabled: boolean;
  applicableCategory?: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  badge: string;
  image: string;
  sizeOption?: 'full' | 'wide' | 'compact';
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  code: string;
  image: string;
  bgGradient: string;
  linkCategory: string;
}

export interface Showroom {
  id: string;
  city: string;
  name: string;
  address: string;
  phone: string;
  timing: string;
  image: string;
  virtualTourUrl?: string;
}

export interface FestiveBannerConfig {
  enabled: boolean;
  badge: string;
  title: string;
  subtitle: string;
  code: string;
  discountText: string;
  expiryText: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export interface WebsiteContent {
  announcement: string;
  announcementEnabled?: boolean;
  festiveBanner?: FestiveBannerConfig;
  heroSlides: HeroSlide[];
  promoBanners: PromoBanner[];
  showrooms: Showroom[];
  aboutUsText: string;
  contactEmail: string;
  contactPhone: string;
  showroomHours: string;
  headquartersAddress: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'Stock In' | 'Stock Out' | 'Adjustment' | 'Order Deduction' | 'Return Restock' | 'Order Fulfillment Dispatch' | string;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  date: string;
  reason: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'order' | 'stock' | 'customer' | 'return';
  read: boolean;
  orderId?: string;
}

export interface AdminActivityLog {
  id: string;
  action: string;
  details: string;
  date: string;
  adminEmail: string;
  category: 'product' | 'banner' | 'category' | 'coupon' | 'security' | 'order' | string;
}

export interface InvoiceSettings {
  invoiceHeader: string;
  companyName: string;
  registeredOfficeAddress: string;
  gstin: string;
  cin: string;
  fulfillmentCenterName: string;
  warehouseAddress: string;
  dispatchNote: string;
  deliveryWindowText: string;
}

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  invoiceHeader: 'CP Furniture Showroom Tax Invoice',
  companyName: 'CP FURNITURE RETAIL PRIVATE LIMITED',
  registeredOfficeAddress: 'Plot 18A, Indiranagar 100ft Road, Stage 2, Bengaluru, Karnataka - 560038',
  gstin: '29AAACP9988C1Z8',
  cin: 'U36100KA2018PTC112345',
  fulfillmentCenterName: 'CP Central Furniture Hub - South',
  warehouseAddress: 'Whitefield Logistics Park, Bengaluru',
  dispatchNote: 'Dispatched with White-Glove Care',
  deliveryWindowText: '3-5 Business Days'
};

export interface PurchaseEntry {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  supplier: string;
  purchaseDate: string;
  unitCost: number;
  totalCost: number;
}

export interface PurchasingCredentials {
  userId: string;
  pass: string;
}

