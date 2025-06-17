// routes/guideRoutes.js
const express = require('express');
const router = express.Router();
const { getGuides, getGuideById, createGuide, updateGuide, deleteGuide } = require('../controllers/guideController');
const upload = require('../middleware/upload');
const { protect, isAdmin } = require('../middleware/protect'); // Fixed: destructured import

router.get('/', getGuides);
router.get('/:id', getGuideById);
router.post('/', protect, isAdmin, upload.single('image'), createGuide);
router.put('/:id', protect, isAdmin, upload.single('image'), updateGuide);
router.delete('/:id', protect, isAdmin, deleteGuide);

// If you need admin-only routes, you can add them like this:
// router.post('/', protect, isAdmin, upload.single('image'), guideController.createGuide);
// router.put('/:id', protect, isAdmin, upload.single('image'), guideController.updateGuide);
// router.delete('/:id', protect, isAdmin, guideController.deleteGuide);

module.exports = router;