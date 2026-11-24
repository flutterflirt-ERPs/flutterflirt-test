const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const seedManagerController = require('../controllers/seedManagerController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const { productSchema } = require('../validations/productValidations');
const multer = require('multer');

// Configure memory storage for seed and schema file upload (.sql, .js)
const uploadFiles = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

// Public route: website visitors browse active products
router.get('/products', productController.getPublicProducts);

// Admin routes: protected CRUD
router.get('/admin/products', authMiddleware, productController.getAllProductsAdmin);
router.post('/admin/products', authMiddleware, validate(productSchema), productController.createProduct);
router.post('/admin/products/test-db-connection', authMiddleware, productController.testDbConnection);
router.get('/admin/products/db-status', authMiddleware, productController.batchVerifyDbStatus);
router.patch('/admin/products/:id', authMiddleware, productController.updateProduct);
router.delete('/admin/products/:id', authMiddleware, productController.deleteProduct);

// Admin routes: Daily Seed Script Management & Nightly Cron Trigger
router.get('/admin/products/:productId/seed-config', authMiddleware, seedManagerController.getSeedConfig);
router.post(
  '/admin/products/:productId/seed-config',
  authMiddleware,
  uploadFiles.fields([
    { name: 'seedFile', maxCount: 1 },
    { name: 'schemaFile', maxCount: 1 },
  ]),
  seedManagerController.saveSeedConfig
);
router.post('/admin/products/:productId/seed-trigger', authMiddleware, seedManagerController.triggerSeedNow);

// Vercel Cron Endpoint: Midnight automated reset
router.get('/cron/seed', seedManagerController.handleVercelCronSeed);

module.exports = router;
