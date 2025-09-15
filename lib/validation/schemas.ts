import { z } from 'zod'

// User validation schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// Auth validation schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Business/Lead validation schemas
export const businessSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Business name must be at least 2 characters'),
  industry: z.string().min(1, 'Industry is required'),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']),
  website: z.string().url('Invalid website URL').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const leadSchema = z.object({
  id: z.string().uuid().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  company: z.string().min(1, 'Company is required'),
  position: z.string().optional(),
  source: z.enum(['website', 'referral', 'social', 'email', 'other']),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// Content validation schemas
export const contentSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(200, 'Excerpt must be less than 200 characters').optional(),
  status: z.enum(['draft', 'published', 'archived']),
  type: z.enum(['blog', 'page', 'case-study', 'whitepaper']),
  tags: z.array(z.string()).optional(),
  featuredImage: z.string().url('Invalid image URL').optional(),
  seoTitle: z.string().max(60, 'SEO title must be less than 60 characters').optional(),
  seoDescription: z.string().max(160, 'SEO description must be less than 160 characters').optional(),
  publishedAt: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// Contact form validation
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  company: z.string().optional(),
})

// Export types
export type User = z.infer<typeof userSchema>
export type SignUp = z.infer<typeof signUpSchema>
export type SignIn = z.infer<typeof signInSchema>
export type ResetPassword = z.infer<typeof resetPasswordSchema>
export type Business = z.infer<typeof businessSchema>
export type Lead = z.infer<typeof leadSchema>
export type Content = z.infer<typeof contentSchema>
export type ContactForm = z.infer<typeof contactFormSchema>