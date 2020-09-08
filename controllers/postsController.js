const Post = require('../modules/Post');
const moment = require('moment');
const ObjectId = require('mongodb').ObjectID;
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');


const createPost = function(req, res, next){
    let formData = new formidable.IncomingForm();
    formData.parse(req, function(error, fields, files){
        if(fields.title.length === 0 ){
            res.send({ error: "Error during creation, missing post title"});
        }
        else if(files.image.size === 0){
            res.send({ error: "Error during creation, missing image"});
        }
        else if (fields.content.length === 0){
            res.send({ error: "Error during creation, missing post content"});
        }
        else if (!fields.category){
            res.send({ error: "Error during creation, missing post category"});
        }
        
        else {
            let oldPath = files.image.path;
            let newPath = path.resolve(__dirname + "/../static/assets/images/" + files.image.name);
            fs.copyFile( oldPath, newPath, (err) => {   
            let post = new Post({
                title: fields.title,
                image: '/static/assets/images/' + files.image.name,
                category: fields.category,
                content: fields.content,
                
            });
            post.save((err, data) => {
                if(err){
                    console.log(err);
                    res.send({error: "Error during creation, please try again"});
                }
                else {
                    res.send({
                        success : "Post Created Successfully",
                        _id : data._id,
                        imagePath : data.image
                    });
                }
            })
            
        })
        
    }
    
 })
}

const editPost =  async function (req, res, next){
    let formData = new formidable.IncomingForm();
    formData.parse(req, async function(error, fields, files){
        console.log(fields);
        console.log(files)
        if(fields.title.length === 0 ){
            res.send({ error: "Error during edit, missing post title"});
        }
        else if(fields.image === ""){
            res.send({ error: "Error during edit, missing image"});
        }
        else if (fields.content.length === 0){
            res.send({ error: "Error during edit, missing post content"});
        }
        else if (!fields.category){
            res.send({ error: "Error during edit, missing post category"});
        }
        
        else {
            let post = {};
            if(files.image.size === 0){
                post.title = fields.title;
                post.category = fields.category;
                post.content = fields.content;  
            }
            else {
                let oldPath = files.image.path;
                let newPath = path.resolve(__dirname + "/../static/assets/images/" + files.image.name);
                fs.renameSync(oldPath, newPath);
                post.title = fields.title;
                post.image = newPath;
                post.category = fields.category;
                post.content = fields.content;  
            }
             
            
            Post.updateOne({_id: ObjectId(req.params.id)},post,(err, data) => {
                if(err){
                    console.log(err);
                    res.send({error: "Error during edit, please try again"});
                }
                else {
                    res.send("Post Edited Successfully");
                }
            })
            
        }
        
    })
}

const createComment = function(req, res, next){
    console.log(req.body);
    if(req.body.username.length === 0 ){
        res.send({ error: "Error during creation, missing username"});
    }
    else if (req.body.comment.length === 0){
        res.send({ error: "Error during creation, missing comment"});
    }
    else {
        console.log(req.params.id);
        Post.updateOne({ _id: ObjectId(req.params.id) },
        { $addToSet: { comments: {username: req.body.username, comment: req.body.comment}}
    },
    (err, data) => {
        if(err){
            console.log(err);
            res.send("Error during creation, please try again");
        }
        else {
            console.log(data);
            res.send("Comment Created Successfully");
        }
    })
}

}

const removePost = function(req, res, next){
    Post.remove({ _id: ObjectId(req.params.id) },
    (err, data) => {
        if(err){
            console.log(err);
            res.redirect("/admin/dashboard")
        }
        else {
            console.log(data);
            res.redirect("/admin/dashboard")
        }
    })
}



const getPosts = async function(req, res, next){
    try {
        let posts = await Post.paginate();
        console.log(posts);
            if(posts.docs.length > 0){
                console.log(posts);
                res.render("user/home", {
                    posts: posts,
                    moment: moment
                })
            }
            else {
                res.render("user/home", {
                    posts:0,
                })
            }
    } catch (error) {
            res.render("user/home", {
                posts:0,
            })
    }
   
  
}

const getEditPost = async function(req, res, next){
    let admin = req.session.admin;
    let post = await Post.find({_id: ObjectId(req.params.id)});
    if(admin){
        res.render("admin/edit_post", { 
            admin:admin,
            post:post[0]
        });
    } else {
        res.render("admin/login");
    }
}

const getUserPost = function(req, res, next){
    Post.findOne({_id: ObjectId(req.params.id)}).then((post)=> {
        if(Object.keys(post).length > 0 ){
            res.render("user/post", {
                post: post,
                moment: moment
            })
        }
        else {
            res.send({post: []});
        }
    })
}

const getSearchedCategory = function(req, res, next){
    Post.find({category : req.params.id }).then(posts => {
        if(posts.length > 0){
            res.render("user/display_posts_by_category", {
                posts : posts,
                moment : moment,
                category : req.params.id
            })
        }
        else {
            res.render("user/display_posts_by_category", {
                posts:0,
                category : req.params.id
            })
        }
    })
}

const getSearchedPostsByPhrase = function(req, res, next){
    console.log(req.body);
    Post.find({ $or: [ {content : new RegExp(req.body.phrase)}, {title : new RegExp(req.body.phrase)} ]} ).then(posts => {
        if(posts.length > 0){
            res.render("user/display_posts_by_searched_phrase", {
                posts : posts,
                moment : moment,
                searchedPhrase : req.params.id
            })
        }
        else {
            console.log(posts)
            res.render("user/home", {
                posts: posts,
            })
        }
    })
}

const getPagePosts = async function(req, res, next){
    console.log(req.params.id);
    try {
        let posts = await Post.paginate({}, {page: req.params.id});
            if(posts.docs.length > 0){
                res.render("user/home", {
                    posts:posts,
                    moment:moment
                })
            }
            else {
                res.render("user/home", {
                    posts:0,
                })
            }
    } catch (error) {
            res.render("user/home", {   
                posts:0,
            })
    }
 
}


module.exports = {
    createPost: createPost,
    createComment: createComment,
    editPost: editPost,
    removePost: removePost,
    getEditPost: getEditPost,
    getPosts: getPosts,
    getPagePosts: getPagePosts,
    getUserPost: getUserPost,
    getSearchedCategory: getSearchedCategory,
    getSearchedPostsByPhrase: getSearchedPostsByPhrase
    
}