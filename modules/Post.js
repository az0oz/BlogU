const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const mongoosePaginate = require('mongoose-paginate');
//connect to mongoDB

postsSchema = new Schema ({
    title: {
        type:String,
        required: true
    },
    image: {
        type:String,
        required: true
    },
    content: {
        type:String,
        required: true
    },
    category: {
        type:String,
        required: true
    },
    comments: Schema.Types.Mixed,
    date: {
        type:Date,
        default: Date.now
    }
})

postsSchema.plugin(uniqueValidator);
postsSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Posts', postsSchema);