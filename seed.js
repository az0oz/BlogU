// add admin user when app runs
const User = require('./modules/Admin');
const bcrypt = require('bcryptjs');

const addAdmin = () => {
    const admin = {
        username: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: "admin"
    }
    
    User.findOne({username: admin.username}).then(user => {
        if (user){
            console.log("admin exist")
        }
        else {
            bcrypt.hash(admin.password, 12, (err, hash) => {
                if (err) {
                    throw err
                }
                admin.password = hash;
                User.create(admin, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            });
            
        }
    })
   
}

module.exports = {
    addAdmin: addAdmin
}

