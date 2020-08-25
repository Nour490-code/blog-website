//Requiring Packages
const express = require('express');
const app =  express();
const mongoose = require('mongoose');
const env = require('dotenv').config();
const jwt = require('jsonwebtoken')


//Set Middlewares
app.set('view engine', 'ejs')
app.use(express.json());
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
app.get('/createblog',(req,res) => res.render('create'))
app.get('/dashboard', (req,res) => res.render('dashboard'))


//Making JWT Tokens
const expireTime = 3 * 24 * 60 *60;
const createToken = id => {
    return jwt.sign({id}, process.env.SECRET,{
        expiresIn: expireTime
    });
}

//Handling Errs
const handleErr = (err) => {
    //console.log(err.message,err.code)
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
    //Login Errs

    if(err.message === 'Incorrect Email'){
        errors.email = 'Incorrect Email'
    }
    if(err.message === 'Incorrect Password'){
        errors.password = 'Incorrect Password'
    }
    return errors;
}


//Routes

const {User} = require('./Models/User');
app.post('/signup',(req,res) => {
    const newUser = new User({
        email: req.body.email,
        password: req.body.password,
    }).save((err,user) => {
        try{
            const token = createToken(user._id)
            res.cookie('jwt', token,{httpOnly: true ,maxAge: expireTime * 1000})
            res.json({user})
        }catch{
            const errs = handleErr(err);
            console.log(err)
            res.status(400).json({errs})
        }
     });
})

app.post('/login',async (req,res) => {
    const { email,password } = req.body;
    try{
        const user = await User.login(email,password)
        const token = createToken(user._id)
        res.cookie('jwt', token,{httpOnly: true ,maxAge: expireTime * 1000})
        res.status(200).json({user: user._id})
    }catch(err){
        const errs = handleErr(err)
        res.status(400).json({errs})
    }
})

const {Blog} = require('./Models/Blog');
app.post('/createblog',(req,res) => {
    const newBlog = new Blog({
        title: req.body.title,
        subject: req.body.subject,
        body: req.body.body
    }).save((err,blog) => {
        res.json({blog})
     });
})
