const express = require('express');
const { createPost, getPosts } = require('../controllers/post');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/multer');

const router = express.Router();

router.get('/', getPosts);
router.post('/', protect, upload.single('image'), createPost);

module.exports = router;
