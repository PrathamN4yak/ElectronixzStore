import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminPromoCodesPage from "@/pages/AdminPromoCodesPage";
import AdminReviewsPage from "@/pages/AdminReviewsPage";
import AdminLayout from "@/components/AdminLayout";
import NotFound from "@/pages/not-found";

function Routes() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/product/:id" component={ProductDetailPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/dashboard">
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      </Route>
      <Route path="/admin/promo-codes">
        <AdminLayout>
          <AdminPromoCodesPage />
        </AdminLayout>
      </Route>
      <Route path="/admin/reviews">
        <AdminLayout>
          <AdminReviewsPage />
        </AdminLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isAdminRoute && <Header />}
      <main className="flex-1">
        <Routes />
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <AppContent />
          <Toaster />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
