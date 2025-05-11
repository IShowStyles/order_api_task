import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { OrderType } from "@/types";

export function OrdersTable({ orders }: { orders: OrderType[] }) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableCaption>A list of your recent orders</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-6 text-muted-foreground"
              >
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <OrdersTableRow key={order.id} order={order} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

const OrdersTableRow = React.memo(({ order }: { order: OrderType }) => {
  return (
    <TableRow key={order.id}>
      <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
      <TableCell>{order.productId}</TableCell>
      <TableCell>{order.quantity}</TableCell>
      <TableCell>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            order.status === "completed"
              ? "bg-green-100 text-green-800"
              : order.status === "processing"
              ? "bg-blue-100 text-blue-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {order.status}
        </span>
      </TableCell>
      <TableCell className="text-right">
        {formatDate(new Date(order.createdAt))}
      </TableCell>
    </TableRow>
  );
});
