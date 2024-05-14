import User from '../models/User.js';
import Role from '../models/Role.js';
import { CreateSuccess } from '../utils/success.js';
import { CreateError } from '../utils/error.js';

export const getAllUsers = async (req, res, next)=>{
    try {
        const users = await User.find();
        return next(CreateSuccess(200, "Returned users", users))
    } catch (error) {
        return next(CreateError(500, "Error getting users."));
    }
}

export const getUserById = async (req, res, next)=>{
    try {
        const user = await User.findById({_id: req.params.id});
        if(user) 
            return next(CreateSuccess(200, "Returned user by id", user));
        return next(CreateError(404, "User not found."));
    } catch (error) {
        return next(CreateError(500, "Error getting user by id."));
    }
}