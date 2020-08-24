const mongoose = require('mongoose');
const { response } = require('express');
const { isEmail } = require('validator')

const userSchema = mongoose.Schema({
    email:{
        type: String,
        required: [true, 'Please enter an email'], 
        unique: 1,
        trim: true,
        lowercase: true,
        validate: [ isEmail, 'Please enter a valid email' ]
    },
    password:{
        type: String,
        required:  [true, 'Please enter a password'],
        minlength: [6, 'Minimum password length is 6 characters']
    }
});


const User = mongoose.model('User', userSchema);

module.exports = {User};