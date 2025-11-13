import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CartItem } from "@shared/schema";

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
  });

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          <Link href="/" className="flex items-center" data-testid="link-logo">
            <span className="text-2xl font-bold text-primary" data-testid="logo-electronixz">
              Electronixz
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-base font-medium transition-colors hover:text-primary ${
                  location === link.href
                    ? "text-primary"
                    : "text-foreground"
                }`}
                data-testid={`link-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative hover-elevate active-elevate-2 p-2 rounded-md"
              data-testid="link-cart"
            >
              <ShoppingCart className="w-6 h-6 text-foreground" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  aria-label={`${cartCount} items in cart`}
                  data-testid="text-cart-count"
                >
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden hover-elevate active-elevate-2 p-2 rounded-md"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col px-4 py-4 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium px-4 py-3 rounded-md hover-elevate ${
                  location === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-foreground"
                }`}
                data-testid={`link-mobile-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
