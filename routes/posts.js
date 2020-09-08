const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');


router.get('/:id', postsController.getUserPost);
router.post('/:id/comment', postsController.createComment);
router.get('/category/:id', postsController.getSearchedCategory);
router.post('/search', postsController.getSearchedPostsByPhrase);



module.exports = router;
