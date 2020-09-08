require('dotenv').config({
    path :".env"
});
module.exports = {
    database: process.env.DB_CONNECTION,
    secret: 'secret'
}   