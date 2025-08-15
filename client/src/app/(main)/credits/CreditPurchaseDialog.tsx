"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const purchaseSchema = z.object({
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  street: z.string().min(1, "Street address is required"),
  zipcode: z.string().min(1, "Zipcode is required"),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
  popular?: boolean;
}

interface CreditPurchaseDialogProps {
  package: CreditPackage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditPurchaseDialog({ 
  package: pkg, 
  open, 
  onOpenChange 
}: CreditPurchaseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      city: "",
      country: "",
      state: "",
      street: "",
      zipcode: "",
    },
  });

  const onSubmit = async (data: PurchaseFormData) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(`/api/credits/packages`, {
        credits: pkg.credits,
        ...data,
      });

      if (response.data.error) {
        toast.error("Failed to create payment link. Please try again later.");
        setIsSubmitting(false);
        return;
      }

      const { paymentLink } = response.data;
      window.location.href = paymentLink;

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("An error occurred while processing your purchase.");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[555px] font-mono p-0 rounded-3xl overflow-hidden">
        <DialogHeader className="px-6 pt-14 pb-5">
          <div className="text-2xl bg-gradient-to-b from-orange-500 to-orange-400 bg-clip-text text-transparent font-semibold mb-2">
            ${pkg.price}{" "}
            <span className="text-sm text-muted-foreground">
              ({pkg.credits} credits)
            </span>
          </div>

          <DialogTitle className="md:text-xl">{pkg.name}</DialogTitle>
          <DialogDescription>
            {pkg.description}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-6 space-y-6">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zipcode</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="bg-secondary/30 p-6">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Purchase ${pkg.credits} Credits`
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
