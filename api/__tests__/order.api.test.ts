import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../src/app';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$executeRaw`DELETE FROM "Order";`;
  await prisma.$executeRaw`DELETE FROM "User";`;
  await prisma.$executeRaw`DELETE FROM "Product";`;

  // seed one user & one product
  await prisma.user.create({
    data: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'U1',
      email: 'u1@test',
      balance: 100,
    },
  });
  await prisma.product.create({
    data: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'P1',
      price: 20,
      stock: 2,
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /orders', () => {
  it('400 if missing fields', async () => {
    const res = await request(app).post('/orders').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/);
  });

  it('404 if user not found', async () => {
    const res = await request(app)
      .post('/orders')
      .send({ userId: 'nope', productId: '000...', quantity: 1 });
    expect(res.status).toBe(404);
  });

  it('404 if product not found', async () => {
    const res = await request(app).post('/orders').send({
      userId: '00000000-0000-0000-0000-000000000001',
      productId: 'bad',
      quantity: 1,
    });
    expect(res.status).toBe(404);
  });

  // it('400 if out of stock', async () => {
  //   const res = await request(app).post('/orders').send({
  //     userId: '00000000-0000-0000-0000-000000000001',
  //     productId: '00000000-0000-0000-0000-000000000002',
  //     quantity: 5,
  //   });
  //   expect(res.status).toBe(400);
  // });

  // it('403 if insufficient balance', async () => {
  // // price 20, quantity 10 → total 200 > balance 100
  // const res = await request(app).post('/orders').send({
  //   userId: '00000000-0000-0000-0000-000000000001',
  //   productId: '00000000-0000-0000-0000-000000000002',
  //   quantity: 10,
  // });
  // expect(res.status).toBe(403);
  // });

  it('201 on success and returns order', async () => {
    const res = await request(app).post('/orders').send({
      userId: '00000000-0000-0000-0000-000000000001',
      productId: '00000000-0000-0000-0000-000000000002',
      quantity: 1,
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.totalPrice).toBe('20'); // depending on your JSON serialization
  });
});

describe('GET /orders/', () => {
  it('404 if user not found', async () => {
    const res = await request(app).get('/orders/nope');
    expect(res.status).toBe(404);
  });

  it('200 and returns list', async () => {
    const res = await request(app).get(
      '/orders/00000000-0000-0000-0000-000000000001',
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
