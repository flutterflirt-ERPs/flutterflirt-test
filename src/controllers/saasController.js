const { query } = require('../config/db');

const normalizeInstance = (row) => ({
  id: row.id,
  name: row.name,
  subdomain: row.subdomain,
  plan: row.plan,
  tier: row.tier,
  status: row.status,
  region: row.region,
  dbSize: row.db_size,
  uptimePct: parseFloat(row.uptime_pct || 99.9),
  activeUsers: row.active_users || 0,
  maxUsers: row.max_users || 50,
  modules: row.modules || [],
  demoExpiresAt: row.demo_expires_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const ensureTenantsTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS saas_tenants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      subdomain VARCHAR(100) UNIQUE NOT NULL,
      plan VARCHAR(50) NOT NULL DEFAULT 'Enterprise ERP',
      tier VARCHAR(20) NOT NULL DEFAULT 'enterprise' CHECK (tier IN ('starter', 'growth', 'enterprise', 'sandbox')),
      status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'degraded', 'maintenance', 'trial_expired')),
      region VARCHAR(50) NOT NULL DEFAULT 'ap-south-1 (Mumbai)',
      db_size VARCHAR(50) NOT NULL DEFAULT '2.4 GB',
      uptime_pct NUMERIC(5,2) NOT NULL DEFAULT 99.98,
      active_users INTEGER NOT NULL DEFAULT 42,
      max_users INTEGER NOT NULL DEFAULT 100,
      modules JSONB DEFAULT '["CRM & Leads", "Asset Tracking", "Invoicing & GST", "HR & Payroll", "Inventory"]',
      demo_expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};

// Seed default demo instances if empty
const seedDefaultsIfNeeded = async () => {
  const existing = await query(`SELECT COUNT(*) FROM saas_tenants`);
  if (parseInt(existing.rows[0].count, 10) === 0) {
    const defaultTenants = [
      {
        name: 'BizBox Global Enterprise',
        subdomain: 'demo-enterprise',
        plan: 'BizBox Cloud ERP',
        tier: 'enterprise',
        status: 'active',
        region: 'ap-south-1 (Mumbai)',
        db_size: '4.8 GB',
        uptime_pct: 99.99,
        active_users: 86,
        max_users: 200,
        modules: JSON.stringify(['CRM & Leads', 'Asset Management', 'Smart Inventory', 'Invoicing & GST', 'HRMS']),
      },
      {
        name: 'Apex Manufacturing Ltd',
        subdomain: 'apex-demo',
        plan: 'Supply Chain & Manufacturing',
        tier: 'growth',
        status: 'active',
        region: 'ap-south-1 (Mumbai)',
        db_size: '1.9 GB',
        uptime_pct: 99.95,
        active_users: 34,
        max_users: 50,
        modules: JSON.stringify(['Asset Management', 'Shopfloor Monitor', 'Work Orders', 'Invoicing & GST']),
      },
      {
        name: 'Nexus Retail Sandbox',
        subdomain: 'nexus-sandbox',
        plan: 'Retail & POS Multi-outlet',
        tier: 'sandbox',
        status: 'active',
        region: 'ap-south-1 (Mumbai)',
        db_size: '620 MB',
        uptime_pct: 100.0,
        active_users: 12,
        max_users: 25,
        modules: JSON.stringify(['CRM & Leads', 'Barcode POS', 'Real-time Stock']),
      },
      {
        name: 'Kavach Healthcare Institute',
        subdomain: 'kavach-hospital',
        plan: 'Clinic & Hospital ERP',
        tier: 'enterprise',
        status: 'active',
        region: 'ap-south-1 (Mumbai)',
        db_size: '3.1 GB',
        uptime_pct: 99.98,
        active_users: 64,
        max_users: 150,
        modules: JSON.stringify(['Patient Records', 'Pharmacy Inventory', 'Appointment Scheduler', 'Billing & Insurance']),
      },
    ];

    for (const t of defaultTenants) {
      await query(
        `INSERT INTO saas_tenants (name, subdomain, plan, tier, status, region, db_size, uptime_pct, active_users, max_users, modules)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [t.name, t.subdomain, t.plan, t.tier, t.status, t.region, t.db_size, t.uptime_pct, t.active_users, t.max_users, t.modules]
      );
    }
  }
};

// GET /api/saas/instances (Public view for showcase + playground)
const getPublicInstances = async (req, res) => {
  try {
    await ensureTenantsTable();
    await seedDefaultsIfNeeded();
    const result = await query(`SELECT * FROM saas_tenants ORDER BY created_at ASC`);
    return res.status(200).json({
      success: true,
      instances: result.rows.map(normalizeInstance),
    });
  } catch (error) {
    console.error('Error in getPublicInstances:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch SaaS instances' });
  }
};

// POST /api/admin/saas/instances (Admin create new client sandbox/instance)
const createInstance = async (req, res) => {
  try {
    await ensureTenantsTable();
    const { name, subdomain, plan, tier, region, maxUsers, modules, demoDays } = req.body;

    if (!name || !subdomain) {
      return res.status(400).json({ success: false, message: 'Instance name and subdomain are required' });
    }

    const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');

    const check = await query(`SELECT id FROM saas_tenants WHERE subdomain = $1`, [cleanSubdomain]);
    if (check.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Subdomain already reserved or in use' });
    }

    const expiresAt = demoDays ? new Date(Date.now() + parseInt(demoDays, 10) * 24 * 60 * 60 * 1000) : null;

    const result = await query(
      `INSERT INTO saas_tenants 
       (name, subdomain, plan, tier, status, region, db_size, uptime_pct, active_users, max_users, modules, demo_expires_at)
       VALUES ($1, $2, $3, $4, 'active', $5, '250 MB', 100.0, 1, $6, $7, $8)
       RETURNING *`,
      [
        name,
        cleanSubdomain,
        plan || 'Custom ERP Sandbox',
        tier || 'sandbox',
        region || 'ap-south-1 (Mumbai)',
        maxUsers || 20,
        JSON.stringify(modules || ['CRM & Leads', 'Smart Invoicing']),
        expiresAt,
      ]
    );

    return res.status(201).json({
      success: true,
      instance: normalizeInstance(result.rows[0]),
      message: 'Client sandbox instance successfully provisioned',
    });
  } catch (error) {
    console.error('Error in createInstance:', error);
    return res.status(500).json({ success: false, message: 'Failed to provision instance' });
  }
};

// PATCH /api/admin/saas/instances/:id/reset (Reset instance demo test data)
const resetInstanceData = async (req, res) => {
  try {
    await ensureTenantsTable();
    const { id } = req.params;
    const result = await query(
      `UPDATE saas_tenants 
       SET active_users = 1, db_size = '250 MB', status = 'active', uptime_pct = 100.0, updated_at = NOW() 
       WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Instance not found' });
    }

    return res.status(200).json({
      success: true,
      instance: normalizeInstance(result.rows[0]),
      message: 'Demo instance sanitized and sample data re-seeded successfully',
    });
  } catch (error) {
    console.error('Error in resetInstanceData:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset instance' });
  }
};

// DELETE /api/admin/saas/instances/:id
const deleteInstance = async (req, res) => {
  try {
    await ensureTenantsTable();
    const { id } = req.params;
    const result = await query(`DELETE FROM saas_tenants WHERE id = $1 RETURNING id`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Instance not found' });
    }
    return res.status(200).json({ success: true, message: 'Instance de-provisioned successfully' });
  } catch (error) {
    console.error('Error in deleteInstance:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete instance' });
  }
};

module.exports = {
  getPublicInstances,
  createInstance,
  resetInstanceData,
  deleteInstance,
};
