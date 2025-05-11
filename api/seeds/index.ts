import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.user.create({
        data: {
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
        },
      }),
    ),
  );

  const products = await Promise.all(
    [
      { name: 'Product A', price: 10.0, stock: 100 },
      { name: 'Product B', price: 20.5, stock: 50 },
      { name: 'Product C', price: 5.75, stock: 200 },
    ].map((p) => prisma.product.create({ data: p })),
  );

  for (const user of users) {
    const orderCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < orderCount; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const price = parseFloat(product.price.toString());
      const totalPrice = price * quantity;

      await prisma.order.create({
        data: {
          userId: user.id,
          productId: product.id,
          quantity,
          totalPrice,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
