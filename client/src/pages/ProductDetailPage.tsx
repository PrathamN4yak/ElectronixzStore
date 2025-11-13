import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, Review } from "@shared/schema";
import { ShoppingCart, ArrowLeft, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { format } from "date-fns";

// Helper to format price in INR
const formatPrice = (price: string | number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(price));

export default function ProductDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState("");
  const [comment, setComment] = useState("");

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/reviews/product", id],
    queryFn: async () => {
      const res = await fetch(`/api/reviews/product/${id}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    enabled: !!id,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/cart", { productId: id, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Added to cart", description: "Product added to your cart successfully" });
    },
  });

  const buyNowMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/cart", { productId: id, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      window.location.href = "/cart";
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: { productId: string; rating: number; comment: string; authorName: string }) =>
      apiRequest("POST", "/api/reviews", reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/product", id] });
      toast({ title: "Review submitted", description: "Thank you for your review!" });
      setRating(5);
      setAuthorName("");
      setComment("");
    },
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !authorName.trim() || !comment.trim()) {
      toast({ 
        title: "Missing information", 
        description: "Please fill in your name and review",
        variant: "destructive"
      });
      return;
    }
    submitReviewMutation.mutate({
      productId: id,
      rating,
      comment: comment.trim(),
      authorName: authorName.trim(),
    });
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-accent rounded w-32 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-accent rounded-lg" />
              <div className="space-y-6">
                <div className="h-12 bg-accent rounded" />
                <div className="h-10 bg-accent rounded w-1/3" />
                <div className="h-24 bg-accent rounded" />
                <div className="h-64 bg-accent rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <Link href="/products" data-testid="link-back-not-found">
            <Button data-testid="button-back-not-found">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/products" data-testid="link-back-to-products">
          <Button variant="ghost" className="mb-8" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            <Card className="overflow-hidden bg-white p-8 border-card-border">
              <div className="aspect-square w-full max-w-2xl mx-auto">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  data-testid="img-product"
                />
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-product-name">
                {product.name}
              </h1>
              <p className="text-4xl font-bold text-primary mb-6" data-testid="text-product-price">
                {formatPrice(product.price)}
              </p>
            </div>

            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full h-14 text-base font-medium"
                onClick={() => buyNowMutation.mutate()}
                disabled={buyNowMutation.isPending}
                data-testid="button-buy-now"
              >
                {buyNowMutation.isPending ? "PROCESSING..." : "BUY NOW"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full h-14 text-base font-medium"
                onClick={() => addToCartMutation.mutate()}
                disabled={addToCartMutation.isPending}
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {addToCartMutation.isPending ? "ADDING..." : "ADD TO CART"}
              </Button>
            </div>

            <Card className="p-6 border-card-border">
              <h3 className="text-xl font-bold mb-4 text-foreground">Description</h3>
              <p className="text-base leading-relaxed text-foreground" data-testid="text-product-description">
                {product.description}
              </p>
            </Card>

            {product.specifications && product.specifications.length > 0 && (
              <Card className="p-6 border-card-border">
                <h3 className="text-xl font-bold mb-4 text-foreground">Specifications</h3>
                <div className="space-y-2">
                  {product.specifications.map((spec, index) => (
                    <div
                      key={index}
                      className={`py-3 px-4 rounded-md ${index % 2 === 0 ? "bg-muted" : "bg-background"}`}
                      data-testid={`text-spec-${index}`}
                    >
                      <p className="text-sm text-foreground">{spec}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="mt-16">
          <Card className="border-card-border">
            <CardHeader>
              <CardTitle className="text-2xl">Customer Reviews</CardTitle>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(averageRating)
                            ? "fill-primary text-primary"
                            : "fill-muted text-muted"
                        }`}
                        data-testid={`star-average-${star}`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold" data-testid="text-average-rating">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground" data-testid="text-review-count">
                    ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="hover-elevate active-elevate-2 rounded"
                          data-testid={`button-rating-${star}`}
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= rating ? "fill-primary text-primary" : "fill-muted text-muted"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="author-name" className="block text-sm font-medium mb-2">
                      Your Name
                    </label>
                    <Input
                      id="author-name"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Enter your name"
                      required
                      data-testid="input-author-name"
                    />
                  </div>
                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium mb-2">
                      Your Review
                    </label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      rows={4}
                      required
                      data-testid="input-review-comment"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitReviewMutation.isPending}
                    data-testid="button-submit-review"
                  >
                    {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              </div>

              {reviews.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">All Reviews</h3>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} className="p-4" data-testid={`card-review-${review.id}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold" data-testid={`text-reviewer-${review.id}`}>
                              {review.authorName}
                            </p>
                            <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? "fill-primary text-primary"
                                      : "fill-muted text-muted"
                                  }`}
                                  data-testid={`star-review-${review.id}-${star}`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground" data-testid={`text-review-date-${review.id}`}>
                            {format(new Date(review.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="text-foreground" data-testid={`text-review-comment-${review.id}`}>
                          {review.comment}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
