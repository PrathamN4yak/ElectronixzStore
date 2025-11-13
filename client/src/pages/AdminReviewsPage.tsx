import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Review, Product } from "@shared/schema";
import { Trash2, Edit, Star, Eye, EyeOff, Plus } from "lucide-react";
import { format } from "date-fns";

export default function AdminReviewsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newReview, setNewReview] = useState({
    productId: "",
    authorName: "",
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth");
    if (!adminAuth) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Review> }) =>
      apiRequest("PATCH", `/api/reviews/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({ title: "Review updated successfully" });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/reviews/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({ title: "Review deleted successfully" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newReview) => apiRequest("POST", "/api/reviews", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({ title: "Review created successfully" });
      setShowCreateForm(false);
      setNewReview({ productId: "", authorName: "", rating: 5, comment: "" });
    },
  });

  const toggleVisibility = (review: Review) => {
    updateMutation.mutate({ id: review.id, data: { visible: !review.visible } });
  };

  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setEditComment(review.comment);
    setEditRating(review.rating);
  };

  const handleUpdate = (id: string) => {
    updateMutation.mutate({ id, data: { comment: editComment, rating: editRating } });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.productId || !newReview.authorName || !newReview.comment) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(newReview);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customer Reviews</h1>
          <p className="text-muted-foreground">Manage and moderate product reviews</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} data-testid="button-toggle-create">
          <Plus className="w-4 h-4 mr-2" />
          {showCreateForm ? "Cancel" : "Add Review"}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle>Create New Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newReview.productId}
                  onChange={(e) => setNewReview({ ...newReview, productId: e.target.value })}
                  required
                  data-testid="select-new-product"
                >
                  <option value="">Select a product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Author Name</label>
                <Input
                  value={newReview.authorName}
                  onChange={(e) => setNewReview({ ...newReview, authorName: e.target.value })}
                  required
                  data-testid="input-new-author"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="hover-elevate active-elevate-2 rounded"
                      data-testid={`button-new-rating-${star}`}
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= newReview.rating ? "fill-primary text-primary" : "fill-muted text-muted"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Review Comment</label>
                <Textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={4}
                  required
                  data-testid="input-new-comment"
                />
              </div>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-create-review">
                {createMutation.isPending ? "Creating..." : "Create Review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle>All Reviews ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map((review) => {
              const product = products.find((p) => p.id === review.productId);
              return (
                <div
                  key={review.id}
                  className={`p-4 rounded-lg border ${!review.visible ? "opacity-50" : ""}`}
                  data-testid={`review-${review.id}`}
                >
                  {editingId === review.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Rating</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setEditRating(star)}
                              className="hover-elevate active-elevate-2 rounded"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= editRating ? "fill-primary text-primary" : "fill-muted text-muted"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <Textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdate(review.id)}>Save</Button>
                        <Button variant="outline" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{review.authorName}</p>
                          <p className="text-sm text-muted-foreground">{product?.name || "Unknown Product"}</p>
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? "fill-primary text-primary"
                                    : "fill-muted text-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(review.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <p className="mb-4">{review.comment}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleVisibility(review)}
                          data-testid={`button-toggle-${review.id}`}
                        >
                          {review.visible ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" /> Hide
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" /> Show
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(review)}
                          data-testid={`button-edit-${review.id}`}
                        >
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMutation.mutate(review.id)}
                          data-testid={`button-delete-${review.id}`}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
