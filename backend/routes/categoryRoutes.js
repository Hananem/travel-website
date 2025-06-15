const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const upload = require('../middleware/upload');

const { protect, isAdmin } = require('../middleware/protect');

// Create a new category with image upload (admin only)
router.post('/', protect, isAdmin, upload.single('image'), categoryController.createCategory);

// Get all categories (public)
router.get('/', categoryController.getAllCategories);

// Get a single category by ID (public)
router.get('/:id', categoryController.getCategoryById);

// Update a category with optional image upload (admin only)
router.put('/:id', protect, isAdmin, upload.single('image'), categoryController.updateCategory);

// Delete a category (admin only)
router.delete('/:id', protect, isAdmin, categoryController.deleteCategory);

module.exports = router;