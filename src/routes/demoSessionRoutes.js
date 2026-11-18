const express = require('express');
const router = express.Router();
const demoSessionController = require('../controllers/demoSessionController');
const authMiddleware = require('../middleware/auth');

// Public route: Customer submits new ERP/CRM demo inquiry
router.post('/demo-requests', demoSessionController.submitDemoRequest);

// Gateway route: Client application / reverse proxy authenticates user demo credentials
// DETECTS FIRST LOGIN AND TRIGGERS 48-HOUR TIMER STRICTLY ON FIRST AUTHENTICATION
router.post('/demo/auth/login', demoSessionController.gatewayAuthenticate);

// Admin-protected endpoints
router.get('/admin/demo-sessions', authMiddleware, demoSessionController.getAllDemoSessions);
router.post('/admin/demo-sessions/:id/approve', authMiddleware, demoSessionController.approveDemoRequest);
router.patch('/admin/demo-sessions/:id/extend', authMiddleware, demoSessionController.extendDemoExpiry);
router.delete('/admin/demo-sessions/:id', authMiddleware, demoSessionController.deleteDemoSession);

module.exports = router;
