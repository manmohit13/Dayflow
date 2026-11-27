import { z } from 'zod';
export const taskSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  isDone: z.boolean().optional(),
  category: z.string().min(1).nullable().optional(),
});