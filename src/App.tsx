import React, { useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { SearchModal } from './components/common/SearchModal';
import { ToastContainer } from './components/common/Toast';
import { HomeView } from './components/home/HomeView';
import { ShopView } from './components/shop/ShopView';
import { ProductDetailView } from './components/product/ProductDetailView';
import { CartView } from './components/cart/CartView';
import { CheckoutView } from './components/checkout/CheckoutView';
import { WishlistView } from './components/wishlist/WishlistView';
import { AccountView } from './components/account/AccountView';
import { InvoiceView } from './components/invoice/InvoiceView';
import { OffersView } from './components/offers/OffersView';
import { AboutView } from './components/static/AboutView';
import { ContactView } from './components/static/ContactView';
import { ShowroomsView } from './components/static/ShowroomsView';
import { AdminView } from './components/admin/AdminView';
import { PurchasingView } from './components/admin/PurchasingView';
import { QuickViewModal } from './components/common/QuickViewModal';

const MainContent: React.FC = () => {
  const { currentView, setCurrentView } = useApp();
  const currentViewRef = useRef(currentView);

  // Keep ref updated with the latest currentView state without triggering the route effect
  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  // Handle URL route initialization and browser navigation (/admin vs /)
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const isAdminRoute =
        path === '/admin' ||
        path.startsWith('/admin/') ||
        hash === '#/admin' ||
        hash === '#admin';

      const isPurchasingRoute =
        path === '/purchasing' ||
        path.startsWith('/purchasing/') ||
        hash === '#/purchasing' ||
        hash === '#purchasing';

      const latestView = currentViewRef.current;

      if (isAdminRoute) {
        if (latestView !== 'admin' && latestView !== 'admin-login') {
          setCurrentView('admin');
        }
      } else if (isPurchasingRoute) {
        if (latestView !== 'purchasing') {
          setCurrentView('purchasing');
        }
      } else {
        if (latestView === 'admin' || latestView === 'admin-login' || latestView === 'purchasing') {
          setCurrentView('home');
        }
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [setCurrentView]);

  // Scroll to top and sync URL hash when view switches
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const hash = window.location.hash;
    const path = window.location.pathname;

    if (currentView === 'admin' || currentView === 'admin-login') {
      if (!hash.includes('admin') && !path.includes('admin')) {
        window.history.pushState(null, '', '#/admin');
      }
    } else if (currentView === 'purchasing') {
      if (!hash.includes('purchasing') && !path.includes('purchasing')) {
        window.history.pushState(null, '', '#/purchasing');
      }
    } else {
      if (
        hash.includes('admin') ||
        path.includes('admin') ||
        hash.includes('purchasing') ||
        path.includes('purchasing')
      ) {
        window.history.pushState(null, '', '#/');
      }
    }
  }, [currentView]);

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'shop':
        return <ShopView />;
      case 'product-detail':
        return <ProductDetailView />;
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'wishlist':
        return <WishlistView />;
      case 'account':
      case 'auth':
      case 'orders':
      case 'order-tracking':
        return <AccountView />;
      case 'invoice':
        return <InvoiceView />;
      case 'offers':
        return <OffersView />;
      case 'about':
        return <AboutView />;
      case 'contact':
        return <ContactView />;
      case 'showrooms':
        return <ShowroomsView />;
      case 'admin':
      case 'admin-login':
        return <AdminView />;
      case 'purchasing':
        return <PurchasingView />;
      default:
        return <HomeView />;
    }
  };

  const isAdmin = currentView === 'admin' || currentView === 'admin-login';
  const isInvoice = currentView === 'invoice';
  const isPurchasing = currentView === 'purchasing';

  // 1. DEDICATED ADMIN DASHBOARD VIEW (/admin)
  // Completely isolated from customer shopping interface:
  // No customer header, no customer categories mega menu, no customer cart, no customer footer.
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500 selection:text-stone-950 overflow-x-hidden w-full max-w-full">
        <main className="flex-1 w-full max-w-full">
          <AdminView />
        </main>
        <ToastContainer />
      </div>
    );
  }

  // 1b. DEDICATED PURCHASING PORTAL VIEW (/purchasing)
  if (isPurchasing) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500 selection:text-stone-950 overflow-x-hidden w-full max-w-full">
        <main className="flex-1 w-full max-w-full">
          <PurchasingView />
        </main>
        <ToastContainer />
      </div>
    );
  }

  // 2. INVOICE PRINT VIEW
  if (isInvoice) {
    return (
      <div className="min-h-screen bg-white text-stone-900 overflow-x-hidden w-full max-w-full">
        <InvoiceView />
        <ToastContainer />
      </div>
    );
  }

  // 3. CUSTOMER FRONTEND VIEW (/ or home)
  // Shows exclusively customer shopping experience:
  // Products, categories, cart drawer, wishlist, profile, and checkout.
  // All admin buttons or management tools are strictly hidden from regular shoppers.
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 overflow-x-hidden w-full max-w-full">
      <Header />
      <main className="flex-1 pb-20 md:pb-0 w-full max-w-full">
        {renderView()}
      </main>
      <Footer />
      <SearchModal />
      <QuickViewModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
