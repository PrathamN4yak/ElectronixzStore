import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Tag, MessageSquare, LogOut } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    setLocation("/admin/login");
  };

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/promo-codes", label: "Promo Codes", icon: Tag },
    { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-2">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-primary mb-1">Admin Panel</h2>
                <p className="text-sm text-muted-foreground">Manage your store</p>
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start"
                      data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              <Button
                variant="outline"
                className="w-full justify-start mt-4"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
          <div className="lg:col-span-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
