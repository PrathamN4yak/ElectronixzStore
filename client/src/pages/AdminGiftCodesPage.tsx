import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { GiftCode } from "@shared/schema";
import { Plus, Trash2, Edit, Gift, Copy } from "lucide-react";

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(price));

export default function AdminGiftCodesPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [generateAmount, setGenerateAmount] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editAmount, setEditAmount] = useState("");

  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth");
    if (!adminAuth) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const { data: giftCodes = [] } = useQuery<GiftCode[]>({
    queryKey: ["/api/gift-codes"],
    meta: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminAuth")}`,
      },
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (amount: number) =>
      apiRequest("POST", "/api/gift-codes/generate", { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gift-codes"] });
      toast({ title: "Gift code generated successfully" });
      setGenerateAmount("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GiftCode> }) =>
      apiRequest("PATCH", `/api/gift-codes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gift-codes"] });
      toast({ title: "Gift code updated successfully" });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/gift-codes/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gift-codes"] });
      toast({ title: "Gift code deleted successfully" });
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(generateAmount);
    if (!amount || amount < 1) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate(amount);
  };

  const handleUpdate = (id: string) => {
    const amount = parseFloat(editAmount);
    if (!editCode || amount < 1) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid code and amount",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate({ id, data: { code: editCode.toUpperCase(), amount: amount.toFixed(2) } });
  };

  const startEdit = (giftCode: GiftCode) => {
    setEditingId(giftCode.id);
    setEditCode(giftCode.code);
    setEditAmount(giftCode.amount.toString());
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code copied to clipboard" });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gift Codes</h1>
        <p className="text-muted-foreground">Generate and manage gift codes for your customers</p>
      </div>

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle>Generate New Gift Code</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="flex gap-4">
            <Input
              type="number"
              value={generateAmount}
              onChange={(e) => setGenerateAmount(e.target.value)}
              placeholder="Amount (INR)"
              min="1"
              step="0.01"
              data-testid="input-generate-amount"
            />
            <Button type="submit" disabled={generateMutation.isPending} data-testid="button-generate-gift">
              <Gift className="w-4 h-4 mr-2" />
              Generate Code
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-2">
            A unique gift code will be automatically generated
          </p>
        </CardContent>
      </Card>

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle>Existing Gift Codes ({giftCodes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {giftCodes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No gift codes yet. Generate one above!</p>
            ) : (
              giftCodes.map((giftCode) => (
                <div
                  key={giftCode.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                  data-testid={`gift-${giftCode.id}`}
                >
                  {editingId === giftCode.id ? (
                    <div className="flex gap-4 flex-1">
                      <Input
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                        data-testid={`input-edit-code-${giftCode.id}`}
                      />
                      <Input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        min="1"
                        step="0.01"
                        data-testid={`input-edit-amount-${giftCode.id}`}
                      />
                      <Button onClick={() => handleUpdate(giftCode.id)} data-testid={`button-save-${giftCode.id}`}>
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditingId(null)} data-testid={`button-cancel-${giftCode.id}`}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-lg font-mono" data-testid={`text-code-${giftCode.id}`}>
                            {giftCode.code}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(giftCode.code)}
                            data-testid={`button-copy-${giftCode.id}`}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground" data-testid={`text-amount-${giftCode.id}`}>
                          Value: {formatPrice(giftCode.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Status: <span className={giftCode.active ? "text-green-600" : "text-red-600"}>
                            {giftCode.active ? "Active" : "Inactive"}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(giftCode)}
                          data-testid={`button-edit-${giftCode.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={giftCode.active ? "secondary" : "default"}
                          size="sm"
                          onClick={() => updateMutation.mutate({ id: giftCode.id, data: { active: !giftCode.active } })}
                          data-testid={`button-toggle-${giftCode.id}`}
                        >
                          {giftCode.active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMutation.mutate(giftCode.id)}
                          data-testid={`button-delete-${giftCode.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
