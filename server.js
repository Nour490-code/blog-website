//Requiring Packages
const express = require('express');
const app =  express();
const mongoose = require('mongoose');
const env = require('dotenv').config();
const jwt = require('jsonwebtoken')


//Set Middlewares
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended:true}))

//MongoDB Connection
const MONGOURL = process.env.DB_CONNECTION;
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}

mongoose.connect(MONGOURL,options)
.then(() => console.log('Connected to mongodb!'))
.catch(err => console.log(err));
mongoose.set('useCreateIndex', true);


//Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT,() => console.log(`listening to port ${PORT}`));


//Rendering Pages
app.get('/',(req,res) => res.render('guest')) 
app.get('/signup',(req,res) => res.render('signup'))
app.get('/login',(req,res) => res.render('login'))


//Making JWT Tokens
const expireTime = 3 * 24 * 60 *60;
const createToken = id => {
    return jwt.sign({id}, process.env.SECRET,{
        expiresIn: expireTime
    });
}

//Handling Errs
const handleErr = (err) => {
    console.log(err.message,err.code)
    let errors = { email:'' , password: ''}
    if(err.code === 11000){
        errors.email = 'That email is already registered'
        return errors
    }
    if(err.message.includes('User validation failed')){
        Object.values(err.errors).forEach(({properties}) => {
           errors[properties.path] = properties.message; 
        })
    }
    return errors;
}


//Routes
    //Note: DB ERR Handling Still not working
const {User} = require('./Models/User');
app.post('/signup',(req,res) => {
    const newUser = new User({
        email: req.body.email,
        password: req.body.password,
    }).save((err,user) => {
        if(err){
            const errs = handleErr(err);
            console.log(errs)
            res.status(400).json({errs})
        }else{
            const token = createToken(user._id)
            res.cookie('jwt', token,{httpOnly: true ,maxAge: expireTime * 1000})
            res.redirect('login')
        }
     });
})