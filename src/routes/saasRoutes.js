const express = require('express');
const router = express.Router();
const saasController = require('../controllers/saasController');
const authMiddleware = require('../middleware/auth');

// Public endpoints
router.get('/instances', saasController.getPublicInstances);

// Admin-protected endpoints
router.post('/admin/instances', authMiddleware, saasController.createInstance);
router.patch('/admin/instances/:id/reset', authMiddleware, saasController.resetInstanceData);
router.delete('/admin/instances/:id', authMiddleware, saasController.deleteInstance);

module.exports = router;
