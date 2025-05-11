import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import winston from 'winston';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import { Prisma } from '@prisma/client';
import { prisma } from './utils/db';
import cors from 'cors';
import { log } from 'console';

dotenv.config();
export const app = express();

const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
});

app.use(
  morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.set('trust proxy', 1);
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

const UUID_RE =
  /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/;

app.post('/orders', async (req: Request, res: Response): Promise<void> => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || !quantity) {
    res
      .status(400)
      .json({ error: 'userId, productId and quantity are required.' });
    return;
  }

  const trimmedUserId = userId.trim();
  const trimmedProductId = productId.trim();

  if (!UUID_RE.test(trimmedUserId) || !UUID_RE.test(trimmedProductId)) {
    res.status(404).json({ error: 'Invalid userId or productId.' });
    return;
  }

  if (quantity <= 0) {
    res.status(400).json({ error: 'Quantity must be greater than zero.' });
    return;
  }

  if (quantity > 100) {
    res
      .status(400)
      .json({ error: 'Quantity must be less than or equal to 100.' });
    return;
  }

  const product = await prisma.product.findFirst({
    where: { id: trimmedProductId },
  });

  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  if (
    product?.stock === 0 ||
    product?.stock === null ||
    product?.stock < quantity
  ) {
    res.status(500).json({ error: 'Insufficient stock' });
    return;
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({ where: { id: trimmedUserId } });
      const product = await tx.product.findFirst({
        where: { id: trimmedProductId },
      });

      if (!user) throw new Error('User not found');
      if (!product) throw new Error('Product not found');

      const totalPrice = new Prisma.Decimal(product.price).mul(quantity);
      const userBalance = new Prisma.Decimal(user.balance);

      if (product.stock < quantity || product.stock < 0 || quantity < 0) {
        throw new Error('Insufficient stock');
      }
      if (userBalance.lt(totalPrice)) {
        throw new Error('Insufficient balance');
      }

      await tx.user.update({
        where: { id: trimmedUserId },
        data: { balance: { decrement: totalPrice } },
      });

      await tx.product.update({
        where: { id: trimmedProductId },
        data: { stock: { decrement: quantity } },
      });

      return await tx.order.create({
        data: {
          userId: trimmedUserId,
          productId: trimmedProductId,
          quantity,
          totalPrice: totalPrice.toFixed(2),
        },
      });
    });

    if (!order) {
      res.status(500).json({ error: 'Order creation failed.' });
      return;
    }

    res.status(201).json(order);
  } catch (err: any) {
    logger.error('Error creating order', { error: err.message });

    if (err.message === 'Insufficient stock') {
      res.status(403).json({ error: 'Insufficient stock.' });
      return;
    }

    if (err.message === 'Insufficient balance') {
      res.status(403).json({ error: 'Insufficient balance.' });
      return;
    }

    if (
      err.message === 'User not found' ||
      err.message === 'Product not found'
    ) {
      res.status(404).json({ error: err.message });
      return;
    }

    res.status(500).json({ error: 'Internal server error.' });
  }
});

// app.get(
//   '/orders/:userId',
//   async (req: Request, res: Response): Promise<void> => {
//     const { userId } = req.params;

//     if (!UUID_RE.test(userId)) {
//       res.status(404).json({ error: 'Invalid user ID' });
//       return;
//     }

//     const user = await prisma.user.findUnique({ where: { id: userId } });
//     if (!user) {
//       res.status(404).json({ error: 'User not found' });
//       return;
//     }

//     const orders = await prisma.order.findMany({
//       where: { userId },
//       orderBy: { createdAt: 'desc' },
//     });

//     res.status(200).json(orders);
//   },
// );

app.get(
  '/orders/:userId',
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    if (!UUID_RE.test(userId)) {
      res.status(404).json({ error: 'Invalid user ID' });
      return;
    }

    const user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(orders);
  },
);

app.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    const userIds = users.map((user) => ({
      id: user.id,
      name: user.name,
    }));
    res.status(200).json(userIds);
  } catch (err: any) {
    logger.error('Error fetching users', { error: err.message });
    res.status(500).json({ error: 'Internal server error.' });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(process.env.PORT || 3000, () => {
    logger.info(`Server running on port ${process.env.PORT || 3000}`);
  });
}

export default app;
