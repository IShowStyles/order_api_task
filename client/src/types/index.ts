export type OrderType = {
  userId: string;
  id: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  createdAt: Date;
  status: string;
};
