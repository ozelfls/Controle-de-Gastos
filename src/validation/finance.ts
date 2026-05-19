import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense", "bill", "debt"]),
  category: z.enum([
    "moradia",
    "alimentacao",
    "transporte",
    "lazer",
    "saude",
    "educacao",
    "reserva",
    "renda",
    "dividas",
  ]),
  description: z.string().trim().min(3, "Informe uma descricao com ao menos 3 letras."),
  amount: z.coerce.number().positive("Informe um valor maior que zero."),
  date: z.string().min(10, "Informe uma data valida."),
  recurring: z.boolean(),
  status: z.enum(["paid", "pending"]).optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
