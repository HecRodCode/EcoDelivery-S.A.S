import { PrismaClient, Zone, OrderStatus, PaymentMethod, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const ZONES = [
  Zone.norte,
  Zone.sur,
  Zone.centro,
  Zone.occidente,
  Zone.chapinero,
];

const PAYMENT_METHODS = [
  PaymentMethod.efectivo,
  PaymentMethod.tarjeta,
  PaymentMethod.app,
];

const CUSTOMER_NAMES = [
  'Ana Torres',
  'Carlos Ramirez',
  'Laura Gomez',
  'Juan Perez',
  'Maria Rodriguez',
  'Andres Lopez',
  'Camila Herrera',
  'Diego Martinez',
  'Sofia Castro',
  'Felipe Vargas',
];

const COURIER_NAMES = ['Pedro Suarez', 'Lucia Mendez', 'Tomas Rojas'];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'cliente@ecodelivery.com' },
    create: {
      id: randomUUID(),
      email: 'cliente@ecodelivery.com',
      passwordHash,
      role: UserRole.cliente,
    },
    update: {},
  });

  await prisma.user.upsert({
    where: { email: 'repartidor@ecodelivery.com' },
    create: {
      id: randomUUID(),
      email: 'repartidor@ecodelivery.com',
      passwordHash,
      role: UserRole.repartidor,
    },
    update: {},
  });

  console.log('Usuarios de prueba: cliente@ecodelivery.com / repartidor@ecodelivery.com (password123)');
}

async function seedOrders() {
  const totalOrders = 40;
  const now = Date.now();
  const tenDaysMs = 10 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < totalOrders; i++) {
    const fechaCreacion = new Date(now - randomInt(0, tenDaysMs));
    const roll = Math.random();

    let estado: OrderStatus;
    if (roll < 0.15) {
      estado = OrderStatus.pendiente;
    } else if (roll < 0.3) {
      estado = OrderStatus.en_camino;
    } else if (roll < 0.85) {
      estado = OrderStatus.entregado;
    } else {
      estado = OrderStatus.cancelado;
    }

    const fechaEntrega =
      estado === OrderStatus.entregado
        ? new Date(fechaCreacion.getTime() + randomInt(20, 90) * 60 * 1000)
        : null;

    const repartidor =
      estado === OrderStatus.pendiente ? null : randomItem(COURIER_NAMES);

    await prisma.order.create({
      data: {
        idPedido: randomUUID(),
        cliente: randomItem(CUSTOMER_NAMES),
        zona: randomItem(ZONES),
        fechaCreacion,
        fechaEntrega,
        estado,
        repartidor,
        metodoPago: randomItem(PAYMENT_METHODS),
        monto: randomInt(8000, 65000),
      },
    });
  }

  console.log(`${totalOrders} pedidos de ejemplo creados.`);
}

async function main() {
  await seedUsers();
  await seedOrders();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
