const express = require('express');
const router = express.Router();
const {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  getItemById
} = require('../controllers/itemController');
const upload = require("../middleware/upload");


// Get all items
router.get('/', getItems);

// Create a new item
router.post('/', upload.single("image"), createItem);

router.get('/:id', getItemById); 

// Update an item by ID
router.put('/:id', upload.single("image"), updateItem);

// Delete an item by ID
router.delete('/:id', deleteItem);

module.exports = router;
