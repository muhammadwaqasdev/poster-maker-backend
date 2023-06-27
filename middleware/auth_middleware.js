var jwt = require('jsonwebtoken');
const User = require('./../models/user');

const authMiddleware = (req, res, next) => {
    try{
        const bearerHeader = req.headers[ 'authorization'];
        if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
        }else{
            res.sendStatus(403);
        }
    }catch(e){
        res.sendStatus(403);
    }
}

module.exports = authMiddleware;