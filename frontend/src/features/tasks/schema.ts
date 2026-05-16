import { z } from 'zod'

// Enums
const statusEnum = z.enum(['todo', 'in_progress', 'done'])

const priorityEnum = z.enum(['low', 'medium', 'high'])

export const TaskFormSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be 200 characters or fewer')
    .trim(),

  description: z
    .string()
    .max(2000, 'Description is too long. Max 2000 characters')
    .optional()
    .default(''),

  status: statusEnum.default('todo'),
  priority: priorityEnum.default('medium'),

  due_date: z
    .string()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, 'Due date must be a valid date')
    .optional()
    .default(''),

  category: z.coerce.number().int().nonnegative().optional().default(0),
})

export type TaskFormValues = z.infer<typeof TaskFormSchema>
