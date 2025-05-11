import {
  calcTotalPrice,
  hasSufficientBalance,
  hasSufficientStock,
} from '../src/lib/order-utils';

describe('Order Utils', () => {
  test('calcTotalPrice: multiplies price × quantity', () => {
    expect(calcTotalPrice(10, 5)).toBe(50);
    expect(calcTotalPrice(0, 100)).toBe(0);
  });

  test('hasSufficientBalance: true when balance ≥ total', () => {
    expect(hasSufficientBalance(100, 50)).toBe(true);
    expect(hasSufficientBalance(50, 50)).toBe(true);
    expect(hasSufficientBalance(49.99, 50)).toBe(false);
  });

  test('hasSufficientStock: true when stock ≥ quantity', () => {
    expect(hasSufficientStock(10, 5)).toBe(true);
    expect(hasSufficientStock(5, 5)).toBe(true);
    expect(hasSufficientStock(4, 5)).toBe(false);
  });
});
