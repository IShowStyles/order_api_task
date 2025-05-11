import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createOrder } from "@/service";

const formSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  productId: z.string().min(1, { message: "Product ID is required" }),
  quantity: z.coerce
    .number()
    .int()
    .positive({ message: "Quantity must be a positive number" }),
});

type OrderFormProps = {
  onSuccess?: () => void;
  selectedUser: string;
};

export function OrderForm({ onSuccess, selectedUser }: OrderFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: selectedUser ?? "",
      productId: "",
      quantity: 1,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createOrder({
        userId: values.userId.trim(),
        productId: values.productId.trim(),
        quantity: values.quantity,
      });

      if (!result.success) {
        setError(result.error || "Failed to create order");
        return;
      }

      form.reset();
      window.location.reload();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter user ID" {...field} />
                </FormControl>
                <FormDescription>
                  The unique identifier for the user placing the order
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product ID" {...field} />
                </FormControl>
                <FormDescription>
                  The unique identifier for the product being ordered
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>Number of items to order</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Submit Order"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
