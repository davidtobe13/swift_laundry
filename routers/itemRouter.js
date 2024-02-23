const express = require('express');
const { items, getOneItem, getAllItem, deleteItems } = require('../controllers/itemController');
const router = express.Router();

router.post('/create-items', items);

router.get('/get-one-item/:id', getOneItem );

router.get('/get-all-items', getAllItem);

router.delete('/delete-item/:id', deleteItems);

module.exports = router;
