jest.setTimeout(30000); // увеличиваем таймаут до 30 секунд

import request from 'supertest';
import { prisma } from '../src/utils/db';
import app from '../src/app';
import { Prisma } from '@prisma/client';

describe('Transaction Tests: Verify that partial orders do not occur', () => {
  const testUserId = '00000000-0000-0000-0000-000000000001';
  const testProductId = '00000000-0000-0000-0000-000000000002';
  const initialBalance = 100;
  const initialStock = 10;

  beforeAll(async () => {
    await prisma.user.upsert({
      where: { id: testUserId },
      update: {},
      create: {
        id: testUserId,
        name: 'Test User',
        email: 'test@example.com',
        balance: new Prisma.Decimal(initialBalance),
      },
    });
    await prisma.product.upsert({
      where: { id: testProductId },
      update: {},
      create: {
        id: testProductId,
        name: 'Test Product',
        price: new Prisma.Decimal(10),
        stock: 10,
      },
    });
  });

  afterAll(async () => {
    await prisma.order.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await prisma.product.deleteMany({ where: { id: testProductId } });
  });

  it('should rollback transaction if stock goes below zero', async () => {
    const res = await request(app)
      .post('/orders')
      .send({
        userId: testUserId,
        productId: testProductId,
        quantity: initialStock + 11,
      });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Insufficient stock/);

    const freshUser = await prisma.user.findFirst({
      where: { id: testUserId },
    });
    const freshProduct = await prisma.product.findFirst({
      where: { id: testProductId },
    });

    expect(freshUser!.balance.toNumber()).toBe(initialBalance);
    expect(freshProduct!.stock).toBe(initialStock);
  });
});
