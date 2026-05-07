import type { Request, Response } from 'express';
import { prisma } from '../../core/prismaClient';
import * as res from '../../utils/responseHttp';

export const getDashboardStats = async (
  request: Request,
  response: Response,
) => {
  try {
    const { id: userId, role } = request.user;

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
        status: { notIn: ['CANCELADO', 'RASCUNHO', 'REJEITADO'] },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    });

    const categoryIds = categoryStats.map(s => s.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true }
    });

    // Mapear nomes para facilitar a montagem do resultado
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    const categoriesWithNames = categoryStats.map(item => ({
      name: categoryMap.get(item.categoryId) || 'Desconhecida',
      total: item._sum.amount || 0,
    }));

    // Formatar contagens de status para facilitar o frontend
    const stats = {
      totalRequests: statusCounts.reduce((acc, curr) => acc + curr._count, 0),
      totalAmount: statusCounts
        .filter((s) => s.status !== 'CANCELADO' && s.status !== 'REJEITADO' && s.status !== 'RASCUNHO')
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
