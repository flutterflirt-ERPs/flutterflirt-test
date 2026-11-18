const { query } = require('../config/db');

const normalizeProduct = (row) => ({
  id: row.id,
  category: row.category,
  title: row.title,
  badge: row.badge,
  tagline: row.tagline,
  description: row.description,
  demoUrl: row.demo_url,
  demoDbUrl: row.demo_db_url || '',
  accentColor: row.accent_color,
  status: row.status,
  keyFeatures: row.key_features || [],
  metrics: row.metrics || [],
  previewTags: row.preview_tags || [],
  sortOrder: row.sort_order,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const ensureProductsTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS saas_products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      category VARCHAR(50) NOT NULL DEFAULT 'erp',
      title VARCHAR(255) NOT NULL,
      badge VARCHAR(100) DEFAULT 'Cloud Solution',
      tagline TEXT NOT NULL,
      description TEXT DEFAULT '',
      demo_url TEXT DEFAULT '',
      demo_db_url TEXT DEFAULT '',
      accent_color VARCHAR(50) DEFAULT '#2563eb',
      status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
      key_features JSONB DEFAULT '[]',
      metrics JSONB DEFAULT '[]',
      preview_tags JSONB DEFAULT '[]',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  // Ensure column exists for already created tables
  await query(`ALTER TABLE saas_products ADD COLUMN IF NOT EXISTS demo_db_url TEXT DEFAULT '';`);
};

// Public endpoint: Fetch active products for website visitors
const getPublicProducts = async (req, res) => {
  try {
    await ensureProductsTable();
    const result = await query(
      `SELECT * FROM saas_products 
       WHERE status = 'active' 
       ORDER BY sort_order ASC, created_at DESC`
    );
    return res.status(200).json({ products: result.rows.map(normalizeProduct) });
  } catch (error) {
    console.error('Error fetching public products:', error);
    return res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

// Admin endpoint: Fetch all products (including drafts & archived)
const getAllProductsAdmin = async (req, res) => {
  try {
    await ensureProductsTable();
    const result = await query(
      `SELECT * FROM saas_products 
       ORDER BY sort_order ASC, created_at DESC`
    );
    return res.status(200).json({ products: result.rows.map(normalizeProduct) });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

// Admin endpoint: Create product
const createProduct = async (req, res) => {
  try {
    await ensureProductsTable();
    const {
      title,
      category = 'erp',
      badge = 'Cloud Solution',
      tagline,
      description = '',
      demoUrl = '',
      demoDbUrl = '',
      accentColor = '#2563eb',
      status = 'active',
      keyFeatures = [],
      metrics = [],
      previewTags = [],
      sortOrder = 0,
    } = req.body;

    const result = await query(
      `INSERT INTO saas_products (
        title, category, badge, tagline, description, demo_url, demo_db_url, accent_color,
        status, key_features, metrics, preview_tags, sort_order, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING *`,
      [
        title,
        category,
        badge,
        tagline,
        description,
        demoUrl,
        demoDbUrl,
        accentColor,
        status,
        JSON.stringify(keyFeatures),
        JSON.stringify(metrics),
        JSON.stringify(previewTags),
        sortOrder,
      ]
    );

    return res.status(201).json({
      message: 'Product created successfully',
      product: normalizeProduct(result.rows[0]),
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

// Admin endpoint: Update product
const updateProduct = async (req, res) => {
  try {
    await ensureProductsTable();
    const { id } = req.params;
    const {
      title,
      category,
      badge,
      tagline,
      description,
      demoUrl,
      demoDbUrl,
      accentColor,
      status,
      keyFeatures,
      metrics,
      previewTags,
      sortOrder,
    } = req.body;

    const result = await query(
      `UPDATE saas_products SET
        title = COALESCE($1, title),
        category = COALESCE($2, category),
        badge = COALESCE($3, badge),
        tagline = COALESCE($4, tagline),
        description = COALESCE($5, description),
        demo_url = COALESCE($6, demo_url),
        demo_db_url = COALESCE($7, demo_db_url),
        accent_color = COALESCE($8, accent_color),
        status = COALESCE($9, status),
        key_features = COALESCE($10, key_features),
        metrics = COALESCE($11, metrics),
        preview_tags = COALESCE($12, preview_tags),
        sort_order = COALESCE($13, sort_order),
        updated_at = NOW()
      WHERE id = $14
      RETURNING *`,
      [
        title,
        category,
        badge,
        tagline,
        description,
        demoUrl,
        demoDbUrl,
        accentColor,
        status,
        keyFeatures ? JSON.stringify(keyFeatures) : null,
        metrics ? JSON.stringify(metrics) : null,
        previewTags ? JSON.stringify(previewTags) : null,
        sortOrder,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({
      message: 'Product updated successfully',
      product: normalizeProduct(result.rows[0]),
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

// Admin endpoint: Delete product
const deleteProduct = async (req, res) => {
  try {
    await ensureProductsTable();
    const { id } = req.params;

    const result = await query(
      `DELETE FROM saas_products WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({
      message: 'Product deleted successfully',
      id,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

module.exports = {
  ensureProductsTable,
  getPublicProducts,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
};
