async function createOrder({
  userId,
  productId,
  quantity,
}: {
  userId: string;
  productId: string;
  quantity: number;
}) {
  try {
    const orderData = {
      userId,
      productId,
      quantity,
    };
    const API_URL = import.meta.env.VITE_API_URL as string;
    const response = await fetch(API_URL + "/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error("Failed to create order");
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error creating order:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

export { createOrder };
