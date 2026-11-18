import "dotenv/config";

import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Prisma,
} from "../generated/prisma/client.js";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL no está configurada");
    }

    const adapter = new PrismaPg({
      connectionString,
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.log("Prisma conectado a Supabase");
  }

  /**
   * Ejecuta operaciones de base de datos
   * estableciendo la identidad del usuario
   * dentro de la transacción.
   */
  async withUser<T>(
    userId: string,
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT set_config(
          'request.jwt.claim.sub',
          ${userId},
          true
        )
      `;

      return callback(tx);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
