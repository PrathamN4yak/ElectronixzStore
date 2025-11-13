import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(price));

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF6B6B", "#4ECDC4"];

interface SalesTrendData {
  date: string;
  sales: number;
  orders: number;
}

interface TopProductData {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  revenue: number;
}

interface CategoryRevenueData {
  category: string;
  revenue: number;
}

export default function AdminAnalyticsPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth");
    if (!adminAuth) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const { data: salesTrend = [] } = useQuery<SalesTrendData[]>({
    queryKey: ["/api/analytics/sales-trend"],
    meta: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminAuth")}`,
      },
    },
  });

  const { data: topProducts = [] } = useQuery<TopProductData[]>({
    queryKey: ["/api/analytics/top-products"],
    meta: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminAuth")}`,
      },
    },
  });

  const { data: categoryRevenue = [] } = useQuery<CategoryRevenueData[]>({
    queryKey: ["/api/analytics/category-revenue"],
    meta: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminAuth")}`,
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Visual insights into your store's performance</p>
      </div>

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle>Sales Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {salesTrend.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No sales data available yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatPrice(value)} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} name="Sales (INR)" />
                <Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No product data available yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="productName" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatPrice(value)} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue (INR)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryRevenue.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No category data available yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryRevenue}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {categoryRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatPrice(value)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle>Top 10 Products Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No product data available yet</p>
          ) : (
            <div className="space-y-4">
              {topProducts.slice(0, 10).map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{product.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.quantity} units sold • {product.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatPrice(product.revenue)}</p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
