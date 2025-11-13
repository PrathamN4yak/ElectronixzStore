import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCartItemSchema, 
  insertContactMessageSchema,
  insertReviewSchema,
  insertPromoCodeSchema,
  insertOrderSchema,
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

  app.get("/api/cart", async (_req, res) => {
    try {
      const cartItems = await storage.getAllCartItems();
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const validatedData = insertCartItemSchema.parse(req.body);
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

  const httpServer = createServer(app);
  return httpServer;
}
