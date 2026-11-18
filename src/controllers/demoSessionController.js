const { query } = require('../config/db');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Setup email transporter using existing SMTP config
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false,
  },
});

const ensureDemoSessionsTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS demo_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      demo_id VARCHAR(50) UNIQUE NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      work_email VARCHAR(255) NOT NULL,
      phone_number VARCHAR(50),
      company_name VARCHAR(255) NOT NULL,
      company_size VARCHAR(50) DEFAULT '10-50 employees',
      application VARCHAR(100) NOT NULL DEFAULT 'Dynamics 365 Finance & Operations',
      target_subdomain VARCHAR(100) NOT NULL DEFAULT 'demo.flutterflirt.com',
      username VARCHAR(100) NOT NULL,
      password_hash TEXT NOT NULL,
      temp_password_plain TEXT,
      login_count INTEGER NOT NULL DEFAULT 0,
      activity_log JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      approved_at TIMESTAMPTZ,
      credentials_sent_at TIMESTAMPTZ,
      first_login_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ,
      last_login_at TIMESTAMPTZ,
      status VARCHAR(30) NOT NULL DEFAULT 'ready' 
        CHECK (status IN ('pending', 'approved', 'ready', 'active', 'expired', 'revoked')),
      notes TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_demo_sessions_status_expires ON demo_sessions(status, expires_at);
    CREATE INDEX IF NOT EXISTS idx_demo_sessions_email ON demo_sessions(work_email);
    CREATE INDEX IF NOT EXISTS idx_demo_sessions_username ON demo_sessions(username);
  `);
  // Add columns if table already exists
  await query(`ALTER TABLE demo_sessions ADD COLUMN IF NOT EXISTS login_count INTEGER NOT NULL DEFAULT 0;`);
  await query(`ALTER TABLE demo_sessions ADD COLUMN IF NOT EXISTS activity_log JSONB DEFAULT '[]';`);
};

// Normalize response row for consistent API contracts
const normalizeSession = (row) => {
  let timeRemaining = null;
  if (row.status === 'active' && row.expires_at) {
    const diffMs = new Date(row.expires_at).getTime() - Date.now();
    if (diffMs > 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      timeRemaining = `${hours}h ${mins}m remaining`;
    } else {
      timeRemaining = 'Expired';
    }
  } else if (row.status === 'ready') {
    timeRemaining = '48 hours (Starts on 1st login)';
  } else if (row.status === 'pending') {
    timeRemaining = 'Not started (Pending approval)';
  } else if (row.status === 'expired') {
    timeRemaining = 'Expired';
  }

  return {
    id: row.id,
    demoId: row.demo_id,
    customerName: row.customer_name,
    workEmail: row.work_email,
    phoneNumber: row.phone_number,
    companyName: row.company_name,
    companySize: row.company_size,
    application: row.application,
    targetSubdomain: row.target_subdomain,
    username: row.username,
    tempPasswordPlain: row.temp_password_plain,
    createdAt: row.created_at,
    approvedAt: row.approved_at,
    credentialsSentAt: row.credentials_sent_at,
    firstLoginAt: row.first_login_at,
    expiresAt: row.expires_at,
    lastLoginAt: row.last_login_at,
    loginCount: row.login_count || 0,
    activityLog: row.activity_log || [],
    status: row.status,
    notes: row.notes,
    timeRemaining,
  };
};

// Seed initial test demo sessions if table is empty
const seedDefaultDemos = async () => {
  const countRes = await query(`SELECT COUNT(*) FROM demo_sessions`);
  if (parseInt(countRes.rows[0].count, 10) === 0) {
    const demos = [
      {
        demoId: 'ERP-DEMO-1001',
        customerName: 'Rahul Sharma',
        workEmail: 'rahul.sharma@apexlogistics.com',
        phoneNumber: '+91 98765 43210',
        companyName: 'Apex Global Logistics',
        companySize: '250-500 employees',
        application: 'Dynamics 365 Finance & Operations',
        username: 'rahul.apex',
        password_hash: crypto.createHash('sha256').update('ApexDemo2026!').digest('hex'),
        temp_password_plain: 'ApexDemo2026!',
        status: 'ready',
        approved_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
        credentials_sent_at: new Date(Date.now() - 23 * 60 * 60 * 1000),
        first_login_at: null,
        expires_at: null,
      },
      {
        demoId: 'ERP-DEMO-1002',
        customerName: 'Sarah Jenkins',
        workEmail: 's.jenkins@novaretail.co',
        phoneNumber: '+1 (555) 349-1029',
        companyName: 'Nova Retail Group',
        companySize: '50-100 employees',
        application: 'Dynamics 365 Business Central',
        username: 'sarah.nova',
        password_hash: crypto.createHash('sha256').update('NovaDemo2026!').digest('hex'),
        temp_password_plain: 'NovaDemo2026!',
        status: 'pending',
      },
      {
        demoId: 'CRM-DEMO-1003',
        customerName: 'Vikram Malhotra',
        workEmail: 'v.malhotra@zenithenergy.in',
        phoneNumber: '+91 91234 56789',
        companyName: 'Zenith CleanTech',
        companySize: '100-250 employees',
        application: 'Customer Engagement (CRM)',
        username: 'vikram.zenith',
        password_hash: crypto.createHash('sha256').update('ZenithCRM2026!').digest('hex'),
        temp_password_plain: 'ZenithCRM2026!',
        status: 'active',
        approved_at: new Date(Date.now() - 10 * 60 * 60 * 1000),
        credentials_sent_at: new Date(Date.now() - 9 * 60 * 60 * 1000),
        first_login_at: new Date(Date.now() - 4 * 60 * 60 * 1000), // Logged in 4 hours ago
        expires_at: new Date(Date.now() + 44 * 60 * 60 * 1000), // 44 hours remaining
        last_login_at: new Date(Date.now() - 15 * 60 * 1000),
      },
    ];

    for (const d of demos) {
      await query(
        `INSERT INTO demo_sessions 
         (demo_id, customer_name, work_email, phone_number, company_name, company_size, application, username, password_hash, temp_password_plain, status, approved_at, credentials_sent_at, first_login_at, expires_at, last_login_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          d.demoId,
          d.customerName,
          d.workEmail,
          d.phoneNumber,
          d.companyName,
          d.companySize,
          d.application,
          d.username,
          d.password_hash,
          d.temp_password_plain,
          d.status,
          d.approved_at || null,
          d.credentials_sent_at || null,
          d.first_login_at || null,
          d.expires_at || null,
          d.last_login_at || null,
        ]
      );
    }
  }
};

// 1. PUBLIC: Submit Demo Request & INSTANTLY SEND CREDENTIALS (No manual approval needed)
const submitDemoRequest = async (req, res) => {
  try {
    await ensureDemoSessionsTable();
    const { fullName, workEmail, phoneNumber, companyName, companySize, productInterested, notes } = req.body;

    if (!fullName || !workEmail || !companyName) {
      return res.status(400).json({ success: false, message: 'Full name, work email, and company name are required.' });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const demoId = `${productInterested?.includes('CRM') ? 'CRM' : 'ERP'}-DEMO-${randomSuffix}`;
    const cleanUsername = `${fullName.toLowerCase().split(' ')[0]}.${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const plainPassword = `Demo${Math.random().toString(36).substring(2, 8).toUpperCase()}!2026`;
    const passwordHash = crypto.createHash('sha256').update(plainPassword).digest('hex');
    const now = new Date();

    // 1. Fetch matching product to retrieve its configured demo_url and direct demo_db_url
    let targetDemoUrl = 'https://demo.flutterflirt.com';
    let targetDemoDbUrl = null;

    try {
      const prodRes = await query(
        `SELECT demo_url, demo_db_url FROM saas_products 
         WHERE LOWER(title) = LOWER($1) OR LOWER(title) LIKE LOWER($2) 
         LIMIT 1`,
        [productInterested, `%${productInterested}%`]
      );
      if (prodRes.rows.length > 0) {
        if (prodRes.rows[0].demo_url) {
          targetDemoUrl = prodRes.rows[0].demo_url;
        }
        if (prodRes.rows[0].demo_db_url) {
          targetDemoDbUrl = prodRes.rows[0].demo_db_url;
        }
      }
    } catch (e) {
      console.warn('Could not query saas_products for demo URLs:', e.message);
    }

    // 2. If the product has a direct demo DB configured, create user in that project's database
    if (targetDemoDbUrl) {
      try {
        const productDbPool = new Pool({
          connectionString: targetDemoDbUrl,
          connectionTimeoutMillis: 5000,
        });

        // Compute bcrypt hash (standard for apps like Stock Pilot / WMS)
        const salt = await bcrypt.genSalt(10);
        const bcryptHash = await bcrypt.hash(plainPassword, salt);

        // Check columns of 'users' table in target project DB
        const usersTableInfo = await productDbPool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema='public' AND table_name='users'
        `);

        if (usersTableInfo.rows.length > 0) {
          const colNames = usersTableInfo.rows.map(r => r.column_name);
          const hasPasswordHash = colNames.includes('password_hash');
          const hasPassword = colNames.includes('password');
          const hasRole = colNames.includes('role');
          const hasActive = colNames.includes('active');

          const pwCol = hasPasswordHash ? 'password_hash' : (hasPassword ? 'password' : null);
          const pwVal = hasPasswordHash ? bcryptHash : plainPassword;

          // Check if user already exists
          const existing = await productDbPool.query(`SELECT id FROM users WHERE LOWER(email) = LOWER($1)`, [workEmail]);

          if (existing.rows.length > 0) {
            // Update password so user can login with their fresh credentials
            if (pwCol) {
              await productDbPool.query(`UPDATE users SET "${pwCol}" = $1, name = $2 WHERE id = $3`, [pwVal, fullName, existing.rows[0].id]);
            }
          } else {
            // Insert new user into users table with ADMIN role
            let insertCols = ['name', 'email'];
            let insertVals = [fullName, workEmail];
            let placeholders = ['$1', '$2'];
            let idx = 3;

            if (pwCol) {
              insertCols.push(`"${pwCol}"`);
              insertVals.push(pwVal);
              placeholders.push(`$${idx++}`);
            }

            if (hasRole) {
              insertCols.push('role');
              insertVals.push('ADMIN');
              placeholders.push(`$${idx++}`);
            }

            if (hasActive) {
              insertCols.push('active');
              insertVals.push(true);
              placeholders.push(`$${idx++}`);
            }

            const insertSql = `INSERT INTO users (${insertCols.join(', ')}) VALUES (${placeholders.join(', ')})`;
            await productDbPool.query(insertSql, insertVals);
          }
          console.log(`[Demo Provision] Successfully populated 'users' table in target project DB for ${workEmail}`);
        }

        // Also ensure demo_users backup table is kept updated
        await productDbPool.query(`
          CREATE TABLE IF NOT EXISTS demo_users (
            id SERIAL PRIMARY KEY,
            demo_id VARCHAR(50),
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE,
            username VARCHAR(100) UNIQUE,
            password TEXT,
            password_hash TEXT,
            role VARCHAR(50) DEFAULT 'admin',
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        await productDbPool.query(
          `INSERT INTO demo_users (demo_id, name, email, username, password, password_hash, role, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'ADMIN', 'active')
           ON CONFLICT (email) DO UPDATE 
           SET username = EXCLUDED.username, password = EXCLUDED.password, password_hash = EXCLUDED.password_hash`,
          [demoId, fullName, workEmail, cleanUsername, plainPassword, bcryptHash]
        );

        await productDbPool.end();
      } catch (dbErr) {
        console.error(`[Demo Provision Error] Failed to insert into project demo DB: ${dbErr.message}`);
      }
    }

    // 3. Insert into central demo_sessions table
    const result = await query(
      `INSERT INTO demo_sessions 
       (demo_id, customer_name, work_email, phone_number, company_name, company_size, application, target_subdomain, username, password_hash, temp_password_plain, notes, status, approved_at, credentials_sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'ready', $13, $13)
       RETURNING *`,
      [
        demoId,
        fullName,
        workEmail,
        phoneNumber || '',
        companyName,
        companySize || '10-50 employees',
        productInterested || 'Dynamics 365 Finance & Operations',
        targetDemoUrl,
        cleanUsername,
        passwordHash,
        plainPassword,
        notes || '',
        now,
      ]
    );

    const session = result.rows[0];

    // INSTANT EMAIL DISPATCH TO USER WITH ACCURATE DEMO URL & CREDENTIALS
    if (process.env.SMTP_USER) {
      try {
        const demoLoginUrl = targetDemoUrl;
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"FlutterFlirt Enterprise Solutions" <${process.env.SMTP_USER}>`,
          to: workEmail,
          subject: `Your ${session.application} Demo Credentials [${session.demo_id}]`,
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demo Access Credentials</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#172554;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;padding:30px 12px;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" border="0"
style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.05);">

<!-- HEADER -->
<tr>
<td style="background:#0755c9;padding:30px 32px;color:#ffffff;">
  <h1 style="margin:0;font-size:27px;">FlutterFlirt</h1>
  <p style="margin:5px 0 0;font-size:13px;color:#dbeafe;">
    Cloud ERP &amp; CRM
  </p>
  <h2 style="margin:30px 0 0;font-size:28px;">
    Demo Access Credentials
  </h2>
  <p style="margin:8px 0 0;color:#dbeafe;font-size:14px;">
    Your workspace is ready to explore.
  </p>
</td>
</tr>

<!-- MESSAGE -->
<tr>
<td style="padding:30px 32px 15px;">
  <h2 style="font-size:21px;margin:0 0 14px;color:#0f172a;">
    Hello ${fullName},
  </h2>
  <p style="font-size:15px;line-height:1.7;color:#475569;margin:0;">
    Thank you for requesting access to
    <strong>FlutterFlirt Cloud ERP &amp; CRM.</strong>
    Your demo environment for <strong>${session.application}</strong>
    has been successfully provisioned.
  </p>
</td>
</tr>

<!-- PRODUCT -->
<tr>
<td style="padding:12px 32px;">
  <table width="100%" cellpadding="0" cellspacing="0"
  style="background:#eff6ff;border:1px solid #dbeafe;border-radius:9px;">
    <tr>
      <td style="padding:18px;">
        <h3 style="margin:0;color:#0755c9;font-size:19px;">${session.application}</h3>
        <p style="margin:6px 0 0;color:#475569;font-size:14px;">
          Interactive Shared B2B SaaS Demo Environment
        </p>
      </td>
    </tr>
  </table>
</td>
</tr>

<!-- CREDENTIALS -->
<tr>
<td style="padding:20px 32px;">
  <h3 style="font-size:18px;color:#0f172a;margin:0 0 18px;">
    Your Demo Access Details
  </h3>

  <table width="100%" cellpadding="0" cellspacing="0"
  style="border:1px solid #e2e8f0;border-radius:9px;">
    <tr>
      <td style="padding:14px;border-bottom:1px solid #e2e8f0;">
        <p style="margin:0 0 6px;color:#64748b;font-size:12px;">DEMO ACCESS URL</p>
        <a href="${demoLoginUrl}"
        style="color:#0755c9;font-weight:bold;word-break:break-all;">
          ${demoLoginUrl}
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding:14px;border-bottom:1px solid #e2e8f0;">
        <p style="margin:0 0 6px;color:#64748b;font-size:12px;">LOGIN EMAIL / USERNAME</p>
        <strong style="font-size:15px;">${workEmail}</strong>
        <p style="margin:5px 0 0;color:#64748b;font-size:13px;">
          Username handle: ${cleanUsername}
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:14px;">
        <p style="margin:0 0 6px;color:#64748b;font-size:12px;">TEMPORARY PASSWORD</p>
        <strong style="font-size:17px;color:#0755c9;">
          ${plainPassword}
        </strong>
      </td>
    </tr>
  </table>
</td>
</tr>

<!-- BUTTON -->
<tr>
<td align="center" style="padding:5px 32px 25px;">
  <a href="${demoLoginUrl}"
  style="display:inline-block;background:#0755c9;color:#ffffff;
  text-decoration:none;padding:15px 32px;border-radius:7px;
  font-size:15px;font-weight:bold;">
    Launch Demo Sandbox &nbsp; →
  </a>
</td>
</tr>

<!-- VALIDITY -->
<tr>
<td style="padding:0 32px 25px;">
  <table width="100%" cellpadding="0" cellspacing="0"
  style="background:#eff6ff;border-left:4px solid #2563eb;border-radius:6px;">
    <tr>
      <td style="padding:17px;">
        <strong style="font-size:16px;color:#0755c9;">
          48-Hour Demo Validity
        </strong>
        <p style="margin:7px 0 0;font-size:14px;line-height:1.6;color:#334155;">
          Your 48 hours of uninterrupted evaluation start strictly
          when you log in for the first time. Your access will
          automatically expire after 48 hours.
        </p>
      </td>
    </tr>
  </table>
</td>
</tr>

<!-- SUPPORT -->
<tr>
<td style="padding:5px 32px 30px;">
  <strong style="font-size:16px;color:#0f172a;">Need Assistance?</strong>
  <p style="font-size:14px;line-height:1.6;color:#475569;margin:7px 0 0;">
    If you face any difficulty accessing your demo workspace,
    contact our support team at
    <a href="mailto:info@flutterflirt.com"
    style="color:#0755c9;font-weight:bold;">
      info@flutterflirt.com
    </a>.
  </p>
</td>
</tr>

<!-- FOOTER -->
<tr>
<td align="center" style="background:#0f2d55;padding:23px;color:#ffffff;">
  <strong style="font-size:16px;">FlutterFlirt Solutions</strong>
  <p style="font-size:12px;color:#bfdbfe;margin:8px 0;">
    Enterprise Cloud Platform for Modern Businesses
  </p>
  <a href="https://flutterflirt.com"
  style="font-size:12px;color:#ffffff;text-decoration:none;">
    www.flutterflirt.com
  </a>
  <p style="font-size:11px;color:#bfdbfe;margin:15px 0 0;">
    This email contains confidential login credentials.
    Please do not share them with unauthorized individuals.
  </p>
</td>
</tr>

</table>
</td>
</tr>
</table>

</body>
</html>
          `,
        });
      } catch (mailErr) {
        console.warn('Could not dispatch instant credential email:', mailErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: `Demo credentials and login URL have been emailed to ${workEmail}.`,
      session: normalizeSession(session),
    });
  } catch (error) {
    console.error('Error in submitDemoRequest:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit demo request' });
  }
};

// 2. ADMIN: List all demo sessions
const getAllDemoSessions = async (req, res) => {
  try {
    await ensureDemoSessionsTable();
    await seedDefaultDemos();

    // Check if any 'ready' demo sessions have logged into their target product DB
    try {
      const readySessions = await query(
        `SELECT ds.id, ds.work_email, ds.application, p.demo_db_url 
         FROM demo_sessions ds
         LEFT JOIN saas_products p ON (LOWER(p.title) = LOWER(ds.application) OR LOWER(p.title) LIKE LOWER('%' || ds.application || '%'))
         WHERE ds.status = 'ready' AND ds.first_login_at IS NULL AND p.demo_db_url IS NOT NULL AND p.demo_db_url != ''`
      );

      for (const row of readySessions.rows) {
        try {
          const pool = new Pool({ connectionString: row.demo_db_url, connectionTimeoutMillis: 3000 });
          // Check if user has logged in: either recorded in demo_user_logins, or pg_stat_statements shows login query
          const stat = await pool.query(
            `SELECT calls FROM pg_stat_statements WHERE query ILIKE '%lower(email)=lower%' LIMIT 1`
          );
          if (stat.rows.length > 0 && parseInt(stat.rows[0].calls, 10) > 0) {
            const now = new Date();
            const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);
            const initialLog = [{ event: "First Successful Login via Product App", timestamp: now.toISOString(), client: row.application }];
            await query(
              `UPDATE demo_sessions
               SET first_login_at = $1, expires_at = $2, last_login_at = $1, status = 'active', login_count = COALESCE(login_count, 0) + 1, activity_log = $3
               WHERE id = $4`,
              [now, expiresAt, JSON.stringify(initialLog), row.id]
            );
          }
          await pool.end();
        } catch (subErr) {
          // ignore individual db check error
        }
      }
    } catch (syncErr) {
      console.warn('Sync ready sessions check failed:', syncErr.message);
    }

    const result = await query(`SELECT * FROM demo_sessions ORDER BY created_at DESC`);
    return res.status(200).json({
      success: true,
      sessions: result.rows.map(normalizeSession),
    });
  } catch (error) {
    console.error('Error in getAllDemoSessions:', error);
    return res.status(500).json({ success: false, message: 'Failed to load demo sessions' });
  }
};

// 3. ADMIN: Approve Demo Request & Dispatch Credentials
const approveDemoRequest = async (req, res) => {
  try {
    await ensureDemoSessionsTable();
    const { id } = req.params;
    const { sendEmail } = req.body;

    const sessionRes = await query(`SELECT * FROM demo_sessions WHERE id = $1`, [id]);
    if (sessionRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Demo request not found' });
    }

    const session = sessionRes.rows[0];
    const now = new Date();

    // Set approved_at, credentials_sent_at, and transition to 'ready'
    // TIMER IS DELIBERATELY NOT STARTED HERE (first_login_at & expires_at stay NULL)
    const updated = await query(
      `UPDATE demo_sessions
       SET status = 'ready', approved_at = COALESCE(approved_at, $1), credentials_sent_at = $1
       WHERE id = $2
       RETURNING *`,
      [now, id]
    );

    // Optional email dispatch with formatted HTML email
    if (sendEmail !== false && process.env.SMTP_USER) {
      try {
        const demoLoginUrl = `https://${session.target_subdomain}`;
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"FlutterFlirt Enterprise Solutions" <${process.env.SMTP_USER}>`,
          to: session.work_email,
          subject: `Your ${session.application} Demo Access is Ready [${session.demo_id}]`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
                .card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
                .header { background: #0f172a; padding: 32px 36px; text-align: left; }
                .brand { color: #60a5fa; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 8px; }
                .title { color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; }
                .content { padding: 36px; }
                .greeting { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
                .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
                .creds-box { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 14px; padding: 20px; margin-bottom: 24px; }
                .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; }
                .row:last-child { border-bottom: none; }
                .label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; }
                .value { font-size: 13px; font-weight: 700; color: #0f172a; font-family: monospace; }
                .highlight { color: #2563eb; }
                .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 12px; margin-top: 8px; text-align: center; }
                .timer-notice { background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 18px; border-radius: 0 10px 10px 0; margin-top: 24px; font-size: 13px; line-height: 1.5; color: #1e40af; }
                .footer { padding: 24px 36px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <div class="brand">FlutterFlirt Cloud ERP & CRM</div>
                  <h1 class="title">Demo Access Provisioned</h1>
                </div>
                <div class="content">
                  <div class="greeting">Hello ${session.customer_name},</div>
                  <p class="text">
                    Your requested sandbox for <strong>${session.application}</strong> at <strong>${session.company_name}</strong> is now ready for exploration.
                  </p>

                  <div class="creds-box">
                    <div style="margin-bottom: 12px;">
                      <div class="label">Demo Access URL</div>
                      <div style="margin-top: 4px;"><a href="${demoLoginUrl}" style="color: #2563eb; font-weight: 700; font-size: 14px; text-decoration: none;">${demoLoginUrl}</a></div>
                    </div>
                    <div style="margin-bottom: 12px;">
                      <div class="label">Login Email / Username</div>
                      <div class="value" style="margin-top: 4px; font-size: 15px; color: #0f172a;">${session.work_email}</div>
                      <div style="font-size: 12px; color: #64748b; margin-top: 2px;">(Username handle: ${session.username})</div>
                    </div>
                    <div>
                      <div class="label">Temporary Password</div>
                      <div class="value" style="margin-top: 4px; font-size: 15px; color: #2563eb;">${session.temp_password_plain}</div>
                    </div>
                  </div>

                  <div style="text-align: center; margin: 28px 0;">
                    <a href="${demoLoginUrl}" class="btn">Launch Demo Sandbox &rarr;</a>
                  </div>

                  <div class="timer-notice">
                    <strong>⏳ 48-Hour Guarantee:</strong> Your 48 hours of evaluation begins strictly when you <strong>log in for the first time</strong>. No evaluation time has been consumed yet.
                  </div>
                </div>
                <div class="footer">
                  FlutterFlirt Solutions &bull; Enterprise Cloud Platform &bull; Need help? Contact info@flutterflirt.com
                </div>
              </div>
            </body>
            </html>
          `,
        });
      } catch (mailErr) {
        console.warn('Could not dispatch credential email:', mailErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Demo request approved! Status set to Ready. 48-hour timer will start when user logs in.',
      session: normalizeSession(updated.rows[0]),
    });
  } catch (error) {
    console.error('Error in approveDemoRequest:', error);
    return res.status(500).json({ success: false, message: 'Failed to approve demo request' });
  }
};

// 4. GATEWAY AUTHENTICATOR (Detects First Login and starts 48-hour timer)
const gatewayAuthenticate = async (req, res) => {
  try {
    await ensureDemoSessionsTable();
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    const hashedInput = crypto.createHash('sha256').update(password).digest('hex');

    const result = await query(
      `SELECT * FROM demo_sessions WHERE LOWER(username) = LOWER($1) OR LOWER(work_email) = LOWER($1)`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid demo credentials' });
    }

    const session = result.rows[0];

    // Password verification (check hashed or plain fallback)
    if (session.password_hash !== hashedInput && session.temp_password_plain !== password) {
      return res.status(401).json({ success: false, message: 'Invalid demo credentials' });
    }

    // Check account status
    if (session.status === 'revoked') {
      return res.status(403).json({ success: false, message: 'This demo session has been revoked by admin.' });
    }
    if (session.status === 'expired') {
      return res.status(403).json({ success: false, message: 'Your 48-hour demo session has expired. Contact sales for an extension.' });
    }

    const now = new Date();

    // FIRST LOGIN CHECK:
    if (!session.first_login_at) {
      // Exactly 48 hours from NOW
      const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      const initialLog = [{ event: "First Successful Login", timestamp: now.toISOString(), ip: req.ip || "Direct Gateway" }];

      const activatedRes = await query(
        `UPDATE demo_sessions 
         SET first_login_at = $1, expires_at = $2, last_login_at = $1, status = 'active', login_count = 1, activity_log = $3
         WHERE id = $4
         RETURNING *`,
        [now, expiresAt, JSON.stringify(initialLog), session.id]
      );

      // Trigger Demo Activation Email
      if (process.env.SMTP_USER) {
        try {
          transporter.sendMail({
            from: process.env.SMTP_FROM || `"FlutterFlirt Cloud ERP" <${process.env.SMTP_USER}>`,
            to: session.work_email,
            subject: `Demo Activated: 48-Hour Timer Started [${session.demo_id}]`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b; line-height: 1.6;">
                <h2 style="color: #16a34a;">Demo Session Successfully Activated!</h2>
                <p>Hello <strong>${session.customer_name}</strong>,</p>
                <p>You have successfully signed in to <strong>${session.application}</strong> for the first time.</p>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0 0 6px;"><strong>First Login Time:</strong> ${now.toUTCString()}</p>
                  <p style="margin: 0 0 6px;"><strong>Valid Until:</strong> ${expiresAt.toUTCString()} (Exactly 48 Hours)</p>
                  <p style="margin: 0;"><strong>Active Demo ID:</strong> ${session.demo_id}</p>
                </div>
                <p>Enjoy exploring all enterprise capabilities. Our technical architecture team is on standby should you have any questions.</p>
              </div>
            `,
          }).catch(e => console.warn('Activation email error:', e.message));
        } catch (e) {
          console.warn('Mail exception:', e);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Welcome! Your 48-hour demo access has been activated.',
        isFirstLogin: true,
        session: normalizeSession(activatedRes.rows[0]),
      });
    } else {
      // SUBSEQUENT LOGIN: Check if expired
      if (new Date(session.expires_at) <= now) {
        await query(`UPDATE demo_sessions SET status = 'expired' WHERE id = $1`, [session.id]);
        return res.status(403).json({ success: false, message: 'Your 48-hour demo session has expired.' });
      }

      // Record subsequent login timestamp WITHOUT restarting or modifying expires_at
      const newLog = Array.isArray(session.activity_log) ? session.activity_log : [];
      newLog.unshift({ event: "Return Login", timestamp: now.toISOString(), ip: req.ip || "Direct Gateway" });

      const updatedRes = await query(
        `UPDATE demo_sessions 
         SET last_login_at = $1, login_count = COALESCE(login_count, 0) + 1, activity_log = $2 
         WHERE id = $3 
         RETURNING *`,
        [now, JSON.stringify(newLog.slice(0, 50)), session.id]
      );

      return res.status(200).json({
        success: true,
        message: 'Authentication successful. Welcome back.',
        isFirstLogin: false,
        session: normalizeSession(updatedRes.rows[0]),
      });
    }
  } catch (error) {
    console.error('Error in gatewayAuthenticate:', error);
    return res.status(500).json({ success: false, message: 'Authentication gateway failure' });
  }
};

// 5. ADMIN: Extend Demo Expiry (+24h or +48h or custom date)
const extendDemoExpiry = async (req, res) => {
  try {
    await ensureDemoSessionsTable();
    const { id } = req.params;
    const { additionalHours } = req.body;

    const sessionRes = await query(`SELECT * FROM demo_sessions WHERE id = $1`, [id]);
    if (sessionRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Demo session not found' });
    }

    const session = sessionRes.rows[0];
    const addMs = (parseInt(additionalHours, 10) || 24) * 60 * 60 * 1000;
    
    // Base extension from current expires_at if in the future, or from now if already expired
    const baseTime = session.expires_at && new Date(session.expires_at) > new Date()
      ? new Date(session.expires_at)
      : new Date();

    const newExpiry = new Date(baseTime.getTime() + addMs);

    const updated = await query(
      `UPDATE demo_sessions 
       SET expires_at = $1, status = 'active'
       WHERE id = $2
       RETURNING *`,
      [newExpiry, id]
    );

    return res.status(200).json({
      success: true,
      message: `Demo successfully extended by ${additionalHours || 24} hours.`,
      session: normalizeSession(updated.rows[0]),
    });
  } catch (error) {
    console.error('Error in extendDemoExpiry:', error);
    return res.status(500).json({ success: false, message: 'Failed to extend demo expiry' });
  }
};

// 6. ADMIN: Revoke or Delete Demo Session
const deleteDemoSession = async (req, res) => {
  try {
    await ensureDemoSessionsTable();
    const { id } = req.params;
    await query(`DELETE FROM demo_sessions WHERE id = $1`, [id]);
    return res.status(200).json({ success: true, message: 'Demo session deleted successfully' });
  } catch (error) {
    console.error('Error in deleteDemoSession:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete demo session' });
  }
};

// 7. BACKGROUND SCHEDULER: Check and expire demo sessions, delete/revoke credentials
const checkAndExpireSessions = async () => {
  try {
    await ensureDemoSessionsTable();
    const now = new Date();
    const expiredCandidates = await query(
      `SELECT ds.*, p.demo_db_url 
       FROM demo_sessions ds
       LEFT JOIN saas_products p ON (LOWER(p.title) = LOWER(ds.application) OR LOWER(p.title) LIKE LOWER('%' || ds.application || '%'))
       WHERE ds.status = 'active' AND ds.expires_at IS NOT NULL AND ds.expires_at <= $1`,
      [now]
    );

    if (expiredCandidates.rows.length > 0) {
      console.log(`[Expiry Scheduler] Expiring and cleaning up ${expiredCandidates.rows.length} session(s).`);
      for (const row of expiredCandidates.rows) {
        // 1. Mark session as expired in central DB
        await query(
          `UPDATE demo_sessions 
           SET status = 'expired', temp_password_plain = NULL 
           WHERE id = $1`,
          [row.id]
        );

        // 2. Automatically delete/deactivate user from the project's demo DB (e.g. Stock Pilot Neon DB)
        if (row.demo_db_url) {
          try {
            const projectDbPool = new Pool({
              connectionString: row.demo_db_url,
              connectionTimeoutMillis: 5000,
            });

            // Delete or deactivate from 'users' table
            await projectDbPool.query(
              `DELETE FROM users WHERE LOWER(email) = LOWER($1)`,
              [row.work_email]
            );

            // Also delete from 'demo_users' table if exists
            await projectDbPool.query(
              `DELETE FROM demo_users WHERE LOWER(email) = LOWER($1)`,
              [row.work_email]
            );

            await projectDbPool.end();
            console.log(`[Expiry Scheduler] Successfully purged credentials for ${row.work_email} from target demo DB.`);
          } catch (cleanErr) {
            console.warn(`[Expiry Scheduler] Error cleaning project demo DB for ${row.work_email}:`, cleanErr.message);
          }
        }
        
        // 3. Notify user their 48 hours have ended
        if (process.env.SMTP_USER) {
          try {
            transporter.sendMail({
              from: process.env.SMTP_FROM || `"FlutterFlirt Cloud ERP" <${process.env.SMTP_USER}>`,
              to: row.work_email,
              subject: `Your 48-Hour Demo Access Has Concluded [${row.demo_id}]`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b; line-height: 1.6;">
                  <h2 style="color: #e11d48;">Demo Session Concluded</h2>
                  <p>Hello <strong>${row.customer_name}</strong>,</p>
                  <p>Your 48-hour evaluation access for <strong>${row.application}</strong> has expired, and your temporary credentials have been automatically decommissioned.</p>
                  <p>We hope the hands-on experience helped showcase how FlutterFlirt automates enterprise operations.</p>
                  <p>To request a tailored full rollout or discuss an extension, please contact us at <a href="mailto:info@flutterflirt.com">info@flutterflirt.com</a>.</p>
                </div>
              `,
            }).catch(e => console.warn('Expiry mail failed:', e.message));
          } catch (e) {
            console.warn('Mail exception:', e);
          }
        }
      }
    }
  } catch (err) {
    console.error('[Expiry Scheduler Error]:', err.message);
  }
};

module.exports = {
  ensureDemoSessionsTable,
  submitDemoRequest,
  getAllDemoSessions,
  approveDemoRequest,
  gatewayAuthenticate,
  extendDemoExpiry,
  deleteDemoSession,
  checkAndExpireSessions,
};
