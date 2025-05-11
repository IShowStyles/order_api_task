export function calcTotalPrice(price: number, quantity: number): number {
  return price * quantity;
}

export function hasSufficientBalance(balance: number, total: number): boolean {
  return balance >= total;
}

export function hasSufficientStock(stock: number, quantity: number): boolean {
  return stock >= quantity;
}
