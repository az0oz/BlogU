const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const config = require('./config/server');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const postsController = require('./controllers/postsController');
const session = require('express-session')
const port = 3000;
const seed = require('./seed');

let server = http.createServer(app);
let io = socketIO(server);

//set up ejs middleware view engine
app.set('view engine', 'ejs');

//use general middlewares
app.use("*/static", express.static(path.join(__dirname, './static')));
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());

app.set('trust proxy', 1) // trust first proxy
//use express session
app.use(session({
    key:"admin",
    secret:"splendorMonk",
    saveUninitialized: true,

}))

//import general routes
app.get('/home', postsController.getPosts);
app.get('/home/page/:id', postsController.getPagePosts);

//import user routes
const postsRoute = require('./routes/posts');
app.use('/posts', postsRoute);
//import admin routes
const adminRoute = require('./routes/admin');
app.use('/admin', adminRoute);

io.on("connection", function (socket) {
    console.log("User connected");
    socket.on("new_post", function(formDataValues) {
        socket.broadcast.emit("new_post", formDataValues)
    });

})


//set up mongoose connectinon
mongoose.set('debug', true);
console.log(config);
mongoose.connect(config.database, {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true},
    () => {
    seed.addAdmin();
    console.log("Connected to DB");
});


//listen to established server port 
server.listen(port, () => console.log(`blog app listening on port `+port));
