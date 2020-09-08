const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const adminController = require('../controllers/adminController');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const urlencodedParser = bodyParser.urlencoded({ extended: false })

//GET Routes

router.get('/dashboard', adminController.ensureAdminRole, adminController.getDashboard);
router.get('/post', adminController.ensureAdminRole, (req, res) =>{
    let admin = req.session.admin;
    if(admin){
        res.render("admin/create_post", { 
            admin:admin
            }
        );
    } else {
        res.render("admin/login");
    }
})
router.get('/login', (req, res) =>{
    res.render("admin/login");
})
router.get('/logout', adminController.logout);
router.get('/post/:id/edit',adminController.ensureAdminRole, postsController.getEditPost);

//POST Routes

router.post('/login',  adminController.login);
router.post('/post', adminController.ensureAdminRole, postsController.createPost);
router.post('/post/:id',adminController.ensureAdminRole, postsController.removePost);
router.post('/post/:id/edit',adminController.ensureAdminRole, postsController.editPost);



module.exports = router;
