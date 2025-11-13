import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-[#2C2C2C] text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Electronixz</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted destination for premium electronics. Quality products, competitive prices, exceptional service.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors text-sm" data-testid="link-footer-home">
                  Home
                </a>
              </li>
              <li>
                <a href="/products" className="text-gray-300 hover:text-white transition-colors text-sm" data-testid="link-footer-products">
                  Products
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors text-sm" data-testid="link-footer-about">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm" data-testid="link-footer-contact">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Follow Us</h4>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center hover:bg-primary hover:border-primary transition-all"
                    data-testid={`link-social-${social.label.toLowerCase()}`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} Electronixz. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
