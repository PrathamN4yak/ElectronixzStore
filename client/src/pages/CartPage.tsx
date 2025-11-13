import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { Minus, Plus, Trash2, ShoppingBag, Tag, Gift } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CartItem, Product, PromoCode, User } from "@shared/schema";
import { useState } from "react";
import { getUserId } from "@/lib/userUtils";

// Helper to format price in INR
const formatPrice = (price: string | number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(price));

export default function CartPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(null);
  const [giftCode, setGiftCode] = useState("");
  const userId = getUserId();

  const { data: cartItems = [] } = useQuery<CartItem[]>({ 
    queryKey: [`/api/cart?userId=${userId}`],
    enabled: !!userId,
  });
  const { data: products = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { data: user } = useQuery<User>({
    queryKey: [`/api/user/${userId}`],
    enabled: !!userId,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) =>
      apiRequest("PATCH", `/api/cart/${id}`, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/cart?userId=${userId}`] }),
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/cart/${id}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/cart?userId=${userId}`] }),
  });

  const validatePromoCodeMutation = useMutation<PromoCode, Error, string>({
    mutationFn: async (code: string) => {
      return await apiRequest("POST", "/api/promo-codes/validate", { code });
    },
    onSuccess: (data: PromoCode) => {
      setAppliedPromoCode(data);
      toast({ 
        title: "Promo code applied successfully!", 
        description: `You saved ${data.discount}% on your order` 
      });
    },
    onError: () => {
      toast({ 
        title: "Invalid promo code", 
        description: "Please check your code and try again",
        variant: "destructive"
      });
    },
  });

  const redeemGiftCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest("POST", "/api/gift-codes/redeem", { code, userId });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}`] });
      toast({ 
        title: "Gift code redeemed!", 
        description: data.message 
      });
      setGiftCode("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to redeem gift code", 
        description: error.message || "Invalid or already used gift code",
        variant: "destructive"
      });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/checkout", { 
        userId, 
        promoCode: appliedPromoCode?.code 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cart?userId=${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}`] });
      toast({ 
        title: "Order placed successfully!", 
        description: "Your order has been confirmed" 
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({ 
        title: "Checkout failed", 
        description: error.message || "Please try again",
        variant: "destructive"
      });
    },
  });

  const handleApplyPromoCode = () => {
    if (!promoCode.trim()) {
      toast({ 
        title: "Enter a promo code", 
        description: "Please enter a promo code to apply",
        variant: "destructive"
      });
      return;
    }
    validatePromoCodeMutation.mutate(promoCode.trim().toUpperCase());
  };

  const handleRedeemGiftCode = () => {
    if (!giftCode.trim()) {
      toast({ 
        title: "Enter a gift code", 
        description: "Please enter a gift code to redeem",
        variant: "destructive"
      });
      return;
    }
    redeemGiftCodeMutation.mutate(giftCode.trim().toUpperCase());
  };

  const handleCheckout = () => {
    if (!user) {
      toast({ 
        title: "User not found", 
        description: "Please refresh the page and try again",
        variant: "destructive"
      });
      return;
    }
    
    const walletBalance = parseFloat(user.walletBalance);
    if (walletBalance < total) {
      toast({ 
        title: "Insufficient wallet balance", 
        description: `You need ${formatPrice(total - walletBalance)} more to complete this order`,
        variant: "destructive"
      });
      return;
    }
    
    checkoutMutation.mutate();
  };

  const cartWithProducts = cartItems
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter((item): item is CartItem & { product: Product } => item !== null);

  const subtotal = cartWithProducts.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  const discount = appliedPromoCode ? (subtotal * appliedPromoCode.discount) / 100 : 0;
  const total = subtotal - discount;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-12 text-foreground">Shopping Cart</h1>
          <Card className="p-12 text-center border-card-border">
            <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4 text-foreground">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Start shopping to add items to your cart</p>
            <Link href="/products" data-testid="link-continue-shopping-empty">
              <Button size="lg" data-testid="button-continue-shopping">
                CONTINUE SHOPPING
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-12 text-foreground">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartWithProducts.map((item) => (
              <Card key={item.id} className="p-6 border-card-border">
                <div className="flex gap-6">
                  <div className="w-32 h-32 flex-shrink-0 bg-white rounded-md overflow-hidden">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/product/${item.product.id}`}
                      data-testid={`link-cart-product-${item.id}`}
                    >
                      <h3 className="text-xl font-semibold text-foreground mb-2 hover:text-primary transition-colors" data-testid={`text-cart-product-${item.id}`}>
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-2xl font-bold text-primary mb-4" data-testid={`text-cart-price-${item.id}`}>
                      {formatPrice(item.product.price)}
                    </p>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            updateQuantityMutation.mutate({
                              id: item.id,
                              quantity: Math.max(1, item.quantity - 1),
                            })
                          }
                          disabled={item.quantity <= 1}
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-lg font-medium w-12 text-center" data-testid={`text-quantity-${item.id}`}>
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            updateQuantityMutation.mutate({
                              id: item.id,
                              quantity: item.quantity + 1,
                            })
                          }
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItemMutation.mutate(item.id)}
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground" data-testid={`text-subtotal-${item.id}`}>
                      {formatPrice(parseFloat(item.product.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 border-card-border">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Order Summary</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Redeem Gift Code</label>
                <div className="flex gap-2">
                  <Input
                    value={giftCode}
                    onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                    placeholder="Enter gift code"
                    data-testid="input-gift-code"
                  />
                  <Button
                    onClick={handleRedeemGiftCode}
                    disabled={redeemGiftCodeMutation.isPending}
                    data-testid="button-redeem-gift"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    {redeemGiftCodeMutation.isPending ? "..." : "Redeem"}
                  </Button>
                </div>
                {user && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Current wallet balance: <span className="font-semibold text-primary">{formatPrice(user.walletBalance)}</span>
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Promo Code (Discount)</label>
                <div className="flex gap-2">
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    disabled={!!appliedPromoCode}
                    data-testid="input-promo-code"
                  />
                  <Button
                    onClick={handleApplyPromoCode}
                    disabled={validatePromoCodeMutation.isPending || !!appliedPromoCode}
                    data-testid="button-apply-promo"
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    {validatePromoCodeMutation.isPending ? "..." : "Apply"}
                  </Button>
                </div>
                {appliedPromoCode && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-green-600 font-medium" data-testid="text-promo-applied">
                      Code "{appliedPromoCode.code}" applied ({appliedPromoCode.discount}% off)
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAppliedPromoCode(null);
                        setPromoCode("");
                      }}
                      data-testid="button-remove-promo"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-lg">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground" data-testid="text-subtotal">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold text-foreground">FREE</span>
                </div>
                {appliedPromoCode && discount > 0 && (
                  <div className="flex justify-between text-lg text-green-600">
                    <span className="font-medium">Discount ({appliedPromoCode.discount}%)</span>
                    <span className="font-semibold" data-testid="text-discount">
                      -{formatPrice(discount)}
                    </span>
                  </div>
                )}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-xl">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="font-bold text-primary text-2xl" data-testid="text-total">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-14 text-base font-medium mb-4"
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending || !user}
                data-testid="button-checkout"
              >
                {checkoutMutation.isPending ? "PROCESSING..." : "PROCEED TO CHECKOUT"}
              </Button>
              
              {user && parseFloat(user.walletBalance) < total && (
                <p className="text-sm text-red-600 text-center mb-4">
                  Insufficient balance. Please redeem a gift code first.
                </p>
              )}

              <Link href="/products" data-testid="link-continue-shopping">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-14 text-base font-medium"
                  data-testid="button-continue-shopping"
                >
                  CONTINUE SHOPPING
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
