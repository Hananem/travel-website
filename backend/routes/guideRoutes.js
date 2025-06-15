// routes/guideRoutes.js
const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');
const upload = require('../middleware/upload');
const { protect, isAdmin } = require('../middleware/protect'); // Fixed: destructured import

// Public routes (no authentication needed)
router.get('/', guideController.getGuides);
router.get('/:id', guideController.getGuideById);

// Protected routes (authentication required)
router.post('/', protect, upload.single('image'), guideController.createGuide);
router.put('/:id', protect, upload.single('image'), guideController.updateGuide);
router.delete('/:id', protect, guideController.deleteGuide);

// If you need admin-only routes, you can add them like this:
// router.post('/', protect, isAdmin, upload.single('image'), guideController.createGuide);
// router.put('/:id', protect, isAdmin, upload.single('image'), guideController.updateGuide);
// router.delete('/:id', protect, isAdmin, guideController.deleteGuide);

module.exports = router;