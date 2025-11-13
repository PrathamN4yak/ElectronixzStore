import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import { ShoppingCart } from "lucide-react";
import { getUserId } from "@/lib/userUtils";

// Helper to format price in INR
const formatPrice = (price: string | number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(price));

export default function ProductsPage() {
  const { toast } = useToast();
  const userId = getUserId();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => apiRequest("POST", "/api/cart", { userId, productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cart?userId=${userId}`] });
      toast({
        title: "Added to cart",
        description: "Product added to your cart successfully",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-12 text-foreground">Our Products</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden animate-pulse border-card-border">
                <div className="aspect-square bg-accent" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-accent rounded" />
                  <div className="h-8 bg-accent rounded w-1/2" />
                  <div className="h-12 bg-accent rounded" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Our Products
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore our complete collection of premium electronics
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden hover-elevate transition-all group flex flex-col border-card-border"
            >
              <Link 
                href={`/product/${product.id}`} 
                className="block"
                data-testid={`link-product-image-${product.id}`}
              >
                <div className="aspect-square overflow-hidden bg-white">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <Link 
                  href={`/product/${product.id}`}
                  data-testid={`link-product-name-${product.id}`}
                >
                  <h3 className="text-xl font-semibold text-foreground line-clamp-2 min-h-[3.5rem] hover:text-primary transition-colors" data-testid={`text-product-${product.id}`}>
                    {product.name}
                  </h3>
                </Link>
                <p className="text-2xl font-bold text-primary" data-testid={`text-price-${product.id}`}>
                  {formatPrice(product.price)}
                </p>
                <Button
                  className="w-full h-12 mt-auto"
                  onClick={() => addToCartMutation.mutate(product.id)}
                  disabled={addToCartMutation.isPending}
                  data-testid={`button-add-to-cart-${product.id}`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {addToCartMutation.isPending ? "ADDING..." : "ADD TO CART"}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">No products available</p>
          </div>
        )}
      </div>
    </div>
  );
}
