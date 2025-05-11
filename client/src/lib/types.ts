export type Order = {
  id: string
  userId: string
  productId: string
  quantity: number
  status: "pending" | "processing" | "completed" | "failed"
  createdAt: Date
}
