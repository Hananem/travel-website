const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleItemLike,
  getLikedItems
} = require('../controllers/userController');

// Admin routes
router.route('/')
  .get(protect, isAdmin, getUsers);

router.route('/:id')
  .get(protect, isAdmin, getUserById)
  .put(protect, isAdmin, updateUser)
  .delete(protect, isAdmin, deleteUser);

// Like routes (protected but not admin-only)
router.route('/me/likes')
  .get(protect, getLikedItems);

router.route('/likes/:itemId')
  .post(protect, toggleItemLike);

module.exports = router;