import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/db';

const LIMIT = 10;

// 1 пользователь
const mockUsers = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Test User' },
];

type mockUsers = {
  id: string;
  name: string;
};

type MockProduct = {
  id: string;
  price: number;
  stock: number;
  name: string;
};

// 11 продуктов с разными UUID
const mockProducts = Array.from({ length: 11 }).map((_, i) => ({
  id: `00000000-0000-0000-0000-00000000000${i + 2}`, // от ...0002 до ...0012
  price: 10,
  stock: 100,
  name: `Product ${i + 1}`,
}));

// Заказы
const mockOrders: any[] = [];

jest.mock('../src/utils/db', () => {
  return {
    prisma: {
      user: {
        findFirst: jest.fn(({ where }) =>
          Promise.resolve(
            require('../__tests__/rate-limits.test').mockUsers.find(
              (u: mockUsers) => u.id === where.id,
            ),
          ),
        ),
        findMany: jest.fn(() =>
          Promise.resolve(require('../__tests__/rate-limits.test').mockUsers),
        ),
      },
      product: {
        findFirst: jest.fn(({ where }) =>
          Promise.resolve(
            require('../__tests__/rate-limits.test').mockProducts.find(
              (p: MockProduct) => p.id === where.id,
            ),
          ),
        ),
        findMany: jest.fn(() =>
          Promise.resolve(
            require('../__tests__/rate-limits.test').mockProducts,
          ),
        ),
      },
      order: {
        findMany: jest.fn(() => Promise.resolve(mockOrders)),
        create: jest.fn(({ data }) =>
          Promise.resolve({ id: 'order-id', ...data }),
        ),
      },
    },
  };
});

// экспортируем переменные в моках
export { mockUsers, mockProducts };

describe('Rate Limiting', () => {
  describe('POST /orders', () => {
    const ip = '1.4.3.4';

    it(`should allow ${LIMIT} POSTs and return 429 on the ${LIMIT + 1}th`, async () => {
      for (let i = 0; i < LIMIT; i++) {
        const payload = {
          userId: mockUsers[0].id,
          productId: mockProducts[i].id,
          quantity: 1,
        };

        const res = await request(app)
          .post('/orders')
          .set('X-Forwarded-For', ip)
          .send(payload);

        expect([201]).toContain(res.status);
      }

      const res = await request(app)
        .post('/orders')
        .set('X-Forwarded-For', ip)
        .send({
          userId: mockUsers[0].id,
          productId: mockProducts[LIMIT].id,
          quantity: 1,
        });

      expect(res.status).toBe(429);
      expect(res.body.error).toMatch(/Too many requests/i);
    });
  });

  describe('GET /orders/:userId', () => {
    const ip = '5.6.7.9';

    it(`should allow ${LIMIT} GETs and return 429 on the ${LIMIT + 1}th`, async () => {
      for (let i = 0; i < LIMIT; i++) {
        const res = await request(app)
          .get(`/orders/${mockUsers[0].id}`)
          .set('X-Forwarded-For', ip);

        expect(res.status).toBe(200);
      }

      const res = await request(app)
        .get(`/orders/${mockUsers[0].id}`)
        .set('X-Forwarded-For', ip);

      expect(res.status).toBe(429);
      expect(res.body.error).toMatch(/Too many requests/i);
    });
  });

  describe('GET /users', () => {
    const ip = '9.10.13.12';

    it(`should allow ${LIMIT} GETs and return 429 on the ${LIMIT + 1}th`, async () => {
      for (let i = 0; i < LIMIT; i++) {
        const res = await request(app).get('/users').set('X-Forwarded-For', ip);

        expect(res.status).toBe(200);
      }

      const res = await request(app).get('/users').set('X-Forwarded-For', ip);

      expect(res.status).toBe(429);
      expect(res.body.error).toMatch(/Too many requests/i);
    });
  });
});
