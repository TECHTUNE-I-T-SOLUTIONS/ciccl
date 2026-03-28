import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  securityQuestion: z.string().min(5, 'Please select a security question'),
  securityAnswer: z.string().min(2, 'Security answer is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const recoverySchema = z.object({
  email: z.string().email('Invalid email address'),
  securityAnswer: z.string().min(2, 'Security answer is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const projectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  shortSummary: z.string().max(200, 'Summary must be less than 200 characters'),
  projectType: z.string().min(2, 'Project type is required'),
  budgetScope: z.object({
    min: z.number().positive('Minimum budget must be positive'),
    max: z.number().positive('Maximum budget must be positive'),
    currency: z.string().default('NGN'),
  }),
  timeline: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }),
  hashtags: z.array(z.string()),
  problemsSolved: z.array(z.string()),
  features: z.array(z.string()),
  deliverables: z.array(z.string()),
});

export const reviewSchema = z.object({
  clientName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  projectReference: z.string().min(3, 'Project reference is required'),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  projectType: z.string().min(2, 'Project type is required'),
  budgetRange: z.string().min(2, 'Budget range is required'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

export const hireSchema = z.object({
  serviceType: z.string().min(2, 'Service type is required'),
  packageType: z.string().min(2, 'Package is required'),
  projectName: z.string().min(3, 'Project name is required'),
  projectDescription: z.string().min(20, 'Project description is required'),
  clientName: z.string().min(2, 'Name is required'),
  clientEmail: z.string().email('Invalid email address'),
  clientPhone: z.string().min(10, 'Phone is required'),
  paymentMethod: z.enum(['paystack']),
});

export const clientProjectSchema = z.object({
  projectName: z.string().min(3, 'Project name is required'),
  projectDescription: z.string().min(20, 'Description is required'),
  projectType: z.string().min(2, 'Project type is required'),
  companyName: z.string().optional(),
  location: z.string().optional(),
  budgetRange: z.object({
    min: z.number().positive('Minimum budget must be positive'),
    max: z.number().positive('Maximum budget must be positive'),
  }),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RecoveryInput = z.infer<typeof recoverySchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type HireInput = z.infer<typeof hireSchema>;
export type ClientProjectInput = z.infer<typeof clientProjectSchema>;
