import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PromoCode } from "@shared/schema";
import { Plus, Trash2, Edit } from "lucide-react";

export default function AdminPromoCodesPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editDiscount, setEditDiscount] = useState("");

  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth");
    if (!adminAuth) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const { data: promoCodes = [] } = useQuery<PromoCode[]>({
    queryKey: ["/api/promo-codes"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { code: string; discount: number }) =>
      apiRequest("POST", "/api/promo-codes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      toast({ title: "Promo code created successfully" });
      setNewCode("");
      setNewDiscount("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PromoCode> }) =>
      apiRequest("PATCH", `/api/promo-codes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      toast({ title: "Promo code updated successfully" });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/promo-codes/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      toast({ title: "Promo code deleted successfully" });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const discount = parseInt(newDiscount);
    if (!newCode || discount < 1 || discount > 100) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid code and discount (1-100%)",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({ code: newCode.toUpperCase(), discount });
  };

  const handleUpdate = (id: string) => {
    const discount = parseInt(editDiscount);
    if (!editCode || discount < 1 || discount > 100) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid code and discount (1-100%)",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate({ id, data: { code: editCode.toUpperCase(), discount } });
  };

  const startEdit = (promoCode: PromoCode) => {
    setEditingId(promoCode.id);
    setEditCode(promoCode.code);
    setEditDiscount(promoCode.discount.toString());
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Promo Codes</h1>
        <p className="text-muted-foreground">Manage discount codes for your customers</p>
      </div>

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle>Create New Promo Code</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-4">
            <Input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              placeholder="Code (e.g., SAVE20)"
              data-testid="input-new-code"
            />
            <Input
              type="number"
              value={newDiscount}
              onChange={(e) => setNewDiscount(e.target.value)}
              placeholder="Discount %"
              min="1"
              max="100"
              data-testid="input-new-discount"
            />
            <Button type="submit" disabled={createMutation.isPending} data-testid="button-create-promo">
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle>Existing Promo Codes ({promoCodes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {promoCodes.map((promoCode) => (
              <div
                key={promoCode.id}
                className="flex items-center justify-between p-4 rounded-lg border"
                data-testid={`promo-${promoCode.id}`}
              >
                {editingId === promoCode.id ? (
                  <div className="flex gap-4 flex-1">
                    <Input
                      value={editCode}
                      onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                      data-testid={`input-edit-code-${promoCode.id}`}
                    />
                    <Input
                      type="number"
                      value={editDiscount}
                      onChange={(e) => setEditDiscount(e.target.value)}
                      min="1"
                      max="100"
                      data-testid={`input-edit-discount-${promoCode.id}`}
                    />
                    <Button onClick={() => handleUpdate(promoCode.id)} data-testid={`button-save-${promoCode.id}`}>
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)} data-testid={`button-cancel-${promoCode.id}`}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-bold text-lg" data-testid={`text-code-${promoCode.id}`}>
                        {promoCode.code}
                      </p>
                      <p className="text-muted-foreground" data-testid={`text-discount-${promoCode.id}`}>
                        {promoCode.discount}% off
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(promoCode)}
                        data-testid={`button-edit-${promoCode.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(promoCode.id)}
                        data-testid={`button-delete-${promoCode.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
