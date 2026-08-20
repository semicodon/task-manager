
import { z } from 'zod'
export const LoginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').trim(),
  password: z.string().min(1, 'Password is required'),
})

export type LoginValues = z.infer<typeof LoginSchema>
export const RegisterSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be 30 characters or fewer')
      .trim(),
    email: z.string().email('Please enter a valid email address').trim(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
     path: ['confirmPassword'],
    message: 'Passwords must match',
  })

export type RegisterValues = z.infer<typeof RegisterSchema>
