import { prisma } from "../lib/prisma";

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected via Prisma");
  } catch (error) {
    console.error("Failed to connect to PostgreSQL", { error });
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log("PostgreSQL disconnected");
}
