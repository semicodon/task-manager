import { z } from 'zod'
export const CategoryFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be 100 characters or fewer')
    .trim(),

  description: z.string().max(500, 'Description is too long').optional().default(''),

  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a 7-character hex like #6366f1'),
})

export type CategoryFormValues = z.infer<typeof CategoryFormSchema>
