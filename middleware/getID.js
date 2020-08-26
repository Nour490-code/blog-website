const jwt = require('jsonwebtoken');

const GetID = (req,res,next) => {
    const token = req.cookies.jwt;
    let userJWT = '';

    if(token){
        jwt.verify( token, process.env.SECRET, (decoded) =>{
            userJWT = decoded
        })

    }else{
        res.redirect('/login')
    }
}
module.exports = {GetID};