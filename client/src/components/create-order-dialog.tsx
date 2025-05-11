import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { OrderForm } from "@/components/order-form";
import { PlusCircle } from "lucide-react";

export function CreateOrderDialog({ selectedUser }: { selectedUser: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Create New Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new order. Click submit when
            you're done.
          </DialogDescription>
        </DialogHeader>
        <OrderForm
          selectedUser={selectedUser}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
