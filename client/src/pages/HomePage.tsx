import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Product } from "@shared/schema";
import heroImage from "@assets/generated_images/Hero_banner_electronics_showcase_f895f81a.png";
import fridgeImg from "@assets/generated_images/Refrigerator_product_image_2c18924a.png";
import tvImg from "@assets/generated_images/Television_product_image_71476d4b.png";
import smartwatchImg from "@assets/generated_images/Smartwatch_product_image_43fb74da.png";
import smartphoneImg from "@assets/generated_images/Smartphone_product_image_c7108c38.png";
import earbudsImg from "@assets/generated_images/Wireless_earbuds_product_image_6c28752f.png";
import laptopImg from "@assets/generated_images/Laptop_product_image_b15cb7c4.png";
import powerBankImg from "@assets/generated_images/Power_bank_product_image_5b1a3e35.png";
import washingMachineImg from "@assets/generated_images/Washing_machine_product_image_8155f16b.png";
import acImg from "@assets/generated_images/Air_conditioner_product_image_f4d1ac97.png";

const categories = [
  { name: "Refrigerators", image: fridgeImg, category: "Refrigerator" },
  { name: "Televisions", image: tvImg, category: "TV" },
  { name: "Smartwatches", image: smartwatchImg, category: "Smartwatch" },
  { name: "Smartphones", image: smartphoneImg, category: "Smartphone" },
  { name: "Earbuds", image: earbudsImg, category: "Earbuds" },
  { name: "Laptops", image: laptopImg, category: "Laptop" },
  { name: "Power Banks", image: powerBankImg, category: "Power Bank" },
  { name: "Washing Machines", image: washingMachineImg, category: "Washing Machine" },
  { name: "Air Conditioners", image: acImg, category: "AC" },
];

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(price));

export default function HomePage() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products.filter((p) => p.featured === 1).slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[600px] w-full overflow-hidden">
        <img
          src={heroImage}
          alt="Premium Electronics Collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Premium Electronics for Modern Living
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8">
                Discover cutting-edge technology with our curated collection of top-tier electronics
              </p>
              <Link href="/products" data-testid="link-shop-now">
                <Button
                  size="lg"
                  className="bg-white/20 backdrop-blur-md text-white border-2 border-white/30 hover:bg-white/30 h-14 px-8 text-base font-medium no-default-hover-elevate"
                  data-testid="button-shop-now"
                >
                  SHOP NOW
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/products?category=${category.category}`}
              data-testid={`link-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all cursor-pointer group border-card-border">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3
                    className="text-xl font-bold text-foreground"
                    data-testid={`text-category-${category.name.toLowerCase()}`}
                  >
                    {category.name}
                  </h3>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-muted py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Featured Electronics
          </h2>
          {isLoading ? (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  data-testid={`link-featured-product-${product.id}`}
                >
                  <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all group border-card-border">
                    <div className="aspect-square overflow-hidden bg-white">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6 space-y-4">
                      <h3
                        className="text-xl font-semibold text-foreground line-clamp-2 min-h-[3.5rem]"
                        data-testid={`text-product-${product.id}`}
                      >
                        {product.name}
                      </h3>
                      <p
                        className="text-2xl font-bold text-primary"
                        data-testid={`text-price-${product.id}`}
                      >
                        {formatPrice(product.price)}
                      </p>
                      <Button
                        className="w-full h-12"
                        data-testid={`button-view-${product.id}`}
                      >
                        VIEW DETAILS
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
