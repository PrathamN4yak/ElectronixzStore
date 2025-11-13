import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Order, Product } from "@shared/schema";
import { BarChart, ShoppingCart, DollarSign, Package } from "lucide-react";

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(price));

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth");
    if (!adminAuth) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);
  const totalOrders = orders.length;

  const productSales = orders.reduce((acc, order) => {
    const existing = acc.find((p) => p.productId === order.productId);
    if (existing) {
      existing.quantity += order.quantity;
      existing.revenue += parseFloat(order.totalPrice);
    } else {
      acc.push({
        productId: order.productId,
        quantity: order.quantity,
        revenue: parseFloat(order.totalPrice),
      });
    }
    return acc;
  }, [] as Array<{ productId: string; quantity: number; revenue: number }>);

  const topProducts = productSales
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((ps) => {
      const product = products.find((p) => p.id === ps.productId);
      return { ...ps, product };
    })
    .filter((p) => p.product);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-card-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-sales">
              {formatPrice(totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-orders">
              {totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">Orders placed</p>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-products">
              {products.length}
            </div>
            <p className="text-xs text-muted-foreground">Total products</p>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-order">
              {formatPrice(totalOrders > 0 ? totalSales / totalOrders : 0)}
            </div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle>Best Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No sales data available yet</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((item, index) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted"
                  data-testid={`product-sales-${index}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{item.product?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatPrice(item.revenue)}</p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Link href="/admin/analytics">
            <Button data-testid="button-view-analytics">View Analytics</Button>
          </Link>
          <Link href="/admin/promo-codes">
            <Button variant="outline" data-testid="button-manage-promo">Manage Promo Codes</Button>
          </Link>
          <Link href="/admin/gift-codes">
            <Button variant="outline" data-testid="button-manage-gifts">Manage Gift Codes</Button>
          </Link>
          <Link href="/admin/reviews">
            <Button variant="outline" data-testid="button-manage-reviews">
              Manage Reviews
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
