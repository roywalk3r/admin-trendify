"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Props = {
  orderId: string;
  email: string;
  callbackUrl?: string;
  label?: string;
};

export function PaystackPayButton({ orderId, email, callbackUrl, label = "Pay with Paystack" }: Props) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onPay = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payments/paystack/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, email, callbackUrl }),
      });
      const json = await res.json();
      if (!res.ok || json?.error) {
        throw new Error(json?.error || "Failed to initialize payment");
      }
      const url = json.data?.authorization_url as string | undefined;
      if (!url) throw new Error("Missing authorization URL");
      window.location.href = url;
    } catch (e: any) {
      toast({ title: "Payment error", description: e?.message || "Could not start payment", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={onPay} disabled={loading} variant="default">
      {loading ? "Redirecting..." : label}
    </Button>
  );
}
