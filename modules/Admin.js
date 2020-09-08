const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

adminSchema = new Schema ({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type :Date,
        default: Date.now
    },
    role: {
        type: String,
        required: true,
        enum: ['admin']
    }
})

adminSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Admin', adminSchema);