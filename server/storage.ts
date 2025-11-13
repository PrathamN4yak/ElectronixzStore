import {
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type ContactMessage,
  type InsertContactMessage,
  type Review,
  type InsertReview,
  type PromoCode,
  type InsertPromoCode,
  type Order,
  type InsertOrder,
  type Admin,
  type InsertAdmin,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  getAllCartItems(): Promise<CartItem[]>;
  getCartItem(id: string): Promise<CartItem | undefined>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  
  getReviewsByProduct(productId: string): Promise<Review[]>;
  getAllReviews(): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, updates: Partial<Review>): Promise<Review | undefined>;
  deleteReview(id: string): Promise<boolean>;
  
  getAllPromoCodes(): Promise<PromoCode[]>;
  getPromoCodeByCode(code: string): Promise<PromoCode | undefined>;
  createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode>;
  updatePromoCode(id: string, updates: Partial<PromoCode>): Promise<PromoCode | undefined>;
  deletePromoCode(id: string): Promise<boolean>;
  
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private cartItems: Map<string, CartItem>;
  private contactMessages: Map<string, ContactMessage>;
  private reviews: Map<string, Review>;
  private promoCodes: Map<string, PromoCode>;
  private orders: Map<string, Order>;
  private admins: Map<string, Admin>;

  constructor() {
    this.products = new Map();
    this.cartItems = new Map();
    this.contactMessages = new Map();
    this.reviews = new Map();
    this.promoCodes = new Map();
    this.orders = new Map();
    this.admins = new Map();
    this.initializeProducts();
    this.initializeAdmin();
    this.initializePromoCodes();
  }

  private initializeProducts() {
    const sampleProducts: Omit<Product, "id">[] = [
      {
        name: "French Door Refrigerator 28 cu. ft.",
        category: "Refrigerator",
        price: "100000",
        description: "Experience the perfect blend of style and innovation with our French door refrigerator. Features FlexZone drawer, Twin Cooling Plus technology, and smart connectivity for ultimate food preservation.",
        image: "/@fs/C:/Users/Admin/Desktop/maketing/ElectronixzStore/attached_assets/generated_images/Refrigerator_product_image_2c18924a.png",
        specifications: [
          "Capacity: 28 cubic feet",
          "FlexZone Drawer with adjustable temperature",
          "Twin Cooling Plus technology",
          "Wi-Fi enabled with SmartThings integration",
          "Ice and water dispenser",
          "Energy Star certified"
        ],
        featured: 1,
      },
      {
        name: "65-inch 4K QLED Smart TV",
        category: "TV",
        price: "50000",
        description: "Immerse yourself in stunning picture quality with Quantum Dot technology. This premium 4K QLED TV delivers over a billion shades of brilliant color and exceptional brightness for a truly cinematic experience.",
        image: "/@fs/C:/Users/Admin/Desktop/maketing/ElectronixzStore/attached_assets/generated_images/Television_product_image_71476d4b.png",
        specifications: [
          "Screen Size: 65 inches",
          "Resolution: 4K Ultra HD (3840 x 2160)",
          "Quantum Dot technology",
          "HDR10+ support",
          "120Hz refresh rate",
          "Smart TV with voice control"
        ],
        featured: 1,
      },
      {
        name: "Smartwatch Pro",
        category: "Smartwatch",
        price: "29999",
        description: "Stay connected and track your health with our advanced smartwatch. Features comprehensive health monitoring, long battery life, and seamless integration with your smartphone.",
        image: "/@fs/C:/Users/Admin/Desktop/maketing/ElectronixzStore/attached_assets/generated_images/Smartwatch_product_image_43fb74da.png",
        specifications: [
          "1.4-inch Super AMOLED display",
          "Advanced health monitoring (heart rate, ECG, sleep)",
          "5ATM water resistance",
          "Up to 3 days battery life",
          "GPS and NFC",
          "Compatible with Android and iOS"
        ],
        featured: 1,
      },
      {
        name: "Ultra Smartphone",
        category: "Smartphone",
        price: "80000",
        description: "The ultimate flagship smartphone with cutting-edge AI features, professional-grade cameras, and unmatched performance. Experience the future of mobile technology.",
        image: "/@fs/C:/Users/Admin/Desktop/maketing/ElectronixzStore/attached_assets/generated_images/Smartphone_product_image_c7108c38.png",
        specifications: [
          "6.8-inch Dynamic AMOLED display",
          "200MP main camera with AI enhancement",
          "Snapdragon 8 Gen 3 processor",
          "12GB RAM, 256GB storage",
          "5000mAh battery with fast charging",
          "S Pen included"
        ],
        featured: 1,
      },
      {
        name: " Pro Buds Wireless Earbuds",
        category: "Earbuds",
        price: "4999",
        description: "Premium wireless earbuds with intelligent active noise cancellation, immersive sound, and all-day comfort. Perfect for music, calls, and everything in between.",
        image: "/@fs/C:/Users/Admin/Desktop/maketing/ElectronixzStore/attached_assets/generated_images/Wireless_earbuds_product_image_6c28752f.png",
        specifications: [
          "Active Noise Cancellation",
          "360 Audio with Dolby Atmos",
          "Up to 8 hours playback (28 hours with case)",
          "IPX7 water resistance",
          "Wireless charging case",
          "Touch controls"
        ],
        featured: 1,
      },
      {
        name: "Ultra Laptop",
        category: "Laptop",
        price: "80000",
        description: "Power through demanding tasks with our ultra-premium laptop. Features the latest Intel processor, stunning AMOLED display, and all-day battery life in a sleek, portable design.",
        image: "/@fs/C:/Users/Admin/Desktop/maketing/ElectronixzStore/attached_assets/generated_images/Laptop_product_image_b15cb7c4.png",
        specifications: [
          "16-inch 3K AMOLED touchscreen",
          "Intel Core Ultra 9 processor",
          "32GB RAM, 1TB SSD",
          "NVIDIA GeForce RTX 4070",
          "Up to 16 hours battery life",
          "Thunderbolt 4 ports"
        ],
        featured: 1,
      },
      {
        name: "25,000mAh Fast Charge Power Bank",
        category: "Power Bank",
        price: "1999",
        description: "Never run out of power with our high-capacity portable charger. Features super fast charging, multiple ports, and a premium aluminum design.",
        image: "/@fs/C:/Users/Admin/Desktop/maketing/ElectronixzStore/attached_assets/generated_images/Power_bank_product_image_5b1a3e35.png",
        specifications: [
          "Capacity: 25,000mAh",
          "45W Super Fast Charging",
          "3 USB ports (2x USB-C, 1x USB-A)",
          "LED charge indicator",
          "Compact aluminum body",
          "Pass-through charging"
        ],
        featured: 0,
      },
      {
        name: "Smart Front Load Washer 5.0 cu. ft.",
        category: "Washing Machine",
        price: "46990",
        description: "Revolutionize laundry day with our smart front-load washer. Advanced cleaning technology meets energy efficiency for impeccably clean clothes every time.",
        image: "/@fs/C:/Users/Admin/Desktop/maketing/ElectronixzStore/attached_assets/generated_images/Washing_machine_product_image_8155f16b.png",
        specifications: [
          "Capacity: 5.0 cubic feet",
          "Smart Control with Wi-Fi",
          "Steam cleaning technology",
          "14 wash cycles",
          "Energy Star certified",
          "Self-cleaning drum"
        ],
        featured: 0,
      },
      {
        name: "WindFree Elite Air Conditioner",
        category: "AC",
        price: "20000",
        description: "Experience comfortable cooling without the cold draft. Our WindFree technology distributes air gently through thousands of micro holes for a gentle, still air cooling experience.",
        image: "/@fs/C:/Users/Admin/Desktop/maketing/ElectronixzStore/attached_assets/generated_images/Air_conditioner_product_image_f4d1ac97.png",
        specifications: [
          "18,000 BTU cooling capacity",
          "WindFree cooling technology",
          "Smart inverter compressor",
          "Wi-Fi enabled with app control",
          "Triple protection filter",
          "Energy efficiency rating: A+++"
        ],
        featured: 0,
      },
    ];

    sampleProducts.forEach((product) => {
      const id = randomUUID();
      this.products.set(id, { ...product, id });
    });
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...insertProduct, 
      id,
      featured: insertProduct.featured ?? 0,
    };
    this.products.set(id, product);
    return product;
  }

  async getAllCartItems(): Promise<CartItem[]> {
    return Array.from(this.cartItems.values());
  }

  async getCartItem(id: string): Promise<CartItem | undefined> {
    return this.cartItems.get(id);
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    const existingItem = Array.from(this.cartItems.values()).find(
      (item) => item.productId === insertItem.productId
    );

    if (existingItem) {
      existingItem.quantity += (insertItem.quantity ?? 1);
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    }

    const id = randomUUID();
    const cartItem: CartItem = { 
      ...insertItem, 
      id,
      quantity: insertItem.quantity ?? 1,
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItemQuantity(
    id: string,
    quantity: number
  ): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;

    item.quantity = quantity;
    this.cartItems.set(id, item);
    return item;
  }

  async removeFromCart(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async createContactMessage(
    insertMessage: InsertContactMessage
  ): Promise<ContactMessage> {
    const id = randomUUID();
    const message: ContactMessage = { ...insertMessage, id };
    this.contactMessages.set(id, message);
    return message;
  }

  private initializeAdmin() {
    const adminId = randomUUID();
    const admin: Admin = {
      id: adminId,
      email: "admin@electronixz.com",
      password: "12345",
    };
    this.admins.set(adminId, admin);
  }

  private initializePromoCodes() {
    const samplePromoCodes: Omit<PromoCode, "id">[] = [
      { code: "WELCOME10", discount: 10, active: true },
      { code: "SAVE20", discount: 20, active: true },
      { code: "MEGA50", discount: 50, active: true },
    ];

    samplePromoCodes.forEach((promoCode) => {
      const id = randomUUID();
      this.promoCodes.set(id, { ...promoCode, id });
    });
  }

  async getReviewsByProduct(productId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.productId === productId && review.visible
    );
  }

  async getAllReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values());
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
      visible: true,
    };
    this.reviews.set(id, review);
    return review;
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;

    const updatedReview = { ...review, ...updates };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }

  async deleteReview(id: string): Promise<boolean> {
    return this.reviews.delete(id);
  }

  async getAllPromoCodes(): Promise<PromoCode[]> {
    return Array.from(this.promoCodes.values());
  }

  async getPromoCodeByCode(code: string): Promise<PromoCode | undefined> {
    return Array.from(this.promoCodes.values()).find(
      (pc) => pc.code.toUpperCase() === code.toUpperCase() && pc.active
    );
  }

  async createPromoCode(insertPromoCode: InsertPromoCode): Promise<PromoCode> {
    const id = randomUUID();
    const promoCode: PromoCode = {
      ...insertPromoCode,
      id,
      active: true,
    };
    this.promoCodes.set(id, promoCode);
    return promoCode;
  }

  async updatePromoCode(id: string, updates: Partial<PromoCode>): Promise<PromoCode | undefined> {
    const promoCode = this.promoCodes.get(id);
    if (!promoCode) return undefined;

    const updatedPromoCode = { ...promoCode, ...updates };
    this.promoCodes.set(id, updatedPromoCode);
    return updatedPromoCode;
  }

  async deletePromoCode(id: string): Promise<boolean> {
    return this.promoCodes.delete(id);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(
      (admin) => admin.email === email
    );
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = randomUUID();
    const admin: Admin = { ...insertAdmin, id };
    this.admins.set(id, admin);
    return admin;
  }
}

export const storage = new MemStorage();
