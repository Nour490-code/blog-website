const mongoose = require('mongoose');
const { response } = require('express');

const blogSchema = mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    author:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true
    },
    body:{
        type: String,
        required: true
    }
});


const Blog = mongoose.model('Blog', blogSchema);

module.exports = {Blog};