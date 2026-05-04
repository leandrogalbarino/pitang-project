
export const getPagination = (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const take = limit;
  return { skip, take };
};

export const formatPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) => {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};
