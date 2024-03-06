const express = require('express');
const { items, getOneItem, getAllItem, deleteItems } = require('../controllers/itemController');
const upload = require('../utils/multer');
const router = express.Router();

router.post('/create-items',upload.single("imagee"), items);

router.get('/get-one-item/:id', getOneItem );

router.get('/get-all-items', getAllItem);

router.delete('/delete-item/:id', deleteItems);

module.exports = router;
