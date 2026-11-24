const { z } = require('zod');

const productSchema = z.object({
  title: z.string().trim().min(1, 'Product title is required'),
  category: z.string().trim().default('erp'),
  badge: z.string().trim().default('Cloud Solution'),
  tagline: z.string().trim().min(1, 'Tagline is required'),
  description: z.string().trim().optional().default(''),
  demoUrl: z.string().trim().optional().default(''),
  demoDbUrl: z.string().trim().optional().default(''),
  accentColor: z.string().trim().default('#2563eb'),
  status: z.string().trim().default('active'),
  keyFeatures: z.array(z.any()).default([]),
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
