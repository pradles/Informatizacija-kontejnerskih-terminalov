import jwt from 'jsonwebtoken';
import { CreateError } from './error.js';


export const verifyToken = (req, res, next)=>{
    const token = req.cookies.access_token;
    if(!token)
        return next(CreateError(401, "You are not authenticated."));
        jwt.verify(token, process.env.JWT_SECRET, (err, user)=>{
        if(err)
            return next(CreateError(403, "Token is not Valid."));
        req.user = user;
        next();
    });
}

export const verifyUser = (req, res, next)=>{
    verifyToken(req, res, ()=>{
        const decodedToken = jwt.decode(req.cookies.access_token);
        const userIdFromToken = decodedToken.id;
        if(userIdFromToken === req.params.id || req.user.isAdmin) {
            next();
        } else {
            return next(CreateError(403, "Token is not Authorized."));
        }
    })
}

export const verifyAdmin = (req, res, next)=>{
    verifyToken(req, res, ()=>{
        if(req.user.isAdmin) {
            next();
        } else {
            return next(CreateError(403, "Token is not Authorized."));
        }
    })
}

export const verifyRole = (req, res, next)=>{
    next();
}

export const verifyRoleMod = (req, res, next)=>{
    next();
}