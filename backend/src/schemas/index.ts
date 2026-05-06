import z from "zod";

export * from "./users.schema";
export * from "./categories.schema";
export * from "./reimbursements.schema";

export const uuidParam = z.object({
  id: z.uuid('ID inválido.'),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});
