const mongoose = require('mongoose');
const { response } = require('express');

const userSchema = mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: 1,
        trim: true
    },
    password:{
        type: String,
        required: true,
        minlength:6
    }
});


const User = mongoose.model('User', userSchema);

module.exports = {User};