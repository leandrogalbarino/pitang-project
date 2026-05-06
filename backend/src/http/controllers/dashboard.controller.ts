import type { Request, Response } from 'express';
import { prisma } from '../../core/prismaClient';
import * as res from '../../utils/responseHttp';

export const getDashboardStats = async (
  request: Request,
  response: Response,
) => {
  try {
    const { id: userId, role } = request.user;

    // Define o filtro base dependendo do cargo
    const baseFilter: any = {};
    if (role === 'COLABORADOR') {
      baseFilter.userId = userId;
    }

    // 1. Contagem por Status
    const statusCounts = await prisma.reimbursementRequest.groupBy({
      by: ['status'],
      where: baseFilter,
      _count: true,
      _sum: {
        amount: true,
      },
    });

    // 2. Total por Categoria (Top 5)
    const categoryStats = await prisma.reimbursementRequest.groupBy({
      by: ['categoryId'],
      where: {
        ...baseFilter,
        status: { notIn: ['CANCELADO', 'RASCUNHO'] },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: 5,
    });

    // Buscar nomes das categorias
    const categoriesWithNames = await Promise.all(
      categoryStats.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
          select: { name: true },
        });
        return {
          name: category?.name || 'Desconhecida',
          total: item._sum.amount || 0,
        };
      }),
    );

    // Formatar contagens de status para facilitar o frontend
    const stats = {
      totalRequests: statusCounts.reduce((acc, curr) => acc + curr._count, 0),
      totalAmount: statusCounts
        .filter((s) => s.status !== 'CANCELADO' && s.status !== 'REJEITADO')
        .reduce((acc, curr) => acc + (curr._sum.amount || 0), 0),
      totalAmountPaid: statusCounts
        .filter((s) => s.status === 'PAGO')
        .reduce((acc, curr) => acc + (curr._sum.amount || 0), 0),
      pendingApproval:
        statusCounts.find((s) => s.status === 'ENVIADO')?._count || 0,
      pendingPayment:
        statusCounts.find((s) => s.status === 'APROVADO')?._count || 0,
      paid: statusCounts.find((s) => s.status === 'PAGO')?._count || 0,
      byCategory: categoriesWithNames,
    };

    return res.successData(response, stats);
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};
