const mongoose = require('mongoose');
const { response } = require('express');
const { isEmail } = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema({
    email:{
        type: String,
        required: true, 
        unique: 1,
        trim: true,
        lowercase: true,
        validate: [ isEmail, 'Please enter a valid email' ]
    },
    password:{
        type: String,
        required: true,
        minlength: [6, 'Minimum password length is 6 characters']
    }
});

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt)
    next();
})
userSchema.statics.login = async function(email,password){
    const user = await this.findOne({email});

    if(user){
        const authUser = await bcrypt.compare(password,user.password)
        if(authUser){
            return user
        }
        throw Error('Incorrect Password')
    }
    throw Error('Incorrect Email')
}


const User = mongoose.model('User', userSchema);

module.exports = {User};