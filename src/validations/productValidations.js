const { z } = require('zod');

const productSchema = z.object({
  title: z.string().trim().min(2, 'Product title is required'),
  category: z.enum(['erp', 'crm', 'custom']).default('erp'),
  badge: z.string().trim().default('Cloud Solution'),
  tagline: z.string().trim().min(3, 'Tagline is required'),
  description: z.string().trim().optional().default(''),
  demoUrl: z.string().trim().url('Must be a valid URL').or(z.literal('')).optional().default(''),
  demoDbUrl: z.string().trim().optional().default(''),
  accentColor: z.string().trim().default('#2563eb'),
  status: z.enum(['active', 'draft', 'archived']).default('active'),
  keyFeatures: z.array(z.string()).default([]),
  metrics: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).default([]),
  previewTags: z.array(z.string()).default([]),
  sortOrder: z.number().int().optional().default(0),
});

module.exports = {
  productSchema,
};
