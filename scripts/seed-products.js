require('dotenv').config();
const { query } = require('../src/config/db');

async function seedDefaultProducts() {
  const check = await query('SELECT count(*) FROM saas_products');
  if (parseInt(check.rows[0].count) > 0) {
    console.log(`Products table already has data (${check.rows[0].count} items). Skipping seed.`);
    process.exit(0);
  }

  const defaultProducts = [
    {
      category: 'erp',
      title: 'Dynamics 365 Finance & Operations',
      badge: 'Enterprise ERP',
      tagline: 'Unify multi-entity financial accounting and global supply chain.',
      description: 'Enterprise-grade cloud ERP built for mid-market and global organizations. Centralize general ledgers, automate accounts receivable/payable, track real-time inventory across multi-location warehouses, and comply with international financial reporting standards.',
      demo_url: 'https://demo.flutterflirt.com/erp-finance',
      accent_color: '#2563eb',
      status: 'active',
      key_features: JSON.stringify([
        'Multi-Currency & Multi-Entity Ledger Consolidation',
        'Automated Procurement & AI Supplier Invoicing',
        'Real-time Multi-Warehouse Lot & Serial Tracking'
      ]),
      metrics: JSON.stringify([
        { label: 'Close Cycle', value: '-45%' },
        { label: 'Reporting', value: '3x Faster' }
      ]),
      preview_tags: JSON.stringify(['Finance', 'Supply Chain', 'Global ERP']),
      sort_order: 1
    },
    {
      category: 'erp',
      title: 'Dynamics 365 Business Central',
      badge: 'SME Cloud ERP',
      tagline: 'Agile, modern business management engineered for growing companies.',
      description: 'The right-sized all-in-one ERP that scales with your growth. Seamlessly connects sales, purchasing, inventory, manufacturing, and customer service with out-of-the-box Microsoft 365, Teams, and Excel workflows.',
      demo_url: 'https://demo.flutterflirt.com/business-central',
      accent_color: '#0284c7',
      status: 'active',
      key_features: JSON.stringify([
        'Unified Accounting, Banking & Cash Projections',
        'Automated Order-to-Cash & Quote Generation',
        'Native Outlook & Teams Task Automation'
      ]),
      metrics: JSON.stringify([
        { label: 'Go-Live', value: '4 Weeks' },
        { label: 'Efficiency', value: '+38%' }
      ]),
      preview_tags: JSON.stringify(['Business Central', 'SME Operations', 'Cloud']),
      sort_order: 2
    },
    {
      category: 'crm',
      title: 'Customer Engagement & Sales CRM',
      badge: 'Intelligent Sales Suite',
      tagline: 'Accelerate pipeline velocity and close deals with actionable AI insights.',
      description: 'Empower your revenue teams with visual Kanban deal stages, 360° prospect profiles, automated email cadences, and predictive deal scoring. Transform prospects into long-term loyal clients with zero friction.',
      demo_url: 'https://demo.flutterflirt.com/sales-crm',
      accent_color: '#e11d48',
      status: 'active',
      key_features: JSON.stringify([
        'AI Opportunity Scoring & Win-Probability Predictions',
        'Omnichannel Contact & Ticket Routing',
        'Automated Email Sequences & Meeting Loggers'
      ]),
      metrics: JSON.stringify([
        { label: 'Win Rate', value: '+28%' },
        { label: 'Lead Velocity', value: '2.5x' }
      ]),
      preview_tags: JSON.stringify(['CRM', 'Sales Pipeline', 'Automation']),
      sort_order: 3
    }
  ];

  for (const p of defaultProducts) {
    await query(
      `INSERT INTO saas_products (
        category, title, badge, tagline, description, demo_url, accent_color,
        status, key_features, metrics, preview_tags, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        p.category, p.title, p.badge, p.tagline, p.description, p.demo_url,
        p.accent_color, p.status, p.key_features, p.metrics, p.preview_tags, p.sort_order
      ]
    );
  }

  console.log('Successfully seeded 3 default SaaS & ERP products.');
  process.exit(0);
}

seedDefaultProducts().catch(err => {
  console.error('Error seeding products:', err);
  process.exit(1);
});
