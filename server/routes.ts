import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCartItemSchema, 
  insertContactMessageSchema,
  insertReviewSchema,
  insertPromoCodeSchema,
  insertOrderSchema,
  insertGiftCodeSchema,
  type User,
  type GiftCode,
} from "@shared/schema";

const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const token = authHeader.substring(7);
  const admin = await storage.getAdminByEmail("admin@electronixz.com");
  
  if (!admin || token !== `admin_${admin.id}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.get("/api/cart", async (req, res) => {
    try {
      const userId = req.query.userId as string || "guest-user";
      const cartItems = await storage.getAllCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const validatedData = insertCartItemSchema.parse(req.body);
      if (!validatedData.userId || validatedData.userId.trim() === "") {
        return res.status(400).json({ error: "User ID is required" });
      }
      const cartItem = await storage.addToCart(validatedData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid cart item data" });
      }
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      if (typeof quantity !== "number" || quantity < 1) {
        return res.status(400).json({ error: "Invalid quantity" });
      }

      const updatedItem = await storage.updateCartItemQuantity(
        req.params.id,
        quantity
      );

      if (!updatedItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const deleted = await storage.removeFromCart(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid contact message data" });
      }
      res.status(500).json({ error: "Failed to submit contact message" });
    }
  });

  app.get("/api/reviews/product/:productId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByProduct(req.params.productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.get("/api/reviews", async (_req, res) => {
    try {
      const reviews = await storage.getAllReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid review data" });
      }
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.patch("/api/reviews/:id", adminMiddleware, async (req, res) => {
    try {
      const updatedReview = await storage.updateReview(req.params.id, req.body);
      if (!updatedReview) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.json(updatedReview);
    } catch (error) {
      res.status(500).json({ error: "Failed to update review" });
    }
  });

  app.delete("/api/reviews/:id", adminMiddleware, async (req, res) => {
    try {
      const deleted = await storage.deleteReview(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete review" });
    }
  });

  app.get("/api/promo-codes", async (_req, res) => {
    try {
      const promoCodes = await storage.getAllPromoCodes();
      res.json(promoCodes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch promo codes" });
    }
  });

  app.post("/api/promo-codes/validate", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: "Promo code is required" });
      }
      const promoCode = await storage.getPromoCodeByCode(code);
      if (!promoCode) {
        return res.status(404).json({ error: "Invalid promo code" });
      }
      res.json(promoCode);
    } catch (error) {
      res.status(500).json({ error: "Failed to validate promo code" });
    }
  });

  app.post("/api/promo-codes", adminMiddleware, async (req, res) => {
    try {
      const validatedData = insertPromoCodeSchema.parse(req.body);
      const promoCode = await storage.createPromoCode(validatedData);
      res.status(201).json(promoCode);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid promo code data" });
      }
      res.status(500).json({ error: "Failed to create promo code" });
    }
  });

  app.patch("/api/promo-codes/:id", adminMiddleware, async (req, res) => {
    try {
      const updatedPromoCode = await storage.updatePromoCode(req.params.id, req.body);
      if (!updatedPromoCode) {
        return res.status(404).json({ error: "Promo code not found" });
      }
      res.json(updatedPromoCode);
    } catch (error) {
      res.status(500).json({ error: "Failed to update promo code" });
    }
  });

  app.delete("/api/promo-codes/:id", adminMiddleware, async (req, res) => {
    try {
      const deleted = await storage.deletePromoCode(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Promo code not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete promo code" });
    }
  });

  app.get("/api/orders", async (_req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid order data" });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      const admin = await storage.getAdminByEmail(email);
      if (!admin || admin.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const token = `admin_${admin.id}`;
      res.json({ success: true, admin: { id: admin.id, email: admin.email }, token });
    } catch (error) {
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/gift-codes", adminMiddleware, async (_req, res) => {
    try {
      const giftCodes = await storage.getAllGiftCodes();
      res.json(giftCodes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gift codes" });
    }
  });

  app.post("/api/gift-codes", adminMiddleware, async (req, res) => {
    try {
      const validatedData = insertGiftCodeSchema.parse(req.body);
      const giftCode = await storage.createGiftCode(validatedData);
      res.status(201).json(giftCode);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid gift code data" });
      }
      res.status(500).json({ error: "Failed to create gift code" });
    }
  });

  app.post("/api/gift-codes/generate", adminMiddleware, async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount || typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ error: "Valid amount is required" });
      }

      const code = `GFT${Math.random().toString(36).substring(2, 8).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;
      const giftCode = await storage.createGiftCode({ code, amount });
      res.status(201).json(giftCode);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate gift code" });
    }
  });

  app.patch("/api/gift-codes/:id", adminMiddleware, async (req, res) => {
    try {
      const updatedGiftCode = await storage.updateGiftCode(req.params.id, req.body);
      if (!updatedGiftCode) {
        return res.status(404).json({ error: "Gift code not found" });
      }
      res.json(updatedGiftCode);
    } catch (error) {
      res.status(500).json({ error: "Failed to update gift code" });
    }
  });

  app.delete("/api/gift-codes/:id", adminMiddleware, async (req, res) => {
    try {
      const deleted = await storage.deleteGiftCode(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Gift code not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete gift code" });
    }
  });

  app.post("/api/gift-codes/redeem", async (req, res) => {
    try {
      const { code, userId } = req.body;
      if (!code || !userId) {
        return res.status(400).json({ error: "Code and user ID are required" });
      }

      const giftCode = await storage.getGiftCodeByCode(code);
      if (!giftCode) {
        return res.status(404).json({ error: "Invalid or expired gift code" });
      }

      if (!giftCode.active) {
        return res.status(400).json({ error: "Gift code has already been used" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const amount = parseFloat(giftCode.amount);
      const updatedUser = await storage.updateUserWalletBalance(userId, amount);
      await storage.updateGiftCode(giftCode.id, { active: false });
      await storage.createGiftCodeRedemption({ userId, giftCodeId: giftCode.id });

      res.json({ 
        success: true, 
        user: updatedUser, 
        amountAdded: amount,
        message: `Successfully added ${amount.toFixed(2)} to your wallet` 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to redeem gift code" });
    }
  });

  app.post("/api/checkout", async (req, res) => {
    try {
      const { userId, promoCode } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const cartItems = await storage.getAllCartItems(userId);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      let subtotal = 0;
      const orderPromises: Promise<any>[] = [];

      for (const item of cartItems) {
        const product = await storage.getProduct(item.productId);
        if (!product) continue;

        const itemTotal = parseFloat(product.price) * item.quantity;
        subtotal += itemTotal;

        orderPromises.push(
          storage.createOrder({
            userId,
            productId: item.productId,
            quantity: item.quantity,
            totalPrice: itemTotal.toFixed(2),
          })
        );
      }

      let discount = 0;
      if (promoCode) {
        const promo = await storage.getPromoCodeByCode(promoCode);
        if (promo) {
          discount = (subtotal * promo.discount) / 100;
        }
      }

      const total = subtotal - discount;
      const walletBalance = parseFloat(user.walletBalance);

      if (walletBalance < total) {
        return res.status(400).json({ 
          error: "Insufficient wallet balance",
          required: total.toFixed(2),
          available: walletBalance.toFixed(2)
        });
      }

      await storage.updateUserWalletBalance(userId, -total);
      await Promise.all(orderPromises);
      await storage.clearCart(userId);

      const updatedUser = await storage.getUser(userId);

      res.json({
        success: true,
        message: "Order placed successfully",
        orderDetails: {
          subtotal: subtotal.toFixed(2),
          discount: discount.toFixed(2),
          total: total.toFixed(2),
          remainingBalance: updatedUser?.walletBalance || "0"
        }
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Insufficient wallet balance") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to process checkout" });
    }
  });

  app.get("/api/analytics/summary", adminMiddleware, async (_req, res) => {
    try {
      const orders = await storage.getAllOrders();
      const products = await storage.getAllProducts();
      
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
      
      res.json({
        totalSales,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
        totalProducts: products.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics summary" });
    }
  });

  app.get("/api/analytics/sales-trend", adminMiddleware, async (_req, res) => {
    try {
      const orders = await storage.getAllOrders();
      
      const salesByDate = orders.reduce((acc, order) => {
        const date = order.createdAt.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, sales: 0, orders: 0 };
        }
        acc[date].sales += parseFloat(order.totalPrice);
        acc[date].orders += 1;
        return acc;
      }, {} as Record<string, { date: string; sales: number; orders: number }>);
      
      const trend = Object.values(salesByDate).sort((a, b) => 
        a.date.localeCompare(b.date)
      );
      
      res.json(trend);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales trend" });
    }
  });

  app.get("/api/analytics/top-products", adminMiddleware, async (_req, res) => {
    try {
      const orders = await storage.getAllOrders();
      const products = await storage.getAllProducts();
      
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
        .slice(0, 10)
        .map((ps) => {
          const product = products.find((p) => p.id === ps.productId);
          return { 
            ...ps, 
            productName: product?.name || "Unknown",
            category: product?.category || "Unknown"
          };
        });
      
      res.json(topProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top products" });
    }
  });

  app.get("/api/analytics/category-revenue", adminMiddleware, async (_req, res) => {
    try {
      const orders = await storage.getAllOrders();
      const products = await storage.getAllProducts();
      
      const categoryRevenue = orders.reduce((acc, order) => {
        const product = products.find((p) => p.id === order.productId);
        if (!product) return acc;
        
        const category = product.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += parseFloat(order.totalPrice);
        return acc;
      }, {} as Record<string, number>);
      
      const result = Object.entries(categoryRevenue).map(([category, revenue]) => ({
        category,
        revenue
      }));
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category revenue" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
