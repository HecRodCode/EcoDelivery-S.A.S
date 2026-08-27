-- CreateEnum
CREATE TYPE "Zona" AS ENUM ('Norte', 'Sur', 'Centro', 'Occidente', 'Chapinero');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('pendiente', 'en_camino', 'entregado', 'cancelado');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('efectivo', 'tarjeta', 'app');

-- CreateTable
CREATE TABLE "pedidos" (
    "id_pedido" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "zona" "Zona" NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_entrega" TIMESTAMP(3),
    "estado" "EstadoPedido" NOT NULL DEFAULT 'pendiente',
    "repartidor" TEXT,
    "metodo_pago" "MetodoPago" NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id_pedido")
);
