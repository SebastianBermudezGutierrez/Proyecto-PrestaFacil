import { BadRequestException, NotFoundException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';

describe('AppService - pruebas unitarias y caja blanca', () => {
  const userId = '11111111-1111-4111-8111-111111111111';
  let tx: any;
  let prisma: PrismaService;
  let service: AppService;

  beforeEach(() => {
    tx = {
      user: { upsert: jest.fn() },
      item: {
        create: jest.fn(),
        updateMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
      },
      loan: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
    };

    prisma = {
      withUser: jest.fn(async (_id: string, callback: (client: any) => any) => callback(tx)),
    } as unknown as PrismaService;

    service = new AppService(prisma);
  });

  // BLOQUE 1: createItem - validación y normalización.
  it('UT-01 rechaza crear un objeto cuando el nombre está vacío', async () => {
    await expect(service.createItem(userId, 'test@correo.com', { name: '   ' }))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.withUser).not.toHaveBeenCalled();
  });

  it('UT-02 rechaza un nombre de objeto superior a 120 caracteres', async () => {
    await expect(service.createItem(userId, undefined, { name: 'A'.repeat(121) }))
      .rejects.toThrow('no puede superar 120 caracteres');
    expect(prisma.withUser).not.toHaveBeenCalled();
  });

  it('UT-03 crea el objeto con nombre y campos opcionales normalizados', async () => {
    const created = { id: 'item-1', name: 'Taladro', ownerId: userId };
    tx.item.create.mockResolvedValue(created);

    const result = await service.createItem(userId, 'test@correo.com', {
      name: '  Taladro  ', description: '  Herramienta  ', category: '  Hogar  ',
    });

    expect(tx.user.upsert).toHaveBeenCalled();
    expect(tx.item.create).toHaveBeenCalledWith({
      data: { name: 'Taladro', description: 'Herramienta', category: 'Hogar', ownerId: userId },
    });
    expect(result).toEqual(created);
  });

  // BLOQUE 2: updateItem - campos, límites, actualización y objeto inexistente.
  it('UT-04 rechaza actualizar cuando no se envía ningún campo', async () => {
    await expect(service.updateItem(userId, 'item-1', {}))
      .rejects.toThrow('Debes proporcionar un campo');
    expect(prisma.withUser).not.toHaveBeenCalled();
  });

  it('UT-05 rechaza actualizar el nombre con una cadena vacía', async () => {
    await expect(service.updateItem(userId, 'item-1', { name: '   ' }))
      .rejects.toThrow('El nombre no puede estar vacío');
    expect(prisma.withUser).not.toHaveBeenCalled();
  });

  it('UT-09 rechaza una categoría superior a 80 caracteres', async () => {
    await expect(service.updateItem(userId, 'item-1', { category: 'C'.repeat(81) }))
      .rejects.toThrow('La categoría no puede superar 80 caracteres');
    expect(prisma.withUser).not.toHaveBeenCalled();
  });

  it('UT-10 actualiza un objeto existente y normaliza los campos', async () => {
    tx.item.updateMany.mockResolvedValue({ count: 1 });
    const updated = { id: 'item-1', name: 'Taladro nuevo', ownerId: userId };
    tx.item.findFirst.mockResolvedValue(updated);

    const result = await service.updateItem(userId, 'item-1', {
      name: ' Taladro nuevo ', description: ' Herramienta ', category: ' Hogar ',
    });

    expect(tx.item.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'item-1', ownerId: userId, status: { not: 'INACTIVE' } },
      data: { name: 'Taladro nuevo', category: 'Hogar', description: 'Herramienta' },
    }));
    expect(result).toEqual(updated);
  });

  it('UT-11 informa cuando el objeto no existe o no pertenece al usuario', async () => {
    tx.item.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.updateItem(userId, 'item-ajeno', { name: 'Nuevo nombre' }))
      .rejects.toThrow('Objeto no encontrado o sin permiso');
  });

  // BLOQUE 3: deactivateItem - existencia, préstamo activo y disponibilidad.
  it('UT-12 rechaza desactivar un objeto inexistente', async () => {
    tx.item.findFirst.mockResolvedValue(null);

    await expect(service.deactivateItem(userId, 'item-no-existe'))
      .rejects.toBeInstanceOf(NotFoundException);
    expect(tx.loan.count).not.toHaveBeenCalled();
  });

  it('UT-13 impide desactivar un objeto que tiene un préstamo activo', async () => {
    tx.item.findFirst.mockResolvedValue({ id: 'item-1', status: 'AVAILABLE' });
    tx.loan.count.mockResolvedValue(1);

    await expect(service.deactivateItem(userId, 'item-1'))
      .rejects.toThrow('No puedes eliminar un objeto que tiene un préstamo activo');
    expect(tx.item.updateMany).not.toHaveBeenCalled();
  });

  it('UT-14 desactiva correctamente un objeto disponible sin préstamos activos', async () => {
    tx.item.findFirst
      .mockResolvedValueOnce({ id: 'item-1', status: 'AVAILABLE' })
      .mockResolvedValueOnce({ id: 'item-1', status: 'INACTIVE' });
    tx.loan.count.mockResolvedValue(0);
    tx.item.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.deactivateItem(userId, 'item-1');

    expect(tx.item.updateMany).toHaveBeenCalledWith({
      where: { id: 'item-1', ownerId: userId, status: 'AVAILABLE' },
      data: { status: 'INACTIVE' },
    });
    expect(result).toEqual({ id: 'item-1', status: 'INACTIVE' });
  });

  it('UT-15 rechaza desactivar cuando el objeto ya no está disponible', async () => {
    tx.item.findFirst.mockResolvedValue({ id: 'item-1', status: 'AVAILABLE' });
    tx.loan.count.mockResolvedValue(0);
    tx.item.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.deactivateItem(userId, 'item-1'))
      .rejects.toThrow('No puedes desactivar un objeto que ya no está disponible');
  });

  // BLOQUE 4: createLoan - validaciones y transición de estado.
  it('UT-06 rechaza crear un préstamo sin nombre de prestatario', async () => {
    await expect(service.createLoan(userId, {
      itemId: 'item-1', borrowerName: ' ', dueDate: '2099-12-31T12:00:00.000Z',
    })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.withUser).not.toHaveBeenCalled();
  });

  it('UT-07 rechaza crear un préstamo con fecha de devolución inválida', async () => {
    await expect(service.createLoan(userId, {
      itemId: 'item-1', borrowerName: 'Carlos', dueDate: 'fecha-no-valida',
    })).rejects.toThrow('La fecha de devolución no es válida');
    expect(prisma.withUser).not.toHaveBeenCalled();
  });

  it('UT-08 crea un préstamo y marca el objeto como prestado', async () => {
    const item = { id: 'item-1', ownerId: userId, status: 'AVAILABLE' };
    const loan = { id: 'loan-1', borrowerName: 'Carlos', itemId: 'item-1' };
    tx.item.findFirst.mockResolvedValue(item);
    tx.item.updateMany.mockResolvedValue({ count: 1 });
    tx.loan.create.mockResolvedValue(loan);

    const result = await service.createLoan(userId, {
      itemId: 'item-1', borrowerName: '  Carlos  ', dueDate: '2099-12-31T12:00:00.000Z',
    });

    expect(tx.item.updateMany).toHaveBeenCalledWith({
      where: { id: 'item-1', ownerId: userId, status: 'AVAILABLE' },
      data: { status: 'LOANED' },
    });
    expect(tx.loan.create).toHaveBeenCalled();
    expect(result).toEqual(loan);
  });

  // BLOQUE 5: returnLoan - devolución y manejo de caminos alternativos.
  it('UT-16 rechaza devolver cuando no existe un préstamo activo', async () => {
    tx.loan.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.returnLoan(userId, 'loan-no-activo'))
      .rejects.toThrow('Préstamo activo no encontrado');
    expect(tx.loan.findFirst).not.toHaveBeenCalled();
  });

  it('UT-17 rechaza devolver cuando no encuentra el préstamo después de actualizarlo', async () => {
    tx.loan.updateMany.mockResolvedValue({ count: 1 });
    tx.loan.findFirst.mockResolvedValue(null);

    await expect(service.returnLoan(userId, 'loan-1'))
      .rejects.toThrow('Préstamo no encontrado');
    expect(tx.item.updateMany).not.toHaveBeenCalled();
  });

  it('UT-18 registra la devolución y devuelve el préstamo con su objeto', async () => {
    const loan = { id: 'loan-1', itemId: 'item-1', createdById: userId };
    const returnedLoan = { ...loan, status: 'RETURNED', item: { id: 'item-1', status: 'AVAILABLE' } };
    tx.loan.updateMany.mockResolvedValue({ count: 1 });
    tx.loan.findFirst.mockResolvedValue(loan);
    tx.item.updateMany.mockResolvedValue({ count: 1 });
    tx.loan.findUnique.mockResolvedValue(returnedLoan);

    const result = await service.returnLoan(userId, 'loan-1');

    expect(tx.loan.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'loan-1', createdById: userId, status: 'ACTIVE' },
      data: expect.objectContaining({ status: 'RETURNED', returnedAt: expect.any(Date) }),
    }));
    expect(tx.item.updateMany).toHaveBeenCalledWith({
      where: { id: 'item-1', ownerId: userId, status: 'LOANED' },
      data: { status: 'AVAILABLE' },
    });
    expect(tx.loan.findUnique).toHaveBeenCalledWith({
      where: { id: 'loan-1' }, include: { item: true },
    });
    expect(result).toEqual(returnedLoan);
  });

  it('UT-19 informa si no se puede actualizar el estado del objeto al devolver', async () => {
    tx.loan.updateMany.mockResolvedValue({ count: 1 });
    tx.loan.findFirst.mockResolvedValue({ id: 'loan-1', itemId: 'item-1' });
    tx.item.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.returnLoan(userId, 'loan-1'))
      .rejects.toThrow('No fue posible actualizar el estado del objeto');
    expect(tx.loan.findUnique).not.toHaveBeenCalled();
  });
});
