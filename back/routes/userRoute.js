// ---------------partie require-------------------------------
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const validEmail = require('../middleware/email');
const validPassword = require('../middleware/password');

router.post('/signup', validEmail, validPassword, userController.signup);
router.post('/login', userController.login);
module.exports = router;
