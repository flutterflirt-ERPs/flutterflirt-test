const { query } = require('../config/db');
const { Pool } = require('pg');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Directory for storing uploaded seed files
const SEED_STORAGE_DIR = path.join(__dirname, '../../uploads/seed-scripts');
if (!fs.existsSync(SEED_STORAGE_DIR)) {
  fs.mkdirSync(SEED_STORAGE_DIR, { recursive: true });
}

let activeCronTask = null;

// Ensure database table for seed config & run logs
const ensureSeedTables = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS product_seed_configs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES saas_products(id) ON DELETE CASCADE,
      cron_time VARCHAR(20) NOT NULL DEFAULT '03:00',
      is_enabled BOOLEAN NOT NULL DEFAULT true,
      file_name VARCHAR(255),
      file_path TEXT,
      original_name VARCHAR(255),
      file_content TEXT,
      last_run_at TIMESTAMPTZ,
      last_status VARCHAR(50),
      last_log TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT unique_product_seed UNIQUE (product_id)
    );

    CREATE TABLE IF NOT EXISTS product_seed_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES saas_products(id) ON DELETE CASCADE,
      run_type VARCHAR(20) NOT NULL DEFAULT 'scheduled',
      status VARCHAR(20) NOT NULL,
      details TEXT,
      duration_ms INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};

/**
 * Execute seed script against target demo database.
 * CRITICAL RULE: The target DB's users / demo_users tables are PRESERVED so that
 * active user demo sessions are not wiped out before their 48 hours expire.
 */
const runSeedForProduct = async (productId, runType = 'manual') => {
  const startTime = Date.now();
  console.log(`[Seed Runner] Starting seed run for product ${productId} (type: ${runType})...`);

  // 1. Fetch product & seed config
  const prodRes = await query(
    `SELECT p.id, p.title, p.demo_db_url, s.file_path, s.file_content, s.is_enabled
     FROM saas_products p
     JOIN product_seed_configs s ON s.product_id = p.id
     WHERE p.id = $1`,
    [productId]
  );

  if (prodRes.rows.length === 0) {
    throw new Error('Seed configuration or product not found');
  }

  const { title, demo_db_url, file_path, file_content } = prodRes.rows[0];

  if (!demo_db_url) {
    throw new Error(`Product "${title}" has no demo_db_url configured`);
  }

  let codeToRun = file_content;
  if (!codeToRun && file_path && fs.existsSync(file_path)) {
    codeToRun = fs.readFileSync(file_path, 'utf8');
  }

  if (!codeToRun || !codeToRun.trim()) {
    throw new Error('Seed script content is empty');
  }

  // 2. Connect to target demo database
  const targetPool = new Pool({
    connectionString: demo_db_url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  const logs = [];
  const appendLog = (msg) => {
    logs.push(`[${new Date().toISOString()}] ${msg}`);
    console.log(`[Seed Engine: ${title}] ${msg}`);
  };

  try {
    appendLog(`Connected to target Neon DB for "${title}".`);

    // 3. Setup sandbox context for the seed script
    // We provide: pool, db (targetPool), query, console, setTimeout, Buffer, etc.
    // The script can export an async function or be an async IIFE / standard JS script.
    const customConsole = {
      log: (...args) => appendLog(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')),
      warn: (...args) => appendLog(`WARN: ` + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')),
      error: (...args) => appendLog(`ERROR: ` + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')),
      info: (...args) => appendLog(`INFO: ` + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')),
    };

    const sandbox = {
      pool: targetPool,
      db: targetPool,
      query: (text, params) => targetPool.query(text, params),
      console: customConsole,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      Buffer,
      Date,
      Math,
      JSON,
      RegExp,
      Promise,
      require: (mod) => {
        if (mod === 'pg') return { Pool };
        if (mod === 'crypto') return require('crypto');
        if (mod === 'bcryptjs' || mod === 'bcrypt') return require('bcryptjs');
        throw new Error(`Require for module '${mod}' is restricted in seed script.`);
      },
      module: { exports: {} },
      exports: {},
    };

    const scriptContext = vm.createContext(sandbox);

    // Wrap in an async execution wrapper so top-level awaits or exported functions run cleanly
    const wrappedCode = `
      (async () => {
        ${codeToRun}
        if (typeof module.exports === 'function') {
          await module.exports({ pool, query, db });
        } else if (typeof module.exports?.seed === 'function') {
          await module.exports.seed({ pool, query, db });
        }
      })()
    `;

    const script = new vm.Script(wrappedCode, {
      filename: `seed_${productId}.js`,
      timeout: 120000, // 2 minutes max execution
    });

    await script.runInContext(scriptContext);

    appendLog('Seed execution completed successfully.');

    const duration = Date.now() - startTime;
    const finalLog = logs.join('\n');

    // Update config status
    await query(
      `UPDATE product_seed_configs 
       SET last_run_at = NOW(), last_status = 'success', last_log = $1, updated_at = NOW()
       WHERE product_id = $2`,
      [finalLog, productId]
    );

    // Save run history log
    await query(
      `INSERT INTO product_seed_logs (product_id, run_type, status, details, duration_ms)
       VALUES ($1, $2, 'success', $3, $4)`,
      [productId, runType, finalLog, duration]
    );

    return { success: true, log: finalLog, duration };
  } catch (err) {
    appendLog(`Execution Failed: ${err.message}`);
    const duration = Date.now() - startTime;
    const finalLog = logs.join('\n');

    await query(
      `UPDATE product_seed_configs 
       SET last_run_at = NOW(), last_status = 'error', last_log = $1, updated_at = NOW()
       WHERE product_id = $2`,
      [finalLog, productId]
    );

    await query(
      `INSERT INTO product_seed_logs (product_id, run_type, status, details, duration_ms)
       VALUES ($1, $2, 'error', $3, $4)`,
      [productId, runType, finalLog, duration]
    );

    throw err;
  } finally {
    try {
      await targetPool.end();
    } catch (_) {}
  }
};

/**
 * Daily scheduler: checks active seed configurations and schedules/runs them.
 * Evaluates every minute if any configured daily time matches the current system time.
 */
const startSeedScheduler = () => {
  if (activeCronTask) {
    activeCronTask.stop();
  }

  // Check every minute
  activeCronTask = cron.schedule('* * * * *', async () => {
    try {
      await ensureSeedTables();

      const now = new Date();
      // Format current time as HH:MM in 24h
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;

      // Find all enabled seed configs matching this time
      const res = await query(
        `SELECT product_id, cron_time, last_run_at 
         FROM product_seed_configs 
         WHERE is_enabled = true AND cron_time = $1`,
        [currentTimeStr]
      );

      for (const row of res.rows) {
        // Prevent running more than once within the same minute
        if (row.last_run_at) {
          const diffMinutes = (Date.now() - new Date(row.last_run_at).getTime()) / (1000 * 60);
          if (diffMinutes < 1.5) continue;
        }

        console.log(`[Seed Cron Trigger] Triggering scheduled seed for product ${row.product_id} at ${currentTimeStr}`);
        runSeedForProduct(row.product_id, 'scheduled').catch(err => {
          console.error(`[Seed Cron Error for ${row.product_id}]:`, err.message);
        });
      }
    } catch (err) {
      console.error('[Seed Cron Global Error]:', err.message);
    }
  });

  console.log('[Seed Scheduler] Daily night seed runner initialized and active.');
};

// --- HTTP Controller Methods ---

// GET /api/admin/products/:productId/seed-config
const getSeedConfig = async (req, res) => {
  try {
    await ensureSeedTables();
    const { productId } = req.params;

    const configRes = await query(
      `SELECT * FROM product_seed_configs WHERE product_id = $1`,
      [productId]
    );

    const logsRes = await query(
      `SELECT * FROM product_seed_logs WHERE product_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [productId]
    );

    if (configRes.rows.length === 0) {
      return res.status(200).json({
        exists: false,
        config: {
          productId,
          cronTime: '03:00', // Default 3:00 AM night time
          isEnabled: true,
          fileName: null,
          hasContent: false,
        },
        logs: [],
      });
    }

    const row = configRes.rows[0];
    return res.status(200).json({
      exists: true,
      config: {
        id: row.id,
        productId: row.product_id,
        cronTime: row.cron_time,
        isEnabled: row.is_enabled,
        fileName: row.file_name || row.original_name,
        originalName: row.original_name,
        hasContent: !!(row.file_content || row.file_path),
        lastRunAt: row.last_run_at,
        lastStatus: row.last_status,
        lastLog: row.last_log,
      },
      logs: logsRes.rows,
    });
  } catch (error) {
    console.error('getSeedConfig error:', error);
    return res.status(500).json({ message: 'Failed to retrieve seed configuration' });
  }
};

// POST /api/admin/products/:productId/seed-config
// Supports file upload (via multer) or direct code text
const saveSeedConfig = async (req, res) => {
  try {
    await ensureSeedTables();
    const { productId } = req.params;
    const { cronTime = '03:00', isEnabled = 'true', seedCode } = req.body;

    let fileName = null;
    let filePath = null;
    let originalName = null;
    let fileContent = seedCode || '';

    if (req.file) {
      originalName = req.file.originalname;
      fileName = `${productId}_${Date.now()}_${req.file.originalname}`;
      filePath = path.join(SEED_STORAGE_DIR, fileName);
      fs.writeFileSync(filePath, req.file.buffer);
      fileContent = req.file.buffer.toString('utf8');
    }

    const enabledBool = isEnabled === 'true' || isEnabled === true;

    // Check existing
    const existing = await query(
      `SELECT id, file_path, file_content, original_name, file_name 
       FROM product_seed_configs WHERE product_id = $1`,
      [productId]
    );

    if (existing.rows.length > 0) {
      const prev = existing.rows[0];
      const finalFileName = fileName || prev.file_name;
      const finalFilePath = filePath || prev.file_path;
      const finalOrigName = originalName || prev.original_name;
      const finalContent = fileContent || prev.file_content;

      await query(
        `UPDATE product_seed_configs
         SET cron_time = $1, is_enabled = $2, file_name = $3, file_path = $4,
             original_name = $5, file_content = $6, updated_at = NOW()
         WHERE product_id = $7`,
        [cronTime, enabledBool, finalFileName, finalFilePath, finalOrigName, finalContent, productId]
      );
    } else {
      await query(
        `INSERT INTO product_seed_configs 
         (product_id, cron_time, is_enabled, file_name, file_path, original_name, file_content)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [productId, cronTime, enabledBool, fileName, filePath, originalName, fileContent]
      );
    }

    return res.status(200).json({
      message: 'Seed file and schedule configured successfully',
      cronTime,
      isEnabled: enabledBool,
      fileName: fileName || (existing.rows[0]?.file_name),
    });
  } catch (error) {
    console.error('saveSeedConfig error:', error);
    return res.status(500).json({ message: error.message || 'Failed to save seed config' });
  }
};

// POST /api/admin/products/:productId/seed-trigger
// Manually triggers seed execution on demand
const triggerSeedNow = async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await runSeedForProduct(productId, 'manual');
    return res.status(200).json({
      message: 'Seed executed successfully',
      log: result.log,
      durationMs: result.duration,
    });
  } catch (error) {
    console.error('triggerSeedNow error:', error);
    return res.status(500).json({
      message: 'Seed execution failed: ' + error.message,
      error: error.message,
    });
  }
};

module.exports = {
  getSeedConfig,
  saveSeedConfig,
  triggerSeedNow,
  startSeedScheduler,
  runSeedForProduct,
};
