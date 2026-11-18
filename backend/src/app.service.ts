import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "./prisma/prisma.service.js";

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  // =====================================
  // DASHBOARD
  // =====================================

  async getDashboard(userId: string) {
    return this.prisma.withUser(userId, async (tx) => {
      const now = new Date();

      const [
        totalItems,
        availableItems,
        activeLoans,
        overdueLoans,
        recentLoans,
      ] = await Promise.all([
        tx.item.count({
          where: {
            ownerId: userId,
            status: { not: "INACTIVE" },
          },
        }),
        tx.item.count({
          where: {
            ownerId: userId,
            status: "AVAILABLE",
          },
        }),
        tx.loan.count({
          where: {
            createdById: userId,
            status: "ACTIVE",
          },
        }),
        tx.loan.count({
          where: {
            createdById: userId,
            status: "ACTIVE",
            dueDate: { lt: now },
          },
        }),
        tx.loan.findMany({
          where: { createdById: userId },
          include: { item: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);

      return {
        totalItems,
        availableItems,
        activeLoans,
        overdueLoans,
        recentLoans,
      };
    });
  }

  // =====================================
  // INVENTARIO
  // =====================================

  async getItems(userId: string) {
    return this.prisma.withUser(userId, async (tx) => {
      const items = await tx.item.findMany({
        where: {
          ownerId: userId,
          status: { not: "INACTIVE" },
        },
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { loans: true },
          },
        },
      });

      return {
        totalItems: items.length,
        availableItems: items.filter(
          (item) => item.status === "AVAILABLE",
        ).length,
        loanedItems: items.filter(
          (item) => item.status === "LOANED",
        ).length,
        items,
      };
    });
  }

  async getItemById(userId: string, itemId: string) {
    return this.prisma.withUser(userId, async (tx) => {
      const item = await tx.item.findFirst({
        where: {
          id: itemId,
          ownerId: userId,
          status: { not: "INACTIVE" },
        },
        include: {
          _count: {
            select: { loans: true },
          },
        },
      });

      if (!item) {
        throw new NotFoundException("Objeto no encontrado");
      }

      return item;
    });
  }

  // =====================================
  // CREAR OBJETO
  // =====================================

  async createItem(
    userId: string,
    email: string | undefined,
    data: {
      name: string;
      description?: string;
      category?: string;
    },
  ) {
    const name = data.name?.trim();

    if (!name) {
      throw new BadRequestException(
        "El nombre del objeto es obligatorio",
      );
    }

    if (name.length > 120) {
      throw new BadRequestException(
        "El nombre no puede superar 120 caracteres",
      );
    }

    if (
      data.category &&
      data.category.trim().length > 80
    ) {
      throw new BadRequestException(
        "La categoría no puede superar 80 caracteres",
      );
    }

    return this.prisma.withUser(userId, async (tx) => {
      await tx.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email: email ?? null,
        },
        update: {
          email: email ?? undefined,
        },
      });

      return tx.item.create({
        data: {
          name,
          description: data.description?.trim() || null,
          category: data.category?.trim() || null,
          ownerId: userId,
        },
      });
    });
  }

  // =====================================
  // ACTUALIZAR OBJETO
  // =====================================

  async updateItem(
    userId: string,
    itemId: string,
    data: {
      name?: string;
      description?: string;
      category?: string;
    },
  ) {
    if (
      data.name === undefined &&
      data.description === undefined &&
      data.category === undefined
    ) {
      throw new BadRequestException(
        "Debes proporcionar un campo para actualizar",
      );
    }

    const name = data.name?.trim();
    const description = data.description?.trim();
    const category = data.category?.trim();

    if (data.name !== undefined) {
      if (!name) {
        throw new BadRequestException(
          "El nombre no puede estar vacío",
        );
      }

      if (name.length > 120) {
        throw new BadRequestException(
          "El nombre no puede superar 120 caracteres",
        );
      }
    }

    if (
      category !== undefined &&
      category.length > 80
    ) {
      throw new BadRequestException(
        "La categoría no puede superar 80 caracteres",
      );
    }

    return this.prisma.withUser(userId, async (tx) => {
      const result = await tx.item.updateMany({
        where: {
          id: itemId,
          ownerId: userId,
          status: { not: "INACTIVE" },
        },
        data: {
          ...(name !== undefined && { name }),
          ...(category !== undefined && {
            category: category || null,
          }),
          ...(description !== undefined && {
            description: description || null,
          }),
        },
      });

      if (result.count === 0) {
        throw new NotFoundException(
          "Objeto no encontrado o sin permiso",
        );
      }

      return tx.item.findFirst({
        where: {
          id: itemId,
          ownerId: userId,
        },
      });
    });
  }

  // =====================================
  // DESACTIVAR OBJETO
  // =====================================

  async deactivateItem(userId: string, itemId: string) {
    return this.prisma.withUser(userId, async (tx) => {
      const item = await tx.item.findFirst({
        where: {
          id: itemId,
          ownerId: userId,
          status: { not: "INACTIVE" },
        },
      });

      if (!item) {
        throw new NotFoundException("Objeto no encontrado");
      }

      const activeLoans = await tx.loan.count({
        where: {
          itemId,
          createdById: userId,
          status: "ACTIVE",
        },
      });

      if (activeLoans > 0) {
        throw new BadRequestException(
          "No puedes eliminar un objeto que tiene un préstamo activo",
        );
      }

      const result = await tx.item.updateMany({
        where: {
          id: itemId,
          ownerId: userId,
          status: "AVAILABLE",
        },
        data: {
          status: "INACTIVE",
        },
      });

      if (result.count === 0) {
        throw new BadRequestException(
          "No puedes desactivar un objeto que ya no está disponible",
        );
      }

      return tx.item.findFirst({
        where: {
          id: itemId,
          ownerId: userId,
        },
      });
    });
  }

  // =====================================
  // CONSULTAR PRÉSTAMOS
  // =====================================

  async getLoans(userId: string) {
    return this.prisma.withUser(userId, async (tx) => {
      return tx.loan.findMany({
        where: {
          createdById: userId,
        },
        include: {
          item: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    });
  }

  // =====================================
  // CREAR PRÉSTAMO
  // =====================================

  async createLoan(
    userId: string,
    data: {
      itemId: string;
      borrowerName: string;
      borrowerContact?: string;
      dueDate: string;
      notes?: string;
    },
  ) {
    const borrowerName = data.borrowerName?.trim();

    if (!borrowerName) {
      throw new BadRequestException(
        "El nombre del prestatario es obligatorio",
      );
    }

    if (!data.itemId) {
      throw new BadRequestException(
        "Debes seleccionar un objeto",
      );
    }

    if (!data.dueDate) {
      throw new BadRequestException(
        "La fecha de devolución es obligatoria",
      );
    }

    const dueDate = new Date(data.dueDate);

    if (Number.isNaN(dueDate.getTime())) {
      throw new BadRequestException(
        "La fecha de devolución no es válida",
      );
    }

    if (dueDate <= new Date()) {
      throw new BadRequestException(
        "La fecha de devolución debe ser futura",
      );
    }

    if (borrowerName.length > 120) {
      throw new BadRequestException(
        "El nombre no puede superar 120 caracteres",
      );
    }

    if (
      data.borrowerContact &&
      data.borrowerContact.trim().length > 100
    ) {
      throw new BadRequestException(
        "El contacto no puede superar 100 caracteres",
      );
    }

    return this.prisma.withUser(userId, async (tx) => {
      const item = await tx.item.findFirst({
        where: {
          id: data.itemId,
          ownerId: userId,
          status: "AVAILABLE",
        },
      });

      if (!item) {
        throw new BadRequestException(
          "El objeto no existe, no te pertenece o no está disponible",
        );
      }

      const updated = await tx.item.updateMany({
        where: {
          id: data.itemId,
          ownerId: userId,
          status: "AVAILABLE",
        },
        data: {
          status: "LOANED",
        },
      });

      if (updated.count === 0) {
        throw new BadRequestException(
          "El objeto ya no está disponible",
        );
      }

      return tx.loan.create({
        data: {
          borrowerName,
          borrowerContact:
            data.borrowerContact?.trim() || null,
          dueDate,
          notes: data.notes?.trim() || null,
          itemId: data.itemId,
          createdById: userId,
        },
        include: {
          item: true,
        },
      });
    });
  }

  // =====================================
  // REGISTRAR DEVOLUCIÓN
  // =====================================

  async returnLoan(userId: string, loanId: string) {
    return this.prisma.withUser(userId, async (tx) => {
      const result = await tx.loan.updateMany({
        where: {
          id: loanId,
          createdById: userId,
          status: "ACTIVE",
        },
        data: {
          status: "RETURNED",
          returnedAt: new Date(),
        },
      });

      if (result.count === 0) {
        throw new NotFoundException(
          "Préstamo activo no encontrado",
        );
      }

      const loan = await tx.loan.findFirst({
        where: {
          id: loanId,
          createdById: userId,
        },
      });

      if (!loan) {
        throw new NotFoundException(
          "Préstamo no encontrado",
        );
      }

      const itemResult = await tx.item.updateMany({
        where: {
          id: loan.itemId,
          ownerId: userId,
          status: "LOANED",
        },
        data: {
          status: "AVAILABLE",
        },
      });

      if (itemResult.count === 0) {
        throw new BadRequestException(
          "No fue posible actualizar el estado del objeto",
        );
      }

      return tx.loan.findUnique({
        where: {
          id: loanId,
        },
        include: {
          item: true,
        },
      });
    });
  }

  // =====================================
  // RUTA PRINCIPAL
  // =====================================

  getHello(): string {
    return "Hello World!";
  }
}
