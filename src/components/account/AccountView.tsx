import React, { useState } from 'react';
import {
  User,
  Package,
  MapPin,
  Star,
  LogOut,
  ShieldCheck,
  FileText,
  Printer,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Phone,
  Smartphone,
  KeyRound,
  Mail,
  Edit2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Address } from '../../types';
import { OTPLoginForm } from './OTPLoginForm';

export const AccountView: React.FC = () => {
  const {
    customer,
    orders,
    loginCustomer,
    registerCustomer,
    logoutCustomer,
    loginAdmin,
    updateCustomerProfile,
    addCustomerAddress,
    deleteCustomerAddress,
    setDefaultAddress,
    cancelOrder,
    requestOrderReturn,
    setSelectedOrderId,
    setCurrentView,
    printOrderInvoice,
    showToast
  } = useApp();

  // Auth form state if not logged in
  const [authMode, setAuthMode] = useState<'otp' | 'login' | 'register'>('otp');
  const [email, setEmail] = useState('rohan.verma@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Active dashboard tab
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile' | 'reviews'>('orders');

  // New Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('Bengaluru');
  const [newAddrState, setNewAddrState] = useState('Karnataka');
  const [newAddrPincode, setNewAddrPincode] = useState('560001');

  // Edit profile state
  const [editName, setEditName] = useState(customer?.name || '');
  const [editPhone, setEditPhone] = useState(customer?.phone || '');

  // Filter orders for current customer
  const customerOrders = orders.filter(
    (o) => o.customerId === customer?.id || o.customerEmail === customer?.email
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = loginCustomer(email, password);
    if (ok) {
      showToast('Welcome back to CP Furniture!', 'success');
    } else {
      showToast('Please enter valid email and password.', 'warning');
    }
  };

  const handleQuickCustomerLogin = () => {
    setEmail('rohan.verma@example.com');
    setPassword('password123');
    loginCustomer('rohan.verma@example.com', 'password123');
    showToast('Signed in as Rohan Verma (Demo Account)', 'success');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      showToast('Please fill out all required fields.', 'warning');
      return;
    }
    const ok = registerCustomer(name, email, phone, password);
    if (ok) {
      showToast('Registration successful! Welcome to CP Furniture.', 'success');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({ name: editName, phone: editPhone });
    showToast('Profile information updated successfully.', 'success');
  };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrName || !newAddrPhone || !newAddrStreet || !newAddrPincode) {
      showToast('Please complete all address fields.', 'warning');
      return;
    }

    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      type: 'Home',
      name: newAddrName,
      phone: newAddrPhone,
      street: newAddrStreet,
      city: newAddrCity,
      state: newAddrState,
      pincode: newAddrPincode,
      isDefault: customer?.addresses.length === 0
    };

    addCustomerAddress(newAddr);
    setShowAddressModal(false);
    setNewAddrName('');
    setNewAddrPhone('');
    setNewAddrStreet('');
    setNewAddrPincode('');
    showToast('New delivery address saved.', 'success');
  };

  // IF NOT LOGGED IN: SHOW AUTH SCREEN
  if (!customer) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl space-y-6">
          {/* Brand Monogram Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-stone-900 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-900/10">
              <User className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold font-serif-luxury text-stone-900 tracking-tight">
              {authMode === 'otp'
                ? 'VIP Customer Sign In'
                : authMode === 'login'
                ? 'Customer Password Sign In'
                : 'Create VIP Account'}
            </h1>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Access your bespoke orders, real-time white-glove tracking, and VIP member benefits.
            </p>
          </div>

          {/* 3-Way Tab Switcher */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-2xl text-xs font-semibold">
            <button
              id="auth-tab-customer-otp"
              type="button"
              onClick={() => setAuthMode('otp')}
              className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'otp'
                  ? 'bg-stone-900 text-amber-300 shadow-md font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile OTP</span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] rounded uppercase font-bold">
                Fast
              </span>
            </button>

            <button
              id="auth-tab-customer-login"
              type="button"
              onClick={() => setAuthMode('login')}
              className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-stone-900 text-white shadow-md font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password</span>
            </button>

            <button
              id="auth-tab-customer-register"
              type="button"
              onClick={() => setAuthMode('register')}
              className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-stone-900 text-white shadow-md font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>

          {/* TAB 1: INSTANT SMS OTP FLOW */}
          {authMode === 'otp' && (
            <div className="pt-2">
              <OTPLoginForm
                onSwitchToPassword={() => setAuthMode('login')}
                onSuccess={() => {
                  setActiveTab('orders');
                }}
              />
            </div>
          )}

          {/* TAB 2: TRADITIONAL PASSWORD SIGN IN */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs pt-1">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Email or Mobile Number</label>
                <input
                  id="customer-login-email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Password</label>
                <input
                  id="customer-login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900 text-sm"
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <label className="flex items-center gap-1.5 text-stone-600 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-stone-900" />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => showToast('Password reset link sent to registered email.', 'info')}
                  className="text-amber-900 font-semibold hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                id="customer-login-submit-btn"
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-stone-900 to-stone-950 hover:from-amber-950 hover:to-stone-900 text-white font-bold rounded-xl transition-all shadow cursor-pointer text-xs"
              >
                Sign In to Customer Account
              </button>

              <button
                id="customer-switch-to-otp-btn"
                type="button"
                onClick={() => setAuthMode('otp')}
                className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl border border-amber-200 transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Switch to Instant Mobile OTP Sign In &rarr;</span>
              </button>

              <button
                id="customer-1click-login-btn"
                type="button"
                onClick={handleQuickCustomerLogin}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl border border-stone-200 transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>1-Click Customer Demo Sign In (Rohan Verma)</span>
              </button>
            </form>
          )}

          {/* TAB 3: CUSTOMER REGISTRATION */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 text-xs pt-1">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Mobile Phone (for OTP & SMS delivery updates)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit Indian number"
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-900 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Create Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-all shadow cursor-pointer text-xs"
              >
                Create My VIP Account
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('otp')}
                className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl border border-amber-200 transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Or Register & Sign In with Phone OTP &rarr;</span>
              </button>

              <div className="pt-2 text-center flex justify-center gap-4 text-xs">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-stone-500 hover:text-stone-900 underline cursor-pointer"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // LOGGED IN DASHBOARD
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Profile Banner */}
      <div className="bg-stone-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-800 text-amber-200 flex items-center justify-center font-bold text-2xl font-serif-luxury">
            {customer.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-serif-luxury">{customer.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                VIP Platinum Member
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1 flex items-center gap-3">
              <span>{customer.email}</span>
              <span>&bull;</span>
              <span>{customer.phone}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-stone-800 rounded-2xl border border-stone-700 text-center">
            <span className="text-stone-400 text-[10px] uppercase font-bold block">Reward Points</span>
            <span className="text-lg font-black text-amber-400">{customer.loyaltyPoints} pts</span>
          </div>

          <button
            onClick={logoutCustomer}
            className="p-3 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-2xl border border-stone-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Account Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Tabs (3 cols) */}
        <aside className="lg:col-span-3 space-y-1 bg-white p-3 rounded-2xl border border-stone-200 h-fit">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
              activeTab === 'orders' ? 'bg-stone-900 text-white shadow' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({customerOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
              activeTab === 'addresses' ? 'bg-stone-900 text-white shadow' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses ({customer.addresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
              activeTab === 'reviews' ? 'bg-stone-900 text-white shadow' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>My Reviews ({customer.reviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
              activeTab === 'profile' ? 'bg-stone-900 text-white shadow' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Account Details</span>
          </button>
        </aside>

        {/* Tab Content Panel (9 cols) */}
        <main className="lg:col-span-9">
          {/* TAB 1: ORDERS & TRACKING */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold font-serif-luxury text-stone-900">
                Order History & Live White-Glove Tracking
              </h2>

              {/* VIP LOYALTY POINTS CLUB PORTLET */}
              <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 rounded-3xl p-6 border border-amber-500/20 text-white shadow-lg space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>CP VIP Club Elite Ledger</span>
                    </span>
                    <h3 className="text-lg font-bold font-serif-luxury text-white">
                      Your Auspicious Loyalty Rewards
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 bg-stone-900 px-4 py-2.5 rounded-2xl border border-stone-800">
                    <div className="text-left">
                      <span className="text-[9px] text-stone-400 uppercase tracking-wider block font-bold">
                        Available Balance
                      </span>
                      <span className="text-xl font-black text-amber-400 font-mono">
                        {(customer.loyaltyPoints || 4800).toLocaleString()} <span className="text-xs text-stone-300 font-normal">pts</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar to next VIP reward tier */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-stone-300">
                    <span>Platinum VIP Tier Progress</span>
                    <span className="text-amber-400">
                      {customer.loyaltyPoints || 4800} / 7,500 pts to Diamond VIP
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (((customer.loyaltyPoints || 4800) / 7500) * 100))}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-400">
                    Unlock private concierge privileges and complementary luxury polish consultations upon reaching Diamond status.
                  </p>
                </div>

                {/* Recent Purchases Loyalty Points Ledger */}
                <div className="pt-4 border-t border-stone-800/80 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    Points Earned from Recent Purchases:
                  </span>

                  {customerOrders.length === 0 ? (
                    <div className="text-center py-2 text-stone-500 italic text-[11px]">
                      No purchases yet. Start shopping to earn elite loyalty points!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {customerOrders.slice(0, 4).map((order) => {
                        const earnedPoints = Math.round((order.total ?? order.grandTotal ?? 0) / 100);
                        return (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-stone-900/60 border border-stone-800"
                          >
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-stone-200">
                                Order {order.orderNumber || `#${order.id.slice(-6)}`}
                              </span>
                              <span className="text-[10px] text-stone-400 block">
                                {order.orderDate || order.date || 'Recent'}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                                + {earnedPoints} pts
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {customerOrders.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
                  <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="font-bold text-stone-900 text-sm">No furniture orders placed yet</h3>
                  <p className="text-xs text-stone-500 mt-1 mb-4">
                    Once you purchase a piece, its assembly scheduling and delivery milestones will display here.
                  </p>
                  <button
                    onClick={() => setCurrentView('shop')}
                    className="px-5 py-2.5 bg-stone-900 text-white text-xs font-bold rounded-xl"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                customerOrders.map((order) => {
                  const isDelivered = order.orderStatus === 'delivered';
                  const isCancelled = order.orderStatus === 'cancelled';
                  const isReturnRequested = order.orderStatus === 'return_requested';

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200 text-xs">
                        <div>
                          <span className="text-stone-400 block font-semibold">Order ID</span>
                          <span className="font-mono font-bold text-stone-900 text-sm">{order.id}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block font-semibold">Placed On</span>
                          <span className="font-semibold text-stone-800">{order.orderDate || order.date || 'Recent'}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block font-semibold">Estimated Delivery</span>
                          <span className="font-bold text-emerald-700">{order.estimatedDelivery || '3-5 Business Days'}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block font-semibold">Grand Total</span>
                          <span className="font-black text-amber-950 text-sm">
                            ₹{(order.total ?? order.grandTotal ?? 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            id={`account-order-print-${order.id}`}
                            onClick={() => printOrderInvoice(order.id)}
                            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                            title="Print Tax Invoice Bill"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Bill</span>
                          </button>

                          <button
                            id={`account-order-invoice-${order.id}`}
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setCurrentView('invoice');
                            }}
                            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold flex items-center gap-1.5 transition-colors border border-stone-200"
                            title="View Full Tax Invoice"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Tax Invoice</span>
                          </button>
                        </div>
                      </div>

                      {/* Live Tracking Progress Stepper */}
                      {!isCancelled && (
                        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-amber-800" />
                              <span>Showroom Fulfillment Milestones</span>
                            </span>
                            <span className="text-emerald-700 uppercase">
                              Status: {(order.orderStatus || 'confirmed').replace('_', ' ')}
                            </span>
                          </div>

                          <div className="grid grid-cols-5 gap-2 pt-2">
                            {(order.trackingSteps || []).map((step, idx) => (
                              <div key={idx} className="flex flex-col items-center text-center">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                                    step.completed
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-stone-200 text-stone-500'
                                  }`}
                                >
                                  {step.completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                </div>
                                <span className="text-[10px] font-bold text-stone-800 leading-tight">
                                  {step.status}
                                </span>
                                <span className="text-[9px] text-stone-400 mt-0.5">{step.date}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Items in this order */}
                      <div className="space-y-3">
                        {(order.items || []).map((item) => (
                          <div
                            key={item.productId}
                            className="flex items-center justify-between text-xs p-2 bg-stone-50/50 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={item.productImage || item.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80'}
                                alt={item.productName || item.name || 'Furniture item'}
                                className="w-12 h-12 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                              />
                              <div>
                                <h4 className="font-bold text-stone-900">{item.productName || item.name}</h4>
                                <p className="text-[11px] text-stone-500">
                                  Qty: {item.quantity || 1} {(item.selectedColor || item.color) ? `• Finish: ${item.selectedColor || item.color}` : ''}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-stone-900">
                              ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Address & Actions Footer */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-stone-100 text-xs">
                        <div className="text-stone-500 text-[11px]">
                          <strong className="text-stone-800">Delivering to:</strong>{' '}
                          {order.shippingAddress.name} &bull; {order.shippingAddress.street},{' '}
                          {order.shippingAddress.city} - {order.shippingAddress.pincode}
                        </div>

                        <div className="flex items-center gap-2">
                          {order.orderStatus === 'placed' && (
                            <button
                              onClick={() => cancelOrder(order.id)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg transition-colors"
                            >
                              Cancel Order
                            </button>
                          )}

                          {isDelivered && !isReturnRequested && (
                            <button
                              onClick={() => requestOrderReturn(order.id)}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-lg transition-colors flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Request 30-Day Return</span>
                            </button>
                          )}

                          {isReturnRequested && (
                            <span className="text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded">
                              Return Pickup Scheduled
                            </span>
                          )}

                          {isCancelled && (
                            <span className="text-red-700 font-bold bg-red-50 px-2.5 py-1 rounded">
                              Order Cancelled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-serif-luxury text-stone-900">
                    Saved Delivery Addresses
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Manage destination locations for white-glove assembly.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Address</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {customer.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-stone-900 mb-1">
                        <span>{addr.name}</span>
                        {addr.isDefault ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                            Default
                          </span>
                        ) : (
                          <button
                            onClick={() => setDefaultAddress(addr.id)}
                            className="text-[11px] text-amber-800 hover:underline"
                          >
                            Set Default
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 leading-snug">{addr.street}</p>
                      <p className="text-xs text-stone-600">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-2 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-stone-400" /> {addr.phone}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex justify-end">
                      <button
                        onClick={() => deleteCustomerAddress(addr.id)}
                        className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Address Modal */}
              {showAddressModal && (
                <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                  <form
                    onSubmit={handleSaveNewAddress}
                    className="bg-white rounded-3xl p-6 max-w-md w-full border border-stone-200 shadow-2xl space-y-4 text-xs"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                      <h3 className="font-bold text-base text-stone-900 font-serif-luxury">
                        Add Delivery Address
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAddressModal(false)}
                        className="text-stone-400 hover:text-stone-700 font-bold"
                      >
                        Close
                      </button>
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Recipient Name</label>
                      <input
                        type="text"
                        required
                        value={newAddrName}
                        onChange={(e) => setNewAddrName(e.target.value)}
                        className="w-full p-2.5 border border-stone-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={newAddrPhone}
                        onChange={(e) => setNewAddrPhone(e.target.value)}
                        className="w-full p-2.5 border border-stone-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Street Address</label>
                      <input
                        type="text"
                        required
                        value={newAddrStreet}
                        onChange={(e) => setNewAddrStreet(e.target.value)}
                        className="w-full p-2.5 border border-stone-300 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={newAddrCity}
                          onChange={(e) => setNewAddrCity(e.target.value)}
                          className="w-full p-2.5 border border-stone-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">PIN Code</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={newAddrPincode}
                          onChange={(e) => setNewAddrPincode(e.target.value)}
                          className="w-full p-2.5 border border-stone-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-stone-900 text-white font-bold rounded-xl mt-2"
                    >
                      Save Delivery Address
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold font-serif-luxury text-stone-900">
                My Verified Reviews ({customer.reviews.length})
              </h2>

              {customer.reviews.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-stone-200">
                  <p className="text-xs text-stone-500">You have not written any product reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customer.reviews.map((rev) => (
                    <div key={rev.id} className="p-5 bg-white rounded-2xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-stone-300'}`} />
                          ))}
                        </div>
                        <span className="text-[11px] text-stone-400">{rev.date}</span>
                      </div>
                      <h4 className="font-bold text-xs text-stone-900">{rev.headline}</h4>
                      <p className="text-xs text-stone-600">{rev.comment}</p>
                      <p className="text-[11px] text-stone-400 pt-1 border-t border-stone-100">
                        Product: <strong>{rev.productName}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 max-w-xl">
              <h2 className="text-xl font-bold font-serif-luxury text-stone-900">
                Account Information
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={customer.email}
                    className="w-full p-2.5 border border-stone-200 bg-stone-100 rounded-xl text-stone-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">Email cannot be changed</span>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-colors"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
