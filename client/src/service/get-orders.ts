import type { OrderType } from "@/types";

export async function fetchOrders(userId: string) {
  try {
    if (!userId) {
      return null;
    }
    const API_URL = import.meta.env.VITE_API_URL as string;
    const response = await fetch(API_URL + "/orders/" + userId);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return ((await response.json()) || []) as OrderType[];
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}
