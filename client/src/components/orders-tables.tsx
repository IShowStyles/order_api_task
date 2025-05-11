import { useState, useEffect } from "react";
import { CreateOrderDialog } from "@/components/create-order-dialog";
import { OrdersTable } from "@/components/orders-table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { fetchOrders } from "@/service/get-orders";
import type { OrderType } from "@/types";

interface Props {
  users: { id: string }[];
}

export function Orders({ users }: Props) {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!selectedUser) {
        setOrders([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await fetchOrders(selectedUser);
        if (!data) {
          setError("No orders found");
          return;
        }
        setOrders(data);
      } catch (e: any) {
        setError(e.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedUser]);

  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center space-x-4 mb-3.5">
          <CreateOrderDialog selectedUser={selectedUser} />
          {users && users.length > 0 && (
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select User" />
              </SelectTrigger>
              <SelectContent>
                {users &&
                  users.map((u, idx) => (
                    <SelectItem key={u.id} value={u.id}>
                      {idx + 1} - {u.id}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {orders.length > 0 && <OrdersTable orders={orders} />}
        {loading && <div className="mt-5">Loading orders…</div>}
      </div>

      {error && <div className="text-red-500">{error}</div>}
    </>
  );
}
