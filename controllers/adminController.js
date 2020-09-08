const Admin = require('../modules/Admin');
const Post = require('../modules/Post');
const {
    check,
    validationResult
} = require('express-validator');
const bcrypt = require('bcryptjs');
const config = require('../config/server');
const moment = require('moment');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Use connect method to connect to the server

const login = async function (req, res) {
    console.log(req.body)
    let result = await authenticate(req.body.email, req.body.password);
    console.log(result);
    if (result === "Invalid Credentials") {
        res.send({
            error: result
        });
    } else {
        req.session.admin = {
            id: result._id,
            email: result.email
        };
        res.send({
            result
        });

    }


}

const getDashboard = async function (req, res) {
    let posts = await Post.find({});
    let numberOfComments = await getNumberOfComments();
    let numberOfPosts = await getNumberOfPosts();
    console.log(numberOfPosts);
    console.log(numberOfComments);
    let admin = req.session.admin;
    if (admin) {
        res.render("admin/dashboard", {
            admin: admin,
            posts: posts,
            moment: moment,
            numberOfPosts: numberOfPosts,
            numberOfComments: numberOfComments[0],
            highestPostWithComments: numberOfComments[1],
        });
    } else {
        res.render("admin/login");
    }
}

const getNumberOfComments = async function () {
    let numberOfComments = await Post.find({});
    let commentsCounter = 0;
    let highestPostWithComments = {}
    highestPostWithComments.count = 0;
    //console.log(numberOfComments);
    if (numberOfComments) {
        numberOfComments.forEach((post) => {
            if (post.comments) {
                if (post.comments.length > highestPostWithComments.count) {
                    highestPostWithComments.title = post.title;
                    highestPostWithComments.count = post.comments.length;
                }
                console.log(post.comments.length);
                post.comments.forEach(comment => {
                    commentsCounter++;
                })
            }
        });
    }
    return [commentsCounter, highestPostWithComments];
}

const getNumberOfPosts = async function () {
    let numberOfPosts = await Post.find({}).count();
    return numberOfPosts;


}


const authenticate = async function (email, password) {
    return new Promise((resolve, reject) => {

        Admin.findOne({
            username: email
        }).then((admin, err) => {
            if (admin) {
                bcrypt.compare(password, admin.password, (err, isMatch) => {
                    if (isMatch) {
                        resolve(admin)
                    } else {
                        console.log("error")
                        reject(new Error('Invalid Credentials'));
                    }
                })
            } else {
                console.log("error")
                reject(new Error('Invalid Credentials'));

            }

        })

    }).catch(error => {
        return error.message;
    })

}

const logout = async function (req, res) {
    req.session.destroy()
    res.redirect("/home")
}

const ensureAdminRole = async function (req, res, next) {
    if (req.session.admin) {
        return next();
    } else {
        res.redirect("/admin/login")
    }

}


module.exports = {

    login: login,
    logout: logout,
    ensureAdminRole: ensureAdminRole,
    getDashboard: getDashboard

}